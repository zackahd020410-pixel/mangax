import { getManga } from "./manga";

type HistoryEntry = { slug: string; num: number; at: number };
type BookmarkEntry = { slug: string; at: number };

const HISTORY_KEY = "mangax_history";
const BOOKMARK_KEY = "mangax_bookmarks";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export const history = {
  get: () => read<HistoryEntry[]>(HISTORY_KEY, []),
  add: (slug: string, num: number) => {
    const list = history.get();
    const filtered = list.filter((h) => !(h.slug === slug && h.num === num));
    write(HISTORY_KEY, [{ slug, num, at: Date.now() }, ...filtered].slice(0, 50));
  },
  remove: (slug: string, num: number) => {
    const list = history.get();
    write(HISTORY_KEY, list.filter((h) => !(h.slug === slug && h.num === num)));
  },
  clear: () => write(HISTORY_KEY, []),
};

export const bookmarks = {
  get: () => read<BookmarkEntry[]>(BOOKMARK_KEY, []),
  has: (slug: string) => bookmarks.get().some((b) => b.slug === slug),
  add: (slug: string) => {
    if (bookmarks.has(slug)) return;
    write(BOOKMARK_KEY, [...bookmarks.get(), { slug, at: Date.now() }]);
  },
  remove: (slug: string) => {
    write(BOOKMARK_KEY, bookmarks.get().filter((b) => b.slug !== slug));
  },
  toggle: (slug: string) => (bookmarks.has(slug) ? bookmarks.remove(slug) : bookmarks.add(slug)),
};

export { getManga };
