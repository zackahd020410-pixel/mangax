import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Settings, Sun, X, Bookmark, Clock } from "lucide-react";
import { getMangaById } from "@/lib/jikan";
import { history } from "@/lib/storage";

const BGS = ["bg-background", "bg-card", "bg-secondary", "bg-muted"];

export const Route = createFileRoute("/read/$slug/$num")({
  loader: async ({ params }) => {
    const manga = await getMangaById(Number(params.slug));
    if (!manga) throw notFound();
    return { manga, num: Number(params.num) };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${loaderData.manga.title} Chapter ${loaderData.num} — MangaX` : "Chapter unavailable — MangaX";
    return {
      meta: [{ title: t }, { name: "description", content: t }, { property: "og:title", content: t }, { property: "og:description", content: t }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }],
    };
  },
  notFoundComponent: () => <div className="grid min-h-screen place-items-center"><Link to="/" className="underline">Chapter not found — back home</Link></div>,
  component: Reader,
});

function Reader() {
  const { manga: m, num } = Route.useLoaderData();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"v" | "h">("v");
  const [bright, setBright] = useState(100);
  const [fit, setFit] = useState("max-w-xl");
  const [bg, setBg] = useState(0);
  const [page, setPage] = useState(0);
  const title = m.title_english || m.title;

  useEffect(() => {
    history.add(String(m.mal_id), num);
    setPage(0);
  }, [m.mal_id, num]);

  return (
    <div className={`min-h-screen ${BGS[bg]}`}>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
        <Link to="/manga/$slug" params={{ slug: String(m.mal_id) }} aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link>
        <span className="truncate text-sm text-muted-foreground">{title}</span>
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
            </div>
          </div>
          <div><p className="mb-2 flex justify-between text-sm">Brightness <span className="text-muted-foreground">{bright}%</span></p>
            <input type="range" min={30} max={100} value={bright} onChange={(e) => setBright(Number(e.target.value))} className="w-full accent-foreground" />
          </div>
          <div className="flex items-center justify-between text-sm">Ukuran Gambar
            <select value={fit} onChange={(e) => setFit(e.target.value)} className="rounded-md bg-secondary px-2 py-1">
              <option value="max-w-xl">Fit Width</option><option value="max-w-3xl">Lebar</option><option value="max-w-none">Penuh</option>
            </select>
          </div>
          <div className="flex items-center justify-between text-sm">Background
            <div className="flex gap-2">{BGS.map((b, i) => <button key={b} aria-label={`Background ${i + 1}`} onClick={() => setBg(i)} className={`h-6 w-6 rounded-full border ${b} ${bg === i ? "ring-2 ring-foreground" : ""}`} />)}</div>
          </div>
        </aside>
      )}

      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-2 text-center">
        <p className="font-display text-6xl font-bold text-muted-foreground">204</p>
        <p className="text-lg font-medium text-muted-foreground">No Content</p>
        <p className="max-w-md text-sm text-muted-foreground">Chapter pages are not available from Jikan API. Manga metadata is available, but images are not provided.</p>
        <Link to="/browse" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
          <BookOpen className="h-4 w-4" /> Browse Manga
        </Link>
      </div>

      <footer className="sticky bottom-0 flex items-center justify-center gap-3 border-t border-border bg-background/90 p-3 backdrop-blur">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <Link to="/manga/$slug" params={{ slug: String(m.mal_id) }} className="inline-flex items-center gap-1 rounded-full bg-secondary px-4 py-2 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Manga
        </Link>
      </footer>
    </div>
  );
}

function BookOpen(props: { className?: string }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
}