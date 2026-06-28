"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { bannerSchema, type BannerFormValues } from "@/lib/validations/banner"
import { createBanner } from "@/app/actions/banners"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { ImagePlus, X } from "lucide-react"
import Image from "next/image"

export function BannerForm() {
    const router = useRouter()
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string>("")

    const form = useForm<BannerFormValues>({
        resolver: zodResolver(bannerSchema) as any,
        defaultValues: {
            title: "",
            subtitle: "",
            cta: "Shop Now",
            href: "/shop",
            image_url: "",
            bg_color: "from-rose-100 via-pink-50 to-fuchsia-100",
            text_color: "",
            sort_order: 0,
            is_active: true,
        },
    })

    const onImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedFile(file)
            setPreview(URL.createObjectURL(file))
        }
    }

    async function onSubmit(data: BannerFormValues) {
        const formData = new FormData()
        formData.append("payload", JSON.stringify(data))
        if (selectedFile) {
            formData.append("file", selectedFile)
        }

        const res = await createBanner(formData)

        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success("Banner created successfully!")
            router.push("/admin/banners")
            router.refresh()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-xl">
                <div className="space-y-2">
                    <FormLabel>Banner Image</FormLabel>
                    <div className="flex items-center gap-4">
                        {preview ? (
                            <div className="relative w-full h-40 rounded-xl overflow-hidden border">
                                <Image fill src={preview} alt="Preview" className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreview("")
                                        setSelectedFile(null)
                                    }}
                                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ) : (
                            <label className="w-full h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition">
                                <ImagePlus className="w-8 h-8 text-gray-400" />
                                <span className="text-sm mt-2 text-gray-500">Upload banner image</span>
                                <span className="text-[10px] text-gray-400">Leave empty to use gradient background</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={onImageSelect}
                                />
                            </label>
                        )}
                    </div>
                </div>

                <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="New Arrivals" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="subtitle"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Subtitle</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Discover the latest in premium stationery" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="cta"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CTA Text</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Shop Now" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="href"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>CTA Link</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="/shop" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="bg_color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Gradient Background (Tailwind)</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="from-rose-100 via-pink-50 to-fuchsia-100" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="text_color"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Text Color Class (optional)</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="text-slate-900" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="sort_order"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Sort Order</FormLabel>
                                <FormControl>
                                    <Input type="number" min={0} {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="is_active"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                <div className="space-y-0.5">
                                    <FormLabel>Active</FormLabel>
                                </div>
                                <FormControl>
                                    <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full bg-black text-white h-12 rounded-xl"
                    disabled={form.formState.isSubmitting}
                >
                    {form.formState.isSubmitting ? "Uploading..." : "Create Banner"}
                </Button>
            </form>
        </Form>
    )
}
