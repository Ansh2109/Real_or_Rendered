import { NextRequest, NextResponse } from "next/server";
import { getGameImage, getPoolRemaining, getTotalPairs } from "@/lib/imageService";
import { sealImage } from "@/lib/imageToken";
import type { Answer, Difficulty, NextImageRequest, Theme } from "@/lib/types";

export const runtime = "nodejs";

function isAnswer(value: unknown): value is Answer {
  return value === "real" || value === "ai";
}

function isTheme(value: unknown): value is Theme {
  return value === "village" || value === "city" || value === "mixed";
}

function isDifficulty(value: unknown): value is Difficulty {
  return value === "easy" || value === "medium" || value === "hard";
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<NextImageRequest>;
    if (!isAnswer(body.desiredAnswer) || !isTheme(body.theme) || !isDifficulty(body.difficulty)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const usedIds = Array.isArray(body.usedIds) ? body.usedIds.map(String) : [];
    const failedIds = Array.isArray(body.failedIds) ? body.failedIds.map(String) : [];

    const result = await getGameImage({
      theme: body.theme,
      difficulty: body.difficulty,
      desiredAnswer: body.desiredAnswer,
      usedIds,
      failedIds,
      forceLocal: Boolean(body.forceLocal),
      subject: body.subject,
    });

    const token = sealImage(result.image);
    return NextResponse.json({
      token,
      publicId: result.image.id,
      category: result.image.category,
      offlineMode: result.image.isLocal,
      notice: result.notice,
      poolRemaining: getPoolRemaining(),
      totalPairs: getTotalPairs(),
    });
  } catch (error) {
    console.error("Unable to select a game image", error);
    return NextResponse.json(
      { error: "Unable to load an image" },
      { status: 503 },
    );
  }
}
