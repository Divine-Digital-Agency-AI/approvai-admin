import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { AuthProvider } from "@/lib/auth-context";
import { Layout } from "@/components/layout/Layout";

const inter = Inter({
  subsets: ["latin"],
  weight: ["100"],
  variable: "--font-inter-thin",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ApprovAI Admin",
  description: "ApprovAI Administration Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('admin-theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                const resolved = theme || (prefersDark ? 'dark' : 'light');
                document.documentElement.classList.add(resolved);
              })();
            `,
          }}
        />
      </head>
      <body className={`antialiased bg-background text-foreground ${inter.variable}`}>
        <ThemeProvider>
          <AuthProvider>
            <Layout>{children}</Layout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
