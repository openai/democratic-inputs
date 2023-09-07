import Providers from '@/components/Providers';
import './globals.css';

export const metadata = {
    title: 'Deliberation at Scale',
    description: 'Deliberation at Scale',
};

export default function RootLayout({
    children,
}: {
  children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <Providers>
                    <main className="min-h-screen bg-background flex flex-col items-center">
                        {children}
                    </main>
                </Providers>
            </body>
        </html>
    );
}
