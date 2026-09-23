"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import {
  dashboardNavItems,
  mockDomain,
  mockProfile,
  mockYoutubeChannel,
  type DashboardTab,
  mockCourseList,
} from "@/lib/mock-dashboard";
import { courseLevelBadgeClass } from "@/lib/landing-content";

// Mock-only for now — wires to /api/instructor, /api/courses, /api/video-sources,
// /api/domain (issue #2 API spec) in a follow-up commit.
export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>("profile");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const activeLabel = dashboardNavItems.find((item) => item.id === activeTab)?.label ?? "";

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:gap-10 md:py-12">
      {/* Mobile dropdown nav */}
      <div className="relative md:hidden">
        <button
          type="button"
          onClick={() => setNavOpen((open) => !open)}
          className="flex h-11 w-full items-center justify-between rounded-md border border-border bg-bg px-4 text-body font-medium text-text"
        >
          {activeLabel}
          <span className={`transition-transform ${navOpen ? "rotate-180" : ""}`}>⌄</span>
        </button>
        {navOpen && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border border-border bg-bg shadow-md">
            {dashboardNavItems.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setNavOpen(false);
                  }}
                  className={`flex h-11 w-full items-center px-4 text-body ${
                    item.id === activeTab ? "bg-primary-light text-primary" : "text-text"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Desktop side nav */}
      <nav className="hidden w-[220px] shrink-0 flex-col gap-1 md:flex">
        {dashboardNavItems.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActiveTab(item.id)}
            className={`flex h-11 items-center rounded-md px-4 text-left text-body ${
              item.id === activeTab
                ? "bg-primary-light font-medium text-primary"
                : "text-text-secondary hover:bg-bg-alt"
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="min-w-0 flex-1">
        {loading ? (
          <DashboardSkeleton />
        ) : activeTab === "profile" ? (
          <ProfileTab />
        ) : activeTab === "courses" ? (
          <CoursesTab />
        ) : activeTab === "youtube" ? (
          <YoutubeTab />
        ) : (
          <DomainTab />
        )}
      </div>
    </main>
  );
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-40 rounded-sm bg-bg-alt" />
      <div className="h-32 rounded-md bg-bg-alt" />
      <div className="h-32 rounded-md bg-bg-alt" />
    </div>
  );
}

