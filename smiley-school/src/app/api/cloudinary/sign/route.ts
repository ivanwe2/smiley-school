import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

const ALLOWED_FOLDERS = ["smiley-school", "smiley-school/gallery", "smiley-school/posts"];

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const folder = body.folder ?? "smiley-school";

  if (!ALLOWED_FOLDERS.includes(folder)) {
    return NextResponse.json({ error: "Invalid upload folder" }, { status: 400 });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const result = generateUploadSignature(folder, timestamp);

  return NextResponse.json({ ...result, timestamp });
}
