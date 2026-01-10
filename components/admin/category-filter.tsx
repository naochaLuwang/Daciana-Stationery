"use client"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useRouter, useSearchParams, usePathname } from "next/navigation"

export function CategoryFilter({ categories }: { categories: any[] }) {
    const searchParams = useSearchParams()
    const pathname = usePathname()
    const { replace } = useRouter()

    const onCategoryChange = (value: string) => {
        const params = new URLSearchParams(searchParams)
        if (value && value !== "all") {
            params.set("category", value)
        } else {
            params.delete("category")
        }
        // Reset page if you have pagination
        params.delete("page")
        replace(`${pathname}?${params.toString()}`)
    }

    return (
        <Select
            defaultValue={searchParams.get("category") || "all"}
            onValueChange={onCategoryChange}
        >
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}