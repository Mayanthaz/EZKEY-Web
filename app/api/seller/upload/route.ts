import { requireSellerAuth } from "@/lib/seller/auth";
import { NextResponse } from "next/server";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";


const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

export async function POST(request: Request) {
  const auth = await requireSellerAuth();
  if (!auth.authorized) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided", code: "BAD_REQUEST" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: "File size exceeds the 5MB limit",
          code: "FILE_TOO_LARGE",
        },
        { status: 400 }
      );
    }

    const ext = ALLOWED_MIME_TYPES[file.type];
    if (!ext) {
      return NextResponse.json(
        {
          error: "Invalid file type. Allowed formats: PNG, JPEG, WEBP",
          code: "INVALID_FILE_TYPE",
        },
        { status: 400 }
      );
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "listings");
    await mkdir(uploadDir, { recursive: true });

    const safeFilename = `listing_${crypto.randomUUID()}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/listings/${safeFilename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename: safeFilename,
      size: file.size,
    });
  } catch (error) {
    console.error("Internal upload failed:", error);
    return NextResponse.json(
      { error: "Failed to upload image to internal server", code: "UPLOAD_ERROR" },
      { status: 500 }
    );
  }
}
