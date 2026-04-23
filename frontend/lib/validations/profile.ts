import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  image: z.string().nullable().optional(),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
