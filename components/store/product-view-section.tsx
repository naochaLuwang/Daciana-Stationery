"use client"

import { useState } from "react"
import { ProductImages } from "./product-images"
import { VariantSelector } from "./variant-selector"
import { Badge } from "@/components/ui/badge"

export function ProductViewSection({ product }: { product: any }) {
    const defaultVariant = product.variants.find((v: any) => v.is_default) || product.variants[0];

    // Logic to extract variant images
    const getVariantImages = (variant: any) => {
        if (variant?.variant_image_urls && variant.variant_image_urls.length > 0) {
            return variant.variant_image_urls.map((url: string) => ({ url }));
        }
        return product.images; // Fallback to global gallery
    };

    // State to track which image is currently featured
    const [displayImages, setDisplayImages] = useState(getVariantImages(defaultVariant));
    const [mainImage, setMainImage] = useState(defaultVariant?.image_url || product.thumbnail_url);

    const handleVariantChange = (variant: any) => {
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
            <div className="space-y-6">
                <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest">
                        {product.brand}
                    </p>
                    <h1 className="text-4xl font-bold mt-2">{product.name}</h1>
                </div>

                <p className="text-slate-600 leading-relaxed">
                    {product.description}
                </p>

                <hr />

                {/* We pass the setActiveImage function to the selector */}
                <VariantSelector
                    product={product}
                    variants={product.variants}
                    onVariantChange={handleVariantChange}
                />

                {/* <div className="pt-4">
                    <Badge variant="outline" className="px-4 py-1">
                        Free Delivery on orders over ₹499
                    </Badge>
                </div> */}
            </div>
        </div>
    )
}