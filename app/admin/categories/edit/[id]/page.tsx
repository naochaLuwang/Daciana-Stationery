import { createClient } from "@/utils/supabase/server"
import { EditCategoryForm } from "@/components/admin/edit-category-form"
import { notFound } from "next/navigation"

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch the category to edit
    const { data: category } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single()

    if (!category) notFound()

    // Fetch all categories for the parent dropdown
    const { data: categories } = await supabase
        .from("categories")
        .select("id, name")

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Edit Category: {category.name}</h1>
            <EditCategoryForm
                initialData={category}
                categories={categories || []}
            />
        </div>
    )
}