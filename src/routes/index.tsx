import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, TrendingUp, ArrowRight, Home, Compass, Bookmark, Clock, User } from "lucide-react";
import { scrapedManga } from "@/lib/scraped-data";
import { history } from "@/lib/storage";
import hero from "@/assets/hero.jpg";
import promo from "@/assets/promo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MangaX — Read Trending Manga Online" },
      { name: "description", content: "Discover trending manga, latest chapters and genres on MangaX." },
      { property: "og:title", content: "MangaX — Read Trending Manga Online" },
      { property: "og:description", content: "Discover trending manga, latest chapters and genres on MangaX." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const CATEGORIES = ["All", "Manhwa", "Manga", "Manhua"];
const GENRES = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance", "Horror", "Sports"];

function Index() {
  const [category, setCategory] = useState("All");
  const [genre, setGenre] = useState<string | null>(null);
  const [slide, setSlide] = useState(0);

  const data = scrapedManga.length > 0 ? scrapedManga : [];

  const filtered = data.filter((m: any) => {
    const matchCat = category === "All" || (m.genres ?? []).some((g: string) => g.toLowerCase().includes(category.toLowerCase()));
    const matchGenre = !genre || (m.genres ?? []).includes(genre);
    return matchCat && matchGenre;
  });

  const popular = data.slice(0, 8);

  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % popular.length), 4000);
    return () => clearInterval(id);
  }, [popular.length]);

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

      <section className="relative overflow-hidden">
        <img src={hero} alt="Anime boy overlooking a town at dusk" width={1920} height={832} className="absolute inset-0 h-full w-full object-cover object-right" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-20 md:px-8 md:pt-28">
          <h1 className="text-6xl font-extrabold tracking-tight md:text-8xl">MangaX</h1>
          <p className="mt-2 text-xl font-medium md:text-2xl">Your One Stop Manga Platform</p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-14 px-4 py-10 md:px-8">
        {/* Categories */}
        <section>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button key={c} onClick={() => setCategory(c)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${category === c ? "bg-primary text-primary-foreground" : "glass hover:bg-accent"}`}>{c}</button>
            ))}
          </div>
        </section>

        {/* Genre filter */}
        <section>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setGenre(null)}
              className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${genre === null ? "bg-primary text-primary-foreground" : "glass hover:bg-accent"}`}>All Genres</button>
            {GENRES.map((g) => (
              <button key={g} onClick={() => setGenre(genre === g ? null : g)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${genre === g ? "bg-primary text-primary-foreground" : "glass hover:bg-accent"}`}>{g}</button>
            ))}
          </div>
        </section>

        {/* Popular this week - auto slide */}
        <section>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-3 text-2xl font-bold"><TrendingUp className="h-6 w-6" />Popular This Week</h2>
          </div>
          <div className="relative overflow-hidden rounded-2xl">
            <div className="flex transition-transform duration-700 ease-in-out" style={{ transform: `translateX(-${slide * 100}%)` }}>
              {popular.map((m: any) => (
                <div key={m.id} className="min-w-full">
                  <Link to="/manga/$slug" params={{ slug: m.slug }} className="grid gap-6 md:grid-cols-[2fr_1fr]">
                    <div className="relative overflow-hidden rounded-2xl">
                      <img src={m.cover} alt={m.title} className="h-64 w-full object-cover md:h-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-2xl font-bold text-white">{m.title}</h3>
                        <p className="text-sm text-white/80">{(m.genres ?? []).join(" · ")}</p>
                        <p className="mt-1 text-sm text-white/60">{m.synopsis?.slice(0, 120)}...</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      <p className="text-sm text-muted-foreground">Rating: {m.rating || "-"}</p>
                      <p className="text-sm text-muted-foreground">Status: {m.status || "-"}</p>
                      <p className="text-sm text-muted-foreground">Chapters: {m.chapters}</p>
                      <button className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground w-fit"><BookOpen className="h-4 w-4" /> Read Now</button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
              {popular.map((_: any, i: number) => (
                <button key={i} onClick={() => setSlide(i)} className={`h-2 w-2 rounded-full transition-colors ${i === slide ? "bg-primary" : "bg-white/40"}`} />
              ))}
            </div>
          </div>
        </section>

        {/* Manga grid with synopsis/rate/update/cover/status */}
        <section>
          <SectionHead title="All Manga" />
          {filtered.length === 0 ? (
            <p className="text-muted-foreground">No manga match your filter.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((m: any) => (
                <Link key={m.id} to="/manga/$slug" params={{ slug: m.slug }} className="group flex flex-col gap-2">
                  <div className="overflow-hidden rounded-lg aspect-[3/4] relative">
                    <img src={m.cover} alt={`${m.title} cover`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <span className="text-[11px] text-white">{m.status}</span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold line-clamp-1">{m.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{m.synopsis?.slice(0, 80)}...</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>⭐ {m.rating || "-"}</span>
                    <span>·</span>
                    <span>{m.chapters} ch</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="flex items-center gap-2 md:hidden">
          <TrendingUp className="h-5 w-5 text-hot" /><span className="text-sm text-muted-foreground">Popular this week updates daily</span>
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
