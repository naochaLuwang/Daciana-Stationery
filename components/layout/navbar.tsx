import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { LogOut, User, Box, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { redirect } from "next/navigation"
import { CartButton } from "./cart-button"
import { NavSearch } from "@/components/nav-search"
import { MobileMenu } from "../mobile-menu"

export default async function Navbar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    async function signOut() {
        "use server"
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect("/")
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
            <div className="container mx-auto px-4">
                {/* Main Desktop & Mobile Row */}
                <div className="h-20 flex items-center justify-between gap-4">

                    {/* LEFT: Logo Section */}
                    {/* flex-1 ensures this takes up equal space to the RIGHT section to keep CENTER centered */}
                    <div className="flex-1 lg:flex-none">
                        <Link href="/" className="flex flex-col group min-w-fit">
                            <span className="text-xl md:text-2xl font-black font-daciana tracking-[0.15em] leading-none text-slate-900 group-hover:text-primary transition-colors uppercase">
                                DACIANA
                            </span>
                            <span className="text-[7px] md:text-[8px] font-bold tracking-[0.3em] text-slate-400 uppercase whitespace-nowrap mt-1">
                                Stationery & Cosmetics
                            </span>
                        </Link>
                    </div>

                    {/* CENTER: Navigation Links */}
                    <div className="hidden lg:flex flex-1 items-center justify-center">
                        <div className="flex items-center gap-10">
                            {['Home', 'Shop', 'Categories'].map((item) => (
                                <Link
                                    key={item}
                                    href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
                                    className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-primary transition-colors relative group"
                                >
                                    {item}
                                    {/* Animated Underline */}
                                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-primary transition-all duration-300 group-hover:w-full" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Search & Actions */}
                    <div className="flex items-center gap-3 md:gap-6 justify-end flex-1 lg:flex-none">
                        {/* Desktop Search - Hidden on mobile/tablet */}
                        <div className="hidden md:block w-48 xl:w-64">
                            <NavSearch />
                        </div>

                        <div className="flex items-center gap-2">
                            <CartButton />

                            {/* Divider for desktop */}
                            <div className="h-4 w-[1px] bg-slate-200 mx-2 hidden lg:block" />

                            {!user ? (
                                <Link
                                    href="/login"
                                    className="hidden sm:block text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors px-2"
                                >
                                    Login
                                </Link>
                            ) : (
                                <div className="hidden sm:block">
                                    <div className="hidden sm:block">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 transition-all border border-transparent active:scale-95">
                                                    <User className="w-5 h-5 text-slate-700" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 mt-3 p-2 rounded-2xl shadow-2xl border-slate-100 animate-in fade-in zoom-in-95 duration-200">
                                                {/* User Header */}
                                                <div className="px-3 py-3 mb-2 bg-slate-50/50 rounded-xl">
                                                    <p className="text-[9px] text-slate-400 uppercase font-black tracking-[0.1em]">Account</p>
                                                    <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                                                </div>

                                                {/* Menu Items with Icons */}
                                                <DropdownMenuItem asChild className="rounded-lg py-2.5 focus:bg-slate-50 cursor-pointer">
                                                    <Link href="/profile" className="flex items-center gap-3 w-full">
                                                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                                            <User className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">My Profile</span>
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem asChild className="rounded-lg py-2.5 focus:bg-slate-50 cursor-pointer">
                                                    <Link href="/profile/orders" className="flex items-center gap-3 w-full">
                                                        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                                                            <Box className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">My Orders</span>
                                                    </Link>
                                                </DropdownMenuItem>

                                                {/* <DropdownMenuItem asChild className="rounded-lg py-2.5 focus:bg-slate-50 cursor-pointer">
                                                    <Link href="/wishlist" className="flex items-center gap-3 w-full">
                                                        <div className="w-8 h-8 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                                                            <Heart className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-xs font-bold text-slate-700">Wishlist</span>
                                                    </Link>
                                                </DropdownMenuItem> */}

                                                {/* Admin Quick Link (Optional check) */}
                                                {user.email?.includes('admin') && (
                                                    <DropdownMenuItem asChild className="rounded-lg py-2.5 focus:bg-slate-50 cursor-pointer">
                                                        <Link href="/admin" className="flex items-center gap-3 w-full">
                                                            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white">
                                                                <Settings className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-xs font-bold text-slate-700">Admin Dashboard</span>
                                                        </Link>
                                                    </DropdownMenuItem>
                                                )}

                                                <div className="my-2 border-t border-slate-100" />

                                                {/* Sign Out */}
                                                <DropdownMenuItem className="p-0 focus:bg-transparent">
                                                    <form action={signOut} className="w-full px-1">
                                                        <button className="flex items-center gap-3 w-full p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors group">
                                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center group-hover:bg-red-200 transition-colors">
                                                                <LogOut className="w-4 h-4" />
                                                            </div>
                                                            <span className="text-xs font-black uppercase tracking-widest">Sign Out</span>
                                                        </button>
                                                    </form>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            )}

                            {/* Mobile Drawer Trigger (Handles PWA Install & Links) */}
                            <div className="lg:hidden">
                                <MobileMenu user={user} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* MOBILE SEARCH BAR (Positioned below the main bar for better UX) */}
                <div className="md:hidden pb-4">
                    <NavSearch />
                </div>
            </div>
        </nav>
    )
}