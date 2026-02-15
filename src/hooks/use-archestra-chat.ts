export const PERSONAS: Record<string, string> = {
    finance: process.env.NEXT_PUBLIC_FINANCE_AGENT_ID || '',
    weather: process.env.NEXT_PUBLIC_WEATHER_AGENT_ID || '',
    general: process.env.NEXT_PUBLIC_GENERAL_AGENT_ID || '',
};
