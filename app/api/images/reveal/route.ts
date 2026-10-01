import { NextRequest, NextResponse } from "next/server";
import { openImage } from "@/lib/imageToken";
import type { Choice, GameImage } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      tokens?: Record<Choice, string>;
      choice?: Choice | "timeout";
    };
    if (
      !body.tokens?.a ||
      !body.tokens?.b ||
      (body.choice !== "a" && body.choice !== "b" && body.choice !== "timeout")
    ) {
      return NextResponse.json({ error: "Invalid answer request" }, { status: 400 });
    }

    const images: Record<Choice, GameImage> = {
      a: openImage(body.tokens.a),
      b: openImage(body.tokens.b),
    };
    const correctChoice: Choice = images.a.answer === "ai" ? "a" : "b";
    const timedOut = body.choice === "timeout";
    const correct = !timedOut && body.choice === correctChoice;

    return NextResponse.json({
      correct,
      timedOut,
      correctChoice,
      images: {
        a: {
          answer: images.a.answer,
          category: images.a.category,
          source: images.a.source,
          sourceUrl: images.a.sourceUrl,
          photographer: images.a.photographer,
          license: images.a.license,
          licenseUrl: images.a.licenseUrl,
          aiModel: images.a.aiModel,
          isLocal: images.a.isLocal,
        },
        b: {
          answer: images.b.answer,
          category: images.b.category,
          source: images.b.source,
          sourceUrl: images.b.sourceUrl,
          photographer: images.b.photographer,
          license: images.b.license,
          licenseUrl: images.b.licenseUrl,
          aiModel: images.b.aiModel,
          isLocal: images.b.isLocal,
        },
      },
    });
  } catch (error) {
    console.error("Unable to reveal the image pair", error);
    return NextResponse.json({ error: "Unable to reveal answer" }, { status: 400 });
  }
}
