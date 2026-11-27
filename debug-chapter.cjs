const { chromium } = require("playwright");
const fs = require("fs");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });
  await page.goto("https://komiktap.info/sensei-ni-zenbu-dashi-nasai-muchimuchi-hitodzuma-kyoshi-ni-yowami-o-nigira-re-shiboritora-reru-kyokon-shi-%e2%97%8b-ta-chapter-1/", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(3000);
  const html = await page.content();
  fs.writeFileSync("debug-chapter.html", html);
  // Find all img srcs
  const allImgs = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("img")).map(img => img.getAttribute("src") || "").filter(Boolean);
  });
  console.log("Total imgs:", allImgs.length);
  // Filter for non-banner images
  const pageImgs = allImgs.filter(src => !src.includes("logo") && !src.includes("banner") && !src.includes("gif") && !src.includes("cdnfgo") && !src.includes("cdnasu"));
  console.log("Page imgs:", pageImgs.length);
  pageImgs.forEach(s => console.log(s));
  await browser.close();
})().catch(e => console.error("ERR:", e.message));
