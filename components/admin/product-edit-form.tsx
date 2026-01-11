// "use client"

// import * as React from "react"
// import { useForm, useFieldArray } from "react-hook-form"
// import { zodResolver } from "@hookform/resolvers/zod"
// import { productSchema, type ProductFormValues } from "@/lib/validations/product"
// import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form"
// import { Input } from "@/components/ui/input"
// import { Button } from "@/components/ui/button"
// import { Switch } from "@/components/ui/switch"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { MultiSelect } from "@/components/ui/multi-select"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
// import {
//     Trash2, Plus, Upload, Info, Pipette, Loader2,
//     IndianRupee, CheckCircle2, Tag
// } from "lucide-react"
// import { updateProduct } from "@/app/actions/products"
// import { toast } from "sonner"
// import { useRouter } from "next/navigation"

// interface ProductEditFormProps {
//     product: any
//     categories: { id: string; name: string }[]
// }

// export default function ProductEditForm({ product, categories }: ProductEditFormProps) {
//     const [mounted, setMounted] = React.useState(false)
//     const [previews, setPreviews] = React.useState<string[]>([])
//     const [isPending, setIsPending] = React.useState(false)
//     const router = useRouter()

//     // Inside ProductEditForm component
//     const form = useForm<ProductFormValues>({
//         resolver: zodResolver(productSchema) as any,
//         defaultValues: {
//             name: product.name || "",
//             slug: product.slug || "",
//             description: product.description || "",
//             brand: product.brand || "",
//             has_variants: !!product.has_variants,
//             category_ids: product.product_categories?.map((c: any) => c.category_id) || [],
//             base_price: Number(product.base_price) || 0,
//             stock: Number(product.stock) || 0,
//             discount_type: (product.discount_type as "none" | "percentage" | "amount") || "none",
//             discount_value: Number(product.discount_value) || 0,
//             // Ensure nested variants match the schema defaults
//             variants: product.product_variants?.map((v: any) => ({
//                 id: v.id,
//                 title: v.title || "",
//                 price: Number(v.price) || 0,
//                 stock: Number(v.stock) || 0,
//                 sku: v.sku || "",
//                 hex_code: v.hex_code || "#000000",
//                 discount_type: (v.discount_type as "none" | "percentage" | "amount") || "none",
//                 discount_value: Number(v.discount_value) || 0,
//                 variant_image_urls: [], // Populated via useEffect usually
//                 image_indices: []
//             })) || [],
//             image_files: [],
//             existing_images: product.product_images || [],
//         }
//     });

//     React.useEffect(() => {
//         setMounted(true)
//         // Load initial images into previews
//         if (product.product_images) {
//             const sortedImages = [...product.product_images].sort((a, b) => a.position - b.position)
//             setPreviews(sortedImages.map((img: any) => img.url))
//         }
//     }, [product])

//     const { fields: vFields, append: addV, remove: remV } = useFieldArray({
//         control: form.control,
//         name: "variants"
//     })

//     const hasVariants = form.watch("has_variants")

//     const handleNumberChange = (val: string, onChange: (v: number) => void) => {
//         const clean = val.replace(/[^0-9.]/g, "")
//         onChange(clean === "" ? 0 : parseFloat(clean))
//     }

//     const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const files = e.target.files
//         if (!files) return
//         const fileArray = Array.from(files)
//         const currentFiles = form.getValues("image_files") || []

//         form.setValue("image_files", [...currentFiles, ...fileArray])
//         const newPreviews = fileArray.map(file => URL.createObjectURL(file))
//         setPreviews(prev => [...prev, ...newPreviews])
//     }

//     const removeImage = (index: number) => {
//         const urlToRemove = previews[index]
//         setPreviews(prev => prev.filter((_, i) => i !== index))

//         // Handle new file removal
//         const existingImagesCount = product.product_images?.length || 0
//         const fileIndex = index - existingImagesCount
//         if (fileIndex >= 0) {
//             const currentFiles = form.getValues("image_files") || []
//             form.setValue("image_files", currentFiles.filter((_, i) => i !== fileIndex))
//         }

