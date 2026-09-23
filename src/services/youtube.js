const API_BASE = 'https://www.googleapis.com/youtube/v3';

async function fetchVideos(channelId) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) throw new Error('YOUTUBE_API_KEY env var is not set');

  const channelUrl = `${API_BASE}/channels?part=contentDetails&id=${encodeURIComponent(channelId)}&key=${apiKey}`;
  const channelRes = await fetch(channelUrl);
  if (!channelRes.ok) throw new Error(`YouTube channels.list failed: ${channelRes.status}`);
  const channelData = await channelRes.json();
  const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error(`No uploads playlist found for channel ${channelId}`);

  const videos = [];
  let pageToken = '';
  do {
    const playlistUrl =
      `${API_BASE}/playlistItems?part=snippet&maxResults=50&playlistId=${uploadsPlaylistId}` +
      `&key=${apiKey}${pageToken ? `&pageToken=${pageToken}` : ''}`;
    const playlistRes = await fetch(playlistUrl);
    if (!playlistRes.ok) throw new Error(`YouTube playlistItems.list failed: ${playlistRes.status}`);
    const playlistData = await playlistRes.json();

    for (const item of playlistData.items || []) {
      const videoId = item.snippet?.resourceId?.videoId;
      if (!videoId) continue;
      videos.push({
        externalId: videoId,
        title: item.snippet.title || '',
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
      });
    }
    pageToken = playlistData.nextPageToken || '';
  } while (pageToken);

  return videos;
}

module.exports = { fetchVideos };
