export default {
  async fetch(request) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);

    if (url.pathname === "/api/download" && request.method === "POST") {
      try {
        const { url: mediaUrl } = await request.json();
        if (!mediaUrl) return jsonError("No URL provided");

        if (/tiktok\.com/.test(mediaUrl)) {
          return await handleTikTok(mediaUrl);
        } else if (/instagram\.com/.test(mediaUrl)) {
          return await handleInstagram(mediaUrl);
        } else {
          return jsonError("Unsupported platform. Use TikTok or Instagram links.");
        }
      } catch (e) {
        return jsonError("Server error: " + e.message);
      }
    }

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML, {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    }

    return new Response("Not found", { status: 404 });
  },
};

async function handleTikTok(mediaUrl) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(mediaUrl)}&hd=1`;
  const res = await fetch(apiUrl, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  const data = await res.json();

  if (data.code !== 0 || !data.data) {
    return jsonError("Could not fetch TikTok video. Check the link.");
  }

  const d = data.data;
  const fullUrl = (p) => p.startsWith('http') ? p : 'https://www.tikwm.com' + p;
  return jsonOk({
    platform: "TikTok",
    title: d.title || "TikTok Video",
    cover: d.cover,
    author: d.author?.nickname || "",
    downloads: [
      { label: "No Watermark (MP4)", url: fullUrl(d.play) },
      { label: "With Watermark (MP4)", url: fullUrl(d.wmplay) },
      { label: "Audio (MP3)", url: fullUrl(d.music) },
    ],
  });
}

async function handleInstagram(mediaUrl) {
  const apiUrl = `https://api.instasave.website/api/ajaxSearch`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0",
    },
    body: `q=${encodeURIComponent(mediaUrl)}&t=media&lang=en`,
  });

  const json = await res.json();
  if (!json.data) return jsonError("Could not fetch Instagram media. Check the link.");

  const html = json.data;
  const links = [...html.matchAll(/href="([^"]+)"[^>]*>.*?(Download|Video|Photo)/gi)]
    .map((m) => m[1])
    .filter((href) => href.startsWith("http"));

  if (links.length === 0) return jsonError("No downloadable media found.");

  return jsonOk({
    platform: "Instagram",
    title: "Instagram Media",
    downloads: links.map((link, i) => ({
      label: `Media ${i + 1}`,
      url: link,
    })),
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonOk(obj) {
  return new Response(JSON.stringify({ success: true, ...obj }), {
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function jsonError(msg) {
  return new Response(JSON.stringify({ success: false, error: msg }), {
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}
