"use client";

import type { GameSettings } from "@/lib/types";

const QUESTIONS = [5, 10, 15, 20] as const;

type Props = {
  settings: GameSettings;
  onChange: (settings: GameSettings) => void;
  onStart: () => void;
};

export default function StartScreen({ settings, onChange, onStart }: Props) {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f8f7f4] px-4 py-12">
      {/* Logo / brand bar */}
      <div className="mb-12 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#7a7570]">
        <span className="inline-block size-2 rounded-full bg-[#1a1916]" />
        Real or Rendered
      </div>

      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="font-display text-[clamp(3rem,10vw,6rem)] font-bold leading-none tracking-tight text-[#1a1916]">
          Real or AI?
        </h1>
        <p className="mt-4 text-base text-[#7a7570] sm:text-lg">
          Two images. One is AI-generated. You have&nbsp;
          <span className="font-semibold text-[#1a1916]">15 seconds</span> to spot it.
        </p>
      </div>

      {/* Settings card */}
      <div className="panel w-full max-w-sm p-6">
        <p className="mb-3 text-[0.7rem] font-bold uppercase tracking-[0.2em] text-[#7a7570]">
          Rounds
        </p>
        <div className="grid grid-cols-4 gap-2">
          {QUESTIONS.map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onChange({ ...settings, questionCount: count })}
              className={`chip ${settings.questionCount === count ? "chip-active" : ""}`}
            >
              {count}
            </button>
          ))}
        </div>

        <button type="button" className="btn-primary mt-6 w-full" onClick={onStart}>
          Start
        </button>
      </div>

    </div>
  );
}
