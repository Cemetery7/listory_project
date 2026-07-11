import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Листория",
  description: "Истории, которые хочется читать.",
  icons: {
    icon: [
      {
        url: "/brand/logo-icon.png",
        sizes: "any",
        type: "image/png"
      }
    ],
    apple: "/brand/logo-icon.png"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
