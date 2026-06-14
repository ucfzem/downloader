import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders());
    return res.end();
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const dlUrl = url.searchParams.get('url');
  if (!dlUrl) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders() });
    return res.end(JSON.stringify({ success: false, error: 'No URL provided' }));
  }

  try {
    const resp = await fetch(dlUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (!resp.ok) throw new Error('Download failed');
    const contentType = resp.headers.get('content-type') || 'application/octet-stream';
    const ext = contentType.includes('mp4') ? '.mp4' : contentType.includes('mp3') ? '.mp3' : '.bin';
    const buffer = await resp.buffer();
    res.writeHead(200, {
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="download${ext}"`,
      'Content-Length': buffer.length,
      ...corsHeaders(),
    });
    res.end(buffer);
  } catch {
    res.writeHead(400, { 'Content-Type': 'application/json', ...corsHeaders() });
    res.end(JSON.stringify({ success: false, error: 'Download failed' }));
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}
