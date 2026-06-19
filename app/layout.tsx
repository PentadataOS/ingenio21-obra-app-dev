import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "SOIARQ Obra",
  description: "Cierre documental, simple y confiable.",
  icons: { icon: "/icon-s.png" },
};
export const viewport: Viewport = {
  themeColor: "#4f46e5", width: "device-width", initialScale: 1, maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="font-sans">{children}</body>
    </html>
  );
}
