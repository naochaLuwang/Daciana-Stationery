import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
        return NextResponse.json({ products: [] })
    }

    const supabase = await createClient()

    const { data: products } = await supabase
        .from("products")
        .select("id, name, slug, thumbnail_url, brand")
        .textSearch("search_vector", q, { type: "websearch", config: "english" })
        .eq("status", "active")
        .limit(5)

    return NextResponse.json({ products: products || [] })
}
