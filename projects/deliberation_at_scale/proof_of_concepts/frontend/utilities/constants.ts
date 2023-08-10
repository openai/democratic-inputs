
/**
 * Environment variables from .env file
 * NOTE: make sure you use the `process.env.NEXT_PUBLIC_` prefix so NextJS can detect them
 */
export const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const NEXT_PUBLIC_SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';
