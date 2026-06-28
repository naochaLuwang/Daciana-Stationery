export function checkPromoEligibility(promo: any, items: any[]) {
    const eligibleItems = items.filter((item: any) => {
        if (promo.apply_to === "all") return true
        if (promo.apply_to === "specific_products") {
            const allowedIds = promo.promo_code_products?.map((p: any) => String(p.product_id)) || []
            return allowedIds.includes(String(item.productId || item.id))
        }
        return false
    })

    const hasEligibleItems = eligibleItems.length > 0
    const eligibleSubtotal = eligibleItems.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0)
    const minAmount = Number(promo.min_order_amount || 0)
    const isMinMet = eligibleSubtotal >= minAmount

    const reasons: string[] = []
    if (!hasEligibleItems) {
        if (promo.apply_to === "specific_products") reasons.push("Not applicable to items in your bag")
    } else if (!isMinMet) {
        reasons.push(`Add ₹${(minAmount - eligibleSubtotal).toLocaleString()} more to unlock`)
    }

    return { isEligible: hasEligibleItems && isMinMet, eligibleItems, eligibleSubtotal, reasons }
}
