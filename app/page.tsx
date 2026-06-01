"use client";

import { useEffect, useMemo, useState, type ChangeEvent, type CSSProperties } from "react";

type Role = "admin" | "employee";
type Section = "dashboard" | "employees" | "modules" | "assignments" | "rules" | "skills" | "attendance" | "kpis" | "reports" | "certificates";
type AssignmentStatus = "Pending" | "In Progress" | "Quiz Ready" | "Completed";
type AssignmentRuleScope = "Department" | "Role" | "Department + Role";
type AssignmentRuleStatus = "Active" | "Paused";
type AttendanceMappingStatus = "Active" | "Inactive";
type ShiftRuleStatus = "Active" | "Paused";
type AttendancePunchType = "CheckIn" | "CheckOut" | "BreakOut" | "BreakIn" | "OverTimeIn" | "OverTimeOut" | "MealIn" | "MealOut";
type AttendanceInputType = "Fingerprint" | "Face" | "Palm" | "Card" | "Password";
type AttendanceAuthStatus = "Valid" | "Invalid";
type AttendanceDayStatus = "Present" | "Late" | "Half Day" | "Absent" | "Overtime" | "Unmapped";
type TrainingLanguage = "English" | "Hindi" | "Marathi";
type SkillLevel = "L0" | "L1" | "L2" | "L3" | "L4" | "L5";
type SkillStatus = "Not Started" | "Training Pending" | "Practical Pending" | "Certified" | "Renewal Due" | "Expired";
type SignOffResult = "Pass" | "Fail" | "Needs Reassessment";
type KpiLevel = "L1 Company" | "L2 Leadership" | "L3 Department" | "L4 Individual";
type KpiPillar = "Safety" | "Quality" | "Delivery" | "Cost" | "Growth" | "People" | "ESG";
type KpiStatus = "On Track" | "Watch" | "Needs Action" | "Draft";
type KpiGateStatus = "Clear" | "Blocked";
type KpiReviewStatus = "Open" | "Closed";
type KpiDataSource =
  | "Manual"
  | "VOS Academy"
  | "Odoo future"
  | "Odoo Quality"
  | "Odoo HR"
  | "EHS record"
  | "Supervisor review"
  | "Odoo Quality + VOS Academy"
  | "Supervisor review + VOS Academy";

type Employee = {
  id: string;
  name: string;
  email: string;
  department: string;
  roleTitle: string;
  status: "Active" | "Inactive";
};

type LocalizedTrainingSlide = {
  title: string;
  body: string;
  audioRef?: string;
  mediaType?: "none" | "image" | "pdf";
  mediaName?: string;
  mediaDataUrl?: string;
};

type TrainingSlide = {
  title: string;
  body: string;
  duration: number;
  audioRef?: string;
  mediaType?: "none" | "image" | "pdf";
  mediaName?: string;
  mediaDataUrl?: string;
  translations?: Partial<Record<TrainingLanguage, LocalizedTrainingSlide>>;
};

type LocalizedQuizQuestion = {
  question: string;
  options: string[];
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  translations?: Partial<Record<TrainingLanguage, LocalizedQuizQuestion>>;
};

type QuizAttempt = {
  id: string;
  attemptedAt: string;
  language: TrainingLanguage;
  score: number;
  passed: boolean;
  answers: Record<number, number>;
};

type TrainingModule = {
  id: string;
  title: string;
  owner: string;
  language: string;
  languages?: TrainingLanguage[];
  defaultLanguage?: TrainingLanguage;
  revision?: string;
  effectiveDate?: string;
  sopReference?: string;
  approvedBy?: string;
  validityMonths: number;
  status: "Draft" | "Published" | "Review";
  slides: TrainingSlide[];
  quiz: QuizQuestion[];
};

type Assignment = {
  id: string;
  employeeId: string;
  moduleId: string;
  dueDate: string;
  frequency: string;
  status: AssignmentStatus;
  assignedAt: string;
  currentSlide: number;
  slideLogs: string[];
  quizScore?: number;
  certificateId?: string;
  selectedLanguage?: TrainingLanguage;
  quizAttempts?: QuizAttempt[];
};

type AssignmentRule = {
  id: string;
  name: string;
  scope: AssignmentRuleScope;
  department?: string;
  role?: string;
  moduleIds: string[];
  frequency: string;
  dueDays: number;
  targetSkillLevel?: SkillLevel;
  practicalSignOffRequired: boolean;
  status: AssignmentRuleStatus;
  createdAt: string;
};

type Certificate = {
  id: string;
  employeeId: string;
  moduleId: string;
  assignmentId: string;
  issuedAt: string;
  validTill: string;
  score: number;
  language?: TrainingLanguage;
};

type KPI = {
  id: string;
  title: string;
  level: KpiLevel;
  pillar: KpiPillar;
  owner: string;
  approver: string;
  department?: string;
  role?: string;
  employeeId?: string;
  weight: number;
  target: string;
  frequency: string;
  dataSource: KpiDataSource;
  parentId?: string;
  linkedTrainingId?: string;
  linkedSkill?: string;
  linkedBehaviour?: string;
  status: KpiStatus;
  currentScore?: number;
};

type KpiReview = {
  id: string;
  kpiId: string;
  period: string;
  reviewer: string;
  whatScore: number;
  howScore: number;
  skillScore: number;
  teamScore: number;
  improvementScore: number;
  finalScore: number;
  gateStatus: KpiGateStatus;
  actionPlan: string;
  status: KpiReviewStatus;
  createdAt: string;
};

type SkillRecord = {
  id: string;
  employeeId: string;
  skillName: string;
  department: string;
  role: string;
  level: SkillLevel;
  status: SkillStatus;
  linkedTrainingId?: string;
  linkedKpiId?: string;
  supervisor: string;
  validTill?: string;
  lastSignOffId?: string;
  notes: string;
  updatedAt: string;
};

type PracticalSignOff = {
  id: string;
  skillRecordId: string;
  employeeId: string;
  supervisor: string;
  observedAt: string;
  result: SignOffResult;
  checklist: string[];
  notes: string;
  nextAction: string;
};

type AttendanceMapping = {
  id: string;
  camsUserId: string;
  employeeId: string;
  deviceSerial?: string;
  status: AttendanceMappingStatus;
  notes: string;
};

type ShiftRule = {
  id: string;
  name: string;
  department?: string;
  role?: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  halfDayAfterMinutes: number;
  absentAfterMinutes: number;
  overtimeAfterMinutes: number;
  status: ShiftRuleStatus;
};

type AttendancePunch = {
  id: string;
  operationId?: string;
  camsUserId: string;
  employeeId?: string;
  logTime: string;
  punchType: AttendancePunchType;
  inputType: AttendanceInputType;
  serialNumber?: string;
  labelName?: string;
  temperature?: string;
  faceMask?: boolean;
  authTokenStatus: AttendanceAuthStatus;
  receivedAt: string;
  source: "CAMS Callback" | "Mock Tester";
  duplicateOf?: string;
};

type AttendanceSummary = {
  key: string;
  date: string;
  employeeId?: string;
  employeeName: string;
  camsUserId: string;
  department: string;
  shiftName: string;
  firstPunch: string;
  lastPunch: string;
  punchCount: number;
  minutesWorked: number;
  status: AttendanceDayStatus;
  score: number;
};

type AcademyData = {
  employees: Employee[];
  modules: TrainingModule[];
  assignments: Assignment[];
  assignmentRules: AssignmentRule[];
  certificates: Certificate[];
  kpis: KPI[];
  kpiReviews: KpiReview[];
  skills: SkillRecord[];
  signOffs: PracticalSignOff[];
  attendanceMappings: AttendanceMapping[];
  shiftRules: ShiftRule[];
  attendancePunches: AttendancePunch[];
};

const academyApi = "/api/academy";
const uploadApi = "/api/academy/uploads";
const authApi = "/api/auth";
const trainingLanguages: TrainingLanguage[] = ["English", "Hindi", "Marathi"];
const defaultTrainingLanguage: TrainingLanguage = "English";

const flow = [
  ["Admin Assigns", "Role, department, or employee"],
  ["Employee Learns", "Locked slide and audio sequence"],
  ["Quiz Passed", "Score and attempts recorded"],
  ["Certificate", "PDF-ready evidence and validity"]
];

const evidence = [
  "Module revision",
  "Assigned date",
  "Slide completion log",
  "Audio completion",
  "Quiz score",
  "Certificate validity"
];

