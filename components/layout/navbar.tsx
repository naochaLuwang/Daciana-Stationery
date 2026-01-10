import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { ShoppingCart, LogOut, User, Menu, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { redirect } from "next/navigation"
import { CartButton } from "./cart-button"

export default async function Navbar() {
    const supabase = await createClient()

    // 1. Check Auth Session
    const { data: { user } } = await supabase.auth.getUser()

    // 2. Sign Out Action
    async function signOut() {
        "use server"
        const supabase = await createClient()
        await supabase.auth.signOut()
        redirect("/")
    }

    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">

                {/* Logo & Brand */}
                <Link href="/" className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                        <Package className="w-6 h-6" />
                    </div>
                    <span className="text-xl font-bold tracking-tight hidden sm:inline-block">
                        STORE<span className="text-primary">FRONT</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
                        Home
                    </Link>
                    <Link href="/shop" className="text-sm font-medium hover:text-primary transition-colors">
                        Shop
                    </Link>
                    <Link href="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                        Categories
                    </Link>
                </div>

                {/* Actions: Cart, Login/SignOut */}
                <div className="flex items-center gap-4">

                    {/* Cart Icon */}
                    <Button variant="ghost" size="icon" asChild className="relative">

                        <CartButton />

                    </Button>

                    <div className="h-6 w-[1px] bg-slate-200 hidden sm:block" />

                    {/* Conditional Login / User Menu */}
                    {!user ? (
                        <Button asChild variant="default" size="sm">
                            <Link href="/login">Login</Link>
                        </Button>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <User className="w-4 h-4" />
                                    <span className="hidden sm:inline-block">Account</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuItem asChild>
                                    <Link href="/profile">My Profile</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                    <Link href="/profile/orders">My Orders</Link>
                                </DropdownMenuItem>
                                <hr className="my-1" />
                                <DropdownMenuItem>
                                    <form action={signOut} className="w-full">
                                        <button className="flex items-center text-red-600 w-full">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign Out
                                        </button>
                                    </form>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Mobile Menu (Optional Trigger) */}
                    <Button variant="ghost" size="icon" className="md:hidden">
                        <Menu className="w-5 h-5" />
                    </Button>
                </div>
            </div>
        </nav>
    )
}