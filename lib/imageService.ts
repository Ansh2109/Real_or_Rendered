import fs from "node:fs";
import path from "node:path";
import type { Answer, Difficulty, GameImage, Theme } from "./types";

export type ImagePickResult = {
  image: GameImage;
  notice: "none" | "offline" | "backup";
};

// ─── Global shuffle pool ────────────────────────────────────────────────────
// Persists across game restarts on the same server instance.
// Works like a shuffled deck: every pair is shown once before any repeats.

let allPairs: string[] = [];        // full list, loaded once
let shufflePool: string[] = [];     // remaining pairs in current cycle

function fisherYates(arr: string[]): string[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function loadPairs(): void {
  if (allPairs.length > 0) return; // already loaded

  try {
    const aiDir  = path.join(process.cwd(), "public", "custom-images", "ai");
    const realDir = path.join(process.cwd(), "public", "custom-images", "real");

    const aiFiles  = fs.readdirSync(aiDir).filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f));
    const realSet  = new Set(fs.readdirSync(realDir));

    // Only keep files that exist in BOTH folders (true pairs)
    allPairs = aiFiles.filter(f => realSet.has(f));
    console.log(`[ImageService] Found ${allPairs.length} matched pairs.`);

    // Start the first cycle
    shufflePool = fisherYates(allPairs);
  } catch (err) {
    console.error("[ImageService] Error reading custom-images:", err);
  }
}

/**
 * Pull the next pair from the global shuffle pool.
 * The pool is per-server-process and survives game restarts,
 * so the same pair won't repeat until every other pair has been shown.
 *
 * If a specific `subject` filename is provided, that exact pair is returned
 * (used to fetch the matching real/AI image for the same round).
 */
function nextPairFromPool(usedInThisRound: string[]): string {
  loadPairs();

  if (allPairs.length === 0) {
    throw new Error("No image pairs found in public/custom-images/ai and /real");
  }

  // Remove anything already used in THIS round from the pool candidates
  const available = shufflePool.filter(f => !usedInThisRound.includes(f));

  if (available.length === 0) {
    // All pairs exhausted — refill and reshuffle, excluding current-round IDs
    console.log("[ImageService] Full cycle complete — reshuffling pool.");
    shufflePool = fisherYates(allPairs).filter(f => !usedInThisRound.includes(f));
    if (shufflePool.length === 0) {
      // Edge case: more questions than pairs
      shufflePool = fisherYates(allPairs);
    }
  }

  // Take the first item that is not in usedInThisRound
  const candidate = shufflePool.find(f => !usedInThisRound.includes(f))!;

  // Remove it from the pool so it won't appear again this cycle
  shufflePool = shufflePool.filter(f => f !== candidate);

  return candidate;
}

// ─── Public API ─────────────────────────────────────────────────────────────

/** How many pairs remain in the current shuffle cycle (for display in the UI). */
export function getPoolRemaining(): number {
  return shufflePool.length;
}

/** Total number of matched pairs found in the custom-images folder. */
export function getTotalPairs(): number {
  return allPairs.length;
}

export async function getGameImage(options: {
  theme: Theme;
  difficulty: Difficulty;
  desiredAnswer: Answer;
  usedIds: string[];
  failedIds: string[];
  forceLocal?: boolean;
  subject?: string;
}): Promise<ImagePickResult> {
  loadPairs();

  if (allPairs.length === 0) {
    throw new Error("No image pairs found in public/custom-images/ai and /real");
  }

  let selectedFile: string;

  if (options.subject && allPairs.includes(options.subject)) {
    // Second call of a round — match the exact pair the AI request picked
    selectedFile = options.subject;
  } else {
    // First call of a round — pull the next unpredicted pair from the pool
    selectedFile = nextPairFromPool(options.usedIds);
  }

  const urlPath    = `/custom-images/${options.desiredAnswer}/${selectedFile}`;
  const canonicalId = `custom:${options.desiredAnswer}:${selectedFile}`;

  const image: GameImage = {
    id: selectedFile,
    canonicalId,
    url: urlPath,
    answer: options.desiredAnswer,
    category: "village",
    source: "Custom Dataset",
    photographer: "Your Folder",
    isLocal: true,
  };

  return { image, notice: "none" };
}
