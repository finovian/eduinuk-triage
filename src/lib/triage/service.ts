/**
 * Triage service orchestrator.

 * Pipeline:
 *  1. Pre-checks (pure TS, no AI)
 *     └─ Immediate danger → short-circuit, return hardcoded safe response
 *     └─ Visa / injection → set flags, continue
 *  2. AI call (callAI)
 *     └─ Any failure → buildAiFailureResult() — persist and escalate gracefully
 *  3. Parse + Zod-validate AI output
 *     └─ Parse failure → buildAiFailureResult()
 *  4. Post-check overrides (final authority)
 *  5. Persist to DB
 
 * The service owns the transaction: if DB persistence fails, an error is
 * thrown and the caller returns a 500. We never return AI output without
 * persisting it (prevents ghost cases).
 
 * The reasoning field is captured for audit but NEVER included in the
 * return value visible to the client.
 */

import { runPreChecks, buildImmediateDangerResponse } from "./pre-checks";
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
    // Immediate danger — bypass AI entirely
    preCheckTriggered = true;
    const hardcoded = buildImmediateDangerResponse(request.name);
    // Run post-checks even on hardcoded responses for consistency
    const zeroFlags: PreCheckFlags = {
      possibleVisa: false,
      possibleInjection: false,
    };
    postChecked = applyPostChecks(hardcoded, zeroFlags);
  } else {
    // Step 2: AI call
    let rawResponse: string;
    let rawJson: unknown;

    try {
      rawResponse = await callAI(request);
      aiCallSucceeded = true;
    } catch (err) {
      const reason =
        err instanceof AiCallError ? err.message : "Unknown AI error";
      console.error("[triage] AI call failed:", reason);
      rawResponse = "";
      const failureResult = buildAiFailureResult(reason);
      const caseRecord = await persistCase(request, failureResult, {
        modelUsed: process.env.AI_MODEL ?? "gpt-4o-mini",
        preCheckTriggered: false,
        aiCallSucceeded: false,
        rawLlmResponse: { error: reason },
      });
      return { ...failureResult, caseId: caseRecord.id, preCheckTriggered: false, aiCallSucceeded: false };
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
        preCheckTriggered: false,
        aiCallSucceeded: true,
        rawLlmResponse: { raw: rawResponse.slice(0, 1000) },
      });
      return { ...failureResult, caseId: caseRecord.id, preCheckTriggered: false, aiCallSucceeded: true };
    }

    const parsed = TriageResponseSchema.safeParse(rawJson);
    if (!parsed.success) {
      const reason = `AI response failed schema validation: ${parsed.error.message}`;
      console.error("[triage] Schema validation failed:", parsed.error.flatten());
      const failureResult = buildAiFailureResult(reason);
      const caseRecord = await persistCase(request, failureResult, {
        modelUsed: process.env.AI_MODEL ?? "gpt-4o-mini",
        preCheckTriggered: false,
        aiCallSucceeded: true,
        rawLlmResponse: rawJson as Record<string, unknown>,
      });
      return { ...failureResult, caseId: caseRecord.id, preCheckTriggered: false, aiCallSucceeded: true };
    }

    // Step 4: Post-checks (final authority) 
    postChecked = applyPostChecks(parsed.data, preCheck.flags);

    // Persist to DB
    const caseRecord = await persistCase(request, postChecked, {
      modelUsed: process.env.AI_MODEL ?? "gpt-4o-mini",
      preCheckTriggered: false,
      aiCallSucceeded: true,
      rawLlmResponse: rawJson as Record<string, unknown>,
    });

    return {
      ...postChecked,
      caseId: caseRecord.id,
      preCheckTriggered: false,
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
