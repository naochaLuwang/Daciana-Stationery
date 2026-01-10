"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

export function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams)
        params.set("page", pageNumber.toString())
        return `?${params.toString()}`
    }

    return (
        <div className="flex items-center justify-center space-x-2">
            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(createPageUrl(currentPage - 1))}
                disabled={currentPage <= 1}
            >
                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>

            <div className="text-sm font-medium">
                Page {currentPage} of {totalPages}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(createPageUrl(currentPage + 1))}
                disabled={currentPage >= totalPages}
            >
                Next <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    )
}