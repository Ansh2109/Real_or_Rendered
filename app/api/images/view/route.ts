import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { openImage } from "@/lib/imageToken";
import type { GameImage } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("t");
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  let image: GameImage;
  try {
    image = openImage(token);
  } catch {
    return NextResponse.json({ error: "Invalid or expired image token" }, { status: 400 });
  }

  // Serve custom dataset files securely
  if (image.url.startsWith("/custom-images/")) {
    try {
      // image.url is e.g. "/custom-images/ai/1.webp"
      // we prepend process.cwd()/public
      const filePath = path.join(process.cwd(), "public", image.url);
      const bytes = await readFile(filePath);
      const extension = path.extname(image.url).toLowerCase();
      const contentType =
        extension === ".png"
          ? "image/png"
          : extension === ".webp"
            ? "image/webp"
            : "image/jpeg";
            
      return new NextResponse(bytes, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "private, max-age=120",
        },
      });
    } catch (error) {
      console.error("Unable to read custom dataset image", error);
      return NextResponse.json({ error: "Custom dataset image is unavailable" }, { status: 503 });
    }
  }

  return NextResponse.json({ error: "Unsupported image URL" }, { status: 400 });
}
