import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://komiktap.info";

function cleanTitle(text) {
  let t = text.split(/chapter/i)[0].trim();
  t = t.replace(/^(completed|ongoing)\s*/i, "").trim();
  return t;
}

async function scrapeListPage(pageNum) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });
  const url = pageNum === 1 ? `${BASE}/list-manga/` : `${BASE}/list-manga/page/${pageNum}/`;
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(2000);
  const items = await page.evaluate((base) => {
    const results = [];
    const seen = new Set();
    document.querySelectorAll("a[href*='/manga/']").forEach((a) => {
      const href = a.getAttribute("href") || "";
      if (href.endsWith("/manga/") || href.includes("/manga/?")) return;
      if (seen.has(href)) return;
      seen.add(href);
      const slug = href.replace(base, "").replace(/\/$/, "").split("/manga/")[1];
      if (!slug) return;
      const text = (a.textContent || "").trim();
      const img = a.querySelector("img");
      const cover = (img && (img.getAttribute("src") || img.getAttribute("data-src"))) || "";
      // extract chapter count from text like "Chapter: 82 End"
      const chMatch = text.match(/chapter[:\s]*(\d+)/i);
      const chapters = chMatch ? Number(chMatch[1]) : 0;
      const status = /end/i.test(text) ? "Completed" : "Ongoing";
      results.push({ slug, text, cover, chapters, status });
    });
    return results;
  }, BASE);
  await browser.close();
  return items;
}

async function scrapeDetail(slug) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });
  try {
    await page.goto(`${BASE}/manga/${slug}/`, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2000);
    const d = await page.evaluate(() => {
      const t = document.querySelector("h1.entry-title, h1.post-title, h1")?.textContent?.trim() || "";
      const coverEl = document.querySelector(".poster img, .poster-img img");
      const cover =
        (coverEl && (coverEl.getAttribute("src") || coverEl.getAttribute("data-src"))) ||
        document.querySelector("meta[property='og:image']")?.getAttribute("content") ||
        "";
      const synopsis = document.querySelector(".summary, .synopsis, .entry-content")?.textContent?.trim() || "";
      const genres = [];
      document.querySelectorAll(".genres a, .genre a, .category a, a[href*='/genres/']").forEach((g) => {
        const n = (g.textContent || "").trim();
        if (n && !genres.includes(n)) genres.push(n);
      });
      const chapters = [];
      const seenChapters = new Set();
      document.querySelectorAll("a[href*='-chapter-']").forEach((a) => {
        const href = a.getAttribute("href") || "";
        if (a.closest(".sidebar, .widget, .latest-update")) return;
        const title = (a.textContent || "").trim();
        const m = href.match(/-chapter-(\d+)/) || (title && title.match(/chapter\s*(\d+)/i));
        const num = m ? Number(m[1]) : 0;
        if (num && !seenChapters.has(num)) {
          seenChapters.add(num);
          chapters.push({ num, title: `Chapter ${num}`, url: href, pages: [] });
        }
      });
      chapters.sort((a, b) => b.num - a.num);
      return { title: t, cover, synopsis, genres, chapters };
    });
    return d;
  } finally {
    await browser.close();
  }
}

async function scrapeChapterPages(url) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });
  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2000);
    const pages = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs
        .map(img => img.getAttribute("src") || img.getAttribute("data-src") || "")
        .filter(src => {
          if (!src) return false;
          const lower = src.toLowerCase();
          if (lower.includes("logo") || lower.includes("banner") || lower.includes(".gif") || lower.includes("gravatar") || lower.includes("cdnfgo") || lower.includes("cdnasu") || lower.includes("pixel.onaudience") || lower.includes("komiktap-light") || lower.includes("sizes=auto")) return false;
          return /\.(jpg|jpeg|png|webp|avif)(?:[?#].*)?$/i.test(src);
        });
    });
    return pages;
  } finally {
    await browser.close();
  }
}

const SCRAPE_PAGES = Number(process.env.SCRAPE_PAGES || 1);
const SCRAPE_WITH_PAGES = Number(process.env.SCRAPE_WITH_PAGES || 0); // how many manga get chapter pages scraped

(async () => {
  const allItems = [];
  for (let p = 1; p <= SCRAPE_PAGES; p++) {
    console.log(`Fetching list page ${p}...`);
    const items = await scrapeListPage(p);
    console.log(`  found ${items.length} entries`);
    allItems.push(...items);
  }
  // dedupe by slug
  const seen = new Set();
  const unique = allItems.filter(it => {
    const slug = it.slug;
    if (seen.has(slug)) return false;
    seen.add(slug);
    return true;
  });
  console.log(`Total unique: ${unique.length}`);

  const out = [];
  for (let i = 0; i < unique.length; i++) {
    const item = unique[i];
    try {
      const d = await scrapeDetail(item.slug);
      const title = cleanTitle(d.title || item.text);
      const chapters = (d.chapters && d.chapters.length > 0) ? d.chapters : [];
      // scrape pages only for first SCRAPE_WITH_PAGES manga
      if (SCRAPE_WITH_PAGES > 0 && i < SCRAPE_WITH_PAGES) {
        for (const c of chapters.slice(0, 1)) {
          try {
            const pages = await scrapeChapterPages(c.url);
            c.pages = pages;
            console.log(`    ch ${c.num}: ${pages.length} pages`);
          } catch (e) {
            c.pages = [];
          }
        }
      } else {
        chapters.forEach(c => (c.pages = []));
      }
      out.push({
        id: `komiktap-${item.slug}`,
        source: "komiktap",
        slug: item.slug,
        title,
        cover: d.cover || item.cover,
        synopsis: d.synopsis || "",
        genres: d.genres && d.genres.length > 0 ? d.genres : (item.text.match(/genre/i) ? [] : []),
        rating: 0,
        chapters: chapters.length > 0 ? chapters.length : item.chapters,
        status: d.status || item.status || "Ongoing",
        updated: "",
        chapterList: chapters,
      });
      console.log(`  ok: ${title}`);
      // incremental save after each manga
      const d1 = path.join(process.cwd(), "public", "data");
      fs.mkdirSync(d1, { recursive: true });
      fs.writeFileSync(path.join(d1, "komiktap.json"), JSON.stringify({ ok: true, count: out.length, data: out }, null, 2));
    } catch (e) {
      // fallback to metadata-only
      out.push({
        id: `komiktap-${item.slug}`,
        source: "komiktap",
        slug: item.slug,
        title: cleanTitle(item.text),
        cover: item.cover,
        synopsis: "",
        genres: [],
        rating: 0,
        chapters: item.chapters,
        status: item.status,
        updated: "",
        chapterList: [],
      });
      console.log(`  fail ${item.slug}: ${e.message}`);
    }
  }
  const dir = path.join(process.cwd(), "public", "data");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "komiktap.json");
  fs.writeFileSync(file, JSON.stringify({ ok: true, count: out.length, data: out }, null, 2));
  const dir2 = path.join(process.cwd(), "src", "data");
  fs.mkdirSync(dir2, { recursive: true });
  fs.writeFileSync(path.join(dir2, "komiktap.json"), JSON.stringify({ ok: true, count: out.length, data: out }, null, 2));
  console.log(`Saved ${out.length} manga -> ${file} + src/data/komiktap.json`);
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
