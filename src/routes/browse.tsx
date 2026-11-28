import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Search, Filter, SlidersHorizontal, Film } from "lucide-react";
import type { JikanManga, JikanAnime } from "@/lib/jikan";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse — MangaX" },
      { name: "description", content: "Browse manga and anime on MangaX. Filter by genre, sort by rating or latest." },
    ],
  }),
  component: Browse,
});

type Item = {
  id: number | string;
  slug: string;
  title: string;
  cover: string;
  synopsis: string | undefined;
  genres: string[];
  rating: number;
  chapters: number | undefined;
  episodes: number | undefined;
  status: string;
  type: "manga" | "anime";
};

function normalizeManga(m: JikanManga): Item {
  return {
    id: m.mal_id,
    slug: String(m.mal_id),
    title: m.title_english || m.title,
    cover: m.image_url || "",
    synopsis: m.synopsis,
    genres: (m.genres || []).map((g) => g.name),
    rating: m.score ?? 0,
    chapters: m.chapters,
    episodes: undefined,
    status: m.status || "Unknown",
    type: "manga",
  };
}

function normalizeAnime(a: JikanAnime): Item {
  return {
    id: a.mal_id,
    slug: String(a.mal_id),
    title: a.title_english || a.title,
    cover: a.image_url || "",
    synopsis: a.synopsis,
    genres: (a.genres || []).map((g) => g.name),
    rating: a.score ?? 0,
    chapters: undefined,
    episodes: a.episodes,
    status: a.status || "Unknown",
    type: "anime",
  };
}

function Browse() {
  const [type, setType] = useState<"manga" | "anime">("manga");
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<"rating" | "az">("rating");
  const [status, setStatus] = useState<"all" | "ongoing" | "completed">("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch(`/api/${type}?limit=25`, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error || `Failed to load ${type} (HTTP ${r.status})`);
        }
        return r.json();
      })
      .then((data) => {
        const list = type === "manga"
          ? (data as JikanManga[]).map(normalizeManga)
          : (data as JikanAnime[]).map(normalizeAnime);
        setItems(list);
      })
      .catch((err) => {
        setError(err.message || "Failed to load");
        setItems([]);
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [type]);

  const filtered = items.filter((m) => {
    const matchQ = m.title.toLowerCase().includes(q.toLowerCase());
    const matchGenre = !genre || m.genres.includes(genre);
    const matchStatus =
      status === "all" ||
      (status === "ongoing" && /ongoing|releasing|airing/i.test(m.status)) ||
      (status === "completed" && /completed|finished/i.test(m.status));
    return matchQ && matchGenre && matchStatus;
  });

  const allGenres = [...new Set(items.flatMap((m) => m.genres))].sort();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <BookOpen className="h-7 w-7" /> MangaX
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => setType(type === "manga" ? "anime" : "manga")}
              className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${type === "anime" ? "bg-primary text-primary-foreground" : "glass hover:bg-accent"}`}
            >
              {type === "manga" ? <><Film className="h-3 w-3 inline mr-1" />Switch to Anime</> : <><BookOpen className="h-3 w-3 inline mr-1" />Switch to Manga</>}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Browse {type === "manga" ? "Manga" : "Anime"}</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} found</p>
          </div>
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2 md:w-full md:max-w-xl">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Search ${type}...`}
              className="w-full bg-transparent outline-none placeholder:text-muted-foreground text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
          <button
            onClick={() => setGenre(null)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${genre === null ? "bg-primary text-primary-foreground" : "glass hover:bg-accent"}`}
          >
            All
          </button>
          {allGenres.map((g) => (
            <button
              key={g}
              onClick={() => setGenre(genre === g ? null : g)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${genre === g ? "bg-primary text-primary-foreground" : "glass hover:bg-accent"}`}
            >
              {g}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="glass rounded-full px-3 py-1.5 text-xs font-medium">
            <Filter className="h-3 w-3 mr-1.5" /> Status
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="bg-transparent text-xs border-none outline-none cursor-pointer"
            >
              <option value="all">All</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="glass rounded-full px-3 py-1.5 text-xs font-medium">
            <SlidersHorizontal className="h-3 w-3 mr-1.5" /> Sort
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-transparent text-xs border-none outline-none cursor-pointer"
            >
              <option value="rating">Top Rating</option>
              <option value="az">A - Z</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold">Failed to load</h2>
            <p className="text-sm text-muted-foreground">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold">No results found</h2>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filtered.map((m) => (
              <Link key={m.id} to={m.type === "manga" ? "/manga/$slug" : "/anime/$slug"} params={{ slug: m.slug }} className="group">
                <div className="overflow-hidden rounded-lg aspect-[3/4] relative">
                  <img src={m.cover} alt={`${m.title} cover`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="mt-2 text-sm font-semibold line-clamp-1">{m.title}</h3>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold">⭐ {m.rating}</span>
                  <span className="text-xs text-muted-foreground">{m.type === "manga" ? `${m.chapters} ch` : `${m.episodes} ep`}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{m.genres.slice(0, 2).join(" · ")}</p>
                <p className="text-xs text-muted-foreground">{m.status}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}