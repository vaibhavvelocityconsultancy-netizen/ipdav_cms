export const dynamic = "force-dynamic";

import { prisma } from "@/src/app/lib/prisma";
import { ApiError } from "@/src/app/lib/utils/ApiError";
import { ApiResponse } from "@/src/app/lib/utils/ApiResponse";
import { asyncHandler } from "@/src/app/lib/utils/asyncHandler";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createSubscription } from "@/src/app/lib/services/course/subscription.service";
import { createToken } from "@/src/app/lib/jwt"; // ← adjust path to wherever your jwt helpers live

export const POST = asyncHandler(async (req) => {
  const {
    name,
    email,
    password,
    planId,
    billingCycle = "MONTHLY",
  } = await req.json();

  if (!name?.trim()) throw new ApiError(400, "Name is required");
  if (!email?.trim()) throw new ApiError(400, "Email is required");
  if (!password?.trim()) throw new ApiError(400, "Password is required");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw new ApiError(400, "User already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  // Get the one tenant that already exists (or hardcode its known id/slug)
  const tenant = await prisma.tenant.findFirst();

  if (!tenant) {
    throw new ApiError(500, "No tenant configured. Contact support.");
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      tenantId: tenant.id,
    },
  });
  // Auto-create subscription if planId provided
  let subscription = null;
  if (planId) {
    try {
      subscription = await createSubscription(user.id, planId, billingCycle);
    } catch (error) {
      console.error(
        "Subscription creation failed during signup:",
        error.message,
      );
      // Don't throw — user is created, subscription can be set up later
    }
  }

  // ── Create JWT and set cookie ──────────────────────────────
  const token = await createToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role, // include whatever your requireAuth() reads
    tenantId: user.tenantId,
  });

  const { password: _, ...safeUser } = user;

  const response = NextResponse.json(
    new ApiResponse(
      201,
      { user: safeUser, subscription },
      "User created successfully",
    ),
    { status: 201 },
  );

  response.cookies.set("auth-token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  });

  return response;
});
