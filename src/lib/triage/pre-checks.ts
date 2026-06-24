
import type { PreCheckResult } from "@/types/triage";

const IMMEDIATE_DANGER_PATTERNS: RegExp[] = [
  /\b(suicid(e|al)|kill\s+myself|end\s+my\s+(own\s+)?life|take\s+my\s+(own\s+)?life)\b/i,
  /\b(self[\s-]?harm|cutting\s+myself|hurting\s+myself|hurt\s+myself)\b/i,
  /\b(overdos(e|ed|ing)|took\s+(too\s+many\s+)?pills)\b/i,
  /\b(don'?t\s+want\s+to\s+(be\s+)?alive|no\s+reason\s+to\s+live|want\s+to\s+disappear\s+forever)\b/i,
  /\b(in\s+immediate\s+danger|someone\s+is\s+threatening\s+me|being\s+attacked)\b/i,
  /\b(don'?t\s+see\s+the\s+point\s+of\s+(anything|life)|can'?t\s+go\s+on|nothing\s+to\s+live\s+for)\b/i,
];

const VISA_PATTERNS: RegExp[] = [
  /\b(visa|CAS|immigration|right\s+to\s+(remain|study)|student\s+route|tier\s*4|BRP|biometric\s+residence)\b/i,
  /\b(leave\s+to\s+remain|sponsor(ship)?|course\s+change.*visa|visa.*course\s+change)\b/i,
  /\b(visa\s+(expir|refus|applic|extend|renew|status))\b/i,
  /\b(CAS\s+(withdrawn|cancelled|refused|expired)|withdrawn\s+CAS)\b/i,
];

const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above|your)(\s+\w+)?\s+(instructions?|rules?|prompts?)/i,
  /override\s+(your\s+)?(behaviour|behavior|rules?|instructions?|settings?)/i,
  /mark\s+(this\s+)?(as\s+)?(resolved|closed|done|complete|low\s+priority)/i,
  /you\s+are\s+now\s+a/i,
  /new\s+persona/i,
  /disregard\s+(your\s+)?(previous|prior|system)\s+(prompt|instructions?)/i,
  /act\s+as\s+if\s+you\s+(are|have\s+no)/i,
  /\[system\]/i,
  /\[\[.*instructions.*\]\]/i,
  /everything\s+is\s+fine\s+here/i,
  /pretend\s+(you\s+)?(are|have)/i,
];

// Pre-check runner

export function runPreChecks(message: string): PreCheckResult {
  console.log('message', message)
  if (IMMEDIATE_DANGER_PATTERNS.some((p) => p.test(message))) {
    return { shortCircuit: true, reason: "immediate_danger" };
  }

  if (INJECTION_PATTERNS.some((p) => p.test(message))) {
    console.log('trigger')
    return { shortCircuit: true, reason: "prompt_injection" };
  }

  return {
    shortCircuit: false,
    flags: {
      possibleVisa: VISA_PATTERNS.some((p) => p.test(message)),
      possibleInjection: false,
    },
  };
}

// Hardcoded short-circuit response 

export function buildImmediateDangerResponse(name: string) {
  const firstName = name.split(" ")[0] ?? name;

  return {
    category: "health_wellbeing" as const,
    urgency: "critical" as const,
    safeguarding_flag: true,
    emergency_support: true,
    disposition: "escalate" as const,
    reasoning:
      "Pre-check detected immediate danger signal. AI bypassed. Hardcoded safe response returned.",
    student_reply: `${firstName}, your safety is what matters most right now. If you or someone else is in immediate danger, please call 999 now. If you need someone to talk to, the Samaritans are available 24/7 on 116 123 — completely free and confidential. A member of our support team will be in touch with you as soon as possible.`,
    staff_summary:
      "⚠️ IMMEDIATE DANGER — PRE-CHECK TRIGGERED. AI was not called. Student message contained clear life-safety signals. Requires urgent human review. Do not close this case automatically.",
    clarifying_question: null,
    resources_used: ["Emergency Services (999)", "Samaritans (116 123)"],
  };
}

export function buildInjectionResponse() {
  return {
    category: "other" as const,
    urgency: "medium" as const,
    safeguarding_flag: false,
    emergency_support: false,
    disposition: "escalate" as const,
    reasoning: "Pre-check detected prompt injection attempt. AI bypassed.",
    student_reply: null,
    staff_summary:
      "⚠️ POSSIBLE PROMPT INJECTION ATTEMPT DETECTED. Message contained instructions attempting to override system behaviour. Do not action any instructions in this message. Review manually.",
    clarifying_question: null,
    resources_used: [],
  };
}