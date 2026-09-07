import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Copy Library",
  description: "Browse and write outbound copy from your best performing campaigns",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
