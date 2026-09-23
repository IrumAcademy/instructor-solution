const API_BASE = 'https://api.vimeo.com';

async function fetchVideos(userId) {
  const token = process.env.VIMEO_ACCESS_TOKEN;
  if (!token) throw new Error('VIMEO_ACCESS_TOKEN env var is not set');

  const videos = [];
  let url = `${API_BASE}/users/${encodeURIComponent(userId)}/videos?per_page=50`;

  while (url) {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.vimeo.*+json;version=3.4',
      },
    });
    if (!res.ok) throw new Error(`Vimeo users.videos failed: ${res.status}`);
    const data = await res.json();

    for (const item of data.data || []) {
      const externalId = (item.uri || '').split('/').pop();
      if (!externalId) continue;
      const sizes = item.pictures?.sizes || [];
      videos.push({
        externalId,
        title: item.name || '',
        thumbnailUrl: sizes[sizes.length - 1]?.link || '',
        embedUrl: item.player_embed_url || `https://player.vimeo.com/video/${externalId}`,
      });
    }

    url = data.paging?.next ? `${API_BASE}${data.paging.next}` : null;
  }

  return videos;
}

module.exports = { fetchVideos };
