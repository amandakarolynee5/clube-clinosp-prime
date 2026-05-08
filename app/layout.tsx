import "./globals.css";
import AppShell from "./components/AppShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clube Clinosp Prime",
  icons: {
    icon: "/favicon.ico",
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