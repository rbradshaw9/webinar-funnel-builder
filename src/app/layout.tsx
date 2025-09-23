import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Income Stacking Masterclass - Free Training | The Cash Flow Academy",
  description: "Learn how to generate multiple income streams from a single stock with Rich Dad Expert Andy Tanner. Free live webinar on Income Stacking strategies for cash flow investing.",
  keywords: "income stacking, cash flow investing, stock market training, Andy Tanner, Rich Dad, dividend investing, options trading, passive income",
  openGraph: {
    title: "Income Stacking Masterclass - Free Training",
    description: "Learn how to generate multiple income streams from a single stock with Rich Dad Expert Andy Tanner.",
    url: "https://training.thecashflowacademy.com/income-stacking-fb",
    siteName: "The Cash Flow Academy",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Income Stacking Masterclass - Free Training",
    description: "Learn how to generate multiple income streams from a single stock with Rich Dad Expert Andy Tanner.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
