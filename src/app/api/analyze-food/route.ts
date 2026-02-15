import { NextRequest, NextResponse } from "next/server";

// ─── Gemini Config ──────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const ANALYSIS_PROMPT = `You are a food portion and nutrition estimation assistant.

Your task is to analyze the provided food image or meal description and estimate nutrition values based strictly on the visible portion size — NOT on standard serving sizes.

IMPORTANT RULES:

1. Carefully estimate the portion size of the entire meal in grams.
2. Visually estimate how much each ingredient contributes to the total portion.
3. Calculate calories, protein, carbohydrates, fat, and sodium proportionally based on the estimated ingredient quantities.
4. DO NOT assume a default restaurant serving.
5. If the portion looks small, nutrition values must be low.
6. If only a small amount of a protein source (e.g., paneer, chicken, tofu) is visible, reduce protein accordingly.
7. Use realistic nutritional density values per 100g internally when calculating.
8. Round:
   - Calories to nearest integer
   - Macronutrients to 1 decimal place
9. If uncertain about portion size, lower the confidence_score.

Analyze the provided food image or meal description.

Identify:
- Dish name
- Visible ingredients
- Estimated total portion size (grams)
- Estimated total calories (kcal)
- Protein (g)
- Carbohydrates (g)
- Fat (g)
- Sodium (mg)
- A detailed summary (3-5 sentences) describing: the dish, key ingredients spotted, estimated portion size rationale, notable nutritional highlights or concerns, and any assumptions made.

Return ONLY valid JSON in this format:

{
  "dish_name": "",
  "ingredients": [],
  "estimated_portion_grams": 0,
  "estimated_calories_kcal": 0,
  "protein_g": 0,
  "carbohydrates_g": 0,
  "fat_g": 0,
  "sodium_mg": 0,
  "confidence_score": 0.0,
  "summary": ""
}

Do not include explanations.
Do not include markdown.
Return only JSON.`;

export const maxDuration = 60;

export async function POST(req: NextRequest) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { imageBase64, imageMimeType, text } = body;

        let requestBody: any;

        if (imageBase64 && imageBase64.length > 0) {
            // Image analysis via Gemini 2.5 Flash
            requestBody = {
                contents: [{
                    parts: [
                        { text: ANALYSIS_PROMPT },
                        { inline_data: { mime_type: imageMimeType || "image/jpeg", data: imageBase64 } }
                    ]
                }]
            };
        } else if (text && text.trim()) {
            // Text-based analysis via Gemini 2.5 Flash
            requestBody = {
                contents: [{
                    parts: [
                        { text: `${ANALYSIS_PROMPT}\n\nMeal description: ${text.trim()}` }
                    ]
                }]
            };
        } else {
            return NextResponse.json({ error: "Please provide an image or meal description" }, { status: 400 });
        }

        // Call Gemini 2.5 Flash
        const startTime = Date.now();
        const res = await fetch(GEMINI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
        });

        if (!res.ok) {
            const errText = await res.text();
            console.error("[Gemini 2.5 Flash] API error:", res.status, errText);
            return NextResponse.json({ error: `Gemini API error: ${res.status}` }, { status: res.status });
        }

        const data = await res.json();
        const elapsed = Date.now() - startTime;

        // Log token usage
        const usage = data.usageMetadata;
        if (usage) {
            console.log(`[Gemini 2.5 Flash] Tokens — prompt: ${usage.promptTokenCount}, response: ${usage.candidatesTokenCount}, total: ${usage.totalTokenCount} | Time: ${elapsed}ms`);
        }

        // Extract text response
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!responseText) {
            return NextResponse.json({ error: "Empty response from Gemini" }, { status: 500 });
        }

        // Parse JSON — strip any markdown fence
        const jsonStr = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        let parsed;

        try {
            parsed = JSON.parse(jsonStr);
        } catch {
            // Retry once if JSON parse fails
            console.warn("[Gemini 2.5 Flash] JSON parse failed, retrying...");
            const retryRes = await fetch(GEMINI_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });
            const retryData = await retryRes.json();
            const retryText = retryData.candidates?.[0]?.content?.parts?.[0]?.text || "";
            const retryJson = retryText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
            parsed = JSON.parse(retryJson);
        }

        // Validate required fields
        if (!parsed.dish_name || typeof parsed.estimated_calories_kcal !== "number") {
            return NextResponse.json({ error: "Invalid analysis result" }, { status: 500 });
        }

        return NextResponse.json(parsed);

    } catch (error: any) {
        console.error("[analyze-food] Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to analyze food" },
            { status: 500 }
        );
    }
}
