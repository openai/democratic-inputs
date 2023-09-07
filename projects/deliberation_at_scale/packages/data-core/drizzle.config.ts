import type { Config } from "drizzle-kit";

import { DATABASE_URL } from "./src/config/constants";

export default {
    schema: "./src/database/schema.ts",
    out: "./src/database/migrations",
    driver: "pg",
    dbCredentials: {
        connectionString: DATABASE_URL,
    },
} satisfies Config;
