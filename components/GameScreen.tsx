"use client";

import type { Choice } from "@/lib/types";
import ImageCard from "./ImageCard";
import Timer from "./Timer";
import { TIMER_SECONDS } from "@/lib/gameManager";

type Props = {
  index: number;
  total: number;
  score: number;
  imageA: string;
  imageB: string;
  imageIdA: string;
  imageIdB: string;
  readyA: boolean;
  readyB: boolean;
  timerKey: string;
  locked: boolean;
  hideChoices?: boolean;
  correctChoice?: Choice;
  onGuess: (guess: Choice) => void;
  onExpire: () => void;
  onImageReady: (publicId: string) => void;
  onImageFail: (publicId: string) => void;
  onRestart: () => void;
};

export default function GameScreen({
  index,
  total,
  score,
  imageA,
  imageB,
  imageIdA,
  imageIdB,
  readyA,
  readyB,
  timerKey,
  locked,
  hideChoices = false,
  correctChoice,
  onGuess,
  onExpire,
  onImageReady,
  onImageFail,
  onRestart,
}: Props) {
  const imagesReady = readyA && readyB;
  const images: { choice: Choice; src: string; id: string; ready: boolean }[] = [
    { choice: "a", src: imageA, id: imageIdA, ready: readyA },
    { choice: "b", src: imageB, id: imageIdB, ready: readyB },
  ];

  return (
    <div className={`flex w-full flex-col bg-[#f8f7f4] px-4 py-5 sm:px-8 ${hideChoices ? "min-h-0" : "min-h-[100dvh]"}`}>

      {/* ── Top navigation bar ───────────────────────────────── */}
      <div className="mb-6 flex items-center justify-between">
        {/* Left: brand & restart */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#1a1916]">
            <span className="inline-block size-2 rounded-full bg-[#1a1916]" />
            Real or Rendered
          </div>
          <button 
            type="button" 
            onClick={onRestart}
            className="rounded-full border border-[#c0bbb4] bg-white px-3 py-1 text-xs font-semibold text-[#7a7570] transition hover:border-[#1a1916] hover:text-[#1a1916]"
            title="Restart Game"
          >
            ↺ Restart
          </button>
        </div>

        {/* Right: round counter + score + timer */}
        <div className="flex items-center gap-3">
          {/* Current image position */}
          <span className="rounded-full border border-[#e8e5df] bg-white px-3 py-1 text-xs font-semibold text-[#7a7570]" title="Current image out of total">
            🎴 {index} / {total}
          </span>
          {/* Score */}
          <span className="rounded-full border border-[#e8e5df] bg-white px-3 py-1 text-xs font-semibold text-[#1a1916]">
            ✓ {score} / {total}
          </span>
          {!hideChoices && (
            <Timer
              key={timerKey}
              seconds={TIMER_SECONDS}
              running={!locked && imagesReady}
              onExpire={onExpire}
            />
          )}
        </div>
      </div>

      {/* ── Progress bar ─────────────────────────────────────── */}
      <div className="mb-7 h-0.5 w-full overflow-hidden rounded-full bg-[#e8e5df]">
        <div
          className="h-full rounded-full bg-[#1a1916] transition-all duration-500"
          style={{ width: `${((index - 1) / total) * 100}%` }}
        />
      </div>

      {/* ── Question prompt ───────────────────────────────────── */}
      {!hideChoices && (
        <p className="mb-6 text-center font-display text-xl font-bold text-[#1a1916] sm:text-2xl">
          Which image is AI-generated?
        </p>
      )}

      {/* ── Image grid ───────────────────────────────────────── */}
      <div className="grid flex-1 items-start gap-4 md:grid-cols-2 md:gap-8">
        {images.map(({ choice, src, id, ready }) => {
          const isCorrect = correctChoice === choice;
          return (
            <div
              key={id}
              className={`flex flex-col transition-all duration-300 ${
                hideChoices && isCorrect
                  ? "ring-2 ring-[#1a1916] ring-offset-2 ring-offset-[#f8f7f4]"
                  : ""
              } rounded-2xl`}
            >
              {/* Image label */}
              <div className="mb-2 flex items-center justify-between px-0.5">
                <span className="text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#7a7570]">
                  Image {choice.toUpperCase()}
                </span>
                {hideChoices && isCorrect && (
                  <span className="flex items-center gap-1.5 rounded-full border border-[#1a1916]/15 bg-[#1a1916]/6 px-2.5 py-0.5 text-[0.7rem] font-bold uppercase tracking-wider text-[#1a1916]">
                    AI Generated
                  </span>
                )}
              </div>

              <ImageCard
                src={src}
                onReady={() => onImageReady(id)}
                onFail={() => onImageFail(id)}
              />

              {!hideChoices && (
                <button
                  type="button"
                  disabled={locked || !ready}
                  className="choice-btn mt-3 w-full"
                  onClick={() => onGuess(choice)}
                >
                  This is AI →
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Loading hint */}
      {!hideChoices && !imagesReady && (
        <p className="mt-4 text-center text-xs text-[#7a7570]" role="status">
          Loading images — buttons unlock when both are ready
        </p>
      )}

      {/* Round label bottom */}
      {!hideChoices && (
        <p className="mt-4 text-center text-xs text-[#c0bbb4]">
          Round {index} of {total}
        </p>
      )}
    </div>
  );
}
