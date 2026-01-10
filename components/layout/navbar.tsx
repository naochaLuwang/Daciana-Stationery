// import Link from "next/link"
// import { createClient } from "@/utils/supabase/server"
// import { LogOut, User, Menu } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import {
//     DropdownMenu,
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger
// } from "@/components/ui/dropdown-menu"
// import { redirect } from "next/navigation"
// import { CartButton } from "./cart-button"
// import { NavSearch } from "@/components/nav-search"
// import { MobileMenu } from "../mobile-menu"

// export default async function Navbar() {
//     const supabase = await createClient()
//     const { data: { user } } = await supabase.auth.getUser()

//     async function signOut() {
//         "use server"
//         const supabase = await createClient()
//         await supabase.auth.signOut()
//         redirect("/")
//     }

//     return (
//         <nav className="sticky top-0 z-50 w-full border-b bg-white/90 backdrop-blur-md">
//             <div className="container mx-auto px-4">
//                 {/* Main Row */}
//                 <div className="h-20 flex items-center justify-between gap-4">

//                     {/* LEFT: Logo Section */}
//                     <div className="flex-1 lg:flex-none">
//                         <Link href="/" className="flex flex-col items-center justify-center group min-w-fit">
//                             <span className="text-xl md:text-2xl font-black font-daciana tracking-[0.15em] leading-none text-slate-900 group-hover:text-primary transition-colors">
//                                 DACIANA
//                             </span>
//                             <span className="text-[7px] md:text-[8px] font-bold tracking-[0.3em] text-slate-400 uppercase whitespace-nowrap mt-1">
//                                 Stationery & Cosmetics
//                             </span>
//                         </Link>
//                     </div>

//                     {/* CENTER: Navigation Links (Hidden on small screens) */}
//                     <div className="hidden lg:flex flex-1 items-center justify-center">
//                         <div className="flex items-center gap-10">
//                             {['Home', 'Shop', 'Categories'].map((item) => (
//                                 <Link
//                                     key={item}
//                                     href={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
//                                     className="text-[12px] font-bold uppercase tracking-[0.2em] text-slate-600 hover:text-primary transition-colors relative after:content-[''] after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[1px] after:bg-primary after:transition-all hover:after:w-full"
//                                 >
//                                     {item}
//                                 </Link>
//                             ))}
//                         </div>
//                     </div>

//                     {/* RIGHT: Search & Actions */}
//                     <div className="flex items-center gap-3 md:gap-6 justify-end flex-1 lg:flex-none">
//                         {/* Desktop Search */}
//                         <div className="hidden md:block w-64">
//                             <NavSearch />
//                         </div>

//                         <div className="flex items-center gap-2">
//                             <Button variant="ghost" size="icon" asChild className="relative hover:bg-transparent">
//                                 <CartButton />
//                             </Button>

//                             {!user ? (
//                                 <Link href="/login" className="hidden sm:block text-[10px] font-bold uppercase tracking-widest hover:text-primary transition-colors px-2">
//                                     Login
//                                 </Link>
//                             ) : (
//                                 <DropdownMenu>
//                                     <DropdownMenuTrigger asChild>
//                                         <Button variant="ghost" size="icon" className="rounded-full">
//                                             <User className="w-5 h-5 text-slate-700" />
//                                         </Button>
//                                     </DropdownMenuTrigger>
//                                     <DropdownMenuContent align="end" className="w-48">
//                                         <DropdownMenuItem asChild><Link href="/profile">My Profile</Link></DropdownMenuItem>
//                                         <DropdownMenuItem asChild><Link href="/profile/orders">My Orders</Link></DropdownMenuItem>
//                                         <hr className="my-1" />
//                                         <DropdownMenuItem>
//                                             <form action={signOut} className="w-full">
//                                                 <button className="flex items-center text-red-600 w-full">
//                                                     <LogOut className="w-4 h-4 mr-2" /> Sign Out
//                                                 </button>
//                                             </form>
//                                         </DropdownMenuItem>
//                                     </DropdownMenuContent>
//                                 </DropdownMenu>
//                             )}

//                             {/* <Button variant="ghost" size="icon" className="lg:hidden">
//                                 <Menu className="w-6 h-6" />
//                             </Button> */}
//                             <MobileMenu user={user} />
//                         </div>
//                     </div>
//                 </div>

//                 {/* MOBILE SEARCH BAR (Visible only on small screens below the main nav) */}
//                 <div className="md:hidden pb-4">
//                     <NavSearch />
//                 </div>
//             </div>
//         </nav>


//     )
// }

import Link from "next/link"
import { createClient } from "@/utils/supabase/server"
import { LogOut, User } from "lucide-react"
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 transition-colors">
                                                <User className="w-5 h-5 text-slate-700" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-52 mt-2 rounded-xl shadow-xl border-slate-100">
                                            <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">Signed in as</p>
                                                <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
                                            </div>
                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                <Link href="/profile">My Profile</Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild className="cursor-pointer">
                                                <Link href="/profile/orders">My Orders</Link>
                                            </DropdownMenuItem>
                                            <hr className="my-1 border-slate-50" />
                                            <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer">
                                                <form action={signOut} className="w-full">
                                                    <button className="flex items-center w-full">
                                                        <LogOut className="w-4 h-4 mr-2" />
                                                        Sign Out
                                                    </button>
                                                </form>
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
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