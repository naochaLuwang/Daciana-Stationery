import { createClient } from "@/utils/supabase/server"
import ProductForm from "@/components/admin/product-form"

export default async function NewProductPage() {
    const supabase = await createClient()

    // Fetch categories ordered by name
    const { data: categories, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name", { ascending: true })

    if (error) {
        console.error("Error loading categories:", error.message)
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            {/* <div className="mb-8">
                <h1 className="text-3xl font-bold">Add New Product</h1>
                <p className="text-muted-foreground text-sm">
                    Set up your stationery or beauty product inventory.
                </p>
            </div> */}

            {/* Pass categories as a prop to the Client Component */}
            <ProductForm categories={categories || []} />
        </div>
    )
}