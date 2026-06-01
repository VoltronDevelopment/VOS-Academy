import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/academyAuth";
import { getAcademyData, resetAcademyData, saveAcademyData } from "@/lib/academyStore";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const data = await getAcademyData();
  return NextResponse.json(data);
}

export async function PUT(request: Request) {
  const session = await getCurrentSession();
  if (!session) {
    return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  }

  const data = await request.json();
  const savedData = await saveAcademyData(data);
  return NextResponse.json(savedData);
}

export async function POST() {
  const session = await getCurrentSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  const data = await resetAcademyData();
  return NextResponse.json(data);
}
