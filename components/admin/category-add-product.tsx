"use client"

import { useState, useTransition } from "react"
import { Search, PackagePlus, CheckSquare, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface AddProductSidebarProps {
    allProducts: any[]
    categoryName: string
    linkProductAction: (formData: FormData) => Promise<void>
    linkMultipleAction: (ids: string[]) => Promise<void>
}

export function AddProductSidebar({
    allProducts,
    categoryName,
    linkProductAction,
    linkMultipleAction
}: AddProductSidebarProps) {
    const [searchTerm, setSearchTerm] = useState("")
    const [isPending, startTransition] = useTransition()

    // Client-side filter
    const filteredProducts = allProducts.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleLinkAll = () => {
        const ids = filteredProducts.map(p => p.id)
        startTransition(async () => {
            try {
                await linkMultipleAction(ids)
                setSearchTerm("")
                toast.success(`Added ${ids.length} products to ${categoryName}`)
            } catch (err) {
                toast.error("Failed to link products")
            }
        })
    }

    return (
        <div className="p-6 border rounded-lg bg-slate-50 space-y-4 sticky top-6">
            <h3 className="font-semibold flex items-center gap-2 text-slate-800">
                <PackagePlus className="w-4 h-4 text-blue-600" /> Add to {categoryName}
            </h3>

            <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search products..."
                    className="pl-9 bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Bulk Action UI */}
            {searchTerm && filteredProducts.length > 1 && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-md animate-in fade-in slide-in-from-top-2">
                    <p className="text-xs text-blue-700 mb-2 font-medium">
                        Found {filteredProducts.length} matching products
                    </p>
                    <Button
                        variant="default"
                        size="sm"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        onClick={handleLinkAll}
                        disabled={isPending}
                    >
                        {isPending ? (
                            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                        ) : (
                            <CheckSquare className="w-3.5 h-3.5 mr-2" />
                        )}
                        Link all results
                    </Button>
                </div>
            )}

            <form action={linkProductAction} className="space-y-3 pt-2">
                <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-slate-500 ml-1">Single Selection</label>
                    <select
                        name="productId"
                        className="w-full p-2 rounded-md border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    >
                        <option value="">
                            {filteredProducts.length > 0 ? "Choose a product..." : "No results found"}
                        </option>
                        {filteredProducts.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={filteredProducts.length === 0 || isPending}
                >
                    {isPending ? "Processing..." : "Link Product"}
                </Button>
            </form>
        </div>
    )
}