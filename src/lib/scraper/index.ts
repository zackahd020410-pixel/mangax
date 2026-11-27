import type { MangaSource } from "./types";
import { scrapeKomiktapList } from "./komiktap";
import { scrapeKomiktapListPW } from "./komiktap-pw";
import { scrapeMangaDexList } from "./mangadex";
import { scrapeAntitimpaList } from "./antitimpa";

export async function scrapeAllManga(): Promise<MangaSource[]> {
  const usePW = process.env["USE_PLAYWRIGHT"] === "true";
  const sources: { name: string; fn: () => Promise<MangaSource[]> }[] = [
    { name: "komiktap", fn: usePW ? scrapeKomiktapListPW : scrapeKomiktapList },
    { name: "mangadex", fn: scrapeMangaDexList },
    { name: "antitimpa", fn: scrapeAntitimpaList },
  ];
  const list: MangaSource[] = [];
  for (const s of sources) {
    try {
      const data = await s.fn();
      list.push(...data);
    } catch (e) {
      console.error(`scraper ${s.name} failed:`, e);
    }
  }
  return list;
}

export { scrapeKomiktapList, scrapeKomiktapListPW, scrapeMangaDexList, scrapeAntitimpaList };
