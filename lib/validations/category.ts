import * as z from 'zod';

export const categorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters long'),
    slug: z.string().min(2, 'Slug must be at least 2 characters long'),
    parent_id: z.string().nullable().optional(),
    image_url: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export type CategoryFormValues = z.infer<typeof categorySchema>