import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = ["smiley-school", "smiley-school/gallery", "smiley-school/posts"];
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024; // 10 MB

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const folder = body.folder ?? "smiley-school";

  // Validate folder to prevent path traversal
  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  // Validate file size if provided
  const fileSize = body.fileSize;
  if (typeof fileSize === "number" && fileSize > MAX_UPLOAD_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 10 MB)" },
      { status: 400 }
    );
  }

  // Validate MIME type if provided
  const mimeType = body.mimeType;
  if (typeof mimeType === "string") {
    const allowedMimes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedMimes.includes(mimeType)) {
      return NextResponse.json(
        { error: "Invalid file type (only JPEG, PNG, WebP, GIF allowed)" },
        { status: 400 }
      );
    }
  }

  const timestamp = Math.round(Date.now() / 1000);
  const result = generateUploadSignature(folder, timestamp);

  return NextResponse.json({ ...result, timestamp });
}