import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "강사 소개 | Instructor Solution",
  description: "강사 프로필, 강의, 문의를 한 곳에서.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
