"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  onReady: () => void;
  onFail: () => void;
};

export default function ImageCard({ src, onReady, onFail }: Props) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const loaded = loadedSrc === src;
  const failedSrc = useRef<string | null>(null);
  const onReadyRef = useRef(onReady);
  const onFailRef = useRef(onFail);

  useEffect(() => {
    onReadyRef.current = onReady;
    onFailRef.current = onFail;
  }, [onReady, onFail]);

  useEffect(() => {
    if (loaded) return;
    const timeout = window.setTimeout(() => {
      if (failedSrc.current !== src) {
        failedSrc.current = src;
        onFailRef.current();
      }
    }, 12000);
    return () => window.clearTimeout(timeout);
  }, [loaded, src]);

  return (
    <div className="relative mx-auto w-full max-w-6xl overflow-hidden rounded-2xl border border-[#e8e5df] bg-white shadow-sm">
      <div className="aspect-video w-full bg-[#f0ede8]">
        {!loaded ? (
          <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-[#f8f7f4] to-[#f0ede8]" />
        ) : null}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="Photograph for the Real or AI challenge"
          referrerPolicy="no-referrer"
          className={`h-full w-full object-cover transition-opacity duration-500 ${loaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => {
            setLoadedSrc(src);
            onReadyRef.current();
          }}
          onError={() => {
            if (failedSrc.current !== src) {
              failedSrc.current = src;
              onFailRef.current();
            }
          }}
        />
      </div>
    </div>
  );
}
