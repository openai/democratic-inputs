import Providers from '@/components/Providers';
import './globals.css';
import { PropsWithChildren } from 'react';
import { Inter, Red_Hat_Display } from 'next/font/google';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

export const metadata = {
    title: 'Common Ground',
    description: 'Common Ground is a platform for deliberation at scale.',
};

const inter = Inter({
    subsets: ['latin-ext'],
    variable: '--font-inter',
    display: 'swap',
    weight: 'variable',
    fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
});

const red_hat_display = Red_Hat_Display({
    subsets: ['latin-ext'],
    variable: '--font-red-hat-display',
    display: 'swap',
    weight: 'variable',
    fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
});


export default async function RootLayout({
    children
}: PropsWithChildren) {
    return (
        <html>
            <body className={`${inter.variable} ${red_hat_display.variable}`}>
                <Providers>
                    <main className="bg-background flex flex-col items-center">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
