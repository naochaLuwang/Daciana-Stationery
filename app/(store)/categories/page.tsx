import { createClient } from "@/utils/supabase/server"
import { CategoryBrowse } from "@/components/store/category-browse"

export default async function CategoriesPage() {
    const supabase = await createClient()

    const { data: categories } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true })

    const all = categories ?? []
    const parents = all.filter((c) => !c.parent_id)
    const childrenByParent: Record<string, typeof all> = {}
    for (const cat of all) {
        if (cat.parent_id) {
            if (!childrenByParent[cat.parent_id]) childrenByParent[cat.parent_id] = []
            childrenByParent[cat.parent_id].push(cat)
        }
    }

    return (
        <CategoryBrowse
            parents={parents}
            childrenByParent={childrenByParent}
        />
    )
}
