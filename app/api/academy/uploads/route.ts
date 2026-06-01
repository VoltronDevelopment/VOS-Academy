import { mkdir, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/academyAuth";

export const runtime = "nodejs";

const maxUploadBytes = 15 * 1024 * 1024;
const allowedTypes = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/ogg",
  "audio/webm"
]);

let s3Client: S3Client | undefined;

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }

  if (!allowedTypes.has(file.type)) {
    return NextResponse.json({ error: "Upload only image, PDF, or audio files." }, { status: 400 });
  }

  if (file.size > maxUploadBytes) {
    return NextResponse.json({ error: "File is larger than 15 MB." }, { status: 400 });
  }

  const ext = extensionFor(file);
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-").slice(0, 90);
  const safeFileName = safeName.includes(".") ? safeName : `${safeName || "training-file"}${ext}`;
  const storedName = `${Date.now()}-${randomUUID()}-${safeFileName}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  const mediaType = file.type === "application/pdf" ? "pdf" : file.type.startsWith("audio/") ? "audio" : "image";

  if (useS3Uploads()) {
    const key = `${uploadPrefix()}${storedName}`;
    await getS3Client().send(new PutObjectCommand({
      Bucket: uploadBucketName(),
      Key: key,
      Body: bytes,
      ContentType: file.type,
      Metadata: {
        originalName: safeName || "training-file"
      }
    }));

    return NextResponse.json({
      name: file.name,
      storedName: key,
      mediaType,
      url: `/api/academy/uploads?key=${encodeURIComponent(key)}`,
      size: file.size,
      storage: "s3"
    });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, storedName);
  await writeFile(filePath, bytes);

  return NextResponse.json({
    name: file.name,
    storedName,
    mediaType,
    url: `/uploads/${storedName}`,
    size: file.size
  });
}

export async function GET(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  if (!useS3Uploads()) {
    return NextResponse.json({ error: "S3 upload storage is not enabled." }, { status: 404 });
  }

  const key = new URL(request.url).searchParams.get("key");
  if (!key || key.includes("..")) {
    return NextResponse.json({ error: "Invalid file key." }, { status: 400 });
  }

  const object = await getS3Client().send(new GetObjectCommand({
    Bucket: uploadBucketName(),
    Key: key
  }));
  const body = object.Body as undefined | { transformToByteArray?: () => Promise<Uint8Array> };
  const bytes = body?.transformToByteArray ? await body.transformToByteArray() : new Uint8Array();

  return new NextResponse(bytes, {
    headers: {
      "Content-Type": object.ContentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=300"
    }
  });
}

function useS3Uploads() {
  return process.env.ACADEMY_UPLOAD_DRIVER === "s3" || Boolean(process.env.ACADEMY_UPLOAD_BUCKET);
}

function uploadBucketName() {
  const bucket = process.env.ACADEMY_UPLOAD_BUCKET;
  if (!bucket) {
    throw new Error("ACADEMY_UPLOAD_BUCKET is required when using S3 upload storage.");
  }
  return bucket;
}

function uploadPrefix() {
  const prefix = process.env.ACADEMY_UPLOAD_PREFIX ?? "training/";
  return prefix.endsWith("/") ? prefix : `${prefix}/`;
}

function getS3Client() {
  if (!s3Client) {
    const region = process.env.VOLTRON_AWS_REGION ?? process.env.AWS_REGION ?? "ap-south-1";
    s3Client = new S3Client({ region });
  }
  return s3Client;
}

function extensionFor(file: File) {
  if (file.name.includes(".")) {
    return "";
  }

  if (file.type === "application/pdf") {
    return ".pdf";
  }

  if (file.type === "audio/mpeg" || file.type === "audio/mp3") {
    return ".mp3";
  }

  if (file.type === "audio/wav" || file.type === "audio/x-wav" || file.type === "audio/wave") {
    return ".wav";
  }

  if (file.type === "audio/mp4" || file.type === "audio/x-m4a" || file.type === "audio/aac") {
    return ".m4a";
  }

  if (file.type === "audio/ogg") {
    return ".ogg";
  }

  if (file.type === "audio/webm") {
    return ".webm";
  }

  if (file.type === "image/png") {
    return ".png";
  }

  if (file.type === "image/webp") {
    return ".webp";
  }

  if (file.type === "image/gif") {
    return ".gif";
  }

  return ".jpg";
}
