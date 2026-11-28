import { createFileRoute } from "@tanstack/react-router";
import { getMangaList, getMangaById } from "@/lib/jikan";

export const Route = createFileRoute("/api/manga")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (id) {
          const manga = await getMangaById(Number(id));
          return Response.json(manga ?? {});
        }
        try {
          const limit = Number(url.searchParams.get("limit") || 25);
          const offset = Number(url.searchParams.get("offset") || 0);
          const list = await getMangaList(limit, offset);
          if (!list || list.length === 0) {
            return Response.json({ error: "No data from Jikan" }, { status: 503 });
          }
          return Response.json(list);
        } catch (err: any) {
          return Response.json({ error: err.message || "Jikan API failed" }, { status: 503 });
        }
      },
    },
  },
});