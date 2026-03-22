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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="h-full bg-background text-on-surface font-body antialiased">
        {children}
      </body>
    </html>
  );
}
