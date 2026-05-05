import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";

import { SafetyNotice } from "@/components/SafetyNotice";

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

export const metadata: Metadata = {
  title: {
    default: "DeenNotes AI",
    template: "%s · DeenNotes AI",
  },
  description:
    "Turn khutbahs and Islamic lectures into structured notes, reminders, and reflection prompts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="font-sans min-h-dvh flex flex-col">
        <div className="flex-1">{children}</div>
        <SafetyNotice className="border-t border-black/5 bg-surface" />
      </body>
    </html>
  );
}
