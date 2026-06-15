const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-5.1-mini';

function redactPII(text) {
  if (!text) return text;
  return text
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b(\+?\d[\d\s().-]{7,}\d)\b/g, '[REDACTED_PHONE]')
    .replace(/\b(aadhaar|aadhar|pan|ssn|passport|national id|account number)\b/gi, '[REDACTED_ID]');
}

function sanitizeMessages(messages) {
  return messages.map((m) => ({ ...m, content: redactPII(m.content) }));
}

async function sendChatMessage(messages, userMessage) {
  const safeMessages = sanitizeMessages(messages);
  const safeUserMessage = redactPII(userMessage);

  if (process.env.API_PROVIDER === 'openai') {
    return sendOpenAIMessage(safeMessages, safeUserMessage);
  }
  return sendGeminiMessage(safeMessages, safeUserMessage);
}

async function sendOpenAIMessage(messages, userMessage) {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured.');
  }

  const conversationHistory = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
    const err = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
    throw new Error(err.error?.message || `OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || 'No response generated';
}

async function sendGeminiMessage(messages, userMessage) {
  const apiKey = GEMINI_API_KEY || '';
  if (!apiKey) throw new Error('Gemini API key not configured.');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const contents = messages
    .filter((msg) => msg.role !== 'system')
    .map((msg) => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.content }] }));
  contents.push({ role: 'user', parts: [{ text: userMessage }] });

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

  let lastError;
  for (let i = 0; i < 5; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      }

      const errorData = await response.json().catch(() => ({}));
      lastError = new Error(errorData.error?.message || `Gemini API error: ${response.statusText}`);
      if (response.status !== 429 && response.status < 500) break;
    } catch (err) {
      lastError = err;
    }
    await new Promise((r) => setTimeout(r, Math.pow(2, i) * 1000));
  }

  throw lastError || new Error('Failed to connect to Gemini API after retries.');
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

module.exports = {
  sendChatMessage,
};
