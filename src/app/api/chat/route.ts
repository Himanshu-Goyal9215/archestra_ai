import { streamText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';

// Create a custom OpenAI provider instance pointing to Archestra Gateway
const archestra = createOpenAI({
    baseURL: process.env.ARCHESTRA_GATEWAY_URL || 'http://localhost:9000/v1',
    apiKey: process.env.ARCHESTRA_API_KEY || 'dev-key',
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    // Manual conversion if convertToCoreMessages is missing/failing types
    const coreMessages = messages.map((m: any) => ({
        role: m.role,
        content: m.content,
    }));

    const result = await streamText({
        model: archestra('gpt-4-turbo'),
        messages: coreMessages,
    });

    // @ts-expect-error - toDataStreamResponse might be missing in types but likely exists in runtime for v3 protocol
    return result.toDataStreamResponse ? result.toDataStreamResponse() : result.toTextStreamResponse();
}
