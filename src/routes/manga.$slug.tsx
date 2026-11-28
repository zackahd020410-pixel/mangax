import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { BookOpen, Bookmark, Share2, Star, ChevronRight, ChevronDown, Clock, ArrowLeft } from "lucide-react";
import { getMangaById } from "@/lib/jikan";
import hero from "@/assets/hero.jpg";

export const Route = createFileRoute("/manga/$slug")({
  loader: async ({ params }) => {
    const manga = await getMangaById(Number(params.slug));
    if (!manga) throw notFound();
    return { manga };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.manga.title} — Read on MangaX` : "Manga not found — MangaX";
    return {
      meta: [
        { title: t },
        { name: "description", content: loaderData?.manga.synopsis?.slice(0, 150) ?? "" },
        { property: "og:title", content: t },
        { property: "og:description", content: loaderData?.manga.synopsis?.slice(0, 150) ?? "" },
        { property: "og:type", content: "book" },
        { property: "og:image", content: loaderData?.manga.image_url ?? "" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">
      <Link to="/" className="underline">Manga not found — back home</Link>
    </div>
  ),
  component: Detail,
});

function Detail() {
  const { manga: m } = Route.useLoaderData();
  const [more, setMore] = useState(false);
  const [saved, setSaved] = useState(false);
  const title = m.title_english || m.title;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
          <Link to="/" aria-label="Back" className="md:hidden"><ArrowLeft className="h-5 w-5" /></Link>
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold"><BookOpen className="h-7 w-7" /> MangaX</Link>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <img src={hero} alt="" width={1920} height={832} className="absolute inset-0 h-full w-full object-cover object-right opacity-40" />
        <div className="absolute inset-0 bg-hero-fade" />
        <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:flex-row md:px-8 md:py-12">
          <img src={m.image_url || ""} alt={`${title} cover`} width={704} height={960} className="aspect-[3/4] w-40 rounded-xl object-cover shadow-2xl md:w-64" />
          <div className="max-w-2xl">
            <nav className="flex items-center gap-1 text-xs text-muted-foreground">
              <Link to="/" className="hover:text-foreground">Home</Link><ChevronRight className="h-3 w-3" />
              {(m.genres || []).slice(0, 1).map((g) => <span key={g.mal_id}>{g.name}</span>)}
              <ChevronRight className="h-3 w-3" /><span className="text-foreground">{title}</span>
            </nav>
            <h1 className="mt-3 text-4xl font-bold md:text-5xl">{title}</h1>
            <p className="mt-2 flex items-center gap-1.5">
              <Star className="h-5 w-5 fill-hot text-hot" />
              {m.score ?? "-"}
              {m.scored_by && <span className="text-muted-foreground">({m.scored_by} ratings)</span>}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {(m.genres || []).map((g) => (
                <Link key={g.mal_id} to="/browse" className="rounded-full bg-secondary px-3 py-1 text-xs hover:bg-accent transition-colors">{g.name}</Link>
              ))}
            </div>
            <p className={`mt-4 text-sm leading-relaxed text-muted-foreground ${more ? "" : "line-clamp-3"}`}>{m.synopsis}</p>
            <button onClick={() => setMore(!more)} className="mt-1 flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
              {more ? "Show less" : "Read more"} <ChevronDown className={`h-4 w-4 transition-transform ${more ? "rotate-180" : ""}`} />
            </button>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/read/$slug/$num" params={{ slug: String(m.mal_id), num: "1" }} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
                <BookOpen className="h-4 w-4" /> Read Now
              </Link>
              <button onClick={() => setSaved(!saved)} className="glass inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold">
                <Bookmark className={`h-4 w-4 ${saved ? "fill-foreground" : ""}`} /> {saved ? "Bookmarked" : "Add to Bookmark"}
              </button>
              <button aria-label="Share" onClick={() => navigator.clipboard?.writeText(window.location.href)} className="glass grid h-11 w-11 place-items-center rounded-full">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-10 px-4 pb-16 md:px-8">
        <div className="grid grid-cols-3 divide-x divide-border rounded-xl bg-card">
          <div className="flex flex-col items-center gap-1 p-4 text-center md:flex-row md:gap-3 md:text-left">
            <BookOpen className="h-5 w-5" />
            <div><p className="text-xs text-muted-foreground">Chapters</p><p className="text-sm font-semibold">{m.chapters ?? "-"}</p></div>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 text-center md:flex-row md:gap-3 md:text-left border-l border-r border-border">
            <span className="h-2.5 w-2.5 rounded-full bg-success-foreground" />
            <div><p className="text-xs text-muted-foreground">Status</p><p className="text-sm font-semibold">{m.status ?? "-"}</p></div>
          </div>
          <div className="flex flex-col items-center gap-1 p-4 text-center md:flex-row md:gap-3 md:text-left">
            <Clock className="h-5 w-5" />
            <div><p className="text-xs text-muted-foreground">Last Update</p><p className="text-sm font-semibold">{m.published?.from ? new Date(m.published.from).toLocaleDateString() : "-"}</p></div>
          </div>
        </div>

        <div className="grid gap-10 lg:grid-cols-2">
          <section>
            <h2 className="mb-3 text-xl font-bold">Chapter List</h2>
            <p className="text-sm text-muted-foreground">Chapter pages are not available from Jikan API.</p>
            <Link to="/browse" className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              <BookOpen className="h-4 w-4" /> Browse Manga
            </Link>
          </section>
        </div>
      </main>
    </div>
  );
}