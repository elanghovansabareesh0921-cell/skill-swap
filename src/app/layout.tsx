import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SkillSwapProvider } from "@/context/SkillSwapContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ToastContainer from "@/components/Toast";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "600", "800"],
});

export const metadata: Metadata = {
  title: "SkillSwap — Learn anything. Teach what you love.",
  description:
    "A platform where people exchange skills instead of money. Real-time matching, no fees, no gatekeeping — just people teaching people. 1 Hour = 10 Credits.",
  keywords: ["skill swap", "peer learning", "mentorship", "credit exchange", "1 hour 10 credits"],
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
      className={`${plusJakarta.variable} h-full antialiased dark`}
    >
      <head>
        {/* Anti-FOUC script: defaults to dark mode as specified */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('skillswap_theme');
                  var isDark = stored ? (stored === 'dark' || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) : true;
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
      <body className="min-h-full flex flex-col bg-[#f5f2fc] dark:bg-[#130f26] text-[#241b3d] dark:text-[#f4f0ff] selection:bg-[#7d6ce8] selection:text-white pb-16 md:pb-0 transition-colors duration-150 font-sans">
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
