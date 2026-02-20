"use client";

import React, { useCallback, useState } from 'react';
import { UploadCloud, FileCode } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FileUploadProps {
    onFileUpload: (fileContent: string) => void;
    isLoading: boolean;
}

export function FileUpload({ onFileUpload, isLoading }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

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

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            processFile(e.dataTransfer.files[0]);
            e.dataTransfer.clearData();
        }
    }, [onFileUpload]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            processFile(e.target.files[0]);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 items-center justify-center p-8 bg-card rounded-2xl border shadow-sm mt-20">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Import Bookmarks</h2>
                <p className="text-muted-foreground text-sm">Organize your web with AI</p>
            </div>

            <label
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors duration-200
          ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
          ${isLoading ? 'opacity-50 pointer-events-none' : ''}
        `}
            >
                <div className="flex flex-col items-center justify-center space-y-4 text-center p-6">
                    <div className="p-4 bg-secondary rounded-full">
                        {isLoading ?
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" /> :
                            <UploadCloud className="w-8 h-8 text-muted-foreground" />
                        }
                    </div>
                    <div>
                        <p className="font-semibold text-sm">
                            {isLoading ? 'Processing bookmarks...' : 'Click to upload or drag and drop'}
                        </p>
                        {!isLoading && <p className="text-xs text-muted-foreground mt-1">Netscape .html format exported from browsers</p>}
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

            <div className="text-center max-w-sm">
                <p className="text-xs text-muted-foreground leading-relaxed flex items-start gap-2">
                    <FileCode className="w-4 h-4 shrink-0" />
                    Note: Direct browser bookmark fetching is restricted. Please export your bookmarks to an HTML file first.
                </p>
            </div>
        </div>
    );
}
