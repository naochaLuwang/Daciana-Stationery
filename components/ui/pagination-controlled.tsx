"use client"

import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export function PaginationControlled({ totalPages }: { totalPages: number }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()
    const currentPage = Number(searchParams.get("page")) || 1

    const setPage = (page: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", page.toString())
        replace(`${pathname}?${params.toString()}`)
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => setPage(currentPage - 1)} disabled={currentPage <= 1}>
                Previous
            </Button>
            <div className="text-sm font-medium">Page {currentPage} of {totalPages}</div>
            <Button variant="outline" size="sm" onClick={() => setPage(currentPage + 1)} disabled={currentPage >= totalPages}>
                Next
            </Button>
        </div>
    )
}