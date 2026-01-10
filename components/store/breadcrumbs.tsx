// src/components/store/breadcrumbs.tsx
import Link from "next/link"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbProps {
    parent?: { id: string; name: string } | null
    current: string
}

export function Breadcrumbs({ parent, current }: BreadcrumbProps) {
    return (
        <nav className="flex items-center space-x-2 text-sm font-medium mb-4 text-white/70">
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors">
                <Home className="w-3.5 h-3.5" />
                Home
            </Link>

            <ChevronRight className="w-4 h-4 opacity-50" />

            {parent && (
                <>
                    <Link
                        href={`/categories/${parent.id}`}
                        className="hover:text-white transition-colors"
                    >
                        {parent.name}
                    </Link>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                </>
            )}

            <span className="text-white font-semibold truncate max-w-[150px]">
                {current}
            </span>
        </nav>
    )
}