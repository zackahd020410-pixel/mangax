import { JSDOM } from "jsdom";
import type { MangaSource, MangaDetail, MangaChapter } from "@/lib/scraper/types";

const BASE = "https://komiktap.info";

function $text(el: Element | null): string {
  return el ? el.textContent?.trim() ?? "" : "";
}

function $attr(el: Element | null, attr: string): string | null {
  return el ? el.getAttribute(attr) : null;
}

export async function scrapeKomiktapList(): Promise<MangaSource[]> {
  const res = await fetch(`${BASE}/list-manga/`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const items: MangaSource[] = [];
  doc.querySelectorAll("div.post-item, article, .manga-item, .listmanga .item").forEach((node: any) => {
    const a = node.querySelector("a[href*='/manga/']");
    if (!a) return;
    const href = a.getAttribute("href") ?? "";
    const slug = href.replace(BASE, "").replace(/\/$/, "").split("/manga/")[1] ?? href.split("/manga/")[1];
    const title = $text(node.querySelector("h2, h3, .title, .post-title")) || $text(a);
    const img = node.querySelector("img");
    const cover = $attr(img, "src") ?? $attr(img, "data-src") ?? "";
    const ratingEl = node.querySelector(".rating, .score, .numscore");
    const rating = ratingEl ? Number($text(ratingEl)) : 0;
    const chapEl = node.querySelector(".chapter, .chapter-count, .post-meta");
    const chapText = $text(chapEl);
    const chapters = Number(chapText.replace(/\D/g, "") || 0);

    if (slug && title) {
      items.push({
        id: `komiktap-${slug}`,
        source: "komiktap",
        slug,
        title,
        cover,
        rating,
        chapters,
        status: "Ongoing",
        synopsis: "",
        genres: [],
      });
    }
  });
  return items;
}

export async function scrapeKomiktapDetail(slug: string): Promise<MangaDetail | null> {
  const res = await fetch(`${BASE}/manga/${slug}/`, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  if (!res.ok) return null;
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const title = $text(doc.querySelector("h1.entry-title, h1.post-title, h1")) || "";
  const cover =
    $attr(doc.querySelector(".poster, .poster-img img, .anime-cover img"), "src") ??
    $attr(doc.querySelector(".poster, .poster-img img, .anime-cover img"), "data-src") ??
    $attr(doc.querySelector("meta[property='og:image']"), "content") ??
    "";
  const synopsis = $text(doc.querySelector(".summary, .synopsis, .entry-content, .post-content")) || "";
  const genres: string[] = [];
  doc.querySelectorAll(".genres a, .genre a, .category a").forEach((g: any) => {
    const t = $text(g);
    if (t) genres.push(t);
  });

  const chapters: MangaChapter[] = [];
  doc.querySelectorAll("a.chapter-link, .chapter-list a, a[href*='-chapter-']").forEach((a: any) => {
    const href = a.getAttribute("href") ?? "";
    const title = $text(a);
    const m = href.match(/(-chapter-\d+)/) || title.match(/chapter\s*\d+/i);
    const num = m ? Number(m[1]) : chapters.length + 1;
    if (num && title) chapters.push({ num, title, url: href });
  });

  chapters.sort((a: any, b: any) => b.num - a.num);

  return {
    id: `komiktap-${slug}`,
    source: "komiktap",
    slug,
    title,
    cover,
    synopsis,
    genres,
    rating: 0,
    chapters: chapters.length,
    chapterList: chapters,
    status: "Ongoing",
  };
}

export async function scrapeKomiktapChapterPages(url: string): Promise<string[]> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  });
  if (!res.ok) return [];
  const html = await res.text();
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  const pages: string[] = [];
  doc.querySelectorAll(".reading-content img, .chapter-content img, .page-img img").forEach((img: any) => {
    const src = img.getAttribute("src") ?? img.getAttribute("data-src") ?? "";
    if (src && !pages.includes(src)) pages.push(src);
  });
  return pages;
}
