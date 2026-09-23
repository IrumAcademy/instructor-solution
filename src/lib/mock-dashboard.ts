// issue #2 API spec has no /api/testimonials endpoint — this tab stays mock
// until API-Bee/PM-Bee add one. Profile/courses/video-sources now wire to the
// real backend directly in dashboard/page.tsx.
import { testimonials } from "./landing-content";

export type DashboardTab = "profile" | "courses" | "youtube" | "testimonials";

export const dashboardNavItems: { id: DashboardTab; label: string }[] = [
  { id: "profile", label: "프로필" },
  { id: "courses", label: "강의" },
  { id: "youtube", label: "유튜브 연동" },
  { id: "testimonials", label: "후기" },
];

export const mockTestimonialList = testimonials;
