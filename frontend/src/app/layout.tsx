import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { QueryProvider } from "@/components/shared/query-provider";
import { SiteHeader } from "@/components/shared/site-header";
import { StarGradientDefs } from "@/components/shared/star-gradient-defs";
import { AuthProvider } from "@/features/auth/auth-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
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
