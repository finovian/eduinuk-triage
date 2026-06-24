import type { TriageResponse, PostCheckResult, PreCheckFlags } from "@/types/triage";

const EMERGENCY_PREFIX =
  "⚠️ If you or someone else is in immediate danger, please call 999 now. " +
  "The Samaritans are available 24/7 on 116 123 — free and confidential.\n\n";

// Post-check runner 

export function applyPostChecks(
  result: TriageResponse,
  flags: PreCheckFlags
): PostCheckResult {

  const out: TriageResponse = { ...result };
  const overrideReasons: string[] = [];

  // Rule 1: Visa flag → force escalate 
  if (flags.possibleVisa && out.disposition !== "escalate") {
    out.disposition = "escalate";
    overrideReasons.push("visa_force_escalate");
  }


  if (flags.possibleInjection) {
    if (out.disposition !== "escalate") {
      out.disposition = "escalate";
      overrideReasons.push("injection_force_escalate");
    }
    const injectionWarning =
      "⚠️ POSSIBLE PROMPT INJECTION ATTEMPT DETECTED. Review message carefully before acting. ";
    out.staff_summary = injectionWarning + (out.staff_summary ?? "");
    overrideReasons.push("injection_staff_warning_prepended");
  }


  if (
    (out.urgency === "critical" || out.urgency === "high") &&
    out.disposition === "handle_now"
  ) {
    out.disposition = "escalate";
    overrideReasons.push("high_critical_no_handle_now");
  }

  if (
    out.safeguarding_flag &&
    (out.urgency === "high" || out.urgency === "critical") &&
    !out.emergency_support
  ) {
    out.emergency_support = true;
    overrideReasons.push("safeguarding_high_force_emergency");
  }

  if (out.safeguarding_flag && out.emergency_support && out.urgency !== "critical") {
    out.urgency = "critical";
    overrideReasons.push("safeguarding_emergency_force_critical");
  }


  if (out.safeguarding_flag && out.disposition === "handle_now") {
    out.disposition = "escalate";
    overrideReasons.push("safeguarding_no_handle_now");
  }


  if (out.safeguarding_flag && out.disposition === "discard") {
    out.disposition = "escalate";
    overrideReasons.push("safeguarding_no_discard");
  }


  if (out.emergency_support && out.disposition !== "escalate") {
    out.disposition = "escalate";
    overrideReasons.push("emergency_must_escalate");
  }


  if (out.emergency_support) {
    const reply = out.student_reply ?? "";
    const has999 = reply.includes("999");
    const hasSamaritans =
      reply.includes("116 123") || reply.includes("116123");

    if (!has999 || !hasSamaritans) {
      out.student_reply =
        "⚠️ If you or someone else is in immediate danger, please call 999 now. " +
        "The Samaritans are available 24/7 on 116 123, free and confidential. " +
        "A member of our support team will be in touch with you as soon as possible.";
      overrideReasons.push("emergency_numbers_injected");
    }
  }


  if (out.disposition === "discard") {
    out.student_reply = null;
    out.staff_summary = null;
    overrideReasons.push("discard_null_fields");
  }

  return {
    ...out,
    postCheckApplied: overrideReasons.length > 0,
    overrideReasons,
  };
}
