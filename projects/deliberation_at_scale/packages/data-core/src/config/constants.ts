import 'dotenv/config';

// export the constants with default values
export const {
    DATABASE_URL = '',
    GRAPHQL_URL = '',
    SUPABASE_PROJECT_ID = '',
    SUPABASE_ANONYMOUS_API_KEY = '',
    VOYAGER_SERVER_PORT = 3201,
} = process.env;
