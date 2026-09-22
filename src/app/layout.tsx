import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SkillSwapProvider } from "@/context/SkillSwapContext";
import { ThemeProvider } from "@/context/ThemeContext";
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
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Anti-FOUC script: set dark class before render if theme is dark */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('skillswap_theme');
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F9FAFB] dark:bg-[#090D16] text-gray-900 dark:text-gray-100 selection:bg-indigo-500 selection:text-white pb-16 md:pb-0 transition-colors duration-150">
        <ThemeProvider>
          <SkillSwapProvider>
            {children}
            <ToastContainer />
          </SkillSwapProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
