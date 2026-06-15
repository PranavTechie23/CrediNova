import { GoogleGenerativeAI } from "@google/generative-ai";
import type { CreditResponse } from "@/types";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export interface AIReport {
  risk_explanation: string;
  visual_insights: string;
  improvement_suggestions: string[];
  what_if_scenarios: { scenario: string; impact: string }[];
  chart_data: { subject: string; A: number; fullMark: number }[];
}

export async function generateAIReport(data: CreditResponse): Promise<AIReport> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    You are a professional credit risk analyst. Generate a comprehensive, enterprise-grade credit decision report.
    
    MODEL OUTPUT:
    {
      "pd": ${data.probability_of_default},
      "risk_band": "${data.risk_band}",
      "risk_score": ${data.risk_score},
      "decision": "${data.decision}",
      "top_features": ${JSON.stringify(data.top_features)},
      "confidence_score": ${data.confidence_score},
      "recommended_rate": ${data.recommended_interest_rate}%
    }

    The report should include:
    1. **Risk Explanation**: Deep narrative explanation of the risk profile.
    2. **Visual Insights**: Plain-English interpretation of metrics.
    3. **Improvement Suggestions**: Actionable advice.
    4. **What-if Scenarios**: Impact of changing factors.
    5. **Chart Data**: 5-6 values for a Radar/Spider chart representing "Income", "Stability", "Debt Control", "History", "Alternative Score", "Usage". Each value 0-100.

    Respond ONLY with a JSON object:
    {
      "risk_explanation": "string",
      "visual_insights": "string",
      "improvement_suggestions": ["string"],
      "what_if_scenarios": [{"scenario": "string", "impact": "string"}],
      "chart_data": [
        {"subject": "Income", "A": number, "fullMark": 100},
        {"subject": "Stability", "A": number, "fullMark": 100},
        {"subject": "Debt Control", "A": number, "fullMark": 100},
        {"subject": "History", "A": number, "fullMark": 100},
        {"subject": "Alternative", "A": number, "fullMark": 100},
        {"subject": "Usage", "A": number, "fullMark": 100}
      ]
    }
  `;

  try {
    if (!import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY.includes("YOUR_API_KEY")) {
      throw new Error("Missing or invalid API key");
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as AIReport;
    }
    throw new Error("Failed to parse AI response as JSON");
  } catch (error) {
    console.error("Error generating AI report:", error);
    throw new Error("Failed to generate AI report. Ensure your Gemini API key is configured and the service is reachable.");
  }
}
