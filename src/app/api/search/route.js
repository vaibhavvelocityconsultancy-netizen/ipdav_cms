// import { searchContent }
//   from "@/lib/services/search.service.js";

import { searchContext } from "../../lib/services/settings/search.service";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const query = searchParams.get("q");

    const results = await searchContext(query);

    return Response.json(results);
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        message: "Search failed",
      },
      {
        status: 500,
      },
    );
  }
}
