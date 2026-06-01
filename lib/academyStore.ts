import Database from "better-sqlite3";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  BatchWriteCommand,
  DynamoDBDocumentClient,
  QueryCommand
} from "@aws-sdk/lib-dynamodb";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

type AcademyData = {
  employees: Array<Record<string, unknown>>;
  modules: Array<Record<string, unknown>>;
  assignments: Array<Record<string, unknown>>;
  assignmentRules: Array<Record<string, unknown>>;
  certificates: Array<Record<string, unknown>>;
  kpis: Array<Record<string, unknown>>;
  kpiReviews: Array<Record<string, unknown>>;
  skills: Array<Record<string, unknown>>;
  signOffs: Array<Record<string, unknown>>;
  attendanceMappings: Array<Record<string, unknown>>;
  shiftRules: Array<Record<string, unknown>>;
  attendancePunches: Array<Record<string, unknown>>;
};

const dataDir = path.join(process.cwd(), "data");
const dbFile = path.join(dataDir, "academy.sqlite");
const legacyDataFile = path.join(dataDir, "academy-db.json");

type CollectionName = keyof AcademyData;
type JsonRecord = Record<string, unknown>;
type AcademyDb = Database.Database;
type AcademyTableItem = {
  pk: string;
  sk: string;
  collection: CollectionName;
  id: string;
  payload: JsonRecord;
  updatedAt: string;
};

const validTrainingLanguages = ["English", "Hindi", "Marathi"];
const collectionNames: CollectionName[] = [
  "employees",
  "modules",
  "assignments",
  "assignmentRules",
  "certificates",
  "kpis",
  "kpiReviews",
  "skills",
  "signOffs",
  "attendanceMappings",
  "shiftRules",
  "attendancePunches"
];

