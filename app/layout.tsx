import "./globals.css";
import AppShell from "./components/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clube Clinosp Prime",
  description: "Programa de fidelidade premium da Clinosp Prime",

  icons: {
    icon: "/favicon.ico",
  },

  openGraph: {
    title: "Clube Clinosp Prime",
    description: "Programa de fidelidade premium da Clinosp Prime",
    url: "https://clube.avaliacaoclinosprime.com.br/clube",
    siteName: "Clube Clinosp Prime",

    images: [
      {
        url: "https://clube.avaliacaoclinosprime.com.br/preview.png",
        width: 1200,
        height: 630,
        alt: "Clube Clinosp Prime",
      },
    ],

    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}