import * as z from "zod"

export const bannerSchema = z.object({
    title: z.string().min(1, "Title is required"),
    subtitle: z.string().optional().or(z.literal("")),
    cta: z.string().min(1, "CTA text is required"),
    href: z.string().min(1, "Link is required"),
    image_url: z.string().optional().or(z.literal("")),
    bg_color: z.string(),
    text_color: z.string().optional().or(z.literal("")),
    sort_order: z.coerce.number().int().min(0),
    is_active: z.boolean(),
})

export type BannerFormValues = z.infer<typeof bannerSchema>
