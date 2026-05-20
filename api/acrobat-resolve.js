export default async function handler(req, res) {
  // Set CORS headers so standard client fetches work during local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'Missing Adobe Acrobat URL' });
  }

  try {
    // 1. Extract URN using regex
    // Supports:
    // https://acrobat.adobe.com/link/track?uri=urn:aaid:scds:US:a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d
    // https://acrobat.adobe.com/link/review?uri=urn:aaid:scds:US:...
    // https://acrobat.adobe.com/id/urn:aaid:scds:US:...
    const urnMatch = url.match(/urn:aaid:scds:[a-zA-Z0-9:-]+/);
    if (!urnMatch) {
      return res.status(400).json({ error: 'Invalid Adobe Acrobat URL. Could not find document identifier.' });
    }

    const urn = urnMatch[0];

    // 2. Fetch the direct SCDS download endpoint
    // Adobe uses key "AcrobatWeb1" to fetch metadata and downloads from SCDS
    const downloadApiUrl = `https://send-api.acrobat.com/v1/assets/${urn}/download?api_key=AcrobatWeb1`;
    
    // We fetch it without manual redirect handling first so we can grab the pre-signed S3 URL from response.url
    const response = await fetch(downloadApiUrl, {
      method: 'GET',
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: `Failed to resolve file from Adobe Cloud (Status: ${response.status})` 
      });
    }

    // 3. Extract metadata
    const s3Url = response.url; // The resolved S3 direct URL after redirect
    const contentType = response.headers.get('content-type') || 'application/pdf';
    const contentLength = response.headers.get('content-length') || '0';
    
    // Extract filename from Content-Disposition if present
    const contentDisposition = response.headers.get('content-disposition') || '';
    let fileName = 'document.pdf';
    const filenameMatch = contentDisposition.match(/filename\*?=["']?([^"';]+)["']?/);
    if (filenameMatch && filenameMatch[1]) {
      fileName = decodeURIComponent(filenameMatch[1].replace(/UTF-8''/i, ''));
    } else {
      // Fallback: try to get it from the URL or query parameters
      const urlObj = new URL(s3Url);
      const pathSegments = urlObj.pathname.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment.includes('.')) {
        fileName = decodeURIComponent(lastSegment);
      }
    }

    // Return successfully resolved metadata
    return res.status(200).json({
      success: true,
      urn,
      downloadUrl: s3Url,
      fileName,
      fileSize: parseInt(contentLength, 10),
      contentType
    });

  } catch (error) {
    console.error('Error resolving Acrobat Link:', error);
    return res.status(500).json({ 
      error: `Internal Server Error resolving link: ${error.message}` 
    });
  }
}
