import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { CookieConsent } from "@/components/shared/CookieConsent";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CoinVault — Buy Bitcoin & Ethereum with AUD",
  description:
    "Australia's trusted cryptocurrency exchange. Buy BTC and ETH with AUD bank transfer. AUSTRAC registered.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster />
        <CookieConsent />
      </body>
    </html>
  );
}
