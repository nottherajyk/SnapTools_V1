import play from 'play-dl';
import dns from 'dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { title, artist, ytUrl } = req.query;

  if (!title && !ytUrl) {
    return res.status(400).json({ error: 'Missing track title or YouTube URL' });
  }

  try {
    let targetUrl = ytUrl;

    if (!targetUrl) {
      const query = `${title} ${artist || ''} official audio`.trim();
      const results = await play.search(query, { limit: 1, source: { youtube: 'video' } });
      
      if (!results || results.length === 0) {
        // Retry with a slightly broader query
        const fallbackResults = await play.search(`${title} ${artist || ''}`.trim(), { limit: 1, source: { youtube: 'video' } });
        if (!fallbackResults || fallbackResults.length === 0) {
          return res.status(404).json({ error: `Could not find audio for "${title} - ${artist}" on YouTube.` });
        }
        targetUrl = fallbackResults[0].url;
      } else {
        targetUrl = results[0].url;
      }
    }

    const info = await play.video_info(targetUrl);
    const audioFormats = info.format.filter(f => !f.qualityLabel && f.audioQuality);

    if (!audioFormats || audioFormats.length === 0) {
      return res.status(404).json({ error: 'No audio streams available for this track.' });
    }

    // Pick highest bitrate stream
    audioFormats.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
    const bestAudio = audioFormats[0];

    const cleanTitle = (title || info.video_details.title || 'song').replace(/[^a-zA-Z0-9 _-]/g, '').trim();
    const cleanArtist = (artist || '').replace(/[^a-zA-Z0-9 _-]/g, '').trim();
    const filename = cleanArtist ? `${cleanTitle} - ${cleanArtist}.m4a` : `${cleanTitle}.m4a`;

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'audio/mp4');

    const streamInfo = await play.stream(targetUrl, { quality: bestAudio.itag });
    if (streamInfo.content_length) {
      res.setHeader('Content-Length', streamInfo.content_length);
    }

    streamInfo.stream
      .on('error', (streamErr) => {
        console.error('Spotify Audio Stream Error:', streamErr);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Audio stream interrupted.' });
        } else {
          res.end();
        }
      })
      .pipe(res);

  } catch (err) {
    console.error('Spotify Download API Error:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to download track: ' + err.message });
    }
  }
}
