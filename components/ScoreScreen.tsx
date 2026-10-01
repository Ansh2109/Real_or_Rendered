"use client";

type Props = {
  correct: number;
  wrong: number;
  total: number;
  accuracy: number;
  onReplay: () => void;
};

export default function ScoreScreen({ correct, wrong, total, accuracy, onReplay }: Props) {
  const grade =
    accuracy >= 90 ? { emoji: "🏆", label: "Expert eye" } :
    accuracy >= 70 ? { emoji: "👁️", label: "Sharp spotter" } :
    accuracy >= 50 ? { emoji: "📈", label: "Getting better" } :
                    { emoji: "🎯", label: "Keep practising" };

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#f8f7f4] px-4 py-12">
      {/* Brand */}
      <div className="mb-10 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.25em] text-[#7a7570]">
        <span className="inline-block size-2 rounded-full bg-[#1a1916]" />
        Real or Rendered
      </div>

      {/* Result */}
      <div className="mb-2 text-4xl">{grade.emoji}</div>
      <h1 className="font-display text-5xl font-bold text-[#1a1916] sm:text-6xl">{accuracy}%</h1>
      <p className="mt-2 text-sm font-semibold uppercase tracking-widest text-[#7a7570]">{grade.label}</p>

      {/* Stats card */}
      <div className="panel mt-10 w-full max-w-sm overflow-hidden">
        {/* Score bar */}
        <div className="p-5 pb-4">
          <div className="mb-1 flex justify-between text-xs text-[#7a7570]">
            <span>Accuracy</span>
            <span>{correct} / {total} correct</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#e8e5df]">
            <div
              className="h-full rounded-full bg-[#1a1916] transition-all duration-700"
              style={{ width: `${accuracy}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 divide-x divide-[#e8e5df] border-t border-[#e8e5df]">
          {[
            { label: "Correct", value: correct, color: "text-emerald-600" },
            { label: "Wrong",   value: wrong,   color: "text-red-500"    },
            { label: "Total",   value: total,   color: "text-[#1a1916]"  },
          ].map(({ label, value, color }) => (
            <div key={label} className="px-4 py-4 text-center">
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="mt-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-[#7a7570]">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <button type="button" className="btn-primary mt-6 w-full max-w-sm" onClick={onReplay}>
        Play Again
      </button>

      <p className="mt-6 text-xs text-[#c0bbb4]">Real or Rendered · AI Detection Challenge</p>
    </div>
  );
}
