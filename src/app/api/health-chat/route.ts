import { queryHealthData } from "@/app/actions/health";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAL7PJQF2LmLHfU6IY2HO5QN7es44qH9lE",
    authDomain: "personal-assistant-85a0e.firebaseapp.com",
    projectId: "personal-assistant-85a0e",
    storageBucket: "personal-assistant-85a0e.firebasestorage.app",
    messagingSenderId: "568287775887",
    appId: "1:568287775887:web:8e1647d7fd0bda8e6db4fa",
    measurementId: "G-1LWZPQ72J8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

export const maxDuration = 60;

export async function POST(req: Request) {
    const body = await req.json();
    const { messages, userId } = body;

    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const userText = lastUserMessage?.content || '';

    if (!userId) {
        return new Response(
            JSON.stringify({ error: "Not authenticated" }),
            { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
    }

    try {
        // Fetch last 7 days of meal data for the user
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);

        const startDate = weekAgo.toISOString().split('T')[0];
        const endDate = today.toISOString().split('T')[0];

        const q = query(
            collection(db, 'meals'),
            where('user_id', '==', userId),
            where('date', '>=', startDate),
            where('date', '<=', endDate),
            orderBy('date', 'asc')
        );

        const snapshot = await getDocs(q);
        const meals = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        const mealsJson = JSON.stringify(meals, null, 2);

        // Query Gemini with meal data context
        const assistantText = await queryHealthData(userText, mealsJson);

        // Return in streaming format expected by frontend
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                const escaped = JSON.stringify(assistantText);
                controller.enqueue(encoder.encode(`0:${escaped}\n`));
                controller.enqueue(encoder.encode(`d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`));
                controller.close();
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Vercel-AI-Data-Stream': 'v1',
            },
        });

    } catch (error: any) {
        console.error('[health-chat] Error:', error);
        return new Response(
            JSON.stringify({ error: error.message || 'Failed to query health data' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
