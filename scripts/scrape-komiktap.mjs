import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://komiktap.info";

function cleanTitle(text) {
  let t = text.split(/chapter/i)[0].trim();
  t = t.replace(/^(completed|ongoing)\s*/i, "").trim();
  return t;
}

async function scrapeList() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });
  await page.goto(`${BASE}/list-manga/`, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
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
      results.push({ slug, text, cover });
    });
    return results;
  }, BASE);
  await browser.close();
  return items;
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
          // Exclude known non-content images
          const lower = src.toLowerCase();
          if (lower.includes("logo") || lower.includes("banner") || lower.includes(".gif") || lower.includes("gravatar") || lower.includes("cdnfgo") || lower.includes("cdnasu") || lower.includes("pixel.onaudience") || lower.includes("komiktap-light") || lower.includes("sizes=auto")) return false;
          // Keep images with valid extensions
          return /\.(jpg|jpeg|png|webp|avif)(?:[?#].*)?$/i.test(src);
        });
    });
    return pages;
  } finally {
    await browser.close();
  }
}

async function scrapeDetail(slug) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
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
      document.querySelectorAll(".genres a, .genre a, .category a").forEach((g) => {
        const n = (g.textContent || "").trim();
        if (n) genres.push(n);
      });
      const chapters = [];
      const seenChapters = new Set();
      document.querySelectorAll("a[href*='-chapter-']").forEach((a) => {
        const href = a.getAttribute("href") || "";
        // skip "Latest" links from sidebar
        if (a.closest(".sidebar, .widget, .latest-update")) return;
        const title = (a.textContent || "").trim();
        const m = href.match(/-chapter-(\d+)/) || (title && title.match(/chapter\s*(\d+)/i));
        const num = m ? Number(m[1]) : 0;
        if (num && !seenChapters.has(num)) {
          seenChapters.add(num);
          chapters.push({ num, title: `Chapter ${num}`, url: href });
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

const LIMIT = Number(process.env.SCRAPE_LIMIT || 10);

(async () => {
  console.log("Fetching komiktap list...");
  const list = await scrapeList();
  console.log(`Found ${list.length} entries. Detail scraping first ${LIMIT}...`);
  const out = [];
  for (const item of list.slice(0, LIMIT)) {
    try {
      const d = await scrapeDetail(item.slug);
      const title = cleanTitle(d.title || item.text);
      const chaptersWithPages = [];
      for (const c of d.chapters.slice(0, 3)) {
        try {
          const pages = await scrapeChapterPages(c.url);
          chaptersWithPages.push({ num: c.num, title: c.title, url: c.url, pages });
          console.log(`    ch ${c.num}: ${pages.length} pages`);
        } catch (e) {
          chaptersWithPages.push({ num: c.num, title: c.title, url: c.url, pages: [] });
        }
      }
      out.push({
        id: `komiktap-${item.slug}`,
        source: "komiktap",
        slug: item.slug,
        title,
        cover: d.cover || item.cover,
        synopsis: d.synopsis || "",
        genres: d.genres || [],
        rating: 0,
        chapters: d.chapters.length || 0,
        status: "Ongoing",
        updated: "",
        chapterList: chaptersWithPages,
      });
      console.log(`  ok: ${title}`);
    } catch (e) {
      console.log(`  fail ${item.slug}: ${e.message}`);
    }
  }
  const dir = path.join(process.cwd(), "public", "data");
  fs.mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "komiktap.json");
  fs.writeFileSync(file, JSON.stringify({ ok: true, count: out.length, data: out }, null, 2));
  // Also write to src/data so serverless functions can bundle it
  const dir2 = path.join(process.cwd(), "src", "data");
  fs.mkdirSync(dir2, { recursive: true });
  fs.writeFileSync(path.join(dir2, "komiktap.json"), JSON.stringify({ ok: true, count: out.length, data: out }, null, 2));
  console.log(`Saved ${out.length} manga -> ${file} + src/data/komiktap.json`);
})().catch((e) => {
  console.error("ERROR:", e.message);
  process.exit(1);
});
