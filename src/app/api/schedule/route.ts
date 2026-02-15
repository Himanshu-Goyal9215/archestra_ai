import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, query, where, getDocs, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, getDoc } from "firebase/firestore";

// Firebase Config (Ideally import from lib/firebase but health-chat inits locally, so matching pattern)
// We should probably export the app instance from lib/firebase to avoid duplication, but sticking to working pattern for now.
const firebaseConfig = {
    apiKey: "AIzaSyAL7PJQF2LmLHfU6IY2HO5QN7es44qH9lE",
    authDomain: "personal-assistant-85a0e.firebaseapp.com",
    projectId: "personal-assistant-85a0e",
    storageBucket: "personal-assistant-85a0e.firebasestorage.app",
    messagingSenderId: "568287775887",
    appId: "1:568287775887:web:8e1647d7fd0bda8e6db4fa",
    measurementId: "G-1LWZPQ72J8",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

const EVENTS_COLLECTION = 'events';

export async function GET(req: NextRequest) {
    const userId = req.nextUrl.searchParams.get('userId');
    const date = req.nextUrl.searchParams.get('date');

    if (!userId) {
        return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    try {
        let q;
        if (date) {
            // Get events for specific date
            q = query(
                collection(db, EVENTS_COLLECTION),
                where('userId', '==', userId),
                where('date', '==', date)
            );
        } else {
            // Get all events for user (usually max 100 or for month view)
            // For now, getting all. In prod, use start/end date range.
            q = query(
                collection(db, EVENTS_COLLECTION),
                where('userId', '==', userId)
            );
        }

        const snapshot = await getDocs(q);
        const events = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(events);
    } catch (error: any) {
        console.error('Error fetching events:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, date, time, description, userId } = body;

        if (!title || !date || !time || !userId) {
            return NextResponse.json(
                { error: 'userId, title, date, and time are required' },
                { status: 400 }
            );
        }

        const newEvent = {
            userId,
            title,
            date,
            time,
            description: description || '',
            completed: false,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, EVENTS_COLLECTION), newEvent);

        return NextResponse.json({ id: docRef.id, ...newEvent }, { status: 201 });
    } catch (err: any) {
        console.error('Error adding event:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const body = await req.json();
        const { id, userId, ...updates } = body;

        if (!id || !userId) {
            return NextResponse.json({ error: 'id and userId are required' }, { status: 400 });
        }

        // Verify ownership (optional but recommended in backend)
        const docRef = doc(db, EVENTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (docSnap.data().userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await updateDoc(docRef, updates);

        return NextResponse.json({ id, ...docSnap.data(), ...updates });
    } catch (err: any) {
        console.error('Error updating event:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    const id = req.nextUrl.searchParams.get('id');
    const userId = req.nextUrl.searchParams.get('userId');

    if (!id || !userId) {
        return NextResponse.json({ error: 'id and userId are required' }, { status: 400 });
    }

    try {
        const docRef = doc(db, EVENTS_COLLECTION, id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        if (docSnap.data().userId !== userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await deleteDoc(docRef);

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error('Error deleting event:', err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
