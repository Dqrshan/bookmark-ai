"use client";

import React, { useState, useMemo } from 'react';
import { Search, Hash, ExternalLink, Sparkles, Loader2, X, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { AIAnalysisResult, CategorizedBookmark } from '@/lib/aiService';
import { ModeToggle } from '@/components/mode-toggle';

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
        <div className="flex h-screen w-full overflow-hidden bg-background relative">
            {/* Background decorative blob */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Mobile Overlay */}
            {isMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md lg:hidden"
                    onClick={() => setIsMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 transform border-r border-black/5 dark:border-white/5 bg-background/60 backdrop-blur-xl supports-backdrop-filter:bg-background/60 p-6 flex flex-col gap-6 overflow-y-auto transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-72 lg:shrink-0 ${isMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}`}>
                <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70 mb-4 px-2">Categories</h2>
                    <div className="space-y-1">
                        <button
                            onClick={() => { setSelectedCategory(null); clearAiSearch(); setIsMenuOpen(false); }}
                            className={`w-full flex items-center gap-3 text-sm px-3 py-2.5 rounded-xl transition-all duration-200 ${!selectedCategory && !aiResults ? 'bg-primary/15 text-primary font-semibold shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground'}`}
                        >
                            <Hash className="w-4 h-4 opacity-70" />
                            All Bookmarks
                        </button>
                        {data.categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setSelectedCategory(cat); clearAiSearch(); setIsMenuOpen(false); }}
                                className={`w-full flex items-center justify-between text-sm px-3 py-2.5 rounded-xl transition-all duration-200 ${selectedCategory === cat && !aiResults ? 'bg-primary/15 text-primary font-semibold shadow-[0_0_15px_rgba(var(--primary),0.1)]' : 'hover:bg-black/5 dark:hover:bg-white/5 text-muted-foreground hover:text-foreground group'}`}
                            >
                                <span className="truncate flex-1 text-left">{cat}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${selectedCategory === cat && !aiResults ? 'bg-primary/20 text-primary' : 'bg-muted/50 text-muted-foreground group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:text-foreground/70'}`}>
                                    {data.bookmarks.filter(b => b.category === cat).length}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0 bg-transparent h-screen relative z-10">

                {/* Header - AI Search (Primary) */}
                <header className="border-b border-black/5 dark:border-white/5 px-4 md:px-8 py-4 md:py-6 bg-background/40 backdrop-blur-2xl supports-backdrop-filter:bg-background/20 z-10 sticky top-0 flex flex-col gap-4 shadow-sm">

                    <div className="flex items-center gap-3 w-full max-w-4xl mx-auto">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="lg:hidden shrink-0 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5"
                            onClick={() => setIsMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        <form onSubmit={handleAiSearch} className="relative flex-1 group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Sparkles className="h-5 w-5 text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                            </div>
                            <Input
                                value={aiQuery}
                                onChange={(e) => setAiQuery(e.target.value)}
                                placeholder="Ask AI to find exactly what you need (e.g. '3d icons')..."
                                className="pl-12 pr-24 md:pr-32 h-12 md:h-14 text-sm md:text-base rounded-2xl border-black/10 dark:border-white/10 shadow-inner focus-visible:ring-primary/30 focus-visible:border-primary/50 transition-all bg-black/5 hover:bg-black/10 dark:bg-black/20 dark:hover:bg-black/40 text-foreground placeholder:text-muted-foreground/50"
                                disabled={isAiSearching}
                            />
                            <div className="absolute inset-y-1.5 right-1.5 flex items-center gap-1">
                                {aiResults && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="rounded-xl h-9 w-9 md:h-11 md:w-11 hidden md:flex text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                        onClick={clearAiSearch}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                                <Button
                                    type="submit"
                                    size="sm"
                                    className="rounded-xl px-4 md:px-6 h-9 md:h-11 font-medium shadow-[0_0_15px_rgba(var(--primary),0.2)] hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all bg-primary text-primary-foreground"
                                    disabled={isAiSearching || !aiQuery.trim()}
                                >
                                    {isAiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <span className="hidden md:inline font-semibold">Search</span>}
                                    {!isAiSearching && <Sparkles className="md:hidden h-4 w-4" />}
                                </Button>
                            </div>
                        </form>
                    </div>

                    {/* Secondary Filters */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-1 max-w-4xl mx-auto w-full px-1">
                        <div className="relative w-full max-w-[200px] md:max-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-40" />
                            <Input
                                placeholder="Filter by title or URL..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); clearAiSearch(); }}
                                className="pl-9 h-9 text-xs rounded-xl bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 border-black/10 dark:border-white/5 focus-visible:ring-primary/20 transition-colors"
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
                        <ModeToggle />
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
                                        <Card key={idx} className={`group flex flex-col h-full bg-card/40 backdrop-blur-md rounded-2xl border-black/5 dark:border-white/5 hover:border-primary/40 hover:bg-black/2 dark:hover:bg-white/2 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 overflow-hidden ${aiResults ? 'ring-1 ring-primary/20 shadow-[0_0_15px_rgba(var(--primary),0.05)]' : ''}`}>
                                            <CardHeader className="p-5 pb-4">
                                                <CardTitle className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors leading-snug flex items-start gap-3">
                                                    <img
                                                        src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(bookmark.url)}&sz=64`}
                                                        alt="favicon"
                                                        className="w-5 h-5 rounded-sm shrink-0 mt-0.5 bg-background p-0.5 ring-1 ring-black/10 dark:ring-white/10"
                                                        onError={(e) => {
                                                            (e.target as HTMLImageElement).style.opacity = '0.3';
                                                        }}
                                                    />
                                                    <span className="line-clamp-2">{bookmark.title}</span>
                                                </CardTitle>
                                                <CardDescription className="flex items-center gap-2 mt-3">
                                                    <Badge variant="secondary" className="text-[10px] h-5 px-2.5 font-medium bg-muted/50 text-muted-foreground/80 hover:bg-muted/80 transition-colors border-0">
                                                        {bookmark.category}
                                                    </Badge>
                                                </CardDescription>
                                            </CardHeader>
                                            <div className="flex-1" />
                                            <CardFooter className="p-3 bg-black/2 dark:bg-white/2 border-t border-black/5 dark:border-white/5 mt-auto group-hover:bg-primary/2 transition-colors">
                                                <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-muted-foreground/70 hover:text-primary flex items-center gap-2 w-full truncate transition-colors px-2 py-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5">
                                                    <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity drop-shadow-sm" />
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
