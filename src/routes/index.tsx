import { createFileRoute, Link } from "@tanstack/react-router";
import { mangas } from "@/lib/manga";
import { useState } from "react";
import {
  BookOpen, Search, User, TrendingUp, ArrowRight, ChevronDown, Home, Compass,
  Bookmark, Clock, Flame,
} from "lucide-react";
import hero from "@/assets/hero.jpg";
import promo from "@/assets/promo.jpg";
import c1 from "@/assets/cover-1.jpg";
import c2 from "@/assets/cover-2.jpg";
import c3 from "@/assets/cover-3.jpg";
import c4 from "@/assets/cover-4.jpg";

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

const genres = ["Action", "Adventure", "Comedy", "Drama", "Fantasy", "Romance"];
const trending = mangas.map((m) => ({ t: m.title, g: m.genres[0] ?? "", img: m.cover, slug: m.slug, genres: m.genres }));
const latest = [
  { t: "Solo Leveling", slug: "solo-leveling", ch: 200, ago: "5m ago", img: c1, tag: "Updated" },
  { t: "Blue Lock", slug: "blue-lock", ch: 289, ago: "18m ago", img: c2, tag: "New" },
  { t: "Jujutsu Kaisen", slug: "jujutsu-kaisen", ch: 270, ago: "32m ago", img: c3, tag: "Updated" },
  { t: "Chainsaw Man", slug: "chainsaw-man", ch: 174, ago: "1h ago", img: c1, tag: "Updated" },
  { t: "Frieren", slug: "frieren", ch: 140, ago: "1h ago", img: c4, tag: "New" },
  { t: "Tokyo Revengers", slug: "tokyo-revengers", ch: 278, ago: "2h ago", img: c3, tag: "Updated" },
];
const nav = ["Home", "Browse", "Genres", "History", "Bookmark"];

function Index() {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | null>(null);
  const shown = trending.filter(
    (m) => m.t.toLowerCase().includes(q.toLowerCase()) && (!genre || m.genres.includes(genre)),
  );

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
          <a href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <BookOpen className="h-7 w-7" /> MangaX
          </a>
          <nav className="hidden gap-7 text-sm md:flex">
            {nav.map((n, i) => (
              <a key={n} href="/" className={i === 0 ? "border-b-2 border-foreground pb-1 font-semibold" : "text-muted-foreground transition-colors hover:text-foreground"}>{n}</a>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <button aria-label="Search" className="grid h-10 w-10 place-items-center rounded-full bg-secondary"><Search className="h-5 w-5" /></button>
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
          <label className="glass mt-8 flex max-w-xl items-center gap-3 rounded-full px-5 py-3.5">
            <Search className="h-5 w-5 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search manga..." className="w-full bg-transparent outline-none placeholder:text-muted-foreground" />
          </label>
          <div className="mt-6 flex flex-wrap gap-3">
            {genres.map((g) => (
              <button key={g} onClick={() => setGenre(genre === g ? null : g)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${genre === g ? "bg-primary text-primary-foreground" : "glass hover:bg-accent"}`}>{g}</button>
            ))}
            <button className="glass flex items-center gap-1 rounded-full px-5 py-2 text-sm font-medium">More <ChevronDown className="h-4 w-4" /></button>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-14 px-4 py-10 md:px-8">
        <section>
          <SectionHead icon={<TrendingUp className="h-6 w-6" />} title="Trending Now" />
          {shown.length === 0 ? (
            <p className="text-muted-foreground">No manga match your search.</p>
          ) : (
            <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
              {shown.map((m) => (
                <Link key={m.slug} to="/manga/$slug" params={{ slug: m.slug }} className="group">
                  <div className="overflow-hidden rounded-lg">
                    <img src={m.img} alt={`${m.t} cover`} loading="lazy" width={704} height={960} className="aspect-[3/4] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  </div>
                  <h3 className="mt-2 font-sans text-sm font-semibold">{m.t}</h3>
                  <p className="text-xs text-muted-foreground">{m.g} · Ongoing</p>
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div>
            <SectionHead icon={<BookOpen className="h-6 w-6" />} title="Latest Chapters" />
            <div className="grid gap-x-8 sm:grid-cols-2">
              {latest.map((m) => (
                <Link key={m.t} to="/read/$slug/$num" params={{ slug: m.slug, num: String(m.ch) }} className="flex items-center gap-4 border-b border-border py-3 transition-colors hover:bg-muted/40">
                  <img src={m.img} alt="" loading="lazy" width={704} height={960} className="h-11 w-14 rounded object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{m.t}</p>
                    <p className="text-xs text-muted-foreground">Chapter {m.ch}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] ${m.tag === "New" ? "bg-secondary text-foreground" : "bg-success text-success-foreground"}`}>{m.tag}</span>
                  <span className="w-14 text-right text-xs text-muted-foreground">{m.ago}</span>
                </Link>
              ))}
            </div>
          </div>
          <div className="relative min-h-64 overflow-hidden rounded-2xl">
            <img src={promo} alt="Girl with headphones in manga panel" loading="lazy" width={1024} height={640} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-promo-fade" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-2xl font-bold leading-tight">Keep Reading<br />Your Favorite Manga</h3>
              <button className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Login Now <ArrowRight className="h-4 w-4" /></button>
            </div>
          </div>
        </section>

        <section className="flex items-center gap-2 md:hidden">
          <Flame className="h-5 w-5 text-hot" /><span className="text-sm text-muted-foreground">Popular this week updates daily</span>
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
            <a key={l as string} href="/" className={`flex flex-col items-center gap-1 text-[11px] ${i === 0 ? "text-foreground" : "text-muted-foreground"}`}>
              <I className="h-5 w-5" />{l as string}
            </a>
          );
        })}
      </nav>
    </div>
  );
}

function SectionHead({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-5 flex items-center justify-between">
      <h2 className="flex items-center gap-3 text-2xl font-bold">{icon}{title}</h2>
      <a href="/" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">View all <ArrowRight className="h-4 w-4" /></a>
    </div>
  );
}
