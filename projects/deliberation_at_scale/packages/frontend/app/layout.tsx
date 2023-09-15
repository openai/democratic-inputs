import Providers from '@/components/Providers';
import './globals.css';
import { PropsWithChildren } from 'react';
import { Inter } from 'next/font/google';

export const metadata = {
    title: 'Deliberation at Scale',
    description: 'Deliberation at Scale',
};

const inter = Inter({
    subsets: ['latin-ext'],
    variable: '--font-inter',
    display: 'swap',
    weight: 'variable',
    fallback: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', '"Helvetica Neue"', 'Arial', '"Noto Sans"', 'sans-serif', '"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"'],
});

export default async function RootLayout({
    children
}: PropsWithChildren) {
    return (
        <html lang="en">
            <body className={inter.variable}>
                <Providers>
                    <main className="min-h-screen bg-background flex flex-col items-center">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
