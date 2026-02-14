import fs from 'fs';
import path from 'path';

export interface ScheduleEvent {
    id: string;
    title: string;
    date: string;       // YYYY-MM-DD
    time: string;       // HH:mm
    description?: string;
    completed: boolean;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'schedule.json');

function ensureFile() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]', 'utf-8');
}

export function getEvents(dateFilter?: string): ScheduleEvent[] {
    ensureFile();
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const events: ScheduleEvent[] = JSON.parse(raw);
    if (dateFilter) return events.filter(e => e.date === dateFilter);
    return events;
}

export function addEvent(event: Omit<ScheduleEvent, 'id' | 'completed'>): ScheduleEvent {
    const events = getEvents();
    const newEvent: ScheduleEvent = {
        ...event,
        id: Date.now().toString(),
        completed: false,
    };
    events.push(newEvent);
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
    return newEvent;
}

export function updateEvent(id: string, updates: Partial<ScheduleEvent>): ScheduleEvent | null {
    const events = getEvents();
    const idx = events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    events[idx] = { ...events[idx], ...updates, id }; // preserve id
    fs.writeFileSync(DATA_FILE, JSON.stringify(events, null, 2), 'utf-8');
    return events[idx];
}

export function deleteEvent(id: string): boolean {
    const events = getEvents();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;
    fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
}
