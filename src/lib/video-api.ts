// Real integration for GET /api/videos (issue #2 API spec, public, no auth).
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://instructor-solution-api.irumacademy.workers.dev";

export type VideoProvider = "youtube" | "vimeo";

export type Video = {
  id: string;
  provider: VideoProvider;
  externalId: string;
  title: string;
  thumbnailUrl: string;
  courseId: string;
};

// YouTube video IDs and Vimeo video IDs are both short alphanumeric tokens.
// Validating this shape lets us build the iframe src ourselves instead of
// trusting whatever string the API returns in an `embedUrl` field.
const EXTERNAL_ID_PATTERN: Record<VideoProvider, RegExp> = {
  youtube: /^[\w-]{6,20}$/,
  vimeo: /^\d{4,15}$/,
};

export function embedUrlFor(video: Pick<Video, "provider" | "externalId">): string {
  return video.provider === "youtube"
    ? `https://www.youtube.com/embed/${video.externalId}`
    : `https://player.vimeo.com/video/${video.externalId}`;
}

function isValidVideo(v: unknown): v is Video {
  if (typeof v !== "object" || v === null) return false;
  const r = v as Record<string, unknown>;
  if (r.provider !== "youtube" && r.provider !== "vimeo") return false;
  if (typeof r.externalId !== "string" || !EXTERNAL_ID_PATTERN[r.provider].test(r.externalId)) {
    return false;
  }
  return (
    typeof r.id === "string" &&
    typeof r.title === "string" &&
    typeof r.thumbnailUrl === "string" &&
    typeof r.courseId === "string"
  );
}

export async function fetchVideos(): Promise<Video[]> {
  const res = await fetch(`${API_BASE_URL}/api/videos`);
  if (!res.ok) {
    throw new Error(`GET /api/videos failed with ${res.status}`);
  }
  const body: unknown = await res.json();
  if (!Array.isArray(body)) {
    throw new Error("GET /api/videos returned a non-array response");
  }
  return body.filter(isValidVideo);
}
