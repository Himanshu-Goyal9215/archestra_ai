export const PERSONAS: Record<string, string> = {
    shopping: process.env.NEXT_PUBLIC_SHOPPING_AGENT_ID || '',
    finance: process.env.NEXT_PUBLIC_FINANCE_AGENT_ID || '',
    weather: process.env.NEXT_PUBLIC_WEATHER_AGENT_ID || '',
};
