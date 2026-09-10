import { NextResponse } from "next/server";
import { requirePermission } from "@/src/app/lib/withPermission";
import {
  createSearch,
  getAllSearches,
} from "@/src/app/lib/services/search/search.service";

export async function GET() {
  const { session } = await requirePermission("search_view");
  return NextResponse.json({
    success: true,
    data: await getAllSearches(Number(session.user.tenantId)),
  });
}


export async function POST(request) {
  const { session } = await requirePermission("search_create");
  const body = await request.json();
  if (!body.name || !body.slug) {
    return NextResponse.json(
      { success: false, error: "Name and slug are required" },
      { status: 400 },
    );
  }
  try {
    const data = await createSearch(
      {
        name: body.name,
        slug: body.slug,
        placeholder: body.placeholder || "Search...",
        buttonText: body.buttonText || "Search",
        searchPages: body.searchPages !== false,
        searchPosts: body.searchPosts !== false,
        resultsPerPage: Math.max(1, Number(body.resultsPerPage) || 10),
        noResultsMessage: body.noResultsMessage || "No results found.",
        customClass: body.customClass || null,
        isActive: body.isActive !== false,
      },
      Number(session.user.tenantId),
    );
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error.code === "P2002" ? "Slug already exists" : error.message,
      },
      { status: error.code === "P2002" ? 409 : 400 },
    );
  }
}
