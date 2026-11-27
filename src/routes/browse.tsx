import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Search, Filter, SlidersHorizontal } from "lucide-react";
import { mangas } from "@/lib/manga";
import { scrapedManga } from "@/lib/scraped-data";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Browse Manga — MangaX" },
      { name: "description", content: "Browse all manga on MangaX. Filter by genre, sort by rating or latest update." },
    ],
  }),
  component: Browse,
});

function Browse() {
  const [list, setList] = useState<any[]>(scrapedManga.length > 0 ? scrapedManga : mangas.map((m) => ({
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
  })));
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const [sort, setSort] = useState<"rating" | "az">("rating");
  const [status, setStatus] = useState<"all" | "ongoing" | "completed">("all");

  const filtered = list.filter((m) => {
    const matchQ = m.title.toLowerCase().includes(q.toLowerCase());
    const matchGenre = !genre || m.genres.includes(genre);
    const matchStatus =
      status === "all" ||
      (status === "ongoing" && m.status === "Ongoing") ||
      (status === "completed" && m.status === "Completed");
    return matchQ && matchGenre && matchStatus;
  });

  const allGenres = [...new Set(list.flatMap((m) => m.genres))].sort();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <BookOpen className="h-7 w-7" /> MangaX
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Browse Manga</h1>
            <p className="text-sm text-muted-foreground">{filtered.length} manga found</p>
          </div>
          <div className="glass flex items-center gap-2 rounded-full px-4 py-2 md:w-full md:max-w-xl">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search manga..."
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

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold">No manga found</h2>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {filtered.map((m) => (
              <Link key={m.id} to="/manga/$slug" params={{ slug: m.slug }} className="group">
                <div className="overflow-hidden rounded-lg aspect-[3/4] relative">
                  <img src={m.cover} alt={`${m.title} cover`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <h3 className="mt-2 text-sm font-semibold line-clamp-1">{m.title}</h3>
                {m.rating && (
                  <div className="mt-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3 fill-hot text-hot" />
                    <span className="text-xs font-semibold">{m.rating}</span>
                  </div>
                )}
                {m.genres.length > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{m.genres.join(" · ")}</p>
                )}
                <p className="text-xs text-muted-foreground">{m.status}</p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}