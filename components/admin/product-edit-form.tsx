"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormValues } from "@/lib/validations/product"
import { updateProduct } from "@/app/actions/products"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { MultiSelect } from "@/components/ui/multi-select"
import { ImagePlus, X, Trash2, Plus } from "lucide-react"

interface ProductEditFormProps {
    product: any
    categories: { id: string; name: string }[]
}

export default function ProductEditForm({ product, categories }: ProductEditFormProps) {
    const router = useRouter()
    const [files, setFiles] = useState<File[]>([])
    const [existingImages, setExistingImages] = useState<string[]>(
        (product.product_images || []).sort((a: any, b: any) => a.position - b.position).map((img: any) => img.url)
    )

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            brand: product.brand || "",
            has_variants: product.has_variants || false,
            category_ids: (product.product_categories || []).map((pc: any) => pc.category_id),
            base_price: Number(product.base_price || 0),
            stock: Number(product.stock || 0),
            discount_type: product.discount_type || "none",
            discount_value: Number(product.discount_value || 0),
            image_files: [],
            existing_images: [],
            variants: (product.product_variants || []).map((v: any) => ({
                id: v.id,
                title: v.title || "",
                price: Number(v.price || 0),
                stock: Number(v.stock || 0),
                sku: v.sku || "",
                hex_code: v.hex_code || null,
                discount_type: v.discount_type || "none",
                discount_value: Number(v.discount_value || 0),
                variant_image_urls: (v.variant_images || []).sort((a: any, b: any) => a.position - b.position).map((vi: any) => vi.url),
                image_indices: [],
            })),
        },
    })

    const hasVariants = form.watch("has_variants")
    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "variants",
    })

    const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        form.setValue("name", val)
        form.setValue(
            "slug",
            val.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
        )
    }

    const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles((prev) => [...prev, ...Array.from(e.target.files || [])])
    }

    const removeExistingImage = (url: string) => {
        setExistingImages((prev) => prev.filter((u) => u !== url))
    }

    async function onSubmit(data: ProductFormValues) {
        const formData = new FormData()
        formData.append("payload", JSON.stringify({
            ...data,
            existing_images: existingImages,
        }))
        for (const file of files) {
            formData.append("files", file)
        }

        const res = await updateProduct(product.id, formData)
        if (res.success) {
            toast.success("Product updated!")
            router.push("/admin/products")
            router.refresh()
        } else {
            toast.error(res.error || "Update failed")
        }
    }

    const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }))

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-4xl">
                <div className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tight">Edit Product</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} onChange={onNameChange} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="slug" render={({ field }) => (
                            <FormItem><FormLabel>Slug</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="brand" render={({ field }) => (
                            <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="category_ids" render={({ field }) => (
                            <FormItem><FormLabel>Categories</FormLabel><FormControl>
                                <MultiSelect options={categoryOptions} selected={field.value || []} onChange={field.onChange} placeholder="Select categories" />
                            </FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-tight">Images</h3>
                    {existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {existingImages.map((url) => (
                                <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border group">
                                    <Image fill src={url} alt="" className="object-cover" />
                                    <button type="button" onClick={() => removeExistingImage(url)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                        {files.map((file, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border group">
                                <Image fill src={URL.createObjectURL(file)} alt="" className="object-cover" />
                                <button type="button" onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                        <label className="w-24 h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition">
                            <ImagePlus className="w-6 h-6 text-slate-400" />
                            <span className="text-[9px] mt-1 text-slate-400 font-bold">Upload</span>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={onImageSelect} />
                        </label>
                    </div>
                </div>

                <FormField control={form.control} name="has_variants" render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                        <FormLabel className="mb-0">Has variants</FormLabel>
                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    </FormItem>
                )} />

                {!hasVariants && (
                    <div className="space-y-6 p-6 bg-slate-50 rounded-2xl">
                        <h3 className="text-sm font-black uppercase tracking-tight">Pricing & Stock</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="base_price" render={({ field }) => (
                                <FormItem><FormLabel>Price (₹)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="stock" render={({ field }) => (
                                <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField control={form.control} name="discount_type" render={({ field }) => (
                                <FormItem><FormLabel>Discount Type</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            <SelectItem value="percentage">%</SelectItem>
                                            <SelectItem value="amount">₹</SelectItem>
                                        </SelectContent>
                                    </Select><FormMessage /></FormItem>
                            )} />
                            <FormField control={form.control} name="discount_value" render={({ field }) => (
                                <FormItem><FormLabel>Value</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                    </div>
                )}

                {hasVariants && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase tracking-tight">Variants</h3>
                            <Button type="button" variant="outline" size="sm" onClick={() => append({
                                title: "", price: 0, stock: 0, sku: "", hex_code: null,
                                discount_type: "none", discount_value: 0, variant_image_urls: [],
                            })}>
                                <Plus className="w-3 h-3 mr-1" /> Add Variant
                            </Button>
                        </div>
                        {fields.map((field, index) => (
                            <div key={field.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                                <button type="button" onClick={() => remove(index)} className="absolute top-4 right-4 text-red-500"><Trash2 className="w-4 h-4" /></button>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name={`variants.${index}.title`} render={({ field }) => (
                                        <FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`variants.${index}.price`} render={({ field }) => (
                                        <FormItem><FormLabel>Price</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`variants.${index}.stock`} render={({ field }) => (
                                        <FormItem><FormLabel>Stock</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField control={form.control} name={`variants.${index}.sku`} render={({ field }) => (
                                        <FormItem><FormLabel>SKU</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`variants.${index}.hex_code`} render={({ field }) => (
                                        <FormItem><FormLabel>Color Hex</FormLabel>
                                            <div className="flex gap-2 items-center">
                                                <FormControl><Input {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value || null)} /></FormControl>
                                                {field.value && <div className="w-8 h-8 rounded-full border shrink-0" style={{ backgroundColor: field.value }} />}
                                            </div><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name={`variants.${index}.discount_type`} render={({ field }) => (
                                        <FormItem><FormLabel>Discount</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    <SelectItem value="none">None</SelectItem>
                                                    <SelectItem value="percentage">%</SelectItem>
                                                    <SelectItem value="amount">₹</SelectItem>
                                                </SelectContent>
                                            </Select><FormMessage /></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name={`variants.${index}.discount_value`} render={({ field }) => (
                                    <FormItem><FormLabel>Discount Value</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-4 pt-6 border-t">
                    <Button type="submit" className="bg-slate-900 text-white h-12 px-8 rounded-xl font-bold" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting ? "Saving..." : "Update Product"}
                    </Button>
                    <Button type="button" variant="outline" className="h-12 px-8 rounded-xl" onClick={() => router.back()}>Cancel</Button>
                </div>
            </form>
        </Form>
    )
}
