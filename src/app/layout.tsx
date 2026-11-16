import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LangProvider } from "@/lib/i18n";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Junior Astronaut Mission Trainer | NASA Space Apps 2026",
  description:
    "Run a lunar or Martian outpost. Balance power, oxygen, food and radiation shielding. Every choice has a cost — learn the real trade-offs NASA astronauts face.",
  openGraph: {
    title: "Junior Astronaut Mission Trainer",
    description: "Can you keep your crew alive for 7 sols? Every watt counts.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080c1a] text-zinc-100">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
