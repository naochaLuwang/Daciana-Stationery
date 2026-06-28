"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { createClient } from "@/utils/supabase/client"
import { DenseProductCard } from "@/components/store/dense-product-card"
import {
    Search, X,
    ChevronDown, ChevronUp, ArrowUpDown, Check, Clock, Trash2, SlidersHorizontal,
} from "lucide-react"

type SortOption = "newest" | "price_asc" | "price_desc" | "name"

const PRICE_RANGES = [
    { label: "Under ₹2,000", min: 0, max: 2000 },
    { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
    { label: "₹5,000 – ₹10,000", min: 5000, max: 10000 },
    { label: "Above ₹10,000", min: 10000, max: Infinity },
] as const

const sortOptions: { key: SortOption; label: string }[] = [
    { key: "newest", label: "Newest First" },
    { key: "price_asc", label: "Price: Low to High" },
    { key: "price_desc", label: "Price: High to Low" },
    { key: "name", label: "Name: A-Z" },
]

export default function SearchPage() {
    const supabase = createClient()

    const [query, setQuery] = useState("")
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)

    const [categories, setCategories] = useState<any[]>([])
    const [allBrands, setAllBrands] = useState<string[]>([])
    const [selectedCategories, setSelectedCategories] = useState<string[]>([])
    const [selectedBrands, setSelectedBrands] = useState<string[]>([])
    const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null)
    const [sort, setSort] = useState<SortOption>("newest")
    const [showSort, setShowSort] = useState(false)
    const [showFilter, setShowFilter] = useState(false)

    const [tempCategories, setTempCategories] = useState<string[]>([])
    const [tempBrands, setTempBrands] = useState<string[]>([])
    const [tempPriceRange, setTempPriceRange] = useState<number | null>(null)

    const [recentSearches, setRecentSearches] = useState<string[]>([])
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([])
    const searchTimeout = useRef<any>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        inputRef.current?.focus()
    }, [])

    useEffect(() => {
        fetchFilterOptions()
        const stored = localStorage.getItem("recent_searches")
        if (stored) {
            try { setRecentSearches(JSON.parse(stored)) } catch { }
        }
        const rv = localStorage.getItem("recently_viewed")
        if (rv) {
            try { setRecentlyViewed(JSON.parse(rv)) } catch { }
        }
    }, [])

    const addRecentSearch = useCallback((term: string) => {
        const t = term.trim()
        if (!t || t.length < 2) return
        setRecentSearches((prev) => {
            const next = [t, ...prev.filter((s) => s !== t)].slice(0, 8)
            localStorage.setItem("recent_searches", JSON.stringify(next))
            return next
        })
    }, [])

    const clearRecentSearches = useCallback(() => {
        setRecentSearches([])
        localStorage.removeItem("recent_searches")
    }, [])

    const fetchFilterOptions = async () => {
        const [catResult, brandResult] = await Promise.all([
            supabase.from("categories").select("id, name, slug").order("name"),
            supabase.from("products").select("brand").eq("status", "active").not("brand", "is", null),
        ])
        if (catResult.data) setCategories(catResult.data)
        if (brandResult.data) {
            const unique = [...new Set(brandResult.data.map((p: any) => p.brand).filter(Boolean))].sort()
            setAllBrands(unique)
        }
    }

    const computeEffectivePrice = (product: any): number => {
        if (product.has_variants && product.product_variants?.length > 0) {
            const prices = product.product_variants.map((v: any) => {
                const base = v.price || 0
                const dType = v.discount_type || product.discount_type || "none"
                const dVal = v.discount_value || product.discount_value || 0
                if (dType === "percentage" && dVal > 0) return base * (1 - dVal / 100)
                if ((dType === "fixed" || dType === "amount") && dVal > 0) return Math.max(0, base - dVal)
                return base
            })
            return Math.min(...prices)
        }
        const base = product.price || product.base_price || 0
        const dType = product.discount_type || "none"
        const dVal = product.discount_value || 0
        if (dType === "percentage" && dVal > 0) return base * (1 - dVal / 100)
        if ((dType === "fixed" || dType === "amount") && dVal > 0) return Math.max(0, base - dVal)
        return base
    }

    const doSearch = useCallback(async (
        searchText: string,
        opts?: { categories?: string[]; brands?: string[]; priceRangeIdx?: number | null; sortOption?: SortOption }
    ) => {
        const text = searchText.trim()
        const activeCategories = opts?.categories ?? selectedCategories
        const activeBrands = opts?.brands ?? selectedBrands
        const activePriceIdx = opts?.priceRangeIdx !== undefined ? opts.priceRangeIdx : selectedPriceRange
        const activeSort = opts?.sortOption ?? sort

        if (text.length < 2 && activeCategories.length === 0 && activeBrands.length === 0) {
            setResults([])
            return
        }

        setLoading(true)

        try {
            let matchIds: string[] | null = null

            if (text.length >= 2) {
                const { data } = await supabase
                    .from("products")
                    .select("id")
                    .textSearch("search_vector", text, { type: "websearch", config: "english" })
                    .eq("status", "active")
                matchIds = (data || []).map((p: any) => p.id) as string[]
                if (matchIds.length === 0) {
                    setResults([])
                    setLoading(false)
                    return
                }
            }

            if (activeCategories.length > 0) {
                const { data: pcData } = await supabase
                    .from("product_categories")
                    .select("product_id")
                    .in("category_id", activeCategories)
                const catIds = [...new Set((pcData || []).map((p: any) => p.product_id))]
                if (matchIds === null) {
                    matchIds = catIds
                } else {
                    matchIds = matchIds.filter((id) => catIds.includes(id))
                }
                if (matchIds.length === 0) {
                    setResults([])
                    setLoading(false)
                    return
                }
            }

            let query = supabase
                .from("products")
                .select("*, product_variants(*)")
                .eq("status", "active")

            if (matchIds !== null) {
                query = query.in("id", matchIds)
            }

            if (activeBrands.length > 0) {
                query = query.in("brand", activeBrands)
            }

            if (activeSort === "name") {
                query = query.order("name", { ascending: true })
            } else if (activeSort === "newest") {
                query = query.order("created_at", { ascending: false })
            }

            const { data } = await query
            if (data) {
                let processed = data.map((p: any) => ({
                    ...p,
                    _effectivePrice: computeEffectivePrice(p),
                }))

                if (activePriceIdx !== null) {
                    const range = PRICE_RANGES[activePriceIdx]
                    processed = processed.filter(
                        (p) => p._effectivePrice >= range.min && (range.max === Infinity || p._effectivePrice < range.max)
                    )
                }

                if (activeSort === "price_asc") {
                    processed.sort((a, b) => a._effectivePrice - b._effectivePrice)
                } else if (activeSort === "price_desc") {
                    processed.sort((a, b) => b._effectivePrice - a._effectivePrice)
                }

                setResults(processed)
            } else {
                setResults([])
            }
        } catch {
            setResults([])
        } finally {
            setLoading(false)
        }
    }, [sort, selectedCategories, selectedBrands, selectedPriceRange])

    const handleSortChange = (newSort: SortOption) => {
        setSort(newSort)
        setShowSort(false)
        if (query.trim().length >= 2 || selectedCategories.length > 0 || selectedBrands.length > 0) {
            doSearch(query, { sortOption: newSort, categories: selectedCategories, brands: selectedBrands, priceRangeIdx: selectedPriceRange })
        }
    }

    const handleSearch = useCallback((text: string) => {
        setQuery(text)
        clearTimeout(searchTimeout.current)
        if (text.trim().length < 2 && selectedCategories.length === 0 && selectedBrands.length === 0) {
            setResults([])
            return
        }
        searchTimeout.current = setTimeout(() => {
            doSearch(text)
            if (text.trim().length >= 2) addRecentSearch(text)
        }, 400)
    }, [doSearch, selectedCategories, selectedBrands, selectedPriceRange, addRecentSearch])

    const openFilter = () => {
        setTempCategories([...selectedCategories])
        setTempBrands([...selectedBrands])
        setTempPriceRange(selectedPriceRange)
        setShowFilter(true)
    }

    const applyFilters = () => {
        setSelectedCategories([...tempCategories])
        setSelectedBrands([...tempBrands])
        setSelectedPriceRange(tempPriceRange)
        setShowFilter(false)
        doSearch(query, { categories: tempCategories, brands: tempBrands, priceRangeIdx: tempPriceRange, sortOption: sort })
    }

    const clearAllFilters = () => {
        setSelectedCategories([])
        setSelectedBrands([])
        setSelectedPriceRange(null)
        setShowFilter(false)
        doSearch(query, { categories: [], brands: [], priceRangeIdx: null, sortOption: sort })
    }

    const removeCategory = (slug: string) => {
        const next = selectedCategories.filter((s) => s !== slug)
        setSelectedCategories(next)
        doSearch(query, { categories: next, brands: selectedBrands, priceRangeIdx: selectedPriceRange, sortOption: sort })
    }

    const removeBrand = (brand: string) => {
        const next = selectedBrands.filter((b) => b !== brand)
        setSelectedBrands(next)
        doSearch(query, { categories: selectedCategories, brands: next, priceRangeIdx: selectedPriceRange, sortOption: sort })
    }

    const removePriceRange = () => {
        setSelectedPriceRange(null)
        doSearch(query, { categories: selectedCategories, brands: selectedBrands, priceRangeIdx: null, sortOption: sort })
    }

    const activeFilterCount = selectedCategories.length + selectedBrands.length + (selectedPriceRange !== null ? 1 : 0)

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Search bar */}
            <div className="sticky top-0 z-40 bg-white border-b border-slate-100">
                <div className="flex items-center gap-2 px-4 py-3">
                    <div className="flex-1 flex items-center gap-3 bg-slate-50 rounded-full px-4 h-11 border border-slate-200 focus-within:border-slate-400 transition-colors">
                        <Search className="w-4 h-4 text-slate-400 shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search products, brands..."
                            value={query}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none"
                        />
                        {query.length > 0 && (
                            <button onClick={() => { setQuery(""); setResults([]) }} className="p-1 hover:bg-slate-200 rounded-full">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={openFilter}
                        className="relative w-11 h-11 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                        <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-slate-900 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Active filter chips */}
                {activeFilterCount > 0 && (
                    <div className="flex flex-wrap gap-2 px-4 pb-3">
                        {selectedCategories.map((id) => {
                            const cat = categories.find((c) => c.id === id)
                            return (
                                <button key={id} onClick={() => removeCategory(id)}
                                    className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-300 bg-slate-50"
                                >
                                    <span className="text-[11px] font-medium text-slate-700">{cat?.name || id}</span>
                                    <X className="w-3 h-3 text-slate-400" />
                                </button>
                            )
                        })}
                        {selectedBrands.map((brand) => (
                            <button key={brand} onClick={() => removeBrand(brand)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-300 bg-slate-50"
                            >
                                <span className="text-[11px] font-medium text-slate-700">{brand}</span>
                                <X className="w-3 h-3 text-slate-400" />
                            </button>
                        ))}
                        {selectedPriceRange !== null && (
                            <button onClick={removePriceRange}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-300 bg-slate-50"
                            >
                                <span className="text-[11px] font-medium text-slate-700">{PRICE_RANGES[selectedPriceRange].label}</span>
                                <X className="w-3 h-3 text-slate-400" />
                            </button>
                        )}
                        <button onClick={clearAllFilters} className="px-2 text-[11px] text-slate-400 hover:text-slate-700">Clear all</button>
                    </div>
                )}
            </div>

            {/* Sort + results count */}
            {(results.length > 0 || loading) && (
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        {loading ? "Searching..." : `${results.length} result${results.length !== 1 ? "s" : ""}`}
                    </span>
                    <button
                        onClick={() => setShowSort(!showSort)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            {sortOptions.find((o) => o.key === sort)?.label}
                        </span>
                        {showSort ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                    </button>
                </div>
            )}

            {/* Sort dropdown */}
            {showSort && (
                <div className="mx-4 mt-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    {sortOptions.map((opt) => (
                        <button
                            key={opt.key}
                            onClick={() => handleSortChange(opt.key)}
                            className={`w-full flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-b-0 transition-colors ${
                                sort === opt.key ? "bg-slate-50" : "hover:bg-slate-50"
                            }`}
                        >
                            <span className={`text-sm font-medium ${sort === opt.key ? "text-slate-900" : "text-slate-600"}`}>
                                {opt.label}
                            </span>
                            {sort === opt.key && <Check className="w-4 h-4 text-slate-900" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Results */}
            <div className="flex-1">
                {query.length === 0 && activeFilterCount === 0 ? (
                    <>
                        {/* Recent Searches */}
                        {recentSearches.length > 0 && (
                            <div className="px-4 pt-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Recent Searches</h3>
                                    <button onClick={clearRecentSearches} className="text-[10px] text-slate-400 hover:text-slate-700 uppercase tracking-wider font-bold">Clear</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {recentSearches.map((term) => (
                                        <button
                                            key={term}
                                            onClick={() => {
                                                setQuery(term)
                                                doSearch(term, { categories: [], brands: [], priceRangeIdx: null, sortOption: sort })
                                                addRecentSearch(term)
                                            }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 hover:border-slate-300 transition-colors"
                                        >
                                            <Clock className="w-3 h-3 text-slate-400" />
                                            <span className="text-sm text-slate-600">{term}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recently Viewed */}
                        {recentlyViewed.length > 0 && (
                            <div className="pt-6 px-4">
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Recently Viewed</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {recentlyViewed.map((product: any) => (
                                    <Link key={product.id} href={`/products/${product.id}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                                        <div className="relative w-12 h-12 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                                            <Image src={product.thumbnail_url || "/placeholder.png"} alt="" fill className="object-cover" sizes="48px" />
                                        </div>
                                        <span className="text-xs font-medium text-slate-700 truncate">{product.name}</span>
                                    </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        {recentSearches.length === 0 && recentlyViewed.length === 0 && (
                            <div className="py-24 text-center">
                                <Search className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                                <p className="text-sm font-medium text-slate-400">Search for products and brands</p>
                            </div>
                        )}
                    </>
                ) : results.length > 0 ? (
                    <div className="p-4">
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {results.map((product: any) => (
                                <DenseProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    </div>
                ) : !loading && (
                    <div className="py-24 text-center">
                        <p className="text-sm font-bold uppercase tracking-wider text-slate-400">No results found</p>
                        <p className="text-xs text-slate-300 mt-1">Try different keywords or filters</p>
                    </div>
                )}
            </div>

            {/* Filter Bottom Sheet */}
            {showFilter && (
                <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in slide-in-from-bottom duration-300">
                    <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100">
                        <button onClick={() => setShowFilter(false)} className="text-sm text-slate-500">Cancel</button>
                        <h2 className="text-sm font-bold uppercase tracking-wider">Filters</h2>
                        <button onClick={clearAllFilters} className="text-sm text-slate-900 font-semibold">Reset</button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 py-6 space-y-8">
                        {/* Categories */}
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Categories</h3>
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => {
                                    const selected = tempCategories.includes(cat.id)
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setTempCategories((prev) => selected ? prev.filter((s) => s !== cat.id) : [...prev, cat.id])}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                                selected ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                                            }`}
                                        >
                                            {cat.name}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Brands */}
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Brands</h3>
                            <div className="flex flex-wrap gap-2">
                                {allBrands.map((brand) => {
                                    const selected = tempBrands.includes(brand)
                                    return (
                                        <button
                                            key={brand}
                                            onClick={() => setTempBrands((prev) => selected ? prev.filter((s) => s !== brand) : [...prev, brand])}
                                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                                selected ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                                            }`}
                                        >
                                            {brand}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3">Price Range</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {PRICE_RANGES.map((range, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setTempPriceRange((prev) => prev === idx ? null : idx)}
                                        className={`px-3 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                                            tempPriceRange === idx ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                                        }`}
                                    >
                                        {range.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="px-4 py-4 border-t border-slate-100">
                        <button
                            onClick={applyFilters}
                            className="w-full py-3 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
