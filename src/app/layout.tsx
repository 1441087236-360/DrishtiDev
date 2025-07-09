import type { Metadata } from "next";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";
import { Inter } from 'next/font/google'
import { SplashScreen } from "@/components/splash-screen";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: "DrishtiDev",
  description: "Simultaneously preview your web application in desktop, tablet, and mobile viewports.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-body antialiased">
        <SplashScreen />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
