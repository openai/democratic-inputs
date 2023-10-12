import Providers from '@/components/Providers';
import './globals.css';
import { PropsWithChildren } from 'react';
import { Red_Hat_Text } from 'next/font/google';

import { config } from '@fortawesome/fontawesome-svg-core';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import the CSS
config.autoAddCss = false; // Tell Font Awesome to skip adding the CSS automatically since it's being imported above

export const metadata = {
    title: 'Common Ground',
    description: 'Common Ground is a platform for deliberation at scale.',
};

const red_hat_text = Red_Hat_Text({
    subsets: ['latin-ext'],
    variable: '--font-redhat-text',
    display: 'swap',
    weight: 'variable',
    fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
});


export default async function RootLayout({
    children
}: PropsWithChildren) {
    return (
        <html lang="en">
            {/* include redhat as heading font */}
            <body className={red_hat_text.variable}>
                <Providers>
                    <main className="bg-background flex flex-col items-center">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
