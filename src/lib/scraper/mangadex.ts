import { MangaSource } from "./types";

/**
 * MangaDex adapter.
 * Official API: https://api.mangadex.org/manga
 * NOTE: api.mangadex.org is behind a JS challenge (POWBlock) in some
 * environments. Uncomment the fetch block below once the challenge can
 * be bypassed (e.g. via a proxy or solved headers). Until then this
 * adapter returns an empty list so the app never crashes.
 */
export async function scrapeMangaDexList(): Promise<MangaSource[]> {
  try {
    // const res = await fetch("https://api.mangadex.org/manga?limit=20&contentRating[]=safe&contentRating[]=suggestive", {
    //   headers: { Accept: "application/json", "User-Agent": "mangax/1.0" },
    // });
    // const json = await res.json();
    // return (json.data as any[]).map((m) => ({
    //   id: `mangadex-${m.id}`,
    //   source: "mangadex",
    //   slug: m.attributes.title.en ?? m.attributes.title.ja-ro ?? "manga",
    //   title: m.attributes.title.en ?? m.attributes.title.ja-ro ?? "Untitled",
    //   cover: m.relationships.find((r: any) => r.type === "cover_art")?.attributes.fileName ?? "",
    //   synopsis: m.attributes.description?.en ?? "",
    //   genres: [],
    //   rating: m.attributes.rating?.bayesian ?? 0,
    //   chapters: m.attributes.chapterCount ?? 0,
    //   status: m.attributes.status,
    // }));
    return [];
  } catch {
    return [];
  }
}
