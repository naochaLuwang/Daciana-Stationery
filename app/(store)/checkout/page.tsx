import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import CheckoutClient from "./checkout-client" // We rename the client component

export default async function CheckoutPage() {
    const supabase = await createClient()

    // 1. Get the authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login?next=/checkout")

    // 2. Fetch the profile (including address fields)
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // 3. Pass profile data to the Client Component
    return <CheckoutClient profile={profile} />
}