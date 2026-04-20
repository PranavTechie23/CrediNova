/**
 * Chat API Service - Finance/Credit domain
 * Supports Gemini (default) and OpenAI (optional).
 *
 * - Chat history support
 * - Exponential backoff retries for transient errors (429/5xx)
 * - Basic PII redaction guardrail (never send raw PII to model)
 */
 
const API_PROVIDER = import.meta.env.VITE_AI_PROVIDER || "gemini";
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.5-flash";
const OPENAI_MODEL = import.meta.env.VITE_OPENAI_MODEL || "gpt-5.1-mini";
 
export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}
 
const SYSTEM_PROMPT = `You are a credit risk and lending operations AI assistant for a regulated bank.
You help with:
- Credit scoring interpretation (PD, risk tier, explainability)
- Portfolio/bulk assessment summaries
- Fair lending & compliance checks (high-level, non-legal advice)
- Applicant improvement suggestions (behavioral + financial hygiene)
- Model governance (auditability, model versioning, monitoring)

Hard rules:
- Never request or output personally identifiable information (PII) like name, email, phone, Aadhaar/PAN/SSN, address, DOB.
- If the user provides PII, acknowledge and continue with PII removed (do not repeat it).
- Do not provide illegal/unsafe advice or instructions to bypass credit policies.
- Provide concise, professional, finance-appropriate responses.

If asked for decisions on real individuals, respond with general guidance and recommend human review where appropriate.`;
 
function redactPII(text: string): string {
  if (!text) return text;
  return (
    text
      // Emails
      .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED_EMAIL]")
      // Phone-ish sequences
      .replace(/\b(\+?\d[\d\s().-]{7,}\d)\b/g, "[REDACTED_PHONE]")
      // ID-like keywords
      .replace(/\b(aadhaar|aadhar|pan|ssn|passport|national id|account number)\b/gi, "[REDACTED_ID]")
  );
}
 
function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages.map((m) => ({ ...m, content: redactPII(m.content) }));
}
 
/**
 * Main entry point for sending chat messages.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const safeMessages = sanitizeMessages(messages);
  const safeUserMessage = redactPII(userMessage);
 
  try {
    if (API_PROVIDER === "openai") {
      return await sendOpenAIMessage(safeMessages, safeUserMessage);
    }
    return await sendGeminiMessage(safeMessages, safeUserMessage);
  } catch (error) {
    console.error("Chat API Error:", error);
    throw new Error("Failed to get response from AI. Please try again.");
  }
}
 
/**
 * OpenAI Implementation (optional)
 */
async function sendOpenAIMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured.");
  }
 
  const conversationHistory = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role as "user" | "assistant" | "system", content: m.content })),
    { role: "user" as const, content: userMessage },
  ];
 
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: conversationHistory,
      temperature: 0.4,
      max_tokens: 900,
    }),
  });
 
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
    throw new Error(err.error?.message || `OpenAI API error: ${response.statusText}`);
  }
 
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "No response generated";
}
 
/**
 * Gemini Implementation with Exponential Backoff
 */
async function sendGeminiMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = GEMINI_API_KEY || "";
  if (!apiKey) throw new Error("Gemini API key not configured.");
 
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
 
  // Filter out system messages from history and map roles correctly
  const contents = messages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));
 
  contents.push({ role: "user", parts: [{ text: userMessage }] });
 
  const payload = {
    contents,
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 900,
    },
  };
 
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  let lastError: unknown;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
 
      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated";
      }
 
      const errorData = await response.json().catch(() => ({}));
      lastError = new Error(errorData.error?.message || `Gemini API error: ${response.statusText}`);
 
      // Retry only on rate limit / server errors
      if (response.status !== 429 && response.status < 500) break;
    } catch (err) {
      lastError = err;
    }
 
    await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
  }
 
  throw lastError || new Error("Failed to connect to Gemini API after retries.");
}
 
/**
 * Fallback responses for local development/disconnected state.
 */
export function getFallbackResponse(userMessage: string): string {
  const lower = (userMessage || "").toLowerCase();
 
  if (lower.includes("improve") || lower.includes("increase") || lower.includes("approval")) {
    return (
      "I can help improve approval odds. Share non-PII details like income, EMI, credit limit, outstanding balance, delinquencies, and loan tenure. " +
      "I’ll suggest the highest-impact levers (e.g., reduce EMI-to-income, lower utilization, increase stability)."
    );
  }
 
  if (lower.includes("fairness") || lower.includes("bias") || lower.includes("compliance")) {
    return (
      "For compliance, focus on auditability and fair lending metrics. " +
      "We can review approval rates by segment and disparate impact ratio, and ensure every decision has an explainable trace."
    );
  }
 
  if (lower.includes("bulk") || lower.includes("portfolio")) {
    return (
      "For bulk/portfolio analysis, I can summarize approval rate, risk-band distribution, and fairness metrics by segment (e.g., income bands). " +
      "Upload the file (no PII columns) and I’ll guide the interpretation."
    );
  }
 
  return "Ask me about credit risk results, explainability, portfolio summaries, or compliance/fairness checks (no PII).";
}

