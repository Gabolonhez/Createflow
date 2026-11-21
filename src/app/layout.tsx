import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CreateFlow - Segundo Cérebro & Automação de Conteúdo",
  description: "Plataforma inteligente de criação de conteúdo por IA, segundo cérebro e automação para Instagram, TikTok e LinkedIn.",
  other: {
    "tiktok-developers-site-verification": "v5mpVFenrlYf6w0MpnDZWhqDcqLXl1M9",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#0a0a0a] text-[#ececec]">
        {children}
      </body>
    </html>
  );
}
