// Mock data shaped to match GET /api/videos (public) from issue #2's API spec.
// Swap for a real fetch once the endpoint is live — see issue #3 API integration commit.
export type VideoProvider = "youtube" | "vimeo";

export type Video = {
  id: string;
  provider: VideoProvider;
  externalId: string;
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
  courseId: string;
};

export const mockVideos: Video[] = [
  {
    id: "v1",
    provider: "youtube",
    externalId: "aqz-KE-bpKQ",
    title: "AI 코딩 도구 세팅 — Cursor, Claude Code 처음 설치하기",
    thumbnailUrl: "https://img.youtube.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/aqz-KE-bpKQ",
    courseId: "c1",
  },
  {
    id: "v2",
    provider: "youtube",
    externalId: "TlB_eWDSMt4",
    title: "명령어로 첫 웹앱 만들기 — 30분 완성",
    thumbnailUrl: "https://img.youtube.com/vi/TlB_eWDSMt4/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/TlB_eWDSMt4",
    courseId: "c1",
  },
  {
    id: "v3",
    provider: "vimeo",
    externalId: "76979871",
    title: "실무 프로젝트 기획부터 구현까지 — 사례 리뷰",
    thumbnailUrl: "https://vumbnail.com/76979871.jpg",
    embedUrl: "https://player.vimeo.com/video/76979871",
    courseId: "c2",
  },
  {
    id: "v4",
    provider: "youtube",
    externalId: "R6MlUcmOul8",
    title: "채용공고 기반 포트폴리오 기획법",
    thumbnailUrl: "https://img.youtube.com/vi/R6MlUcmOul8/hqdefault.jpg",
    embedUrl: "https://www.youtube.com/embed/R6MlUcmOul8",
    courseId: "c3",
  },
  {
    id: "v5",
    provider: "vimeo",
    externalId: "148751763",
    title: "기술면접 예상질문 코칭 하이라이트",
    thumbnailUrl: "https://vumbnail.com/148751763.jpg",
    embedUrl: "https://player.vimeo.com/video/148751763",
    courseId: "c3",
  },
];
