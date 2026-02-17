import { queryHealthData } from "@/app/actions/health";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, orderBy } from "firebase/firestore";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
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
