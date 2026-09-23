export type DashboardTab = "profile" | "courses" | "youtube" | "testimonials";

export const dashboardNavItems: { id: DashboardTab; label: string }[] = [
  { id: "profile", label: "프로필" },
  { id: "courses", label: "강의" },
  { id: "youtube", label: "유튜브 연동" },
  { id: "testimonials", label: "후기" },
];
