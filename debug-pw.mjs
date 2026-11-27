import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
  });
  await page.goto("https://komiktap.info/list-manga/", { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(3000);
  const html = await page.content();
  console.log("HTML length:", html.length);
  // find manga links
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("a[href*='/manga/']")).slice(0, 5).map(a => ({ href: a.getAttribute("href"), text: a.textContent?.trim().slice(0, 40) }));
  });
  console.log("manga links:", JSON.stringify(links));
  // print page title
  console.log("title:", await page.title());
  await browser.close();
})().catch(e => console.error("ERR:", e.message));