const defaultAcademyData: AcademyData = {
  employees: [
    {
      id: "emp-ramesh",
      name: "Ramesh Pawar",
      email: "employee@voltroncoat.com",
      department: "Production",
      roleTitle: "Rack Loading Operator",
      status: "Active"
    },
    {
      id: "emp-suresh",
      name: "Suresh Jadhav",
      email: "suresh@voltroncoat.com",
      department: "Production",
      roleTitle: "Hoist Operator",
      status: "Active"
    },
    {
      id: "emp-meena",
      name: "Meena Patil",
      email: "meena@voltroncoat.com",
      department: "Quality",
      roleTitle: "Final Inspector",
      status: "Active"
    },
    {
      id: "emp-arjun",
      name: "Arjun Singh",
      email: "arjun@voltroncoat.com",
      department: "EHS",
      roleTitle: "Safety Coordinator",
      status: "Active"
    }
  ],
  modules: [
    {
      id: "mod-safety",
      title: "Plant Safety Induction",
      owner: "EHS",
      language: "Marathi / Hindi / English",
      validityMonths: 12,
      status: "Published",
      slides: [
        {
          title: "PPE Before Entry",
          body: "Helmet, safety shoes, gloves and eye protection are mandatory before entering chemical, coating, and oven areas.",
          duration: 4,
          audioRef: "safety/ppe-before-entry.mp3"
        },
        {
          title: "Chemical Area Discipline",
          body: "Do not touch tanks, valves, chemicals, or dosing systems unless you are trained and authorized for that area.",
          duration: 4,
          audioRef: "safety/chemical-area-discipline.mp3"
        },
        {
          title: "Report Abnormalities",
          body: "Any spill, unsafe condition, missing guard, or unusual smell must be reported immediately to the responsible person.",
          duration: 4,
          audioRef: "safety/report-abnormalities.mp3"
        }
      ],
      quiz: [
        {
          question: "When is PPE required?",
          options: ["Only during audits", "Before entering controlled plant areas", "Only near dispatch"],
          answer: 1
        },
        {
          question: "What should an employee do after seeing a chemical spill?",
          options: ["Ignore it", "Report it immediately", "Wash it without informing anyone"],
          answer: 1
        }
      ]
    },
    {
      id: "mod-rack",
      title: "Rack Loading Discipline",
      owner: "Production",
      language: "Marathi / Hindi",
      validityMonths: 12,
      status: "Published",
      slides: [
        {
          title: "Correct Contact Point",
          body: "Parts must be loaded so electrical contact remains stable through pretreatment, CED bath, UF rinse, and oven curing.",
          duration: 4,
          audioRef: "rack/correct-contact-point.mp3"
        },
        {
          title: "Avoid Metal-to-Metal Damage",
          body: "Maintain part spacing and avoid loading patterns that create dents, scratches, shadow areas, or drain marks.",
          duration: 4,
          audioRef: "rack/avoid-metal-damage.mp3"
        },
        {
          title: "Traceability",
          body: "Rack number, lot identity, shift, and operator details must remain traceable for production and audit evidence.",
          duration: 4,
          audioRef: "rack/traceability.mp3"
        }
      ],
      quiz: [
        {
          question: "Why is rack contact important?",
          options: ["For stable coating deposition", "For faster billing", "For packing only"],
          answer: 0
        },
        {
          question: "What must be avoided during loading?",
          options: ["Part spacing", "Metal-to-metal damage", "Lot identification"],
          answer: 1
        }
      ]
    },
    {
      id: "mod-chemical",
      title: "PPE and Chemical Handling",
      owner: "EHS",
      language: "Marathi / Hindi / English",
      validityMonths: 12,
      status: "Review",
      slides: [
        {
          title: "Authorized Handling",
          body: "Only trained personnel should handle chemicals, dosing systems, MSDS documents, and emergency response kits.",
          duration: 4,
          audioRef: "chemical/authorized-handling.mp3"
        },
        {
          title: "Label and Storage",
          body: "Chemicals must be stored with correct labels, compatibility discipline, and spill containment readiness.",
          duration: 4,
          audioRef: "chemical/label-and-storage.mp3"
        }
      ],
      quiz: [
        {
          question: "Who should handle chemicals?",
          options: ["Any visitor", "Only trained and authorized personnel", "Only dispatch staff"],
          answer: 1
        }
      ]
    }
  ],
  assignments: [
    {
      id: "asg-safety-ramesh",
      employeeId: "emp-ramesh",
      moduleId: "mod-safety",
      dueDate: "2026-05-31",
      frequency: "Yearly",
      status: "In Progress",
      assignedAt: "2026-05-28",
      currentSlide: 0,
      slideLogs: []
    },
    {
      id: "asg-rack-ramesh",
      employeeId: "emp-ramesh",
      moduleId: "mod-rack",
      dueDate: "2027-05-28",
      frequency: "Yearly",
      status: "Completed",
      assignedAt: "2026-05-28",
      currentSlide: 2,
      slideLogs: ["Slide 1 completed", "Slide 2 completed", "Slide 3 completed"],
      quizScore: 100,
      certificateId: "cert-rack-ramesh"
    },
    {
      id: "asg-chemical-suresh",
      employeeId: "emp-suresh",
      moduleId: "mod-chemical",
      dueDate: "2026-06-07",
      frequency: "Yearly",
      status: "Pending",
      assignedAt: "2026-05-28",
      currentSlide: 0,
      slideLogs: []
    }
  ],
  assignmentRules: [
    {
      id: "rule-production-onboarding",
      name: "Production Department Onboarding",
      scope: "Department",
      department: "Production",
      moduleIds: ["mod-safety", "mod-chemical"],
      frequency: "Yearly",
      dueDays: 7,
      targetSkillLevel: "L1",
      practicalSignOffRequired: false,
      status: "Active",
      createdAt: "2026-05-28"
    },
    {
      id: "rule-rack-loading-l4",
      name: "Rack Loading Operator Certification",
      scope: "Role",
      role: "Rack Loading Operator",
      moduleIds: ["mod-rack", "mod-safety"],
      frequency: "Yearly",
      dueDays: 5,
      targetSkillLevel: "L4",
      practicalSignOffRequired: true,
      status: "Active",
      createdAt: "2026-05-28"
    },
    {
      id: "rule-ehs-chemical",
      name: "EHS Chemical Safety",
      scope: "Department",
      department: "EHS",
      moduleIds: ["mod-safety", "mod-chemical"],
      frequency: "Half-yearly",
      dueDays: 10,
      targetSkillLevel: "L2",
      practicalSignOffRequired: true,
      status: "Active",
      createdAt: "2026-05-28"
    }
  ],
  certificates: [
    {
      id: "cert-rack-ramesh",
      employeeId: "emp-ramesh",
      moduleId: "mod-rack",
      assignmentId: "asg-rack-ramesh",
      issuedAt: "2026-05-28",
      validTill: "2027-05-28",
      score: 100
    }
  ],
  kpis: [
    {
      id: "kpi-quality-fpy",
      title: "First Pass Yield >= 97%",
      level: "L1 Company",
      pillar: "Quality",
      owner: "CTO",
      approver: "Founders",
      weight: 20,
      target: "FPY >= 97% with controlled rework and rejection",
      frequency: "Monthly",
      dataSource: "Odoo future",
      status: "On Track",
      currentScore: 86
    },
    {
      id: "kpi-cto-quality",
      title: "Process stability and quality performance",
      level: "L2 Leadership",
      pillar: "Quality",
      owner: "Omkar - CTO",
      approver: "CEO / Founders",
      weight: 25,
      target: "Stable DFT, bath discipline, FPY and complaint control",
      frequency: "Quarterly",
      dataSource: "Odoo Quality + VOS Academy",
      parentId: "kpi-quality-fpy",
      status: "On Track",
      currentScore: 84
    },
    {
      id: "kpi-quality-inspection",
      title: "Inspection accuracy and defect detection",
      level: "L3 Department",
      pillar: "Quality",
      owner: "Quality Department",
      approver: "CTO",
      department: "Quality",
      weight: 25,
      target: "No false release, DFT records complete, NCRs closed",
      frequency: "Monthly",
      dataSource: "Odoo Quality",
      parentId: "kpi-cto-quality",
      linkedBehaviour: "Quality Mindset",
      status: "Watch",
      currentScore: 82
    },
    {
      id: "kpi-rack-loading",
      title: "Correct rack loading, spacing and contact",
      level: "L4 Individual",
      pillar: "Quality",
      owner: "Rack Loading Operator",
      approver: "Production Supervisor / CTO",
      department: "Production",
      role: "Rack Loading Operator",
      employeeId: "emp-ramesh",
      weight: 45,
      target: "No contact loss, no loading damage, no mixed lots",
      frequency: "Monthly",
      dataSource: "Supervisor review + VOS Academy",
      parentId: "kpi-quality-inspection",
      linkedTrainingId: "mod-rack",
      linkedSkill: "Rack Loading L4",
      linkedBehaviour: "Process Discipline",
      status: "On Track",
      currentScore: 88
    },
    {
      id: "kpi-delivery-otd",
      title: "On-time dispatch >= 95%",
      level: "L1 Company",
      pillar: "Delivery",
      owner: "CEO",
      approver: "Founders",
      weight: 15,
      target: "OTD >= 95% with accurate dispatch documents",
      frequency: "Monthly",
      dataSource: "Odoo future",
      status: "Watch",
      currentScore: 78
    },
    {
      id: "kpi-dispatch-docs",
      title: "Packing and documentation accuracy",
      level: "L3 Department",
      pillar: "Delivery",
      owner: "Dispatch Department",
      approver: "CEO / CTO",
      department: "Dispatch",
      weight: 20,
      target: "No wrong dispatch, mixed dispatch, or missing DC record",
      frequency: "Monthly",
      dataSource: "Odoo future",
      parentId: "kpi-delivery-otd",
      linkedBehaviour: "Honesty in Reporting",
      status: "Needs Action",
      currentScore: 68
    }
  ],
  kpiReviews: [
    {
      id: "review-rack-loading-may-2026",
      kpiId: "kpi-rack-loading",
      period: "2026-05",
      reviewer: "Production Supervisor",
      whatScore: 88,
      howScore: 86,
      skillScore: 90,
      teamScore: 84,
      improvementScore: 78,
      finalScore: 86,
      gateStatus: "Clear",
      actionPlan: "Continue rack loading certification and add one defect prevention suggestion next month.",
      status: "Closed",
      createdAt: "2026-05-28"
    }
  ],
  skills: [
    {
      id: "skill-ramesh-rack-loading",
      employeeId: "emp-ramesh",
      skillName: "Rack Loading",
      department: "Production",
      role: "Rack Loading Operator",
      level: "L4",
      status: "Certified",
      linkedTrainingId: "mod-rack",
      linkedKpiId: "kpi-rack-loading",
      supervisor: "Production Supervisor",
      validTill: "2027-05-28",
      lastSignOffId: "signoff-ramesh-rack-loading",
      notes: "Certified independent for rack loading with spacing, contact and lot traceability discipline.",
      updatedAt: "2026-05-28"
    },
    {
      id: "skill-suresh-hoist",
      employeeId: "emp-suresh",
      skillName: "Hoist Operation",
      department: "Production",
      role: "Hoist Operator",
      level: "L2",
      status: "Practical Pending",
      linkedTrainingId: "mod-safety",
      supervisor: "Production Supervisor",
      notes: "Training awareness recorded. Practical observation pending before independent operation.",
      updatedAt: "2026-05-28"
    },
    {
      id: "skill-meena-final-inspection",
      employeeId: "emp-meena",
      skillName: "Final Inspection",
      department: "Quality",
      role: "Final Inspector",
      level: "L3",
      status: "Certified",
      linkedTrainingId: "mod-safety",
      linkedKpiId: "kpi-quality-inspection",
      supervisor: "Quality Lead",
      validTill: "2027-05-28",
      notes: "Can work under supervision for visual checks and DFT record discipline.",
      updatedAt: "2026-05-28"
    },
    {
      id: "skill-arjun-etp-safety",
      employeeId: "emp-arjun",
      skillName: "ETP Safety Checks",
      department: "EHS",
      role: "Safety Coordinator",
      level: "L1",
      status: "Training Pending",
      linkedTrainingId: "mod-chemical",
      supervisor: "EHS Head",
      notes: "Assign chemical handling and ETP checklist training before practical sign-off.",
      updatedAt: "2026-05-28"
    }
  ],
  signOffs: [
    {
      id: "signoff-ramesh-rack-loading",
      skillRecordId: "skill-ramesh-rack-loading",
      employeeId: "emp-ramesh",
      supervisor: "Production Supervisor",
      observedAt: "2026-05-28",
      result: "Pass",
      checklist: [
        "Correct PPE used without reminder",
        "Correct rack/equipment/area identified",
        "SOP steps followed in sequence",
        "Abnormality reported honestly",
        "No unsafe shortcut observed",
        "Quality checkpoint understood"
      ],
      notes: "Observed correct loading, spacing, contact discipline and lot identification.",
      nextAction: "Maintain L4 certification and review before annual renewal."
    }
  ],
  attendanceMappings: [
    {
      id: "attmap-ramesh",
      camsUserId: "1",
      employeeId: "emp-ramesh",
      deviceSerial: "VOLTRON-GATE-01",
      status: "Active",
      notes: "Primary gate biometric user ID."
    },
    {
      id: "attmap-suresh",
      camsUserId: "2",
      employeeId: "emp-suresh",
      deviceSerial: "VOLTRON-GATE-01",
      status: "Active",
      notes: "Hoist operator attendance mapping."
    },
    {
      id: "attmap-meena",
      camsUserId: "3",
      employeeId: "emp-meena",
      deviceSerial: "VOLTRON-GATE-01",
      status: "Active",
      notes: "Quality team attendance mapping."
    },
    {
      id: "attmap-arjun",
      camsUserId: "4",
      employeeId: "emp-arjun",
      deviceSerial: "VOLTRON-GATE-01",
      status: "Active",
      notes: "EHS attendance mapping."
    }
  ],
  shiftRules: [
    {
      id: "shift-general",
      name: "General Shift",
      startTime: "08:30",
      endTime: "17:30",
      graceMinutes: 10,
      halfDayAfterMinutes: 240,
      absentAfterMinutes: 300,
      overtimeAfterMinutes: 45,
      status: "Active"
    },
    {
      id: "shift-production",
      name: "Production Shift",
      department: "Production",
      startTime: "08:30",
      endTime: "17:30",
      graceMinutes: 10,
      halfDayAfterMinutes: 240,
      absentAfterMinutes: 300,
      overtimeAfterMinutes: 45,
      status: "Active"
    }
  ],
  attendancePunches: [
    {
      id: "punch-ramesh-in-20260529",
      operationId: "demo-ramesh-in",
      camsUserId: "1",
      employeeId: "emp-ramesh",
      logTime: "2026-05-29 08:28:00 GMT +0530",
      punchType: "CheckIn",
      inputType: "Fingerprint",
      serialNumber: "VOLTRON-GATE-01",
      labelName: "Voltron Gate",
      authTokenStatus: "Valid",
      receivedAt: "2026-05-29T02:58:05.000Z",
      source: "Mock Tester"
    },
    {
      id: "punch-ramesh-out-20260529",
      operationId: "demo-ramesh-out",
      camsUserId: "1",
      employeeId: "emp-ramesh",
      logTime: "2026-05-29 17:46:00 GMT +0530",
      punchType: "CheckOut",
      inputType: "Fingerprint",
      serialNumber: "VOLTRON-GATE-01",
      labelName: "Voltron Gate",
      authTokenStatus: "Valid",
      receivedAt: "2026-05-29T12:16:06.000Z",
      source: "Mock Tester"
    },
    {
      id: "punch-suresh-in-20260529",
      operationId: "demo-suresh-in",
      camsUserId: "2",
      employeeId: "emp-suresh",
      logTime: "2026-05-29 09:06:00 GMT +0530",
      punchType: "CheckIn",
      inputType: "Face",
      serialNumber: "VOLTRON-GATE-01",
      labelName: "Voltron Gate",
      authTokenStatus: "Valid",
      receivedAt: "2026-05-29T03:36:03.000Z",
      source: "Mock Tester"
    }
  ]
};

