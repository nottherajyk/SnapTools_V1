export default async function handler(req, res) {
  const { url, mode } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // Accept both full Pinterest URLs and pin IDs
  let pinUrl = url;
  if (/^\d+$/.test(url)) {
    pinUrl = `https://www.pinterest.com/pin/${url}/`;
  }

  // Validate it's a Pinterest URL
  if (!pinUrl.includes('pinterest.com') && !pinUrl.includes('pin.it')) {
    return res.status(400).json({ error: 'Not a valid Pinterest URL' });
  }

  // Ensure URL has trailing slash for Pinterest
  if (!pinUrl.endsWith('/')) pinUrl += '/';

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.pinterest.com/',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'same-origin',
  };

  try {
    // If mode=info, return JSON with image URLs
    if (mode === 'info') {
      const imageUrls = await extractPinImageUrls(pinUrl, headers);
      if (!imageUrls || imageUrls.length === 0) {
        return res.status(404).json({ error: 'No images found. The pin may be private or the URL is invalid.' });
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.json({ images: imageUrls });
    }

    // Default mode: proxy the highest-resolution image directly
    const imageUrls = await extractPinImageUrls(pinUrl, headers);
    if (!imageUrls || imageUrls.length === 0) {
      return res.status(404).json({ error: 'No images found. The pin may be private or the URL is invalid.' });
    }

    // Get the first (highest res) image
    const imageUrl = imageUrls[0].url;
    const imgResponse = await fetch(imageUrl, {
      headers: {
        'User-Agent': headers['User-Agent'],
        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        'Referer': 'https://www.pinterest.com/',
      },
      redirect: 'follow',
    });

    if (!imgResponse.ok) {
      return res.status(imgResponse.status).json({ error: 'Failed to fetch image from Pinterest' });
    }

    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
    const buffer = Buffer.from(await imgResponse.arrayBuffer());

    if (buffer.length < 1000) {
      return res.status(404).json({ error: 'Image too small or not found.' });
    }

    const disposition = req.query.download === '1' ? 'attachment' : 'inline';
    const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', buffer.length);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Disposition', `${disposition}; filename="pinterest-image.${ext}"`);
    res.send(buffer);
  } catch (error) {
    return res.status(500).json({ error: 'Server error: ' + error.message });
  }
}

async function extractPinImageUrls(pinUrl, headers) {
  const response = await fetch(pinUrl, {
    headers,
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Pinterest returned status ${response.status}`);
  }

  const html = await response.text();
  const images = [];

  // Strategy 1: Extract from JSON-LD structured data (most reliable for originals)
  const jsonLdMatches = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi);
  for (const m of jsonLdMatches) {
    try {
      const data = JSON.parse(m[1]);
      if (data.image) {
        const imgList = Array.isArray(data.image) ? data.image : [data.image];
        for (const img of imgList) {
          const imgUrl = typeof img === 'string' ? img : img?.url;
          if (imgUrl && imgUrl.includes('pinimg.com')) {
            images.push({ url: upgradeToOriginal(imgUrl), label: 'Original (JSON-LD)' });
          }
        }
      }
    } catch { /* skip invalid JSON */ }
  }

  // Strategy 2: Extract from og:image meta tag
  const ogMatch = html.match(/property="og:image"\s*content="([^"]+)"/i)
    || html.match(/content="([^"]+)"\s*property="og:image"/i);
  if (ogMatch && ogMatch[1].includes('pinimg.com')) {
    images.push({ url: upgradeToOriginal(ogMatch[1]), label: 'Original (OG)' });
  }

  // Strategy 3: Extract from inline __PWS_DATA__ or initial Redux state
  const statePatterns = [
    /"originals?":\s*\{\s*"(?:url|src)":\s*"([^"]+)"/gi,
    /"image_large_url":\s*"([^"]+)"/gi,
    /"images":\s*\{[^}]*"orig":\s*\{[^}]*"url":\s*"([^"]+)"/gi,
    /"(?:1200x|orig)":\s*\{[^}]*"url":\s*"([^"]+)"/gi,
  ];

  for (const pattern of statePatterns) {
    let m;
    while ((m = pattern.exec(html)) !== null) {
      let imgUrl = m[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
      if (imgUrl.includes('pinimg.com')) {
        images.push({ url: upgradeToOriginal(imgUrl), label: 'Original (State)' });
      }
    }
  }

  // Strategy 4: Broad pinimg.com URL extraction as fallback
  const pinimgPattern = /https?:\/\/i\.pinimg\.com\/[^\s"'<>]+/gi;
  let m;
  while ((m = pinimgPattern.exec(html)) !== null) {
    const cleaned = m[0].replace(/\\u002F/g, '/').replace(/\\\//g, '/');
    if (!cleaned.includes('75x75') && !cleaned.includes('70x70') && !cleaned.includes('avatars')) {
      images.push({ url: upgradeToOriginal(cleaned), label: 'Extracted' });
    }
  }

  // Deduplicate by URL
  const seen = new Set();
  const unique = [];
  for (const img of images) {
    if (!seen.has(img.url)) {
      seen.add(img.url);
      unique.push(img);
    }
  }

  // Sort: prefer "originals" path in URL
  unique.sort((a, b) => {
    const aOrig = a.url.includes('/originals/') ? 0 : 1;
    const bOrig = b.url.includes('/originals/') ? 0 : 1;
    return aOrig - bOrig;
  });

  return unique;
}

/**
 * Upgrade a Pinterest CDN image URL to the highest resolution available.
 * Pinterest stores images with size prefixes: 75x75, 236x, 474x, 564x, 736x, originals
 * We swap any of these for "originals" to get the full native resolution.
 */
function upgradeToOriginal(url) {
  return url.replace(
    /\/(?:75x75_\w*|136x136|170x|236x|474x|564x|600x315|736x|750x|sized)(?=\/)/,
    '/originals'
  );
}
