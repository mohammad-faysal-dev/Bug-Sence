import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "BugSense — AI-Powered Code Diagnostics & Bug Analyzer",
  description:
    "BugSense uses advanced AI reasoning to analyze programming errors, explain root causes, and provide actionable solutions for developers.",
  keywords: ["debugging", "AI", "bug analysis", "BugSense", "developer tools", "code diagnostics"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
