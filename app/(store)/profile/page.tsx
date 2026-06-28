import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/store/profile-form"
import { AccountHeader } from "@/components/store/account-header"
import { AddressBook } from "@/components/store/address-book"

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    const { count: orderCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-black text-slate-900">Account</h1>
                <p className="mt-1 text-sm text-slate-500">Manage your profile, addresses and orders</p>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-5 lg:gap-8">
                <div className="lg:col-span-2">
                    <AccountHeader user={user} profile={profile} orderCount={orderCount} />
                </div>
                <div className="flex flex-col gap-6 lg:col-span-3">
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <ProfileForm profile={profile} />
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                        <AddressBook userId={user.id} />
                    </div>
                </div>
            </div>
        </div>
    )
}
