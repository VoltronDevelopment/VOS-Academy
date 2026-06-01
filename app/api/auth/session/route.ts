import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/academyAuth";

export const runtime = "nodejs";

export async function GET() {
  const session = await getCurrentSession();

  if (!session) {
    return NextResponse.json({ authenticated: false });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      role: session.role,
      email: session.email,
      name: session.name,
      employeeId: session.employeeId
    }
  });
}
