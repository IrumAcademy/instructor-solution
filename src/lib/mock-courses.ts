// Mock data shaped to match GET /api/courses + GET /api/videos (public) from issue #2's API spec.
// Swap for real fetches once the endpoints are live — see issue #3 API integration commit.
export type Video = {
  id: string;
  provider: "youtube" | "vimeo";
  externalId: string;
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
  courseId: string;
};

export type Course = {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
};

export const mockVideos: Video[] = [
  {
    id: "v1",
    provider: "youtube",
    externalId: "yt-cursor-setup",
    title: "AI 코딩 도구 세팅 (Cursor, Claude Code)",
    thumbnailUrl: "/mock/instructor-avatar.jpg",
    embedUrl: "https://www.youtube.com/watch?v=yt-cursor-setup",
    courseId: "c1",
  },
  {
    id: "v2",
    provider: "youtube",
    externalId: "yt-first-webapp",
    title: "명령어로 첫 웹앱 만들기",
    thumbnailUrl: "/mock/instructor-avatar.jpg",
    embedUrl: "https://www.youtube.com/watch?v=yt-first-webapp",
    courseId: "c1",
  },
  {
    id: "v3",
    provider: "vimeo",
    externalId: "vimeo-real-project",
    title: "실제 서비스 기획부터 구현까지",
    thumbnailUrl: "/mock/instructor-avatar.jpg",
    embedUrl: "https://vimeo.com/vimeo-real-project",
    courseId: "c2",
  },
];

export const mockCourses: Course[] = [
  {
    id: "c1",
    title: "AI 바이브코딩 입문",
    description: "AI 코딩 도구 세팅부터 첫 웹앱 배포까지, 비전공자를 위한 3주 입문 과정.",
    videoIds: ["v1", "v2"],
  },
  {
    id: "c2",
    title: "실무 프로젝트로 배우는 AI 코딩",
    description: "실제 서비스 기획부터 데이터베이스·로그인까지, 포트폴리오 1개를 완성하는 6주 과정.",
    videoIds: ["v3"],
  },
  {
    id: "c3",
    title: "AI 코딩으로 취업/이직 준비",
    description: "채용공고 기반 포트폴리오 기획과 모의 면접으로 마무리하는 5주 과정.",
    videoIds: [],
  },
];
