import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, TrendingUp, ArrowRight, Home, Compass, Bookmark, Clock, User, ChevronLeft, ChevronRight, Film } from "lucide-react";
import type { JikanManga, JikanAnime } from "@/lib/jikan";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MangaX — Read Trending Manga Online" },
      { name: "description", content: "Discover trending manga and anime on MangaX." },
      { property: "og:title", content: "MangaX — Read Trending Manga Online" },
      { property: "og:description", content: "Discover trending manga and anime on MangaX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CATEGORIES = ["All", "Manga", "Anime"];
const PER_PAGE = 10;

function cleanTitle(t: string) {
  const qCount = (t.match(/"/g) || []).length;
  if (qCount > 1) return "";
  return t;
}

function Index() {
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [slide, setSlide] = useState(0);
  const [mangaList, setMangaList] = useState<JikanManga[]>([]);
  const [animeList, setAnimeList] = useState<JikanAnime[]>([]);

  useEffect(() => {
    fetch("/api/manga?limit=25").then((r) => r.json()).then((d) => setMangaList(d || [])).catch(() => setMangaList([]));
    fetch("/api/anime?limit=25").then((r) => r.json()).then((d) => setAnimeList(d || [])).catch(() => setAnimeList([]));
  }, []);

  const mangaItems = mangaList.map((m) => ({
    id: m.mal_id,
    slug: String(m.mal_id),
    title: cleanTitle(m.title_english || m.title),
    cover: m.image_url || "",
    synopsis: m.synopsis || "",
    genres: (m.genres || []).map((g) => g.name),
    rating: m.score ?? 0,
    chapters: m.chapters ?? 0,
    status: m.status || "Ongoing",
    type: "manga" as const,
  })).filter((m) => m.title);

  const animeItems = animeList.map((a) => ({
    id: a.mal_id,
    slug: String(a.mal_id),
    title: cleanTitle(a.title_english || a.title),
    cover: a.image_url || "",
    synopsis: a.synopsis || "",
    genres: (a.genres || []).map((g) => g.name),
    rating: a.score ?? 0,
    episodes: a.episodes ?? 0,
    status: a.status || "Ongoing",
    type: "anime" as const,
  })).filter((a) => a.title);

  const allItems = [...mangaItems, ...animeItems];

  const filtered = allItems.filter((m) => {
    const matchCat = category === "All" || m.type.toLowerCase() === category.toLowerCase();
    return matchCat;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const popular = allItems.slice(0, 8);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % Math.max(popular.length, 1)), 4000);
    return () => clearInterval(id);
  }, [popular.length]);

  useEffect(() => {
    setPage(1);
  }, [category]);

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
          <a href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <BookOpen className="h-7 w-7" /> MangaX
          </a>
          <nav className="hidden gap-7 text-sm md:flex">
            {["Home", "Browse", "Genres", "History", "Bookmark"].map((n, i) => (
              <a key={n} href={n === "Home" ? "/" : `/${n.toLowerCase()}`} className={i === 0 ? "border-b-2 border-foreground pb-1 font-semibold" : "text-muted-foreground transition-colors hover:text-foreground"}>{n}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <a href="/history" aria-label="History" className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><Clock className="h-5 w-5" /></a>
            <a href="/bookmark" aria-label="Bookmark" className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><Bookmark className="h-5 w-5" /></a>
            <button aria-label="Profile" className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><User className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-14 px-4 py-10 md:px-8">
        {/* Popular this week - top, no box, transparent overlay */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-bold"><TrendingUp className="h-6 w-6" />Popular This Week</h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${slide * 100}%)` }}>
              {popular.map((m) => (
                <div key={m.id} className="min-w-full relative">
                  <img src={m.cover} alt={m.title} className="h-72 w-full object-cover md:h-96" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-3xl font-bold text-white">{m.title}</h3>
                    <p className="mt-1 text-sm text-white/80">{(m.genres ?? []).join(" · ")}</p>
                    <p className="mt-2 text-sm text-white/70 line-clamp-2">{m.synopsis?.slice(0, 150)}</p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-white/80">
                      <span>⭐ {m.rating || "-"}</span>
                      <span>{m.type === "manga" ? `Ch. 1-${m.chapters}` : `${m.episodes} ep`}</span>
                      <span>{m.status}</span>
                    </div>
                    <Link to={m.type === "manga" ? "/manga/$slug" : "/anime/$slug"} params={{ slug: m.slug }} className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                      <BookOpen className="h-4 w-4" /> Read Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {popular.map((_, i) => (
                <button key={i} onClick={() => setSlide(i)} className={`h-2 w-2 rounded-full transition-colors ${i === slide ? "bg-primary" : "bg-white/40"}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${category === c ? "bg-primary text-primary-foreground" : "glass hover:bg-accent"}`}>{c}</button>
            ))}
          </div>
        </section>

        {/* Manga/Anime grid - paginated */}
        <section>
          <SectionHead title="All" />
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {paginated.map((m) => (
                  <Link key={m.id} to={`/${m.type}/$slug`} params={{ slug: m.slug }} className="group">
                    <div className="overflow-hidden rounded-lg aspect-[3/4] relative">
                      <img src={m.cover} alt={`${m.title} cover`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-1">
                        <span className="text-[10px] text-white">{m.status}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium line-clamp-1">{cleanTitle(m.title)}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">{m.synopsis?.slice(0, 80)}...</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>⭐ {m.rating || "-"}</span>
                      <span>·</span>
                      <span>{m.type === "manga" ? `Ch. 1-${m.chapters}` : `${m.episodes} ep`}</span>
                    </div>
                  </Link>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                    className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm disabled:opacity-40">
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                    className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-40">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:px-8">
          <div className="flex items-center gap-2"><BookOpen className="h-6 w-6" /><div><p className="font-display font-bold">MangaX</p><p className="text-xs text-muted-foreground">Read more. Be happy.</p></div></div>
          <div className="flex gap-6 text-sm text-muted-foreground md:mx-auto">
            {["About", "Contact", "Privacy", "Terms"].map((l) => <a key={l} href="/" className="hover:text-foreground">{l}</a>)}
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-border bg-card/95 py-2 backdrop-blur md:hidden">
        {[[Home, "Home"], [Compass, "Explore"], [Bookmark, "Bookmark"], [Clock, "History"], [User, "Profile"]].map(([Icon, l], i) => {
          const I = Icon as typeof Home;
          return (
            <a key={l as string} href={l === "Home" ? "/" : `/${String(l).toLowerCase()}`} className={`flex flex-col items-center gap-1 text-[11px] ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>
              <I className="h-5 w-5" />{l as string}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function SectionHead({ title }: { title: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="text-2xl font-bold">{title}</h2>
      <a href="/browse" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">View all <ArrowRight className="h-4 w-4" /></a>
    </div>
  );
}