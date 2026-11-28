import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, BookOpen, Trash2 } from "lucide-react";
import { bookmarks } from "@/lib/storage";
import { getMangaById } from "@/lib/jikan";

type Manga = {
  mal_id: number;
  title: string;
  title_english?: string;
  image_url?: string;
  synopsis?: string;
  status?: string;
  chapters?: number;
  score?: number;
  genres?: { mal_id: number; name: string; url: string }[];
};

export const Route = createFileRoute("/bookmark")({
  head: () => ({
    meta: [
      { title: "Bookmarks — MangaX" },
      { name: "description", content: "Your bookmarked manga on MangaX." },
    ],
  }),
  component: BookmarkPage,
});

function BookmarkPage() {
  const [list, setList] = useState<{ slug: string }[]>([]);
  const [mangas, setMangas] = useState<Manga[]>([]);

  useEffect(() => {
    const b = bookmarks.get();
    setList(b);
    Promise.all(b.map((x) => getMangaById(Number(x.slug)))).then((m) => {
      setMangas(m.filter(Boolean) as Manga[]);
    });
  }, []);

  const toggle = (slug: string) => {
    bookmarks.toggle(slug);
    setList(list.filter((b) => b.slug !== slug));
    setMangas(mangas.filter((m) => String(m.mal_id) !== slug));
  };

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <BookOpen className="h-7 w-7" /> MangaX
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-10 md:px-8">
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <p className="text-sm text-muted-foreground">Manga you saved to read later</p>

        {mangas.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Bookmark className="h-12 w-12 text-muted-foreground mb-3" />
            <h2 className="text-lg font-semibold">No bookmarks yet</h2>
            <p className="text-sm text-muted-foreground">Bookmark manga from the detail page to save them here.</p>
            <Link to="/" className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
              Browse Manga <BookOpen className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {mangas.map((m) => {
              const title = m.title_english || m.title;
              return (
                <Link key={m.mal_id} to="/manga/$slug" params={{ slug: String(m.mal_id) }} className="group flex flex-col gap-2">
                  <div className="overflow-hidden rounded-lg aspect-[3/4] relative">
                    <img src={m.image_url || ""} alt={`${title} cover`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <button
                      aria-label="Remove bookmark"
                      onClick={(e) => { e.stopPropagation(); toggle(String(m.mal_id)); }}
                      className="absolute top-2 right-2 grid h-8 w-8 place-items-center bg-black/60 backdrop-blur rounded-full text-white hover:bg-black/80"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-2 grid h-8 w-8 place-items-center bg-black/60 backdrop-blur rounded-full text-white">
                      <Bookmark className="h-4 w-4 fill-foreground" />
                    </div>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold line-clamp-1">{title}</h3>
                  <div className="mt-1 flex items-center gap-1">
                    <BookOpen className="h-3 w-3 fill-hot text-hot" />
                    <span className="text-xs font-semibold">{m.score ?? "-"}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{(m.genres || []).map((g) => g.name).join(" · ")}</p>
                  <p className="text-xs text-muted-foreground">{m.status}</p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}