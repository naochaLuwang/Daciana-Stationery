"use server"

import { createClient } from "@/utils/supabase/server"

const PRODUCT_SELECT = `
  *,
  product_images(url, alt),
  product_variants(*)
`

export async function getHomepageCategories() {
    const supabase = await createClient()
    const { data } = await supabase
        .from("categories")
        .select("id, name, slug, image_url")
        .is("parent_id", null)
        .order("name")
    return data || []
}

export async function getDealProducts() {
    const supabase = await createClient()
    const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "active")
        .or("discount_type.eq.percentage,discount_type.eq.amount")
        .order("discount_value", { ascending: false })
        .limit(8)
    return data || []
}

export async function getFeaturedProducts() {
    const supabase = await createClient()
    const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "active")
        .limit(8)
    return data || []
}

export async function getTrendingProducts() {
    const supabase = await createClient()
    const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8)
    return data || []
}

export async function getNewArrivals() {
    const supabase = await createClient()
    const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(8)
    return data || []
}

export async function getProductsByPage(page: number, limit: number = 8) {
    const supabase = await createClient()
    const offset = page * limit

    const { data, count } = await supabase
        .from("products")
        .select(PRODUCT_SELECT, { count: "exact" })
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1)

    return {
        products: data || [],
        total: count || 0,
        hasMore: (offset + limit) < (count || 0)
    }
}

export async function getProductsByIds(ids: string[]) {
    if (ids.length === 0) return []
    const supabase = await createClient()
    const { data } = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .in("id", ids)
    return data || []
}
