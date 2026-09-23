// Static landing content (design spec: OUTBOX/IrumAcademy/instructor-solution-design/LANDING_SECTIONS_SPEC.md).
// Not API-backed — Design-Bee marked these sections out of scope for loading/error/empty states.

export const stats = [
  { value: "9년", label: "채용+개발 경력" },
  { value: "180명+", label: "취업/이직 성공" },
  { value: "300건+", label: "완성 프로젝트" },
  { value: "4.9", suffix: "/5", label: "강의 만족도" },
];

export const timeline = [
  {
    period: "2015-2020",
    title: "다온테크 채용 담당",
    description: "개발자 채용 400건+ 진행, 이력서/포트폴리오 스크리닝",
  },
  {
    period: "2020-2022",
    title: "브릿지커머스 프로덕트 매니저",
    description: "비개발 직군 대상 사내 AI 툴 도입 리드",
  },
  {
    period: "2022-2024",
    title: "루미나AI랩 AI 프로덕트 개발자",
    description: "바이브코딩 방식으로 MVP 12건 직접 제작",
  },
  {
    period: "2024-현재",
    title: "AI 바이브코딩 취업 코칭",
    description: "누적 수강생 180명 취업/이직 성공",
  },
];

export type CourseLevel = "초급" | "중급" | "심화";

export const courses: {
  level: CourseLevel;
  duration: string;
  title: string;
  curriculum: string[];
  price: string;
}[] = [
  {
    level: "초급",
    duration: "3주",
    title: "AI 바이브코딩 입문",
    curriculum: [
      "AI 코딩 도구 세팅(Cursor, Claude Code)",
      "명령어로 첫 웹앱 만들기",
      "AI에게 일 시키는 프롬프트 설계",
      "배포까지 한 번에",
    ],
    price: "168,000원",
  },
  {
    level: "중급",
    duration: "6주",
    title: "실무 프로젝트로 배우는 AI 코딩",
    curriculum: [
      "실제 서비스 기획부터 구현까지",
      "데이터베이스·로그인 붙이기",
      "버그를 AI와 같이 고치는 법",
      "포트폴리오용 프로젝트 1개 완성",
    ],
    price: "298,000원",
  },
  {
    level: "심화",
    duration: "5주",
    title: "AI 코딩으로 취업/이직 준비",
    curriculum: [
      "채용공고 기반 포트폴리오 기획",
      "기술면접 예상질문 코칭",
      "이력서·포트폴리오 1:1 첨삭 3회",
      "모의 면접 2회",
    ],
    price: "329,000원",
  },
];

export const testimonials = [
  {
    quote:
      "비전공자였는데 3개월 만에 AI로 서비스 두 개를 만들어서 스타트업 프로덕트 매니저로 이직했습니다.",
    name: "이하늘",
    course: "취업준비반 수료",
  },
  {
    quote: "코드 한 줄 못 짜던 마케터였는데 지금은 사내 자동화 도구를 직접 만들어 씁니다.",
    name: "강지호",
    course: "실무반 수료",
  },
  {
    quote:
      "면접에서 포트폴리오 만든 과정을 설명하니 반응이 확실히 달랐어요. 2주 만에 합격 통보 받았습니다.",
    name: "오세인",
    course: "취업준비반 수료",
  },
];

const levelBadgeClass: Record<CourseLevel, string> = {
  초급: "bg-primary-light text-primary",
  중급: "bg-warning/10 text-warning",
  심화: "bg-accent/10 text-accent",
};

export function courseLevelBadgeClass(level: CourseLevel) {
  return levelBadgeClass[level];
}
