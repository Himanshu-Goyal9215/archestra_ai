import { useChat } from '@ai-sdk/react';

export const PERSONAS = {
    shopping: '107c6fa2-da65-4477-a369-29ef6c55ddb8',
};

export function useArchestraChat(agentId: string) {
    return useChat({
        api: '/api/chat',
        body: { agentId },
    } as any);
}
