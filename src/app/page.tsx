"use client";

import { useState, useEffect } from "react";
import { FileUpload } from "@/components/FileUpload";
import { Dashboard } from "@/components/Dashboard";
import { AIAnalysisResult } from "@/lib/aiService";
import { parseBookmarksHtml } from "@/lib/bookmarkParser";
import { AlertCircle, Github, Star } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    fetch("https://api.github.com/repos/Dqrshan/bookmark-ai")
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.stargazers_count === "number") {
          setStars(data.stargazers_count);
        }
      })
      .catch((e) => console.error("Could not fetch stars", e));
  }, []);

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
    <main className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden selection:bg-primary/30">

      <div className="absolute top-4 right-4 z-50">
        <ModeToggle />
      </div>

      {/* Background radial gradient decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center space-y-8 mt-12 mb-8"
      >
        <motion.a
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          href="https://github.com/Dqrshan/bookmark-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/40 border border-white/5 hover:bg-muted/80 backdrop-blur-md transition-all group shadow-sm hover:shadow-primary/10"
        >
          <Github className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          <span className="text-sm font-medium tracking-tight">Star on GitHub</span>
          {stars !== null && (
            <div className="flex items-center gap-1 pl-2 border-l border-white/10 text-muted-foreground">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span className="text-xs font-semibold">{stars}</span>
            </div>
          )}
        </motion.a>

        <div className="space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.7 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-br from-foreground via-foreground to-foreground/40 pb-2"
          >
            Your Bookmarks, <br />
            <span className="text-primary opacity-90 inline-block align-top mt-1">Supercharged by AI</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Stop losing links in the void. Upload your messy exports and let our semantic engine categorize, search, and recall the exact resource you need.
          </motion.p>
        </div>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="w-full max-w-2xl mb-6 items-center"
          >
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive-foreground backdrop-blur-sm">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error processing file</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full max-w-2xl"
      >
        <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
      </motion.div>

    </main>
  );
}
