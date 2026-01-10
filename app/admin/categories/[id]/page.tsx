import { createClient } from "@/utils/supabase/server"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Trash2, Package } from "lucide-react"
import Link from "next/link"
import { revalidatePath } from "next/cache"
import { AddProductSidebar } from "@/components/admin/category-add-product"
import { notFound } from "next/navigation"

// Define the shape of the joined product to satisfy TypeScript
interface LinkedProduct {
    id: string;
    name: string;
    brand: string | null;
}

export default async function CategoryDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // 1. Fetch Category Details
    const { data: category } = await supabase
        .from("categories")
        .select("name")
        .eq("id", id)
        .single()

    if (!category) notFound()

    // 2. Fetch products LINKED to this category
    const { data: linkedItems } = await supabase
        .from("product_categories")
        .select(`
            product:products (id, name, brand)
        `)
        .eq("category_id", id)

    // FIX: Explicitly cast the mapped results and filter out nulls
    const linkedProducts = (linkedItems?.map(item => item.product) as unknown as LinkedProduct[]).filter(Boolean) || []

    // Extract IDs for the exclusion filter
    const linkedIds = linkedProducts.map(p => p.id)

    // 3. Fetch all products NOT in this category for the sidebar
    // We use a cleaner check for empty linkedIds to avoid SQL errors
    let availableProductsQuery = supabase.from("products").select("id, name")

    if (linkedIds.length > 0) {
        availableProductsQuery = availableProductsQuery.not("id", "in", `(${linkedIds.join(',')})`)
    }

    const { data: allProducts } = await availableProductsQuery.order("name")

    /** SERVER ACTIONS **/

    async function linkProduct(formData: FormData) {
        "use server"
        const productId = formData.get("productId") as string
        const supabase = await createClient()
        await supabase.from("product_categories").insert({ product_id: productId, category_id: id })
        revalidatePath(`/admin/categories/${id}`)
    }

    async function linkMultipleProducts(productIds: string[]) {
        "use server"
        const supabase = await createClient()
        const links = productIds.map(pid => ({ product_id: pid, category_id: id }))
        await supabase.from("product_categories").insert(links)
        revalidatePath(`/admin/categories/${id}`)
    }

    async function unlinkProduct(productId: string) {
        "use server"
        const supabase = await createClient()
        await supabase
            .from("product_categories")
            .delete()
            .match({ product_id: productId, category_id: id })
        revalidatePath(`/admin/categories/${id}`)
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild className="rounded-full">
                    <Link href="/admin/categories"><ChevronLeft className="w-5 h-5" /></Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">{category.name}</h1>
                    <p className="text-sm text-slate-500">Manage products assigned to this category</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Current Products Table */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">Assigned Products ({linkedProducts.length})</h3>
                    </div>

                    <div className="border rounded-2xl bg-white shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50 border-b text-slate-600">
                                <tr>
                                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Product Name</th>
                                    <th className="p-4 font-bold uppercase text-[10px] tracking-widest">Brand</th>
                                    <th className="p-4 text-right font-bold uppercase text-[10px] tracking-widest px-6">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {linkedProducts.length === 0 && (
                                    <tr>
                                        <td colSpan={3} className="p-12 text-center text-slate-400">
                                            <Package className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                            <p className="text-sm">No products in this category yet.</p>
                                        </td>
                                    </tr>
                                )}
                                {linkedProducts.map((product) => (
                                    <tr key={product.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4 font-semibold text-slate-800">{product.name}</td>
                                        <td className="p-4 text-slate-500 text-xs uppercase font-medium">{product.brand || "—"}</td>
                                        <td className="p-4 text-right px-6">
                                            <form action={unlinkProduct.bind(null, product.id)}>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg px-3"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                                                    Remove
                                                </Button>
                                            </form>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Searchable Sidebar */}
                <div className="lg:col-span-1">
                    <AddProductSidebar
                        allProducts={allProducts || []}
                        categoryName={category.name}
                        linkProductAction={linkProduct}
                        linkMultipleAction={linkMultipleProducts}
                    />
                </div>
            </div>
        </div>
    )
}