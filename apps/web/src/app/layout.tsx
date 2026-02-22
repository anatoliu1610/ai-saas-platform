import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { TRPCProvider } from '@/lib/trpc/client';
import { ThemeProvider } from '@/components/providers/theme-provider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI SaaS Platform',
  description: 'Production-grade AI chat platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>{children}</TRPCProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
