import { createFileRoute } from "@tanstack/react-router";
import { getAnimeList, getAnimeById } from "@/lib/jikan";

export const Route = createFileRoute("/api/anime")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (id) {
          const anime = await getAnimeById(Number(id));
          return Response.json(anime ?? {});
        }
        try {
          const limit = Number(url.searchParams.get("limit") || 25);
          const offset = Number(url.searchParams.get("offset") || 0);
          const list = await getAnimeList(limit, offset);
          if (list && list.length > 0) {
            return Response.json(list);
          }
          throw new Error("Empty Jikan response");
        } catch {
          return Response.json([]);
        }
      },
    },
  },
});