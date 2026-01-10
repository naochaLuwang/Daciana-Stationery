"use client"

import { useCart } from "@/components/store/use-cart";
import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export function CartButton() {
    const [mounted, setMounted] = useState(false);
    const total = useCart((state) => state.totalItems());

    // Fix hydration mismatch
    useEffect(() => { setMounted(true) }, []);

    if (!mounted) return <ShoppingCart className="w-5 h-5 text-slate-400" />;

    return (
        <Link href="/cart" className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ShoppingCart className="w-5 h-5" />
            {total > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full animate-in zoom-in">
                    {total}
                </span>
            )}
        </Link>
    );
}