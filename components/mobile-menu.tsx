"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, Home, ShoppingBag, Grid3X3, Heart, User, LogOut, Box } from "lucide-react"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

interface MobileMenuProps {
    user: any
}

export function MobileMenu({ user }: MobileMenuProps) {
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setOpen(false)
        router.push("/")
        router.refresh()
    }

    const links = [
        { href: "/", label: "Home", icon: Home },
        { href: "/shop", label: "Shop", icon: ShoppingBag },
        { href: "/categories", label: "Categories", icon: Grid3X3 },
        { href: "/wishlist", label: "Wishlist", icon: Heart },
    ]

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5 text-slate-700" />
            </button>

            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />

                    <div className="absolute top-0 right-0 h-full w-72 max-w-[85vw] bg-white shadow-2xl animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <span className="text-lg font-black font-daciana tracking-wider">DACIANA</span>
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 hover:bg-slate-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <nav className="p-6 space-y-1">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                >
                                    <link.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                    <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{link.label}</span>
                                </Link>
                            ))}

                            <div className="my-4 border-t border-slate-100" />

                            {user ? (
                                <>
                                    <Link
                                        href="/profile"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                    >
                                        <User className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
                                        <span className="text-sm font-bold text-slate-700">My Profile</span>
                                    </Link>
                                    {user.email?.includes("admin") && (
                                        <Link
                                            href="/admin"
                                            onClick={() => setOpen(false)}
                                            className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors group"
                                        >
                                            <Box className="w-5 h-5 text-slate-400 group-hover:text-slate-900" />
                                            <span className="text-sm font-bold text-slate-700">Admin</span>
                                        </Link>
                                    )}
                                    <button
                                        onClick={handleSignOut}
                                        className="flex items-center gap-4 w-full px-4 py-3 rounded-xl hover:bg-red-50 transition-colors group text-left"
                                    >
                                        <LogOut className="w-5 h-5 text-red-400" />
                                        <span className="text-sm font-bold text-red-600">Sign Out</span>
                                    </button>
                                </>
                            ) : (
                                <Link
                                    href="/login"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-4 px-4 py-3 rounded-xl bg-slate-900 text-white hover:bg-black transition-colors group"
                                >
                                    <User className="w-5 h-5" />
                                    <span className="text-sm font-bold">Login</span>
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            )}
        </>
    )
}
