export const DEFAULT_SPACE_ID =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production" || process.env.VERCEL_ENV === "production"
    ? "62b65e6c-2f50-4ff8-a7c6-b510ae069b30"
    : "2345151e-b4b6-45fd-8962-ac9159e27edf"
