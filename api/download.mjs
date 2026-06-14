import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json', ...corsHeaders() });
    return res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
  }

  try {
    const { url: mediaUrl } = req.body;
    if (!mediaUrl) throw new Error('No URL provided');

    if (/tiktok\.com/.test(mediaUrl)) {
      return await handleTikTok(mediaUrl, res);
    } else if (/instagram\.com/.test(mediaUrl)) {
      return await handleInstagram(mediaUrl, res);
    } else {
      throw new Error('Unsupported platform. Use TikTok or Instagram links.');
    }
  } catch (e) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders() });
    res.end(JSON.stringify({ success: false, error: e.message }));
  }
}

async function handleTikTok(mediaUrl, res) {
  const apiUrl = `https://www.tikwm.com/api/?url=${encodeURIComponent(mediaUrl)}&hd=1`;
  const response = await fetch(apiUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const data = await response.json();

  if (data.code !== 0 || !data.data) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders() });
    return res.end(JSON.stringify({ success: false, error: 'Could not fetch TikTok video. Check the link.' }));
  }

  const d = data.data;
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders() });
  res.end(JSON.stringify({
    success: true,
    platform: 'TikTok',
    title: d.title || 'TikTok Video',
    cover: d.cover,
    author: d.author?.nickname || '',
    downloads: [
      { label: 'No Watermark (MP4)', url: `https://www.tikwm.com${d.play}` },
      { label: 'With Watermark (MP4)', url: `https://www.tikwm.com${d.wmplay}` },
      { label: 'Audio (MP3)', url: `https://www.tikwm.com${d.music}` },
    ],
  }));
}

async function handleInstagram(mediaUrl, res) {
  const apiUrl = 'https://api.instasave.website/api/ajaxSearch';
  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Mozilla/5.0',
    },
    body: `q=${encodeURIComponent(mediaUrl)}&t=media&lang=en`,
  });

  const json = await response.json();
  if (!json.data) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders() });
    return res.end(JSON.stringify({ success: false, error: 'Could not fetch Instagram media. Check the link.' }));
  }

  const html = json.data;
  const links = [...html.matchAll(/href="([^"]+)"[^>]*>.*?(Download|Video|Photo)/gi)]
    .map(m => m[1])
    .filter(href => href.startsWith('http'));

  if (links.length === 0) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders() });
    return res.end(JSON.stringify({ success: false, error: 'No downloadable media found.' }));
  }

  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders() });
  res.end(JSON.stringify({
    success: true,
    platform: 'Instagram',
    title: 'Instagram Media',
    downloads: links.map((link, i) => ({ label: `Media ${i + 1}`, url: link })),
  }));
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
