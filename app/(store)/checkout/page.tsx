import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import CheckoutClient from "./checkout-client"

export default async function CheckoutPage() {
    const supabase = await createClient()

    // 1. Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()

    // Redirect to login if no session exists
    if (!user) {
        redirect("/login?next=/checkout")
    }

    // 2. Fetch the profile (including address fields)
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // 3. Pass profile data to the Client Component
    // We pass an empty object as fallback if profile is not found
    return (
        <main className="min-h-screen bg-slate-50/50">
            <CheckoutClient profile={profile || {}} />
        </main>
    )
}