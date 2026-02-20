"use client";

import React, { useState, useMemo } from 'react';
import { Search, Hash, ExternalLink, Sparkles, Loader2, X, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AIAnalysisResult, CategorizedBookmark } from '@/lib/aiService';

interface DashboardProps {
    data: AIAnalysisResult;
}

export function Dashboard({ data }: DashboardProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    // Mobile Menu State
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // AI Search State
    const [aiQuery, setAiQuery] = useState('');
    const [isAiSearching, setIsAiSearching] = useState(false);
    const [aiResults, setAiResults] = useState<CategorizedBookmark[] | null>(null);

    const handleAiSearch = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!aiQuery.trim()) return;

        setIsAiSearching(true);
        setAiResults(null);
        try {
            const res = await fetch('/api/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: aiQuery, bookmarks: data.bookmarks }),
            });

            if (!res.ok) throw new Error('Search failed');
            const { relevantBookmarks } = await res.json();
            setAiResults(relevantBookmarks);
        } catch (err) {
            console.error(err);
            alert("AI Search failed. Please try again.");
        } finally {
            setIsAiSearching(false);
        }
    };

    const clearAiSearch = () => {
        setAiQuery('');
        setAiResults(null);
    };

    const displayedBookmarks = useMemo(() => {
        if (aiResults) return aiResults;

        return data.bookmarks.filter(b => {
            const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                b.url.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory ? b.category === selectedCategory : true;
            return matchesSearch && matchesCategory;
        });
    }, [data.bookmarks, searchQuery, selectedCategory, aiResults]);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Mobile Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80 p-6 flex flex-col gap-6 overflow-y-auto transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:bg-muted/30 lg:shrink-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div>
                    <h2 className="text-lg font-semibold tracking-tight mb-4">Categories</h2>
                    <div className="space-y-1">
                        <button
                            onClick={() => { setSelectedCategory(null); clearAiSearch(); setIsMenuOpen(false); }}
                            className={`w-full flex items-center gap-2 text-sm px-3 py-2 rounded-md transition-colors ${!selectedCategory && !aiResults ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                        >
                            <Hash className="w-4 h-4" />
                            All Bookmarks
                        </button>
                        {data.categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); clearAiSearch(); setIsMenuOpen(false); }}
                                className={`w-full flex items-center justify-between text-sm px-3 py-2 rounded-md transition-colors ${selectedCategory === cat && !aiResults ? 'bg-primary text-primary-foreground font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                            >
                                <span className="truncate">{cat}</span>
                                <span className="text-xs opacity-60">
                                    {data.bookmarks.filter(b => b.category === cat).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-background h-screen">

                {/* Header - AI Search (Primary) */}
                <header className="border-b px-4 md:px-8 py-4 md:py-6 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 z-10 sticky top-0 flex flex-col gap-3 shadow-sm">

                    <div className="flex items-center gap-2 w-full max-w-3xl">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="lg:hidden shrink-0 text-muted-foreground"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <form onSubmit={handleAiSearch} className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Sparkles className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                            </div>
                            <Input
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                placeholder="Ask AI (e.g. '3d icons')..."
                                className="pl-9 md:pl-10 pr-20 md:pr-24 h-10 md:h-12 text-sm md:text-base rounded-full border-primary/20 shadow-inner focus-visible:ring-primary/50 focus-visible:border-primary transition-all bg-muted/20 hover:bg-muted/40"
                                disabled={isAiSearching}
                            />
                            <div className="absolute inset-y-1 right-1 flex items-center">
                                {aiResults && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-full h-8 w-8 md:h-10 md:w-10 mr-1 hidden md:flex text-muted-foreground hover:text-foreground"
                                        onClick={clearAiSearch}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="rounded-full px-3 md:px-4 h-8 md:h-10 font-medium"
                                    disabled={isAiSearching || !aiQuery.trim()}
                                >
                                    {isAiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="hidden md:inline">Search</span>}
                                    {!isAiSearching && <Sparkles className="md:hidden h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Secondary Filters */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1">
                        <div className="relative w-full max-w-[200px] md:max-w-[256px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 opacity-50" />
                            <Input
                                placeholder="Title/URL filter..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); clearAiSearch(); }}
                                className="pl-8 h-8 text-xs bg-muted/30 border-dashed"
                            />
                        </div>
                        <span className="ml-auto opacity-70 whitespace-nowrap text-xs md:text-sm">
                            {displayedBookmarks.length} result{displayedBookmarks.length !== 1 ? 's' : ''}
                        </span>
                        {aiResults && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="md:hidden h-8 px-2 text-xs"
                                onClick={clearAiSearch}
                            >
                                Clear AI
                            </Button>
                        )}
                    </div>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 relative">
                    <div className="max-w-6xl mx-auto space-y-6 pb-20">

                        <section className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold tracking-tight flex items-center gap-2">
                                    {aiResults ? (
                                        <>
                                            <Sparkles className="h-5 w-5 text-primary" />
                                            AI Search Results
                                        </>
                                    ) : (
                                        selectedCategory ? `${selectedCategory} Bookmarks` : 'All Bookmarks'
                                    )}
                                </h3>
                            </div>

                            {displayedBookmarks.length === 0 ? (
                                <div className="text-center py-32 text-muted-foreground border rounded-2xl bg-muted/10 border-dashed flex flex-col items-center justify-center space-y-3">
                                    <div className="p-4 bg-muted/30 rounded-full">
                                        <Search className="h-8 w-8 opacity-40" />
                                    </div>
                                    <p>No bookmarks found matching your criteria.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {displayedBookmarks.map((bookmark, idx) => (
                                        <Card key={idx} className={`hover:shadow-md hover:border-primary/30 transition-all group flex flex-col h-full bg-card ${aiResults ? 'border-primary/20 bg-primary/2' : ''}`}>
                                            <CardHeader className="p-4 pb-3">
                                                <CardTitle className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                                                    {bookmark.title}
                                                </CardTitle>
                                                <CardDescription className="text-xs truncate flex items-center gap-2 mt-2">
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-2 font-medium bg-muted/50">{bookmark.category}</Badge>
                                                </CardDescription>
                                            </CardHeader>
                                            <div className="flex-1" />
                                            <CardFooter className="p-3 pt-3 border-t bg-muted/5 mt-auto">
                                                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center gap-1.5 w-full truncate transition-colors px-1 py-1 rounded-sm">
                                                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                                                    <span className="truncate">{bookmark.url}</span>
                                                </a>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </section>

                    </div>
                </div>
            </main>
        </div>
    );
}
