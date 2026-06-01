import { NextResponse } from "next/server";
import { academySessionCookie, cookieOptions, createSessionToken } from "@/lib/academyAuth";
import { getAcademyData } from "@/lib/academyStore";

export const runtime = "nodejs";

type LoginRequest = {
  email?: string;
  password?: string;
  role?: "admin" | "employee";
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginRequest;
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role = body.role;

  if (!email || !password || !role) {
    return NextResponse.json({ error: "Email, password and role are required." }, { status: 400 });
  }

  if (role === "admin") {
    const adminEmail = process.env.ACADEMY_ADMIN_EMAIL ?? "admin@voltroncoat.com";
    const adminPassword = process.env.ACADEMY_ADMIN_PASSWORD ?? "voltron";

    if (email !== adminEmail.toLowerCase() || password !== adminPassword) {
      return NextResponse.json({ error: "Invalid admin credentials." }, { status: 401 });
    }

    const token = createSessionToken({
      role: "admin",
      email,
      name: "Voltron Admin"
    });
    const response = NextResponse.json({
      user: {
        role: "admin",
        email,
        name: "Voltron Admin"
      }
    });
    response.cookies.set(academySessionCookie, token, cookieOptions());
    return response;
  }

  const employeePassword = process.env.ACADEMY_EMPLOYEE_PASSWORD ?? "voltron";
  const data = await getAcademyData();
  const employee = data.employees.find((record) => {
    const employeeRecord = record as { email?: string; status?: string };
    return employeeRecord.email?.toLowerCase() === email && employeeRecord.status !== "Inactive";
  }) as undefined | { id: string; name: string; email: string };

  if (!employee || password !== employeePassword) {
    return NextResponse.json({ error: "Invalid employee credentials." }, { status: 401 });
  }

  const token = createSessionToken({
    role: "employee",
    email,
    name: employee.name,
    employeeId: employee.id
  });
  const response = NextResponse.json({
    user: {
      role: "employee",
      email,
      name: employee.name,
      employeeId: employee.id
    }
  });
  response.cookies.set(academySessionCookie, token, cookieOptions());
  return response;
}
