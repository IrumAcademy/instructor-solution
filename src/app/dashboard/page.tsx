"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { dashboardNavItems, type DashboardTab } from "@/lib/mock-dashboard";
import { API_BASE_URL, authHeaders, clearToken, getToken } from "@/lib/api";

type Instructor = { name: string; bio: string; avatarUrl: string; tagline: string };
type Course = { id: string; title: string; description: string; videoIds: string[] };

export default function DashboardPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("profile");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }
    setAuthChecked(true);
  }, [router]);

  function handleLogout() {
    clearToken();
    router.replace("/login");
  }

  const loading = !authChecked;
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
            <li>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-11 w-full items-center px-4 text-body text-text-secondary"
              >
                로그아웃
              </button>
            </li>
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
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 flex h-11 items-center rounded-md px-4 text-left text-body text-text-secondary hover:bg-bg-alt"
        >
          로그아웃
        </button>
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
          <TestimonialsTab />
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

// Career tags are a mock-only UI affordance — issue #2's /api/instructor has no
// field for them, so they're kept as free-form local tags and aren't persisted.
// Avatar upload also has no backend endpoint yet (spec has no media/upload route);
// the file picker only updates the local preview until one exists.
function ProfileTab() {
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/instructor`)
      .then((res) => (res.ok ? (res.json() as Promise<Instructor>) : Promise.reject()))
      .then((data) => {
        setName(data.name);
        setTagline(data.tagline);
        setBio(data.bio);
        setAvatarUrl(data.avatarUrl);
      })
      .catch(() => setError("프로필을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

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

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/instructor`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ name, tagline, bio, avatarUrl }),
      });
      if (!res.ok) throw new Error("save failed");
      setShowSavedToast(true);
      setTimeout(() => setShowSavedToast(false), 2000);
    } catch {
      setError("저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6 pb-20">
      <h1 className="text-h1 font-bold text-text">프로필</h1>
      {error && <p className="text-small text-error">{error}</p>}

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
          disabled={saving}
          className="flex h-11 items-center justify-center rounded-md bg-primary px-5 text-small font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}

type CourseDraft = { title: string; description: string };
const emptyDraft: CourseDraft = { title: "", description: "" };

function CoursesTab() {
  const [list, setList] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<CourseDraft>(emptyDraft);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/courses`)
      .then((res) => (res.ok ? (res.json() as Promise<Course[]>) : Promise.reject()))
      .then(setList)
      .catch(() => setError("과정 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  function startCreate() {
    setDraft(emptyDraft);
    setEditingId("new");
  }

  function startEdit(course: Course) {
    setDraft({ title: course.title, description: course.description });
    setEditingId(course.id);
  }

  async function submitDraft(e: FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId === "new") {
        const res = await fetch(`${API_BASE_URL}/api/courses`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ title: draft.title, description: draft.description, videoIds: [] }),
        });
        if (!res.ok) throw new Error("create failed");
        const created = (await res.json()) as Course;
        setList((prev) => [...prev, created]);
      } else if (editingId) {
        const res = await fetch(`${API_BASE_URL}/api/courses/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify({ title: draft.title, description: draft.description }),
        });
        if (!res.ok) throw new Error("update failed");
        setList((prev) =>
          prev.map((c) => (c.id === editingId ? { ...c, title: draft.title, description: draft.description } : c)),
        );
      }
      setEditingId(null);
    } catch {
      setError("저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("delete failed");
      setList((prev) => prev.filter((c) => c.id !== id));
    } catch {
      setError("삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-bold text-text">강의</h1>
        <button
          type="button"
          onClick={startCreate}
          className="flex h-10 items-center rounded-md bg-primary px-4 text-small font-medium text-white hover:bg-primary-hover"
        >
          + 과정 추가
        </button>
      </div>

      {error && <p className="text-small text-error">{error}</p>}

      {editingId === "new" && (
        <CourseForm draft={draft} setDraft={setDraft} saving={saving} onSubmit={submitDraft} onCancel={() => setEditingId(null)} />
      )}

      <div className="flex flex-col gap-4">
        {list.length === 0 && editingId !== "new" && (
          <p className="text-small text-text-secondary">등록된 과정이 없습니다.</p>
        )}
        {list.map((course) =>
          editingId === course.id ? (
            <CourseForm
              key={course.id}
              draft={draft}
              setDraft={setDraft}
              saving={saving}
              onSubmit={submitDraft}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div
              key={course.id}
              className="flex items-start justify-between gap-4 rounded-md border border-border bg-bg p-4 shadow-sm"
            >
              <div className="flex flex-col gap-1.5">
                <h3 className="text-h3 font-medium text-text">{course.title}</h3>
                <p className="text-small text-text-secondary">{course.description}</p>
                <span className="text-caption text-text-muted">영상 {course.videoIds.length}개 연결됨</span>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  aria-label="수정"
                  onClick={() => startEdit(course)}
                  className="text-text-secondary hover:text-primary"
                >
                  ✎
                </button>
                <button
                  type="button"
                  aria-label="삭제"
                  onClick={() => handleDelete(course.id)}
                  className="text-text-secondary hover:text-error"
                >
                  ×
                </button>
              </div>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function CourseForm({
  draft,
  setDraft,
  saving,
  onSubmit,
  onCancel,
}: {
  draft: CourseDraft;
  setDraft: (draft: CourseDraft) => void;
  saving: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-md border border-border bg-bg p-4 shadow-sm">
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder="과정 제목"
        className="h-10 rounded-sm border border-border px-3 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
      />
      <textarea
        value={draft.description}
        onChange={(e) => setDraft({ ...draft, description: e.target.value })}
        placeholder="과정 설명"
        rows={3}
        className="rounded-sm border border-border px-3 py-2 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-sm border border-border px-3 text-small font-medium text-text hover:bg-bg-alt"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving || !draft.title.trim()}
          className="h-9 rounded-sm bg-primary px-3 text-small font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}

// issue #2 has no GET /api/video-sources status endpoint, so "connected" only
// reflects this session's own POST result — a page refresh forgets it. Flagged
// to API-Bee/PM-Bee; add a status read endpoint to persist this across reloads.
type VideoSource = { provider: "youtube" | "vimeo"; channelId: string; lastSyncedAt: string | null };

function minutesAgo(isoOrSqlTimestamp: string | null): number {
  if (!isoOrSqlTimestamp) return 0;
  // D1 stores this as a SQLite `datetime('now')` string (space-separated, UTC,
  // no offset) — normalize to ISO-8601 so `Date` parses it as UTC instead of
  // (incorrectly) local time.
  const iso = isoOrSqlTimestamp.includes("T") ? isoOrSqlTimestamp : `${isoOrSqlTimestamp.replace(" ", "T")}Z`;
  const diffMs = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.round(diffMs / 60000));
}

const PROVIDER_LABELS: Record<"youtube" | "vimeo", string> = { youtube: "YouTube", vimeo: "Vimeo" };

// PM-Bee 2026-09-23: both providers are in scope, each with its own connect/
// sync/change-channel UI — a strict per-instructor pair, not a pick-one list.
function YoutubeTab() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [sources, setSources] = useState<Partial<Record<"youtube" | "vimeo", VideoSource>>>({});
  const failed = searchParams.get("oauth") === "error";

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/video-sources`, { headers: authHeaders() })
      .then((res) => (res.ok ? (res.json() as Promise<VideoSource[]>) : Promise.reject()))
      .then((list) => {
        setSources(Object.fromEntries(list.map((s) => [s.provider, s])));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-h1 font-bold text-text">영상 소스 연동</h1>

      {failed && (
        <p className="rounded-md bg-error/10 px-4 py-3 text-small text-error">
          연동에 실패했습니다. 다시 시도해주세요.
        </p>
      )}

      {(["youtube", "vimeo"] as const).map((provider) => (
        <ProviderSourceCard key={provider} provider={provider} initial={sources[provider] ?? null} />
      ))}
    </div>
  );
}

function ProviderSourceCard({ provider, initial }: { provider: "youtube" | "vimeo"; initial: VideoSource | null }) {
  const [channelId, setChannelId] = useState(initial?.channelId ?? "");
  const [connected, setConnected] = useState(!!initial);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(initial?.lastSyncedAt ?? null);

  async function handleConnect(e: FormEvent) {
    e.preventDefault();
    if (!channelId.trim()) return;
    setConnecting(true);
    setError(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/video-sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ provider, channelId }),
      });
      if (!res.ok) throw new Error("connect failed");
      setConnected(true);
      setLastSyncedAt(new Date().toISOString());
    } catch {
      setError(true);
    } finally {
      setConnecting(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/video-sources/sync`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("sync failed");
      setLastSyncedAt(new Date().toISOString());
    } catch {
      setError(true);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-h3 font-medium text-text">{PROVIDER_LABELS[provider]}</h2>

      {error && (
        <p className="rounded-md bg-error/10 px-4 py-3 text-small text-error">
          연동에 실패했습니다. 다시 시도해주세요.
        </p>
      )}

      {!connected ? (
        <form
          onSubmit={handleConnect}
          className="flex flex-col items-center gap-4 rounded-md border border-border p-10 text-center"
        >
          <p className="text-body text-text-secondary">
            {PROVIDER_LABELS[provider]} 채널을 연결하면 영상이 자동으로 동기화됩니다.
          </p>
          <div className="flex w-full max-w-sm flex-col gap-3">
            <input
              value={channelId}
              onChange={(e) => setChannelId(e.target.value)}
              placeholder="채널 ID"
              className="h-11 rounded-sm border border-border px-3 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
            />
          </div>
          <button
            type="submit"
            disabled={connecting || !channelId.trim()}
            className="flex h-11 items-center justify-center rounded-md bg-primary px-5 text-small font-medium text-white hover:bg-primary-hover disabled:opacity-50"
          >
            {connecting ? "연결 중…" : "채널 연결하기"}
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between rounded-md border border-border p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-bg-alt" />
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-body font-medium text-text">{channelId}</span>
                <span className="rounded-full bg-success/10 px-2 py-0.5 text-caption font-medium text-success">
                  연동됨
                </span>
              </div>
              <span className="text-caption text-text-muted">
                마지막 동기화: {syncing ? "동기화 중…" : lastSyncedAt ? `${minutesAgo(lastSyncedAt)}분 전` : "-"}
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
            {/* No DELETE endpoint in the API spec — this only resets the local UI
                back to the connect form so a different channel can be POSTed.
                It does not remove the existing connection from the backend. */}
            <button
              type="button"
              onClick={() => setConnected(false)}
              className="text-small font-medium text-primary hover:underline"
            >
              채널 변경
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

type Testimonial = { id: number; quote: string; name: string; course: string };
type TestimonialDraft = { quote: string; name: string; course: string };
const emptyTestimonialDraft: TestimonialDraft = { quote: "", name: "", course: "" };

function TestimonialsTab() {
  const [list, setList] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<TestimonialDraft>(emptyTestimonialDraft);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/testimonials`)
      .then((res) => (res.ok ? (res.json() as Promise<Testimonial[]>) : Promise.reject()))
      .then(setList)
      .catch(() => setError("후기 목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  function startCreate() {
    setDraft(emptyTestimonialDraft);
    setEditingId("new");
  }

  function startEdit(item: Testimonial) {
    setDraft({ quote: item.quote, name: item.name, course: item.course });
    setEditingId(item.id);
  }

  async function submitDraft(e: FormEvent) {
    e.preventDefault();
    if (!draft.quote.trim() || !draft.name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      if (editingId === "new") {
        const res = await fetch(`${API_BASE_URL}/api/testimonials`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(draft),
        });
        if (!res.ok) throw new Error("create failed");
        const created = (await res.json()) as Testimonial;
        setList((prev) => [created, ...prev]);
      } else if (editingId) {
        const res = await fetch(`${API_BASE_URL}/api/testimonials/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json", ...authHeaders() },
          body: JSON.stringify(draft),
        });
        if (!res.ok) throw new Error("update failed");
        const updated = (await res.json()) as Testimonial;
        setList((prev) => prev.map((item) => (item.id === editingId ? updated : item)));
      }
      setEditingId(null);
    } catch {
      setError("저장하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/testimonials/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("delete failed");
      setList((prev) => prev.filter((item) => item.id !== id));
    } catch {
      setError("삭제하지 못했습니다. 잠시 후 다시 시도해주세요.");
    }
  }

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="flex flex-col gap-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-bold text-text">후기</h1>
        <button
          type="button"
          onClick={startCreate}
          className="flex h-10 items-center rounded-md bg-primary px-4 text-small font-medium text-white hover:bg-primary-hover"
        >
          + 후기 추가
        </button>
      </div>

      {error && <p className="text-small text-error">{error}</p>}

      {editingId === "new" && (
        <TestimonialForm draft={draft} setDraft={setDraft} saving={saving} onSubmit={submitDraft} onCancel={() => setEditingId(null)} />
      )}

      <div className="flex flex-col gap-4">
        {list.length === 0 && editingId !== "new" && (
          <p className="text-small text-text-secondary">등록된 후기가 없습니다.</p>
        )}
        {list.map((item) =>
          editingId === item.id ? (
            <TestimonialForm
              key={item.id}
              draft={draft}
              setDraft={setDraft}
              saving={saving}
              onSubmit={submitDraft}
              onCancel={() => setEditingId(null)}
            />
          ) : (
            <div key={item.id} className="flex flex-col gap-3 rounded-md border border-border bg-bg p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="flex-1 text-body text-text">{item.quote}</p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    aria-label="수정"
                    onClick={() => startEdit(item)}
                    className="text-text-secondary hover:text-primary"
                  >
                    ✎
                  </button>
                  <button
                    type="button"
                    aria-label="삭제"
                    onClick={() => handleDelete(item.id)}
                    className="text-text-secondary hover:text-error"
                  >
                    ×
                  </button>
                </div>
              </div>
              <span className="text-small text-text-secondary">
                {item.name}
                {item.course ? ` · ${item.course}` : ""}
              </span>
            </div>
          ),
        )}
      </div>
    </div>
  );
}

function TestimonialForm({
  draft,
  setDraft,
  saving,
  onSubmit,
  onCancel,
}: {
  draft: TestimonialDraft;
  setDraft: (draft: TestimonialDraft) => void;
  saving: boolean;
  onSubmit: (e: FormEvent) => void;
  onCancel: () => void;
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-md border border-border bg-bg p-4 shadow-sm">
      <textarea
        value={draft.quote}
        onChange={(e) => setDraft({ ...draft, quote: e.target.value })}
        rows={3}
        placeholder="후기 내용"
        className="rounded-sm border border-border px-3 py-2 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
      />
      <div className="flex gap-3">
        <input
          value={draft.name}
          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
          placeholder="이름"
          className="h-9 flex-1 rounded-sm border border-border px-3 text-small text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
        />
        <input
          value={draft.course}
          onChange={(e) => setDraft({ ...draft, course: e.target.value })}
          placeholder="수강 과정"
          className="h-9 flex-1 rounded-sm border border-border px-3 text-small text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
        />
      </div>
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-sm border border-border px-3 text-small font-medium text-text hover:bg-bg-alt"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving || !draft.quote.trim() || !draft.name.trim()}
          className="h-9 rounded-sm bg-primary px-3 text-small font-medium text-white hover:bg-primary-hover disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}
