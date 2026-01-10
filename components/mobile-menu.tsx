"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation" // Added for redirection
import { createClient } from "@/utils/supabase/client" // Ensure you have a client-side supabase util
import { Menu, ChevronRight, ShoppingBag, Home, Grid, User, Download, Share, PlusSquare, LogOut } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetClose
} from "@/components/ui/sheet"

export function MobileMenu({ user }: { user: any }) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isInstallable, setIsInstallable] = useState(false)
    const [isIOS, setIsIOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        const ua = window.navigator.userAgent
        setIsIOS(!!ua.match(/iPad/i) || !!ua.match(/iPhone/i))
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)

        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setIsInstallable(true)
        }
        window.addEventListener("beforeinstallprompt", handler)
        return () => window.removeEventListener("beforeinstallprompt", handler)
    }, [])

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        setOpen(false) // Close menu
        router.refresh() // Refresh to update user state across the app
        router.push('/') // Redirect to home
    }

    const handleInstallClick = async () => {
        if (!deferredPrompt) return
        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") setIsInstallable(false)
        setDeferredPrompt(null)
    }

    const menuItems = [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Shop All', href: '/shop', icon: ShoppingBag },
        { name: 'Categories', href: '/categories', icon: Grid },
    ]

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <button className="p-2 -mr-2 lg:hidden" aria-label="Open Menu">
                    <Menu className="w-6 h-6 text-slate-900" />
                </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] p-0 border-r-0 flex flex-col bg-white">
                <SheetHeader className="p-6 border-b border-slate-50 shrink-0">
                    <SheetTitle className="text-left">
                        <div className="flex flex-col">
                            <span className="font-daciana text-2xl tracking-[0.15em] leading-none text-slate-900 uppercase">
                                DACIANA
                            </span>
                            <span className="text-[7px] font-bold tracking-[0.3em] text-slate-400 uppercase mt-1">
                                Stationery & Cosmetics
                            </span>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto">
                    <nav className="px-4 py-6">
                        <ul className="space-y-1">
                            {menuItems.map((item) => (
                                <li key={item.name}>
                                    <SheetClose asChild>
                                        <Link href={item.href} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors group">
                                            <div className="flex items-center gap-4">
                                                <item.icon className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
                                                <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-600">{item.name}</span>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                        </Link>
                                    </SheetClose>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* PWA Section */}
                    {!isStandalone && (
                        <div className="mx-4 mb-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">
                                            {isIOS ? 'Daciana for iOS' : 'Daciana App'}
                                        </p>
                                        <p className="text-[11px] text-slate-500 leading-tight max-w-[180px]">
                                            Enjoy a faster, seamless shopping experience.
                                        </p>
                                    </div>
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm border border-slate-100">
                                        <ShoppingBag className="w-5 h-5 text-primary/80" />
                                    </div>
                                </div>

                                {isIOS ? (
                                    <div className="space-y-3 bg-white/50 p-3 rounded-xl border border-white/80">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm">
                                                <Share className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">1. Tap the Share button</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-100 shadow-sm">
                                                <PlusSquare className="w-3.5 h-3.5 text-primary" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">2. Add to Home Screen</span>
                                        </div>
                                    </div>
                                ) : (
                                    isInstallable && (
                                        <button
                                            onClick={handleInstallClick}
                                            className="group relative w-full overflow-hidden rounded-xl bg-slate-900 py-3.5 transition-all active:scale-[0.98]"
                                        >
                                            <div className="relative z-10 flex items-center justify-center gap-2">
                                                <Download className="w-3.5 h-3.5 text-white group-hover:animate-bounce" />
                                                <span className="text-[10px] font-black tracking-[0.2em] text-white uppercase">
                                                    Install App
                                                </span>
                                            </div>
                                            <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* BOTTOM SECTION: User Profile & Sign Out */}
                {/* BOTTOM SECTION: User Profile & Actions */}
                <div className="p-4 border-t border-slate-50 bg-slate-50/50 shrink-0">
                    {user ? (
                        <div className="space-y-3">
                            {/* Account & Orders Grid */}
                            <div className="grid grid-cols-2 gap-2">
                                <SheetClose asChild>
                                    <Link href="/profile" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
                                        <User className="w-5 h-5 text-slate-600 mb-2" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Profile</span>
                                    </Link>
                                </SheetClose>

                                <SheetClose asChild>
                                    <Link href="/profile/orders" className="flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:bg-slate-50 transition-colors">
                                        <ShoppingBag className="w-5 h-5 text-slate-600 mb-2" />
                                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">Orders</span>
                                    </Link>
                                </SheetClose>
                            </div>

                            {/* User Email Display (Subtle) */}
                            <div className="px-2 py-1">
                                <p className="text-[10px] text-slate-400 text-center truncate">
                                    Logged in as <span className="text-slate-600 font-medium">{user.email}</span>
                                </p>
                            </div>

                            {/* Sign Out Button */}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 rounded-xl transition-colors group"
                            >
                                <LogOut className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Sign Out</span>
                            </button>
                        </div>
                    ) : (
                        /* LOGIN BUTTON */
                        <SheetClose asChild>
                            <Link
                                href="/login"
                                className="w-full flex items-center justify-center gap-3 p-4 bg-slate-900 text-white rounded-xl text-[10px] font-black tracking-[0.2em] uppercase shadow-lg shadow-slate-200 active:scale-[0.98] transition-all"
                            >
                                <User className="w-4 h-4" />
                                Login / Register
                            </Link>
                        </SheetClose>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}