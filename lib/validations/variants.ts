import * as z from "zod"

export const variantOptionSchema = z.object({
    name: z.string().min(1, "Name is required (e.g., Color)"),
    slug: z.string().min(1, "Slug is required (e.g., color)"),
    position: z.coerce.number().default(0),
    values: z.array(z.object({
        value: z.string().min(1, "Value is required (e.g., Red)"),
        slug: z.string().min(1, "Value slug is required"),
        hex_code: z.string().optional().nullable(),
        discount_type: z.enum(["none", "percentage", "amount"]).default("none"),
        discount_value: z.coerce.number().min(0).default(0),
    })).min(1, "Add at least one value"),
})

export type VariantFormValues = z.infer<typeof variantOptionSchema>