"use client"

import { useState } from "react"
import { ProductImages } from "./product-images"
import { VariantSelector } from "./variant-selector"
import { Badge } from "@/components/ui/badge"

export function ProductViewSection({ product }: { product: any }) {
    // Logic for variants
    const defaultVariant = product.variants.find((v: any) => v.is_default) || product.variants[0];

    const getVariantImages = (variant: any) => {
        if (variant?.variant_image_urls && variant.variant_image_urls.length > 0) {
            return variant.variant_image_urls.map((url: string) => ({ url }));
        }
        return product.images;
    };

    const [displayImages, setDisplayImages] = useState(getVariantImages(defaultVariant));
    const [mainImage, setMainImage] = useState(defaultVariant?.image_url || product.thumbnail_url);
    const [selectedVariant, setSelectedVariant] = useState(defaultVariant);

    const handleVariantChange = (variant: any) => {
        setSelectedVariant(variant);
        const filtered = getVariantImages(variant);
        setDisplayImages(filtered);
        setMainImage(variant.image_url || filtered[0]?.url);
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left: Image Gallery */}
            <ProductImages
                images={displayImages}
                thumbnail={product.thumbnail_url}
                activeImageFromVariant={mainImage}
            />

            {/* Right: Product Info & Selectors */}
            <div className="flex flex-col">
                {/* 1. Header Info */}
                <div className="mb-6">
                    <p className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">
                        {product.brand}
                    </p>
                    <h1 className="text-2xl font-bold mt-2 text-slate-900">{product.name}</h1>
                </div>

                {/* 2. Pricing Section (Added Tax Label) */}
                {/* <div className="mb-8">
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black text-slate-900">
                            ₹{selectedVariant?.price || product.base_price}
                        </span>
                      
                    </div>
                    <p className="text-[11px] font-bold uppercase tracking-tighter text-emerald-600 mt-1">
                        Inclusive of all taxes
                    </p>
                </div> */}

                <hr className="mb-8" />

                {/* 3. Variant Selector & Add to Cart */}
                {/* Note: Ensure your VariantSelector contains the Add to Cart button */}
                <div className="mb-10">
                    <VariantSelector
                        product={product}
                        variants={product.variants}
                        onVariantChange={handleVariantChange}
                    />
                </div>

                {/* 4. Product Description (Moved below Add to Cart) */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">
                        Product Description
                    </h3>
                    <p className="text-slate-600 leading-relaxed text-sm md:text-base">
                        {product.description}
                    </p>
                </div>

                {/* <div className="pt-8">
                    <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">
                            Free Delivery on orders over ₹499
                        </span>
                    </div>
                </div> */}
            </div>
        </div>
    )
}