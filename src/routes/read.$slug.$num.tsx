import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Sun, X, Bookmark, Clock } from "lucide-react";
import { getManga } from "@/lib/manga";
import { scrapedManga } from "@/lib/scraped-data";
import { history } from "@/lib/storage";

const BGS = ["bg-background", "bg-card", "bg-secondary", "bg-muted"];

function loadManga(slug: string) {
  return scrapedManga.find((m: any) => m.slug === slug) ?? getManga(slug);
}

export const Route = createFileRoute("/read/$slug/$num")({
  loader: async ({ params }) => {
    const slug = params.slug;
    const num = Number(params.num);
    const manga = loadManga(slug);
    if (!manga || !Number.isInteger(num) || num < 1 || num > manga.chapters) throw notFound();
    const chapter = manga.chapterList?.find((c: any) => c.num === num);
    if (!chapter) throw notFound();
    return { manga, num, chapter };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.manga.title} Chapter ${loaderData.num} — MangaX` : "Chapter unavailable — MangaX";
    return { meta: [{ title: t }, { name: "description", content: t }, { property: "og:title", content: t }, { property: "og:description", content: t }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] };
  },
  notFoundComponent: () => <div className="grid min-h-screen place-items-center"><Link to="/" className="underline">Chapter not found — back home</Link></div>,
  component: Reader,
});

function Reader() {
  const { manga: m, num, chapter } = Route.useLoaderData() as any;
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"v" | "h">("v");
  const [bright, setBright] = useState(100);
  const [fit, setFit] = useState("max-w-xl");
  const [bg, setBg] = useState(0);
  const [page, setPage] = useState(0);
  const [pages, setPages] = useState<string[]>(chapter?.pages ?? []);

  useEffect(() => {
    history.add(m.slug, num);
    setPage(0);
    setPages(chapter?.pages ?? []);
  }, [m.slug, num, chapter]);

  const pageList = pages.length > 0 ? pages : (chapter?.pages ?? []);
  const go = (n: number) => nav({ to: "/read/$slug/$num", params: { slug: m.slug, num: String(n) } });
  const prevChapter = chapter.num > 1 ? chapter.num - 1 : null;
  const nextChapter = chapter.num < m.chapters ? chapter.num + 1 : null;

  return (
    <div className={`min-h-screen ${BGS[bg]}`}>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
        <Link to="/manga/$slug" params={{ slug: m.slug }} aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link>
        <span className="truncate text-sm text-muted-foreground">{m.title}</span>
        <select value={num} onChange={(e) => go(Number(e.target.value))} className="rounded-md bg-secondary px-2 py-1 text-sm">
          {m.chapterList.map((c: any) => <option key={c.num} value={c.num}>Chapter {c.num}</option>)}
        </select>
        {mode === "h" && <span className="text-sm text-muted-foreground">{page + 1} / {pageList.length}</span>}
        <div className="ml-auto flex gap-2">
          <button aria-label="Bookmark" className="grid h-9 w-9 place-items-center rounded-full bg-secondary"><Bookmark className="h-4 w-4" /></button>
          <button aria-label="Settings" onClick={() => setOpen(!open)} className="grid h-9 w-9 place-items-center rounded-full bg-secondary"><Settings className="h-4 w-4" /></button>
        </div>
      </header>

      {open && (
        <aside className="fixed right-4 top-16 z-40 w-80 space-y-5 rounded-2xl border border-border bg-card p-5 shadow-2xl">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Pengaturan</h2><button aria-label="Tutup" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button></div>
          <div><p className="mb-2 text-sm">Mode Baca</p>
            <div className="grid grid-cols-2 rounded-full bg-secondary p-1 text-sm">
              {(["v", "h"] as const).map((x) => <button key={x} onClick={() => setMode(x)} className={`rounded-full py-1.5 ${mode === x ? "bg-primary text-primary-foreground" : ""}`}>{x === "v" ? "Vertikal" : "Horizontal"}</button>)}
            </div></div>
          <div><p className="mb-2 flex justify-between text-sm">Brightness <span className="text-muted-foreground">{bright}%</span></p>
            <input type="range" min={30} max={100} value={bright} onChange={(e) => setBright(Number(e.target.value))} className="w-full accent-foreground" /></div>
          <div className="flex items-center justify-between text-sm">Ukuran Gambar
            <select value={fit} onChange={(e) => setFit(e.target.value)} className="rounded-md bg-secondary px-2 py-1">
              <option value="max-w-3xl">Fit Width</option><option value="max-w-xl">Kecil</option><option value="max-w-none">Penuh</option>
            </select></div>
          <div className="flex items-center justify-between text-sm">Background
            <div className="flex gap-2">{BGS.map((b, i) => <button key={b} aria-label={`Background ${i + 1}`} onClick={() => setBg(i)} className={`h-6 w-6 rounded-full border ${b} ${bg === i ? "ring-2 ring-foreground" : ""}`} />)}</div></div>
        </aside>
      )}

      <main className={`mx-auto ${fit} py-4`} style={{ filter: `brightness(${bright}%)` }}>
        {pageList.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
            <p className="font-display text-6xl font-bold text-muted-foreground">204</p>
            <p className="text-lg font-medium text-muted-foreground">No Content</p>
            <p className="max-w-md text-sm text-muted-foreground">Chapter ini belum punya halaman yang tersedia.</p>
          </div>
        ) : mode === "v" ? (
          pageList.map((p: string, i: number) => <img key={i} src={p} alt={`Page ${i + 1}`} loading={i ? "lazy" : "eager"} className="w-full" />)
        ) : (
          <div className="relative">
            <img src={pageList[page]} alt={`Page ${page + 1}`} className="w-full" />
            <button aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)} className="glass absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full disabled:opacity-30"><ChevronLeft /></button>
            <button aria-label="Next page" disabled={page === pageList.length - 1} onClick={() => setPage(page + 1)} className="glass absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full disabled:opacity-30"><ChevronRight /></button>
          </div>
        )}
      </main>

      {/* Related manga */}
      <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <h2 className="mb-4 text-xl font-bold">Manga Lainnya</h2>
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {scrapedManga.filter((x: any) => x.slug !== m.slug).slice(0, 8).map((r: any) => (
            <Link key={r.id} to="/manga/$slug" params={{ slug: r.slug }} className="group">
              <img src={r.cover} alt={r.title} loading="lazy" className="aspect-[3/4] w-full rounded-lg object-cover transition-transform group-hover:scale-105" />
              <p className="mt-1 text-xs font-medium line-clamp-1">{r.title}</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="sticky bottom-0 flex items-center justify-center gap-3 border-t border-border bg-background/90 p-3 backdrop-blur">
        <Clock className="h-4 w-4 text-muted-foreground" />
        {prevChapter ? (
          <button onClick={() => go(prevChapter)} className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm"><ChevronLeft className="h-4 w-4" /> Previous</button>
        ) : null}
        {nextChapter ? (
          <button onClick={() => go(nextChapter)} className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Next <ChevronRight className="h-4 w-4" /></button>
        ) : null}
      </footer>
    </div>
  );
}
