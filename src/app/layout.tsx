import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://vagas.tec.br"),
  title: {
    default: "vagas.tec.br - Vagas de Tecnologia no Brasil",
    template: "%s | vagas.tec.br",
  },
  description:
    "Encontre vagas de DevOps, Backend e tecnologia das maiores comunidades brasileiras. Atualizado diariamente com oportunidades reais.",
  keywords: [
    "vagas tecnologia",
    "vagas TI",
    "emprego programador",
    "vagas devops",
    "vagas backend",
    "vagas desenvolvedor",
    "trabalho remoto tecnologia",
    "emprego TI Brasil",
    "vagas dev",
    "oportunidades tecnologia",
    "vagas programação",
    "emprego developer",
  ],
  authors: [{ name: "youhide", url: "https://github.com/youhide" }],
  creator: "youhide",
  publisher: "vagas.tec.br",
  formatDetection: {
    email: false,
    telephone: false,
  },
  openGraph: {
    title: "vagas.tec.br - Vagas de Tecnologia no Brasil",
    description:
      "Encontre vagas de DevOps, Backend e tecnologia das maiores comunidades brasileiras. Atualizado diariamente.",
    url: "https://vagas.tec.br",
    siteName: "vagas.tec.br",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "vagas.tec.br - Vagas de Tecnologia no Brasil",
    description:
      "Encontre vagas de DevOps, Backend e tecnologia das maiores comunidades brasileiras.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://vagas.tec.br",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
