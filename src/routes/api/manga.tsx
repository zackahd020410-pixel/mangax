import { createFileRoute } from "@tanstack/react-router";
import { mangas } from "@/lib/manga";
import { scrapedManga } from "@/lib/scraped-data";

export const Route = createFileRoute("/api/manga")({
  server: {
    handlers: {
      GET: async () => {
        const list = scrapedManga.length > 0 ? [...scrapedManga] : mangas.map((m) => ({
          id: `local-${m.slug}`,
          source: "local",
          slug: m.slug,
          title: m.title,
          cover: m.cover,
          synopsis: m.synopsis,
          genres: m.genres,
          rating: m.rating,
          chapters: m.chapters,
          status: m.status,
        }));

        return new Response(JSON.stringify({ ok: true, count: list.length, data: list }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },
    },
  },
});
