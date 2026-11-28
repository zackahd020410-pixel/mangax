// Cloudflare Worker - Jikan API Proxy
// Deploy via: npx wrangler deploy

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname + url.search;

    // Only allow /api/* paths
    if (!path.startsWith("/api/")) {
      return new Response("Not found", { status: 404 });
    }

    // Forward to Jikan API
    const jikanUrl = `https://api.jikan.moe/v4${path.replace("/api", "")}`;

    const res = await fetch(jikanUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; MangaX-Proxy/1.0)",
        "Accept": "application/json",
      },
    });

    const body = await res.text();
    const headers = new Headers(res.headers);
    headers.set("Access-Control-Allow-Origin", "*");
    headers.set("Access-Control-Allow-Methods", "GET, OPTIONS");
    headers.set("Access-Control-Allow-Headers", "Content-Type");
    headers.set("Cache-Control", "public, max-age=300");

    return new Response(body, {
      status: res.status,
      headers,
    });
  },
};