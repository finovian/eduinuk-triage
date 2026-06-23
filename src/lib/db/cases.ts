import { prisma } from "@/lib/prisma";
import type {
  CaseFilters,
  CaseStats,
  PostCheckResult,
} from "@/types/triage";
import type { Prisma, CaseStatus } from "@prisma/client";




// persistCase 

export interface PersistMeta {
  modelUsed: string;
  preCheckTriggered: boolean;
  aiCallSucceeded: boolean;
  rawLlmResponse: Record<string, unknown>;
}

export async function persistCase(
  request: {
    name: string;
    email: string;
    university: string;
    course: string;
    year_of_study: string;
    message: string;
  },
  result: PostCheckResult,
  meta: PersistMeta
) {

  let student = await prisma.student.findFirst({
    where: { email: request.email },
  });

  if (student) {
    student = await prisma.student.update({
      where: { id: student.id },
      data: {
        name: request.name,
        university: request.university,
        course: request.course,
        yearOfStudy: request.year_of_study,
      },
    });
  } else {
    // Create new student record
    student = await prisma.student.create({
      data: {
        name: request.name,
        email: request.email,
        university: request.university,
        course: request.course,
        yearOfStudy: request.year_of_study,
      },
    });
  }

  // Create Case with nested TriageResult
  return prisma.case.create({
    data: {
      studentId: student.id,
      message: request.message,
      status: "new",
      triage: {
        create: {
          category: result.category,
          urgency: result.urgency,
          disposition: result.disposition,
          safeguardingFlag: result.safeguarding_flag,
          emergencySupport: result.emergency_support,
          reasoning: result.reasoning,
          studentReply: result.student_reply,
          staffSummary: result.staff_summary,
          clarifyingQuestion: result.clarifying_question,
          resourcesUsed: result.resources_used,
          modelUsed: meta.modelUsed,
          aiCallSucceeded: meta.aiCallSucceeded,
          preCheckTriggered: meta.preCheckTriggered,
          postCheckApplied: result.postCheckApplied,
          overrideReasons: result.overrideReasons,
          rawLlmResponse: meta.rawLlmResponse as Prisma.InputJsonValue,
        },
      },
    },
  });
}

//  getCases 

export async function getCases(filters: CaseFilters = {}) {
  const {
    status,
    urgency,
    category,
    disposition,
    safeguardingOnly = false,
    page = 1,
    pageSize = 25,
  } = filters;

  const triageWhere: Prisma.TriageResultWhereInput = {
    ...(urgency ? { urgency } : {}),
    ...(category ? { category } : {}),
    ...(disposition ? { disposition } : {}),
    ...(safeguardingOnly ? { safeguardingFlag: true } : {}),
    ...(!disposition ? { disposition: { not: "discard" } } : {}),
  };

  const where: Prisma.CaseWhereInput = {
    ...(status ? { status } : {}),
    ...(Object.keys(triageWhere).length > 0 ? { triage: triageWhere } : {}),
  };

  const [cases, total] = await prisma.$transaction([
    prisma.case.findMany({
      where,
      orderBy: [
        { triage: { urgency: "asc" } },
        { createdAt: "desc" }
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        student: true,
        triage: true,
      },
    }),
    prisma.case.count({ where }),
  ]);

  // Map to flat CaseSummary shape for UI and API
  const mapped = cases.map((c) => ({
    id: c.id,
    createdAt: c.createdAt,
    studentName: c.student?.name ?? "",
    university: c.student?.university ?? "",
    course: c.student?.course ?? "",
    yearOfStudy: c.student?.yearOfStudy ?? "",
    category: c.triage?.category ?? "other",
    urgency: c.triage?.urgency ?? "low",
    disposition: c.triage?.disposition ?? "escalate",
    safeguardingFlag: c.triage?.safeguardingFlag ?? false,
    emergencySupport: c.triage?.emergencySupport ?? false,
    status: c.status as any,
    assignedTo: c.assignedTo,
    preCheckTriggered: c.triage?.preCheckTriggered ?? false,
    postCheckApplied: c.triage?.postCheckApplied ?? false,
    aiCallSucceeded: c.triage?.aiCallSucceeded ?? false,
  }));

  return { cases: mapped, total, page, pageSize };
}

