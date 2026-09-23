"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setError("올바른 이메일 주소를 입력해주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        return;
      }
      const { token } = (await res.json()) as { token: string };
      setToken(token);
      router.push("/dashboard");
    } catch {
      setError("일시적인 오류입니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center gap-8 px-4 py-16 sm:px-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-h1 font-bold text-text">강사 로그인</h1>
        <p className="text-small text-text-secondary">프로필과 과정을 관리하려면 로그인하세요.</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-small font-medium text-text">
            이메일
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-sm border border-border px-3 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
            placeholder="instructor@example.com"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-small font-medium text-text">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-sm border border-border px-3 text-body text-text focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary-light"
          />
        </div>

        {error && <p className="text-small text-error">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 flex min-h-11 items-center justify-center rounded-md bg-primary px-5 text-small font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          {submitting ? "로그인 중…" : "로그인"}
        </button>
      </form>
    </main>
  );
}
