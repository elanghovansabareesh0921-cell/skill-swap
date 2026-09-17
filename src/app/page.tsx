import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Navigation */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <span className="text-xl font-bold tracking-tight">SkillSwap</span>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <Badge variant="secondary" className="px-3 py-1 text-sm">
            Peer-to-Peer • AI Powered • Credit Economy
          </Badge>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            Trade your knowledge. <br />
            <span className="text-blue-600">Learn anything for free.</span>
          </h1>
          <p className="text-lg text-slate-600">
            Teach a skill you master to earn credits. Use those credits to book 1-on-1 sessions with peers, guided by AI lesson plans.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/signup">
              <Button size="lg">Start Swapping Skills</Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg">Explore Matches</Button>
            </Link>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <Card>
            <CardHeader>
              <CardTitle>Teach & Earn</CardTitle>
              <CardDescription>Share what you know</CardDescription>
            </CardHeader>
            <CardContent>
              Conduct a 1-hour session in programming, design, or languages to deposit credits directly into your balance.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Smart Matching</CardTitle>
              <CardDescription>AI-driven compatibility</CardDescription>
            </CardHeader>
            <CardContent>
              Gemini matches your learning targets directly with peers who want to learn what you can teach.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Structured Guides</CardTitle>
              <CardDescription>Zero guesswork</CardDescription>
            </CardHeader>
            <CardContent>
              Every video session comes with a generated teaching agenda and sequential modules tailored to your level.
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
