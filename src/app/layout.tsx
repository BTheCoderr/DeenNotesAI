import type { Metadata, Viewport } from "next";
import { Fraunces, Inter } from "next/font/google";

import { SafetyNotice } from "@/components/SafetyNotice";
import { getSiteUrl } from "@/lib/site";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#127A63" },
    { media: "(prefers-color-scheme: dark)", color: "#0F3D32" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light",
};

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "DeenNotes AI",
    template: "%s · DeenNotes AI",
  },
  description:
    "Turn khutbahs and Islamic lectures into structured notes, reminders, and reflection prompts.",
  appleWebApp: {
    capable: true,
    title: "DeenNotes AI",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans min-h-dvh min-h-[100dvh] flex flex-col bg-background">
        <div className="flex-1">{children}</div>
        <SafetyNotice className="border-t border-black/5 bg-surface" />
      </body>
    </html>
  );
}
