import { NextRequest, NextResponse } from 'next/server';
import { getEvents, addEvent, updateEvent, deleteEvent } from '@/lib/schedule-store';

export async function GET(req: NextRequest) {
    const date = req.nextUrl.searchParams.get('date') || undefined;
    const events = getEvents(date);
    return NextResponse.json(events);
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, date, time, description } = body;

        if (!title || !date || !time) {
            return NextResponse.json(
                { error: 'title, date, and time are required' },
                { status: 400 }
            );
        }

        const event = addEvent({ title, date, time, description });
        return NextResponse.json(event, { status: 201 });
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, ...updates } = body;

        if (!id) {
            return NextResponse.json({ error: 'id is required' }, { status: 400 });
        }

        const updated = updateEvent(id, updates);
        if (!updated) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        return NextResponse.json(updated);
    } catch (err: any) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const deleted = deleteEvent(id);
    if (!deleted) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
}
