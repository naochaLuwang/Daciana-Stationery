"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { House, ShoppingBag, LayoutGrid, ShoppingCart, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCart } from "@/components/store/use-cart"
import { useEffect, useState } from "react"

const navItems = [
    { href: "/", label: "Home", icon: House },
    { href: "/shop", label: "Shop", icon: ShoppingBag },
    { href: "/categories", label: "Categories", icon: LayoutGrid },
    { href: "/cart", label: "Cart", icon: ShoppingCart, hasBadge: true },
    { href: "/profile", label: "Profile", icon: User },
]

export function BottomNav() {
    const pathname = usePathname()
    const totalItems = useCart((state) => state.totalItems())
    const [mounted, setMounted] = useState(false)

    useEffect(() => { setMounted(true) }, [])

    // Hide on product detail and cart pages
    if (pathname.startsWith("/products/") || pathname === "/cart") return null

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 lg:hidden safe-area-bottom">
            <div className="flex items-center justify-around h-14">
                {navItems.map((item) => {
                    const isActive = pathname === item.href
                    const Icon = item.icon

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center min-w-[48px] min-h-[44px] px-2 transition-colors",
                                isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {item.hasBadge && mounted && totalItems > 0 && (
                                <span className="absolute -top-0.5 right-1/2 translate-x-[12px] bg-slate-900 text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
                                    {totalItems > 9 ? "9+" : totalItems}
                                </span>
                            )}
                            <span className="text-[9px] font-bold uppercase tracking-wider mt-0.5">
                                {item.label}
                            </span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