const assignmentRuleScopes: AssignmentRuleScope[] = ["Department", "Role", "Department + Role"];
const assignmentRuleStatuses: AssignmentRuleStatus[] = ["Active", "Paused"];
const attendancePunchTypes: AttendancePunchType[] = ["CheckIn", "CheckOut", "BreakOut", "BreakIn", "OverTimeIn", "OverTimeOut", "MealIn", "MealOut"];
const attendanceInputTypes: AttendanceInputType[] = ["Fingerprint", "Face", "Palm", "Card", "Password"];
const attendanceMappingStatuses: AttendanceMappingStatus[] = ["Active", "Inactive"];
const shiftRuleStatuses: ShiftRuleStatus[] = ["Active", "Paused"];
const camsDemoAuthToken = "VOLTRON_CAMS_DEMO_TOKEN";
const skillLevels: SkillLevel[] = ["L0", "L1", "L2", "L3", "L4", "L5"];
const skillStatuses: SkillStatus[] = [
  "Not Started",
  "Training Pending",
  "Practical Pending",
  "Certified",
  "Renewal Due",
  "Expired"
];
const signOffResults: SignOffResult[] = ["Pass", "Fail", "Needs Reassessment"];
const practicalChecklist = [
  "Correct PPE used without reminder",
  "Correct rack/equipment/area identified",
  "SOP steps followed in sequence",
  "Abnormality reported honestly",
  "No unsafe shortcut observed",
  "Quality checkpoint understood"
];
const kpiLevels: KpiLevel[] = ["L1 Company", "L2 Leadership", "L3 Department", "L4 Individual"];
const kpiPillars: KpiPillar[] = ["Safety", "Quality", "Delivery", "Cost", "Growth", "People", "ESG"];
const kpiStatuses: KpiStatus[] = ["On Track", "Watch", "Needs Action", "Draft"];
const kpiGateStatuses: KpiGateStatus[] = ["Clear", "Blocked"];
const kpiReviewStatuses: KpiReviewStatus[] = ["Open", "Closed"];
const kpiDataSources: KpiDataSource[] = [
  "Manual",
  "VOS Academy",
  "Odoo future",
  "Odoo Quality",
  "Odoo HR",
  "EHS record",
  "Supervisor review",
  "Odoo Quality + VOS Academy",
  "Supervisor review + VOS Academy"
];
const behaviourDimensions = [
  "Safety Discipline",
  "Quality Mindset",
  "Process Discipline",
  "Honesty in Reporting",
  "Teamwork",
  "Ownership",
  "Learning Attitude",
  "Respect and Communication"
];
const kpiReviewWeights = [
  ["WHAT", "Role KPI results", 45],
  ["HOW", "Behaviour and discipline", 25],
  ["SKILL", "Training and certification", 15],
  ["TEAM", "Department contribution", 10],
  ["IMPROVE", "Kaizen and correction", 5]
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

export default function Home() {
  const [role, setRole] = useState<Role>("admin");
  const [email, setEmail] = useState("admin@voltroncoat.com");
  const [password, setPassword] = useState("voltron");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeSection, setActiveSection] = useState<Section>("dashboard");
  const [data, setData] = useState<AcademyData>(defaultAcademyData);
  const [backendStatus, setBackendStatus] = useState("Sign in to connect backend");
  const [authStatus, setAuthStatus] = useState("Session not started");

  useEffect(() => {
    let isActive = true;

    async function restoreSession() {
      try {
        const response = await fetch(`${authApi}/session`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error("Session check failed.");
        }

        const session = (await response.json()) as {
          authenticated: boolean;
          user?: { role: Role; email: string };
        };
        if (!session.authenticated || !session.user) {
          if (isActive) {
            setAuthStatus("Ready to sign in");
          }
          return;
        }

        if (isActive) {
          setRole(session.user.role);
          setEmail(session.user.email);
          setIsLoggedIn(true);
          setAuthStatus("Session restored");
          void loadBackendData();
        }
      } catch {
        if (isActive) {
          setAuthStatus("Ready to sign in");
        }
      }
    }

    restoreSession();

    return () => {
      isActive = false;
    };
  }, []);

  const currentEmployee = useMemo(
    () =>
      data.employees.find((employee) => employee.email.toLowerCase() === email.toLowerCase()) ??
      data.employees[0],
    [data.employees, email]
  );

  const roleLabel = role === "admin" ? "Admin" : "Employee";

  async function loadBackendData() {
    try {
      const response = await fetch(academyApi, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Could not load Academy data.");
      }

      const backendData = (await response.json()) as AcademyData;
      setData(backendData);
      setBackendStatus("Backend connected");
    } catch {
      setBackendStatus("Backend unavailable for this session.");
    }
  }

  async function login() {
    setAuthStatus("Signing in...");
    try {
      const response = await fetch(`${authApi}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password, role })
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Login failed.");
      }

      setIsLoggedIn(true);
      setActiveSection("dashboard");
      setAuthStatus(`${roleLabel} session active`);
      await loadBackendData();
    } catch (error) {
      setAuthStatus(error instanceof Error ? error.message : "Login failed.");
    }
  }

  async function logout(nextRole?: Role) {
    await fetch(`${authApi}/logout`, { method: "POST" }).catch(() => undefined);
    setIsLoggedIn(false);
    setActiveSection("dashboard");
    setBackendStatus("Sign in to connect backend");
    setAuthStatus("Signed out");
    if (nextRole) {
      setRole(nextRole);
      setEmail(nextRole === "admin" ? "admin@voltroncoat.com" : "employee@voltroncoat.com");
    }
    setPassword("voltron");
  }

  async function persistData(nextData: AcademyData) {
    try {
      const response = await fetch(academyApi, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(nextData)
      });

      if (!response.ok) {
        throw new Error("Save failed.");
      }

      setBackendStatus("Saved to backend");
    } catch {
      setBackendStatus("Save failed. Current changes are only in memory.");
    }
  }

  function updateData(updater: (current: AcademyData) => AcademyData) {
    setData((current) => {
      const nextData = updater(current);
      void persistData(nextData);
      return nextData;
    });
  }

  async function resetDemoData() {
    try {
      const response = await fetch(academyApi, { method: "POST" });
      if (!response.ok) {
        throw new Error("Reset failed.");
      }

      const resetData = (await response.json()) as AcademyData;
      setData(resetData);
      setBackendStatus("Demo data reset on backend");
      setActiveSection("dashboard");
    } catch {
      setBackendStatus("Reset failed.");
    }
  }

  function exportEvidence() {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "voltron-academy-evidence.json";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  if (!isLoggedIn) {
    return (
      <main className="login-page">
        <div className="login-grid" aria-hidden="true" />
        <section className="login-card">
          <div className="brand-mark">
            <img src="/voltron-logo.png" alt="Voltron logo" />
            <div>
              <p>Voltron TM</p>
              <span>Coating Solutions</span>
            </div>
          </div>

          <div className="login-copy">
            <span className="eyebrow">VOS Academy</span>
            <h1>Workforce Training. Controlled. Certified. Audit-Ready.</h1>
            <p>
              A focused training portal for multilingual learning, locked slide-audio
              completion, role assignments, certificates, and audit evidence.
            </p>
          </div>

          <div className="role-switch" aria-label="Select login role">
            <button
              className={role === "admin" ? "active" : ""}
              type="button"
              onClick={() => {
                setRole("admin");
                setEmail("admin@voltroncoat.com");
                setPassword("voltron");
              }}
            >
              Admin
            </button>
            <button
              className={role === "employee" ? "active" : ""}
              type="button"
              onClick={() => {
                setRole("employee");
                setEmail("employee@voltroncoat.com");
                setPassword("voltron");
              }}
            >
              Employee
            </button>
          </div>

          <form
            className="login-form"
            onSubmit={(event) => {
              event.preventDefault();
              void login();
            }}
          >
            <label>
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            <p className="auth-message">{authStatus}</p>
            <button type="submit">Enter {roleLabel} Portal</button>
          </form>

          <div className="login-footer">
            <span>Server-backed v1</span>
            <span>No-skip learning</span>
            <span>Odoo-ready evidence</span>
          </div>
        </section>
      </main>
    );
  }

  const visibleSections = role === "admin"
    ? (["dashboard", "employees", "modules", "assignments", "rules", "skills", "attendance", "kpis", "reports", "certificates"] as Section[])
    : (["dashboard", "modules", "skills", "attendance", "reports", "certificates"] as Section[]);

  return (
    <main className="portal-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img src="/voltron-logo.png" alt="Voltron logo" />
          <div>
            <strong>VOS Academy</strong>
            <span>{roleLabel} Portal</span>
          </div>
        </div>

        <nav>
          {visibleSections.map((item) => (
            <button
              key={item}
              className={activeSection === item ? "active" : ""}
              type="button"
              onClick={() => setActiveSection(item)}
            >
              <span>{navIcon(item)}</span>
              {navLabel(item, role)}
            </button>
          ))}
        </nav>

        <button
          className="ghost-action"
          type="button"
          onClick={() => void logout(role === "admin" ? "employee" : "admin")}
        >
          Sign in as {role === "admin" ? "Employee" : "Admin"}
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">academy.voltroncoat.com</span>
            <h1>{role === "admin" ? "Training Control Center" : `${currentEmployee.name}'s Training`}</h1>
          </div>
          <div className="topbar-actions">
            <span className="backend-pill">{backendStatus}</span>
            <button type="button" onClick={exportEvidence}>Export Evidence</button>
            {role === "admin" && <button type="button" onClick={resetDemoData}>Reset Demo</button>}
            <button type="button" onClick={() => void logout()}>
              Sign Out
            </button>
          </div>
        </header>

        {role === "admin" ? (
          <AdminView
            activeSection={activeSection}
            data={data}
            updateData={updateData}
            reloadData={loadBackendData}
          />
        ) : (
          <EmployeeView
            activeSection={activeSection}
            data={data}
            employee={currentEmployee}
            updateData={updateData}
            setActiveSection={setActiveSection}
          />
        )}
      </section>
    </main>
  );
}

function AdminView({
  activeSection,
  data,
  updateData,
  reloadData
}: {
  activeSection: Section;
  data: AcademyData;
  updateData: (updater: (current: AcademyData) => AcademyData) => void;
  reloadData: () => Promise<void>;
}) {
  const completed = data.assignments.filter((assignment) => assignment.status === "Completed").length;
  const open = data.assignments.length - completed;
  const compliance = data.assignments.length ? Math.round((completed / data.assignments.length) * 100) : 0;
  const latestCertificate = data.certificates[data.certificates.length - 1];

  return (
    <div className="view-stack">
      {activeSection === "dashboard" && (
        <>
          <section className="metric-grid">
            <Metric label="Training Compliance" value={`${compliance}%`} tone="teal" />
            <Metric label="Open Assignments" value={String(open).padStart(2, "0")} tone="blue" />
            <Metric label="Employees" value={String(data.employees.length).padStart(2, "0")} tone="green" />
            <Metric label="Certificates" value={String(data.certificates.length).padStart(2, "0")} tone="teal" />
          </section>

          <section className="split-layout">
            <div className="panel large">
              <div className="panel-heading">
                <span className="eyebrow">Controlled Training Flow</span>
                <h2>Admin assigns. Employee completes. Evidence is generated.</h2>
              </div>
              <div className="academy-flow">
                {flow.map(([title, detail], index) => (
                  <article key={title}>
                    <span>{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{detail}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="panel">
              <div className="panel-heading">
                <span className="eyebrow">Compliance Snapshot</span>
                <h2>Training status by evidence quality</h2>
              </div>
              <div className="donut-wrap">
                <div className="donut" style={{ "--compliance": `${compliance}%` } as CSSProperties}>
                  {compliance}%
                </div>
                <div className="donut-list">
                  <span><i className="teal" /> Completed: {completed}</span>
                  <span><i className="blue" /> Open: {open}</span>
                  <span><i className="green" /> Evidence packs: {data.certificates.length}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel-heading row">
              <div>
                <span className="eyebrow">Live Training Matrix</span>
                <h2>Local v1 state now updates as employees complete training.</h2>
              </div>
            </div>
            <DataTable
              headers={["Employee", "Department", "Open", "Certified"]}
              rows={data.employees.map((employee) => {
                const employeeAssignments = data.assignments.filter((assignment) => assignment.employeeId === employee.id);
                return [
                  employee.name,
                  employee.department,
                  String(employeeAssignments.filter((assignment) => assignment.status !== "Completed").length),
                  String(employeeAssignments.filter((assignment) => assignment.status === "Completed").length)
                ];
              })}
            />
          </section>
        </>
      )}

      {activeSection === "employees" && (
        <EmployeeMasterView
          data={data}
          onSaveEmployee={(employee) =>
            updateData((current) => ({
              ...current,
              employees: current.employees.some((record) => record.id === employee.id)
                ? current.employees.map((record) => (record.id === employee.id ? employee : record))
                : [...current.employees, employee]
            }))
          }
          onDeleteEmployee={(employeeId) =>
            updateData((current) => ({
              ...current,
              employees: current.employees.filter((employee) => employee.id !== employeeId)
            }))
          }
        />
      )}

      {activeSection === "modules" && (
        <ModuleMasterView
          data={data}
          onSaveModule={(module) =>
            updateData((current) => ({
              ...current,
              modules: current.modules.some((record) => record.id === module.id)
                ? current.modules.map((record) => (record.id === module.id ? module : record))
                : [...current.modules, module]
            }))
          }
          onDeleteModule={(moduleId) =>
            updateData((current) => ({
              ...current,
              modules: current.modules.filter((module) => module.id !== moduleId)
            }))
          }
        />
      )}

      {activeSection === "assignments" && (
        <AssignmentControlView
          data={data}
          onSaveAssignment={(assignment) =>
            updateData((current) => ({
              ...current,
              assignments: current.assignments.some((record) => record.id === assignment.id)
                ? current.assignments.map((record) => (record.id === assignment.id ? assignment : record))
                : [...current.assignments, assignment]
            }))
          }
          onDeleteAssignment={(assignmentId) =>
            updateData((current) => ({
              ...current,
              assignments: current.assignments.filter((assignment) => assignment.id !== assignmentId)
            }))
          }
        />
      )}

      {activeSection === "rules" && (
        <AssignmentRulesView
          data={data}
          onSaveRule={(rule) =>
            updateData((current) => ({
              ...current,
              assignmentRules: current.assignmentRules.some((record) => record.id === rule.id)
                ? current.assignmentRules.map((record) => (record.id === rule.id ? rule : record))
                : [...current.assignmentRules, rule]
            }))
          }
          onDeleteRule={(ruleId) =>
            updateData((current) => ({
              ...current,
              assignmentRules: current.assignmentRules.filter((rule) => rule.id !== ruleId)
            }))
          }
          onApplyRules={() =>
            updateData((current) => applyAssignmentRules(current))
          }
        />
      )}

      {activeSection === "skills" && (
        <SkillMatrixView
          data={data}
          onSaveSkill={(skill) =>
            updateData((current) => ({
              ...current,
              skills: current.skills.some((record) => record.id === skill.id)
                ? current.skills.map((record) => (record.id === skill.id ? skill : record))
                : [...current.skills, skill]
            }))
          }
          onDeleteSkill={(skillId) =>
            updateData((current) => ({
              ...current,
              skills: current.skills.filter((skill) => skill.id !== skillId),
              signOffs: current.signOffs.filter((signOff) => signOff.skillRecordId !== skillId)
            }))
          }
          onAddSignOff={(signOff) =>
            updateData((current) => ({
              ...current,
              signOffs: [...current.signOffs, signOff],
              skills: current.skills.map((skill) =>
                skill.id === signOff.skillRecordId
                  ? applySignOffToSkill(skill, signOff)
                  : skill
              )
            }))
          }
        />
      )}

      {activeSection === "attendance" && (
        <AttendanceView
          data={data}
          reloadData={reloadData}
          onSaveMapping={(mapping) =>
            updateData((current) => ({
              ...current,
              attendanceMappings: current.attendanceMappings.some((record) => record.id === mapping.id)
                ? current.attendanceMappings.map((record) => (record.id === mapping.id ? mapping : record))
                : [...current.attendanceMappings, mapping]
            }))
          }
          onDeleteMapping={(mappingId) =>
            updateData((current) => ({
              ...current,
              attendanceMappings: current.attendanceMappings.filter((mapping) => mapping.id !== mappingId)
            }))
          }
          onSaveShift={(shift) =>
            updateData((current) => ({
              ...current,
              shiftRules: current.shiftRules.some((record) => record.id === shift.id)
                ? current.shiftRules.map((record) => (record.id === shift.id ? shift : record))
                : [...current.shiftRules, shift]
            }))
          }
          onDeleteShift={(shiftId) =>
            updateData((current) => ({
              ...current,
              shiftRules: current.shiftRules.filter((shift) => shift.id !== shiftId)
            }))
          }
        />
      )}

      {activeSection === "kpis" && (
        <KpiCascadeView
          data={data}
          onSave={(kpi) =>
            updateData((current) => ({
              ...current,
              kpis: current.kpis.some((record) => record.id === kpi.id)
                ? current.kpis.map((record) => (record.id === kpi.id ? kpi : record))
                : [...current.kpis, kpi]
            }))
          }
          onDelete={(kpiId) =>
            updateData((current) => ({
              ...current,
              kpis: current.kpis
                .filter((kpi) => kpi.id !== kpiId)
                .map((kpi) => (kpi.parentId === kpiId ? { ...kpi, parentId: undefined } : kpi)),
              kpiReviews: current.kpiReviews.filter((review) => review.kpiId !== kpiId)
            }))
          }
          onAddReview={(review) =>
            updateData((current) => ({
              ...current,
              kpiReviews: [...current.kpiReviews, review],
              kpis: current.kpis.map((kpi) =>
                kpi.id === review.kpiId
                  ? {
                      ...kpi,
                      currentScore: review.finalScore,
                      status: deriveKpiStatus(review.finalScore, review.gateStatus)
                    }
                  : kpi
              )
            }))
          }
        />
      )}

      {activeSection === "reports" && (
        <section className="split-layout">
          <div className="panel large">
            <div className="panel-heading">
              <span className="eyebrow">Audit Evidence Pack</span>
              <h2>Every completion leaves an exportable backend trail.</h2>
            </div>
            <div className="evidence-grid">
              {evidence.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
            <DataTable
              headers={["Employee", "Module", "Revision", "Language", "Status", "Slides", "Attempts", "Score", "Certificate"]}
              rows={data.assignments.map((assignment) => [
                findEmployee(data, assignment.employeeId)?.name ?? "-",
                findModule(data, assignment.moduleId)?.title ?? "-",
                findModule(data, assignment.moduleId)?.revision ?? "Rev 00",
                assignment.selectedLanguage ?? moduleDefaultLanguage(findModule(data, assignment.moduleId)),
                assignment.status,
                `${assignment.slideLogs.length}/${findModule(data, assignment.moduleId)?.slides.length ?? 0}`,
                String(quizAttemptCount(assignment)),
                assignment.quizScore ? `${assignment.quizScore}%` : "-",
                assignment.certificateId ? "Issued" : "-"
              ])}
            />
            <div className="report-subsection">
              <h3>Quiz Attempt History</h3>
              <DataTable
                headers={["Employee", "Module", "Language", "Attempted", "Score", "Result"]}
                rows={quizAttemptRows(data)}
              />
            </div>
          </div>
          <div className="panel report-card">
            <span>Report Preview</span>
            <h3>Training Compliance Evidence</h3>
            <p>Generate a customer-audit-ready PDF summary from the current backend training records.</p>
            <button type="button" onClick={() => downloadAuditEvidencePdf(data)}>
              Download Evidence PDF
            </button>
          </div>
        </section>
      )}

      {activeSection === "certificates" && (
        <CertificateView
          data={data}
          certificate={latestCertificate}
          emptyMessage="No certificates have been issued yet."
        />
      )}
    </div>
  );
}

function EmployeeView({
  activeSection,
  data,
  employee,
  updateData,
  setActiveSection
}: {
  activeSection: Section;
  data: AcademyData;
  employee: Employee;
  updateData: (updater: (current: AcademyData) => AcademyData) => void;
  setActiveSection: (section: Section) => void;
}) {
  const myAssignments = data.assignments.filter((assignment) => assignment.employeeId === employee.id);
  const myCertificates = data.certificates.filter((certificate) => certificate.employeeId === employee.id);
  const mySkills = data.skills.filter((skill) => skill.employeeId === employee.id);
  const mySignOffs = data.signOffs.filter((signOff) => signOff.employeeId === employee.id);
  const myAttendance = buildAttendanceSummaries(data).filter((summary) => summary.employeeId === employee.id);
  const todayAttendance = myAttendance.find((summary) => summary.date === todayIso());
  const actionItems = getEmployeeActionItems(data, employee);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string | undefined>();
  const attendanceScore = myAttendance.length
    ? Math.round(myAttendance.reduce((total, summary) => total + summary.score, 0) / myAttendance.length)
    : 0;
  const activeAssignment =
    myAssignments.find((assignment) => assignment.id === selectedAssignmentId) ??
    myAssignments.find((assignment) => assignment.status !== "Completed") ??
    myAssignments[0];
  const activeModule = activeAssignment ? findModule(data, activeAssignment.moduleId) : undefined;
  const completed = myAssignments.filter((assignment) => assignment.status === "Completed").length;
  const certifiedSkills = mySkills.filter((skill) => skill.status === "Certified").length;

  function updateAssignment(updatedAssignment: Assignment, certificate?: Certificate) {
    updateData((current) => ({
      ...current,
      assignments: current.assignments.map((assignment) =>
        assignment.id === updatedAssignment.id ? updatedAssignment : assignment
      ),
      certificates: certificate ? [...current.certificates, certificate] : current.certificates
    }));
  }

  return (
    <div className="view-stack">
      {activeSection === "dashboard" && (
        <>
          <section className="metric-grid">
            <Metric label="Assigned" value={String(myAssignments.length).padStart(2, "0")} tone="teal" />
            <Metric label="Open Training" value={String(myAssignments.filter((a) => a.status !== "Completed").length).padStart(2, "0")} tone="blue" />
            <Metric label="Certified Skills" value={String(certifiedSkills).padStart(2, "0")} tone="green" />
            <Metric label="Attendance Score" value={`${attendanceScore}%`} tone="teal" />
          </section>

          <section className="split-layout">
            <div className="panel large">
              <div className="panel-heading row">
                <div>
                  <span className="eyebrow">My Control Status</span>
                  <h2>Training, skill permission, attendance and actions in one place.</h2>
                </div>
                <button type="button" onClick={() => setActiveSection("reports")}>
                  My Evidence
                </button>
              </div>
              <div className="employee-dashboard-grid">
                <EmployeeAttendanceCard attendance={todayAttendance} />
                <EmployeeActionPanel items={actionItems} />
                <EmployeeSkillsSnapshot skills={mySkills} onOpen={() => setActiveSection("skills")} />
                <EmployeeCertificatesSnapshot data={data} certificates={myCertificates} onOpen={() => setActiveSection("certificates")} />
              </div>
            </div>

            <TrainingPlayer
              assignment={activeAssignment}
              module={activeModule}
              employee={employee}
              onUpdate={updateAssignment}
            />
          </section>

          <section className="panel">
            <div className="panel-heading row">
              <div>
                <span className="eyebrow">Assigned Training</span>
                <h2>Complete required modules before the due date.</h2>
              </div>
              <button type="button" onClick={() => setActiveSection("modules")}>
                Open Training
              </button>
            </div>
            <EmployeeTrainingList
              data={data}
              assignments={myAssignments}
              activeAssignmentId={activeAssignment?.id}
              onOpenTraining={(assignmentId) => {
                setSelectedAssignmentId(assignmentId);
                setActiveSection("modules");
              }}
            />
          </section>
        </>
      )}

      {activeSection === "modules" && (
        <section className="split-layout training-workspace-layout">
          <div className="panel large">
            <div className="panel-heading">
              <span className="eyebrow">My Training</span>
              <h2>Assigned modules, due dates and completion status.</h2>
            </div>
            <EmployeeTrainingList
              data={data}
              assignments={myAssignments}
              activeAssignmentId={activeAssignment?.id}
              onOpenTraining={setSelectedAssignmentId}
            />
          </div>
          <TrainingPlayer
            expanded
            assignment={activeAssignment}
            module={activeModule}
            employee={employee}
            onUpdate={updateAssignment}
          />
        </section>
      )}

      {activeSection === "skills" && (
        <EmployeeSkillView
          data={data}
          employee={employee}
          skills={mySkills}
          signOffs={mySignOffs}
        />
      )}

      {activeSection === "attendance" && (
        <EmployeeAttendanceView
          data={data}
          employee={employee}
          summaries={myAttendance}
        />
      )}

      {activeSection === "reports" && (
        <section className="panel">
          <div className="panel-heading row">
            <div>
              <span className="eyebrow">My Evidence</span>
              <h2>Training, certificate, skill and attendance evidence.</h2>
            </div>
            <button type="button" onClick={() => downloadAuditEvidencePdf(data, employee.id)}>
              Download My Evidence
            </button>
          </div>
          <div className="employee-evidence-stack">
            <DataTable
              headers={["Module", "Revision", "Language", "Slides", "Attempts", "Quiz", "Certificate"]}
              rows={myAssignments.map((assignment) => [
                findModule(data, assignment.moduleId)?.title ?? "-",
                findModule(data, assignment.moduleId)?.revision ?? "Rev 00",
                assignment.selectedLanguage ?? moduleDefaultLanguage(findModule(data, assignment.moduleId)),
                `${assignment.slideLogs.length}/${findModule(data, assignment.moduleId)?.slides.length ?? 0}`,
                String(quizAttemptCount(assignment)),
                assignment.quizScore ? `${assignment.quizScore}%` : assignment.status === "Quiz Ready" ? "Ready" : "Locked",
                assignment.certificateId ? "Issued" : "Pending"
              ])}
            />
            <div className="report-subsection">
              <h3>My Quiz Attempts</h3>
              <DataTable
                headers={["Employee", "Module", "Language", "Attempted", "Score", "Result"]}
                rows={quizAttemptRows(data, employee.id)}
              />
            </div>
            <DataTable
              headers={["Skill", "Level", "Permission", "Status", "Validity"]}
              rows={mySkills.map((skill) => [
                skill.skillName,
                `${skill.level} | ${skillLevelMeaning(skill.level)}`,
                skillWorkPermission(skill.level),
                skill.status,
                skill.validTill ? formatDate(skill.validTill) : "-"
              ])}
            />
            <DataTable
              headers={["Date", "Status", "First", "Last", "Worked", "Score"]}
              rows={myAttendance.slice(0, 6).map((summary) => [
                formatDate(summary.date),
                summary.status,
                summary.firstPunch,
                summary.lastPunch,
                formatDuration(summary.minutesWorked),
                `${summary.score}%`
              ])}
            />
          </div>
        </section>
      )}

      {activeSection === "certificates" && (
        <CertificateView
          data={data}
          certificate={myCertificates[myCertificates.length - 1]}
          emptyMessage="Complete a training and pass the quiz to issue a certificate."
        />
      )}
    </div>
  );
}

function EmployeeTrainingList({
  data,
  assignments,
  activeAssignmentId,
  onOpenTraining
}: {
  data: AcademyData;
  assignments: Assignment[];
  activeAssignmentId?: string;
  onOpenTraining: (assignmentId: string) => void;
}) {
  if (!assignments.length) {
    return <p className="muted-copy">No training assignments are currently linked to this employee.</p>;
  }

  return (
    <div className="training-list">
      {assignments.map((assignment) => {
        const module = findModule(data, assignment.moduleId);
        const slideCount = module?.slides.length ?? 1;
        const progress = assignment.status === "Completed"
          ? 100
          : assignment.status === "Quiz Ready"
            ? 85
            : Math.round((assignment.slideLogs.length / slideCount) * 70);
        return (
          <article key={assignment.id} className={activeAssignmentId === assignment.id ? "active-training" : undefined}>
            <div>
              <span>{assignment.status}</span>
              <h3>{module?.title ?? "Missing module"}</h3>
              <p>Language: {assignment.selectedLanguage ?? moduleDefaultLanguage(module)} | Attempts: {quizAttemptCount(assignment)} | Due: {formatDate(assignment.dueDate)} | {assignment.frequency}</p>
            </div>
            <button type="button" onClick={() => onOpenTraining(assignment.id)}>
              {activeAssignmentId === assignment.id ? "Open" : assignment.status === "Completed" ? "View" : "Continue"}
            </button>
            <div className="progress-ring" style={{ "--progress": `${progress}%` } as CSSProperties}>
              {progress}%
            </div>
          </article>
        );
      })}
    </div>
  );
}

function EmployeeAttendanceCard({ attendance }: { attendance?: AttendanceSummary }) {
  return (
    <article className="employee-status-card">
      <div className="employee-status-header">
        <span>Today Attendance</span>
        <em>{attendance?.status ?? "No punch"}</em>
      </div>
      <h3>{attendance ? `${attendance.firstPunch} to ${attendance.lastPunch}` : "No attendance yet"}</h3>
      <p>{attendance ? `${formatDuration(attendance.minutesWorked)} worked | ${attendance.score}% discipline score` : "Punch at the biometric device to create today's record."}</p>
    </article>
  );
}

function EmployeeActionPanel({ items }: { items: string[] }) {
  return (
    <article className="employee-status-card">
      <div className="employee-status-header">
        <span>My Actions</span>
        <em>{items.length ? `${items.length} open` : "Clear"}</em>
      </div>
      <h3>{items.length ? "Attention required" : "No open actions"}</h3>
      <ul className="employee-action-list">
        {(items.length ? items.slice(0, 4) : ["Training, attendance and skill records are currently clear."]).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

function EmployeeSkillsSnapshot({
  skills,
  onOpen
}: {
  skills: SkillRecord[];
  onOpen: () => void;
}) {
  const certified = skills.filter((skill) => skill.status === "Certified").length;
  const highest = skills
    .map((skill) => skill.level)
    .sort((a, b) => skillLevelRank(b) - skillLevelRank(a))[0];

  return (
    <article className="employee-status-card">
      <div className="employee-status-header">
        <span>Skill Permission</span>
        <em>{highest ?? "L0"}</em>
      </div>
      <h3>{certified}/{skills.length || 0} certified</h3>
      <p>{highest ? skillWorkPermission(highest) : "No skill record assigned yet."}</p>
      <button type="button" className="secondary-action" onClick={onOpen}>Open Skills</button>
    </article>
  );
}

function EmployeeCertificatesSnapshot({
  data,
  certificates,
  onOpen
}: {
  data: AcademyData;
  certificates: Certificate[];
  onOpen: () => void;
}) {
  const latest = certificates[certificates.length - 1];
  const module = latest ? findModule(data, latest.moduleId) : undefined;

  return (
    <article className="employee-status-card">
      <div className="employee-status-header">
        <span>Certificates</span>
        <em>{certificates.length}</em>
      </div>
      <h3>{module?.title ?? "No certificate yet"}</h3>
      <p>{latest ? `Language ${certificateLanguage(data, latest)} | Valid till ${formatDate(latest.validTill)} | Score ${latest.score}%` : "Complete assigned training and pass the quiz."}</p>
      <button type="button" className="secondary-action" onClick={onOpen}>Open Certificates</button>
    </article>
  );
}

function EmployeeSkillView({
  data,
  employee,
  skills,
  signOffs
}: {
  data: AcademyData;
  employee: Employee;
  skills: SkillRecord[];
  signOffs: PracticalSignOff[];
}) {
  return (
    <section className="view-stack">
      <section className="metric-grid">
        <Metric label="Skill Records" value={String(skills.length).padStart(2, "0")} tone="teal" />
        <Metric label="Certified" value={String(skills.filter((skill) => skill.status === "Certified").length).padStart(2, "0")} tone="blue" />
        <Metric label="Independent" value={String(skills.filter((skill) => skill.level === "L4" || skill.level === "L5").length).padStart(2, "0")} tone="green" />
        <Metric label="Sign-Offs" value={String(signOffs.length).padStart(2, "0")} tone="teal" />
      </section>

      <section className="split-layout">
        <div className="panel large">
          <div className="panel-heading">
            <span className="eyebrow">My Skill Matrix</span>
            <h2>What I am trained and permitted to do.</h2>
          </div>
          <div className="skill-card-grid">
            {skills.map((skill) => {
              const module = skill.linkedTrainingId ? findModule(data, skill.linkedTrainingId) : undefined;
              const kpi = skill.linkedKpiId ? findKpi(data, skill.linkedKpiId) : undefined;
              return (
                <article key={skill.id} className="skill-card">
                  <div className="skill-card-header">
                    <span>{skill.level}</span>
                    <em className={`skill-status ${skillStatusClass(skill.status)}`}>{skill.status}</em>
                  </div>
                  <h3>{skill.skillName}</h3>
                  <p>{employee.department} | {employee.roleTitle}</p>
                  <div className="skill-permission">
                    <strong>{skillWorkPermission(skill.level)}</strong>
                    <span>{skillLevelMeaning(skill.level)}</span>
                  </div>
                  <div className="skill-links">
                    {module && <span>{module.title}</span>}
                    {kpi && <span>{kpi.title}</span>}
                    {skill.validTill && <span>Valid till {formatDate(skill.validTill)}</span>}
                  </div>
                </article>
              );
            })}
            {!skills.length && <p className="muted-copy">No skill records assigned yet.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Practical Sign-Offs</span>
            <h2>Supervisor approvals attached to my skills.</h2>
          </div>
          <div className="signoff-list">
            {signOffs.map((signOff) => {
              const skill = findSkill(data, signOff.skillRecordId);
              return (
                <article key={signOff.id}>
                  <div>
                    <span>{signOff.result}</span>
                    <h3>{skill?.skillName ?? "Deleted skill"}</h3>
                    <p>{signOff.notes || signOff.nextAction || "No notes recorded."}</p>
                  </div>
                  <div className="signoff-meta">
                    <strong>{formatDate(signOff.observedAt)}</strong>
                    <em>{signOff.supervisor}</em>
                  </div>
                </article>
              );
            })}
            {!signOffs.length && <p className="muted-copy">No practical sign-offs recorded yet.</p>}
          </div>
        </div>
      </section>
    </section>
  );
}

function EmployeeAttendanceView({
  data,
  employee,
  summaries
}: {
  data: AcademyData;
  employee: Employee;
  summaries: AttendanceSummary[];
}) {
  const mappedUserIds = data.attendanceMappings
    .filter((mapping) => mapping.employeeId === employee.id)
    .map((mapping) => mapping.camsUserId);
  const myPunches = data.attendancePunches.filter((punch) =>
    punch.employeeId === employee.id || mappedUserIds.includes(punch.camsUserId)
  );
  const score = summaries.length
    ? Math.round(summaries.reduce((total, summary) => total + summary.score, 0) / summaries.length)
    : 0;

  return (
    <section className="view-stack">
      <section className="metric-grid">
        <Metric label="Attendance Days" value={String(summaries.length).padStart(2, "0")} tone="teal" />
        <Metric label="Punch Logs" value={String(myPunches.length).padStart(2, "0")} tone="blue" />
        <Metric label="Discipline Score" value={`${score}%`} tone="green" />
        <Metric label="Mapped CAMS IDs" value={String(mappedUserIds.length).padStart(2, "0")} tone="teal" />
      </section>

      <section className="split-layout">
        <div className="panel large">
          <div className="panel-heading">
            <span className="eyebrow">My Attendance</span>
            <h2>Recent attendance status calculated from biometric punches.</h2>
          </div>
          <div className="attendance-summary-grid">
            {summaries.map((summary) => (
              <article key={summary.key} className="attendance-summary-card">
                <div className="attendance-card-header">
                  <span>{summary.status}</span>
                  <em>{summary.score}%</em>
                </div>
                <h3>{formatDate(summary.date)}</h3>
                <p>{summary.shiftName} | {formatDuration(summary.minutesWorked)} worked</p>
                <div className="master-meta">
                  <span>In {summary.firstPunch}</span>
                  <span>Out {summary.lastPunch}</span>
                  <span>{summary.punchCount} punches</span>
                </div>
              </article>
            ))}
            {!summaries.length && <p className="muted-copy">No mapped attendance records yet.</p>}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Raw Punches</span>
            <h2>Biometric events received for my CAMS mapping.</h2>
          </div>
          <DataTable
            headers={["Log Time", "Type", "Input", "Device", "Auth"]}
            rows={myPunches.slice().reverse().slice(0, 8).map((punch) => [
              punch.logTime,
              punch.punchType,
              punch.inputType,
              punch.serialNumber ?? "-",
              punch.authTokenStatus
            ])}
          />
        </div>
      </section>
    </section>
  );
}

function EmployeeMasterView({
  data,
  onSaveEmployee,
  onDeleteEmployee
}: {
  data: AcademyData;
  onSaveEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
}) {
  const [editingEmployee, setEditingEmployee] = useState<Employee | undefined>();
  const [message, setMessage] = useState("");

  function handleDelete(employee: Employee) {
    const blockers = getEmployeeDeleteBlockers(data, employee.id);
    if (blockers.length) {
      setMessage(`${employee.name} cannot be deleted: ${blockers.join(", ")}.`);
      return;
    }

    if (window.confirm(`Delete ${employee.name}? This cannot be undone.`)) {
      onDeleteEmployee(employee.id);
      setMessage(`${employee.name} deleted.`);
    }
  }

  return (
    <section className="split-layout master-layout">
      <div className="panel large">
        <div className="panel-heading">
          <span className="eyebrow">Employee Master</span>
          <h2>Edit employees safely without breaking training evidence.</h2>
        </div>
        {message && <p className="form-message">{message}</p>}
        <div className="master-card-grid">
          {data.employees.map((employee) => {
            const blockers = getEmployeeDeleteBlockers(data, employee.id);
            const assignmentCount = data.assignments.filter((assignment) => assignment.employeeId === employee.id).length;
            const skillCount = data.skills.filter((skill) => skill.employeeId === employee.id).length;

            return (
              <article className="master-card" key={employee.id}>
                <div className="master-card-header">
                  <span>{employee.status}</span>
                  <em>{employee.department}</em>
                </div>
                <h3>{employee.name}</h3>
                <p>{employee.email}</p>
                <div className="master-meta">
                  <span>{employee.roleTitle}</span>
                  <span>{assignmentCount} assignments</span>
                  <span>{skillCount} skills</span>
                </div>
                {blockers.length > 0 && <p className="blocker-note">Blocked: {blockers.join(", ")}</p>}
                <div className="kpi-actions">
                  <button type="button" className="secondary-action" onClick={() => setEditingEmployee(employee)}>
                    Edit
                  </button>
                  <button type="button" className="danger-action" onClick={() => handleDelete(employee)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <EmployeeForm
        key={editingEmployee?.id ?? "new-employee"}
        editingEmployee={editingEmployee}
        onCancel={() => setEditingEmployee(undefined)}
        onSave={(employee) => {
          onSaveEmployee(employee);
          setEditingEmployee(undefined);
          setMessage(`${employee.name} saved.`);
        }}
      />
    </section>
  );
}

function EmployeeForm({
  editingEmployee,
  onSave,
  onCancel
}: {
  editingEmployee?: Employee;
  onSave: (employee: Employee) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="panel form-panel"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSave({
          id: editingEmployee?.id ?? createId("emp"),
          name: String(form.get("name")),
          email: String(form.get("email")),
          department: String(form.get("department")),
          roleTitle: String(form.get("roleTitle")),
          status: String(form.get("status")) as Employee["status"]
        });
        event.currentTarget.reset();
      }}
    >
      <div className="panel-heading row">
        <div>
          <span className="eyebrow">{editingEmployee ? "Edit Employee" : "Add Employee"}</span>
          <h2>{editingEmployee ? "Update Academy user details." : "Create an Academy user."}</h2>
        </div>
        {editingEmployee && (
          <button type="button" className="secondary-action" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>
      <label>Name<input name="name" required defaultValue={editingEmployee?.name} placeholder="Example: Ramesh Pawar" /></label>
      <label>Email<input name="email" type="email" required defaultValue={editingEmployee?.email} placeholder="name@voltroncoat.com" /></label>
      <label>Department<input name="department" required defaultValue={editingEmployee?.department} placeholder="Production" /></label>
      <label>Role<input name="roleTitle" required defaultValue={editingEmployee?.roleTitle} placeholder="Rack Loading Operator" /></label>
      <label>
        Status
        <select name="status" required defaultValue={editingEmployee?.status ?? "Active"}>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </label>
      <button type="submit">{editingEmployee ? "Save Employee" : "Add Employee"}</button>
    </form>
  );
}

function ModuleMasterView({
  data,
  onSaveModule,
  onDeleteModule
}: {
  data: AcademyData;
  onSaveModule: (module: TrainingModule) => void;
  onDeleteModule: (moduleId: string) => void;
}) {
  const [editingModule, setEditingModule] = useState<TrainingModule | undefined>();
  const [message, setMessage] = useState("");

  function handleDelete(module: TrainingModule) {
    const blockers = getModuleDeleteBlockers(data, module.id);
    if (blockers.length) {
      setMessage(`${module.title} cannot be deleted: ${blockers.join(", ")}.`);
      return;
    }

    if (window.confirm(`Delete ${module.title}? This cannot be undone.`)) {
      onDeleteModule(module.id);
      setMessage(`${module.title} deleted.`);
    }
  }

  return (
    <section className="view-stack">
      <div className="panel large">
        <div className="panel-heading">
          <span className="eyebrow">Training Module Master</span>
          <h2>Edit module content while protecting assignments, rules and certificates.</h2>
        </div>
        {message && <p className="form-message">{message}</p>}
        <div className="module-grid">
          {data.modules.map((module) => {
            const blockers = getModuleDeleteBlockers(data, module.id);
            return (
              <article className="module-card" key={module.id}>
                <span>{module.status}</span>
                <h3>{module.title}</h3>
                <p>{languageSummary(module)}</p>
                <div className="module-meta">
                  <strong>{module.owner}</strong>
                  <em>{module.revision ?? "Rev 00"} | {module.validityMonths} months</em>
                </div>
                <div className="slide-count">
                  {module.slides.length} slides | {module.quiz.length} quiz questions | Effective {module.effectiveDate ? formatDate(module.effectiveDate) : "-"}
                </div>
                {blockers.length > 0 && <p className="blocker-note">Blocked: {blockers.join(", ")}</p>}
                <div className="kpi-actions">
                  <button type="button" className="secondary-action" onClick={() => setEditingModule(module)}>
                    Edit
                  </button>
                  <button type="button" className="danger-action" onClick={() => handleDelete(module)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <ModuleForm
        key={editingModule?.id ?? "new-module"}
        editingModule={editingModule}
        onCancel={() => setEditingModule(undefined)}
        onSave={(module) => {
          onSaveModule(module);
          setEditingModule(undefined);
          setMessage(`${module.title} saved.`);
        }}
      />
    </section>
  );
}

function ModuleForm({
  editingModule,
  onSave,
  onCancel
}: {
  editingModule?: TrainingModule;
  onSave: (module: TrainingModule) => void;
  onCancel: () => void;
}) {
  const initialLanguages = editingModule ? moduleLanguages(editingModule) : [...trainingLanguages];
  const initialDefaultLanguage = editingModule ? moduleDefaultLanguage(editingModule) : defaultTrainingLanguage;
  const [title, setTitle] = useState(editingModule?.title ?? "Hoist Safety");
  const [owner, setOwner] = useState(editingModule?.owner ?? "EHS");
  const [languages, setLanguages] = useState<TrainingLanguage[]>(initialLanguages);
  const [defaultLanguage, setDefaultLanguage] = useState<TrainingLanguage>(initialDefaultLanguage);
  const [activeLanguage, setActiveLanguage] = useState<TrainingLanguage>(initialDefaultLanguage);
  const [revision, setRevision] = useState(editingModule?.revision ?? "Rev 00");
  const [effectiveDate, setEffectiveDate] = useState(editingModule?.effectiveDate ?? todayIso());
  const [sopReference, setSopReference] = useState(editingModule?.sopReference ?? "");
  const [approvedBy, setApprovedBy] = useState(editingModule?.approvedBy ?? "Academy Admin");
  const [validityMonths, setValidityMonths] = useState(editingModule?.validityMonths ?? 12);
  const [status, setStatus] = useState<TrainingModule["status"]>(editingModule?.status ?? "Draft");
  const [slides, setSlides] = useState<TrainingSlide[]>(editingModule?.slides ?? [
    {
      title: "Purpose and risk",
      body: "Explain why the training matters, which risks it controls, and what the employee must remember before working independently.",
      duration: 20,
      audioRef: "hoist-safety-slide-1.mp3",
      mediaType: "none"
    },
    {
      title: "Approved operating method",
      body: "Explain the correct work method, key checkpoints, abnormality reporting, and unsafe actions that are not allowed.",
      duration: 20,
      audioRef: "hoist-safety-slide-2.mp3",
      mediaType: "none"
    }
  ]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>(editingModule?.quiz ?? [
    {
      question: "What is the correct action when an abnormality is observed?",
      options: ["Report immediately", "Continue silently", "Wait for the next audit"],
      answer: 0
    }
  ]);
  const [message, setMessage] = useState("");

  function toggleLanguage(language: TrainingLanguage) {
    if (languages.includes(language)) {
      if (languages.length === 1) {
        setMessage("Keep at least one training language enabled.");
        return;
      }

      const nextLanguages = languages.filter((item) => item !== language);
      setLanguages(nextLanguages);
      if (defaultLanguage === language) {
        setDefaultLanguage(nextLanguages[0]);
      }
      if (activeLanguage === language) {
        setActiveLanguage(nextLanguages[0]);
      }
      return;
    }

    setLanguages(trainingLanguages.filter((item) => languages.includes(item) || item === language));
    setActiveLanguage(language);
  }

  function updateSlide(index: number, patch: Partial<TrainingSlide>) {
    setSlides((current) =>
      current.map((slide, slideIndex) =>
        slideIndex === index ? { ...slide, ...patch } : slide
      )
    );
  }

  function updateSlideContent(index: number, language: TrainingLanguage, patch: Partial<LocalizedTrainingSlide>) {
    setSlides((current) =>
      current.map((slide, slideIndex) => {
        if (slideIndex !== index) {
          return slide;
        }

        const nextContent = {
          ...getSlideContent(slide, language),
          ...patch
        };
        return {
          ...slide,
          translations: {
            ...(slide.translations ?? {}),
            [language]: nextContent
          }
        };
      })
    );
  }

  function clearSlideMedia(index: number) {
    updateSlideContent(index, activeLanguage, {
      mediaType: "none",
      mediaName: undefined,
      mediaDataUrl: undefined
    });
  }

  async function handleSlideMedia(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      clearSlideMedia(index);
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      setMessage("Upload a slide image or PDF file only.");
      event.currentTarget.value = "";
      return;
    }

    if (file.size > 15_000_000) {
      setMessage("Keep each visual/PDF below 15 MB for the current local backend.");
      event.currentTarget.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(uploadApi, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const uploadError = (await response.json()) as { error?: string };
        throw new Error(uploadError.error ?? "Upload failed.");
      }

      const uploaded = (await response.json()) as {
        name: string;
        mediaType: "image" | "pdf";
        url: string;
      };

      updateSlideContent(index, activeLanguage, {
        mediaType: uploaded.mediaType,
        mediaName: uploaded.name,
        mediaDataUrl: uploaded.url
      });
      setMessage(`${uploaded.name} uploaded for ${activeLanguage} slide ${index + 1}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Upload failed.");
      event.currentTarget.value = "";
    }
  }

  async function handleSlideAudio(index: number, event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("audio/")) {
      setMessage("Upload an audio file only.");
      event.currentTarget.value = "";
      return;
    }

    if (file.size > 15_000_000) {
      setMessage("Keep each audio file below 15 MB for the current local backend.");
      event.currentTarget.value = "";
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(uploadApi, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        const uploadError = (await response.json()) as { error?: string };
        throw new Error(uploadError.error ?? "Upload failed.");
      }

      const uploaded = (await response.json()) as {
        name: string;
        mediaType: "audio" | "image" | "pdf";
        url: string;
      };

      if (uploaded.mediaType !== "audio") {
        throw new Error("The uploaded file was not recognized as audio.");
      }

      updateSlideContent(index, activeLanguage, { audioRef: uploaded.url });
      setMessage(`${uploaded.name} uploaded for ${activeLanguage} slide ${index + 1} audio.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Audio upload failed.");
      event.currentTarget.value = "";
    }
  }

  function updateQuiz(index: number, patch: Partial<QuizQuestion>) {
    setQuiz((current) =>
      current.map((question, questionIndex) =>
        questionIndex === index ? { ...question, ...patch } : question
      )
    );
  }

  function updateQuizContent(index: number, language: TrainingLanguage, patch: Partial<LocalizedQuizQuestion>) {
    setQuiz((current) =>
      current.map((question, questionIndex) => {
        if (questionIndex !== index) {
          return question;
        }

        const nextContent = {
          ...getQuizContent(question, language),
          ...patch
        };
        return {
          ...question,
          translations: {
            ...(question.translations ?? {}),
            [language]: nextContent
          }
        };
      })
    );
  }

  function updateQuizOption(questionIndex: number, optionIndex: number, value: string) {
    setQuiz((current) =>
      current.map((question, currentQuestionIndex) => {
        if (currentQuestionIndex !== questionIndex) {
          return question;
        }

        const content = getQuizContent(question, activeLanguage);
        return {
          ...question,
          translations: {
            ...(question.translations ?? {}),
            [activeLanguage]: {
              ...content,
              options: content.options.map((option, currentOptionIndex) =>
                currentOptionIndex === optionIndex ? value : option
              )
            }
          }
        };
      })
    );
  }

  function cleanSlideForSubmit(slide: TrainingSlide): TrainingSlide {
    const translations = languages.reduce<Partial<Record<TrainingLanguage, LocalizedTrainingSlide>>>((records, language) => {
      const content = getSlideContent(slide, language);
      records[language] = {
        title: content.title.trim(),
        body: content.body.trim(),
        audioRef: content.audioRef?.trim(),
        mediaType: content.mediaType ?? "none",
        mediaName: content.mediaName?.trim(),
        mediaDataUrl: content.mediaDataUrl
      };
      return records;
    }, {});
    const primary = translations[defaultLanguage] ?? translations[languages[0]] ?? fallbackSlideContent(slide);

    return {
      ...slide,
      title: primary.title,
      body: primary.body,
      duration: Number(slide.duration),
      audioRef: primary.audioRef,
      mediaType: primary.mediaType,
      mediaName: primary.mediaName,
      mediaDataUrl: primary.mediaDataUrl,
      translations
    };
  }

  function cleanQuizForSubmit(question: QuizQuestion): QuizQuestion {
    const translations = languages.reduce<Partial<Record<TrainingLanguage, LocalizedQuizQuestion>>>((records, language) => {
      const content = getQuizContent(question, language);
      records[language] = {
        question: content.question.trim(),
        options: content.options.map((option) => option.trim())
      };
      return records;
    }, {});
    const primary = translations[defaultLanguage] ?? translations[languages[0]] ?? fallbackQuizContent(question);

    return {
      ...question,
      question: primary.question,
      options: primary.options,
      answer: Number(question.answer),
      translations
    };
  }

  function resetBuilder() {
    setTitle("");
    setOwner("");
    setLanguages([...trainingLanguages]);
    setDefaultLanguage(defaultTrainingLanguage);
    setActiveLanguage(defaultTrainingLanguage);
    setRevision("Rev 00");
    setEffectiveDate(todayIso());
    setSopReference("");
    setApprovedBy("Academy Admin");
    setValidityMonths(12);
    setStatus("Draft");
    setSlides([
      {
        title: "",
        body: "",
        duration: 20,
        audioRef: "",
        mediaType: "none"
      }
    ]);
    setQuiz([
      {
        question: "",
        options: ["", "", ""],
        answer: 0
      }
    ]);
  }

  return (
    <form
      className="panel module-builder"
      onSubmit={(event) => {
        event.preventDefault();
        const cleanSlides = slides
          .map(cleanSlideForSubmit)
          .filter((slide) => {
            const primary = getSlideContent(slide, defaultLanguage);
            return primary.title && (primary.body || primary.mediaDataUrl) && slide.duration > 0;
          });
        const cleanQuiz = quiz
          .map(cleanQuizForSubmit)
          .filter((question) => {
            const primary = getQuizContent(question, defaultLanguage);
            return primary.question && primary.options.every(Boolean);
          });

        if (!title.trim() || !owner.trim() || cleanSlides.length === 0 || cleanQuiz.length === 0) {
          setMessage("Add a module title, owner, at least one slide with text or visual/PDF content, and one complete quiz question.");
          return;
        }

        const incompleteSlide = cleanSlides.find((slide) =>
          languages.some((language) => {
            const content = getSlideContent(slide, language);
            return !content.title || (!content.body && !content.mediaDataUrl);
          })
        );
        const incompleteQuiz = cleanQuiz.find((question) =>
          languages.some((language) => {
            const content = getQuizContent(question, language);
            return !content.question || !content.options.every(Boolean);
          })
        );

        if (incompleteSlide || incompleteQuiz) {
          setMessage(`Complete slide and quiz text for every enabled language: ${languages.join(", ")}.`);
          return;
        }

        onSave({
          id: editingModule?.id ?? createId("mod"),
          title: title.trim(),
          owner: owner.trim(),
          language: languages.join(" / "),
          languages,
          defaultLanguage,
          revision: revision.trim() || "Rev 00",
          effectiveDate,
          sopReference: sopReference.trim(),
          approvedBy: approvedBy.trim(),
          validityMonths,
          status,
          slides: cleanSlides,
          quiz: cleanQuiz
        });
        setMessage(`${title.trim()} saved as ${status}.`);
        resetBuilder();
      }}
    >
      <div className="panel-heading row">
        <div>
          <span className="eyebrow">{editingModule ? "Edit Module" : "Module Builder"}</span>
          <h2>{editingModule ? "Update slide-audio content and quiz controls." : "Create real slide-audio training content and quiz controls."}</h2>
        </div>
        <div className="form-actions-inline">
          {editingModule && (
            <button type="button" className="secondary-action" onClick={onCancel}>
              Cancel Edit
            </button>
          )}
          <button type="submit">Save Module</button>
        </div>
      </div>
      <div className="builder-grid">
        <label>Module title<input required value={title} onChange={(event) => setTitle(event.target.value)} /></label>
        <label>Owner<input required value={owner} onChange={(event) => setOwner(event.target.value)} /></label>
        <label>Revision<input value={revision} onChange={(event) => setRevision(event.target.value)} placeholder="Rev 00" /></label>
        <label>Effective date<input type="date" value={effectiveDate} onChange={(event) => setEffectiveDate(event.target.value)} /></label>
        <label>SOP reference<input value={sopReference} onChange={(event) => setSopReference(event.target.value)} placeholder="Example: VOS-HR-01" /></label>
        <label>Approved by<input value={approvedBy} onChange={(event) => setApprovedBy(event.target.value)} placeholder="Academy Admin" /></label>
        <label>Validity months<input type="number" min="1" required value={validityMonths} onChange={(event) => setValidityMonths(Number(event.target.value))} /></label>
        <label>
          Save status
          <select value={status} onChange={(event) => setStatus(event.target.value as TrainingModule["status"])}>
            <option value="Draft">Draft</option>
            <option value="Review">Review</option>
            <option value="Published">Published</option>
          </select>
        </label>
      </div>
      <div className="language-control-panel">
        <div>
          <span className="eyebrow">Languages</span>
          <h3>Build one module with separate slide, audio, test and certificate language records.</h3>
        </div>
        <div className="language-toggle-grid">
          {trainingLanguages.map((language) => (
            <label className={languages.includes(language) ? "language-toggle active" : "language-toggle"} key={language}>
              <input
                type="checkbox"
                checked={languages.includes(language)}
                onChange={() => toggleLanguage(language)}
              />
              <span>{language}</span>
              <small>{language === "English" ? "Default technical copy" : "Supports Devanagari content"}</small>
            </label>
          ))}
        </div>
        <div className="language-row">
          <label>
            Default certificate language
            <select
              value={defaultLanguage}
              onChange={(event) => {
                const nextLanguage = event.target.value as TrainingLanguage;
                setDefaultLanguage(nextLanguage);
                setActiveLanguage(nextLanguage);
              }}
            >
              {languages.map((language) => (
                <option key={language} value={language}>{language}</option>
              ))}
            </select>
          </label>
          <div className="language-tabs" role="tablist" aria-label="Training content language">
            {languages.map((language) => (
              <button
                key={language}
                type="button"
                className={activeLanguage === language ? "language-tab active" : "language-tab"}
                onClick={() => setActiveLanguage(language)}
              >
                {language}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="builder-section">
        <div className="builder-title">
          <div>
            <span className="eyebrow">Slides</span>
            <h3>{activeLanguage} slide text, audio and visual/PDF content</h3>
          </div>
          <button
            type="button"
            onClick={() =>
              setSlides((current) => [
                ...current,
                { title: "", body: "", duration: 20, audioRef: "", mediaType: "none" }
              ])
            }
          >
            Add Slide
          </button>
        </div>
        <div className="builder-list">
          {slides.map((slide, index) => {
            const localizedSlide = getSlideContent(slide, activeLanguage);
            const previewSlide = slideForLanguage(slide, activeLanguage);
            return (
              <article className={`builder-item ${languageClass(activeLanguage)}`} key={`slide-${index}`}>
                <div className="item-number">{index + 1}</div>
                <div className="builder-grid">
                  <label>Slide title<input required value={localizedSlide.title} onChange={(event) => updateSlideContent(index, activeLanguage, { title: event.target.value })} /></label>
                  <label>Audio file/reference<input value={localizedSlide.audioRef ?? ""} placeholder="example: safety-slide-1.mp3" onChange={(event) => updateSlideContent(index, activeLanguage, { audioRef: event.target.value })} /></label>
                  <label>
                    Upload audio
                    <input type="file" accept="audio/*,.mp3,.wav,.m4a,.ogg" onChange={(event) => handleSlideAudio(index, event)} />
                  </label>
                  <label className="wide-field">Slide text / narration notes<textarea value={localizedSlide.body} onChange={(event) => updateSlideContent(index, activeLanguage, { body: event.target.value })} /></label>
                  <label>
                    Training visual or PDF
                    <input type="file" accept="image/*,application/pdf,.pdf" onChange={(event) => handleSlideMedia(index, event)} />
                  </label>
                  <label>Minimum time seconds<input type="number" min="3" required value={slide.duration} onChange={(event) => updateSlide(index, { duration: Number(event.target.value) })} /></label>
                </div>
                {(localizedSlide.mediaDataUrl || localizedSlide.mediaName) && (
                  <div className="builder-preview">
                    <SlideMediaPreview slide={previewSlide} />
                    <button type="button" className="secondary-action" onClick={() => clearSlideMedia(index)}>
                      Remove Visual
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="secondary-action"
                  disabled={slides.length === 1}
                  onClick={() => setSlides((current) => current.filter((_, slideIndex) => slideIndex !== index))}
                >
                  Remove Slide
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <div className="builder-section">
        <div className="builder-title">
          <div>
            <span className="eyebrow">Quiz</span>
            <h3>{activeLanguage} test questions and shared correct answer</h3>
          </div>
          <button
            type="button"
            onClick={() =>
              setQuiz((current) => [
                ...current,
                { question: "", options: ["", "", ""], answer: 0 }
              ])
            }
          >
            Add Question
          </button>
        </div>
        <div className="builder-list">
          {quiz.map((question, questionIndex) => {
            const localizedQuestion = getQuizContent(question, activeLanguage);
            return (
              <article className={`builder-item ${languageClass(activeLanguage)}`} key={`quiz-${questionIndex}`}>
                <div className="item-number">{questionIndex + 1}</div>
                <div className="builder-grid">
                  <label className="wide-field">Question<input required value={localizedQuestion.question} onChange={(event) => updateQuizContent(questionIndex, activeLanguage, { question: event.target.value })} /></label>
                  {localizedQuestion.options.map((option, optionIndex) => (
                    <label key={`option-${questionIndex}-${optionIndex}`}>
                      Option {optionIndex + 1}
                      <input required value={option} onChange={(event) => updateQuizOption(questionIndex, optionIndex, event.target.value)} />
                    </label>
                  ))}
                  <label>
                    Correct answer
                    <select value={question.answer} onChange={(event) => updateQuiz(questionIndex, { answer: Number(event.target.value) })}>
                      {localizedQuestion.options.map((_, optionIndex) => (
                        <option key={`answer-${optionIndex}`} value={optionIndex}>Option {optionIndex + 1}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <button
                  type="button"
                  className="secondary-action"
                  disabled={quiz.length === 1}
                  onClick={() => setQuiz((current) => current.filter((_, currentIndex) => currentIndex !== questionIndex))}
                >
                  Remove Question
                </button>
              </article>
            );
          })}
        </div>
      </div>

      {message && <p className="form-message">{message}</p>}
    </form>
  );
}

function AssignmentControlView({
  data,
  onSaveAssignment,
  onDeleteAssignment
}: {
  data: AcademyData;
  onSaveAssignment: (assignment: Assignment) => void;
  onDeleteAssignment: (assignmentId: string) => void;
}) {
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();
  const [message, setMessage] = useState("");

  function handleDelete(assignment: Assignment) {
    const blockers = getAssignmentDeleteBlockers(data, assignment.id);
    if (blockers.length) {
      setMessage(`Assignment cannot be deleted: ${blockers.join(", ")}.`);
      return;
    }

    const employee = findEmployee(data, assignment.employeeId);
    const module = findModule(data, assignment.moduleId);
    if (window.confirm(`Delete ${employee?.name ?? "employee"} - ${module?.title ?? "module"} assignment?`)) {
      onDeleteAssignment(assignment.id);
      setMessage("Assignment deleted.");
    }
  }

  return (
    <section className="split-layout master-layout">
      <AssignmentForm
        key={editingAssignment?.id ?? "new-assignment"}
        employees={data.employees}
        modules={data.modules}
        editingAssignment={editingAssignment}
        onCancel={() => setEditingAssignment(undefined)}
        onSave={(assignment) => {
          onSaveAssignment(assignment);
          setEditingAssignment(undefined);
          setMessage("Assignment saved.");
        }}
      />
      <div className="panel">
        <div className="panel-heading">
          <span className="eyebrow">Current Assignments</span>
          <h2>Edit due dates, frequency and status from one control view.</h2>
        </div>
        {message && <p className="form-message">{message}</p>}
        <div className="assignment-card-list">
          {data.assignments.map((assignment) => {
            const employee = findEmployee(data, assignment.employeeId);
            const module = findModule(data, assignment.moduleId);
            const blockers = getAssignmentDeleteBlockers(data, assignment.id);

            return (
              <article className="assignment-card" key={assignment.id}>
                <div>
                  <span>{assignment.status}</span>
                  <h3>{module?.title ?? "Missing module"}</h3>
                  <p>{employee?.name ?? "Missing employee"} | Due {formatDate(assignment.dueDate)} | {assignment.frequency}</p>
                  <div className="master-meta">
                    <span>Assigned {formatDate(assignment.assignedAt)}</span>
                    <span>{assignment.selectedLanguage ?? moduleDefaultLanguage(module)}</span>
                    <span>Slides {assignment.slideLogs.length}</span>
                    <span>Attempts {quizAttemptCount(assignment)}</span>
                    <span>{assignment.quizScore ? `${assignment.quizScore}%` : "Quiz pending"}</span>
                  </div>
                  {blockers.length > 0 && <p className="blocker-note">Blocked: {blockers.join(", ")}</p>}
                </div>
                <div className="kpi-actions">
                  <button type="button" className="secondary-action" onClick={() => setEditingAssignment(assignment)}>
                    Edit
                  </button>
                  <button type="button" className="danger-action" onClick={() => handleDelete(assignment)}>
                    Delete
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AssignmentForm({
  employees,
  modules,
  editingAssignment,
  onSave,
  onCancel
}: {
  employees: Employee[];
  modules: TrainingModule[];
  editingAssignment?: Assignment;
  onSave: (assignment: Assignment) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="panel large form-panel"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSave({
          id: editingAssignment?.id ?? createId("asg"),
          employeeId: String(form.get("employeeId")),
          moduleId: String(form.get("moduleId")),
          dueDate: String(form.get("dueDate")),
          frequency: String(form.get("frequency")),
          status: String(form.get("status")) as AssignmentStatus,
          assignedAt: editingAssignment?.assignedAt ?? todayIso(),
          currentSlide: editingAssignment?.currentSlide ?? 0,
          slideLogs: editingAssignment?.slideLogs ?? [],
          quizScore: editingAssignment?.quizScore,
          certificateId: editingAssignment?.certificateId,
          selectedLanguage: editingAssignment?.selectedLanguage,
          quizAttempts: editingAssignment?.quizAttempts
        });
        event.currentTarget.reset();
      }}
    >
      <div className="panel-heading row">
        <div>
          <span className="eyebrow">{editingAssignment ? "Edit Assignment" : "Assignment Logic"}</span>
          <h2>{editingAssignment ? "Update status, due date and frequency." : "Assign training manually or let rules generate it."}</h2>
        </div>
        {editingAssignment && (
          <button type="button" className="secondary-action" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>
      <div className="assignment-builder">
        <label>
          Employee
          <select name="employeeId" required defaultValue={editingAssignment?.employeeId ?? employees[0]?.id}>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </label>
        <label>
          Training module
          <select name="moduleId" required defaultValue={editingAssignment?.moduleId ?? modules[0]?.id}>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
        </label>
        <label>Due date<input name="dueDate" type="date" defaultValue={editingAssignment?.dueDate ?? "2026-06-30"} required /></label>
        <label>Frequency<input name="frequency" defaultValue={editingAssignment?.frequency ?? "Yearly"} required /></label>
        <label>
          Status
          <select name="status" required defaultValue={editingAssignment?.status ?? "Pending"}>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Quiz Ready">Quiz Ready</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
        <button type="submit">{editingAssignment ? "Save Assignment" : "Create Assignment"}</button>
      </div>
    </form>
  );
}

function AssignmentRulesView({
  data,
  onSaveRule,
  onDeleteRule,
  onApplyRules
}: {
  data: AcademyData;
  onSaveRule: (rule: AssignmentRule) => void;
  onDeleteRule: (ruleId: string) => void;
  onApplyRules: () => void;
}) {
  const [editingRule, setEditingRule] = useState<AssignmentRule | undefined>();
  const [message, setMessage] = useState("");
  const activeRules = data.assignmentRules.filter((rule) => rule.status === "Active").length;
  const totalMissing = countMissingAssignments(data);
  const requiredAssignments = data.assignmentRules.reduce((total, rule) => total + getRuleCoverage(data, rule).required, 0);
  const coveredAssignments = data.assignmentRules.reduce((total, rule) => total + getRuleCoverage(data, rule).existing, 0);
  const coverage = requiredAssignments ? Math.round((coveredAssignments / requiredAssignments) * 100) : 100;

  return (
    <section className="view-stack">
      <section className="metric-grid">
        <Metric label="Rules" value={String(data.assignmentRules.length).padStart(2, "0")} tone="teal" />
        <Metric label="Active Rules" value={String(activeRules).padStart(2, "0")} tone="blue" />
        <Metric label="Coverage" value={`${coverage}%`} tone="green" />
        <Metric label="Missing Assignments" value={String(totalMissing).padStart(2, "0")} tone="teal" />
      </section>

      <section className="split-layout rules-layout">
        <AssignmentRuleForm
          key={editingRule?.id ?? "new-rule"}
          data={data}
          editingRule={editingRule}
          onCancel={() => setEditingRule(undefined)}
          onSave={(rule) => {
            onSaveRule(rule);
            setEditingRule(undefined);
            setMessage(`${rule.name} saved.`);
          }}
        />
        <div className="panel">
          <div className="panel-heading row">
            <div>
              <span className="eyebrow">Rule Coverage</span>
              <h2>Generate missing assignments from department and role rules.</h2>
            </div>
            <button
              type="button"
              onClick={() => {
                const missing = countMissingAssignments(data);
                onApplyRules();
                setMessage(missing ? `${missing} missing assignment${missing === 1 ? "" : "s"} generated.` : "All active rules are already covered.");
              }}
            >
              Apply Active Rules
            </button>
          </div>
          {message && <p className="form-message">{message}</p>}
          <div className="rule-card-grid">
            {data.assignmentRules.map((rule) => {
              const coverageItem = getRuleCoverage(data, rule);
              return (
                <article className="rule-card" key={rule.id}>
                  <div className="rule-card-header">
                    <span>{rule.scope}</span>
                    <em className={rule.status === "Active" ? "rule-active" : "rule-paused"}>{rule.status}</em>
                  </div>
                  <h3>{rule.name}</h3>
                  <p>{rule.department || "Any department"} | {rule.role || "Any role"}</p>
                  <div className="rule-modules">
                    {rule.moduleIds.map((moduleId) => (
                      <span key={moduleId}>{findModule(data, moduleId)?.title ?? "Missing module"}</span>
                    ))}
                  </div>
                  <div className="rule-coverage-bar">
                    <i style={{ width: `${coverageItem.required ? Math.round((coverageItem.existing / coverageItem.required) * 100) : 100}%` }} />
                  </div>
                  <div className="rule-meta">
                    <span>Employees: {coverageItem.employees}</span>
                    <span>Existing: {coverageItem.existing}/{coverageItem.required}</span>
                    <span>Missing: {coverageItem.missing}</span>
                    <span>Due: {rule.dueDays} days</span>
                    <span>Target: {rule.targetSkillLevel ?? "-"}</span>
                    <span>Practical: {rule.practicalSignOffRequired ? "Required" : "No"}</span>
                  </div>
                  <div className="kpi-actions">
                    <button type="button" className="secondary-action" onClick={() => setEditingRule(rule)}>
                      Edit
                    </button>
                    <button type="button" className="danger-action" onClick={() => onDeleteRule(rule.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="eyebrow">Rule Audit Table</span>
          <h2>Every rule shows who it covers and what is still missing.</h2>
        </div>
        <DataTable
          headers={["Rule", "Scope", "Matched", "Modules", "Existing", "Missing", "Target Skill"]}
          rows={data.assignmentRules.map((rule) => {
            const coverageItem = getRuleCoverage(data, rule);
            return [
              rule.name,
              `${rule.scope} | ${rule.status}`,
              String(coverageItem.employees),
              String(rule.moduleIds.length),
              `${coverageItem.existing}/${coverageItem.required}`,
              String(coverageItem.missing),
              rule.targetSkillLevel ?? "-"
            ];
          })}
        />
      </section>
    </section>
  );
}

function AssignmentRuleForm({
  data,
  editingRule,
  onSave,
  onCancel
}: {
  data: AcademyData;
  editingRule?: AssignmentRule;
  onSave: (rule: AssignmentRule) => void;
  onCancel: () => void;
}) {
  const departments = uniqueValues(data.employees.map((employee) => employee.department));
  const roles = uniqueValues(data.employees.map((employee) => employee.roleTitle));

  return (
    <form
      className="panel form-panel rule-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const moduleIds = form.getAll("moduleIds").map(String);
        const department = String(form.get("department") ?? "");
        const role = String(form.get("role") ?? "");
        const targetSkillLevel = String(form.get("targetSkillLevel") ?? "");

        if (!moduleIds.length) {
          return;
        }

        onSave({
          id: editingRule?.id ?? createId("rule"),
          name: String(form.get("name")).trim(),
          scope: String(form.get("scope")) as AssignmentRuleScope,
          department: department || undefined,
          role: role || undefined,
          moduleIds,
          frequency: String(form.get("frequency")).trim(),
          dueDays: Number(form.get("dueDays")),
          targetSkillLevel: targetSkillLevel ? targetSkillLevel as SkillLevel : undefined,
          practicalSignOffRequired: form.get("practicalSignOffRequired") === "on",
          status: String(form.get("status")) as AssignmentRuleStatus,
          createdAt: editingRule?.createdAt ?? todayIso()
        });
        event.currentTarget.reset();
      }}
    >
      <div className="panel-heading row">
        <div>
          <span className="eyebrow">{editingRule ? "Edit Rule" : "Assignment Rule"}</span>
          <h2>{editingRule ? "Update department or role training logic." : "Create reusable training assignment logic."}</h2>
        </div>
        {editingRule && (
          <button type="button" className="secondary-action" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>
      <div className="builder-grid">
        <label className="wide-field">Rule name<input name="name" required defaultValue={editingRule?.name} placeholder="Rack Loading Operator Certification" /></label>
        <label>
          Scope
          <select name="scope" required defaultValue={editingRule?.scope ?? "Department"}>
            {assignmentRuleScopes.map((scope) => (
              <option key={scope} value={scope}>{scope}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" required defaultValue={editingRule?.status ?? "Active"}>
            {assignmentRuleStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Department
          <select name="department" defaultValue={editingRule?.department ?? ""}>
            <option value="">Any department</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </label>
        <label>
          Role
          <select name="role" defaultValue={editingRule?.role ?? ""}>
            <option value="">Any role</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
        <label>Frequency<input name="frequency" required defaultValue={editingRule?.frequency ?? "Yearly"} /></label>
        <label>Due days<input name="dueDays" type="number" min="0" required defaultValue={editingRule?.dueDays ?? 7} /></label>
        <label>
          Target skill
          <select name="targetSkillLevel" defaultValue={editingRule?.targetSkillLevel ?? ""}>
            <option value="">No skill target</option>
            {skillLevels.map((level) => (
              <option key={level} value={level}>{level} | {skillLevelMeaning(level)}</option>
            ))}
          </select>
        </label>
        <label className="option rule-toggle">
          <input name="practicalSignOffRequired" type="checkbox" defaultChecked={editingRule?.practicalSignOffRequired ?? false} />
          Practical sign-off required
        </label>
        <div className="wide-field module-picker">
          <span>Required modules</span>
          {data.modules.map((module) => (
            <label className="option" key={module.id}>
              <input
                type="checkbox"
                name="moduleIds"
                value={module.id}
                defaultChecked={editingRule?.moduleIds.includes(module.id) ?? module.status === "Published"}
              />
              {module.title}
            </label>
          ))}
        </div>
      </div>
      <button type="submit">{editingRule ? "Save Rule Changes" : "Add Assignment Rule"}</button>
    </form>
  );
}

function SkillMatrixView({
  data,
  onSaveSkill,
  onDeleteSkill,
  onAddSignOff
}: {
  data: AcademyData;
  onSaveSkill: (skill: SkillRecord) => void;
  onDeleteSkill: (skillId: string) => void;
  onAddSignOff: (signOff: PracticalSignOff) => void;
}) {
  const [editingSkill, setEditingSkill] = useState<SkillRecord | undefined>();
  const certified = data.skills.filter((skill) => skill.status === "Certified").length;
  const independent = data.skills.filter((skill) => skill.level === "L4" || skill.level === "L5").length;
  const pending = data.skills.filter((skill) => skill.status === "Training Pending" || skill.status === "Practical Pending").length;
  const renewalRisk = data.skills.filter((skill) => skill.status === "Renewal Due" || skill.status === "Expired").length;

  return (
    <section className="view-stack">
      <section className="metric-grid">
        <Metric label="Skill Records" value={String(data.skills.length).padStart(2, "0")} tone="teal" />
        <Metric label="Certified" value={String(certified).padStart(2, "0")} tone="blue" />
        <Metric label="L4 / L5" value={String(independent).padStart(2, "0")} tone="green" />
        <Metric label="Pending / Renewal" value={String(pending + renewalRisk).padStart(2, "0")} tone="teal" />
      </section>

      <section className="split-layout skill-layout">
        <SkillForm
          key={editingSkill?.id ?? "new-skill"}
          data={data}
          editingSkill={editingSkill}
          onCancel={() => setEditingSkill(undefined)}
          onSave={(skill) => {
            onSaveSkill(skill);
            setEditingSkill(undefined);
          }}
        />
        <div className="panel">
          <div className="panel-heading row">
            <div>
              <span className="eyebrow">Skill Matrix</span>
              <h2>Training completed does not mean skill certified.</h2>
            </div>
            <button type="button" onClick={() => downloadSkillMatrixPdf(data)}>
              Download Skill PDF
            </button>
          </div>
          <div className="skill-card-grid">
            {data.skills.map((skill) => {
              const employee = findEmployee(data, skill.employeeId);
              const module = skill.linkedTrainingId ? findModule(data, skill.linkedTrainingId) : undefined;
              const kpi = skill.linkedKpiId ? findKpi(data, skill.linkedKpiId) : undefined;

              return (
                <article key={skill.id} className="skill-card">
                  <div className="skill-card-header">
                    <span>{skill.level}</span>
                    <em className={`skill-status ${skillStatusClass(skill.status)}`}>{skill.status}</em>
                  </div>
                  <h3>{skill.skillName}</h3>
                  <p>{employee?.name ?? "Unassigned"} | {skill.department} | {skill.role}</p>
                  <div className="skill-permission">
                    <strong>{skillWorkPermission(skill.level)}</strong>
                    <span>{skillLevelMeaning(skill.level)}</span>
                  </div>
                  <div className="skill-links">
                    {module && <span>{module.title}</span>}
                    {kpi && <span>{kpi.title}</span>}
                    {skill.validTill && <span>Valid till {formatDate(skill.validTill)}</span>}
                  </div>
                  <div className="kpi-actions">
                    <button type="button" className="secondary-action" onClick={() => setEditingSkill(skill)}>
                      Edit
                    </button>
                    <button type="button" className="danger-action" onClick={() => onDeleteSkill(skill.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="split-layout signoff-layout">
        <PracticalSignOffForm data={data} onAddSignOff={onAddSignOff} />
        <div className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Practical Evidence</span>
            <h2>Supervisor observation turns training into work permission.</h2>
          </div>
          <div className="signoff-list">
            {data.signOffs.length ? (
              data.signOffs.slice().reverse().map((signOff) => {
                const skill = findSkill(data, signOff.skillRecordId);
                const employee = findEmployee(data, signOff.employeeId);
                return (
                  <article key={signOff.id}>
                    <div>
                      <span>{signOff.result}</span>
                      <h3>{employee?.name ?? "Employee"} | {skill?.skillName ?? "Deleted skill"}</h3>
                      <p>{signOff.notes || signOff.nextAction || "No notes recorded."}</p>
                    </div>
                    <div className="signoff-meta">
                      <strong>{formatDate(signOff.observedAt)}</strong>
                      <em>{signOff.supervisor}</em>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="muted-copy">No practical sign-offs have been recorded yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="eyebrow">Work Permission Matrix</span>
          <h2>L0 to L5 controls what the employee is allowed to do.</h2>
        </div>
        <DataTable
          headers={["Employee", "Skill", "Level", "Permission", "Status", "Training", "KPI"]}
          rows={data.skills.map((skill) => [
            findEmployee(data, skill.employeeId)?.name ?? "-",
            skill.skillName,
            `${skill.level} | ${skillLevelMeaning(skill.level)}`,
            skillWorkPermission(skill.level),
            skill.status,
            skill.linkedTrainingId ? findModule(data, skill.linkedTrainingId)?.title ?? "-" : "-",
            skill.linkedKpiId ? findKpi(data, skill.linkedKpiId)?.title ?? "-" : "-"
          ])}
        />
      </section>
    </section>
  );
}

function SkillForm({
  data,
  editingSkill,
  onSave,
  onCancel
}: {
  data: AcademyData;
  editingSkill?: SkillRecord;
  onSave: (skill: SkillRecord) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="panel form-panel skill-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const linkedTrainingId = String(form.get("linkedTrainingId") ?? "");
        const linkedKpiId = String(form.get("linkedKpiId") ?? "");
        const validTill = String(form.get("validTill") ?? "");

        onSave({
          id: editingSkill?.id ?? createId("skill"),
          employeeId: String(form.get("employeeId")),
          skillName: String(form.get("skillName")).trim(),
          department: String(form.get("department")).trim(),
          role: String(form.get("role")).trim(),
          level: String(form.get("level")) as SkillLevel,
          status: String(form.get("status")) as SkillStatus,
          linkedTrainingId: linkedTrainingId || undefined,
          linkedKpiId: linkedKpiId || undefined,
          supervisor: String(form.get("supervisor")).trim(),
          validTill: validTill || undefined,
          lastSignOffId: editingSkill?.lastSignOffId,
          notes: String(form.get("notes")).trim(),
          updatedAt: todayIso()
        });
        event.currentTarget.reset();
      }}
    >
      <div className="panel-heading row">
        <div>
          <span className="eyebrow">{editingSkill ? "Edit Skill" : "Add Skill"}</span>
          <h2>{editingSkill ? "Update employee skill permission." : "Create a controlled skill record."}</h2>
        </div>
        {editingSkill && (
          <button type="button" className="secondary-action" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>
      <div className="builder-grid">
        <label>
          Employee
          <select name="employeeId" required defaultValue={editingSkill?.employeeId ?? data.employees[0]?.id}>
            {data.employees.map((employee) => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </label>
        <label>Skill<input name="skillName" required defaultValue={editingSkill?.skillName} placeholder="Rack Loading" /></label>
        <label>Department<input name="department" required defaultValue={editingSkill?.department} placeholder="Production" /></label>
        <label>Role<input name="role" required defaultValue={editingSkill?.role} placeholder="Rack Loading Operator" /></label>
        <label>
          Level
          <select name="level" required defaultValue={editingSkill?.level ?? "L0"}>
            {skillLevels.map((level) => (
              <option key={level} value={level}>{level} | {skillLevelMeaning(level)}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" required defaultValue={editingSkill?.status ?? "Training Pending"}>
            {skillStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Linked training
          <select name="linkedTrainingId" defaultValue={editingSkill?.linkedTrainingId ?? ""}>
            <option value="">No training link</option>
            {data.modules.map((module) => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
        </label>
        <label>
          Linked KPI
          <select name="linkedKpiId" defaultValue={editingSkill?.linkedKpiId ?? ""}>
            <option value="">No KPI link</option>
            {data.kpis.map((kpi) => (
              <option key={kpi.id} value={kpi.id}>{kpi.title}</option>
            ))}
          </select>
        </label>
        <label>Supervisor<input name="supervisor" required defaultValue={editingSkill?.supervisor} placeholder="Production Supervisor" /></label>
        <label>Valid till<input name="validTill" type="date" defaultValue={editingSkill?.validTill} /></label>
        <label className="wide-field">Notes<textarea name="notes" defaultValue={editingSkill?.notes} placeholder="Skill evidence, limitations, retraining need or work permission note." /></label>
      </div>
      <button type="submit">{editingSkill ? "Save Skill Changes" : "Add Skill Record"}</button>
    </form>
  );
}

function PracticalSignOffForm({
  data,
  onAddSignOff
}: {
  data: AcademyData;
  onAddSignOff: (signOff: PracticalSignOff) => void;
}) {
  return (
    <form
      className="panel form-panel signoff-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const skillRecordId = String(form.get("skillRecordId"));
        const skill = findSkill(data, skillRecordId);
        if (!skill) {
          return;
        }

        onAddSignOff({
          id: createId("signoff"),
          skillRecordId,
          employeeId: skill.employeeId,
          supervisor: String(form.get("supervisor")).trim(),
          observedAt: String(form.get("observedAt")),
          result: String(form.get("result")) as SignOffResult,
          checklist: form.getAll("checklist").map(String),
          notes: String(form.get("notes")).trim(),
          nextAction: String(form.get("nextAction")).trim()
        });
        event.currentTarget.reset();
      }}
    >
      <div className="panel-heading">
        <span className="eyebrow">Practical Sign-Off</span>
        <h2>Observe the employee before independent work permission.</h2>
      </div>
      <div className="builder-grid">
        <label className="wide-field">
          Skill record
          <select name="skillRecordId" required defaultValue={data.skills[0]?.id}>
            {data.skills.map((skill) => (
              <option key={skill.id} value={skill.id}>
                {findEmployee(data, skill.employeeId)?.name} | {skill.skillName} | {skill.level}
              </option>
            ))}
          </select>
        </label>
        <label>Supervisor<input name="supervisor" required defaultValue="Production Supervisor" /></label>
        <label>Observed date<input name="observedAt" type="date" required defaultValue={todayIso()} /></label>
        <label>
          Result
          <select name="result" required defaultValue="Pass">
            {signOffResults.map((result) => (
              <option key={result} value={result}>{result}</option>
            ))}
          </select>
        </label>
        <div className="wide-field checklist-box">
          <span>Checklist</span>
          {practicalChecklist.map((item) => (
            <label className="option" key={item}>
              <input type="checkbox" name="checklist" value={item} defaultChecked />
              {item}
            </label>
          ))}
        </div>
        <label className="wide-field">Observation notes<textarea name="notes" placeholder="What was observed during practical demonstration?" /></label>
        <label className="wide-field">Next action<textarea name="nextAction" placeholder="Certification, retraining, coaching, re-assessment or renewal action." /></label>
      </div>
      <button type="submit" disabled={!data.skills.length}>Save Practical Sign-Off</button>
    </form>
  );
}

function AttendanceView({
  data,
  reloadData,
  onSaveMapping,
  onDeleteMapping,
  onSaveShift,
  onDeleteShift
}: {
  data: AcademyData;
  reloadData: () => Promise<void>;
  onSaveMapping: (mapping: AttendanceMapping) => void;
  onDeleteMapping: (mappingId: string) => void;
  onSaveShift: (shift: ShiftRule) => void;
  onDeleteShift: (shiftId: string) => void;
}) {
  const [editingMapping, setEditingMapping] = useState<AttendanceMapping | undefined>();
  const [editingShift, setEditingShift] = useState<ShiftRule | undefined>();
  const [message, setMessage] = useState("");
  const summaries = buildAttendanceSummaries(data);
  const validPunches = data.attendancePunches.filter((punch) => punch.authTokenStatus === "Valid");
  const unmappedPunches = validPunches.filter((punch) => !punch.employeeId).length;
  const todaysKey = todayIso();
  const todaysSummaries = summaries.filter((summary) => summary.date === todaysKey);
  const disciplineScore = summaries.length
    ? Math.round(summaries.reduce((total, summary) => total + summary.score, 0) / summaries.length)
    : 0;

  function handleDeleteMapping(mapping: AttendanceMapping) {
    const punchCount = data.attendancePunches.filter((punch) => punch.camsUserId === mapping.camsUserId).length;
    if (punchCount) {
      setMessage(`Mapping cannot be deleted because ${punchCount} punch${punchCount === 1 ? "" : "es"} already reference CAMS User ${mapping.camsUserId}. Set it inactive instead.`);
      return;
    }

    onDeleteMapping(mapping.id);
    setMessage("Attendance mapping deleted.");
  }

  function handleDeleteShift(shift: ShiftRule) {
    if (data.shiftRules.length <= 1) {
      setMessage("At least one shift rule is required.");
      return;
    }

    onDeleteShift(shift.id);
    setMessage(`${shift.name} deleted.`);
  }

  return (
    <section className="view-stack">
      <section className="metric-grid">
        <Metric label="Mapped Users" value={String(data.attendanceMappings.filter((mapping) => mapping.status === "Active").length).padStart(2, "0")} tone="teal" />
        <Metric label="Punch Logs" value={String(data.attendancePunches.length).padStart(2, "0")} tone="blue" />
        <Metric label="Today Records" value={String(todaysSummaries.length).padStart(2, "0")} tone="green" />
        <Metric label="Discipline Score" value={`${disciplineScore}%`} tone="teal" />
      </section>

      <section className="split-layout attendance-layout">
        <div className="view-stack">
          <AttendanceMappingForm
            key={editingMapping?.id ?? "new-attendance-mapping"}
            data={data}
            editingMapping={editingMapping}
            onCancel={() => setEditingMapping(undefined)}
            onSave={(mapping) => {
              onSaveMapping(mapping);
              setEditingMapping(undefined);
              setMessage(`CAMS User ${mapping.camsUserId} mapping saved.`);
            }}
          />
          <ShiftRuleForm
            key={editingShift?.id ?? "new-shift"}
            data={data}
            editingShift={editingShift}
            onCancel={() => setEditingShift(undefined)}
            onSave={(shift) => {
              onSaveShift(shift);
              setEditingShift(undefined);
              setMessage(`${shift.name} saved.`);
            }}
          />
          <MockCamsPunchForm data={data} reloadData={reloadData} onMessage={setMessage} />
        </div>

        <div className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Attendance Intelligence</span>
            <h2>CAMS punches become mapped attendance, shift status and discipline evidence.</h2>
          </div>
          {message && <p className="form-message">{message}</p>}
          <div className="attendance-summary-grid">
            {summaries.length ? (
              summaries.slice(0, 8).map((summary) => (
                <article key={summary.key} className="attendance-summary-card">
                  <div className="attendance-card-header">
                    <span>{summary.status}</span>
                    <em>{summary.score}%</em>
                  </div>
                  <h3>{summary.employeeName}</h3>
                  <p>{formatDate(summary.date)} | {summary.shiftName}</p>
                  <div className="master-meta">
                    <span>In {summary.firstPunch}</span>
                    <span>Out {summary.lastPunch}</span>
                    <span>{formatDuration(summary.minutesWorked)}</span>
                    <span>{summary.punchCount} punches</span>
                  </div>
                </article>
              ))
            ) : (
              <p className="muted-copy">No valid attendance summaries yet. Send a mock CAMS punch to start.</p>
            )}
          </div>
        </div>
      </section>

      <section className="split-layout attendance-layout">
        <div className="panel">
          <div className="panel-heading">
            <span className="eyebrow">CAMS User Mapping</span>
            <h2>Map CAMS biometric UserId to Academy employees.</h2>
          </div>
          <div className="mapping-card-grid">
            {data.attendanceMappings.map((mapping) => {
              const employee = findEmployee(data, mapping.employeeId);
              return (
                <article className="mapping-card" key={mapping.id}>
                  <div className="mapping-card-header">
                    <span>CAMS {mapping.camsUserId}</span>
                    <em>{mapping.status}</em>
                  </div>
                  <h3>{employee?.name ?? "Missing employee"}</h3>
                  <p>{mapping.deviceSerial || "Any device"} | {mapping.notes || "No notes"}</p>
                  <div className="kpi-actions">
                    <button type="button" className="secondary-action" onClick={() => setEditingMapping(mapping)}>
                      Edit
                    </button>
                    <button type="button" className="danger-action" onClick={() => handleDeleteMapping(mapping)}>
                      Delete
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <span className="eyebrow">Shift Rules</span>
            <h2>Attendance status is calculated from shift timing and grace rules.</h2>
          </div>
          <div className="mapping-card-grid">
            {data.shiftRules.map((shift) => (
              <article className="mapping-card" key={shift.id}>
                <div className="mapping-card-header">
                  <span>{shift.status}</span>
                  <em>{shift.department || "All"}</em>
                </div>
                <h3>{shift.name}</h3>
                <p>{shift.startTime} to {shift.endTime} | Grace {shift.graceMinutes} min</p>
                <div className="master-meta">
                  <span>Half day after {formatDuration(shift.halfDayAfterMinutes)}</span>
                  <span>Absent after {formatDuration(shift.absentAfterMinutes)}</span>
                  <span>OT after {shift.overtimeAfterMinutes} min</span>
                </div>
                <div className="kpi-actions">
                  <button type="button" className="secondary-action" onClick={() => setEditingShift(shift)}>
                    Edit
                  </button>
                  <button type="button" className="danger-action" onClick={() => handleDeleteShift(shift)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="eyebrow">Raw Punch Log</span>
          <h2>Raw CAMS events are preserved before attendance logic is applied.</h2>
        </div>
        <DataTable
          headers={["Log Time", "CAMS User", "Employee", "Type", "Input", "Device", "Auth"]}
          rows={data.attendancePunches.slice().reverse().slice(0, 12).map((punch) => [
            punch.logTime,
            punch.camsUserId,
            punch.employeeId ? findEmployee(data, punch.employeeId)?.name ?? punch.employeeId : "Unmapped",
            punch.duplicateOf ? `${punch.punchType} | Duplicate` : punch.punchType,
            punch.inputType,
            punch.serialNumber ?? "-",
            punch.authTokenStatus
          ])}
        />
        {unmappedPunches > 0 && <p className="blocker-note">{unmappedPunches} valid punch{unmappedPunches === 1 ? "" : "es"} need CAMS User mapping.</p>}
      </section>
    </section>
  );
}

function AttendanceMappingForm({
  data,
  editingMapping,
  onSave,
  onCancel
}: {
  data: AcademyData;
  editingMapping?: AttendanceMapping;
  onSave: (mapping: AttendanceMapping) => void;
  onCancel: () => void;
}) {
  return (
    <form
      className="panel form-panel"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onSave({
          id: editingMapping?.id ?? createId("attmap"),
          camsUserId: String(form.get("camsUserId")).trim(),
          employeeId: String(form.get("employeeId")),
          deviceSerial: String(form.get("deviceSerial") ?? "").trim() || undefined,
          status: String(form.get("status")) as AttendanceMappingStatus,
          notes: String(form.get("notes")).trim()
        });
        event.currentTarget.reset();
      }}
    >
      <div className="panel-heading row">
        <div>
          <span className="eyebrow">{editingMapping ? "Edit Mapping" : "CAMS Mapping"}</span>
          <h2>Connect biometric UserId to Academy employee.</h2>
        </div>
        {editingMapping && (
          <button type="button" className="secondary-action" onClick={onCancel}>Cancel Edit</button>
        )}
      </div>
      <div className="builder-grid">
        <label>CAMS UserId<input name="camsUserId" required defaultValue={editingMapping?.camsUserId} placeholder="Example: 1" /></label>
        <label>
          Employee
          <select name="employeeId" required defaultValue={editingMapping?.employeeId ?? data.employees[0]?.id}>
            {data.employees.map((employee) => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </label>
        <label>Device serial<input name="deviceSerial" defaultValue={editingMapping?.deviceSerial} placeholder="VOLTRON-GATE-01" /></label>
        <label>
          Status
          <select name="status" required defaultValue={editingMapping?.status ?? "Active"}>
            {attendanceMappingStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="wide-field">Notes<textarea name="notes" defaultValue={editingMapping?.notes} placeholder="Gate mapping, device notes, card/fingerprint reference." /></label>
      </div>
      <button type="submit">{editingMapping ? "Save Mapping" : "Add Mapping"}</button>
    </form>
  );
}

function ShiftRuleForm({
  data,
  editingShift,
  onSave,
  onCancel
}: {
  data: AcademyData;
  editingShift?: ShiftRule;
  onSave: (shift: ShiftRule) => void;
  onCancel: () => void;
}) {
  const departments = uniqueValues(data.employees.map((employee) => employee.department));
  const roles = uniqueValues(data.employees.map((employee) => employee.roleTitle));

  return (
    <form
      className="panel form-panel"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const department = String(form.get("department") ?? "");
        const role = String(form.get("role") ?? "");
        onSave({
          id: editingShift?.id ?? createId("shift"),
          name: String(form.get("name")).trim(),
          department: department || undefined,
          role: role || undefined,
          startTime: String(form.get("startTime")),
          endTime: String(form.get("endTime")),
          graceMinutes: Number(form.get("graceMinutes")),
          halfDayAfterMinutes: Number(form.get("halfDayAfterMinutes")),
          absentAfterMinutes: Number(form.get("absentAfterMinutes")),
          overtimeAfterMinutes: Number(form.get("overtimeAfterMinutes")),
          status: String(form.get("status")) as ShiftRuleStatus
        });
        event.currentTarget.reset();
      }}
    >
      <div className="panel-heading row">
        <div>
          <span className="eyebrow">{editingShift ? "Edit Shift" : "Shift Rule"}</span>
          <h2>Define late, half-day, absent and overtime thresholds.</h2>
        </div>
        {editingShift && (
          <button type="button" className="secondary-action" onClick={onCancel}>Cancel Edit</button>
        )}
      </div>
      <div className="builder-grid">
        <label className="wide-field">Shift name<input name="name" required defaultValue={editingShift?.name ?? "General Shift"} /></label>
        <label>
          Department
          <select name="department" defaultValue={editingShift?.department ?? ""}>
            <option value="">All departments</option>
            {departments.map((department) => (
              <option key={department} value={department}>{department}</option>
            ))}
          </select>
        </label>
        <label>
          Role
          <select name="role" defaultValue={editingShift?.role ?? ""}>
            <option value="">All roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </label>
        <label>Start<input name="startTime" type="time" required defaultValue={editingShift?.startTime ?? "08:30"} /></label>
        <label>End<input name="endTime" type="time" required defaultValue={editingShift?.endTime ?? "17:30"} /></label>
        <label>Grace minutes<input name="graceMinutes" type="number" min="0" required defaultValue={editingShift?.graceMinutes ?? 10} /></label>
        <label>Half-day after minutes<input name="halfDayAfterMinutes" type="number" min="0" required defaultValue={editingShift?.halfDayAfterMinutes ?? 240} /></label>
        <label>Absent after minutes<input name="absentAfterMinutes" type="number" min="0" required defaultValue={editingShift?.absentAfterMinutes ?? 300} /></label>
        <label>OT after minutes<input name="overtimeAfterMinutes" type="number" min="0" required defaultValue={editingShift?.overtimeAfterMinutes ?? 45} /></label>
        <label>
          Status
          <select name="status" required defaultValue={editingShift?.status ?? "Active"}>
            {shiftRuleStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit">{editingShift ? "Save Shift" : "Add Shift"}</button>
    </form>
  );
}

function MockCamsPunchForm({
  data,
  reloadData,
  onMessage
}: {
  data: AcademyData;
  reloadData: () => Promise<void>;
  onMessage: (message: string) => void;
}) {
  const [isSending, setIsSending] = useState(false);

  return (
    <form
      className="panel form-panel"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        setIsSending(true);
        const payload = {
          RealTime: {
            OperationID: createId("camsop"),
            LabelName: String(form.get("labelName")),
            SerialNumber: String(form.get("serialNumber")),
            PunchLog: {
              Type: String(form.get("punchType")),
              Temperature: String(form.get("temperature")),
              FaceMask: false,
              InputType: String(form.get("inputType")),
              UserId: String(form.get("camsUserId")),
              LogTime: `${String(form.get("logDate"))} ${String(form.get("logTime"))}:00 GMT +0530`
            },
            AuthToken: String(form.get("authToken")),
            Time: new Date().toISOString()
          }
        };

        try {
          const response = await fetch("/api/attendance/cams/callback", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          const result = (await response.json()) as { status?: string };
          if (!response.ok) {
            throw new Error(result.status ?? "Callback failed.");
          }

          await reloadData();
          onMessage("Mock CAMS punch accepted through callback API.");
        } catch (error) {
          onMessage(error instanceof Error ? error.message : "Mock punch failed.");
        } finally {
          setIsSending(false);
        }
      }}
    >
      <div className="panel-heading">
        <span className="eyebrow">Mock CAMS Callback</span>
        <h2>Send a local test punch into the real callback endpoint.</h2>
      </div>
      <div className="builder-grid">
        <label>
          CAMS UserId
          <select name="camsUserId" required defaultValue={data.attendanceMappings[0]?.camsUserId ?? "1"}>
            {data.attendanceMappings.map((mapping) => (
              <option key={mapping.id} value={mapping.camsUserId}>
                {mapping.camsUserId} | {findEmployee(data, mapping.employeeId)?.name ?? "Employee"}
              </option>
            ))}
          </select>
        </label>
        <label>
          Punch type
          <select name="punchType" required defaultValue="CheckIn">
            {attendancePunchTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>
          Input
          <select name="inputType" required defaultValue="Fingerprint">
            {attendanceInputTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>
        <label>Log date<input name="logDate" type="date" required defaultValue={todayIso()} /></label>
        <label>Log time<input name="logTime" type="time" required defaultValue="08:31" /></label>
        <label>Temperature<input name="temperature" defaultValue="36.7" /></label>
        <label>Serial<input name="serialNumber" required defaultValue="VOLTRON-GATE-01" /></label>
        <label>Label<input name="labelName" required defaultValue="Voltron Gate" /></label>
        <label className="wide-field">AuthToken<input name="authToken" required defaultValue={camsDemoAuthToken} /></label>
      </div>
      <button type="submit" disabled={isSending}>{isSending ? "Sending Punch..." : "Send Mock Punch"}</button>
    </form>
  );
}

function KpiCascadeView({
  data,
  onSave,
  onDelete,
  onAddReview
}: {
  data: AcademyData;
  onSave: (kpi: KPI) => void;
  onDelete: (kpiId: string) => void;
  onAddReview: (review: KpiReview) => void;
}) {
  const [editingKpi, setEditingKpi] = useState<KPI | undefined>();
  const kpis = data.kpis;
  const scoredKpis = kpis.filter((kpi) => typeof kpi.currentScore === "number");
  const averageScore = scoredKpis.length
    ? Math.round(scoredKpis.reduce((total, kpi) => total + (kpi.currentScore ?? 0), 0) / scoredKpis.length)
    : 0;
  const needsAction = kpis.filter((kpi) => kpi.status === "Needs Action").length;
  const individualKpis = kpis.filter((kpi) => kpi.level === "L4 Individual").length;
  const openActions = data.kpiReviews.filter((review) => review.status === "Open").length;

  return (
    <section className="view-stack">
      <section className="metric-grid">
        <Metric label="Total KPIs" value={String(kpis.length).padStart(2, "0")} tone="teal" />
        <Metric label="Avg Score" value={`${averageScore}%`} tone="blue" />
        <Metric label="Individual KPIs" value={String(individualKpis).padStart(2, "0")} tone="green" />
        <Metric label="Open Actions" value={String(needsAction + openActions).padStart(2, "0")} tone="teal" />
      </section>

      <section className="split-layout kpi-layout">
        <KpiForm
          key={editingKpi?.id ?? "new-kpi"}
          data={data}
          editingKpi={editingKpi}
          onCancel={() => setEditingKpi(undefined)}
          onSave={(kpi) => {
            onSave(kpi);
            setEditingKpi(undefined);
          }}
        />
        <div className="panel kpi-tree-panel">
          <div className="panel-heading">
            <span className="eyebrow">Cascade Tree</span>
            <h2>Company goals become leadership, department, and employee accountability.</h2>
          </div>
          <KpiTree
            kpis={kpis}
            data={data}
            onEdit={setEditingKpi}
            onDelete={onDelete}
          />
        </div>
      </section>

      <section className="split-layout kpi-review-layout">
        <KpiReviewForm data={data} onAddReview={onAddReview} />
        <div className="panel">
          <div className="panel-heading row">
            <div>
              <span className="eyebrow">Monthly Review Log</span>
              <h2>Weighted scores, gate status and action plans stay traceable.</h2>
            </div>
            <button type="button" onClick={() => downloadKpiEvidencePdf(data)}>
              Download KPI PDF
            </button>
          </div>
          <div className="review-list">
            {data.kpiReviews.length ? (
              data.kpiReviews.slice().reverse().map((review) => {
                const kpi = findKpi(data, review.kpiId);
                return (
                  <article key={review.id}>
                    <div>
                      <span>{review.period}</span>
                      <h3>{kpi?.title ?? "Deleted KPI"}</h3>
                      <p>{review.actionPlan || "No action plan recorded."}</p>
                    </div>
                    <div className="review-score">
                      <strong>{review.finalScore}%</strong>
                      <em>{review.gateStatus} | {review.status}</em>
                    </div>
                  </article>
                );
              })
            ) : (
              <p className="muted-copy">No KPI reviews have been recorded yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <span className="eyebrow">Accountability Map</span>
          <h2>KPIs stay linked to owners, approvers, behaviour and training controls.</h2>
        </div>
        <div className="kpi-pillar-grid">
          {kpiPillars.map((pillar) => {
            const pillarKpis = kpis.filter((kpi) => kpi.pillar === pillar);
            const pillarScore = pillarKpis.filter((kpi) => typeof kpi.currentScore === "number");
            const score = pillarScore.length
              ? Math.round(pillarScore.reduce((total, kpi) => total + (kpi.currentScore ?? 0), 0) / pillarScore.length)
              : 0;

            return (
              <article key={pillar}>
                <span>{pillar}</span>
                <strong>{pillarKpis.length ? `${score}%` : "-"}</strong>
                <p>{pillarKpis.length} linked KPI{pillarKpis.length === 1 ? "" : "s"}</p>
                <ul>
                  {pillarKpis.slice(0, 3).map((kpi) => (
                    <li key={kpi.id}>
                      <b>{kpi.owner}</b>
                      <em>{kpi.title}</em>
                    </li>
                  ))}
                  {!pillarKpis.length && (
                    <li>
                      <b>Not defined</b>
                      <em>Add the first {pillar.toLowerCase()} KPI</em>
                    </li>
                  )}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading row">
          <div>
            <span className="eyebrow">KPI Scorecard</span>
            <h2>Complete record of WHAT, HOW, skill, team and improvement accountability.</h2>
          </div>
        </div>
        <DataTable
          headers={["Level", "Pillar", "KPI", "Owner", "Target", "Score", "Parent"]}
          rows={kpis.map((kpi) => [
            kpi.level,
            kpi.pillar,
            kpi.title,
            kpi.owner,
            kpi.target,
            typeof kpi.currentScore === "number" ? `${kpi.currentScore}% | ${kpi.status}` : kpi.status,
            kpi.parentId ? findKpi(data, kpi.parentId)?.title ?? "Missing parent" : "Company root"
          ])}
        />
      </section>
    </section>
  );
}

function KpiForm({
  data,
  editingKpi,
  onSave,
  onCancel
}: {
  data: AcademyData;
  editingKpi?: KPI;
  onSave: (kpi: KPI) => void;
  onCancel: () => void;
}) {
  const parentOptions = data.kpis.filter((kpi) => kpi.id !== editingKpi?.id);

  return (
    <form
      className="panel form-panel kpi-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const scoreValue = String(form.get("currentScore") ?? "").trim();
        const employeeId = String(form.get("employeeId") ?? "");
        const parentId = String(form.get("parentId") ?? "");
        const linkedTrainingId = String(form.get("linkedTrainingId") ?? "");
        const linkedSkill = String(form.get("linkedSkill") ?? "").trim();
        const linkedBehaviour = String(form.get("linkedBehaviour") ?? "");
        const department = String(form.get("department") ?? "").trim();
        const role = String(form.get("role") ?? "").trim();

        onSave({
          id: editingKpi?.id ?? createId("kpi"),
          title: String(form.get("title")).trim(),
          level: String(form.get("level")) as KpiLevel,
          pillar: String(form.get("pillar")) as KpiPillar,
          owner: String(form.get("owner")).trim(),
          approver: String(form.get("approver")).trim(),
          department: department || undefined,
          role: role || undefined,
          employeeId: employeeId || undefined,
          weight: Number(form.get("weight")),
          target: String(form.get("target")).trim(),
          frequency: String(form.get("frequency")).trim(),
          dataSource: String(form.get("dataSource")) as KpiDataSource,
          parentId: parentId || undefined,
          linkedTrainingId: linkedTrainingId || undefined,
          linkedSkill: linkedSkill || undefined,
          linkedBehaviour: linkedBehaviour || undefined,
          status: String(form.get("status")) as KpiStatus,
          currentScore: scoreValue ? Number(scoreValue) : undefined
        });
        event.currentTarget.reset();
      }}
    >
      <div className="panel-heading row">
        <div>
          <span className="eyebrow">{editingKpi ? "Edit KPI" : "Add KPI"}</span>
          <h2>{editingKpi ? "Update the accountable KPI node." : "Define the next accountable KPI node."}</h2>
        </div>
        {editingKpi && (
          <button type="button" className="secondary-action" onClick={onCancel}>
            Cancel Edit
          </button>
        )}
      </div>
      <div className="builder-grid">
        <label className="wide-field">KPI title<input name="title" required defaultValue={editingKpi?.title} placeholder="Example: PM compliance >= 95%" /></label>
        <label>
          Level
          <select name="level" required defaultValue={editingKpi?.level ?? "L3 Department"}>
            {kpiLevels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </label>
        <label>
          Pillar
          <select name="pillar" required defaultValue={editingKpi?.pillar ?? "Quality"}>
            {kpiPillars.map((pillar) => (
              <option key={pillar} value={pillar}>{pillar}</option>
            ))}
          </select>
        </label>
        <label>Owner<input name="owner" required defaultValue={editingKpi?.owner} placeholder="Quality Department" /></label>
        <label>Approver<input name="approver" required defaultValue={editingKpi?.approver} placeholder="CTO" /></label>
        <label>Department<input name="department" defaultValue={editingKpi?.department} placeholder="Production / Quality / EHS" /></label>
        <label>Role<input name="role" defaultValue={editingKpi?.role} placeholder="Rack Loading Operator" /></label>
        <label>
          Employee
          <select name="employeeId" defaultValue={editingKpi?.employeeId ?? ""}>
            <option value="">No individual owner</option>
            {data.employees.map((employee) => (
              <option key={employee.id} value={employee.id}>{employee.name}</option>
            ))}
          </select>
        </label>
        <label>Weight<input name="weight" type="number" min="1" max="100" required defaultValue={editingKpi?.weight ?? 20} /></label>
        <label className="wide-field">Target<input name="target" required defaultValue={editingKpi?.target} placeholder="Target, threshold, or operating expectation" /></label>
        <label>Frequency<input name="frequency" required defaultValue={editingKpi?.frequency ?? "Monthly"} /></label>
        <label>
          Data source
          <select name="dataSource" required defaultValue={editingKpi?.dataSource ?? "Manual"}>
            {kpiDataSources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </select>
        </label>
        <label>
          Parent KPI
          <select name="parentId" defaultValue={editingKpi?.parentId ?? ""}>
            <option value="">Company root</option>
            {parentOptions.map((kpi) => (
              <option key={kpi.id} value={kpi.id}>{kpi.level} | {kpi.title}</option>
            ))}
          </select>
        </label>
        <label>
          Linked training
          <select name="linkedTrainingId" defaultValue={editingKpi?.linkedTrainingId ?? ""}>
            <option value="">No training link</option>
            {data.modules.map((module) => (
              <option key={module.id} value={module.id}>{module.title}</option>
            ))}
          </select>
        </label>
        <label>Linked skill<input name="linkedSkill" defaultValue={editingKpi?.linkedSkill} placeholder="Example: Rack Loading L4" /></label>
        <label>
          Behaviour link
          <select name="linkedBehaviour" defaultValue={editingKpi?.linkedBehaviour ?? ""}>
            <option value="">No behaviour link</option>
            {behaviourDimensions.map((dimension) => (
              <option key={dimension} value={dimension}>{dimension}</option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" required defaultValue={editingKpi?.status ?? "Draft"}>
            {kpiStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>Current score<input name="currentScore" type="number" min="0" max="100" defaultValue={editingKpi?.currentScore} placeholder="0-100" /></label>
      </div>
      <button type="submit">{editingKpi ? "Save KPI Changes" : "Add KPI Node"}</button>
    </form>
  );
}

function KpiReviewForm({
  data,
  onAddReview
}: {
  data: AcademyData;
  onAddReview: (review: KpiReview) => void;
}) {
  const [whatScore, setWhatScore] = useState(80);
  const [howScore, setHowScore] = useState(80);
  const [skillScore, setSkillScore] = useState(80);
  const [teamScore, setTeamScore] = useState(80);
  const [improvementScore, setImprovementScore] = useState(70);
  const finalScore = calculateKpiReviewScore({
    whatScore,
    howScore,
    skillScore,
    teamScore,
    improvementScore
  });

  return (
    <form
      className="panel form-panel kpi-review-form"
      onSubmit={(event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        onAddReview({
          id: createId("review"),
          kpiId: String(form.get("kpiId")),
          period: String(form.get("period")),
          reviewer: String(form.get("reviewer")).trim(),
          whatScore,
          howScore,
          skillScore,
          teamScore,
          improvementScore,
          finalScore,
          gateStatus: String(form.get("gateStatus")) as KpiGateStatus,
          actionPlan: String(form.get("actionPlan")).trim(),
          status: String(form.get("status")) as KpiReviewStatus,
          createdAt: todayIso()
        });
        event.currentTarget.reset();
        setWhatScore(80);
        setHowScore(80);
        setSkillScore(80);
        setTeamScore(80);
        setImprovementScore(70);
      }}
    >
      <div className="panel-heading">
        <span className="eyebrow">Monthly KPI Review</span>
        <h2>Score WHAT + HOW + SKILL + TEAM + IMPROVEMENT.</h2>
      </div>
      <div className="kpi-weight-strip">
        {kpiReviewWeights.map(([code, label, weight]) => (
          <span key={code}>{code} {weight}%</span>
        ))}
      </div>
      <div className="builder-grid">
        <label className="wide-field">
          KPI
          <select name="kpiId" required defaultValue={data.kpis[0]?.id}>
            {data.kpis.map((kpi) => (
              <option key={kpi.id} value={kpi.id}>{kpi.level} | {kpi.title}</option>
            ))}
          </select>
        </label>
        <label>Period<input name="period" type="month" required defaultValue={currentMonthIso()} /></label>
        <label>Reviewer<input name="reviewer" required defaultValue="CEO / CTO" /></label>
        <ScoreInput label="WHAT score" value={whatScore} onChange={setWhatScore} />
        <ScoreInput label="HOW score" value={howScore} onChange={setHowScore} />
        <ScoreInput label="Skill score" value={skillScore} onChange={setSkillScore} />
        <ScoreInput label="Team score" value={teamScore} onChange={setTeamScore} />
        <ScoreInput label="Improvement score" value={improvementScore} onChange={setImprovementScore} />
        <label>
          Gate status
          <select name="gateStatus" required defaultValue="Clear">
            {kpiGateStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label>
          Review status
          <select name="status" required defaultValue="Open">
            {kpiReviewStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="wide-field">Action plan<textarea name="actionPlan" placeholder="Retraining, coaching, practical re-assessment, CAPA, or recognition action." /></label>
      </div>
      <div className="score-preview">
        <span>Weighted score</span>
        <strong>{finalScore}%</strong>
        <em>{deriveKpiStatus(finalScore, "Clear")}</em>
      </div>
      <button type="submit">Save Monthly Review</button>
    </form>
  );
}

function ScoreInput({
  label,
  value,
  onChange
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      {label}
      <input
        type="number"
        min="0"
        max="100"
        required
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}

function KpiTree({
  kpis,
  data,
  onEdit,
  onDelete
}: {
  kpis: KPI[];
  data: AcademyData;
  onEdit: (kpi: KPI) => void;
  onDelete: (kpiId: string) => void;
}) {
  const kpiIds = new Set(kpis.map((kpi) => kpi.id));
  const childrenByParent = new Map<string, KPI[]>();
  kpis.forEach((kpi) => {
    const parentKey = kpi.parentId && kpiIds.has(kpi.parentId) ? kpi.parentId : "root";
    childrenByParent.set(parentKey, [...(childrenByParent.get(parentKey) ?? []), kpi]);
  });

  const roots = childrenByParent.get("root") ?? [];

  return (
    <div className="kpi-tree">
      {roots.map((kpi) => (
        <KpiTreeNode
          key={kpi.id}
          kpi={kpi}
          data={data}
          childrenByParent={childrenByParent}
          depth={0}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}

function KpiTreeNode({
  kpi,
  data,
  childrenByParent,
  depth,
  onEdit,
  onDelete
}: {
  kpi: KPI;
  data: AcademyData;
  childrenByParent: Map<string, KPI[]>;
  depth: number;
  onEdit: (kpi: KPI) => void;
  onDelete: (kpiId: string) => void;
}) {
  const children = childrenByParent.get(kpi.id) ?? [];
  const employee = kpi.employeeId ? findEmployee(data, kpi.employeeId) : undefined;
  const training = kpi.linkedTrainingId ? findModule(data, kpi.linkedTrainingId) : undefined;

  return (
    <article className="kpi-node" style={{ "--depth": depth } as CSSProperties}>
      <div className="kpi-node-card">
        <div className="kpi-node-header">
          <span>{kpi.level}</span>
          <em className={`kpi-status ${kpiStatusClass(kpi.status)}`}>{kpi.status}</em>
        </div>
        <h3>{kpi.title}</h3>
        <p>{kpi.target}</p>
        <div className="kpi-node-meta">
          <span>Owner: {kpi.owner}</span>
          <span>Approver: {kpi.approver}</span>
          <span>Weight: {kpi.weight}</span>
          <span>Score: {typeof kpi.currentScore === "number" ? `${kpi.currentScore}%` : "Not scored"}</span>
        </div>
        {(employee || training || kpi.linkedSkill || kpi.linkedBehaviour) && (
          <div className="kpi-control-links">
            {employee && <span>{employee.name}</span>}
            {training && <span>{training.title}</span>}
            {kpi.linkedSkill && <span>{kpi.linkedSkill}</span>}
            {kpi.linkedBehaviour && <span>{kpi.linkedBehaviour}</span>}
          </div>
        )}
        <div className="kpi-actions">
          <button type="button" className="secondary-action" onClick={() => onEdit(kpi)}>
            Edit
          </button>
          <button type="button" className="danger-action" onClick={() => onDelete(kpi.id)}>
            Delete
          </button>
        </div>
      </div>
      {children.length > 0 && (
        <div className="kpi-children">
          {children.map((child) => (
            <KpiTreeNode
              key={child.id}
              kpi={child}
              data={data}
              childrenByParent={childrenByParent}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </article>
  );
}

function SlideMediaPreview({ slide }: { slide: TrainingSlide }) {
  if (!slide.mediaDataUrl) {
    if (!slide.mediaName || slide.mediaType === "none") {
      return null;
    }

    return (
      <div className="slide-media empty-media">
        <strong>{slide.mediaName}</strong>
        <span>Media reference saved. Upload data is not available in this browser session.</span>
      </div>
    );
  }

  if (slide.mediaType === "image") {
    return (
      <figure className="slide-media">
        <img src={slide.mediaDataUrl} alt={slide.mediaName ?? slide.title} />
        {slide.mediaName && <figcaption>{slide.mediaName}</figcaption>}
      </figure>
    );
  }

  if (slide.mediaType === "pdf") {
    return (
      <figure className="slide-media pdf-media">
        <iframe src={slide.mediaDataUrl} title={slide.mediaName ?? slide.title} />
        {slide.mediaName && <figcaption>{slide.mediaName}</figcaption>}
      </figure>
    );
  }

  return null;
}

function TrainingPlayer({
  assignment,
  module,
  employee,
  onUpdate,
  expanded = false
}: {
  assignment?: Assignment;
  module?: TrainingModule;
  employee: Employee;
  onUpdate: (assignment: Assignment, certificate?: Certificate) => void;
  expanded?: boolean;
}) {
  const [remaining, setRemaining] = useState(0);
  const [audioComplete, setAudioComplete] = useState(true);
  const [trainingLanguage, setTrainingLanguage] = useState<TrainingLanguage>(
    assignment?.selectedLanguage ?? moduleDefaultLanguage(module)
  );

  useEffect(() => {
    if (!assignment || !module || assignment.status !== "In Progress") {
      setRemaining(0);
      return;
    }
    const slide = module.slides[assignment.currentSlide];
    setRemaining(slide.duration);
    const localizedSlide = slideForLanguage(slide, assignment.selectedLanguage ?? moduleDefaultLanguage(module));
    setAudioComplete(!localizedSlide.audioRef || !isPlayableAudioRef(localizedSlide.audioRef));
    const timer = window.setInterval(() => {
      setRemaining((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [assignment?.id, assignment?.currentSlide, assignment?.status, module]);

  useEffect(() => {
    if (!module) {
      return;
    }
    const languages = moduleLanguages(module);
    const nextLanguage = assignment?.selectedLanguage ?? moduleDefaultLanguage(module);
    setTrainingLanguage(languages.includes(nextLanguage) ? nextLanguage : languages[0]);
  }, [assignment?.id, assignment?.selectedLanguage, module]);

  if (!assignment || !module) {
    return (
      <section className={expanded ? "panel training-player expanded" : "panel training-player"}>
        <div className="panel-heading">
          <span className="eyebrow">Training Player</span>
          <h2>No active training assigned.</h2>
        </div>
        <p className="muted-copy">Ask Admin to create an assignment for this employee.</p>
      </section>
    );
  }

  const assignmentRecord: Assignment = assignment;
  const trainingModule: TrainingModule = module;
  const availableLanguages = moduleLanguages(trainingModule);
  const selectedLanguage = availableLanguages.includes(trainingLanguage)
    ? trainingLanguage
    : moduleDefaultLanguage(trainingModule);
  const slide = slideForLanguage(trainingModule.slides[assignmentRecord.currentSlide], selectedLanguage);
  const isLastSlide = assignmentRecord.currentSlide >= trainingModule.slides.length - 1;
  const needsAudioCompletion = Boolean(slide.audioRef && isPlayableAudioRef(slide.audioRef));
  const canProceed = remaining === 0 && (!needsAudioCompletion || audioComplete);

  function startTraining() {
    onUpdate({ ...assignmentRecord, status: "In Progress", selectedLanguage });
  }

  function completeSlide() {
    const nextLogs = [
      ...assignmentRecord.slideLogs,
      `${selectedLanguage} slide ${assignmentRecord.currentSlide + 1} completed with ${needsAudioCompletion ? "audio-ended" : "timer"} evidence at ${new Date().toLocaleString()}`
    ];
    onUpdate({
      ...assignmentRecord,
      selectedLanguage,
      currentSlide: isLastSlide ? assignmentRecord.currentSlide : assignmentRecord.currentSlide + 1,
      slideLogs: nextLogs,
      status: isLastSlide ? "Quiz Ready" : "In Progress"
    });
  }

  function handleQuizAttempt(score: number, passed: boolean, answers: Record<number, number>) {
    const attempt: QuizAttempt = {
      id: createId("qat"),
      attemptedAt: new Date().toISOString(),
      language: selectedLanguage,
      score,
      passed,
      answers
    };
    const quizAttempts = [...(assignmentRecord.quizAttempts ?? []), attempt];

    if (!passed) {
      onUpdate({
        ...assignmentRecord,
        selectedLanguage,
        quizAttempts
      });
      return;
    }

    const certId = createId("cert");
    const issuedAt = todayIso();
    const validTill = addMonths(issuedAt, trainingModule.validityMonths);
    const certificate: Certificate = {
      id: certId,
      employeeId: employee.id,
      moduleId: trainingModule.id,
      assignmentId: assignmentRecord.id,
      issuedAt,
      validTill,
      score,
      language: selectedLanguage
    };
    onUpdate(
      {
        ...assignmentRecord,
        status: "Completed",
        quizScore: score,
        certificateId: certId,
        selectedLanguage,
        quizAttempts
      },
      certificate
    );
  }

  return (
    <section className={expanded ? "panel training-player expanded" : "panel training-player"}>
      <div className="panel-heading">
        <span className="eyebrow">Locked Slide + Audio</span>
        <h2>{trainingModule.title}</h2>
      </div>

      {assignmentRecord.status === "Pending" && (
        <div className="slide-stage">
          <span>Assigned Training</span>
          <h3>{trainingModule.title}</h3>
          <p>Due on {formatDate(assignmentRecord.dueDate)}. Start when you are ready to complete the controlled training sequence.</p>
          {availableLanguages.length > 1 && (
            <div className="training-language-picker">
              <span>Training language</span>
              <div className="language-tabs compact">
                {availableLanguages.map((language) => (
                  <button
                    key={language}
                    type="button"
                    className={selectedLanguage === language ? "language-tab active" : "language-tab"}
                    onClick={() => setTrainingLanguage(language)}
                  >
                    {language}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button type="button" onClick={startTraining}>Start Training</button>
        </div>
      )}

      {assignmentRecord.status === "In Progress" && (
        <>
          <div className={`${slide.mediaDataUrl ? "slide-stage has-media" : "slide-stage"} ${languageClass(selectedLanguage)}`}>
            <span>{selectedLanguage} | Slide {assignmentRecord.currentSlide + 1} / {trainingModule.slides.length}</span>
            <h3>{slide.title}</h3>
            <SlideMediaPreview slide={slide} />
            {slide.body && <p>{slide.body}</p>}
            {slide.audioRef && (
              <>
                <em>Audio reference: {slide.audioRef}</em>
                {isPlayableAudioRef(slide.audioRef) && (
                  <audio
                    className="training-audio"
                    controls
                    controlsList="nodownload noplaybackrate"
                    src={slide.audioRef}
                    onEnded={() => setAudioComplete(true)}
                  >
                    Audio playback is not supported in this browser.
                  </audio>
                )}
              </>
            )}
          </div>
          <div className="audio-lock">
            <div>
              <span>Audio required</span>
              <strong>
                {remaining > 0
                  ? `00:0${remaining} remaining`
                  : needsAudioCompletion && !audioComplete
                    ? "Finish audio"
                    : "Audio complete"}
              </strong>
            </div>
            <div className="audio-bars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </div>
          <button
            className={canProceed ? "unlock" : "locked"}
            type="button"
            disabled={!canProceed}
            onClick={completeSlide}
          >
            {canProceed ? (isLastSlide ? "Unlock Quiz" : "Next Slide") : "Next Locked"}
          </button>
        </>
      )}

      {assignmentRecord.status === "Quiz Ready" && (
        <QuizPanel
          module={trainingModule}
          language={selectedLanguage}
          attemptCount={quizAttemptCount(assignmentRecord)}
          onAttempt={handleQuizAttempt}
        />
      )}

      {assignmentRecord.status === "Completed" && (
        <div className="slide-stage">
          <span>Completed</span>
          <h3>Training complete. Certificate issued.</h3>
          <p>
            Language: {assignmentRecord.selectedLanguage ?? selectedLanguage} | Score: {assignmentRecord.quizScore}% | Attempts: {quizAttemptCount(assignmentRecord)} | Certificate: {assignmentRecord.certificateId}
          </p>
        </div>
      )}
    </section>
  );
}

function QuizPanel({
  module,
  language,
  attemptCount,
  onAttempt
}: {
  module: TrainingModule;
  language: TrainingLanguage;
  attemptCount: number;
  onAttempt: (score: number, passed: boolean, answers: Record<number, number>) => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [message, setMessage] = useState("");

  function submitQuiz() {
    const correct = module.quiz.filter((question, index) => answers[index] === question.answer).length;
    const score = Math.round((correct / module.quiz.length) * 100);
    const passed = score >= 70;
    onAttempt(score, passed, answers);
    if (passed) {
      setMessage(`Score ${score}%. Passed. Certificate is being issued.`);
      return;
    } else {
      setMessage(`Score ${score}%. Minimum passing score is 70%. Review and try again.`);
    }
  }

  return (
    <div className={`quiz-panel ${languageClass(language)}`}>
      <div>
        <span className="eyebrow">Assessment Unlocked</span>
        <h3>Complete {language} quiz to issue certificate</h3>
        <p className="attempt-note">Previous attempts recorded: {attemptCount}</p>
      </div>
      {module.quiz.map((question, index) => {
        const localizedQuestion = getQuizContent(question, language);
        return (
          <fieldset key={`${language}-${localizedQuestion.question}-${index}`} className="quiz-question">
            <legend>{index + 1}. {localizedQuestion.question}</legend>
            {localizedQuestion.options.map((option, optionIndex) => (
              <label className="option" key={`${option}-${optionIndex}`}>
                <input
                  type="radio"
                  name={`question-${index}`}
                  onChange={() => setAnswers((current) => ({ ...current, [index]: optionIndex }))}
                />
                {option}
              </label>
            ))}
          </fieldset>
        );
      })}
      {message && <p className="form-message">{message}</p>}
      <button type="button" onClick={submitQuiz}>Submit Quiz</button>
    </div>
  );
}

function CertificateView({
  data,
  certificate,
  emptyMessage
}: {
  data: AcademyData;
  certificate?: Certificate;
  emptyMessage: string;
}) {
  if (!certificate) {
    return (
      <section className="certificate-stage">
        <div className="panel empty-state">
          <span className="eyebrow">Certificates</span>
          <h2>{emptyMessage}</h2>
        </div>
      </section>
    );
  }

  const employee = findEmployee(data, certificate.employeeId);
  const module = findModule(data, certificate.moduleId);
  const language = certificateLanguage(data, certificate);

  return (
    <section className="certificate-stage">
      <div className="certificate-actions">
        <button type="button" onClick={() => downloadCertificatePdf(data, certificate)}>
          Download Certificate PDF
        </button>
        <button type="button" onClick={() => downloadAuditEvidencePdf(data, certificate.employeeId)}>
          Download Employee Evidence
        </button>
      </div>
      <div className={`certificate ${languageClass(language)}`}>
        <span>Voltron Coating Solutions</span>
        <h2>Certificate of Training Completion</h2>
        <p>
          This certifies that {employee?.name} has completed {module?.title} through
          VOS Academy in {language} with controlled slide completion and assessment evidence.
        </p>
        <div>
          <strong>{employee?.name}</strong>
          <em>Language {language} | Score {certificate.score}% | Valid till {formatDate(certificate.validTill)}</em>
          <em>Certificate ID: {certificate.id}</em>
        </div>
      </div>
    </section>
  );
}

async function downloadCertificatePdf(data: AcademyData, certificate: Certificate) {
  const { jsPDF } = await import("jspdf");
  const employee = findEmployee(data, certificate.employeeId);
  const module = findModule(data, certificate.moduleId);
  const language = certificateLanguage(data, certificate);
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  doc.setFillColor(6, 18, 37);
  doc.rect(0, 0, width, height, "F");
  doc.setFillColor(13, 29, 57);
  doc.roundedRect(42, 42, width - 84, height - 84, 14, 14, "F");
  doc.setDrawColor(55, 221, 189);
  doc.setLineWidth(1.4);
  doc.roundedRect(58, 58, width - 116, height - 116, 10, 10, "S");

  doc.setTextColor(55, 221, 189);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Voltron TM", 82, 96);
  doc.setTextColor(217, 244, 255);
  doc.setFontSize(10);
  doc.text("Coating Solutions | VOS Academy", 82, 116);

  doc.setTextColor(247, 250, 252);
  doc.setFontSize(32);
  doc.text("Certificate of Training Completion", 82, 180);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(13);
  const intro = `This certifies that ${employee?.name ?? "Employee"} has completed ${module?.title ?? "assigned training"} in ${language} through VOS Academy with controlled slide completion and assessment evidence.`;
  doc.text(doc.splitTextToSize(intro, width - 164), 82, 216);

  doc.setFillColor(18, 35, 63);
  doc.roundedRect(82, 276, width - 164, 138, 10, 10, "F");
  doc.setTextColor(55, 221, 189);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Employee", 108, 314);
  doc.text("Module", 108, 354);
  doc.text("Score", 108, 394);
  doc.text("Language", 300, 394);
  doc.text("Validity", 420, 394);

  doc.setTextColor(247, 250, 252);
  doc.setFontSize(17);
  doc.text(employee?.name ?? "-", 210, 314);
  doc.text(module?.title ?? "-", 210, 354);
  doc.text(`${certificate.score}%`, 210, 394);
  doc.text(language, 390, 394);
  doc.text(`${formatDate(certificate.issuedAt)} to ${formatDate(certificate.validTill)}`, 500, 394);

  doc.setTextColor(217, 244, 255);
  doc.setFontSize(10);
  doc.text(`Certificate ID: ${certificate.id}`, 82, height - 82);
  doc.text("Generated locally from VOS Academy training records.", width - 314, height - 82);
  doc.save(`${safePdfName(employee?.name ?? "employee")}-${safePdfName(module?.title ?? "training")}-certificate.pdf`);
}

async function downloadAuditEvidencePdf(data: AcademyData, employeeId?: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  const reportAssignments = employeeId
    ? data.assignments.filter((assignment) => assignment.employeeId === employeeId)
    : data.assignments;
  const employee = employeeId ? findEmployee(data, employeeId) : undefined;

  let y = addEvidenceHeader(doc, width, employee?.name);
  const completed = reportAssignments.filter((assignment) => assignment.status === "Completed").length;

  doc.setFillColor(217, 244, 255);
  doc.roundedRect(40, y, width - 80, 78, 8, 8, "F");
  doc.setTextColor(13, 29, 57);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary", 58, y + 24);
  doc.setFontSize(10);
  doc.text(`Assignments: ${reportAssignments.length}`, 58, y + 50);
  doc.text(`Completed: ${completed}`, 190, y + 50);
  doc.text(`Certificates: ${data.certificates.filter((certificate) => !employeeId || certificate.employeeId === employeeId).length}`, 320, y + 50);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 430, y + 50);
  y += 106;

  reportAssignments.forEach((assignment, index) => {
    const module = findModule(data, assignment.moduleId);
    const assignmentEmployee = findEmployee(data, assignment.employeeId);
    const certificate = assignment.certificateId
      ? data.certificates.find((record) => record.id === assignment.certificateId)
      : undefined;
    const language = assignment.selectedLanguage ?? certificate?.language ?? moduleDefaultLanguage(module);
    const slideCount = module?.slides.length ?? 0;
    const latestAttempt = latestQuizAttempt(assignment);
    const logs = assignment.slideLogs.slice(0, 4);
    const blockHeight = 128 + logs.length * 14;

    if (y + blockHeight > height - 64) {
      doc.addPage();
      y = addEvidenceHeader(doc, width, employee?.name);
    }

    doc.setDrawColor(217, 244, 255);
    doc.setFillColor(247, 250, 252);
    doc.roundedRect(40, y, width - 80, blockHeight, 8, 8, "FD");

    doc.setTextColor(13, 29, 57);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${index + 1}. ${module?.title ?? "Training Module"}`, 58, y + 24);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Employee: ${assignmentEmployee?.name ?? "-"} | Department: ${assignmentEmployee?.department ?? "-"}`, 58, y + 46);
    doc.text(`Status: ${assignment.status} | Language: ${language} | Revision: ${module?.revision ?? "Rev 00"} | Due: ${formatDate(assignment.dueDate)}`, 58, y + 64);
    doc.text(`Slides completed: ${assignment.slideLogs.length}/${slideCount} | Attempts: ${quizAttemptCount(assignment)} | Latest quiz: ${latestAttempt ? `${latestAttempt.score}% ${latestAttempt.passed ? "Pass" : "Fail"}` : "-"}`, 58, y + 82);
    doc.text(`Assigned: ${formatDate(assignment.assignedAt)} | Effective: ${module?.effectiveDate ? formatDate(module.effectiveDate) : "-"} | Certificate ID: ${certificate?.id ?? "-"}`, 58, y + 100);

    if (logs.length) {
      doc.setFont("helvetica", "bold");
      doc.text("Slide completion log:", 58, y + 120);
      doc.setFont("helvetica", "normal");
      logs.forEach((log, logIndex) => {
        doc.text(`- ${log}`, 68, y + 138 + logIndex * 14);
      });
    }

    y += blockHeight + 14;
  });

  doc.save(`${safePdfName(employee?.name ?? "voltron")}-training-evidence.pdf`);
}

async function downloadKpiEvidencePdf(data: AcademyData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  let y = addKpiEvidenceHeader(doc, width);
  const scoredKpis = data.kpis.filter((kpi) => typeof kpi.currentScore === "number");
  const averageScore = scoredKpis.length
    ? Math.round(scoredKpis.reduce((total, kpi) => total + (kpi.currentScore ?? 0), 0) / scoredKpis.length)
    : 0;
  const needsAction = data.kpis.filter((kpi) => kpi.status === "Needs Action").length;
  const openReviews = data.kpiReviews.filter((review) => review.status === "Open").length;

  doc.setFillColor(217, 244, 255);
  doc.roundedRect(40, y, width - 80, 88, 8, 8, "F");
  doc.setTextColor(13, 29, 57);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("KPI Summary", 58, y + 24);
  doc.setFontSize(10);
  doc.text(`KPIs: ${data.kpis.length}`, 58, y + 52);
  doc.text(`Average score: ${averageScore}%`, 150, y + 52);
  doc.text(`Needs action: ${needsAction}`, 288, y + 52);
  doc.text(`Open review actions: ${openReviews}`, 412, y + 52);
  doc.text("Formula: WHAT 45% + HOW 25% + SKILL 15% + TEAM 10% + IMPROVEMENT 5%", 58, y + 72);
  y += 116;

  data.kpis.forEach((kpi, index) => {
    const parent = kpi.parentId ? findKpi(data, kpi.parentId) : undefined;
    const employee = kpi.employeeId ? findEmployee(data, kpi.employeeId) : undefined;
    const blockHeight = 124;

    if (y + blockHeight > height - 64) {
      doc.addPage();
      y = addKpiEvidenceHeader(doc, width);
    }

    doc.setDrawColor(217, 244, 255);
    doc.setFillColor(247, 250, 252);
    doc.roundedRect(40, y, width - 80, blockHeight, 8, 8, "FD");
    doc.setTextColor(13, 29, 57);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${kpi.title}`, 58, y + 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Level: ${kpi.level} | Pillar: ${kpi.pillar} | Status: ${kpi.status} | Score: ${typeof kpi.currentScore === "number" ? `${kpi.currentScore}%` : "-"}`, 58, y + 46);
    doc.text(`Owner: ${kpi.owner} | Approver: ${kpi.approver}`, 58, y + 64);
    doc.text(`Target: ${kpi.target}`, 58, y + 82);
    doc.text(`Parent: ${parent?.title ?? "Company root"} | Data: ${kpi.dataSource}`, 58, y + 100);
    doc.text(`Employee: ${employee?.name ?? "-"} | Skill: ${kpi.linkedSkill ?? "-"} | Behaviour: ${kpi.linkedBehaviour ?? "-"}`, 58, y + 116);
    y += blockHeight + 14;
  });

  if (data.kpiReviews.length) {
    if (y + 70 > height - 64) {
      doc.addPage();
      y = addKpiEvidenceHeader(doc, width);
    }

    doc.setTextColor(13, 29, 57);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Monthly Review Records", 40, y + 18);
    y += 42;

    data.kpiReviews.slice().reverse().forEach((review, index) => {
      const kpi = findKpi(data, review.kpiId);
      const actionLines = doc.splitTextToSize(review.actionPlan || "No action plan recorded.", width - 116);
      const blockHeight = 104 + Math.min(actionLines.length, 4) * 12;

      if (y + blockHeight > height - 64) {
        doc.addPage();
        y = addKpiEvidenceHeader(doc, width);
      }

      doc.setDrawColor(217, 244, 255);
      doc.setFillColor(247, 250, 252);
      doc.roundedRect(40, y, width - 80, blockHeight, 8, 8, "FD");
      doc.setTextColor(13, 29, 57);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${index + 1}. ${review.period} | ${kpi?.title ?? "Deleted KPI"}`, 58, y + 24);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Reviewer: ${review.reviewer} | Final: ${review.finalScore}% | Gate: ${review.gateStatus} | Status: ${review.status}`, 58, y + 44);
      doc.text(`WHAT ${review.whatScore} | HOW ${review.howScore} | SKILL ${review.skillScore} | TEAM ${review.teamScore} | IMPROVEMENT ${review.improvementScore}`, 58, y + 62);
      doc.setFont("helvetica", "bold");
      doc.text("Action plan:", 58, y + 82);
      doc.setFont("helvetica", "normal");
      doc.text(actionLines.slice(0, 4), 58, y + 98);
      y += blockHeight + 14;
    });
  }

  doc.save("voltron-kpi-cascade-evidence.pdf");
}

async function downloadSkillMatrixPdf(data: AcademyData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();
  let y = addSkillEvidenceHeader(doc, width);
  const certified = data.skills.filter((skill) => skill.status === "Certified").length;
  const independent = data.skills.filter((skill) => skill.level === "L4" || skill.level === "L5").length;
  const pending = data.skills.filter((skill) => skill.status === "Training Pending" || skill.status === "Practical Pending").length;

  doc.setFillColor(217, 244, 255);
  doc.roundedRect(40, y, width - 80, 78, 8, 8, "F");
  doc.setTextColor(13, 29, 57);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Skill Matrix Summary", 58, y + 24);
  doc.setFontSize(10);
  doc.text(`Skill records: ${data.skills.length}`, 58, y + 50);
  doc.text(`Certified: ${certified}`, 190, y + 50);
  doc.text(`Independent L4/L5: ${independent}`, 306, y + 50);
  doc.text(`Pending: ${pending}`, 456, y + 50);
  y += 106;

  data.skills.forEach((skill, index) => {
    const employee = findEmployee(data, skill.employeeId);
    const module = skill.linkedTrainingId ? findModule(data, skill.linkedTrainingId) : undefined;
    const kpi = skill.linkedKpiId ? findKpi(data, skill.linkedKpiId) : undefined;
    const notes = doc.splitTextToSize(skill.notes || "-", width - 116);
    const blockHeight = 126 + Math.min(notes.length, 3) * 12;

    if (y + blockHeight > height - 64) {
      doc.addPage();
      y = addSkillEvidenceHeader(doc, width);
    }

    doc.setDrawColor(217, 244, 255);
    doc.setFillColor(247, 250, 252);
    doc.roundedRect(40, y, width - 80, blockHeight, 8, 8, "FD");
    doc.setTextColor(13, 29, 57);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(`${index + 1}. ${employee?.name ?? "Employee"} | ${skill.skillName}`, 58, y + 24);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Level: ${skill.level} | ${skillLevelMeaning(skill.level)} | Status: ${skill.status}`, 58, y + 44);
    doc.text(`Permission: ${skillWorkPermission(skill.level)}`, 58, y + 62);
    doc.text(`Department: ${skill.department} | Role: ${skill.role} | Supervisor: ${skill.supervisor}`, 58, y + 80);
    doc.text(`Training: ${module?.title ?? "-"} | KPI: ${kpi?.title ?? "-"}`, 58, y + 98);
    doc.text(`Valid till: ${skill.validTill ? formatDate(skill.validTill) : "-"} | Updated: ${formatDate(skill.updatedAt)}`, 58, y + 116);
    doc.text(notes.slice(0, 3), 58, y + 136);
    y += blockHeight + 14;
  });

  if (data.signOffs.length) {
    if (y + 70 > height - 64) {
      doc.addPage();
      y = addSkillEvidenceHeader(doc, width);
    }

    doc.setTextColor(13, 29, 57);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Practical Sign-Off Records", 40, y + 18);
    y += 42;

    data.signOffs.slice().reverse().forEach((signOff, index) => {
      const skill = findSkill(data, signOff.skillRecordId);
      const employee = findEmployee(data, signOff.employeeId);
      const blockHeight = 116;

      if (y + blockHeight > height - 64) {
        doc.addPage();
        y = addSkillEvidenceHeader(doc, width);
      }

      doc.setDrawColor(217, 244, 255);
      doc.setFillColor(247, 250, 252);
      doc.roundedRect(40, y, width - 80, blockHeight, 8, 8, "FD");
      doc.setTextColor(13, 29, 57);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${index + 1}. ${signOff.result} | ${employee?.name ?? "Employee"} | ${skill?.skillName ?? "Deleted skill"}`, 58, y + 24);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Supervisor: ${signOff.supervisor} | Observed: ${formatDate(signOff.observedAt)}`, 58, y + 44);
      doc.text(`Checklist completed: ${signOff.checklist.length}/${practicalChecklist.length}`, 58, y + 62);
      doc.text(`Notes: ${signOff.notes || "-"}`, 58, y + 80);
      doc.text(`Next action: ${signOff.nextAction || "-"}`, 58, y + 98);
      y += blockHeight + 14;
    });
  }

  doc.save("voltron-skill-matrix-evidence.pdf");
}

function addEvidenceHeader(doc: any, width: number, employeeName?: string) {
  doc.setFillColor(6, 18, 37);
  doc.rect(0, 0, width, 104, "F");
  doc.setTextColor(55, 221, 189);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Voltron TM | VOS Academy", 40, 40);
  doc.setTextColor(247, 250, 252);
  doc.setFontSize(22);
  doc.text(employeeName ? `${employeeName} Training Evidence` : "Training Audit Evidence Pack", 40, 72);
  doc.setTextColor(217, 244, 255);
  doc.setFontSize(9);
  doc.text("Local v1 evidence generated from browser training records.", 40, 92);
  return 132;
}

function addSkillEvidenceHeader(doc: any, width: number) {
  doc.setFillColor(6, 18, 37);
  doc.rect(0, 0, width, 104, "F");
  doc.setTextColor(55, 221, 189);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Voltron TM | VOS Academy", 40, 40);
  doc.setTextColor(247, 250, 252);
  doc.setFontSize(22);
  doc.text("Skill Matrix Evidence Pack", 40, 72);
  doc.setTextColor(217, 244, 255);
  doc.setFontSize(9);
  doc.text("VOS skill, practical sign-off and work permission evidence.", 40, 92);
  return 132;
}

function addKpiEvidenceHeader(doc: any, width: number) {
  doc.setFillColor(6, 18, 37);
  doc.rect(0, 0, width, 104, "F");
  doc.setTextColor(55, 221, 189);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Voltron TM | VOS Academy", 40, 40);
  doc.setTextColor(247, 250, 252);
  doc.setFontSize(22);
  doc.text("KPI Cascade Evidence Pack", 40, 72);
  doc.setTextColor(217, 244, 255);
  doc.setFontSize(9);
  doc.text("VOS-KPI-01 review evidence generated from KPI cascade records.", 40, 92);
  return 132;
}

function Metric({ label, value, tone }: { label: string; value: string; tone: "teal" | "blue" | "green" }) {
  return (
    <article className={`metric ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="data-table">
      <div className="table-row table-head" style={{ "--cols": headers.length } as CSSProperties}>
        {headers.map((header) => (
          <span key={header}>{header}</span>
        ))}
      </div>
      {rows.map((row) => (
        <div className="table-row" style={{ "--cols": headers.length } as CSSProperties} key={row.join("-")}>
          {row.map((cell, index) => (
            <span data-label={headers[index]} key={`${cell}-${index}`}>{cell}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

function navLabel(section: Section, role: Role) {
  if (role === "employee" && section === "modules") {
    return "My Training";
  }
  return {
    dashboard: "Dashboard",
    employees: "Employees",
    modules: "Modules",
    assignments: "Assignments",
    rules: "Rules",
    skills: "Skill Matrix",
    attendance: "Attendance",
    kpis: "KPI Cascade",
    reports: "Reports",
    certificates: "Certificates"
  }[section];
}

function navIcon(section: Section) {
  return {
    dashboard: "D",
    employees: "E",
    modules: "M",
    assignments: "A",
    rules: "R",
    skills: "S",
    attendance: "T",
    kpis: "K",
    reports: "P",
    certificates: "C"
  }[section];
}

function createId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addMonths(dateIso: string, months: number) {
  const date = new Date(`${dateIso}T00:00:00`);
  date.setMonth(date.getMonth() + months);
  return date.toISOString().slice(0, 10);
}

function addDays(dateIso: string, days: number) {
  const date = new Date(`${dateIso}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function currentMonthIso() {
  return new Date().toISOString().slice(0, 7);
}

function calculateKpiReviewScore({
  whatScore,
  howScore,
  skillScore,
  teamScore,
  improvementScore
}: {
  whatScore: number;
  howScore: number;
  skillScore: number;
  teamScore: number;
  improvementScore: number;
}) {
  return Math.round(
    whatScore * 0.45 +
    howScore * 0.25 +
    skillScore * 0.15 +
    teamScore * 0.1 +
    improvementScore * 0.05
  );
}

function deriveKpiStatus(score: number, gateStatus: KpiGateStatus): KpiStatus {
  if (gateStatus === "Blocked" || score < 70) {
    return "Needs Action";
  }

  if (score < 80) {
    return "Watch";
  }

  return "On Track";
}

function formatDate(dateIso: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${dateIso}T00:00:00`));
}

function formatDateTime(dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function findEmployee(data: AcademyData, employeeId: string) {
  return data.employees.find((employee) => employee.id === employeeId);
}

function findModule(data: AcademyData, moduleId: string) {
  return data.modules.find((module) => module.id === moduleId);
}

function isTrainingLanguage(value: string): value is TrainingLanguage {
  return trainingLanguages.includes(value as TrainingLanguage);
}

function moduleLanguages(module?: Pick<TrainingModule, "language" | "languages">): TrainingLanguage[] {
  if (!module) {
    return [defaultTrainingLanguage];
  }

  const savedLanguages = (module.languages ?? []).filter(isTrainingLanguage);
  if (savedLanguages.length) {
    return savedLanguages;
  }

  const legacyValue = module.language.toLowerCase();
  const inferred = trainingLanguages.filter((language) => legacyValue.includes(language.toLowerCase()));
  return inferred.length ? inferred : [defaultTrainingLanguage];
}

function moduleDefaultLanguage(module?: Pick<TrainingModule, "language" | "languages" | "defaultLanguage">): TrainingLanguage {
  const languages = moduleLanguages(module);
  if (module?.defaultLanguage && languages.includes(module.defaultLanguage)) {
    return module.defaultLanguage;
  }
  return languages[0] ?? defaultTrainingLanguage;
}

function languageSummary(module?: Pick<TrainingModule, "language" | "languages">) {
  return moduleLanguages(module).join(" / ");
}

function languageClass(language?: TrainingLanguage) {
  return language === "Hindi" || language === "Marathi" ? "lang-devanagari" : "";
}

function isPlayableAudioRef(audioRef: string) {
  return audioRef.startsWith("/") || audioRef.startsWith("http://") || audioRef.startsWith("https://");
}

function fallbackSlideContent(slide: TrainingSlide): LocalizedTrainingSlide {
  return {
    title: slide.title,
    body: slide.body,
    audioRef: slide.audioRef,
    mediaType: slide.mediaType ?? "none",
    mediaName: slide.mediaName,
    mediaDataUrl: slide.mediaDataUrl
  };
}

function getSlideContent(slide: TrainingSlide, language: TrainingLanguage): LocalizedTrainingSlide {
  return {
    ...fallbackSlideContent(slide),
    ...(slide.translations?.[language] ?? {})
  };
}

function slideForLanguage(slide: TrainingSlide, language: TrainingLanguage): TrainingSlide {
  const content = getSlideContent(slide, language);
  return {
    ...slide,
    title: content.title,
    body: content.body,
    audioRef: content.audioRef,
    mediaType: content.mediaType,
    mediaName: content.mediaName,
    mediaDataUrl: content.mediaDataUrl
  };
}

function fallbackQuizContent(question: QuizQuestion): LocalizedQuizQuestion {
  return {
    question: question.question,
    options: question.options
  };
}

function getQuizContent(question: QuizQuestion, language: TrainingLanguage): LocalizedQuizQuestion {
  return {
    ...fallbackQuizContent(question),
    ...(question.translations?.[language] ?? {})
  };
}

function certificateLanguage(data: AcademyData, certificate: Certificate) {
  const assignment = data.assignments.find((record) => record.id === certificate.assignmentId);
  const module = findModule(data, certificate.moduleId);
  return certificate.language ?? assignment?.selectedLanguage ?? moduleDefaultLanguage(module);
}

function quizAttemptCount(assignment: Assignment) {
  return assignment.quizAttempts?.length ?? (assignment.quizScore ? 1 : 0);
}

function latestQuizAttempt(assignment: Assignment) {
  const attempts = assignment.quizAttempts ?? [];
  return attempts[attempts.length - 1];
}

function quizAttemptRows(data: AcademyData, employeeId?: string) {
  const rows = data.assignments
    .filter((assignment) => !employeeId || assignment.employeeId === employeeId)
    .flatMap((assignment) => {
      const employee = findEmployee(data, assignment.employeeId);
      const module = findModule(data, assignment.moduleId);
      return (assignment.quizAttempts ?? []).map((attempt) => [
        employee?.name ?? "-",
        module?.title ?? "-",
        attempt.language,
        formatDateTime(attempt.attemptedAt),
        `${attempt.score}%`,
        attempt.passed ? "Pass" : "Fail"
      ]);
    });
  return rows.length ? rows : [["-", "-", "-", "-", "-", "No attempts"]];
}

function uniqueValues(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function employeeMatchesRule(employee: Employee, rule: AssignmentRule) {
  if (rule.status !== "Active") {
    return false;
  }

  if ((rule.scope === "Department" || rule.scope === "Department + Role") && rule.department && employee.department !== rule.department) {
    return false;
  }

  if ((rule.scope === "Role" || rule.scope === "Department + Role") && rule.role && employee.roleTitle !== rule.role) {
    return false;
  }

  if (rule.scope === "Department" && !rule.department) {
    return false;
  }

  if (rule.scope === "Role" && !rule.role) {
    return false;
  }

  if (rule.scope === "Department + Role" && (!rule.department || !rule.role)) {
    return false;
  }

  return true;
}

function assignmentExists(data: AcademyData, employeeId: string, moduleId: string) {
  return data.assignments.some((assignment) =>
    assignment.employeeId === employeeId &&
    assignment.moduleId === moduleId
  );
}

function getRuleCoverage(data: AcademyData, rule: AssignmentRule) {
  const matchedEmployees = data.employees.filter((employee) => employeeMatchesRule(employee, rule));
  const required = matchedEmployees.length * rule.moduleIds.length;
  const existing = matchedEmployees.reduce(
    (total, employee) =>
      total + rule.moduleIds.filter((moduleId) => assignmentExists(data, employee.id, moduleId)).length,
    0
  );

  return {
    employees: matchedEmployees.length,
    required,
    existing,
    missing: Math.max(0, required - existing)
  };
}

function countMissingAssignments(data: AcademyData) {
  return data.assignmentRules.reduce((total, rule) => total + getRuleCoverage(data, rule).missing, 0);
}

function applyAssignmentRules(data: AcademyData): AcademyData {
  const today = todayIso();
  const generatedAssignments: Assignment[] = [];

  data.assignmentRules
    .filter((rule) => rule.status === "Active")
    .forEach((rule) => {
      const matchedEmployees = data.employees.filter((employee) => employeeMatchesRule(employee, rule));
      matchedEmployees.forEach((employee) => {
        rule.moduleIds.forEach((moduleId) => {
          const alreadyExists =
            assignmentExists(data, employee.id, moduleId) ||
            generatedAssignments.some((assignment) => assignment.employeeId === employee.id && assignment.moduleId === moduleId);

          if (!alreadyExists) {
            generatedAssignments.push({
              id: createId("asg"),
              employeeId: employee.id,
              moduleId,
              dueDate: addDays(today, rule.dueDays),
              frequency: rule.frequency,
              status: "Pending",
              assignedAt: today,
              currentSlide: 0,
              slideLogs: []
            });
          }
        });
      });
    });

  if (!generatedAssignments.length) {
    return data;
  }

  return {
    ...data,
    assignments: [...data.assignments, ...generatedAssignments]
  };
}

function buildAttendanceSummaries(data: AcademyData): AttendanceSummary[] {
  const grouped = new Map<string, AttendancePunch[]>();
  data.attendancePunches
    .filter((punch) => punch.authTokenStatus === "Valid")
    .forEach((punch) => {
      const date = getPunchDateKey(punch.logTime);
      const key = `${punch.employeeId ?? `cams-${punch.camsUserId}`}-${date}`;
      grouped.set(key, [...(grouped.get(key) ?? []), punch]);
    });

  return Array.from(grouped.entries())
    .map(([key, punches]) => {
      const sorted = punches.slice().sort((a, b) => getPunchTimeMinutes(a.logTime) - getPunchTimeMinutes(b.logTime));
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const employee = first.employeeId ? findEmployee(data, first.employeeId) : undefined;
      const shift = findShiftForEmployee(data, employee);
      const firstMinutes = getPunchTimeMinutes(first.logTime);
      const lastMinutes = getPunchTimeMinutes(last.logTime);
      const shiftStart = timeToMinutes(shift.startTime);
      const shiftEnd = timeToMinutes(shift.endTime);
      const lateBy = firstMinutes - shiftStart;
      const worked = sorted.length > 1 ? Math.max(0, lastMinutes - firstMinutes) : 0;
      let status: AttendanceDayStatus = "Present";

      if (!employee) {
        status = "Unmapped";
      } else if (lateBy > shift.absentAfterMinutes) {
        status = "Absent";
      } else if (lateBy > shift.halfDayAfterMinutes) {
        status = "Half Day";
      } else if (lateBy > shift.graceMinutes) {
        status = "Late";
      }

      if ((status === "Present" || status === "Late") && lastMinutes > shiftEnd + shift.overtimeAfterMinutes) {
        status = "Overtime";
      }

      return {
        key,
        date: getPunchDateKey(first.logTime),
        employeeId: employee?.id,
        employeeName: employee?.name ?? `Unmapped CAMS ${first.camsUserId}`,
        camsUserId: first.camsUserId,
        department: employee?.department ?? "-",
        shiftName: shift.name,
        firstPunch: getPunchTimeText(first.logTime),
        lastPunch: getPunchTimeText(last.logTime),
        punchCount: sorted.length,
        minutesWorked: worked,
        status,
        score: attendanceScore(status)
      };
    })
    .sort((a, b) => `${b.date}-${b.firstPunch}`.localeCompare(`${a.date}-${a.firstPunch}`));
}

function findShiftForEmployee(data: AcademyData, employee?: Employee) {
  const activeRules = data.shiftRules.filter((shift) => shift.status === "Active");
  const exact = activeRules.find((shift) =>
    employee &&
    shift.department === employee.department &&
    shift.role === employee.roleTitle
  );
  const department = activeRules.find((shift) =>
    employee &&
    shift.department === employee.department &&
    !shift.role
  );
  const general = activeRules.find((shift) => !shift.department && !shift.role);

  return exact ?? department ?? general ?? data.shiftRules[0] ?? {
    id: "fallback-shift",
    name: "Fallback Shift",
    startTime: "08:30",
    endTime: "17:30",
    graceMinutes: 10,
    halfDayAfterMinutes: 240,
    absentAfterMinutes: 300,
    overtimeAfterMinutes: 45,
    status: "Active" as ShiftRuleStatus
  };
}

function attendanceScore(status: AttendanceDayStatus) {
  return {
    Present: 100,
    Overtime: 100,
    Late: 80,
    "Half Day": 50,
    Absent: 0,
    Unmapped: 0
  }[status];
}

function getPunchDateKey(logTime: string) {
  const date = parseCamsLogTime(logTime);
  if (!date) {
    return logTime.slice(0, 10);
  }

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function getPunchTimeText(logTime: string) {
  const date = parseCamsLogTime(logTime);
  if (!date) {
    const match = logTime.match(/(\d{2}):(\d{2})/);
    return match ? `${match[1]}:${match[2]}` : "-";
  }

  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23"
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";
  return `${hour}:${minute}`;
}

function getPunchTimeMinutes(logTime: string) {
  const time = getPunchTimeText(logTime);
  return timeToMinutes(time);
}

function parseCamsLogTime(logTime: string) {
  const match = logTime.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2}) GMT ([+-])(\d{2})(\d{2})$/);
  if (!match) {
    const fallback = new Date(logTime);
    return Number.isNaN(fallback.getTime()) ? undefined : fallback;
  }

  const [, year, month, day, hour, minute, second, sign, offsetHour, offsetMinute] = match;
  const offsetMinutes = (Number(offsetHour) * 60 + Number(offsetMinute)) * (sign === "+" ? 1 : -1);
  const utcMs = Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second)
  ) - offsetMinutes * 60_000;
  return new Date(utcMs);
}

function timeToMinutes(time: string) {
  const [hour = "0", minute = "0"] = time.split(":");
  return Number(hour) * 60 + Number(minute);
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hours) {
    return `${mins} min`;
  }

  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

function getEmployeeActionItems(data: AcademyData, employee: Employee) {
  const items: string[] = [];
  const today = todayIso();
  const assignments = data.assignments.filter((assignment) => assignment.employeeId === employee.id);
  const skills = data.skills.filter((skill) => skill.employeeId === employee.id);
  const attendance = buildAttendanceSummaries(data).filter((summary) => summary.employeeId === employee.id);
  const todayAttendance = attendance.find((summary) => summary.date === today);
  const employeeKpis = data.kpis.filter((kpi) =>
    kpi.employeeId === employee.id ||
    (!!kpi.role && kpi.role === employee.roleTitle) ||
    (!!kpi.department && kpi.department === employee.department && kpi.level !== "L1 Company")
  );
  const employeeKpiIds = new Set(employeeKpis.map((kpi) => kpi.id));

  assignments
    .filter((assignment) => assignment.status !== "Completed")
    .forEach((assignment) => {
      const module = findModule(data, assignment.moduleId);
      if (assignment.dueDate < today) {
        items.push(`Overdue training: ${module?.title ?? "Training module"}`);
      } else {
        items.push(`Pending training: ${module?.title ?? "Training module"} by ${formatDate(assignment.dueDate)}`);
      }
    });

  skills.forEach((skill) => {
    if (skill.status === "Expired") {
      items.push(`Expired skill: ${skill.skillName}`);
      return;
    }

    if (skill.status === "Training Pending" || skill.status === "Practical Pending" || skill.status === "Renewal Due") {
      items.push(`${skill.status}: ${skill.skillName}`);
      return;
    }

    if (skill.validTill && daysUntil(skill.validTill) <= 30) {
      items.push(`Skill renewal due: ${skill.skillName} by ${formatDate(skill.validTill)}`);
    }
  });

  if (!todayAttendance) {
    items.push("No mapped attendance punch found for today.");
  } else if (todayAttendance.status === "Late" || todayAttendance.status === "Half Day" || todayAttendance.status === "Absent") {
    items.push(`Attendance attention: ${todayAttendance.status} today.`);
  }

  data.kpiReviews
    .filter((review) => review.status === "Open" && employeeKpiIds.has(review.kpiId))
    .forEach((review) => {
      const kpi = findKpi(data, review.kpiId);
      items.push(`KPI action: ${kpi?.title ?? "Review"} - ${review.actionPlan || "Open action"}`);
    });

  return items;
}

function daysUntil(dateIso: string) {
  const today = new Date(`${todayIso()}T00:00:00`);
  const target = new Date(`${dateIso}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function skillLevelRank(level: SkillLevel) {
  return skillLevels.indexOf(level);
}

function findKpi(data: AcademyData, kpiId: string) {
  return data.kpis.find((kpi) => kpi.id === kpiId);
}

function findSkill(data: AcademyData, skillId: string) {
  return data.skills.find((skill) => skill.id === skillId);
}

function getEmployeeDeleteBlockers(data: AcademyData, employeeId: string) {
  const blockers: string[] = [];
  const assignmentCount = data.assignments.filter((assignment) => assignment.employeeId === employeeId).length;
  const certificateCount = data.certificates.filter((certificate) => certificate.employeeId === employeeId).length;
  const skillCount = data.skills.filter((skill) => skill.employeeId === employeeId).length;
  const signOffCount = data.signOffs.filter((signOff) => signOff.employeeId === employeeId).length;
  const kpiCount = data.kpis.filter((kpi) => kpi.employeeId === employeeId).length;

  if (assignmentCount) blockers.push(`${assignmentCount} assignment${assignmentCount === 1 ? "" : "s"}`);
  if (certificateCount) blockers.push(`${certificateCount} certificate${certificateCount === 1 ? "" : "s"}`);
  if (skillCount) blockers.push(`${skillCount} skill record${skillCount === 1 ? "" : "s"}`);
  if (signOffCount) blockers.push(`${signOffCount} practical sign-off${signOffCount === 1 ? "" : "s"}`);
  if (kpiCount) blockers.push(`${kpiCount} KPI link${kpiCount === 1 ? "" : "s"}`);

  return blockers;
}

function getModuleDeleteBlockers(data: AcademyData, moduleId: string) {
  const blockers: string[] = [];
  const assignmentCount = data.assignments.filter((assignment) => assignment.moduleId === moduleId).length;
  const certificateCount = data.certificates.filter((certificate) => certificate.moduleId === moduleId).length;
  const ruleCount = data.assignmentRules.filter((rule) => rule.moduleIds.includes(moduleId)).length;
  const skillCount = data.skills.filter((skill) => skill.linkedTrainingId === moduleId).length;
  const kpiCount = data.kpis.filter((kpi) => kpi.linkedTrainingId === moduleId).length;

  if (assignmentCount) blockers.push(`${assignmentCount} assignment${assignmentCount === 1 ? "" : "s"}`);
  if (certificateCount) blockers.push(`${certificateCount} certificate${certificateCount === 1 ? "" : "s"}`);
  if (ruleCount) blockers.push(`${ruleCount} assignment rule${ruleCount === 1 ? "" : "s"}`);
  if (skillCount) blockers.push(`${skillCount} skill link${skillCount === 1 ? "" : "s"}`);
  if (kpiCount) blockers.push(`${kpiCount} KPI link${kpiCount === 1 ? "" : "s"}`);

  return blockers;
}

function getAssignmentDeleteBlockers(data: AcademyData, assignmentId: string) {
  const blockers: string[] = [];
  const certificateCount = data.certificates.filter((certificate) => certificate.assignmentId === assignmentId).length;
  const assignment = data.assignments.find((record) => record.id === assignmentId);

  if (certificateCount) blockers.push(`${certificateCount} certificate${certificateCount === 1 ? "" : "s"}`);
  if (assignment?.certificateId) blockers.push("issued certificate reference");

  return blockers;
}

function kpiStatusClass(status: KpiStatus) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function skillStatusClass(status: SkillStatus) {
  return status.toLowerCase().replace(/\s+/g, "-");
}

function skillLevelMeaning(level: SkillLevel) {
  return {
    L0: "Not trained",
    L1: "Training completed",
    L2: "Test passed",
    L3: "Practical sign-off",
    L4: "Certified independent",
    L5: "Trainer level"
  }[level];
}

function skillWorkPermission(level: SkillLevel) {
  return {
    L0: "Cannot perform task",
    L1: "Awareness only",
    L2: "Can assist",
    L3: "Can work under supervision",
    L4: "Can work independently",
    L5: "Can train and approve others"
  }[level];
}

function applySignOffToSkill(skill: SkillRecord, signOff: PracticalSignOff): SkillRecord {
  const passed = signOff.result === "Pass";
  const nextLevel = passed ? promoteSkillLevelAfterSignOff(skill.level) : skill.level;

  return {
    ...skill,
    level: nextLevel,
    status: passed ? "Certified" : "Practical Pending",
    supervisor: signOff.supervisor,
    validTill: passed ? addMonths(signOff.observedAt, 12) : skill.validTill,
    lastSignOffId: signOff.id,
    notes: signOff.notes || signOff.nextAction || `${signOff.result} practical sign-off recorded.`,
    updatedAt: signOff.observedAt
  };
}

function promoteSkillLevelAfterSignOff(level: SkillLevel): SkillLevel {
  if (level === "L0" || level === "L1" || level === "L2") {
    return "L3";
  }

  return level;
}

function safePdfName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}
