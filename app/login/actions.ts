"use server"

import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const email = formData.get("email") as string
    const password = formData.get("password") as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: error.message }
    }

    // Check if they are an admin to redirect them to the right place
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .single()

    if (profile?.is_admin) {
        redirect("/admin")
    }

    redirect("/")
}