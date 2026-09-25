import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SkillSwapProvider } from "@/context/SkillSwapContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ToastContainer from "@/components/Toast";
import AppShell from "@/components/layout/AppShell";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#08090D",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "SkillSwap — Learn anything. Teach what you love.",
  description:
    "A platform where people exchange skills instead of money. Real-time matching, no fees, no gatekeeping — just people teaching people. 1 Hour = 10 Credits.",
  keywords: [
    "skill swap",
    "peer learning",
    "mentorship",
    "credit exchange",
    "1 hour 10 credits",
  ],
  openGraph: {
    title: "SkillSwap — Learn anything. Teach what you love.",
    description:
      "Real-time skill exchange — teach what you know, learn what you don't.",
    type: "website",
  },
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
        {/* Anti-FOUC: force dark mode immediately */}
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
        {/* viewport-fit=cover for mobile notch/safe-area */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className="min-h-full flex flex-col bg-background text-foreground selection:bg-[#7C6CF6]/40 selection:text-white font-sans"
        style={{ fontFamily: "var(--font-plus-jakarta), ui-sans-serif, system-ui, sans-serif" }}
      >
        <ThemeProvider>
          <SkillSwapProvider>
            <AppShell>
              {children}
            </AppShell>
            <ToastContainer />
          </SkillSwapProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