function ProfileTab() {
  const [name, setName] = useState(mockProfile.name);
  const [tagline, setTagline] = useState(mockProfile.tagline);
  const [bio, setBio] = useState(mockProfile.bio);
  const [tags, setTags] = useState(mockProfile.careerTags);
  const [tagInput, setTagInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);

  function addTag(e: FormEvent) {
    e.preventDefault();
    const value = tagInput.trim();
    if (!value) return;
    setTags((prev) => [...prev, value]);
    setTagInput("");
  }

  function removeTag(target: string) {
    setTags((prev) => prev.filter((tag) => tag !== target));
  }

  function handleAvatarChange(file: File | null) {
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 pb-20">
      <h1 className="text-h1 font-bold text-text">프로필</h1>

      <div className="flex items-center gap-4">
        <div className="h-20 w-20 overflow-hidden rounded-full bg-bg-alt">
          {avatarPreview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <label className="flex h-10 items-center rounded-md border border-border px-4 text-small font-medium text-text hover:bg-bg-alt">
          이미지 변경
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-small font-medium text-text">이름</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-sm border border-border px-3 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-small font-medium text-text">한 줄 PR 문구</label>
        <input
          value={tagline}
          onChange={(e) => setTagline(e.target.value)}
          className="h-11 rounded-sm border border-border px-3 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-small font-medium text-text">경력 태그</label>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-small text-primary"
            >
              {tag}
              <button type="button" onClick={() => removeTag(tag)} aria-label={`${tag} 삭제`}>
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            placeholder="태그 입력 후 추가"
            className="h-9 flex-1 rounded-sm border border-border px-3 text-small text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
          />
          <button
            type="button"
            onClick={addTag}
            className="h-9 rounded-sm border border-border px-3 text-small font-medium text-text hover:bg-bg-alt"
          >
            추가
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-small font-medium text-text">소개</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={6}
          className="rounded-sm border border-border px-3 py-2 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
        />
      </div>

      <div className="fixed inset-x-0 bottom-0 flex items-center justify-end gap-3 border-t border-border bg-bg px-4 py-3 md:static md:border-0 md:px-0 md:py-0">
        {showSavedToast && <span className="text-small text-success">저장되었습니다</span>}
        <button
          type="submit"
          className="flex h-11 items-center justify-center rounded-md bg-primary px-5 text-small font-medium text-white hover:bg-primary-hover"
        >
          저장
        </button>
      </div>
    </form>
  );
}

function CoursesTab() {
  const [list, setList] = useState(mockCourseList);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-bold text-text">강의</h1>
        <button
          type="button"
          className="flex h-10 items-center rounded-md bg-primary px-4 text-small font-medium text-white hover:bg-primary-hover"
        >
          + 과정 추가
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {list.map((course) => (
          <div
            key={course.title}
            className="flex items-start justify-between gap-4 rounded-md border border-border bg-bg p-4 shadow-sm"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-caption font-medium ${courseLevelBadgeClass(course.level)}`}>
                {course.level} · {course.duration}
              </span>
              <h3 className="text-h3 font-medium text-text">{course.title}</h3>
              <p className="text-small text-text-secondary">{course.price}</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" aria-label="수정" className="text-text-secondary hover:text-primary">
                ✎
              </button>
              <button
                type="button"
                aria-label="삭제"
                onClick={() => setList((prev) => prev.filter((c) => c.title !== course.title))}
                className="text-text-secondary hover:text-error"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function YoutubeTab() {
  const searchParams = useSearchParams();
  const [connected, setConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  // OAuth provider redirects back to /dashboard?oauth=error on denial/failure —
  // same entry point the real integration will use, so it's demoable now via URL.
  const [failed, setFailed] = useState(searchParams.get("oauth") === "error");
  const [lastSyncedMinutesAgo, setLastSyncedMinutesAgo] = useState(mockYoutubeChannel.lastSyncedMinutesAgo);

  function handleConnect() {
    setFailed(false);
    setConnected(true);
  }

  function handleSync() {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      setLastSyncedMinutesAgo(0);
    }, 800);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 font-bold text-text">유튜브 연동</h1>

      {failed && (
        <p className="rounded-md bg-error/10 px-4 py-3 text-small text-error">
          연동에 실패했습니다. 다시 시도해주세요.
        </p>
      )}

      {!connected ? (
        <div className="flex flex-col items-center gap-4 rounded-md border border-border p-10 text-center">
          <p className="text-body text-text-secondary">유튜브 채널을 연결하면 영상이 자동으로 동기화됩니다.</p>
          <button
            type="button"
            onClick={handleConnect}
            className="flex h-11 items-center justify-center rounded-md bg-primary px-5 text-small font-medium text-white hover:bg-primary-hover"
          >
            채널 연결하기
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-bg-alt" />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-body font-medium text-text">{mockYoutubeChannel.channelName}</span>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-caption font-medium text-success">
                  연동됨
                </span>
              </div>
              <span className="text-caption text-text-muted">
                마지막 동기화: {syncing ? "동기화 중…" : `${lastSyncedMinutesAgo}분 전`}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={handleSync}
              disabled={syncing}
              className="h-9 rounded-md border border-border px-3 text-small font-medium text-text hover:bg-bg-alt disabled:opacity-50"
            >
              지금 동기화
            </button>
            <button
              type="button"
              onClick={() => setConnected(false)}
              className="text-small font-medium text-error"
            >
              연동 해제
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DomainTab() {
  const [customDomain, setCustomDomain] = useState("");
  const [copied, setCopied] = useState(false);
  const sslStatus: "pending" | "issuing" | "done" = customDomain ? "pending" : "pending";

  const sslLabel = { pending: "대기중", issuing: "발급중", done: "완료" }[sslStatus];
  const sslClass = {
    pending: "bg-warning/10 text-warning",
    issuing: "bg-primary-light text-primary",
    done: "bg-success/10 text-success",
  }[sslStatus];

  async function handleCopy() {
    await navigator.clipboard.writeText(mockDomain.cnameTarget);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 font-bold text-text">도메인</h1>

      <div className="flex flex-col gap-1.5">
        <span className="text-small font-medium text-text">기본 제공 서브도메인</span>
        <span className="font-mono text-body text-text-secondary">{mockDomain.subdomain}</span>
      </div>

      <hr className="border-border" />

      <div className="flex flex-col gap-3">
        <span className="text-small font-medium text-text">커스텀 도메인 연결</span>
        <input
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value)}
          placeholder="www.my-domain.com"
          className="h-11 rounded-sm border border-border px-3 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
        />

        {customDomain && (
          <div className="flex flex-col gap-2 rounded-md bg-bg-alt p-4">
            <p className="text-small text-text-secondary">
              아래 CNAME 레코드를 도메인 DNS 설정에 추가해주세요.
            </p>
            <div className="flex items-center gap-2">
              <span className="font-mono text-small text-text">{mockDomain.cnameTarget}</span>
              <button
                type="button"
                onClick={handleCopy}
                className="h-8 rounded-sm border border-border px-2.5 text-caption font-medium text-text hover:bg-bg"
              >
                {copied ? "복사됨" : "복사"}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex w-fit rounded-full px-2.5 py-0.5 text-caption font-medium ${sslClass}`}>
                SSL {sslLabel}
              </span>
              <span className="text-caption text-text-muted">DNS 반영까지 최대 24시간 걸릴 수 있어요</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
