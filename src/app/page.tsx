import Image from "next/image";
import { mockInstructor } from "@/lib/mock-instructor";

export default function LandingPage() {
  const instructor = mockInstructor;

  return (
    <main className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-12 text-center sm:gap-8 sm:px-6 sm:py-16 lg:py-16">
      <Image
        src={instructor.avatarUrl}
        alt={`${instructor.name} 프로필 사진`}
        width={160}
        height={160}
        className="h-32 w-32 rounded-full border border-border object-cover shadow-sm sm:h-40 sm:w-40"
        priority
      />
      <div className="flex flex-col gap-3">
        <h1 className="text-display font-bold text-text">{instructor.name}</h1>
        <p className="text-h3 text-text-secondary">{instructor.tagline}</p>
      </div>
      <p className="max-w-xl text-balance text-body text-text-secondary">
        {instructor.bio}
      </p>
      <nav className="flex flex-wrap justify-center gap-3">
        <a
          href="/inquiry"
          className="flex min-h-11 items-center rounded-md bg-accent px-5 text-small font-medium text-white transition-colors hover:bg-accent-hover"
        >
          문의하기
        </a>
        <a
          href="/videos"
          className="flex min-h-11 items-center rounded-md bg-primary px-5 text-small font-medium text-white transition-colors hover:bg-primary-hover"
        >
          영상 보기
        </a>
        <a
          href="/courses"
          className="flex min-h-11 items-center rounded-md border border-border bg-bg px-5 text-small font-medium text-text transition-colors hover:bg-bg-alt"
        >
          과정 보기
        </a>
      </nav>
    </main>
  );
}
