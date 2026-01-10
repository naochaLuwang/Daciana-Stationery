"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteCategory } from "@/app/actions/categories"
import { toast } from "sonner"

export function DeleteCategoryButton({ id, name }: { id: string, name: string }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) return

        setLoading(true)
        const res = await deleteCategory(id)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Category deleted")
        }
        setLoading(false)
    }

    return (
        <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            disabled={loading}
            onClick={handleDelete}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </Button>
    )
}