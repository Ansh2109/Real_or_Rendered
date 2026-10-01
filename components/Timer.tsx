"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  seconds: number;
  running: boolean;
  onExpire: () => void;
};

export default function Timer({ seconds, running, onExpire }: Props) {
  const [remaining, setRemaining] = useState(seconds);
  const fired = useRef(false);
  const onExpireRef = useRef(onExpire);

  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);

  useEffect(() => {
    if (!running || fired.current) return;
    if (remaining <= 0) { fired.current = true; onExpireRef.current(); return; }
    const id = window.setTimeout(() => setRemaining((v) => v - 1), 1000);
    return () => window.clearTimeout(id);
  }, [remaining, running]);

  const pct = (remaining / seconds) * 100;
  const urgent = remaining <= 5;
  const circumference = 2 * Math.PI * 13; // r=13

  return (
    <div className="relative size-10" title={`${remaining}s remaining`}>
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="13" fill="none" stroke="#e8e5df" strokeWidth="2.5" />
        <circle
          cx="15" cy="15" r="13" fill="none"
          stroke={urgent ? "#dc2626" : "#1a1916"}
          strokeWidth="2.5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - (circumference * pct) / 100}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s linear, stroke 0.3s" }}
        />
      </svg>
      <span className={`absolute inset-0 flex items-center justify-center text-[0.65rem] font-bold tabular-nums ${urgent ? "text-red-600" : "text-[#1a1916]"}`}>
        {remaining}
      </span>
    </div>
  );
}
