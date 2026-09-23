// Mock data shaped to match GET /api/instructor (public) from issue #2's API spec.
// Swap for a real fetch once the endpoint is live — see issue #3 API integration commit.
export type Instructor = {
  name: string;
  bio: string;
  avatarUrl: string;
  tagline: string;
};

export const mockInstructor: Instructor = {
  name: "김민준",
  tagline: "실무에서 바로 쓰는 데이터 분석, 쉽게 알려드립니다.",
  bio: "10년차 데이터 분석가. 스타트업과 대기업을 거치며 실무 데이터 분석·시각화 프로젝트를 200건 이상 진행했습니다. 이론보다 실습, 정답보다 사고 과정을 중심으로 강의합니다.",
  avatarUrl: "/mock/instructor-avatar.svg",
};
