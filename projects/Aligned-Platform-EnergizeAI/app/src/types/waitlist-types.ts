import { z } from "zod"

export const waitlistFormSchema = z.object({
  firstName: z.string().nonempty({ message: "Please enter your first name" }),
  lastName: z.string().nonempty({ message: "Please enter your last name" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  questionAnswer: z.string().optional(),
})
