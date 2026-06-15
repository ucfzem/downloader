import fetch from 'node-fetch';
import instagramGetUrl from 'instagram-url-direct';

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
    const { url: mediaUrl, platform } = req.body;
    if (!mediaUrl) throw new Error('No URL provided');

    if (platform === 'tiktok' || /tiktok\.com/.test(mediaUrl)) {
      return await handleTikTok(mediaUrl, res);
    } else if (platform === 'instagram' || /instagram\.com/.test(mediaUrl)) {
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
  const fullUrl = (p) => p.startsWith('http') ? p : 'https://www.tikwm.com' + p;
  res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders() });
  res.end(JSON.stringify({
    success: true,
    platform: 'TikTok',
    title: d.title || 'TikTok Video',
    cover: d.cover,
    author: d.author?.nickname || '',
    downloads: [
      { label: 'No Watermark (MP4)', url: fullUrl(d.play) },
      { label: 'With Watermark (MP4)', url: fullUrl(d.wmplay) },
      { label: 'Audio (MP3)', url: fullUrl(d.music) },
    ],
  }));
}

async function handleInstagram(mediaUrl, res) {
  try {
    const result = await instagramGetUrl(mediaUrl);
    if (!result || !result.url_list || result.url_list.length === 0) {
      throw new Error('No media found');
    }
    res.writeHead(200, { 'Content-Type': 'application/json', ...corsHeaders() });
    res.end(JSON.stringify({
      success: true,
      platform: 'Instagram',
      title: 'Instagram Media',
      downloads: result.url_list.map((url, i) => ({
        label: url.includes('.mp4') ? `Video ${i + 1}` : `Photo ${i + 1}`,
        url,
      })),
    }));
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders() });
    res.end(JSON.stringify({ success: false, error: 'Could not fetch Instagram media. Check the link.' }));
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
