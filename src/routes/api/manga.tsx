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
          // Try src/data first (bundled with serverless function)
          const dirs = [
            path.join(process.cwd(), "src", "data"),
            path.join(process.cwd(), "public", "data"),
          ];
          for (const dir of dirs) {
            if (!fs.existsSync(dir)) continue;
            const files = fs.readdirSync(dir);
            for (const f of files) {
              if (!f.endsWith(".json")) continue;
              const p = path.join(dir, f);
              const json = JSON.parse(fs.readFileSync(p, "utf8"));
              if (json && json.ok && Array.isArray(json.data)) list.push(...(json.data as any[]));
            }
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
