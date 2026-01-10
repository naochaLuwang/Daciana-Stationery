"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { createClient } from "@/utils/supabase/client"
import Image from "next/image"
import Link from "next/link"

export function NavSearch() {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const supabase = createClient()
    const router = useRouter()

    // Handle clicking outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Live Search Logic
    useEffect(() => {
        const fetchResults = async () => {
            if (query.length < 2) {
                setResults([])
                return
            }
            setLoading(true)
            const { data } = await supabase
                .from('products')
                .select('id, name, thumbnail_url, base_price')
                .ilike('name', `%${query}%`)
                .limit(5)

            setResults(data || [])
            setLoading(false)
            setIsOpen(true)
        }

        const debounce = setTimeout(fetchResults, 300)
        return () => clearTimeout(debounce)
    }, [query, supabase])

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                    placeholder="SEARCH PRODUCTS..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="h-10 pl-9 pr-10 text-[10px] tracking-widest bg-slate-50 border-none rounded-full focus-visible:ring-1 focus-visible:ring-slate-200"
                />
                {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-slate-400" />}
            </div>

            {/* LIVE DROPDOWN */}
            {isOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-[100]">
                    <div className="p-2">
                        {results.map((product) => (
                            <Link
                                key={product.id}
                                href={`/products/${product.id}`}
                                onClick={() => setIsOpen(false)}
                                className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl transition-colors group"
                            >
                                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-100 shrink-0">
                                    <Image src={product.thumbnail_url} alt={product.name} fill className="object-cover" />
                                </div>
                                <div className="flex flex-col overflow-hidden">
                                    <span className="text-[11px] font-bold text-slate-900 truncate uppercase">
                                        {product.name}
                                    </span>
                                    <span className="text-[10px] font-medium text-slate-500">
                                        ₹{product.base_price}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <Link
                        href={`/shop?q=${query}`}
                        className="block p-3 text-center text-[10px] font-bold tracking-widest text-primary border-t bg-slate-50 hover:bg-slate-100"
                        onClick={() => setIsOpen(false)}
                    >
                        VIEW ALL RESULTS
                    </Link>
                </div>
            )}
        </div>
    )
}