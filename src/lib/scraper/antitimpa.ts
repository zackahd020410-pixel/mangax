import { MangaSource } from "./types";

export async function scrapeAntitimpaList(): Promise<MangaSource[]> {
  /**
   * antitimpa.web.id is a React SPA (mobile-first). The manga list is
   * loaded client-side from a hidden API inside /assets/index-*.js.
   * To implement: fetch the JS bundle, find the API base URL + endpoints,
   * then call them server-side here.
   * Until then, return empty so the app stays functional.
   */
  return [];
}
