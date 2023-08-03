import dotenv from 'dotenv';

dotenv.config();

export const DATABASE_URL = process.env.DATABASE_URL ?? '';
export const SUPABASE_PROJECT_ID = process.env.SUPABASE_PROJECT_ID ?? '';
