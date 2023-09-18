const colors = require('tailwindcss/colors');

// https://uicolors.app/edit?sv1=flamingo:50-fef2f2/100-fee2e2/200-fecaca/300-fca5a5/400-f87171/500-ef4444/600-dc2626/700-b91c1c/800-991b1b/900-7f1d1d/950-450a0a;dodger-blue:50-eef7ff/100-daedff/200-bde0ff/300-90cdff/400-48a7ff/500-358ffc/600-1f70f1/700-1759de/800-1949b4/900-1a408e/950-152956;macaroni-and-cheese:50-fff6ed/100-ffecd4/200-ffd4a9/300-ffb46f/400-fe8c39/500-fc6b13/600-ed5009/700-c53a09/800-9c2f10/900-7e2910/950-441206;bright-turquoise:50-e9fff8/100-caffec/200-9affdf/300-59fcd1/400-36f1c6/500-00d7a8/600-00af8b/700-008c73/800-006f5c/900-005b4d/950-00332d

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./{app,components,hooks,pages}/**/*.{js,ts,jsx,tsx,mdx}'],
    theme: {
        colors: {
            transparent: colors.transparent,
            current: colors.current,
            inherit: colors.inherit,
            black: colors.black,
            white: colors.white,
            gray: colors.gray,
            red: colors.red,
            orange: {
                '50': '#fff6ed',
                '100': '#ffecd4',
                '200': '#ffd4a9',
                '300': '#ffb46f',
                '400': '#fe8c39',
                '500': '#fc6b13',
                '600': '#ed5009',
                '700': '#c53a09',
                '800': '#9c2f10',
                '900': '#7e2910',
                '950': '#441206',
            },
            green: {
                '50': '#e9fff8',
                '100': '#caffec',
                '200': '#9affdf',
                '300': '#59fcd1',
                '400': '#36f1c6',
                '500': '#00d7a8',
                '600': '#00af8b',
                '700': '#008c73',
                '800': '#006f5c',
                '900': '#005b4d',
                '950': '#00332d',
            },
            blue: {
                '50': '#eef7ff',
                '100': '#daedff',
                '200': '#bde0ff',
                '300': '#90cdff',
                '400': '#48a7ff',
                '500': '#358ffc',
                '600': '#1f70f1',
                '700': '#1759de',
                '800': '#1949b4',
                '900': '#1a408e',
                '950': '#152956',
            },
        },
        extend: {
            fontFamily: {
                // sans: ['var(--font-inter)'],
            }
        },
    },
    plugins: [],
};
