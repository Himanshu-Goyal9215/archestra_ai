import { generateText, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";

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

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages, userId } = await req.json();

    if (!userId) {
        return Response.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const result = await generateText({
            model: google('gemini-2.5-flash'),
            system: `You are a helpful Schedule Assistant. You help users manage their daily schedule and tasks.

When a user asks to add, view, delete, or modify events/tasks, use the provided tools.
When showing events to the user, format them nicely with time in 12-hour format.
Today's date is ${new Date().toISOString().split('T')[0]}.
Always confirm what you did after performing an action.
Be concise and friendly.`,
            messages,
            tools: {
                getSchedule: {
                    description: 'Get all scheduled events, optionally filtered by date (YYYY-MM-DD format)',
                    inputSchema: z.object({
                        date: z.string().optional().describe('Date to filter events by, in YYYY-MM-DD format'),
                    }),
                    execute: async ({ date }: { date?: string }) => {
                        try {
                            let q;
                            if (date) {
                                q = query(collection(db, 'events'), where('userId', '==', userId), where('date', '==', date));
                            } else {
                                q = query(collection(db, 'events'), where('userId', '==', userId));
                            }
                            const snapshot = await getDocs(q);
                            const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                            return { events, count: events.length };
                        } catch (e: any) { return { error: e.message }; }
                    },
                },
                addEvent: {
                    description: 'Add a new event/task to the schedule',
                    inputSchema: z.object({
                        title: z.string().describe('Title of the event'),
                        date: z.string().describe('Date of the event in YYYY-MM-DD format'),
                        time: z.string().describe('Time of the event in HH:mm (24-hour) format'),
                        description: z.string().optional().describe('Optional description'),
                    }),
                    execute: async ({ title, date, time, description }: { title: string; date: string; time: string; description?: string }) => {
                        try {
                            const newEvent = { userId, title, date, time, description: description || '', completed: false, createdAt: serverTimestamp() };
                            const docRef = await addDoc(collection(db, 'events'), newEvent);
                            return { success: true, event: { id: docRef.id, ...newEvent } };
                        } catch (e: any) { return { error: e.message }; }
                    },
                },
                deleteEvent: {
                    description: 'Delete an event by its ID',
                    inputSchema: z.object({
                        id: z.string().describe('ID of the event to delete'),
                    }),
                    execute: async ({ id }: { id: string }) => {
                        try {
                            // Ideally verify ownership first
                            await deleteDoc(doc(db, 'events', id));
                            return { success: true };
                        } catch (e: any) { return { error: e.message }; }
                    },
                },
                toggleComplete: {
                    description: 'Mark an event as completed or not completed',
                    inputSchema: z.object({
                        id: z.string().describe('ID of the event'),
                        completed: z.boolean().describe('Whether the event is completed'),
                    }),
                    execute: async ({ id, completed }: { id: string; completed: boolean }) => {
                        try {
                            await updateDoc(doc(db, 'events', id), { completed });
                            return { success: true, event: { id, completed } };
                        } catch (e: any) { return { error: e.message }; }
                    },
                },
                updateEvent: {
                    description: 'Update an existing event (title, time, date, or description)',
                    inputSchema: z.object({
                        id: z.string().describe('ID of the event to update'),
                        title: z.string().optional().describe('New title'),
                        date: z.string().optional().describe('New date in YYYY-MM-DD format'),
                        time: z.string().optional().describe('New time in HH:mm format'),
                        description: z.string().optional().describe('New description'),
                    }),
                    execute: async ({ id, ...updates }: { id: string; title?: string; date?: string; time?: string; description?: string }) => {
                        try {
                            const filtered = Object.fromEntries(Object.entries(updates).filter(([, v]) => v !== undefined));
                            await updateDoc(doc(db, 'events', id), filtered);
                            return { success: true, event: { id, ...filtered } };
                        } catch (e: any) { return { error: e.message }; }
                    },
                },
            },
            stopWhen: stepCountIs(5),
        });

        const assistantText = result.text || 'Done!';

        // Return in the same streaming format the chat interface expects
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
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    } catch (error: any) {
        console.error('Schedule chat error:', error);
        const errorMsg = error?.message || error?.toString() || 'Unknown error';
        const errorData = error?.data ? JSON.stringify(error.data) : '';
        return Response.json(
            { error: `LLM Error: ${errorMsg}`, details: errorData },
            { status: 500 }
        );
    }
}

