import { createFileRoute } from "@tanstack/react-router";
import { getMangaList, getMangaById } from "@/lib/jikan";
import { scrapedManga } from "@/lib/scraped-data";

export const Route = createFileRoute("/api/manga")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const id = url.searchParams.get("id");
        if (id) {
          const manga = await getMangaById(Number(id));
          if (manga) return Response.json(manga);
          // Fallback to scraped data
          const found = scrapedManga.find((m: any) => m.slug === id || m.id === id);
          return Response.json(found ?? {});
        }
        try {
          const limit = Number(url.searchParams.get("limit") || 25);
          const offset = Number(url.searchParams.get("offset") || 0);
          const list = await getMangaList(limit, offset);
          if (list && list.length > 0) {
            return Response.json(list);
          }
          throw new Error("Empty Jikan response");
        } catch {
          // Fallback to scraped data when Jikan is down
          return Response.json(scrapedManga);
        }
      },
    },
  },
});