let database: AcademyDb | undefined;

function ensureDataDir() {
  mkdirSync(dataDir, { recursive: true });
}

function getDatabase() {
  ensureDataDir();
  if (!database) {
    database = new Database(dbFile);
    database.pragma("journal_mode = WAL");
    database.pragma("foreign_keys = ON");
    migrateDatabase(database);
    seedDatabaseIfEmpty(database);
  }
  return database;
}

export async function getAcademyData() {
  if (useDynamoDbBackend()) {
    return getDynamoAcademyData();
  }
  const db = getDatabase();
  return readAcademyData(db);
}

export async function saveAcademyData(data: AcademyData) {
  if (useDynamoDbBackend()) {
    return saveDynamoAcademyData(data);
  }
  const db = getDatabase();
  const normalizedData = normalizeAcademyData(data).data;
  replaceAcademyData(db, normalizedData);
  return normalizedData;
}

export async function resetAcademyData() {
  return saveAcademyData(defaultAcademyData);
}

function migrateDatabase(db: AcademyDb) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS academy_employees (
      id TEXT PRIMARY KEY,
      email TEXT,
      status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_modules (
      id TEXT PRIMARY KEY,
      title TEXT,
      status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_assignments (
      id TEXT PRIMARY KEY,
      employee_id TEXT,
      module_id TEXT,
      status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_assignment_rules (
      id TEXT PRIMARY KEY,
      status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_certificates (
      id TEXT PRIMARY KEY,
      employee_id TEXT,
      module_id TEXT,
      assignment_id TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_kpis (
      id TEXT PRIMARY KEY,
      level TEXT,
      pillar TEXT,
      parent_id TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_kpi_reviews (
      id TEXT PRIMARY KEY,
      kpi_id TEXT,
      status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_skills (
      id TEXT PRIMARY KEY,
      employee_id TEXT,
      status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_signoffs (
      id TEXT PRIMARY KEY,
      employee_id TEXT,
      skill_id TEXT,
      result TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_attendance_mappings (
      id TEXT PRIMARY KEY,
      cams_user_id TEXT,
      employee_id TEXT,
      status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_shift_rules (
      id TEXT PRIMARY KEY,
      status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS academy_attendance_punches (
      id TEXT PRIMARY KEY,
      operation_id TEXT,
      cams_user_id TEXT,
      employee_id TEXT,
      log_time TEXT,
      punch_type TEXT,
      serial_number TEXT,
      auth_token_status TEXT,
      payload TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_academy_employees_email ON academy_employees(email);
    CREATE INDEX IF NOT EXISTS idx_academy_assignments_employee ON academy_assignments(employee_id);
    CREATE INDEX IF NOT EXISTS idx_academy_assignments_module ON academy_assignments(module_id);
    CREATE INDEX IF NOT EXISTS idx_academy_certificates_employee ON academy_certificates(employee_id);
    CREATE INDEX IF NOT EXISTS idx_academy_mappings_cams ON academy_attendance_mappings(cams_user_id);
    CREATE INDEX IF NOT EXISTS idx_academy_punches_cams ON academy_attendance_punches(cams_user_id);
  `);
}

function seedDatabaseIfEmpty(db: AcademyDb) {
  const row = db.prepare("SELECT COUNT(*) AS count FROM academy_employees").get() as { count: number };
  if (row.count > 0) {
    return;
  }

  const seedData = readLegacyJsonData() ?? defaultAcademyData;
  replaceAcademyData(db, normalizeAcademyData(seedData).data);
}

function readLegacyJsonData() {
  if (!existsSync(legacyDataFile)) {
    return undefined;
  }

  try {
    return JSON.parse(readFileSync(legacyDataFile, "utf-8")) as AcademyData;
  } catch {
    return undefined;
  }
}

let dynamoClient: DynamoDBDocumentClient | undefined;

function useDynamoDbBackend() {
  return process.env.ACADEMY_STORAGE_DRIVER === "dynamodb" || Boolean(process.env.ACADEMY_TABLE_NAME);
}

function academyTableName() {
  const tableName = process.env.ACADEMY_TABLE_NAME;
  if (!tableName) {
    throw new Error("ACADEMY_TABLE_NAME is required when using the DynamoDB backend.");
  }
  return tableName;
}

function getDynamoClient() {
  if (!dynamoClient) {
    const region = process.env.VOLTRON_AWS_REGION ?? process.env.AWS_REGION ?? "ap-south-1";
    dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }), {
      marshallOptions: {
        removeUndefinedValues: true
      }
    });
  }
  return dynamoClient;
}

async function getDynamoAcademyData() {
  const data: Partial<AcademyData> = {};
  for (const collection of collectionNames) {
    data[collection] = await readDynamoCollection(collection);
  }

  const normalized = normalizeAcademyData(data);
  const isEmpty = collectionNames.every((collection) => normalized.data[collection].length === 0);
  if (isEmpty) {
    await saveDynamoAcademyData(defaultAcademyData);
    return normalizeAcademyData(defaultAcademyData).data;
  }

  if (normalized.wasMigrated) {
    await saveDynamoAcademyData(normalized.data);
  }
  return normalized.data;
}

async function saveDynamoAcademyData(data: AcademyData) {
  const normalizedData = normalizeAcademyData(data).data;
  for (const collection of collectionNames) {
    await replaceDynamoCollection(collection, normalizedData[collection]);
  }
  return normalizedData;
}

async function readDynamoCollection(collection: CollectionName) {
  const items: JsonRecord[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await getDynamoClient().send(new QueryCommand({
      TableName: academyTableName(),
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": collectionPk(collection)
      },
      ExclusiveStartKey: exclusiveStartKey
    }));

    (response.Items as AcademyTableItem[] | undefined)?.forEach((item) => {
      if (item.payload && typeof item.payload === "object") {
        items.push(item.payload);
      }
    });
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return items;
}

async function replaceDynamoCollection(collection: CollectionName, records: JsonRecord[]) {
  const existing = await readDynamoRawCollection(collection);
  await batchWriteDynamo([
    ...existing.map((item) => ({
      DeleteRequest: {
        Key: {
          pk: item.pk,
          sk: item.sk
        }
      }
    })),
    ...records.map((record) => {
      const id = recordId(record, collection);
      return {
        PutRequest: {
          Item: {
            pk: collectionPk(collection),
            sk: id,
            collection,
            id,
            payload: record,
            updatedAt: new Date().toISOString()
          }
        }
      };
    })
  ]);
}

async function readDynamoRawCollection(collection: CollectionName) {
  const items: AcademyTableItem[] = [];
  let exclusiveStartKey: Record<string, unknown> | undefined;

  do {
    const response = await getDynamoClient().send(new QueryCommand({
      TableName: academyTableName(),
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": collectionPk(collection)
      },
      ExclusiveStartKey: exclusiveStartKey
    }));
    items.push(...((response.Items as AcademyTableItem[] | undefined) ?? []));
    exclusiveStartKey = response.LastEvaluatedKey;
  } while (exclusiveStartKey);

  return items;
}

async function batchWriteDynamo(requests: Array<Record<string, unknown>>) {
  for (let index = 0; index < requests.length; index += 25) {
    let requestItems = {
      [academyTableName()]: requests.slice(index, index + 25)
    };

    do {
      const response = await getDynamoClient().send(new BatchWriteCommand({
        RequestItems: requestItems
      }));
      requestItems = response.UnprocessedItems ?? {};
    } while (Object.keys(requestItems).length > 0);
  }
}

function collectionPk(collection: CollectionName) {
  return `COLLECTION#${collection}`;
}

function readAcademyData(db: AcademyDb): AcademyData {
  return normalizeAcademyData({
    employees: readPayloads(db, "academy_employees"),
    modules: readPayloads(db, "academy_modules"),
    assignments: readPayloads(db, "academy_assignments"),
    assignmentRules: readPayloads(db, "academy_assignment_rules"),
    certificates: readPayloads(db, "academy_certificates"),
    kpis: readPayloads(db, "academy_kpis"),
    kpiReviews: readPayloads(db, "academy_kpi_reviews"),
    skills: readPayloads(db, "academy_skills"),
    signOffs: readPayloads(db, "academy_signoffs"),
    attendanceMappings: readPayloads(db, "academy_attendance_mappings"),
    shiftRules: readPayloads(db, "academy_shift_rules"),
    attendancePunches: readPayloads(db, "academy_attendance_punches")
  }).data;
}

function readPayloads(db: AcademyDb, table: string) {
  return db.prepare(`SELECT payload FROM ${table} ORDER BY created_at ASC, rowid ASC`).all()
    .map((row) => JSON.parse(String((row as { payload: string }).payload))) as JsonRecord[];
}

function replaceAcademyData(db: AcademyDb, data: AcademyData) {
  const write = db.transaction((nextData: AcademyData) => {
    writeCollection(db, "academy_attendance_punches", nextData.attendancePunches, mapAttendancePunch);
    writeCollection(db, "academy_attendance_mappings", nextData.attendanceMappings, mapAttendanceMapping);
    writeCollection(db, "academy_shift_rules", nextData.shiftRules, mapStatusRecord);
    writeCollection(db, "academy_signoffs", nextData.signOffs, mapSignOff);
    writeCollection(db, "academy_skills", nextData.skills, mapEmployeeStatusRecord);
    writeCollection(db, "academy_kpi_reviews", nextData.kpiReviews, mapKpiReview);
    writeCollection(db, "academy_kpis", nextData.kpis, mapKpi);
    writeCollection(db, "academy_certificates", nextData.certificates, mapCertificate);
    writeCollection(db, "academy_assignment_rules", nextData.assignmentRules, mapStatusRecord);
    writeCollection(db, "academy_assignments", nextData.assignments, mapAssignment);
    writeCollection(db, "academy_modules", nextData.modules, mapModule);
    writeCollection(db, "academy_employees", nextData.employees, mapEmployee);
  });
  write(data);
}

function writeCollection(
  db: AcademyDb,
  table: string,
  records: JsonRecord[],
  mapper: (record: JsonRecord) => Record<string, string | null>
) {
  db.prepare(`DELETE FROM ${table}`).run();
  if (!records.length) {
    return;
  }

  const columns = Object.keys(mapper(records[0]));
  const placeholders = columns.map((column) => `@${column}`).join(", ");
  const statement = db.prepare(`INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`);
  records.forEach((record) => statement.run(mapper(record)));
}

function mapEmployee(record: JsonRecord) {
  return {
    id: recordId(record, "emp"),
    email: stringValue(record.email),
    status: stringValue(record.status),
    payload: JSON.stringify(record)
  };
}

function mapModule(record: JsonRecord) {
  return {
    id: recordId(record, "mod"),
    title: stringValue(record.title),
    status: stringValue(record.status),
    payload: JSON.stringify(record)
  };
}

function mapAssignment(record: JsonRecord) {
  return {
    id: recordId(record, "asg"),
    employee_id: stringValue(record.employeeId),
    module_id: stringValue(record.moduleId),
    status: stringValue(record.status),
    payload: JSON.stringify(record)
  };
}

function mapCertificate(record: JsonRecord) {
  return {
    id: recordId(record, "cert"),
    employee_id: stringValue(record.employeeId),
    module_id: stringValue(record.moduleId),
    assignment_id: stringValue(record.assignmentId),
    payload: JSON.stringify(record)
  };
}

function mapKpi(record: JsonRecord) {
  return {
    id: recordId(record, "kpi"),
    level: stringValue(record.level),
    pillar: stringValue(record.pillar),
    parent_id: stringValue(record.parentId),
    payload: JSON.stringify(record)
  };
}

function mapKpiReview(record: JsonRecord) {
  return {
    id: recordId(record, "review"),
    kpi_id: stringValue(record.kpiId),
    status: stringValue(record.status),
    payload: JSON.stringify(record)
  };
}

function mapEmployeeStatusRecord(record: JsonRecord) {
  return {
    id: recordId(record, "skill"),
    employee_id: stringValue(record.employeeId),
    status: stringValue(record.status),
    payload: JSON.stringify(record)
  };
}

function mapSignOff(record: JsonRecord) {
  return {
    id: recordId(record, "signoff"),
    employee_id: stringValue(record.employeeId),
    skill_id: stringValue(record.skillRecordId),
    result: stringValue(record.result),
    payload: JSON.stringify(record)
  };
}

function mapAttendanceMapping(record: JsonRecord) {
  return {
    id: recordId(record, "attmap"),
    cams_user_id: stringValue(record.camsUserId),
    employee_id: stringValue(record.employeeId),
    status: stringValue(record.status),
    payload: JSON.stringify(record)
  };
}

function mapAttendancePunch(record: JsonRecord) {
  return {
    id: recordId(record, "punch"),
    operation_id: stringValue(record.operationId),
    cams_user_id: stringValue(record.camsUserId),
    employee_id: stringValue(record.employeeId),
    log_time: stringValue(record.logTime),
    punch_type: stringValue(record.punchType),
    serial_number: stringValue(record.serialNumber),
    auth_token_status: stringValue(record.authTokenStatus),
    payload: JSON.stringify(record)
  };
}

function mapStatusRecord(record: JsonRecord) {
  return {
    id: recordId(record, "record"),
    status: stringValue(record.status),
    payload: JSON.stringify(record)
  };
}

function recordId(record: JsonRecord, prefix: string) {
  if (typeof record.id === "string" && record.id.trim()) {
    return record.id;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function normalizeAcademyData(input: unknown): { data: AcademyData; wasMigrated: boolean } {
  const source = (input && typeof input === "object" ? input : {}) as Partial<AcademyData>;
  const data: AcademyData = {
    employees: recordsFor(source.employees, defaultAcademyData.employees),
    modules: recordsFor(source.modules, defaultAcademyData.modules).map(normalizeModuleRecord),
    assignments: recordsFor(source.assignments, defaultAcademyData.assignments).map(normalizeAssignmentRecord),
    assignmentRules: recordsFor(source.assignmentRules, defaultAcademyData.assignmentRules),
    certificates: recordsFor(source.certificates, defaultAcademyData.certificates).map(normalizeCertificateRecord),
    kpis: recordsFor(source.kpis, defaultAcademyData.kpis),
    kpiReviews: recordsFor(source.kpiReviews, defaultAcademyData.kpiReviews),
    skills: recordsFor(source.skills, defaultAcademyData.skills),
    signOffs: recordsFor(source.signOffs, defaultAcademyData.signOffs),
    attendanceMappings: recordsFor(source.attendanceMappings, defaultAcademyData.attendanceMappings),
    shiftRules: recordsFor(source.shiftRules, defaultAcademyData.shiftRules),
    attendancePunches: recordsFor(source.attendancePunches, defaultAcademyData.attendancePunches)
  };

  return {
    data,
    wasMigrated: JSON.stringify(source) !== JSON.stringify(data)
  };
}

function recordsFor(value: unknown, fallback: JsonRecord[]) {
  return (Array.isArray(value) ? value : fallback).filter((record): record is JsonRecord =>
    Boolean(record && typeof record === "object")
  );
}

function normalizeModuleRecord(record: JsonRecord) {
  const languageText = typeof record.language === "string" ? record.language : "English";
  const languages = Array.isArray(record.languages)
    ? record.languages.filter((language): language is string => typeof language === "string" && validTrainingLanguages.includes(language))
    : validTrainingLanguages.filter((language) => languageText.toLowerCase().includes(language.toLowerCase()));
  const normalizedLanguages = languages.length ? languages : ["English"];
  const defaultLanguage = typeof record.defaultLanguage === "string" && normalizedLanguages.includes(record.defaultLanguage)
    ? record.defaultLanguage
    : normalizedLanguages[0];

  return {
    ...record,
    language: normalizedLanguages.join(" / "),
    languages: normalizedLanguages,
    defaultLanguage,
    revision: typeof record.revision === "string" && record.revision.trim() ? record.revision : "Rev 00",
    effectiveDate: typeof record.effectiveDate === "string" && record.effectiveDate ? record.effectiveDate : "2026-05-28",
    sopReference: typeof record.sopReference === "string" ? record.sopReference : "",
    approvedBy: typeof record.approvedBy === "string" && record.approvedBy.trim() ? record.approvedBy : "Academy Admin",
    slides: Array.isArray(record.slides)
      ? record.slides.map((slide) => normalizeSlideRecord(slide, normalizedLanguages))
      : [],
    quiz: Array.isArray(record.quiz)
      ? record.quiz.map((question) => normalizeQuizRecord(question, normalizedLanguages))
      : []
  };
}

function normalizeSlideRecord(value: unknown, languages: string[]) {
  const slide = (value && typeof value === "object" ? value : {}) as JsonRecord;
  const title = typeof slide.title === "string" ? slide.title : "";
  const body = typeof slide.body === "string" ? slide.body : "";
  const fallback = {
    title,
    body,
    audioRef: typeof slide.audioRef === "string" ? slide.audioRef : "",
    mediaType: typeof slide.mediaType === "string" ? slide.mediaType : "none",
    mediaName: typeof slide.mediaName === "string" ? slide.mediaName : undefined,
    mediaDataUrl: typeof slide.mediaDataUrl === "string" ? slide.mediaDataUrl : undefined
  };
  const sourceTranslations = slide.translations && typeof slide.translations === "object"
    ? slide.translations as Record<string, JsonRecord>
    : {};
  const translations = Object.fromEntries(languages.map((language) => [
    language,
    {
      ...fallback,
      ...(sourceTranslations[language] ?? {})
    }
  ]));

  return {
    ...slide,
    title,
    body,
    duration: typeof slide.duration === "number" ? slide.duration : Number(slide.duration ?? 20),
    translations
  };
}

function normalizeQuizRecord(value: unknown, languages: string[]) {
  const question = (value && typeof value === "object" ? value : {}) as JsonRecord;
  const text = typeof question.question === "string" ? question.question : "";
  const options = Array.isArray(question.options) ? question.options.map((option) => String(option)) : ["", "", ""];
  const sourceTranslations = question.translations && typeof question.translations === "object"
    ? question.translations as Record<string, JsonRecord>
    : {};
  const translations = Object.fromEntries(languages.map((language) => {
    const translated = sourceTranslations[language] ?? {};
    return [
      language,
      {
        question: typeof translated.question === "string" ? translated.question : text,
        options: Array.isArray(translated.options) ? translated.options.map((option) => String(option)) : options
      }
    ];
  }));

  return {
    ...question,
    question: text,
    options,
    answer: typeof question.answer === "number" ? question.answer : Number(question.answer ?? 0),
    translations
  };
}

function normalizeAssignmentRecord(record: JsonRecord) {
  const quizAttempts = Array.isArray(record.quizAttempts)
    ? record.quizAttempts
    : typeof record.quizScore === "number"
      ? [{
          id: `${record.id ?? "assignment"}-attempt-1`,
          attemptedAt: new Date("2026-05-28T00:00:00.000Z").toISOString(),
          language: typeof record.selectedLanguage === "string" ? record.selectedLanguage : "English",
          score: record.quizScore,
          passed: record.quizScore >= 70,
          answers: {}
        }]
      : [];
  return {
    ...record,
    quizAttempts
  };
}

function normalizeCertificateRecord(record: JsonRecord) {
  return {
    ...record,
    language: typeof record.language === "string" && validTrainingLanguages.includes(record.language)
      ? record.language
      : "English"
  };
}
