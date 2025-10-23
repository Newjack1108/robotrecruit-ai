import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://robotrecruit.ai'),
  
  title: {
    default: "RobotRecruit.AI - AI-Powered Recruitment Bots",
    template: "%s | RobotRecruit.AI",
  },
  description: "Your AI-powered recruitment agency with specialized bots for every need. Expert guidance, 24/7 availability, and custom training capabilities. Built from recycled components!",
  keywords: [
    "AI recruitment",
    "AI bots",
    "recruitment automation",
    "AI assistant",
    "chatbot",
    "AI hiring",
    "recruitment platform",
    "AI workforce",
    "virtual assistants",
    "business automation"
  ],
  authors: [{ name: "Robot Recruit AI" }],
  creator: "Robot Recruit AI",
  publisher: "Robot Recruit AI",
  
  // Open Graph (Facebook, LinkedIn, WhatsApp)
  openGraph: {
    type: "website",
    locale: "en_GB",
    url: "/",
    siteName: "RobotRecruit.AI",
    title: "RobotRecruit.AI - AI-Powered Recruitment Bots",
    description: "Your AI-powered recruitment agency with specialized bots for every need. Expert guidance, 24/7 availability, and custom training capabilities.",
    images: [
      {
        url: "/group-bots.png",
        width: 1200,
        height: 630,
        alt: "Robot Recruit AI - Specialized Recruitment Bots",
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "RobotRecruit.AI - AI-Powered Recruitment Bots",
    description: "Your AI-powered recruitment agency with specialized bots for every need. 24/7 availability, expert guidance.",
    images: ["/group-bots.png"],
    creator: "@RobotRecruitAI",
  },
  
  // Icons & Web App Manifest
  icons: {
    icon: '/favicon.png',
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  
  // Additional SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification (add these when you have them)
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  // },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInFallbackRedirectUrl="/chat"
      signUpFallbackRedirectUrl="/chat"
    >
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} antialiased`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
