import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MundIAl 26 — La Quiniela Definitiva",
  description: "La quiniela más exclusiva del Mundial 2026. Predice, compite y domina el ranking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark h-full">
      <body className="h-full bg-dark-bg text-white antialiased">
        {children}
      </body>
    </html>
  );
}
