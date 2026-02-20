import { NextResponse } from 'next/server';
import { analyzeBookmarks } from '@/lib/aiService';
import { Bookmark } from '@/lib/bookmarkParser';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.NVIDIA_NIM_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'NVIDIA_NIM_API_KEY is not configured.' }, { status: 500 });
        }

        const { bookmarks } = await req.json() as { bookmarks: Bookmark[] };
        if (!bookmarks || !Array.isArray(bookmarks)) {
            return NextResponse.json({ error: 'Invalid bookmarks data provided.' }, { status: 400 });
        }

        const result = await analyzeBookmarks(bookmarks, apiKey);
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}
