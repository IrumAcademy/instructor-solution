"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL, toPositiveIntId } from "@/lib/api";

type FieldErrors = {
  name?: string;
  contact?: string;
  message?: string;
  consent?: string;
};

type Course = {
  id: string;
  title: string;
};

// ?demo=error is reachable for QA review of the server-error banner, mirroring
// the ?oauth=error convention on /dashboard.
export default function InquiriesPage() {
  return (
    <Suspense>
      <InquiriesPageContent />
    </Suspense>
  );
}

function InquiriesPageContent() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [courseId, setCourseId] = useState(searchParams.get("courseId") ?? "");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">(
    searchParams.get("demo") === "error" ? "error" : "idle",
  );
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/courses`)
      .then((res) => (res.ok ? (res.json() as Promise<Course[]>) : []))
      .then(setCourses)
      .catch(() => {});
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: FieldErrors = {};
    if (!name.trim()) nextErrors.name = "이름을 입력해주세요.";
    if (!contact.trim()) nextErrors.contact = "연락처를 입력해주세요.";
    if (!message.trim()) nextErrors.message = "문의 내용을 입력해주세요.";
    if (!consent) nextErrors.consent = "개인정보 수집 및 이용에 동의해주세요.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus("submitting");
    try {
      const courseIdNum = toPositiveIntId(courseId);
      const res = await fetch(`${API_BASE_URL}/api/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          message,
          ...(courseIdNum !== undefined ? { courseId: courseIdNum } : {}),
        }),
      });
      if (!res.ok) throw new Error("submit failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  function resetForm() {
    setName("");
    setContact("");
    setCourseId("");
    setMessage("");
    setConsent(false);
    setErrors({});
    setStatus("idle");
  }

  if (status === "success") {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-lg flex-col items-center justify-center gap-4 px-4 text-center sm:px-6">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-2xl text-success"
        >
          ✓
        </span>
        <h1 className="text-h1 font-bold text-text">접수되었습니다</h1>
        <p className="text-body text-text-secondary">영업일 기준 2~3일 내 이메일로 회신드립니다.</p>
        <button type="button" onClick={resetForm} className="text-small font-medium text-primary hover:underline">
          다른 문의 남기기
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-6 px-4 py-12 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-h1 font-bold text-text">수강 문의하기</h1>
        <p className="text-small text-text-secondary">영업일 기준 2~3일 내 이메일로 회신드립니다.</p>
      </div>

      {status === "error" && (
        <p className="rounded-md bg-error/10 px-4 py-3 text-small text-error">
          일시적인 오류입니다. 잠시 후 다시 시도해주세요.
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="name" className="text-small font-medium text-text">
              이름
            </label>
            <input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`h-11 rounded-sm border px-3 text-body text-text focus:outline-none focus:ring-3 focus:ring-primary-light ${
                errors.name ? "border-error" : "border-border focus:border-primary"
              }`}
            />
            {errors.name && <p className="text-small text-error">{errors.name}</p>}
          </div>

          <div className="flex flex-1 flex-col gap-1.5">
            <label htmlFor="contact" className="text-small font-medium text-text">
              연락처
            </label>
            <input
              id="contact"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="이메일 또는 전화번호"
              className={`h-11 rounded-sm border px-3 text-body text-text focus:outline-none focus:ring-3 focus:ring-primary-light ${
                errors.contact ? "border-error" : "border-border focus:border-primary"
              }`}
            />
            {errors.contact && <p className="text-small text-error">{errors.contact}</p>}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="courseId" className="text-small font-medium text-text">
            관심 과정 (선택)
          </label>
          <select
            id="courseId"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="h-11 rounded-sm border border-border px-3 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
          >
            <option value="">선택 안 함</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="message" className="text-small font-medium text-text">
            문의 내용
          </label>
          <textarea
            id="message"
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={`rounded-sm border px-3 py-2 text-body text-text focus:outline-none focus:ring-3 focus:ring-primary-light ${
              errors.message ? "border-error" : "border-border focus:border-primary"
            }`}
          />
          {errors.message && <p className="text-small text-error">{errors.message}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-2 text-small text-text-secondary">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-1"
            />
            개인정보 수집 및 이용에 동의합니다.
          </label>
          {errors.consent && <p className="text-small text-error">{errors.consent}</p>}
        </div>

        <button
          type="submit"
          disabled={status === "submitting"}
          className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-accent px-5 text-small font-medium text-white hover:bg-accent-hover disabled:opacity-50"
        >
          {status === "submitting" ? "제출 중…" : "제출하기"}
        </button>
      </form>
    </main>
  );
}
