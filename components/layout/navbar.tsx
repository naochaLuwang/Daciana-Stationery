import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { User, Search, Heart } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { redirect } from "next/navigation"
import { CartButton } from "./cart-button"
import { NavSearch } from "@/components/nav-search"
import { HeaderScroll } from "./header-scroll"

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Shop", href: "/shop" },
    { name: "Categories", href: "/categories" },
    { name: "Brands", href: "/shop" },
]

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    async function signOut() {
        "use server"
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect("/")
    }

    let initialWishlistCount = 0
    if (user) {
        const { count } = await supabase
            .from("wishlist")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
        initialWishlistCount = count || 0
    }

    return (
        <HeaderScroll>
            <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
                <div className="h-16 lg:h-24 flex items-center justify-between gap-4 lg:gap-8">

                    {/* Desktop Nav Links (left) */}
                    <nav className="hidden lg:flex items-center gap-10 flex-1 min-w-0">
                        {navLinks.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-500 hover:text-slate-900 transition-colors relative group"
                            >
                                {item.name}
                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-[1.5px] bg-slate-900 transition-all duration-300 group-hover:w-full" />
                            </Link>
                        ))}
                    </nav>

                    {/* Logo (center) */}
                    <div className="flex-shrink-0">
                        <Link href="/" className="flex flex-col items-center lg:items-center gap-0">
                            <span className="text-lg lg:text-[28px] font-black font-daciana tracking-[0.12em] leading-none text-slate-900 uppercase">
                                DACIANA
                            </span>
                            <span className="text-[8px] lg:text-[7px] font-bold tracking-[0.35em] text-slate-400 uppercase mt-0.5 lg:mt-1">
                                STATIONARY & COSMETICS
                            </span>
                        </Link>
                    </div>

                    {/* Actions (right) */}
                    <div className="flex items-center justify-end gap-2 lg:gap-4 flex-1 min-w-0">
                        {/* Desktop search */}
                        <div className="hidden xl:block xl:w-72 mr-1">
                            <NavSearch />
                        </div>

                        <div className="flex items-center gap-1 lg:gap-2 shrink-0">
                            {/* Mobile: Search icon */}
                            <Link
                                href="/search"
                                className="lg:hidden p-2 hover:text-slate-900 transition-colors"
                            >
                                <Search className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                            </Link>

                            {/* Mobile: Wishlist */}
                            <Link
                                href="/wishlist"
                                className="lg:hidden p-2 hover:text-slate-900 transition-colors relative"
                            >
                                <Heart className="w-5 h-5 text-slate-600" strokeWidth={1.5} />
                                {initialWishlistCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 bg-slate-900 text-white text-[8px] font-bold w-3.5 h-3.5 flex items-center justify-center rounded-full">
                                        {initialWishlistCount > 9 ? "9+" : initialWishlistCount}
                                    </span>
                                )}
                            </Link>

                            <CartButton />

                            {/* Desktop: divider */}
                            <div className="hidden lg:block h-5 w-px bg-slate-200 mx-1" />

                            {/* Desktop: User menu */}
                            <div className="hidden lg:block">
                                {!user ? (
                                    <Link
                                        href="/login"
                                        className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 hover:text-slate-900 transition-colors px-2"
                                    >
                                        Login
                                    </Link>
                                ) : (
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="focus:outline-none p-2 text-slate-600 hover:text-slate-900 transition-all group">
                                                <User className="w-[22px] h-[22px] transition-transform group-hover:scale-110" strokeWidth={1.5} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-56 mt-3 rounded-xl border border-slate-100 shadow-xl p-2 bg-white">
                                            <div className="px-3 py-2.5 border-b border-slate-50 mb-1">
                                                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Account</p>
                                                <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
                                            </div>
                                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-slate-50">
                                                <Link href="/profile" className="text-xs font-semibold py-2.5 px-3">Dashboard</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-slate-50">
                                                <Link href="/profile/orders" className="text-xs font-semibold py-2.5 px-3">Orders</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-slate-50">
                                                <Link href="/wishlist" className="text-xs font-semibold py-2.5 px-3">Wishlist</Link>
                                            </DropdownMenuItem>
                                            {user.email?.includes("admin") && (
                                                <DropdownMenuItem asChild className="cursor-pointer rounded-lg focus:bg-slate-50">
                                                    <Link href="/admin" className="text-xs font-semibold py-2.5 px-3">Admin</Link>
                                                </DropdownMenuItem>
                                            )}
                                            <div className="my-1 border-t border-slate-100" />
                                            <DropdownMenuItem className="rounded-lg focus:bg-red-50 cursor-pointer">
                                                <form action={signOut} className="w-full">
                                                    <button type="submit" className="w-full text-left text-xs font-semibold text-red-600 py-2.5 px-3">Sign Out</button>
                                                </form>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </HeaderScroll>
    )
}
