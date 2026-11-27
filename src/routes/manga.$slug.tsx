import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Bookmark, Share2, Star, ChevronRight, ChevronDown, Clock, ArrowLeft } from "lucide-react";
import { getManga } from "@/lib/manga";
import fs from "node:fs";
import path from "node:path";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/manga/$slug")({
  loader: async ({ params }) => {
    // 1. local fallback manga
    let manga = getManga(params.slug);
    if (manga) return { manga };
    // 2. read from scraped komiktap.json
    try {
      const p = path.join(process.cwd(), "public", "data", "komiktap.json");
      if (fs.existsSync(p)) {
        const json = JSON.parse(fs.readFileSync(p, "utf8"));
        const found = json.data?.find((m: any) => m.slug === params.slug);
        if (found) return { manga: found };
      }
    } catch {}
    throw notFound();
  },
  head: async ({ loaderData }) => {
    const t = loaderData ? `${loaderData.manga.title} — Read on MangaX` : "Manga not found — MangaX";
    const d = loaderData?.manga.synopsis?.slice(0, 150) ?? "This manga is unavailable.";
    return {
      meta: [
        { title: t },
        { name: "description", content: d },
        { property: "og:title", content: t },
        { property: "og:description", content: d },
        { property: "og:type", content: "book" },
        { property: "og:image", content: loaderData?.manga.cover ?? "" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:image", content: loaderData?.manga.cover ?? "" },
      ],
    };
  },
  notFoundComponent: () => <div className="grid min-h-screen place-items-center"><Link to="/" className="underline">Manga not found — back home</Link></div>,
  component: Detail,
});

function Detail() {
  const { manga: m } = Route.useLoaderData();
  const [more, setMore] = useState(false);
  const [saved, setSaved] = useState(false);
  const chapters = m.chapterList?.length ? m.chapterList : Array.from({ length: 8 }, (_, i) => m.chapters - i);
  const ch = chapters as any[];

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
          <Link to="/" aria-label="Back" className="md:hidden"><ArrowLeft className="h-5 w-5" /></Link>
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold"><BookOpen className="h-7 w-7" /> MangaX</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img src={m.banner ?? hero} alt="" width={1920} height={832} className="absolute inset-0 h-full w-full object-cover object-right opacity-40" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8 md:py-12">
          <img src={m.cover} alt={`${m.title} cover`} width={704} height={960} className="aspect-[3/4] w-40 rounded-xl object-cover shadow-2xl md:w-64" />
          <div className="max-w-2xl">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link><ChevronRight className="h-3 w-3" />{m.genres?.[0]}<ChevronRight className="h-3 w-3" /><span className="text-foreground">{m.title}</span>
            </nav>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">{m.title}</h1>
            {m.rating && (
              <p className="mt-2 flex items-center gap-1.5"><Star className="h-5 w-5 fill-hot text-hot" />{m.rating}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">{m.genres?.map((g: string) => <span key={g} className="rounded-full bg-secondary px-3 py-1 text-xs">{g}</span>)}</div>
            <p className={`mt-4 text-sm leading-relaxed text-muted-foreground ${more ? "" : "line-clamp-3"}`}>{m.synopsis}</p>
            <button onClick={() => setMore(!more)} className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">{more ? "Show less" : "Read more"} <ChevronDown className={`h-4 w-4 transition-transform ${more ? "rotate-180" : ""}`} /></button>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/read/$slug/$num" params={{ slug: m.slug, num: String(ch[0]?.num ?? m.chapters) }} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"><BookOpen className="h-4 w-4" /> Read Now</Link>
              <button onClick={() => setSaved(!saved)} className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"><Bookmark className={`h-4 w-4 ${saved ? "fill-foreground" : ""}`} /> {saved ? "Bookmarked" : "Add to Bookmark"}</button>
              <button aria-label="Share" onClick={() => navigator.clipboard?.writeText(window.location.href)} className="glass grid h-11 w-11 place-items-center rounded-full"><Share2 className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-16 md:px-8">
        <div className="grid grid-cols-3 divide-x divide-border rounded-xl bg-card">
          <div className="flex flex-col items-center gap-1 p-4 text-center md:flex-row md:gap-3 md:text-left">
            <BookOpen className="h-5 w-5" />
            <div><p className="text-xs text-muted-foreground">Chapters</p><p className="text-sm font-semibold">{m.chapters}</p></div>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 text-center md:flex-row md:gap-3 md:text-left border-l border-r border-border">
            <span className="h-2.5 w-2.5 rounded-full bg-success-foreground" />
            <div><p className="text-xs text-muted-foreground">Status</p><p className="text-sm font-semibold">{m.status}</p></div>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 text-center md:flex-row md:gap-3 md:text-left">
            <Clock className="h-5 w-5" />
            <div><p className="text-xs text-muted-foreground">Last Update</p><p className="text-sm font-semibold">{m.updated ?? "-"}</p></div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xl font-bold">Chapter List</h2>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {chapters.map((c: any) => (
                <Link key={c.num} to="/read/$slug/$num" params={{ slug: m.slug, num: String(c.num) }} className="aspect-square rounded-lg border border-border flex items-center justify-center text-xs font-medium transition-colors hover:bg-muted/40 hover:border-primary">
                  {c.num}
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}