import type { Choice, GameSettings } from "./types";

export const TIMER_SECONDS = 15;

export function createAnswerPlan(count: number): Choice[] {
  const aCount = Math.ceil(count / 2);
  const plan: Choice[] = [
    ...Array.from({ length: aCount }, () => "a" as const),
    ...Array.from({ length: count - aCount }, () => "b" as const),
  ];
  for (let i = plan.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [plan[i], plan[j]] = [plan[j]!, plan[i]!];
  }
  return plan;
}

export function defaultSettings(): GameSettings {
  return {
    questionCount: 10,
  };
}

export function accuracyPercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}
