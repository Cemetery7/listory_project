import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Листория",
  description: "Истории, которые хочется читать."
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
