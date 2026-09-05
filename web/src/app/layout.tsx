import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DocsFeed MCP - Dashboard',
  description: 'Turn any documentation site into a queryable, authenticated Model Context Protocol (MCP) server.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
