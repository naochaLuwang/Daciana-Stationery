"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, ProductFormValues } from "@/lib/validations/product"
import { createProduct, updateProduct } from "@/app/actions/products"
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
import { ImagePlus, X, GripVertical, Trash2, Plus } from "lucide-react"

interface ProductFormProps {
    categories: { id: string; name: string }[]
    initialData?: any
    isEdit?: boolean
}

export default function ProductForm({ categories, initialData, isEdit }: ProductFormProps) {
    const router = useRouter()
    const [files, setFiles] = useState<File[]>([])
    const [existingImages, setExistingImages] = useState<string[]>(initialData?.existing_images || [])

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: initialData || {
            name: "",
            slug: "",
            description: "",
            brand: "",
            has_variants: false,
            category_ids: [],
            base_price: 0,
            stock: 0,
            discount_type: "none" as const,
            discount_value: 0,
            image_files: [],
            existing_images: [],
            variants: [],
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
        if (!isEdit) {
            form.setValue(
                "slug",
                val.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w-]+/g, "")
            )
        }
    }

    const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = Array.from(e.target.files || [])
        setFiles((prev) => [...prev, ...selected])
    }

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index))
    }

    const removeExistingImage = (url: string) => {
        setExistingImages((prev) => prev.filter((u) => u !== url))
    }

    async function onSubmit(data: ProductFormValues) {
        const formData = new FormData()

        formData.append("payload", JSON.stringify({
            ...data,
            existing_images: isEdit ? existingImages : [],
        }))

        for (const file of files) {
            formData.append("files", file)
        }

        let res
        if (isEdit && initialData?.id) {
            res = await updateProduct(initialData.id, formData)
        } else {
            res = await createProduct(formData)
        }

        if (res.success) {
            toast.success(isEdit ? "Product updated!" : "Product created!")
            router.push("/admin/products")
            router.refresh()
        } else {
            toast.error(res.error || "Something went wrong")
        }
    }

    const categoryOptions = categories.map((c) => ({
        value: c.id,
        label: c.name,
    }))

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10 max-w-4xl">
                {/* Basic Info */}
                <div className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-tight">Basic Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Product Name</FormLabel>
                                    <FormControl><Input {...field} onChange={onNameChange} placeholder="e.g. Premium Notebook" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="slug"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Slug</FormLabel>
                                    <FormControl><Input {...field} placeholder="premium-notebook" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="brand"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Brand</FormLabel>
                                    <FormControl><Input {...field} placeholder="DACIANA" /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="category_ids"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categories</FormLabel>
                                    <FormControl>
                                        <MultiSelect
                                            options={categoryOptions}
                                            selected={field.value || []}
                                            onChange={field.onChange}
                                            placeholder="Select categories"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl><Textarea {...field} rows={4} placeholder="Product description..." /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Images */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-tight">Images</h3>

                    {/* Existing Images (Edit mode) */}
                    {existingImages.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {existingImages.map((url, i) => (
                                <div key={url} className="relative w-24 h-24 rounded-xl overflow-hidden border group">
                                    <Image fill src={url} alt={`Image ${i + 1}`} className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(url)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* New Files */}
                    <div className="flex flex-wrap gap-3">
                        {files.map((file, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border group">
                                <Image fill src={URL.createObjectURL(file)} alt={`Upload ${i + 1}`} className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeFile(i)}
                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
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

                {/* Has Variants Toggle */}
                <div className="space-y-6">
                    <FormField
                        control={form.control}
                        name="has_variants"
                        render={({ field }) => (
                            <FormItem className="flex items-center gap-4">
                                <FormLabel className="mb-0">This product has variants (sizes/colors)</FormLabel>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                {/* Simple Product Fields */}
                {!hasVariants && (
                    <div className="space-y-6 p-6 bg-slate-50 rounded-2xl">
                        <h3 className="text-sm font-black uppercase tracking-tight">Pricing & Stock</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="base_price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Base Price (₹)</FormLabel>
                                        <FormControl><Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="stock"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stock</FormLabel>
                                        <FormControl><Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="discount_type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">No Discount</SelectItem>
                                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                                <SelectItem value="amount">Fixed Amount (₹)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="discount_value"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Discount Value</FormLabel>
                                        <FormControl><Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>
                )}

                {/* Variants */}
                {hasVariants && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase tracking-tight">Variants</h3>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => append({
                                    title: "",
                                    price: 0,
                                    stock: 0,
                                    sku: "",
                                    hex_code: null,
                                    discount_type: "none",
                                    discount_value: 0,
                                    variant_image_urls: [],
                                })}
                                className="text-xs font-bold"
                            >
                                <Plus className="w-3 h-3 mr-1" /> Add Variant
                            </Button>
                        </div>

                        {fields.map((field, index) => (
                            <div key={field.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 relative">
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.title`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Title</FormLabel>
                                                <FormControl><Input {...field} placeholder="e.g. Small / Red" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.price`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Price (₹)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.stock`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Stock</FormLabel>
                                                <FormControl>
                                                    <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.sku`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>SKU</FormLabel>
                                                <FormControl><Input {...field} placeholder="Auto-generated if empty" /></FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.hex_code`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Color Hex (optional)</FormLabel>
                                                <div className="flex gap-2 items-center">
                                                    <FormControl>
                                                        <Input {...field} value={field.value || ""} onChange={e => field.onChange(e.target.value || null)} placeholder="#FF0000" />
                                                    </FormControl>
                                                    {field.value && (
                                                        <div className="w-10 h-10 rounded-full border shrink-0" style={{ backgroundColor: field.value }} />
                                                    )}
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`variants.${index}.discount_type`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Discount Type</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="none">None</SelectItem>
                                                        <SelectItem value="percentage">%</SelectItem>
                                                        <SelectItem value="amount">₹</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name={`variants.${index}.discount_value`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Discount Value</FormLabel>
                                            <FormControl>
                                                <Input type="number" min="0" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Submit */}
                <div className="flex gap-4 pt-6 border-t">
                    <Button type="submit" className="bg-slate-900 text-white h-12 px-8 rounded-xl font-bold" disabled={form.formState.isSubmitting}>
                        {form.formState.isSubmitting
                            ? "Saving..."
                            : isEdit ? "Update Product" : "Create Product"
                        }
                    </Button>
                    <Button type="button" variant="outline" className="h-12 px-8 rounded-xl" onClick={() => router.back()}>
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    )
}
