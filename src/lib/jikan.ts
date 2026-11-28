const BASE = "https://api.jikan.moe/v4";

export type JikanManga = {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  image_url?: string;
  url?: string;
  synopsis?: string;
  status?: string;
  chapters?: number;
  volumes?: number;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  genres?: { mal_id: number; name: string; url: string }[];
  authors?: { mal_id: number; name: string; url: string }[];
  published?: { from?: string; to?: string };
};

export type JikanAnime = {
  mal_id: number;
  title: string;
  title_english?: string;
  title_japanese?: string;
  image_url?: string;
  url?: string;
  synopsis?: string;
  status?: string;
  episodes?: number;
  score?: number;
  scored_by?: number;
  rank?: number;
  popularity?: number;
  members?: number;
  favorites?: number;
  genres?: { mal_id: number; name: string; url: string }[];
  studios?: { mal_id: number; name: string; url: string }[];
  aired?: { from?: string; to?: string };
};

export async function getMangaList(limit = 25, offset = 0): Promise<JikanManga[]> {
  const res = await fetch(`${BASE}/manga?limit=${limit}&offset=${offset}`);
  if (!res.ok) throw new Error("Failed to fetch manga list");
  const json = await res.json();
  return json.data ?? [];
}

export async function getMangaById(id: number): Promise<JikanManga | null> {
  const res = await fetch(`${BASE}/manga/${id}`);
  if (!res.ok) return null;
  return (await res.json()).data;
}

export async function getAnimeList(limit = 25, offset = 0): Promise<JikanAnime[]> {
  const res = await fetch(`${BASE}/anime?limit=${limit}&offset=${offset}`);
  const json = await res.json();
  return json.data ?? [];
}

export async function getAnimeById(id: number): Promise<JikanAnime | null> {
  const res = await fetch(`${BASE}/anime/${id}`);
  if (!res.ok) return null;
  return (await res.json()).data;
}

export async function getSeasonalAnime(year?: number, season?: string): Promise<JikanAnime[]> {
  const now = new Date();
  const y = year ?? now.getFullYear();
  const s = season ?? ["winter", "spring", "summer", "fall"][Math.floor(now.getMonth() / 3)];
  const res = await fetch(`${BASE}/seasons/${y}/${s}?limit=25`);
  const json = await res.json();
  return json.data ?? [];
}