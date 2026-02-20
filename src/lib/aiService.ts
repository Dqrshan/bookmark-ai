import { Bookmark } from './bookmarkParser';

export interface CategorizedBookmark extends Bookmark {
    category: string;
}

export interface AIAnalysisResult {
    categories: string[];
    bookmarks: CategorizedBookmark[];
}

const NIM_API_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';
const MODEL = 'meta/llama-3.1-70b-instruct'; // Can be swapped to 8b or 405b

export async function analyzeBookmarks(
    bookmarks: Bookmark[],
    apiKey: string
): Promise<AIAnalysisResult> {
    // Only process up to a certain limit to avoid massive context size & timeouts.
    const limit = 100;
    const processedBookmarks = bookmarks.slice(0, limit).map((b, index) => ({
        id: index,
        title: b.title,
        url: b.url
    }));

    const systemPrompt = `You are an expert AI bookmark organizer and analyzer. 
I will provide a JSON list of bookmarks, each with an 'id', 'title', and 'url'. Your task is to:
1. Group them into 3 to 6 logical and specific categories based on their titles and URLs.

You MUST respond strictly with a valid JSON document matching this structure:
{
  "categories": ["Category A", "Category B", ...],
  "bookmarks": [
    {
      "id": 0,
      "category": "One of your specific categories"
    }
  ]
}
Include an entry in "bookmarks" for EVERY 'id' provided. Do NOT include markdown block characters like \`\`\`json. Reply ONLY with the raw JSON object.`;

    const response = await fetch(NIM_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(processedBookmarks) }
            ],
            temperature: 0.2,
            max_tokens: 4000,
            response_format: { type: "json_object" } // Assumes Llama 3.1 70B on NIM supports JSON mode
        }),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error('NIM API Error:', errText);
        throw new Error('Failed to analyze bookmarks with NVIDIA NIM API.');
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;

    try {
        let parsed;
        try {
            parsed = JSON.parse(rawContent);
        } catch (e) {
            // Attempt a naive repair if JSON was abruptly truncated
            let fixedContent = rawContent.trim();
            if (!fixedContent.endsWith('}')) {
                if (!fixedContent.endsWith(']')) {
                    if (fixedContent.endsWith('"')) fixedContent += '}';
                    else fixedContent += '"]}';
                } else {
                    fixedContent += '}';
                }
            }
            try {
                parsed = JSON.parse(fixedContent);
            } catch (inner) {
                // In worst case, try stripping to the last valid object in the array
                const lastValidObj = fixedContent.lastIndexOf('}');
                if (lastValidObj > 0) {
                    parsed = JSON.parse(fixedContent.substring(0, lastValidObj + 1) + ']}');
                } else {
                    throw inner;
                }
            }
        }

        const validBookmarks: CategorizedBookmark[] = (parsed.bookmarks || [])
            .map((b: any) => {
                if (typeof b.id !== 'number' || !processedBookmarks[b.id]) return null;
                const orig = bookmarks[b.id];
                return {
                    ...orig,
                    category: b.category || 'Uncategorized',
                };
            })
            .filter(Boolean) as CategorizedBookmark[];

        // Add back any bookmarks that AI might have accidentally dropped
        const returnedUrls = new Set(validBookmarks.map(b => b.url));
        const unreturnedBookmarks = processedBookmarks
            .filter(b => !returnedUrls.has(b.url))
            .map(b => {
                const orig = bookmarks[b.id];
                return {
                    ...orig,
                    category: 'Other',
                };
            });

        return {
            categories: Array.from(new Set([...(parsed.categories || []), 'Other'])),
            bookmarks: [...validBookmarks, ...unreturnedBookmarks],
        };

    } catch (error) {
        console.error('JSON Parse Error for AI output:', rawContent);
        throw new Error('AI returned an invalid or incomplete response format.');
    }
}

export async function askAI(
    query: string,
    bookmarks: CategorizedBookmark[],
    apiKey: string
): Promise<CategorizedBookmark[]> {
    const limit = 200; // Increased limit for search
    const processedBookmarks = bookmarks.slice(0, limit).map((b, index) => ({
        id: index,
        title: b.title,
        url: b.url,
        category: b.category
    }));

    const systemPrompt = `You are an AI bookmark assistant. The user wants to find specific bookmarks from their collection based on a query.
I will provide a JSON list of bookmarks (each with an 'id') and the user's query.
Your task is to identify and return ONLY the IDs of the bookmarks that are highly relevant to the query.

You MUST respond STRICTLY with a valid JSON document matching this exact structure:
{
  "relevantIds": [0, 5, 12]
}
Do NOT include markdown block characters like \`\`\`json. Reply ONLY with the raw JSON object. If none match, return an empty array.`;

    const response = await fetch(NIM_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            model: MODEL,
            messages: [
                { role: 'system', content: systemPrompt },
                {
                    role: 'user', content: JSON.stringify({
                        query: query,
                        bookmarks: processedBookmarks
                    })
                }
            ],
            temperature: 0.1,
            max_tokens: 1000,
            response_format: { type: "json_object" }
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to search bookmarks with NVIDIA NIM API.');
    }

    const data = await response.json();
    const rawContent = data.choices[0]?.message?.content;

    try {
        const parsed = JSON.parse(rawContent);
        const relevantIds: number[] = Array.isArray(parsed.relevantIds) ? parsed.relevantIds : [];

        return relevantIds
            .filter(id => typeof id === 'number' && id >= 0 && id < processedBookmarks.length)
            .map(id => bookmarks[id]);
    } catch (err) {
        console.error('JSON Parse Error for AI output:', rawContent);
        throw new Error('AI returned an invalid response format.');
    }
}
