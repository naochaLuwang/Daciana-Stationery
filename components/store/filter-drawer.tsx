"use client"

import { useRouter, useSearchParams } from "next/navigation"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { SlidersHorizontal, RotateCcw } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

// FIX: Explicitly define props to resolve TypeScript build errors
interface FilterDrawerProps {
    currentSort?: string;
    currentMin?: string;
    currentMax?: string;
}

export function FilterDrawer({ currentSort, currentMin, currentMax }: FilterDrawerProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value) params.set(key, value)
        else params.delete(key)
        router.push(`?${params.toString()}`, { scroll: false })
    }

    const clearFilters = () => {
        router.push('?', { scroll: false })
    }

    const isActive = currentSort || currentMin || currentMax

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-[10px] font-black uppercase tracking-widest h-10 px-6 border-slate-200 hover:bg-slate-50 transition-all"
                >
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-2" />
                    Sort & Filter
                    {isActive && (
                        <span className="ml-2 w-1.5 h-1.5 bg-black rounded-full" />
                    )}
                </Button>
            </SheetTrigger>

            <SheetContent className="w-full sm:max-w-md border-l-0 flex flex-col h-full">
                <SheetHeader className="pb-6 border-b">
                    <SheetTitle className="text-3xl font-black uppercase tracking-tighter text-left">
                        Refine
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-grow py-8 space-y-12 overflow-y-auto no-scrollbar">
                    {/* SORTING SECTION */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sort By</h3>
                        <RadioGroup
                            defaultValue={currentSort || "default"}
                            onValueChange={(v) => updateFilter("sort", v)}
                            className="gap-4"
                        >
                            {[
                                { id: "default", label: "Alphabetical", value: "default" },
                                { id: "newest", label: "Newest Arrivals", value: "newest" },
                                { id: "price_asc", label: "Price: Low to High", value: "price_asc" },
                                { id: "price_desc", label: "Price: High to Low", value: "price_desc" }
                            ].map((opt) => (
                                <div key={opt.id} className="flex items-center space-x-3">
                                    <RadioGroupItem value={opt.value} id={opt.id} />
                                    <Label htmlFor={opt.id} className="text-xs font-bold uppercase tracking-wider cursor-pointer">
                                        {opt.label}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                    </div>

                    {/* PRICE RANGE SECTION */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Price Range</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Under ₹2,000", min: "0", max: "2000" },
                                { label: "₹2,000 - ₹5,000", min: "2000", max: "5000" },
                                { label: "₹5,000 - ₹10,000", min: "5000", max: "10000" },
                                { label: "Over ₹10,000", min: "10000", max: "100000" }
                            ].map((range) => {
                                const isSelected = currentMin === range.min && currentMax === range.max
                                return (
                                    <Button
                                        key={range.label}
                                        variant={isSelected ? "default" : "outline"}
                                        className={`text-[10px] uppercase font-bold h-12 rounded-xl border-slate-200 ${isSelected ? 'bg-black text-white' : 'hover:bg-slate-50'}`}
                                        onClick={() => {
                                            const params = new URLSearchParams(searchParams.toString())
                                            params.set("minPrice", range.min)
                                            params.set("maxPrice", range.max)
                                            router.push(`?${params.toString()}`, { scroll: false })
                                        }}
                                    >
                                        {range.label}
                                    </Button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <SheetFooter className="p-6 bg-white border-t flex flex-row gap-4 mt-auto">
                    <Button
                        variant="ghost"
                        className="flex-1 uppercase font-black text-[10px] tracking-widest text-slate-400 hover:text-black"
                        onClick={clearFilters}
                    >
                        <RotateCcw className="w-3 h-3 mr-2" /> Reset
                    </Button>
                    <SheetTrigger asChild>
                        <Button className="flex-[2] bg-black text-white uppercase font-black text-[10px] tracking-widest h-12 rounded-xl">
                            Apply Selection
                        </Button>
                    </SheetTrigger>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    )
}