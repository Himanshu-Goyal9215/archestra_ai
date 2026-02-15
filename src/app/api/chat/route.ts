// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

export async function POST(req: Request) {
    const body = await req.json();
    const { messages } = body;

    // useChat may nest body params differently depending on AI SDK version
    const agentId = body.agentId || body.body?.agentId || '';

    const gatewayBase = (process.env.ARCHESTRA_GATEWAY_URL || 'http://localhost:9000/v1').replace(/\/v1\/?$/, '');
    const apiKey = process.env.ARCHESTRA_API_KEY || 'dev-key';

    // Extract the last user message
    const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user');
    const userText = lastUserMessage?.content || 'Hello';

    // Use the A2A endpoint which is the working endpoint
    const a2aUrl = `${gatewayBase}/v1/a2a/${agentId}`;

    console.log(`[chat/route] Body keys: ${JSON.stringify(Object.keys(body))}`);
    console.log(`[chat/route] Resolved agentId: ${agentId}`);
    console.log(`[chat/route] Sending to A2A: ${a2aUrl}`);

    try {
        const response = await fetch(a2aUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'message/send',
                params: {
                    message: {
                        parts: [{ kind: 'text', text: userText }],
                    },
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[chat/route] A2A error: ${response.status} ${errorText}`);
            return new Response(
                JSON.stringify({ error: `A2A request failed: ${response.status}` }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const data = await response.json();

        // Extract the assistant's response text from the A2A JSON-RPC result
        let assistantText = '';
        const result = data?.result;

        if (result?.content?.parts) {
            // Standard A2A response format
            assistantText = result.content.parts
                .filter((p: any) => p.kind === 'text')
                .map((p: any) => p.text)
                .join('\n');
        } else if (result?.parts) {
            assistantText = result.parts
                .filter((p: any) => p.kind === 'text')
                .map((p: any) => p.text)
                .join('\n');
        } else if (typeof result === 'string') {
            assistantText = result;
        } else {
            // Fallback: stringify the entire result
            assistantText = JSON.stringify(result, null, 2);
        }

        if (!assistantText) {
            assistantText = 'No response received from the agent.';
        }

        // Return as a streaming text response compatible with our frontend parser
        const encoder = new TextEncoder();
        const stream = new ReadableStream({
            start(controller) {
                // Send the entire text as a single data stream message
                // Format: 0:"text"\n — preserves all newlines and markdown formatting
                const escaped = JSON.stringify(assistantText);
                controller.enqueue(encoder.encode(`0:${escaped}\n`));
                // Send finish message
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
        console.error(`[chat/route] Error:`, error);
        return new Response(
            JSON.stringify({ error: error.message || 'Internal Server Error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
