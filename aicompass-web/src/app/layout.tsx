import type { Metadata } from "next";
import { Fraunces, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  style: ["normal", "italic"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "AI Compass · AI Native Foundation",
    template: "%s | AI Compass"
  },
  description: "The only AI readiness assessment that researches and validates intelligence about you and your organization before asking a single question. Get your personalized 11-section report.",
  keywords: ["AI readiness", "AI assessment", "artificial intelligence", "AI strategy", "digital transformation", "AI literacy", "enterprise AI"],
  authors: [{ name: "AI Native Foundation" }],
  creator: "AI Native Foundation",
  publisher: "AI Native Foundation",
  metadataBase: new URL('https://ainativefoundation.org/aicompass'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ainativefoundation.org/aicompass',
    siteName: 'AI Compass',
    title: 'AI Compass - Know Where You Stand. Know Where to Lead.',
    description: 'AI readiness assessment that researches your context before asking questions. Personalized 11-section report with peer benchmarks.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Compass - AI Readiness Assessment'
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Compass - AI Readiness Assessment',
    description: 'The only AI assessment that researches your context first. Get personalized insights.',
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
      <head>
        <link 
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,600;0,700;1,300;1,400;1,600&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body
        className={`${dmSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
        style={{
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
