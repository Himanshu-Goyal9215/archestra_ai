"use server";

// ─── Gemini Config ──────────────────────────────────────────────────────
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

// ─── Types ──────────────────────────────────────────────────────────────
export interface FoodAnalysis {
    dish_name: string;
    ingredients: string[];
    estimated_portion_grams: number;
    estimated_calories_kcal: number;
    protein_g: number;
    carbohydrates_g: number;
    fat_g: number;
    sodium_mg: number;
    confidence_score: number;
    summary: string;
}

export type MealType = "breakfast" | "lunch" | "snacks" | "dinner" | "others";

// ─── Health Chat Query (for chatbot integration) ────────────────────────

export async function queryHealthData(userQuestion: string, mealsJson: string): Promise<string> {
    if (!GEMINI_API_KEY) throw new Error("Gemini API key not configured");

    const prompt = `You are a health assistant with access to the user's meal data.
Answer the user's question based on their stored meal entries.
Each meal entry includes: dish_name, ingredients, calories, protein, carbohydrates, fat, sodium, estimated_portion_grams, summary, date, and meal_type.

Use the summary field for richer context about each meal.
Group data by date when relevant to show day-wise breakdowns.

User's meal data (JSON):
${mealsJson}

User's question: ${userQuestion}

Provide a clear, concise answer. Include specific numbers and dates when relevant.
If comparing across days, show a day-wise breakdown.
If no data is available for the requested period, say so politely.`;

    const res = await fetch(GEMINI_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
        }),
    });

    if (!res.ok) throw new Error("Failed to query health data");

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't analyze your meal data right now.";
}
