import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import CheckoutClient from "./checkout-client"
import { getActivePromos } from "@/app/actions/promo"

export default async function CheckoutPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect("/login?redirect=/checkout")
    }

    const [addressRes, promos] = await Promise.all([
        supabase
            .from("addresses")
            .select("*, shipping_methods:shipping_method_id (*)")
            .eq("user_id", user.id)
            .order("is_default", { ascending: false }),
        getActivePromos(),
    ])

    const initialAddresses = addressRes.data || []
    const allPromos = promos || []

    return (
        <main className="min-h-screen bg-slate-50/50">
            <CheckoutClient
                userId={user.id}
                initialAddresses={initialAddresses}
                allPromos={allPromos}
            />
        </main>
    )
}
