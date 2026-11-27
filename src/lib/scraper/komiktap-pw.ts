import { chromium } from "playwright";
import type { MangaSource, MangaDetail, MangaChapter } from "@/lib/scraper/types";

const BASE = "https://komiktap.info";

/**
 * Komiktap Playwright scraper.
 * Works on servers that can install/run Chromium (not standard Vercel Hobby).
 * For Vercel: use @sparticuz/chromium + playwright-core or external scraping service.
 */
export async function scrapeKomiktapListPW(): Promise<MangaSource[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });

  try {
    await page.goto(`${BASE}/list-manga/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const items = await page.evaluate(() => {
      const results: any[] = [];
      const seen = new Set<string>();
      document.querySelectorAll("a[href*='/manga/']").forEach((a) => {
        const href = a.getAttribute("href") || "";
        // skip list/nav links
        if (href.endsWith("/manga/") || href.includes("/manga/?")) return;
        if (seen.has(href)) return;
        seen.add(href);
        const slug = href.replace("https://komiktap.info", "").replace(/\/$/, "").split("/manga/")[1] || href.split("/manga/")[1];
        if (!slug) return;
        const text = a.textContent?.trim() || "";
        // title is text before "Chapter" keyword
        let title = (text.split(/chapter/i)[0] ?? "").trim();
        // remove "Completed"/"Ongoing" prefix
        title = title.replace(/^(completed|ongoing)\s*/i, "").trim();
        const img = a.querySelector("img");
        const cover = img?.getAttribute("src") || img?.getAttribute("data-src") || "";
        if (title) {
          results.push({ id: `komiktap-${slug}`, source: "komiktap", slug, title, cover, rating: 0, chapters: 0, status: "Ongoing", synopsis: "", genres: [] });
        }
      });
      return results;
    });
    return items;
  } finally {
    await browser.close();
  }
}

export async function scrapeKomiktapDetailPW(slug: string): Promise<MangaDetail | null> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });

  try {
    await page.goto(`${BASE}/manga/${slug}/`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const detail = await page.evaluate((slugParam: string) => {
      const title = document.querySelector("h1.entry-title, h1.post-title, h1")?.textContent?.trim() || "";
      const coverEl = document.querySelector(".poster img, .poster-img img, .anime-cover img") as HTMLImageElement | null;
      const cover = coverEl?.getAttribute("src") || coverEl?.getAttribute("data-src") || document.querySelector("meta[property='og:image']")?.getAttribute("content") || "";
      const synopsis = document.querySelector(".summary, .synopsis, .entry-content, .post-content")?.textContent?.trim() || "";
      const genres: string[] = [];
      document.querySelectorAll(".genres a, .genre a, .category a").forEach((g) => {
        const t = g.textContent?.trim();
        if (t) genres.push(t);
      });

      const chapters: MangaChapter[] = [];
      document.querySelectorAll("a.chapter-link, .chapter-list a, a[href*='-chapter-']").forEach((a) => {
        const href = a.getAttribute("href") || "";
        const title = a.textContent?.trim();
        const m = href.match(/-chapter-(\d+)/) || title?.match(/chapter\s*(\d+)/i);
        const num = m ? Number(m[1]) : chapters.length + 1;
        if (num && title) chapters.push({ num, title, url: href });
      });
      chapters.sort((a, b) => b.num - a.num);

      return { title, cover, synopsis, genres, chapters, chaptersCount: chapters.length };
    }, slug);

    return {
      id: `komiktap-${slug}`,
      source: "komiktap",
      slug,
      title: detail.title,
      cover: detail.cover,
      synopsis: detail.synopsis,
      genres: detail.genres,
      rating: 0,
      chapters: detail.chaptersCount,
      chapterList: detail.chapters,
      status: "Ongoing",
    };
  } finally {
    await browser.close();
  }
}

export async function scrapeKomiktapChapterPagesPW(url: string): Promise<string[]> {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    const pages = await page.evaluate(() => {
      const imgs = document.querySelectorAll(".reading-content img, .chapter-content img, .page-img img");
      const srcs: string[] = [];
      imgs.forEach((img) => {
        const src = (img as HTMLImageElement).getAttribute("src") || (img as HTMLImageElement).getAttribute("data-src") || "";
        if (src && !srcs.includes(src)) srcs.push(src);
      });
      return srcs;
    });
    return pages;
  } finally {
    await browser.close();
  }
}
