"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteBanner } from "@/app/actions/banners"
import { toast } from "sonner"

export function DeleteBannerButton({ id, title }: { id: string; title: string }) {
    const [loading, setLoading] = useState(false)

    const handleDelete = async () => {
        if (!confirm(`Delete banner "${title}"?`)) return
        setLoading(true)
        const res = await deleteBanner(id)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Banner deleted")
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
