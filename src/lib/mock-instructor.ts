// Mock data shaped to match GET /api/instructor (public) from issue #2's API spec.
// Swap for a real fetch once the endpoint is live — see issue #3 API integration commit.
export type Instructor = {
  name: string;
  bio: string;
  avatarUrl: string;
  tagline: string;
};

export const mockInstructor: Instructor = {
  name: "정다은",
  tagline: "코드 몰라도 AI로 서비스 만들고, 그 힘으로 이직하세요.",
  bio: "IT 스타트업에서 채용 담당자로 5년, AI 프로덕트 개발자로 4년을 거치며 “실무에서 통하는 포트폴리오”가 무엇인지 양쪽에서 봤습니다. 지금은 코딩 경험이 없는 비전공자도 AI 도구(Cursor, Claude Code 등)로 직접 서비스를 만들고, 그 결과물로 이직에 성공하도록 돕는 강의를 합니다.",
  avatarUrl: "/mock/instructor-avatar.svg",
};
