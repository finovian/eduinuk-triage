import { runPreChecks, buildImmediateDangerResponse, buildInjectionResponse } from "./pre-checks";
import { callAI, AiCallError } from "./ai";
import { applyPostChecks } from "./post-checks";
import { TriageResponseSchema } from "./schema";
import { persistCase } from "@/lib/db/cases";
import type {
  StudentRequest,
  TriageServiceResult,
  PostCheckResult,
  PreCheckFlags,
} from "@/types/triage";

// AI failure fallback

function buildAiFailureResult(reason: string): PostCheckResult {
  return {
    category: "other",
    urgency: "high",
    safeguarding_flag: false,
    emergency_support: false,
    disposition: "escalate",
    reasoning: `AI failure: ${reason}`,
    student_reply: null,
    staff_summary: `⚠️ AI SERVICE FAILURE — manual review required.\n\nReason: ${reason}\n\nThe AI did not produce a valid triage response. Please review this message manually and take appropriate action.`,
    clarifying_question: null,
    resources_used: [],
    postCheckApplied: false,
    overrideReasons: ["ai_failure_fallback"],
  };
}

// Main orchestrator

export async function runTriage(
  request: StudentRequest
): Promise<TriageServiceResult> {
  // Step 1: Pre-checks 
  const preCheck = runPreChecks(request.message);

  let postChecked: PostCheckResult;
  let preCheckTriggered = false;
  let aiCallSucceeded = false;

  if (preCheck.shortCircuit) {
    preCheckTriggered = true;

    let hardcoded;
    if (preCheck.reason === "immediate_danger") {
      hardcoded = buildImmediateDangerResponse(request.name);
    } else if (preCheck.reason === "prompt_injection") {
      hardcoded = buildInjectionResponse();
    } else {
      hardcoded = buildImmediateDangerResponse(request.name);
    }

    const zeroFlags: PreCheckFlags = {
      possibleVisa: false,
      possibleInjection: false,
    };
    postChecked = applyPostChecks(hardcoded, zeroFlags);
  } else {
    // Step 2: AI call
    preCheckTriggered = preCheck.flags.possibleVisa || preCheck.flags.possibleInjection;
    let rawResponse: string;
    let rawJson: unknown;

    try {
      rawResponse = await callAI(request);
      console.log('rawResponse', rawResponse)
      aiCallSucceeded = true;
    } catch (err) {
      const reason =
        err instanceof AiCallError ? err.message : "Unknown AI error";
      console.error("[triage] AI call failed:", reason);
      rawResponse = "";
      const failureResult = buildAiFailureResult(reason);
      const caseRecord = await persistCase(request, failureResult, {
        modelUsed: process.env.AI_MODEL ?? "gpt-4o-mini",
        preCheckTriggered,
        aiCallSucceeded: false,
        rawLlmResponse: { error: reason },
      });
      return { ...failureResult, caseId: caseRecord.id, preCheckTriggered, aiCallSucceeded: false };
    }

    //  Step 3: Parse + Validate
    try {
      rawJson = JSON.parse(rawResponse);
    } catch {
      const reason = `AI returned invalid JSON: ${rawResponse.slice(0, 200)}`;
      console.error("[triage] JSON parse failed:", reason);
      const failureResult = buildAiFailureResult(reason);
      const caseRecord = await persistCase(request, failureResult, {
        modelUsed: process.env.AI_MODEL ?? "gpt-4o-mini",
        preCheckTriggered,
        aiCallSucceeded: true,
        rawLlmResponse: { raw: rawResponse.slice(0, 2000) },
      });
      return { ...failureResult, caseId: caseRecord.id, preCheckTriggered, aiCallSucceeded: true };
    }

    const parsed = TriageResponseSchema.safeParse(rawJson);
    if (!parsed.success) {
      const reason = `AI response failed schema validation: ${parsed.error.message}`;
      console.error("[triage] Schema validation failed:", parsed.error.flatten());
      const failureResult = buildAiFailureResult(reason);
      const caseRecord = await persistCase(request, failureResult, {
        modelUsed: process.env.AI_MODEL ?? "gpt-4o-mini",
        preCheckTriggered,
        aiCallSucceeded: true,
        rawLlmResponse: rawJson as Record<string, unknown>,
      });
      return { ...failureResult, caseId: caseRecord.id, preCheckTriggered, aiCallSucceeded: true };
    }

    // Step 4: Post-checks (final authority) 
    postChecked = applyPostChecks(parsed.data, preCheck.flags);
    console.log('postChecked2', postChecked)

    // Persist to DB
    const caseRecord = await persistCase(request, postChecked, {
      modelUsed: process.env.AI_MODEL ?? "gpt-4o-mini",
      preCheckTriggered,
      aiCallSucceeded: true,
      rawLlmResponse: rawJson as Record<string, unknown>,
    });

    return {
      ...postChecked,
      caseId: caseRecord.id,
      preCheckTriggered,
      aiCallSucceeded: true,
    };
  }

  // Persist short-circuit (pre-check triggered) case
  const caseRecord = await persistCase(request, postChecked, {
    modelUsed: "none (pre-check short-circuit)",
    preCheckTriggered,
    aiCallSucceeded: false,
    rawLlmResponse: {},
  });

  return {
    ...postChecked,
    caseId: caseRecord.id,
    preCheckTriggered,
    aiCallSucceeded,
  };
}
