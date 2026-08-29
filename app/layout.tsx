import "./globals.css";
import type { Metadata } from "next";
import { Providers } from "./providers";
import { Navigation } from "@/components/navigation";

export const metadata: Metadata = {
  title: "LOOP — Close the loop on customer feedback",
  description: "Multi-tenant customer feedback intelligence platform.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50 antialiased">
        <Providers>
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
