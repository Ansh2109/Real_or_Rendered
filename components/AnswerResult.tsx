"use client";

import type { RevealPayload } from "@/lib/types";

type Props = {
  result: RevealPayload;
  onNext: () => void;
  isLast: boolean;
};

export default function AnswerResult({ result, onNext, isLast }: Props) {
  const correctLabel = `Image ${result.correctChoice.toUpperCase()}`;
  const correctImage = result.images[result.correctChoice];
  const otherChoice = result.correctChoice === "a" ? "b" : "a";
  const otherImage = result.images[otherChoice];

  const status = result.timedOut ? "timeout" : result.correct ? "correct" : "wrong";

  const statusStyles = {
    timeout: { label: "Time's up", border: "border-amber-300", bg: "bg-amber-50", text: "text-amber-800" },
    correct: { label: "Correct!", border: "border-emerald-300", bg: "bg-emerald-50", text: "text-emerald-800" },
    wrong:   { label: "Incorrect", border: "border-red-300",   bg: "bg-red-50",    text: "text-red-800"    },
  }[status];
  const containerStyles = {
    timeout: "border-amber-300 bg-amber-50",
    correct: "border-emerald-500 bg-emerald-50",
    wrong:   "border-red-400 bg-red-50",
  }[status];

  return (
    <div className={`mx-auto mb-6 mt-3 w-[calc(100%-2rem)] max-w-4xl rounded-2xl border-2 p-6 shadow-sm ${containerStyles}`}>
      {/* Status */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
        <div className="text-center sm:text-left">
          <h2 className={`text-4xl font-black uppercase tracking-widest ${statusStyles.text}`}>
            {statusStyles.label}
          </h2>
          <p className="mt-2 text-lg font-medium text-[#1a1916]">
            {correctLabel} was the AI-generated image!
          </p>
        </div>
        <button type="button" className="btn-primary shrink-0 px-8 py-3 text-lg" onClick={onNext}>
          {isLast ? "See Results" : "Next Round →"}
        </button>
      </div>
    </div>
  );
}
