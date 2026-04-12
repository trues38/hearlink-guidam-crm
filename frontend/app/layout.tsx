import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "./components/Sidebar";

export const metadata: Metadata = {
  title: "Hearlink Guidam CRM",
  description: "Hearlink CRM System for hearing aid center management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
      </head>
      <body className="min-h-screen bg-slate-100 font-['Inter']">
        <Sidebar />
        <main className="ml-64 p-6 min-h-screen">
          <div className="max-w-7xl mx-auto animate-fade-in">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
