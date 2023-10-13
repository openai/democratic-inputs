import { z } from "zod"

export const associationTypeFormSchema = z.object({
  name: z
    .string()
    .min(2, {
      message: "Association must be at least 2 characters.",
    })
    .max(30, {
      message: "Association must not be longer than 30 characters.",
    }),
})

export type AssociationTypeFormValues = z.infer<typeof associationTypeFormSchema>