// getCaseById 

export async function getCaseById(id: string) {
  const c = await prisma.case.findUnique({
    where: { id },
    include: {
      student: true,
      triage: true,
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!c) return null;

  // Flatten the response for the frontend CaseDetail interface
  return {
    id: c.id,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    studentName: c.student?.name ?? "",
    studentEmail: c.student?.email ?? "",
    university: c.student?.university ?? "",
    course: c.student?.course ?? "",
    yearOfStudy: c.student?.yearOfStudy ?? "",
    message: c.message,
    category: c.triage?.category ?? "other",
    urgency: c.triage?.urgency ?? "low",
    disposition: c.triage?.disposition ?? "escalate",
    safeguardingFlag: c.triage?.safeguardingFlag ?? false,
    emergencySupport: c.triage?.emergencySupport ?? false,
    reasoning: c.triage?.reasoning ?? "",
    studentReply: c.triage?.studentReply ?? null,
    staffSummary: c.triage?.staffSummary ?? null,
    clarifyingQuestion: c.triage?.clarifyingQuestion ?? null,
    resourcesUsed: c.triage?.resourcesUsed ?? [],
    modelUsed: c.triage?.modelUsed ?? "unknown",
    preCheckTriggered: c.triage?.preCheckTriggered ?? false,
    postCheckApplied: c.triage?.postCheckApplied ?? false,
    overrideReasons: c.triage?.overrideReasons ?? [],
    aiCallSucceeded: c.triage?.aiCallSucceeded ?? false,
    rawLlmResponse: c.triage?.rawLlmResponse ?? {},
    status: c.status as any,
    assignedTo: c.assignedTo,
    staffNotes: c.notes[0]?.note ?? null,
    resolvedAt: c.resolvedAt,
  };
}

// updateCase 

export async function updateCase(
  id: string,
  data: {
    status?: CaseStatus;
    assignedTo?: string | null;
    staffNotes?: string | null;
  }
) {
  const updateData: Prisma.CaseUpdateInput = {};

  if (data.status !== undefined) {
    updateData.status = data.status;
    if (data.status === "resolved") {
      updateData.resolvedAt = new Date();
    } else {
      updateData.resolvedAt = null;
    }
  }

  if (data.assignedTo !== undefined) {
    updateData.assignedTo = data.assignedTo;
  }

  // Update Case workflow fields
  const updatedCase = await prisma.case.update({
    where: { id },
    data: updateData,
    include: {
      notes: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // If staffNotes is provided, check if it's different from the latest note
  if (data.staffNotes !== undefined) {
    const latestNote = updatedCase.notes[0]?.note ?? null;
    if (data.staffNotes !== latestNote) {
      if (data.staffNotes) {
        await prisma.staffNote.create({
          data: {
            caseId: id,
            note: data.staffNotes,
          },
        });
      } else {
        // Clear notes if set to empty/null
        await prisma.staffNote.deleteMany({
          where: { caseId: id },
        });
      }
    }
  }

  // Re-fetch to return the fully updated case
  return getCaseById(id);
}

// getCaseStats 

export async function getCaseStats(): Promise<CaseStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalOpen, criticalOpen, safeguardingOpen, resolvedToday] =
    await prisma.$transaction([
      prisma.case.count({
        where: { status: { in: ["new", "in_progress"] } },
      }),
      prisma.case.count({
        where: {
          status: { in: ["new", "in_progress"] },
          triage: { urgency: "critical" },
        },
      }),
      prisma.case.count({
        where: {
          status: { in: ["new", "in_progress"] },
          triage: { safeguardingFlag: true },
        },
      }),
      prisma.case.count({
        where: {
          status: "resolved",
          resolvedAt: { gte: today },
        },
      }),
    ]);

  return { totalOpen, criticalOpen, safeguardingOpen, resolvedToday };
}
