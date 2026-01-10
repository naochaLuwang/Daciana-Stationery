"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { DebouncedInput } from "./debounced-input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

export function FilterSidebar({ categories }: { categories: any[] }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        router.push(`/shop?${params.toString()}`, { scroll: false })
    }

    const clearFilters = () => router.push('/shop')

    return (
        <div className="space-y-8 bg-white p-6 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm uppercase tracking-widest text-slate-900">Filters</h3>
                {(searchParams.get('category') || searchParams.get('min') || searchParams.get('max')) && (
                    <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-[10px] uppercase font-bold">
                        Clear All <X className="ml-1 w-3 h-3" />
                    </Button>
                )}
            </div>

            {/* Category Section */}
            <div>
                <Label className="text-[10px] uppercase font-bold text-slate-400 mb-3 block">Categories</Label>
                <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => updateFilter('category', cat.id === searchParams.get('category') ? '' : cat.id)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${searchParams.get('category') === cat.id
                                    ? "bg-black text-white"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Section */}
            <div className="space-y-3">
                <Label className="text-[10px] uppercase font-bold text-slate-400 block">Price Range (₹)</Label>
                <div className="flex items-center gap-2">
                    <DebouncedInput
                        type="number"
                        placeholder="Min"
                        className="h-9 text-xs"
                        value={searchParams.get('min') || ''}
                        onChange={(val) => updateFilter('min', val)}
                    />
                    <span className="text-slate-300">-</span>
                    <DebouncedInput
                        type="number"
                        placeholder="Max"
                        className="h-9 text-xs"
                        value={searchParams.get('max') || ''}
                        onChange={(val) => updateFilter('max', val)}
                    />
                </div>
            </div>
        </div>
    )
}