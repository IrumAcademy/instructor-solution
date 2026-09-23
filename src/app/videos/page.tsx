"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { mockInstructor } from "@/lib/mock-instructor";
import { mockVideos, type Video, type VideoProvider } from "@/lib/mock-videos";

// Mock-only for now — wires to GET /api/videos (issue #2 API spec) in a follow-up commit.
export default function VideosPage() {
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto flex max-w-5xl flex-col px-4 py-8 sm:px-6 sm:py-12">
      <Link href="/" className="text-small text-text-secondary hover:text-text">
        ← {mockInstructor.name}
      </Link>
      <h1 className="mt-3 text-h1 font-bold text-text">전체 영상</h1>

      {loading ? (
        <VideoGridSkeleton />
      ) : mockVideos.length === 0 ? (
        <p className="mt-12 text-center text-body text-text-secondary">
          아직 등록된 영상이 없습니다. 준비 중이니 조금만 기다려주세요.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {mockVideos.map((video) => (
            <VideoCard
              key={video.id}
              video={video}
              playing={playingId === video.id}
              onPlay={() => setPlayingId(video.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function VideoCard({
  video,
  playing,
  onPlay,
}: {
  video: Video;
  playing: boolean;
  onPlay: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-bg p-3 shadow-sm">
      <div className="relative aspect-video overflow-hidden rounded-md bg-bg-alt">
        {playing ? (
          <iframe
            src={video.embedUrl}
            title={video.title}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={onPlay}
            className="group relative block h-full w-full"
            aria-label={`${video.title} 재생`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnailUrl}
              alt=""
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-md">
                ▶
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="rounded-full bg-primary-light px-2.5 py-0.5 text-caption font-medium text-primary">
          {providerLabel(video.provider)}
        </span>
      </div>
      <h3 className="text-h3 font-medium text-text">{video.title}</h3>
    </div>
  );
}

function providerLabel(provider: VideoProvider) {
  return provider === "youtube" ? "YouTube" : "Vimeo";
}

function VideoGridSkeleton() {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex flex-col gap-3 rounded-lg border border-border p-3">
          <div className="aspect-video rounded-md bg-bg-alt" />
          <div className="h-4 w-16 rounded-sm bg-bg-alt" />
          <div className="h-5 w-3/4 rounded-sm bg-bg-alt" />
        </div>
      ))}
    </div>
  );
}
