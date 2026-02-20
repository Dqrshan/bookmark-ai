import { NextResponse } from 'next/server';
import { askAI, CategorizedBookmark } from '@/lib/aiService';

export async function POST(req: Request) {
    try {
        const apiKey = process.env.NVIDIA_NIM_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'NVIDIA_NIM_API_KEY is not configured.' }, { status: 500 });
        }

        const { query, bookmarks } = await req.json() as { query: string, bookmarks: CategorizedBookmark[] };
        if (!query || !bookmarks || !Array.isArray(bookmarks)) {
            return NextResponse.json({ error: 'Invalid query or bookmarks data provided.' }, { status: 400 });
        }

        const result = await askAI(query, bookmarks, apiKey);
        return NextResponse.json({ relevantBookmarks: result });
    } catch (error: any) {
        console.error('API Route Error:', error);
        return NextResponse.json({ error: error.message || 'An unexpected error occurred.' }, { status: 500 });
    }
}
