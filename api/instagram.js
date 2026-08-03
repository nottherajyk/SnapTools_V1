import dns from 'dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

export default async function handler(req, res) {
  const { shortcode, url, mode, download } = req.query;

  // 1. Direct proxy by media CDN URL
  if (url) {
    try {
      const decodedUrl = decodeURIComponent(url);
      if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
        return res.status(400).json({ error: 'Invalid media URL' });
      }

      const imgRes = await fetch(decodedUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          'Referer': 'https://www.instagram.com/',
          'Accept': 'image/webp,image/apng,image/*,video/*,*/*;q=0.8',
        },
      });

      if (!imgRes.ok) {
        return res.status(imgRes.status).json({ error: 'Failed to fetch media from CDN' });
      }

      const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
      const buffer = Buffer.from(await imgRes.arrayBuffer());

      const disposition = download === '1' ? 'attachment' : 'inline';
      const ext = contentType.includes('video') || contentType.includes('mp4') ? 'mp4' : 'jpg';

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Length', buffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Disposition', `${disposition}; filename="instagram-media.${ext}"`);
      return res.send(buffer);
    } catch (err) {
      return res.status(500).json({ error: 'Proxy error: ' + err.message });
    }
  }

  // Validate shortcode parameter
  if (!shortcode) {
    return res.status(400).json({ error: 'Missing shortcode or url parameter' });
  }

  if (!/^[A-Za-z0-9_-]+$/.test(shortcode)) {
    return res.status(400).json({ error: 'Invalid shortcode' });
  }

  try {
    // 2. Mode: info -> Return JSON metadata with array of ALL media items (single or carousel)
    if (mode === 'info') {
      const mediaItems = await fetchAllMediaItems(shortcode);
      if (!mediaItems || mediaItems.length === 0) {
        return res.status(404).json({ error: 'No media found for this post. It may be private or deleted.' });
      }

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.json({
        shortcode,
        count: mediaItems.length,
        media: mediaItems.map((m, idx) => ({
          id: idx + 1,
          type: m.type,
          proxyUrl: `/api/instagram?url=${encodeURIComponent(m.url)}`,
          originalUrl: m.url
        }))
      });
    }

    // 3. Fallback direct single image fetch
    const mediaUrl = `https://www.instagram.com/p/${shortcode}/media/?size=l`;
    const response = await fetch(mediaUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.instagram.com/',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'Failed to fetch from Instagram' });
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await response.arrayBuffer());

    if (buffer.length < 1000) {
      return res.status(404).json({ error: 'No image found. Post may be private.' });
    }

    const disposition = download === '1' ? 'attachment' : 'inline';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Disposition', `${disposition}; filename="instagram-${shortcode}.jpg"`);
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

/**
 * Extract all media items (photos & videos) for an Instagram post shortcode
 */
async function fetchAllMediaItems(shortcode) {
  const mediaList = [];
  const embedUrl = `https://www.instagram.com/p/${shortcode}/embed/captioned/`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (res.ok) {
      const html = await res.text();

      // Extract display_url matches from Embed JSON
      const rawDisplayUrls = [...html.matchAll(/\\?"display_url\\?":\s*\\?"([^"]+)\\?"/g)]
        .map(m => m[1].replace(/\\u0026/g, '&').replace(/\\\\\//g, '/').replace(/\\\//g, '/'));

      const rawVideoUrls = [...html.matchAll(/\\?"video_url\\?":\s*\\?"([^"]+)\\?"/g)]
        .map(m => m[1].replace(/\\u0026/g, '&').replace(/\\\\\//g, '/').replace(/\\\//g, '/'));

      // Deduplicate display_urls while preserving slide sequence
      const uniqueDisplay = [];
      for (const u of rawDisplayUrls) {
        if (!uniqueDisplay.includes(u)) {
          uniqueDisplay.push(u);
        }
      }

      const uniqueVideos = [...new Set(rawVideoUrls)];

      uniqueVideos.forEach(url => {
        mediaList.push({ type: 'video', url });
      });

      uniqueDisplay.forEach(url => {
        mediaList.push({ type: 'image', url });
      });
    }
  } catch {
    // Ignore timeout and fallback to media endpoint
  }

  if (mediaList.length === 0) {
    mediaList.push({
      type: 'image',
      url: `https://www.instagram.com/p/${shortcode}/media/?size=l`
    });
  }

  return mediaList;
}
