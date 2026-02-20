"use client";

import { useState } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Dashboard } from "@/components/Dashboard";
import { AIAnalysisResult } from "@/lib/aiService";
import { parseBookmarksHtml } from "@/lib/bookmarkParser";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (htmlString: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedBookmarks = parseBookmarksHtml(htmlString);

      if (parsedBookmarks.length === 0) {
        throw new Error("No bookmarks found in the uploaded file.");
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarks: parsedBookmarks }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to analyze bookmarks.");
      }

      const data = await res.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (analysisResult) {
    return <Dashboard data={analysisResult} />;
  }

  return (
    <main className="min-h-screen bg-muted/20 flex flex-col items-center justify-center p-4">

      <div className="w-full max-w-2xl mb-8 text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
          <span className="text-4xl">📚</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">AI Bookmark Analyzer</h1>
        <p className="text-muted-foreground text-lg md:text-xl max-w-xl mx-auto">
          Upload your exported browser bookmarks and let AI organize, categorize, and find the absolute best resources for you in seconds.
        </p>
      </div>

      {error && (
        <Alert variant="destructive" className="max-w-2xl mb-6 bg-destructive/10">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />

    </main>
  );
}
