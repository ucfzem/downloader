addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
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
  if (url.pathname === "/api/dl") {
    const dlUrl = url.searchParams.get("url");
    if (!dlUrl) return jsonError("No URL provided");
    return await proxyDownload(dlUrl);
  }
  if (url.pathname === "/" || url.pathname === "/index.html") {
    return new Response(HTML, {
      headers: { "Content-Type": "text/html;charset=UTF-8" },
    });
  }
  return new Response("Not found", { status: 404 });
}

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

async function proxyDownload(dlUrl) {
  try {
    const resp = await fetch(dlUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!resp.ok) return jsonError("Download failed");
    const contentType = resp.headers.get("Content-Type") || "application/octet-stream";
    const ext = contentType.includes("mp4") ? ".mp4" : contentType.includes("mp3") ? ".mp3" : ".bin";
    const body = await resp.arrayBuffer();
    return new Response(body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="download${ext}"`,
        "Content-Length": body.byteLength,
        ...corsHeaders(),
      },
    });
  } catch {
    return jsonError("Download failed");
  }
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


const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>UCF ZEM Downloader</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Segoe UI',sans-serif; }
  body { background:#0f0f1a; color:#fff; min-height:100vh; display:flex; flex-direction:column; align-items:center; padding:2rem 1rem; }
  h1 { font-size:1.6rem; margin-bottom:0.5rem; background:linear-gradient(90deg,#ff0050,#00f2ea); -webkit-background-clip:text; background-clip:text; color:transparent; }
  p.sub { color:#999; margin-bottom:2rem; text-align:center; font-size:0.9rem; }
  .box { width:100%; max-width:480px; background:#1a1a2e; border-radius:16px; padding:1.5rem; box-shadow:0 8px 30px rgba(0,0,0,0.4); }
  input { width:100%; padding:0.9rem; border-radius:10px; border:1px solid #333; background:#0f0f1a; color:#fff; font-size:1rem; margin-bottom:1rem; }
  button { width:100%; padding:0.9rem; border:none; border-radius:10px; background:linear-gradient(90deg,#ff0050,#00f2ea); color:#000; font-weight:600; font-size:1rem; cursor:pointer; }
  button:disabled { opacity:0.6; }
  .result { margin-top:1.5rem; }
  .result img { width:100%; border-radius:10px; margin-bottom:1rem; }
  .dl-link { display:block; background:#252540; padding:0.8rem; border-radius:10px; margin-bottom:0.6rem; text-decoration:none; color:#00f2ea; text-align:center; font-weight:500; }
  .error { color:#ff5f5f; margin-top:1rem; text-align:center; }
  .loading { text-align:center; margin-top:1rem; color:#999; }
</style>
</head>
<body>
<h1>UCF ZEM Downloader</h1>
<p class="sub">Paste a TikTok or Instagram link below</p>
<div class="box">
  <input type="text" id="urlInput" placeholder="Paste video link here...">
  <button id="dlBtn" onclick="fetchMedia()">Get Download Links</button>
  <div id="output"></div>
</div>

<script>
async function fetchMedia() {
  const url = document.getElementById('urlInput').value.trim();
  const output = document.getElementById('output');
  const btn = document.getElementById('dlBtn');
  if (!url) return;

  btn.disabled = true;
  output.innerHTML = '<div class="loading">Fetching...</div>';

  try {
    const res = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();

    if (!data.success) {
      output.innerHTML = '<div class="error">' + data.error + '</div>';
      return;
    }

    let html = '<div class="result">';
    if (data.cover) html += '<img src="' + data.cover + '">';
    if (data.title) html += '<p style="margin-bottom:1rem;">' + data.title + '</p>';
    data.downloads.forEach(d => {
      html += '<a class="dl-link" href="/api/dl?url=' + encodeURIComponent(d.url) + '" target="_blank">' + d.label + '</a>';
    });
    html += '</div>';
    output.innerHTML = html;
  } catch (e) {
    output.innerHTML = '<div class="error">Error: ' + e.message + '</div>';
  } finally {
    btn.disabled = false;
  }
}
</script>
</body>
</html>
`;
