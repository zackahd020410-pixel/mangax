import { createFileRoute } from "@tanstack/react-router";
import { mangas } from "@/lib/manga";

const BASE_URL = "https://mangax.app";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = [
          `${BASE_URL}/`,
          `${BASE_URL}/browse`,
          `${BASE_URL}/bookmark`,
          `${BASE_URL}/history`,
          ...mangas.map((m) => `${BASE_URL}/manga/${m.slug}`),
          ...mangas.flatMap((m) =>
            m.chapterList.map((c) => `${BASE_URL}/read/${m.slug}/${c.num}`),
          ),
        ];
        const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
          .map((u) => `  <url><loc>${u}</loc></url>`)
          .join("\n")}\n</urlset>`;
        return new Response(body, {
          headers: { "content-type": "application/xml; charset=utf-8" },
        });
      },
    },
  },
});
