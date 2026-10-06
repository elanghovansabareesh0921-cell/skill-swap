import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { FaqChatbot } from "@/components/FaqChatbot";

const space = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const sans = DM_Sans({ subsets: ["latin"], variable: "--font-dm" });

export const metadata: Metadata = {
  title: "SkillSwap: teach one thing, learn another",
  description: "Trade lessons with people who want what you know.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${space.variable} ${sans.variable}`} suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <FaqChatbot />
        </ThemeProvider>
      </body>
    </html>
  );
}
