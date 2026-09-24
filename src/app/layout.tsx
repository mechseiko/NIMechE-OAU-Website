import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthProvider";
import { ToastProvider } from "@/context/ToastProvider";
import { A11yProvider } from "@/context/A11yProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const sora = Sora({ subsets: ["latin"], variable: "--font-display", display: "swap" });

export const metadata: Metadata = {
  title: {
    default: "NIMechE OAU-SC — Nigerian Institution of Mechanical Engineers, OAU Students' Chapter",
    template: "%s · NIMechE OAU-SC",
  },
  description:
    "Official website of the Nigerian Institution of Mechanical Engineers (NIMechE), Obafemi Awolowo University Students' Chapter — news, projects, opportunities, elections and more from the Department of Mechanical Engineering, Great Ife.",
  keywords: [
    "NIMechE",
    "Mechanical Engineering",
    "Obafemi Awolowo University",
    "OAU",
    "engineering students",
    "elections",
  ],
  openGraph: {
    title: "NIMechE OAU Students' Chapter",
    description: "Manufacturing for man's comfort — the home of Mechanical Engineering students at OAU.",
    siteName: "NIMechE OAU-SC",
    type: "website",
    images: [{ url: "/images/logo-nimeche.jpg" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#016737",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <A11yProvider>
          <ToastProvider>
            <AuthProvider>{children}</AuthProvider>
          </ToastProvider>
        </A11yProvider>
      </body>
    </html>
  );
}
