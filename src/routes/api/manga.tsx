import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs";
import path from "node:path";
import { mangas } from "@/lib/manga";

export const Route = createFileRoute("/api/manga")({
  server: {
    handlers: {
      GET: async () => {
        const list: any[] = [];
        try {
          const dir = path.join(process.cwd(), "public", "data");
          const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
          for (const f of files) {
            if (!f.endsWith(".json")) continue;
            const p = path.join(dir, f);
            const json = JSON.parse(fs.readFileSync(p, "utf8"));
            if (json && json.ok && Array.isArray(json.data)) list.push(...(json.data as any[]));
          }
        } catch {}

        const finalList = list.length > 0 ? list : mangas.map((m) => ({
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

        return new Response(JSON.stringify({ ok: true, count: finalList.length, data: finalList }), {
          headers: { "content-type": "application/json; charset=utf-8" },
        });
      },
    },
  },
});
