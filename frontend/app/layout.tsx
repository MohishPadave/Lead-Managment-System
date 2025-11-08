import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Lead Management System",
  description: "Professional lead management with advanced features",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const theme = localStorage.getItem('theme');
                  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  const root = document.documentElement;
                  
                  console.log('[Init Script] Saved theme:', theme);
                  console.log('[Init Script] Prefers dark:', prefersDark);
                  
                  if (theme === 'dark' || (!theme && prefersDark)) {
                    root.classList.add('dark');
                    console.log('[Init Script] Added dark class');
                  } else {
                    root.classList.remove('dark');
                    console.log('[Init Script] Removed dark class');
                  }
                } catch (e) {
                  console.error('[Init Script] Error:', e);
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
