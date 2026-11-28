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
          return Response.json(manga ?? {});
        }
        try {
          const limit = Number(url.searchParams.get("limit") || 25);
          const offset = Number(url.searchParams.get("offset") || 0);
          const list = await getMangaList(limit, offset);
          return Response.json(list);
        } catch {
          // Fallback to scraped data when Jikan is down
          const mapped = scrapedManga.map((m: any) => ({
            mal_id: Number(m.id.replace("komiktap-", "")) || 0,
            title: m.title,
            title_english: m.title,
            image_url: m.cover,
            synopsis: m.synopsis,
            status: m.status,
            chapters: m.chapters,
            score: m.rating,
            scored_by: 0,
            rank: 0,
            popularity: 0,
            members: 0,
            favorites: 0,
            genres: (m.genres || []).map((g: string) => ({ mal_id: 0, name: g, url: "" })),
            published: { from: m.updated },
          }));
          return Response.json(mapped);
        }
      },
    },
  },
});