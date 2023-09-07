import { CodegenConfig } from '@graphql-codegen/cli';

const {
    NEXT_PUBLIC_GRAPHQL_URL = '',
    NEXT_PUBLIC_SUPABASE_ANON_KEY = '',
} = process.env;

const config: CodegenConfig = {
    schema: {
        [NEXT_PUBLIC_GRAPHQL_URL]: {
            headers: {
                apiKey: NEXT_PUBLIC_SUPABASE_ANON_KEY,
            },
        },
    },
    documents: "**/*.graphql",
    generates: {
        'generated/schema.graphql': {
            plugins: [
                'schema-ast',
            ],
        },
        'generated/graphql.tsx': {
            plugins: [
                'typescript',
                'typescript-operations',
                'typescript-react-apollo',
            ],
        },
    }
};

export default config;
