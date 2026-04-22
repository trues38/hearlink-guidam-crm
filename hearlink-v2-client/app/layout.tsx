import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Hearlink CRM - Impeccable",
  description: "Modern CRM Dashboard for Audiology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="dark">
      <body className="flex h-screen overflow-hidden bg-background text-foreground selection:bg-brand-500/30 transition-colors duration-300">
        <ThemeProvider>
          <div className="flex w-full h-full">
            <Sidebar />
            <main className="flex-1 overflow-y-auto relative bg-background transition-colors duration-300 w-full">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-muted/20 via-background to-background pointer-events-none -z-10 transition-colors duration-300" />
              <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-full">
                {children}
              </div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
