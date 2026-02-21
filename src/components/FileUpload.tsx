"use client";

import React, { useState, useEffect } from 'react';
import { UploadCloud, FileCode, HelpCircle } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from 'framer-motion';

interface FileUploadProps {
    onFileUpload: (fileContent: string) => void;
    isLoading: boolean;
}

const loadingMessages = [
    "Processing bookmarks...",
    "Analyzing semantic content...",
    "Categorizing by topic...",
    "Finding the best links...",
    "Almost done..."
];

export function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLoading) {
            interval = setInterval(() => {
                setLoadingMessageIndex((prev) => (prev + 1) % loadingMessages.length);
            }, 2000);
        }
        return () => {
            if (interval) clearInterval(interval);
            if (!isLoading) setLoadingMessageIndex(0); // only reset on unmount or when isLoading turns false (inside cleanup)
        };
    }, [isLoading]);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const processFile = (file: File) => {
        if (!file || file.type !== 'text/html') {
            alert("Please upload a valid .html bookmarks file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target?.result;
            if (typeof result === 'string') {
                onFileUpload(result);
            }
        };
        reader.readAsText(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 items-center justify-center p-8 bg-card/60 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl mt-8">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground/90">Import Bookmarks</h2>
                <div className="flex items-center justify-center gap-2">
                    <p className="text-muted-foreground text-sm font-medium">Organize your web with AI</p>
                </div>
            </div>

            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300
          ${isDragging ? 'border-primary bg-primary/10 scale-[1.02]' : 'border-border/60 hover:border-primary/50 hover:bg-white/2'}
          ${isLoading ? 'opacity-50 pointer-events-none scale-95' : ''}
        `}
            >
                <div className="flex flex-col items-center justify-center space-y-4 text-center p-6 h-full w-full relative">
                    <div className="p-4 bg-muted/50 rounded-full ring-1 ring-white/10 shadow-inner">
                        {isLoading ?
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /> :
                            <UploadCloud className="w-8 h-8 text-primary/80" />
                        }
                    </div>
                    <div className="h-10 w-full relative flex items-center justify-center">
                        <AnimatePresence mode="wait">
                            {isLoading ? (
                                <motion.p
                                    key={loadingMessageIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                    className="font-semibold text-sm text-foreground/80 absolute"
                                >
                                    {loadingMessages[loadingMessageIndex]}
                                </motion.p>
                            ) : (
                                <motion.div
                                    key="upload-text"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute flex flex-col items-center"
                                >
                                    <p className="font-semibold text-sm text-foreground/80">
                                        Click to upload or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground/70 mt-1">Netscape .html format exported from browsers</p>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
                <input
                    type="file"
                    accept=".html,text/html"
                    onChange={handleChange}
                    className="hidden"
                    disabled={isLoading}
                />
            </label>

            <div className="w-full text-left space-y-4">
                <Accordion type="single" collapsible className="w-full bg-black/5 dark:bg-black/10 text-foreground border border-black/10 dark:border-white/5 rounded-xl px-4">
                    <AccordionItem value="how-to-export" className="border-b-0">
                        <AccordionTrigger className="text-sm font-medium text-muted-foreground hover:text-foreground hover:no-underline flex items-center gap-2 py-3">
                            <div className="flex items-center gap-2">
                                <HelpCircle className="w-4 h-4" />
                                How to export bookmarks?
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                            <div className="text-xs space-y-2 text-muted-foreground pt-1 pb-2">
                                <ul className="list-disc pl-6 space-y-1.5 marker:text-primary/50">
                                    <li><strong>Chrome:</strong> Bookmark Manager <span className="text-[10px]">&rarr;</span> 3 dots <span className="text-[10px]">&rarr;</span> Export</li>
                                    <li><strong>Firefox:</strong> Bookmarks <span className="text-[10px]">&rarr;</span> Manage Bookmarks <span className="text-[10px]">&rarr;</span> Import and Backup <span className="text-[10px]">&rarr;</span> Export to HTML</li>
                                    <li><strong>Safari:</strong> File <span className="text-[10px]">&rarr;</span> Export <span className="text-[10px]">&rarr;</span> Bookmarks</li>
                                </ul>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
                <div className="text-center max-w-sm mx-auto">
                    <p className="text-xs text-muted-foreground/70 leading-relaxed flex flex-col items-center gap-1 justify-center">
                        <FileCode className="w-4 h-4" />
                        Direct browser bookmark fetching is restricted. Please export to HTML first.
                    </p>
                </div>
            </div>
        </div>
    );
}
