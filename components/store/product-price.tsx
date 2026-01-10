import { calculateDiscountedPrice } from "@/lib/price-helper"
import { Badge } from "lucide-react";

export function ProductPrice({ price, discountType, discountValue }: any) {
    const finalPrice = calculateDiscountedPrice(price, discountType, discountValue);
    const hasDiscount = discountType !== 'none' && discountValue > 0;

    return (
        <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-slate-900">
                ₹{finalPrice.toLocaleString('en-IN')}
            </span>

            {hasDiscount && (
                <>
                    <span className="text-sm text-slate-400 line-through">
                        ₹{Number(price).toLocaleString('en-IN')}
                    </span>
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">
                        {discountType === 'percentage' ? `${discountValue}% OFF` : `₹${discountValue} OFF`}
                    </Badge>
                </>
            )}
        </div>
    )
}