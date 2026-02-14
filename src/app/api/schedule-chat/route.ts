import { generateText, stepCountIs } from 'ai';
import { google } from '@ai-sdk/google';
import { z } from 'zod';
import { getEvents, addEvent, updateEvent, deleteEvent } from '@/lib/schedule-store';

export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

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
                        const events = getEvents(date);
                        return { events, count: events.length };
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
                        const event = addEvent({ title, date, time, description });
                        return { success: true, event };
                    },
                },
                deleteEvent: {
                    description: 'Delete an event by its ID',
                    inputSchema: z.object({
                        id: z.string().describe('ID of the event to delete'),
                    }),
                    execute: async ({ id }: { id: string }) => {
                        const deleted = deleteEvent(id);
                        return { success: deleted };
                    },
                },
                toggleComplete: {
                    description: 'Mark an event as completed or not completed',
                    inputSchema: z.object({
                        id: z.string().describe('ID of the event'),
                        completed: z.boolean().describe('Whether the event is completed'),
                    }),
                    execute: async ({ id, completed }: { id: string; completed: boolean }) => {
                        const updated = updateEvent(id, { completed });
                        return { success: !!updated, event: updated };
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
                        const filtered = Object.fromEntries(
                            Object.entries(updates).filter(([, v]) => v !== undefined)
                        );
                        const updated = updateEvent(id, filtered);
                        return { success: !!updated, event: updated };
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

