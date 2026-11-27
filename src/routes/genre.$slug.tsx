import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { BookOpen, ArrowLeft } from "lucide-react";
import { mangas } from "@/lib/manga";

export const Route = createFileRoute("/genre/$slug")({
  loader: ({ params }) => {
    const genre = params.slug;
    const list = mangas.filter((m) => m.genres.includes(genre));
    if (list.length === 0) throw notFound();
    return { genre, list };
  },
  head: ({ loaderData }) => {
    const g = loaderData?.genre;
    return {
      meta: [
        { title: `${g} Manga — Read on MangaX` },
        { name: "description", content: `Read ${g} manga online on MangaX.` },
        { property: "og:title", content: `${g} Manga — MangaX` },
        { property: "og:type", content: "website" },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="grid min-h-screen place-items-center">
      <Link to="/" className="underline">Genre not found — back home</Link>
    </div>
  ),
  component: GenrePage,
});

function GenrePage() {
  const { genre, list } = Route.useLoaderData();

  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 md:px-8">
          <Link to="/" aria-label="Back" className="md:hidden"><ArrowLeft className="h-5 w-5" /></Link>
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <BookOpen className="h-7 w-7" /> MangaX
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 md:px-8">
        <h1 className="text-3xl font-bold">{genre}</h1>
        <p className="text-sm text-muted-foreground">{list.length} manga in this genre</p>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {list.map((m) => (
            <Link key={m.slug} to="/manga/$slug" params={{ slug: m.slug }} className="group">
              <div className="overflow-hidden rounded-lg aspect-[3/4]">
                <img src={m.cover} alt={`${m.title} cover`} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <h3 className="mt-2 text-sm font-semibold line-clamp-1">{m.title}</h3>
              <div className="mt-1 flex items-center gap-1">
                <BookOpen className="h-3 w-3 fill-hot text-hot" />
                <span className="text-xs font-semibold">{m.rating}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{m.genres.join(" · ")}</p>
              <p className="text-xs text-muted-foreground">{m.status}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
