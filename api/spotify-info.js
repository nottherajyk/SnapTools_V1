import dns from 'dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch {}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.query;
  if (!url) {
    return res.status(400).json({ error: 'Missing Spotify URL' });
  }

  try {
    const match = url.match(/(?:playlist|album|track)\/([a-zA-Z0-9]+)/i);
    if (!match) {
      return res.status(400).json({ error: 'Invalid Spotify link. Please provide a valid Spotify Playlist, Album, or Track URL.' });
    }

    const id = match[1];
    let type = 'playlist';
    if (url.includes('/album/')) type = 'album';
    else if (url.includes('/track/')) type = 'track';

    const embedUrl = `https://open.spotify.com/embed/${type}/${id}`;
    const fetchRes = await fetch(embedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!fetchRes.ok) {
      return res.status(404).json({ error: `Spotify embed request failed with status ${fetchRes.status}. The playlist may be private or deleted.` });
    }

    const html = await fetchRes.text();
    const marker = '<script id="__NEXT_DATA__" type="application/json">';
    const startIdx = html.indexOf(marker);

    if (startIdx === -1) {
      return res.status(500).json({ error: 'Failed to extract Spotify data structure from response.' });
    }

    const jsonStart = startIdx + marker.length;
    const jsonEnd = html.indexOf('</script>', jsonStart);
    if (jsonEnd === -1) {
      return res.status(500).json({ error: 'Malformed Spotify metadata in page.' });
    }

    const rawJson = html.slice(jsonStart, jsonEnd);
    const parsedData = JSON.parse(rawJson);

    const entity = parsedData?.props?.pageProps?.state?.data?.entity;
    if (!entity) {
      return res.status(404).json({ error: 'Spotify entity details not found.' });
    }

    const playlistTitle = entity.title || entity.name || 'Spotify Playlist';
    const playlistSubtitle = entity.subtitle || (entity.artists ? entity.artists.map(a => a.name).join(', ') : 'Spotify');
    const defaultCover = entity.coverArt?.sources?.[0]?.url || entity.visualIdentity?.image?.[0]?.url || entity.images?.[0]?.url || '';

    let rawTrackList = [];
    if (type === 'track') {
      rawTrackList = [entity];
    } else if (Array.isArray(entity.trackList)) {
      rawTrackList = entity.trackList;
    }

    const tracks = rawTrackList.map((t, idx) => {
      const title = t.title || t.name || `Track ${idx + 1}`;
      const artist = t.subtitle || (t.artists ? t.artists.map(a => a.name).join(', ') : 'Unknown Artist');
      const durationSec = t.duration ? Math.round(t.duration / 1000) : 0;
      const mins = Math.floor(durationSec / 60);
      const secs = (durationSec % 60).toString().padStart(2, '0');
      const coverArt = t.coverArt?.sources?.[0]?.url || t.visualIdentity?.image?.[0]?.url || defaultCover;
      const previewUrl = t.audioPreview?.url || t.preview_url || '';

      return {
        id: t.id || t.uri || `track-${idx}`,
        title,
        artist,
        duration: durationSec,
        durationFormatted: `${mins}:${secs}`,
        previewUrl,
        coverArt
      };
    });

    return res.status(200).json({
      type,
      id,
      title: playlistTitle,
      subtitle: playlistSubtitle,
      coverArt: defaultCover,
      totalTracks: tracks.length,
      tracks
    });

  } catch (err) {
    console.error('Spotify Info API Error:', err);
    return res.status(500).json({ error: 'Failed to process Spotify link: ' + err.message });
  }
}
