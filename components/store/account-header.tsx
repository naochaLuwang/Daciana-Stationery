"use client"

import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Calendar, Package, Heart, ChevronRight, LogOut } from "lucide-react"

const AVATAR_COLORS = [
    "from-slate-700 to-slate-900",
    "from-slate-600 to-slate-800",
    "from-blue-700 to-blue-900",
    "from-emerald-700 to-emerald-900",
    "from-amber-700 to-amber-900",
]

function getAvatarColor(name: string) {
    let hash = 0
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name?: string | null, email?: string | null) {
    const str = name || email || "U"
    const parts = str.trim().split(/\s+/)
    return parts
        .slice(0, 2)
        .map((p) => p[0])
        .join("")
        .toUpperCase()
}

export function AccountHeader({
    user,
    profile,
    orderCount,
}: {
    user: { email?: string | null }
    profile?: { full_name?: string | null; created_at?: string | null } | null
    orderCount: number | null
}) {
    const router = useRouter()
    const supabase = createClient()

    const name = profile?.full_name || user.email?.split("@")[0] || "User"
    const initials = getInitials(profile?.full_name, user.email)
    const avatarColor = getAvatarColor(name)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push("/")
        router.refresh()
    }

    return (
        <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-4">
                    <div
                        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarColor} text-lg font-bold text-white shadow-sm`}
                    >
                        {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="truncate text-base font-bold text-slate-900">{name}</h2>
                        <p className="truncate text-sm text-slate-500">{user.email}</p>
                        {profile?.created_at && (
                            <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                <Calendar className="h-3 w-3" />
                                Member since{" "}
                                {new Date(profile.created_at).toLocaleDateString("en-IN", {
                                    month: "short",
                                    year: "numeric",
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {orderCount !== null && (
                    <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3">
                        <Package className="h-5 w-5 text-slate-400" />
                        <div>
                            <p className="text-lg font-bold text-slate-900">{orderCount}</p>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Total Orders
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                <p className="px-4 pb-1 pt-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                    Quick Access
                </p>
                <div className="space-y-0.5">
                    <Link
                        href="/profile/orders"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                            <Package className="h-4 w-4" />
                        </span>
                        My Orders
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                    </Link>
                    <Link
                        href="/wishlist"
                        className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 active:bg-slate-100"
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-100 text-pink-600">
                            <Heart className="h-4 w-4" />
                        </span>
                        Wishlist
                        <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />
                    </Link>
                </div>
            </div>

            <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-semibold text-red-600 shadow-sm transition-colors hover:bg-red-50 active:bg-red-100"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                    <LogOut className="h-4 w-4" />
                </span>
                Sign Out
            </button>
        </div>
    )
}
