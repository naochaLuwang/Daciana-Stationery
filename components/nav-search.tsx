"use client"

import { useState, useEffect, useRef, useId } from "react"
import { Search, Loader2, X, Clock, Trash2, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function NavSearch() {
    const instanceId = useId()
    const [mounted, setMounted] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [recentSearches, setRecentSearches] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const router = useRouter()

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem("recently_viewed")
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) setRecentSearches(parsed.slice(0, 3))
            } catch {
                setRecentSearches([])
            }
        }
    }, [])

    const clearSearch = () => {
        setQuery("")
        setResults([])
        setIsOpen(false)
    }

    const clearHistory = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setRecentSearches([])
        localStorage.removeItem("recently_viewed")
    }

    const saveToHistory = (product: any) => {
        if (!product?.id) return
        const historyItem = {
            id: product.id,
            slug: product.slug,
            name: product.name,
            thumbnail_url: product.thumbnail_url,
        }
        const updated = [historyItem, ...recentSearches.filter((p) => p.id !== product.id)].slice(0, 3)
        setRecentSearches(updated)
        localStorage.setItem("recently_viewed", JSON.stringify(updated))
    }

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    useEffect(() => {
        if (!mounted) return
        if (query.trim().length < 2) {
            setResults([])
            setLoading(false)
            return
        }

        const fetchResults = async () => {
            setLoading(true)
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
                const data = await res.json()
                setResults(data.products || [])
            } catch {
                setResults([])
            }
            setLoading(false)
        }

        const debounce = setTimeout(fetchResults, 300)
        return () => clearTimeout(debounce)
    }, [query, mounted])

    const isSearching = query.trim().length >= 2
    const showHistory = !isSearching && recentSearches.length > 0

    return (
        <div className="relative w-full" ref={containerRef} suppressHydrationWarning>
            <div className="relative flex items-center bg-slate-50 rounded-full px-4 border border-slate-200 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-slate-200 focus-within:border-slate-300">
                <Search
                    className={`w-4 h-4 transition-colors ${loading ? "text-slate-300" : "text-slate-400"}`}
                />
                <Input
                    id={`search-input-${instanceId}`}
                    placeholder="Search products..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    className="h-9 w-full bg-transparent border-none rounded-none px-3 text-sm placeholder:text-slate-400 focus-visible:ring-0"
                    autoComplete="off"
                />
                <div className="flex items-center gap-2">
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    ) : query.length > 0 ? (
                        <button onClick={clearSearch} type="button" className="p-1 hover:bg-slate-100 rounded-full">
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    ) : null}
                </div>
            </div>

            {mounted && isOpen && (
                <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white shadow-xl border border-slate-200 z-[999] rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* LIVE SEARCH RESULTS */}
                    {isSearching ? (
                        <div className="flex flex-col">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                                <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                                    Products
                                </span>
                            </div>
                            {results.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {results.map((product: any) => (
                                        <Link
                                            key={`${instanceId}-live-${product.id}`}
                                            href={`/products/${product.id}`}
                                    onClick={() => {
                                        clearSearch()
                                    }}
                                            className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all group"
                                        >
                                            <div className="relative w-12 h-12 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                                                <Image
                                                    src={product.thumbnail_url || "/placeholder.png"}
                                                    alt=""
                                                    fill
                                                    className="object-cover"
                                                    sizes="48px"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-0.5">
                                                {product.brand && (
                                                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        {product.brand}
                                                    </span>
                                                )}
                                                <span className="text-sm font-semibold text-slate-800 group-hover:text-slate-900 transition-colors">
                                                    {product.name}
                                                </span>
                                            </div>
                                            <ArrowRight className="w-4 h-4 ml-auto text-slate-300 group-hover:text-slate-500 transition-all" />
                                        </Link>
                                    ))}
                                </div>
                            ) : !loading ? (
                                <div className="p-12 text-center">
                                    <p className="text-xs font-bold tracking-wider text-slate-400 uppercase">
                                        No products found
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    ) : null}

                    {/* RECENTLY VIEWED */}
                    {showHistory && (
                        <div className="flex flex-col">
                            <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span className="text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                                        Recently Viewed
                                    </span>
                                </div>
                                <button
                                    onClick={clearHistory}
                                    className="text-[9px] font-bold tracking-widest text-slate-400 hover:text-slate-700 uppercase transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Clear
                                </button>
                            </div>
                            <div className="divide-y divide-slate-100">
                                {recentSearches.map((product: any) => (
                        <Link
                                            key={`${instanceId}-history-${product.id}`}
                                            href={`/products/${product.id}`}
                                            onClick={clearSearch}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="relative w-10 h-10 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200">
                                            <Image
                                                src={product.thumbnail_url || "/placeholder.png"}
                                                alt=""
                                                fill
                                                className="object-cover"
                                                sizes="40px"
                                            />
                                        </div>
                                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                            {product.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FOOTER CTA */}
                    <Link
                        href={isSearching ? `/search?q=${encodeURIComponent(query)}` : "/shop"}
                        onClick={clearSearch}
                        className="w-full block py-4 text-center text-[10px] font-bold tracking-[0.2em] text-white bg-slate-900 hover:bg-slate-800 uppercase transition-colors"
                    >
                        {isSearching ? `See all results for "${query}"` : "Browse all products"}
                    </Link>
                </div>
            )}
        </div>
    )
}
