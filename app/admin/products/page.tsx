import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Package, Layers, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ProductSearch } from "@/components/admin/product-search"
import { CategoryFilter } from "@/components/admin/category-filter"
import { revalidatePath } from "next/cache"

export default async function ProductsPage({
    searchParams,
}: {
    searchParams: Promise<{ query?: string; category?: string }>
}) {
    const { query, category } = await searchParams
    const supabase = await createClient()

    // 1. Fetch Categories for the dropdown
    const { data: categoriesList } = await supabase
        .from("categories")
        .select("id, name")
        .order("name")

    // 2. Build Query
    let dbQuery = supabase
        .from("products")
        .select(`
            *,
            product_categories (
                category_id,
                categories (name)
            ),
            product_variants (id, stock)
        `)
        .order("created_at", { ascending: false })

    if (query) {
        dbQuery = dbQuery.or(`name.ilike.%${query}%, brand.ilike.%${query}%`)
    }

    if (category && category !== "all") {
        dbQuery = dbQuery.filter("product_categories.category_id", "eq", category)
    }

    const { data: products } = await dbQuery

    // 3. Status Toggle Action
    async function toggleStatus(id: string, currentStatus: string) {
        "use server"
        const supabase = await createClient()
        const newStatus = currentStatus === "active" ? "inactive" : "active"

        await supabase
            .from("products")
            .update({ status: newStatus })
            .eq("id", id)

        revalidatePath("/admin/products")
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Products</h2>
                        <p className="text-sm text-muted-foreground">Manage your catalog visibility and inventory.</p>
                    </div>
                    <Button asChild>
                        <Link href="/admin/products/add">
                            <Plus className="mr-2 h-4 w-4" /> Add Product
                        </Link>
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="w-full md:w-80">
                        <ProductSearch />
                    </div>
                    <div className="w-full md:w-60">
                        <CategoryFilter categories={categoriesList || []} />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b">
                            <tr className="text-left font-semibold text-slate-600">
                                <th className="p-4">Product</th>
                                <th className="p-4">Brand</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Type/Variants</th>
                                <th className="p-4">Total Stock</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products?.map((product) => {
                                const totalStock = product.product_variants?.reduce(
                                    (acc: number, curr: any) => acc + (curr.stock || 0), 0
                                ) || 0

                                const variantCount = product.product_variants?.length || 0
                                const isActive = product.status === "active"

                                return (
                                    <tr
                                        key={product.id}
                                        className={`hover:bg-slate-50/50 transition-colors ${!isActive ? 'bg-slate-50/30 opacity-75' : ''}`}
                                    >
                                        {/* Product Info */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`h-10 w-10 relative rounded-md border bg-slate-50 overflow-hidden ${!isActive ? 'grayscale' : ''}`}>
                                                    {product.thumbnail_url ? (
                                                        <Image fill src={product.thumbnail_url} alt="" className="object-cover" unoptimized />
                                                    ) : (
                                                        <Package className="h-5 w-5 m-auto mt-2 text-slate-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-bold ${isActive ? 'text-slate-800' : 'text-slate-500'}`}>
                                                        {product.name}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono">{product.slug}</span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Brand Name Column */}
                                        <td className="p-4">
                                            <span className="text-slate-600 font-medium italic">
                                                {product.brand || "—"}
                                            </span>
                                        </td>

                                        {/* Status Column */}
                                        <td className="p-4">
                                            <Badge
                                                variant={isActive ? "default" : "secondary"}
                                                className={isActive ? "bg-emerald-500 hover:bg-emerald-600 border-none" : "text-slate-400"}
                                            >
                                                {product.status}
                                            </Badge>
                                        </td>

                                        {/* Variant Count Column */}
                                        <td className="p-4">
                                            {product.has_variants ? (
                                                <div className="flex items-center gap-1.5 font-bold text-indigo-600">
                                                    <Layers className="h-4 w-4" />
                                                    <span>{variantCount} Shades</span>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground text-xs italic">Standard</span>
                                            )}
                                        </td>

                                        {/* Stock Column */}
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`h-2 w-2 rounded-full ${totalStock > 10 ? 'bg-green-500' : 'bg-red-500'}`} />
                                                <span className="font-mono font-medium">{totalStock} units</span>
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="p-4 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                {/* Status Toggle Button */}
                                                <form action={toggleStatus.bind(null, product.id, product.status)}>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className={`h-8 w-8 ${isActive ? 'text-slate-400' : 'text-emerald-600 border-emerald-100 bg-emerald-50'}`}
                                                    >
                                                        {isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                    </Button>
                                                </form>

                                                <Button variant="ghost" size="sm" asChild className="h-8">
                                                    <Link href={`/admin/products/edit/${product.id}`}>Edit</Link>
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}