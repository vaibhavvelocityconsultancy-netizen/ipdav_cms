import { NextResponse } from "next/server";
import { requirePermission } from "@/src/app/lib/withPermission";
import {
  getSearchById,
  updateSearch,
  deleteSearch,
} from "@/src/app/lib/services/search/search.service";

export async function GET(request, { params }) {
  const { session } = await requirePermission("search_view");
  const item = await getSearchById(params.id, Number(session.user.tenantId));
  if (!item) {
    return NextResponse.json(
      { success: false, error: "Search not found" },
      { status: 404 },
    );
  }
  return NextResponse.json({ success: true, data: item });
}

export async function PATCH(request, { params }) {
  const { session } = await requirePermission("search_edit");
  const body = await request.json();
  const result = await updateSearch(
    params.id,
    {
      ...body,
      ...(body.resultsPerPage
        ? { resultsPerPage: Number(body.resultsPerPage) }
        : {}),
    },
    Number(session.user.tenantId),
  );
  return NextResponse.json({ success: true, data: result });
}

export async function DELETE(request, { params }) {
  const { session } = await requirePermission("search_delete");
  await deleteSearch(params.id, Number(session.user.tenantId));
  return NextResponse.json({ success: true });
}
