import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { generateUploadSignature } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { folder = "smiley-school" } = await req.json();
  const timestamp = Math.round(Date.now() / 1000);

  const result = generateUploadSignature(folder, timestamp);

  return NextResponse.json({ ...result, timestamp });
}