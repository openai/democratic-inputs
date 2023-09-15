import type { StorybookConfig } from "@storybook/nextjs";

import { join, dirname } from "path";

/**
 * This function is used to resolve the absolute path of a package.
 * It is needed in projects that use Yarn PnP or are set up within a monorepo.
 */
function getAbsolutePath(value: string): any {
    return dirname(require.resolve(join(value, "package.json")));
}
const config: StorybookConfig = {
    stories: [
        "../@(components|hooks|utilities|state)**/*.stories.@(js|jsx|mjs|ts|tsx)",
    ],
    addons: [
        getAbsolutePath("@storybook/addon-essentials"),
        {
            name: '@storybook/addon-styling',
            options: {}
        }
    ],
    framework: {
        name: getAbsolutePath("@storybook/nextjs"),
        options: {fastRefresh: false},
    },
    docs: {
        autodocs: "tag",
    },
};
export default config;
