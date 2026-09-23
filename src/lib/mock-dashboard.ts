// Mock-only state for the self-management dashboard (issue #5).
// No backend yet — swap for real fetch/mutate once /api/instructor + /api/courses
// (issue #2 API spec, now merged per API-Bee) land here in a follow-up commit.
import { mockInstructor } from "./mock-instructor";
import { courses } from "./landing-content";

export type DashboardTab = "profile" | "courses" | "youtube" | "domain";

export const dashboardNavItems: { id: DashboardTab; label: string }[] = [
  { id: "profile", label: "프로필" },
  { id: "courses", label: "강의" },
  { id: "youtube", label: "유튜브 연동" },
  { id: "domain", label: "도메인" },
];

export const mockProfile = {
  ...mockInstructor,
  careerTags: ["AI 프로덕트 개발", "채용 담당 5년", "바이브코딩 코칭"],
};

export const mockCourseList = courses;

export const mockYoutubeChannel = {
  channelName: "정다은의 AI 코딩 스튜디오",
  avatarUrl: "/mock/youtube-avatar.jpg",
  lastSyncedMinutesAgo: 12,
};

export const mockDomain = {
  subdomain: "dahaeun.teachstage.kr",
  cnameTarget: "cname.teachstage.kr",
};
