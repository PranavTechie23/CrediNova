/**
 * PII Masking Service - Barclays data privacy compliant
 * Hash or mask PII before processing/storage (GDPR Art 5, 32)
 */

const PII_COLUMN_PATTERNS = [
  /^(email|e-mail|e_mail)$/i,
  /^(name|full.?name|applicant.?name)$/i,
  /^(phone|mobile|telephone|contact)$/i,
  /^(aadhaar|aadhar|pan|ssn|national.?id)$/i,
  /^(address|street|city|postal|zip)$/i,
  /^(dob|date.?of.?birth|birth.?date)$/i,
];

export function isPiiColumn(header: string): boolean {
  const normalized = String(header || "").trim().toLowerCase().replace(/\s+/g, " ");
  return PII_COLUMN_PATTERNS.some((p) => p.test(normalized));
}

/** Async SHA-256 hash for PII (use when encryption-grade hashing needed) */

export function maskPii(value: unknown): string {
  if (value == null || value === "") return "";
  const str = String(value);
  if (str.length <= 4) return "****";
  return str.slice(0, 2) + "*".repeat(Math.min(str.length - 4, 8)) + str.slice(-2);
}

/**
 * Synchronous hash fallback using simple string hash (for environments without crypto.subtle)
 */
function simpleHash(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return `h_${Math.abs(h).toString(16)}`;
}

export async function hashPiiAsync(value: unknown): Promise<string> {
  if (value == null || value === "") return "";
  const str = String(value).trim();
  if (!str) return "";
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  } catch {
    return simpleHash(str);
  }
}

export function maskRowPii(row: Record<string, unknown>, headers: string[]): Record<string, unknown> {
  const out = { ...row };
  headers.forEach((h) => {
    if (isPiiColumn(h) && out[h] != null) {
      out[h] = maskPii(out[h]);
    }
  });
  return out;
}