//         // Cleanup variant links
//         const variants = form.getValues("variants")
//         variants.forEach((v, vIdx) => {
//             if (v.variant_image_urls?.includes(urlToRemove)) {
//                 form.setValue(`variants.${vIdx}.variant_image_urls`, v.variant_image_urls.filter(u => u !== urlToRemove))
//             }
//         })
//     }

//     const toggleVariantImage = (variantIndex: number, url: string) => {
//         const current = form.getValues(`variants.${variantIndex}.variant_image_urls`) || []
//         const next = current.includes(url) ? current.filter(u => u !== url) : [...current, url]
//         form.setValue(`variants.${variantIndex}.variant_image_urls`, next)
//     }

//     async function onSubmit(values: ProductFormValues) {
//         setIsPending(true)
//         try {
//             const formData = new FormData()

//             // Map image indices based on final combined previews array
//             const updatedVariants = values.variants.map((v) => ({
//                 ...v,
//                 image_indices: (v.variant_image_urls || []).map(url => previews.indexOf(url)).filter(idx => idx !== -1)
//             }))

//             const { image_files, ...rest } = values
//             const payload = {
//                 ...rest,
//                 variants: updatedVariants,
//                 existing_images: previews.filter(p => !p.startsWith('blob:'))
//             }

//             formData.append("payload", JSON.stringify(payload))
//             values.image_files?.forEach((file: File) => formData.append("files", file))

//             const res = await updateProduct(product.id, formData)
//             if (res.success) {
//                 toast.success("Product updated successfully")
//                 router.push("/admin/products")
//                 router.refresh()
//             } else toast.error(res.error)
//         } catch (e) { toast.error("Update failed") } finally { setIsPending(false) }
//     }

//     if (!mounted) return null

//     return (
//         <Form {...form}>
//             <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
//                 <div className="flex items-center justify-between border-b pb-6">
//                     <div>
//                         <h1 className="text-3xl font-bold tracking-tight">Edit Product</h1>
//                         <p className="text-muted-foreground text-sm">Update product details and inventory.</p>
//                     </div>
//                     <div className="flex gap-3">
//                         <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
//                         <Button type="submit" disabled={isPending} className="font-bold min-w-[140px]">
//                             {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
//                         </Button>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//                     <div className="lg:col-span-2 space-y-6">
//                         {/* BASIC INFORMATION */}
//                         <Card>
//                             <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Info className="w-4 h-4" /> Basic Details</CardTitle></CardHeader>
//                             <CardContent className="space-y-4">
//                                 <div className="grid grid-cols-2 gap-4">
//                                     <FormField control={form.control} name="name" render={({ field }) => (
//                                         <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
//                                     )} />
//                                     <FormField control={form.control} name="brand" render={({ field }) => (
//                                         <FormItem><FormLabel>Brand</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
//                                     )} />
//                                 </div>
//                                 <FormField control={form.control} name="description" render={({ field }) => (
//                                     <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea rows={4} {...field} value={field.value ?? ""} /></FormControl></FormItem>
//                                 )} />
//                                 <FormField control={form.control} name="category_ids" render={({ field }) => (
//                                     <FormItem><FormLabel>Categories</FormLabel>
//                                         <MultiSelect
//                                             options={categories.map(c => ({ label: c.name, value: c.id }))}
//                                             selected={field.value || []}
//                                             onChange={field.onChange}
//                                         />
//                                     </FormItem>
//                                 )} />
//                             </CardContent>
//                         </Card>

