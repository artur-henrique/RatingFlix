import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { QueryProvider } from "@/components/shared/query-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { StarGradientDefs } from "@/components/shared/star-gradient-defs";
import { AuthProvider } from "@/features/auth/auth-context";
import "./globals.css";

// General Sans não está no Google Fonts (é da Fontshare), então usamos
// next/font/local com os arquivos baixados direto do CDN oficial deles,
// hospedados no próprio projeto — mesmo benefício de otimização/preload
// do next/font, sem depender de uma requisição externa em produção.
const generalSans = localFont({
  src: [
    { path: "./fonts/GeneralSans-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/GeneralSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/GeneralSans-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "./fonts/GeneralSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-general-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RatingFlix",
  description: "Rede social para avaliar e descobrir filmes e séries.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${generalSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <StarGradientDefs />
        <QueryProvider>
          <AuthProvider>
            <SiteHeader />
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
