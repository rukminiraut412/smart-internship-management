import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smart Internship Management and Monitoring System",
  description: "Academic and industry internship tracking with explainable progress monitoring and early-attention layer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-900 bg-slate-50">
        {children}
      </body>
    </html>
  );
}
