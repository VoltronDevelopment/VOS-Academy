import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VOS Academy | Voltron Coating Solutions",
  description:
    "Admin-controlled workforce training, certification, and audit evidence for Voltron Coating Solutions."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