//                         {/* VARIANTS SECTION */}
//                         <Card className={hasVariants ? "border-primary/40 bg-primary/5 shadow-md" : ""}>
//                             <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
//                                 <CardTitle className="text-lg flex items-center gap-2"><Pipette className="w-4 h-4" /> Shade Variants</CardTitle>
//                                 <FormField control={form.control} name="has_variants" render={({ field }) => (
//                                     <div className="flex items-center gap-2">
//                                         <span className="text-[10px] uppercase font-bold text-muted-foreground">Multiple Shades</span>
//                                         <Switch checked={field.value} onCheckedChange={field.onChange} />
//                                     </div>
//                                 )} />
//                             </CardHeader>
//                             <CardContent className="pt-6">
//                                 {hasVariants ? (
//                                     <div className="space-y-4">
//                                         {vFields.map((field, index) => {
//                                             const selectedImages = form.watch(`variants.${index}.variant_image_urls`) || [];
//                                             return (
//                                                 <div key={field.id} className="p-4 border rounded-lg bg-background space-y-4 shadow-sm">
//                                                     <div className="grid grid-cols-12 gap-3 items-end">
//                                                         <div className="col-span-1 flex flex-col items-center">
//                                                             <div
//                                                                 className="w-8 h-8 rounded-full border shadow-inner mb-2"
//                                                                 style={{ backgroundColor: form.watch(`variants.${index}.hex_code`) || '#e2e8f0' }}
//                                                             />
//                                                         </div>
//                                                         <div className="col-span-4">
//                                                             <FormLabel className="text-[10px]">Shade Name</FormLabel>
//                                                             <Input placeholder="Name" {...form.register(`variants.${index}.title`)} />
//                                                         </div>
//                                                         <div className="col-span-3">
//                                                             <FormLabel className="text-[10px]">Images</FormLabel>
//                                                             <Dialog>
//                                                                 <DialogTrigger asChild>
//                                                                     <Button type="button" variant="outline" className="w-full h-10 border-dashed text-[10px] uppercase font-bold">
//                                                                         {selectedImages.length} Linked
//                                                                     </Button>
//                                                                 </DialogTrigger>
//                                                                 <DialogContent className="sm:max-w-md">
//                                                                     <DialogHeader><DialogTitle>Link Images to Variant</DialogTitle></DialogHeader>
//                                                                     <div className="grid grid-cols-3 gap-3 pt-4">
//                                                                         {previews.map((url, i) => (
//                                                                             <button key={i} type="button" onClick={() => toggleVariantImage(index, url)} className={`relative aspect-square rounded-md border-2 overflow-hidden ${selectedImages.includes(url) ? 'border-primary' : 'border-transparent opacity-60'}`}>
//                                                                                 <img src={url} className="w-full h-full object-cover" alt="preview" />
//                                                                                 {selectedImages.includes(url) && <CheckCircle2 className="absolute top-1 right-1 w-4 h-4 text-primary bg-white rounded-full" />}
//                                                                             </button>
//                                                                         ))}
//                                                                     </div>
//                                                                 </DialogContent>
//                                                             </Dialog>
//                                                         </div>
//                                                         <div className="col-span-3">
//                                                             <FormLabel className="text-[10px]">Hex Code</FormLabel>
//                                                             <Input placeholder="#000000" {...form.register(`variants.${index}.hex_code`)} />
//                                                         </div>
//                                                         <div className="col-span-1">
//                                                             <Button type="button" variant="ghost" size="icon" onClick={() => remV(index)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
//                                                         </div>
//                                                     </div>
//                                                     <div className="grid grid-cols-4 gap-3 pt-3 border-t border-dashed">
//                                                         <div>
//                                                             <FormLabel className="text-[10px]">Price (₹)</FormLabel>
//                                                             <Input type="text" value={form.watch(`variants.${index}.price`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.price`, v))} />
//                                                         </div>
//                                                         <div>
//                                                             <FormLabel className="text-[10px]">Stock</FormLabel>
//                                                             <Input type="text" value={form.watch(`variants.${index}.stock`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.stock`, v))} />
//                                                         </div>
//                                                         <div>
//                                                             <FormLabel className="text-[10px]">Disc. Type</FormLabel>
//                                                             <Select onValueChange={(v) => form.setValue(`variants.${index}.discount_type`, v as any)} value={form.watch(`variants.${index}.discount_type`)}>
//                                                                 <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
//                                                                 <SelectContent><SelectItem value="none">None</SelectItem><SelectItem value="percentage">%</SelectItem><SelectItem value="amount">₹</SelectItem></SelectContent>
//                                                             </Select>
//                                                         </div>
//                                                         <div>
//                                                             <FormLabel className="text-[10px]">Disc. Val</FormLabel>
//                                                             <Input type="text" value={form.watch(`variants.${index}.discount_value`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.discount_value`, v))} />
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             )
//                                         })}
//                                         <Button type="button" variant="outline" className="w-full border-dashed" onClick={() => addV({ title: "", price: 0, stock: 0, discount_type: "none", discount_value: 0, hex_code: "#000000", variant_image_urls: [] })}>
//                                             <Plus className="w-4 h-4 mr-2" /> Add Shade Variant
//                                         </Button>
//                                     </div>
//                                 ) : (
//                                     <div className="py-12 text-center border-2 border-dashed rounded-lg text-muted-foreground flex flex-col items-center">
//                                         <p className="text-sm italic mb-1">Individual product mode active.</p>
//                                         <p className="text-[10px] uppercase font-bold tracking-wider">Configure pricing & stock in the sidebar</p>
//                                     </div>
//                                 )}
//                             </CardContent>
//                         </Card>
//                     </div>

