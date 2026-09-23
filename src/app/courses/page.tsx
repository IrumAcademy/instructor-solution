"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { mockCourses, mockVideos } from "@/lib/mock-courses";
import { mockInstructor } from "@/lib/mock-instructor";

// Mock-only for now — wires to GET /api/courses + GET /api/videos (issue #2 API spec)
// in a follow-up commit.
export default function CoursesPage() {
  return (
    <Suspense>
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  // Reachable via ?demo=empty for QA review of the empty state, mirroring the
  // ?oauth=error convention on /dashboard.
  const courses = searchParams.get("demo") === "empty" ? [] : mockCourses;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="w-fit text-small text-text-secondary hover:text-primary">
        ← {mockInstructor.name}
      </Link>
      <h1 className="mt-4 text-h1 font-bold text-text">전체 강의</h1>

      {courses.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-body text-text-secondary">
            아직 등록된 강의가 없습니다. 준비 중이니 조금만 기다려주세요.
          </p>
          <Link
            href="/inquiries"
            className="flex min-h-11 items-center rounded-md bg-accent px-5 text-small font-medium text-white hover:bg-accent-hover"
          >
            문의하기
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
          {courses.map((course) => {
            const videos = mockVideos.filter((video) => course.videoIds.includes(video.id));
            const expanded = expandedId === course.id;

            return (
              <div
                key={course.id}
                className={`flex flex-col gap-4 rounded-md border border-border bg-bg p-4 shadow-sm transition hover:shadow-md ${
                  expanded ? "lg:col-span-2" : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : course.id)}
                  className="flex items-start gap-4 text-left"
                >
                  <span
                    aria-hidden="true"
                    className="flex h-16 w-24 shrink-0 items-center justify-center rounded-sm bg-bg-alt text-text-muted"
                  >
                    ▶
                  </span>
                  <span className="flex flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-h3 font-semibold text-text">{course.title}</span>
                      <span className="rounded-full bg-primary-light px-2 py-0.5 text-caption font-medium text-primary">
                        영상 {videos.length}개
                      </span>
                    </span>
                    <span className="text-small text-text-secondary">{course.description}</span>
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-border pt-4">
                    {videos.length === 0 ? (
                      <p className="text-small text-text-muted">아직 연결된 영상이 없습니다.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {videos.map((video) => (
                          <li key={video.id}>
                            <a
                              href={video.embedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-3 rounded-sm p-2 hover:bg-bg-alt"
                            >
                              <span className="flex h-12 w-20 shrink-0 items-center justify-center rounded-sm bg-bg-alt text-caption text-text-muted">
                                {video.provider === "youtube" ? "YouTube" : "Vimeo"}
                              </span>
                              <span className="text-small text-text">{video.title}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <Link
                  href={`/inquiries?courseId=${course.id}`}
                  className="w-fit text-small font-medium text-primary hover:underline"
                >
                  이 과정 문의하기
                </Link>
              </div>
            );
          })}
        </div>
      )}

      <div className="relative left-1/2 mt-16 w-screen -translate-x-1/2 bg-bg-alt py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:px-6">
          <p className="text-h3 font-medium text-text">관심있는 강의가 있으신가요?</p>
          <Link
            href="/inquiries"
            className="flex min-h-11 items-center rounded-md bg-accent px-5 text-small font-medium text-white hover:bg-accent-hover"
          >
            문의하기
          </Link>
        </div>
      </div>
    </main>
  );
}
