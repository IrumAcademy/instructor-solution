"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { mockInstructor } from "@/lib/mock-instructor";

type Video = {
  id: string;
  provider: "youtube" | "vimeo";
  externalId: string;
  title: string;
  thumbnailUrl: string;
  embedUrl: string;
  courseId: string;
};

type Course = {
  id: string;
  title: string;
  description: string;
  videoIds: string[];
};

export default function CoursesPage() {
  return (
    <Suspense>
      <CoursesPageContent />
    </Suspense>
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  // ?demo=error is reachable for QA review of the fetch-error banner, mirroring
  // the ?oauth=error convention on /dashboard.
  const forceError = searchParams.get("demo") === "error";
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "success" | "error">("loading");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (forceError) {
      setLoadState("error");
      return;
    }
    let cancelled = false;
    Promise.all([
      fetch(`${API_BASE_URL}/api/courses`).then((res) => {
        if (!res.ok) throw new Error("failed to load courses");
        return res.json() as Promise<Course[]>;
      }),
      fetch(`${API_BASE_URL}/api/videos`).then((res) => {
        if (!res.ok) throw new Error("failed to load videos");
        return res.json() as Promise<Video[]>;
      }),
    ])
      .then(([coursesData, videosData]) => {
        if (cancelled) return;
        setCourses(coursesData);
        setVideos(videosData);
        setLoadState("success");
      })
      .catch(() => {
        if (!cancelled) setLoadState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [forceError]);

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="w-fit text-small text-text-secondary hover:text-primary">
        ← {mockInstructor.name}
      </Link>
      <h1 className="mt-4 text-h1 font-bold text-text">전체 강의</h1>

      {loadState === "loading" ? (
        <p className="mt-12 text-center text-body text-text-secondary">불러오는 중…</p>
      ) : loadState === "error" ? (
        <p className="mt-12 rounded-md bg-error/10 px-4 py-3 text-center text-small text-error">
          강의 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.
        </p>
      ) : courses.length === 0 ? (
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
            const courseVideos = videos.filter((video) => course.videoIds.includes(video.id));
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
                        영상 {courseVideos.length}개
                      </span>
                    </span>
                    <span className="text-small text-text-secondary">{course.description}</span>
                  </span>
                </button>

                {expanded && (
                  <div className="border-t border-border pt-4">
                    {courseVideos.length === 0 ? (
                      <p className="text-small text-text-muted">아직 연결된 영상이 없습니다.</p>
                    ) : (
                      <ul className="flex flex-col gap-2">
                        {courseVideos.map((video) => (
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
