import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { CartSync } from "@/components/store/cart-sync";
import { createClient } from "@/utils/supabase/server";
import localFont from "next/font/local";

const myBrandFont = localFont({
  src: "../public/fonts/Anders.ttf", // Adjust 'myfont.ttf' to your actual filename
  variable: "--font-daciana",       // This creates a CSS variable
});


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};



// 2. Full Metadata Configuration
export const metadata: Metadata = {
  title: {
    default: "DACIANA |  Stationery & Cosmetics",
    template: "%s | DACIANA",
  },
  description: "Discover curated premium stationery and luxury cosmetics designed for elegance.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DACIANA",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "DACIANA",
    title: "DACIANA | Stationery & Cosmetics",
    description: "Curated premium stationery and cosmetics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "DACIANA",
    description: "Premium Stationery & Cosmetics",
  },
  icons: {
    apple: [
      { url: "/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();


  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${myBrandFont.variable} antialiased`}
      >
        <CartSync userId={user?.id || null} />

        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
