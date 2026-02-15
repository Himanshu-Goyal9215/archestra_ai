export const PERSONAS: Record<string, string> = {
    finance: process.env.NEXT_PUBLIC_FINANCE_AGENT_ID || '',
    weather: process.env.NEXT_PUBLIC_WEATHER_AGENT_ID || '',
    schedule: process.env.NEXT_PUBLIC_SCHEDULE_AGENT_ID || '', // Schedule Agent
    health: process.env.NEXT_PUBLIC_HEALTH_AGENT_ID || '', // Health Agent
    general: process.env.NEXT_PUBLIC_GENERAL_AGENT_ID || '',
};
