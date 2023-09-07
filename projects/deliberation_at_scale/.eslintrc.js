/* eslint-env node */
module.exports = {    
    plugins: [
        "import"
    ],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:import/recommended",
        "plugin:import/typescript",
    ],
    rules: {
        indent: ["error", 4],
        semi: ["error", "always"],
        "no-console": "warn",
        "@typescript-eslint/no-unused-vars": "error",
        "@typescript-eslint/no-namespace": "off"
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./packages/*/tsconfig.json'],
    },
    settings: {
        "import/resolver": {
            typescript: true,
            node: true
        }
    },
};