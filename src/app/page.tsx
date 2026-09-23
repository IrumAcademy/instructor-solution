import Image from "next/image";
import { mockInstructor } from "@/lib/mock-instructor";
import { courses, courseLevelBadgeClass, stats, testimonials, timeline } from "@/lib/landing-content";

export default function LandingPage() {
  const instructor = mockInstructor;

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-4 sm:px-6">
      {/* Hero */}
      <section className="flex flex-col items-center gap-6 py-16 text-center sm:gap-8 sm:py-20">
        <Image
          src={instructor.avatarUrl}
          alt={`${instructor.name} 프로필 사진`}
          width={160}
          height={160}
          className="h-32 w-32 rounded-full border border-border object-cover shadow-sm sm:h-40 sm:w-40"
          priority
        />
        <div className="mx-auto flex max-w-3xl flex-col gap-3">
          <h1 className="text-display font-bold text-text">{instructor.name}</h1>
          <p className="text-h3 text-text-secondary">{instructor.tagline}</p>
        </div>
      </section>

      {/* 신뢰지표 스탯바 */}
      <section className="relative left-1/2 w-screen -translate-x-1/2 bg-bg-alt py-16 sm:py-20">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-4 sm:grid-cols-4 sm:gap-8 sm:px-6">
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 text-center">
              <span className="text-h1 font-bold text-primary">
                {stat.value}
                {stat.suffix && <span className="text-small text-text-muted">{stat.suffix}</span>}
              </span>
              <span className="text-small text-text-secondary">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 강사 소개 — 경력 타임라인 */}
      <section className="py-16 sm:py-20">
        <h2 className="text-h2 font-bold text-text">경력</h2>
        <p className="mt-4 max-w-3xl text-body text-text-secondary">{instructor.bio}</p>
        <ol className="relative mt-8 flex flex-col gap-8 border-l border-border pl-6">
          {timeline.map((item) => (
            <li key={item.period} className="relative">
              <span className="absolute -left-[29px] h-2.5 w-2.5 rounded-full bg-primary" />
              <p className="text-small text-text-muted">{item.period}</p>
              <h3 className="text-h3 font-medium text-text">{item.title}</h3>
              <p className="text-body text-text-secondary">{item.description}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 과정 카드 상세화 */}
      <section id="courses" className="py-16 sm:py-20">
        <h2 className="text-h2 font-bold text-text">커리큘럼</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.title}
              className="flex flex-col gap-4 rounded-lg border border-border bg-bg p-6 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-caption font-semibold ${courseLevelBadgeClass(course.level)}`}
                >
                  {course.level}
                </span>
                <span className="text-caption text-text-muted">{course.duration}</span>
              </div>
              <h3 className="text-h3 font-semibold text-text">{course.title}</h3>
              <ul className="list-inside list-disc space-y-1 text-small text-text-secondary">
                {course.curriculum.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
              <div className="mt-auto flex items-center justify-between border-t border-border pt-4">
                <span className="text-h3 font-bold text-text">{course.price}</span>
                <button
                  type="button"
                  disabled
                  title="준비 중입니다"
                  className="flex min-h-11 cursor-not-allowed items-center rounded-md border border-border px-5 text-small font-medium text-text opacity-50"
                >
                  자세히 보기
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 수강 후기 */}
      <section className="py-16 sm:py-20">
        <h2 className="text-h2 font-bold text-text">수강생 후기</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="flex flex-col gap-4 rounded-lg bg-bg-alt p-6"
            >
              <span className="text-small text-accent" aria-hidden="true">
                ★★★★★
              </span>
              <p className="text-body text-text">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="mt-auto flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-light text-small font-semibold text-primary">
                  {testimonial.name.slice(0, 1)}
                </span>
                <span className="text-small text-text-secondary">
                  {testimonial.name} · {testimonial.course}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 최종 CTA */}
      <nav className="flex flex-wrap justify-center gap-3 pb-16 sm:pb-20">
        <button
          type="button"
          disabled
          title="준비 중입니다"
          className="flex min-h-11 cursor-not-allowed items-center rounded-md bg-accent px-5 text-small font-medium text-white opacity-50"
        >
          문의하기
        </button>
        <button
          type="button"
          disabled
          title="준비 중입니다"
          className="flex min-h-11 cursor-not-allowed items-center rounded-md bg-primary px-5 text-small font-medium text-white opacity-50"
        >
          영상 보기
        </button>
        <a
          href="#courses"
          className="flex min-h-11 items-center rounded-md border border-border bg-bg px-5 text-small font-medium text-text transition-colors hover:bg-bg-alt"
        >
          과정 보기
        </a>
      </nav>
    </main>
  );
}
