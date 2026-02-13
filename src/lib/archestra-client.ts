export const ARCHESTRA_GATEWAY_URL = process.env.ARCHESTRA_GATEWAY_URL || 'http://localhost:9000';
export const ARCHESTRA_API_KEY = process.env.ARCHESTRA_API_KEY || '';

export const getArchestraHeaders = () => ({
    'Authorization': `Bearer ${ARCHESTRA_API_KEY}`,
    'Content-Type': 'application/json',
});
