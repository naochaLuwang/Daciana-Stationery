"use client"

import * as React from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, type ProductFormValues } from "@/lib/validations/product"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Trash2, Plus, Upload, Info, Pipette, Loader2, IndianRupee, CheckCircle2, Tag } from "lucide-react"
import { createProduct, updateProduct } from "@/app/actions/products"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProductFormProps {
    categories: { id: string; name: string }[]
    initialData?: any
    isEdit?: boolean
}

export default function ProductForm({ categories = [], initialData, isEdit = false }: ProductFormProps) {
    const [mounted, setMounted] = React.useState(false)
    const [previews, setPreviews] = React.useState<string[]>([])
    const [isPending, setIsPending] = React.useState(false)
    const router = useRouter()

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: "",
            slug: "",
            description: "",
            brand: "",
            has_variants: false,
            category_ids: [],
            base_price: 0,
            stock: 0,
            discount_type: "none",
            discount_value: 0,
            image_files: [],
            existing_images: [],
            variants: []
        }
    })

    // 1. AUTO-SLUG LOGIC
    const nameWatch = form.watch("name")
    React.useEffect(() => {
        if (nameWatch && !isEdit) {
            const generatedSlug = nameWatch
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            form.setValue("slug", generatedSlug, { shouldValidate: true });
        }
    }, [nameWatch, form, isEdit]);

    React.useEffect(() => {
        setMounted(true)
        if (initialData) {
            const normalizedData = {
                ...initialData,
                base_price: Number(initialData.base_price) || 0,
                stock: !initialData.has_variants
                    ? (initialData.variants?.find((v: any) => v.is_default)?.stock || 0)
                    : 0,
                discount_value: Number(initialData.discount_value) || 0,
                variants: initialData.variants?.filter((v: any) => !v.is_default).map((v: any) => ({
                    ...v,
                    price: Number(v.price) || 0,
                    stock: Number(v.stock) || 0,
                    discount_value: Number(v.discount_value) || 0,
                    variant_image_urls: v.variant_images?.map((img: any) => img.url) || []
                })) || []
            }
            form.reset(normalizedData)
            if (initialData.product_images) {
                setPreviews(initialData.product_images.map((img: any) => img.url))
            }
        }
    }, [initialData, form])

    const { fields: vFields, append: addV, remove: remV } = useFieldArray({
        control: form.control,
        name: "variants"
    })

    const hasVariants = form.watch("has_variants")

    const handleNumberChange = (val: string, onChange: (v: number) => void) => {
        const clean = val.replace(/[^0-9.]/g, "")
        onChange(clean === "" ? 0 : parseFloat(clean))
    }

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        const fileArray = Array.from(files)
        const currentFiles = form.getValues("image_files") || []
        form.setValue("image_files", [...currentFiles, ...fileArray])
        const newPreviews = fileArray.map(file => URL.createObjectURL(file))
        setPreviews(prev => [...prev, ...newPreviews])
    }

    const removeImage = (index: number) => {
        const urlToRemove = previews[index]
        setPreviews(prev => prev.filter((_, i) => i !== index))
        const currentFiles = form.getValues("image_files") || []
        const existingImagesCount = initialData?.product_images?.length || 0
        const fileIndex = index - existingImagesCount
        if (fileIndex >= 0) {
            form.setValue("image_files", currentFiles.filter((_, i) => i !== fileIndex))
        }
        const variants = form.getValues("variants")
        variants.forEach((v, vIdx) => {
            if (v.variant_image_urls?.includes(urlToRemove)) {
                form.setValue(`variants.${vIdx}.variant_image_urls`, v.variant_image_urls.filter(u => u !== urlToRemove))
            }
        })
    }

    const toggleVariantImage = (variantIndex: number, url: string) => {
        const current = form.getValues(`variants.${variantIndex}.variant_image_urls`) || []
        const next = current.includes(url) ? current.filter(u => u !== url) : [...current, url]
        form.setValue(`variants.${variantIndex}.variant_image_urls`, next)
    }

    async function onSubmit(values: ProductFormValues) {
        setIsPending(true)
        try {
            const formData = new FormData()

            // 2. PAYLOAD CLEANUP
            // Ensure we don't send validation-failing empty variants if toggle is off
            const actualVariants = values.has_variants
                ? values.variants.map((v) => ({
                    ...v,
                    image_indices: (v.variant_image_urls || [])
                        .map(url => previews.indexOf(url))
                        .filter(idx => idx !== -1)
                }))
                : [];

            const { image_files, ...rest } = values
            const payload = {
                ...rest,
                variants: actualVariants,
                existing_images: previews.filter(p => !p.startsWith('blob:'))
            }

            formData.append("payload", JSON.stringify(payload))
            values.image_files?.forEach((file: File) => formData.append("files", file))

            const res = isEdit ? await updateProduct(initialData.id, formData) : await createProduct(formData)

            if (res.success) {
                toast.success(isEdit ? "Product updated" : "Product created")
                router.push("/admin/products")
                router.refresh()
            } else {
                toast.error(res.error)
            }
        } catch (e) {
            toast.error("Submission failed")
        } finally {
            setIsPending(false)
        }
    }

    if (!mounted) return null

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (err) => {
                console.error("Validation Errors:", err);
                toast.error("Form validation failed. Check shade names and prices.");
            })} className="space-y-8 p-1">

                <div className="flex items-center justify-between border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{isEdit ? "Edit Product" : "New Product"}</h1>
                        <p className="text-muted-foreground text-sm">Manage product shade variants and gallery.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isPending} className="font-bold min-w-[140px]">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (isEdit ? "Save Changes" : "Publish Product")}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Info className="w-4 h-4" /> Basic Details</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g. Matte Lipstick" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="brand" render={({ field }) => (
                                        <FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="e.g. Luxe Beauty" {...field} /></FormControl></FormItem>
                                    )} />
                                </div>

                                <FormField control={form.control} name="slug" render={({ field }) => (
                                    <FormItem className="hidden"><FormControl><Input {...field} /></FormControl></FormItem>
                                )} />

                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} placeholder="Product storytelling..." {...field} value={field.value ?? ""} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="category_ids" render={({ field }) => (
                                    <FormItem><FormLabel>Categories</FormLabel><MultiSelect options={categories.map(c => ({ label: c.name, value: c.id }))} selected={field.value || []} onChange={field.onChange} /></FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        <Card className={hasVariants ? "border-primary/40 bg-primary/5 shadow-md" : ""}>
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                                <CardTitle className="text-lg flex items-center gap-2"><Pipette className="w-4 h-4" /> Shade Variants</CardTitle>
                                <FormField control={form.control} name="has_variants" render={({ field }) => (
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Multiple Shades</span>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={(checked) => {
                                                field.onChange(checked);
                                                // 3. TOGGLE RESET LOGIC
                                                if (!checked) {
                                                    form.setValue("variants", []); // Clears variant validation errors
                                                } else if (vFields.length === 0) {
                                                    addV({ title: "", price: 0, stock: 0, discount_type: "none", discount_value: 0, hex_code: null, variant_image_urls: [] });
                                                }
                                            }}
                                        />
                                    </div>
                                )} />
                            </CardHeader>
                            <CardContent className="pt-6">
                                {hasVariants ? (
                                    <div className="space-y-4">
                                        {vFields.map((field, index) => {
                                            const selectedImages = form.watch(`variants.${index}.variant_image_urls`) || [];
                                            return (
                                                <div key={field.id} className="p-4 border rounded-lg bg-background space-y-4 shadow-sm relative group">
                                                    <div className="grid grid-cols-12 gap-3 items-end">
                                                        <div className="col-span-1 flex flex-col items-center">
                                                            <div className="w-8 h-8 rounded-full border shadow-inner mb-2" style={{ backgroundColor: form.watch(`variants.${index}.hex_code`) || '#e2e8f0' }} />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <FormLabel className="text-[10px]">Shade Name</FormLabel>
                                                            <Input placeholder="Name" {...form.register(`variants.${index}.title`)} />
                                                            <FormMessage />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <FormLabel className="text-[10px]">Images</FormLabel>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button type="button" variant="outline" className="w-full h-10 border-dashed text-[10px] uppercase font-bold">
                                                                        {selectedImages.length} Linked
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-md">
                                                                    <DialogHeader><DialogTitle>Link Images to {form.watch(`variants.${index}.title`) || 'Shade'}</DialogTitle></DialogHeader>
                                                                    <div className="grid grid-cols-3 gap-3 pt-4">
                                                                        {previews.map((url, i) => (
                                                                            <button key={i} type="button" onClick={() => toggleVariantImage(index, url)} className={`relative aspect-square rounded-md border-2 overflow-hidden ${selectedImages.includes(url) ? 'border-primary' : 'border-transparent opacity-60'}`}>
                                                                                <img src={url} className="w-full h-full object-cover" alt="preview" />
                                                                                {selectedImages.includes(url) && <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full" />}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <FormLabel className="text-[10px]">Hex Code</FormLabel>
                                                            <Input placeholder="#000000" {...form.register(`variants.${index}.hex_code`)} />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => remV(index)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-3 pt-3 border-t border-dashed">
                                                        <div><FormLabel className="text-[10px]">Price (₹)</FormLabel><Input type="text" value={form.watch(`variants.${index}.price`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.price`, v))} /></div>
                                                        <div><FormLabel className="text-[10px]">Stock</FormLabel><Input type="text" value={form.watch(`variants.${index}.stock`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.stock`, v))} /></div>
                                                        <div>
                                                            <FormLabel className="text-[10px]">Disc. Type</FormLabel>
                                                            <Select onValueChange={(v) => form.setValue(`variants.${index}.discount_type`, v as any)} value={form.watch(`variants.${index}.discount_type`)}>
                                                                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                                                <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="percentage">%</SelectItem><SelectItem value="amount">₹</SelectItem></SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div><FormLabel className="text-[10px]">Disc. Val</FormLabel><Input type="text" value={form.watch(`variants.${index}.discount_value`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.discount_value`, v))} /></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => addV({ title: "", price: 0, stock: 0, discount_type: "none", discount_value: 0, hex_code: "#000000", variant_image_urls: [] })}>
                                            <Plus className="w-4 h-4 mr-2" /> Add Shade Variant
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-12 text-center border-2 border-dashed rounded-lg text-muted-foreground flex flex-col items-center">
                                        <p className="text-sm italic mb-1">Individual product mode active.</p>
                                        <p className="text-[10px] uppercase font-bold tracking-wider">Configure pricing & stock in the sidebar</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {!hasVariants && (
                            <Card className="bg-slate-50 border-blue-100 shadow-sm">
                                <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Inventory & Pricing</CardTitle></CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField control={form.control} name="base_price" render={({ field }) => (
                                        <FormItem><FormLabel>Price (INR)</FormLabel><FormControl><Input type="text" value={field.value} onChange={(e) => handleNumberChange(e.target.value, field.onChange)} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="stock" render={({ field }) => (
                                        <FormItem><FormLabel>Total Stock</FormLabel><FormControl><Input type="text" value={field.value} onChange={(e) => handleNumberChange(e.target.value, field.onChange)} /></FormControl></FormItem>
                                    )} />
                                    <div className="pt-4 border-t space-y-4">
                                        <h4 className="text-xs font-bold flex items-center gap-2 uppercase text-slate-500"><Tag className="w-3 h-3" /> Sale Settings</h4>
                                        <FormField control={form.control} name="discount_type" render={({ field }) => (
                                            <FormItem>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
                                                    <SelectContent><SelectItem value="none">Regular Price</SelectItem><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="amount">Fixed Discount (₹)</SelectItem></SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="discount_value" render={({ field }) => (
                                            <FormItem><FormControl><Input type="text" placeholder="Discount value" value={field.value} onChange={(e) => handleNumberChange(e.target.value, field.onChange)} /></FormControl></FormItem>
                                        )} />
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <Card>
                            <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> Product Gallery</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer relative hover:bg-slate-50 transition-colors">
                                    <Input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                                    <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                                    <p className="text-[10px] font-bold uppercase text-muted-foreground">Drop files or click to upload</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative aspect-square rounded border group overflow-hidden bg-slate-100">
                                            <img src={src} className="object-cover w-full h-full" alt="gallery" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/60 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4 text-white" />
                                            </button>
                                            {i === 0 && <div className="absolute top-0 left-0 bg-primary text-[8px] text-white px-1 font-bold uppercase">Main</div>}
                                        </div>
                                    ))}
                                </div>
                                <FormDescription className="text-[10px]">The first image will be used as the product thumbnail.</FormDescription>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    )
}