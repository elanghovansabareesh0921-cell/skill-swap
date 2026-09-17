"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function checkAuth() {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    }
    checkAuth();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between">
      {/* Navbar */}
      <header className="border-b bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-black tracking-tight text-blue-600">SkillSwap</span>
            <Badge variant="outline" className="text-xs text-blue-700 border-blue-200">v1.0</Badge>
          </div>
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <Button onClick={() => router.push("/dashboard")}>
                Go to Dashboard →
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-6 py-20 text-center space-y-6">
          <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 px-3 py-1 text-xs">
            Powered by Google Gemini 2.5 Flash
          </Badge>

          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Exchange Knowledge. <br />
            <span className="text-blue-600">Learn Without Boundaries.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
            A reciprocal peer-to-peer learning platform. Teach what you excel at, earn credits, 
            and learn anything from matched peers with automated AI matchmaking.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Button size="lg" className="px-8 text-base" onClick={() => router.push(isAuthenticated ? "/dashboard" : "/login")}>
              {isAuthenticated ? "Launch Dashboard" : "Start Swapping Free"}
            </Button>
            <Link href="/matches">
              <Button size="lg" variant="outline" className="px-8 text-base">
                Explore Matches
              </Button>
            </Link>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
              <CardContent className="pt-6 space-y-2">
                <div className="text-3xl">🤖</div>
                <h2 className="text-lg font-bold text-slate-900">AI Reciprocal Matching</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Gemini analyzes reciprocal skill overlaps and goals, providing scored matches and personalized compatibility rationales.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
              <CardContent className="pt-6 space-y-2">
                <div className="text-3xl">🪙</div>
                <h2 className="text-lg font-bold text-slate-900">Escrowed Credit System</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Sessions automatically hold 10 credits in escrow upon booking, releasing them safely to the mentor upon confirmed completion.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-200 shadow-sm hover:shadow transition-shadow">
              <CardContent className="pt-6 space-y-2">
                <div className="text-3xl">⚡</div>
                <h2 className="text-lg font-bold text-slate-900">Real-Time Coordination</h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Built-in WebSockets push instant chat messages for session planning, followed by peer ratings and Gemini session takeaways.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 bg-slate-50 text-center text-xs text-slate-500">
        <p>Built with Next.js App Router, Supabase & Google Gemini API.</p>
      </footer>
    </div>
  );
}