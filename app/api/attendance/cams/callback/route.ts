import { NextResponse } from "next/server";
import { getAcademyData, saveAcademyData } from "@/lib/academyStore";

export const runtime = "nodejs";

type StoredData = Awaited<ReturnType<typeof getAcademyData>> & {
  attendanceMappings?: Array<Record<string, unknown>>;
  attendancePunches?: Array<Record<string, unknown>>;
};

export async function POST(request: Request) {
  let payload: Record<string, any>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ status: "invalid_json" }, { status: 400 });
  }

  const realTime = payload.RealTime ?? {};
  const punchLog = realTime.PunchLog ?? {};
  const authToken = String(realTime.AuthToken ?? payload.AuthToken ?? "");
  const expectedToken = process.env.CAMS_AUTH_TOKEN ?? "VOLTRON_CAMS_DEMO_TOKEN";
  const isValidToken = authToken === expectedToken;
  const camsUserId = String(punchLog.UserId ?? punchLog.UserID ?? "");
  const logTime = String(punchLog.LogTime ?? "");
  const punchType = String(punchLog.Type ?? "CheckIn");
  const serialNumber = String(realTime.SerialNumber ?? "");
  const operationId = String(realTime.OperationID ?? payload.OperationID ?? "");

  if (!camsUserId || !logTime) {
    return NextResponse.json({ status: "invalid_punch" }, { status: 400 });
  }

  const data = await getAcademyData() as StoredData;
  const mappings = Array.isArray(data.attendanceMappings) ? data.attendanceMappings : [];
  const punches = Array.isArray(data.attendancePunches) ? data.attendancePunches : [];
  const mapping = mappings.find((record) =>
    String(record.camsUserId ?? "") === camsUserId &&
    String(record.status ?? "Active") === "Active"
  );
  const duplicate = punches.find((record) =>
    (operationId && String(record.operationId ?? "") === operationId) ||
    (
      String(record.camsUserId ?? "") === camsUserId &&
      String(record.logTime ?? "") === logTime &&
      String(record.punchType ?? "") === punchType &&
      String(record.serialNumber ?? "") === serialNumber
    )
  );

  const storedPunch = {
    id: createServerId("punch"),
    operationId: operationId || undefined,
    camsUserId,
    employeeId: mapping ? String(mapping.employeeId ?? "") : undefined,
    logTime,
    punchType,
    inputType: String(punchLog.InputType ?? "Fingerprint"),
    serialNumber: serialNumber || undefined,
    labelName: realTime.LabelName ? String(realTime.LabelName) : undefined,
    temperature: punchLog.Temperature ? String(punchLog.Temperature) : undefined,
    faceMask: typeof punchLog.FaceMask === "boolean" ? punchLog.FaceMask : undefined,
    authTokenStatus: isValidToken ? "Valid" : "Invalid",
    receivedAt: new Date().toISOString(),
    source: "CAMS Callback",
    duplicateOf: duplicate ? String(duplicate.id ?? "") : undefined
  };

  await saveAcademyData({
    ...data,
    attendancePunches: [...punches, storedPunch]
  });

  if (!isValidToken) {
    return NextResponse.json({ status: "invalid_auth" }, { status: 401 });
  }

  return NextResponse.json({ status: "done" });
}

function createServerId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
