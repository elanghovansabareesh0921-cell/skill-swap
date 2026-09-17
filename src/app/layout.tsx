import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SkillSwapProvider } from "@/context/SkillSwapContext";
import ToastContainer from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SkillSwap — Peer-to-Peer Skill Exchange",
  description:
    "Learn something new. Teach what you know. SkillSwap connects learners and teachers through a fair, transparent credit-based exchange.",
  keywords: ["skills", "mentorship", "peer learning", "coding", "design", "credit exchange"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F9FAFB] text-gray-900 selection:bg-indigo-100 selection:text-indigo-900 pb-16 md:pb-0">
        <SkillSwapProvider>
          {children}
          <ToastContainer />
        </SkillSwapProvider>
      </body>
    </html>
  );
}
