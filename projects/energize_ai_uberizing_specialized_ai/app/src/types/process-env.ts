import { z } from "zod"

const envVariables = z.object({
  NEXT_PUBLIC_NODE_ENV: z.union([z.literal("development"), z.literal("production")]),
  NEXT_PUBLIC_ENERGIZE_ENGINE: z.string().optional(),
  ENERGIZE_ENGINE: z.string().optional(),
  NEXT_PUBLIC_ENERGIZE_ENGINE_KEY: z.string().optional(),
})

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envVariables> {}
  }
}
