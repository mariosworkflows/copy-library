import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import SessionTracker from "@/components/SessionTracker";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";

export const metadata: Metadata = {
  title: "Copy Library",
  description: "Browse and write outbound copy from your best performing campaigns",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {session && <SessionTracker />}
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
