export type MangaSource = {
  id: string;
  source: string;
  slug: string;
  title: string;
  cover: string;
  synopsis: string;
  genres: string[];
  rating?: number;
  status?: string;
  chapters: number;
  updated?: string;
};

export type MangaChapter = {
  num: number;
  title: string;
  url: string;
  updated?: string;
};

export type MangaDetail = MangaSource & {
  chapterList: MangaChapter[];
};

export type ScrapeResult<T> = { ok: true; data: T } | { ok: false; error: string };