//                     {/* SIDEBAR */}
//                     <div className="space-y-6">
//                         {!hasVariants && (
//                             <Card className="bg-slate-50 border-blue-100 shadow-sm">
//                                 <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><IndianRupee className="w-4 h-4" /> Inventory & Pricing</CardTitle></CardHeader>
//                                 <CardContent className="space-y-4">
//                                     <FormField control={form.control} name="base_price" render={({ field }) => (
//                                         <FormItem><FormLabel>Price (INR)</FormLabel><FormControl><Input type="text" value={field.value} onChange={(e) => handleNumberChange(e.target.value, field.onChange)} /></FormControl></FormItem>
//                                     )} />
//                                     <FormField control={form.control} name="stock" render={({ field }) => (
//                                         <FormItem><FormLabel>Total Stock</FormLabel><FormControl><Input type="text" value={field.value} onChange={(e) => handleNumberChange(e.target.value, field.onChange)} /></FormControl></FormItem>
//                                     )} />
//                                     <div className="pt-4 border-t space-y-4">
//                                         <h4 className="text-xs font-bold flex items-center gap-2 uppercase text-slate-500"><Tag className="w-3 h-3" /> Sale Settings</h4>
//                                         <FormField control={form.control} name="discount_type" render={({ field }) => (
//                                             <FormItem>
//                                                 <Select onValueChange={field.onChange} value={field.value}>
//                                                     <FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl>
//                                                     <SelectContent><SelectItem value="none">Regular Price</SelectItem><SelectItem value="percentage">Percentage (%)</SelectItem><SelectItem value="amount">Fixed Discount (₹)</SelectItem></SelectContent>
//                                                 </Select>
//                                             </FormItem>
//                                         )} />
//                                         <FormField control={form.control} name="discount_value" render={({ field }) => (
//                                             <FormItem><FormControl><Input type="text" value={field.value} onChange={(e) => handleNumberChange(e.target.value, field.onChange)} /></FormControl></FormItem>
//                                         )} />
//                                     </div>
//                                 </CardContent>
//                             </Card>
//                         )}

//                         <Card>
//                             <CardHeader><CardTitle className="text-sm font-bold flex items-center gap-2"><Upload className="w-4 h-4" /> Product Gallery</CardTitle></CardHeader>
//                             <CardContent className="space-y-4">
//                                 <div className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer relative hover:bg-slate-50 transition-colors">
//                                     <Input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
//                                     <Upload className="w-8 h-8 text-muted-foreground mb-2" />
//                                     <p className="text-[10px] font-bold uppercase text-muted-foreground">Add new images</p>
//                                 </div>
//                                 <div className="grid grid-cols-3 gap-2">
//                                     {previews.map((src, i) => (
//                                         <div key={i} className="relative aspect-square rounded border group overflow-hidden bg-slate-100">
//                                             <img src={src} className="object-cover w-full h-full" alt="gallery" />
//                                             <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/60 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
//                                                 <Trash2 className="w-4 h-4 text-white" />
//                                             </button>
//                                             {i === 0 && <div className="absolute top-0 left-0 bg-primary text-[8px] text-white px-1 font-bold uppercase">Main</div>}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </CardContent>
//                         </Card>
//                     </div>
//                 </div>
//             </form>
//         </Form>
//     )
// }

"use client"

import * as React from "react"
import { useForm, useFieldArray, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { productSchema, type ProductFormValues } from "@/lib/validations/product"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    Trash2, Plus, Upload, Info, Pipette, Loader2,
    IndianRupee, CheckCircle2, Tag, Box, ArrowLeft
} from "lucide-react"
import { updateProduct } from "@/app/actions/products"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface ProductEditFormProps {
    product: any
    categories: { id: string; name: string }[]
}

export default function ProductEditForm({ product, categories }: ProductEditFormProps) {
    const [mounted, setMounted] = React.useState(false)
    const [previews, setPreviews] = React.useState<string[]>([])
    const [isPending, setIsPending] = React.useState(false)
    const router = useRouter()

    // 1. Calculate Initial Stock from variants (this fixes the "0" issue on load)
    const initialTotalStock = React.useMemo(() => {
        if (!product.has_variants) return Number(product.stock) || 0;
        return product.product_variants?.reduce(
            (acc: number, v: any) => acc + (Number(v.stock) || 0), 0
        ) || 0;
    }, [product]);

    const form = useForm<ProductFormValues>({
        resolver: zodResolver(productSchema) as any,
        defaultValues: {
            name: product.name || "",
            slug: product.slug || "",
            description: product.description || "",
            brand: product.brand || "",
            has_variants: !!product.has_variants,
            category_ids: product.product_categories?.map((c: any) => c.category_id) || [],
            base_price: Number(product.base_price) || 0,
            stock: initialTotalStock, // Set the calculated sum here
            discount_type: (product.discount_type as "none" | "percentage" | "amount") || "none",
            discount_value: Number(product.discount_value) || 0,
            variants: product.product_variants?.map((v: any) => ({
                id: v.id,
                title: v.title || "",
                price: Number(v.price) || 0,
                stock: Number(v.stock) || 0,
                sku: v.sku || "",
                hex_code: v.hex_code || "#000000",
                discount_type: (v.discount_type as "none" | "percentage" | "amount") || "none",
                discount_value: Number(v.discount_value) || 0,
                variant_image_urls: v.variant_images?.map((vi: any) => vi.url) || [],
                image_indices: []
            })) || [],
            image_files: [],
            existing_images: product.product_images || [],
        }
    });

    const { fields: vFields, append: addV, remove: remV } = useFieldArray({
        control: form.control,
        name: "variants"
    })

    // 2. Setup Watchers to update stock in REAL-TIME as you type
    const hasVariants = useWatch({ control: form.control, name: "has_variants" });
    const watchedVariants = useWatch({ control: form.control, name: "variants" });

    React.useEffect(() => {
        if (hasVariants && watchedVariants) {
            const newTotal = watchedVariants.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
            // Update the top-level stock field in the form state
            form.setValue("stock", newTotal);
        }
    }, [watchedVariants, hasVariants, form]);

    React.useEffect(() => {
        setMounted(true)
        if (product.product_images) {
            const sortedImages = [...product.product_images].sort((a, b) => a.position - b.position)
            setPreviews(sortedImages.map((img: any) => img.url))
        }
    }, [product])

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
        const existingImagesCount = product.product_images?.length || 0
        const fileIndex = index - existingImagesCount
        if (fileIndex >= 0) {
            const currentFiles = form.getValues("image_files") || []
            form.setValue("image_files", currentFiles.filter((_, i) => i !== fileIndex))
        }
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
            const updatedVariants = values.variants.map((v) => ({
                ...v,
                image_indices: (v.variant_image_urls || []).map(url => previews.indexOf(url)).filter(idx => idx !== -1)
            }))
            const { image_files, ...rest } = values
            const payload = { ...rest, variants: updatedVariants, existing_images: previews.filter(p => !p.startsWith('blob:')) }
            formData.append("payload", JSON.stringify(payload))
            values.image_files?.forEach((file: File) => formData.append("files", file))

            const res = await updateProduct(product.id, formData)
            if (res.success) {
                toast.success("Product updated successfully")
                router.push("/admin/products")
                router.refresh()
            } else toast.error(res.error)
        } catch (e) { toast.error("Update failed") } finally { setIsPending(false) }
    }

    if (!mounted) return null

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 p-1">
                {/* STICKY HEADER */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
                    <div className="flex items-center gap-4">
                        <Button type="button" variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black tracking-tighter uppercase">Edit Product</h1>
                                <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-100 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs">
                                    <Box className="w-3.5 h-3.5" />
                                    {form.watch("stock")} Total Units
                                </Badge>
                            </div>
                            <p className="text-muted-foreground text-sm font-medium mt-1">Product ID: {product.id}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button type="button" variant="outline" className="rounded-xl px-6" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={isPending} className="font-bold min-w-[160px] rounded-xl bg-slate-900 shadow-lg shadow-slate-200">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        {/* BASIC DETAILS */}
                        <Card className="rounded-[2rem] border-slate-200 overflow-hidden shadow-sm">
                            <CardHeader className="bg-slate-50/50 border-b"><CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-500"><Info className="w-4 h-4" /> Core Information</CardTitle></CardHeader>
                            <CardContent className="space-y-6 pt-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <FormField control={form.control} name="name" render={({ field }) => (
                                        <FormItem><FormLabel className="text-[10px] uppercase font-black text-slate-400">Title</FormLabel><FormControl><Input className="h-12 rounded-xl focus-visible:ring-slate-200" {...field} /></FormControl><FormMessage /></FormItem>
                                    )} />
                                    <FormField control={form.control} name="brand" render={({ field }) => (
                                        <FormItem><FormLabel className="text-[10px] uppercase font-black text-slate-400">Brand</FormLabel><FormControl><Input className="h-12 rounded-xl focus-visible:ring-slate-200" {...field} /></FormControl></FormItem>
                                    )} />
                                </div>
                                <FormField control={form.control} name="description" render={({ field }) => (
                                    <FormItem><FormLabel className="text-[10px] uppercase font-black text-slate-400">Product Narrative</FormLabel><FormControl><Textarea className="rounded-xl min-h-[140px] focus-visible:ring-slate-200" {...field} value={field.value ?? ""} /></FormControl></FormItem>
                                )} />
                                <FormField control={form.control} name="category_ids" render={({ field }) => (
                                    <FormItem><FormLabel className="text-[10px] uppercase font-black text-slate-400">Collections</FormLabel>
                                        <MultiSelect
                                            options={categories.map(c => ({ label: c.name, value: c.id }))}
                                            selected={field.value || []}
                                            onChange={field.onChange}
                                        />
                                    </FormItem>
                                )} />
                            </CardContent>
                        </Card>

                        {/* SHADE VARIANTS */}
                        <Card className={`rounded-[2rem] overflow-hidden transition-all duration-500 ${hasVariants ? "border-indigo-200 ring-4 ring-indigo-50 shadow-xl" : "border-slate-200 shadow-sm"}`}>
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-slate-50/50">
                                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-indigo-500"><Pipette className="w-4 h-4" /> Shade Palette</CardTitle>
                                <FormField control={form.control} name="has_variants" render={({ field }) => (
                                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
                                        <span className="text-[10px] uppercase font-black text-slate-500">Enable Variants</span>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </div>
                                )} />
                            </CardHeader>
                            <CardContent className="pt-6">
                                {hasVariants ? (
                                    <div className="space-y-4">
                                        {vFields.map((field, index) => {
                                            const selectedImages = form.watch(`variants.${index}.variant_image_urls`) || [];
                                            return (
                                                <div key={field.id} className="p-6 border border-slate-100 rounded-[2rem] bg-white space-y-6 shadow-sm hover:border-indigo-100 transition-colors">
                                                    <div className="grid grid-cols-12 gap-4 items-end">
                                                        <div className="col-span-1 flex flex-col items-center">
                                                            <div className="w-12 h-12 rounded-full border-4 border-white shadow-xl mb-2 transition-transform hover:scale-110 cursor-pointer" style={{ backgroundColor: form.watch(`variants.${index}.hex_code`) || '#f1f5f9' }} />
                                                        </div>
                                                        <div className="col-span-4">
                                                            <FormLabel className="text-[9px] font-black uppercase text-slate-400">Name</FormLabel>
                                                            <Input className="rounded-xl h-11 font-bold border-slate-100" placeholder="E.g. Rose Gold" {...form.register(`variants.${index}.title`)} />
                                                        </div>
                                                        <div className="col-span-3">
                                                            <FormLabel className="text-[9px] font-black uppercase text-slate-400">Gallery</FormLabel>
                                                            <Dialog>
                                                                <DialogTrigger asChild>
                                                                    <Button type="button" variant="outline" className="w-full h-11 rounded-xl border-dashed border-slate-200 text-[10px] font-black uppercase tracking-tighter">
                                                                        {selectedImages.length} Linked
                                                                    </Button>
                                                                </DialogTrigger>
                                                                <DialogContent className="sm:max-w-md rounded-[2.5rem]">
                                                                    <DialogHeader><DialogTitle className="font-black uppercase tracking-tighter">Link Shade Media</DialogTitle></DialogHeader>
                                                                    <div className="grid grid-cols-3 gap-3 pt-4">
                                                                        {previews.map((url, i) => (
                                                                            <button key={i} type="button" onClick={() => toggleVariantImage(index, url)} className={`relative aspect-square rounded-[1.5rem] border-2 overflow-hidden transition-all ${selectedImages.includes(url) ? 'border-indigo-500 ring-4 ring-indigo-50' : 'border-slate-50 opacity-40 grayscale'}`}>
                                                                                <img src={url} className="w-full h-full object-cover" alt="preview" />
                                                                                {selectedImages.includes(url) && <div className="absolute inset-0 bg-indigo-500/10 flex items-center justify-center"><CheckCircle2 className="w-8 h-8 text-white" /></div>}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </DialogContent>
                                                            </Dialog>
                                                        </div>
                                                        <div className="col-span-3">
                                                            <FormLabel className="text-[9px] font-black uppercase text-slate-400">Hex</FormLabel>
                                                            <Input className="rounded-xl h-11 font-mono border-slate-100 uppercase" placeholder="#HEXCODE" {...form.register(`variants.${index}.hex_code`)} />
                                                        </div>
                                                        <div className="col-span-1">
                                                            <Button type="button" variant="ghost" size="icon" onClick={() => remV(index)} className="text-red-300 hover:text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-4 gap-4 pt-5 border-t border-slate-50">
                                                        <div><FormLabel className="text-[9px] font-black uppercase text-slate-400">Price (₹)</FormLabel><Input className="rounded-xl h-11 font-bold bg-slate-50/50" value={form.watch(`variants.${index}.price`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.price`, v))} /></div>
                                                        <div><FormLabel className="text-[9px] font-black uppercase text-slate-400">Stock Units</FormLabel><Input className="rounded-xl h-11 font-black text-indigo-600 border-indigo-100 bg-indigo-50/20" value={form.watch(`variants.${index}.stock`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.stock`, v))} /></div>
                                                        <div>
                                                            <FormLabel className="text-[9px] font-black uppercase text-slate-400">Disc. Type</FormLabel>
                                                            <Select onValueChange={(v) => form.setValue(`variants.${index}.discount_type`, v as any)} value={form.watch(`variants.${index}.discount_type`)}>
                                                                <SelectTrigger className="h-11 rounded-xl bg-slate-50/50"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="rounded-xl"><SelectItem value="none">None</SelectItem><SelectItem value="percentage">% Off</SelectItem><SelectItem value="amount">₹ Off</SelectItem></SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div><FormLabel className="text-[9px] font-black uppercase text-slate-400">Value</FormLabel><Input className="rounded-xl h-11" value={form.watch(`variants.${index}.discount_value`)} onChange={(e) => handleNumberChange(e.target.value, (v) => form.setValue(`variants.${index}.discount_value`, v))} /></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                        <Button type="button" variant="outline" className="w-full border-dashed border-slate-300 h-16 rounded-[1.5rem] font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50 hover:text-indigo-500 hover:border-indigo-200 transition-all" onClick={() => addV({ title: "", price: 0, stock: 0, discount_type: "none", discount_value: 0, hex_code: "#000000", variant_image_urls: [] })}>
                                            <Plus className="w-5 h-5 mr-2" /> Add Shade Variant
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem] text-slate-300 flex flex-col items-center">
                                        <Box className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-xs font-black uppercase tracking-[0.2em]">Individual Item Mode</p>
                                        <p className="text-[10px] mt-2 opacity-60">Inventory is managed in the side panel</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        {/* GLOBAL INVENTORY (Hidden if variants exist) */}
                        {!hasVariants && (
                            <Card className="rounded-[2rem] border-blue-100 bg-blue-50/30 overflow-hidden shadow-sm">
                                <CardHeader className="bg-blue-50 border-b border-blue-100"><CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-tighter text-blue-900"><IndianRupee className="w-4 h-4" /> Pricing & Inventory</CardTitle></CardHeader>
                                <CardContent className="space-y-5 pt-6">
                                    <FormField control={form.control} name="base_price" render={({ field }) => (
                                        <FormItem><FormLabel className="text-[9px] uppercase font-black text-blue-400">Base Price (INR)</FormLabel><FormControl><Input className="h-12 rounded-xl bg-white border-blue-100 font-bold text-lg" type="text" value={field.value} onChange={(e) => handleNumberChange(e.target.value, field.onChange)} /></FormControl></FormItem>
                                    )} />
                                    <FormField control={form.control} name="stock" render={({ field }) => (
                                        <FormItem><FormLabel className="text-[9px] uppercase font-black text-blue-400">Total Stock</FormLabel><FormControl><Input className="h-12 rounded-xl bg-white border-blue-100 font-bold" type="text" value={field.value} onChange={(e) => handleNumberChange(e.target.value, field.onChange)} /></FormControl></FormItem>
                                    )} />
                                </CardContent>
                            </Card>
                        )}

                        {/* MEDIA GALLERY */}
                        <Card className="rounded-[2rem] overflow-hidden border-slate-200 shadow-sm">
                            <CardHeader className="bg-slate-50 border-b"><CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-slate-500"><Upload className="w-4 h-4" /> Gallery</CardTitle></CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <div className="border-2 border-dashed rounded-[1.5rem] border-slate-200 p-10 flex flex-col items-center justify-center cursor-pointer relative hover:bg-slate-50 transition-colors">
                                    <Input type="file" multiple className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" onChange={handleImageChange} />
                                    <Upload className="w-6 h-6 text-slate-300 mb-2" />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Add Media</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {previews.map((src, i) => (
                                        <div key={i} className="relative aspect-square rounded-[1.25rem] border border-slate-100 group overflow-hidden bg-slate-50 shadow-inner">
                                            <img src={src} className="object-cover w-full h-full" alt="gallery" />
                                            <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-red-600/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-5 h-5 text-white" />
                                            </button>
                                            {i === 0 && <div className="absolute top-2 left-2 bg-slate-900/90 backdrop-blur-md text-[8px] text-white px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-xl">Cover</div>}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </Form>
    )
}