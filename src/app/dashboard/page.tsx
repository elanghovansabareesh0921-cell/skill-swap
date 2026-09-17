import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top Navbar */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <span className="text-xl font-bold tracking-tight">SkillSwap</span>
            <nav className="hidden md:flex space-x-4 text-sm font-medium text-slate-600">
              <Link href="/dashboard" className="text-blue-600">Dashboard</Link>
              <Link href="/dashboard" className="hover:text-slate-900">Browse Matches</Link>
              <Link href="/dashboard" className="hover:text-slate-900">Sessions</Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 bg-slate-100 px-3 py-1.5 rounded-full text-sm font-medium">
              <span>🪙 Credits:</span>
              <span className="font-bold text-blue-600">50</span>
            </div>
            <Button variant="ghost" size="sm">Log out</Button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Hub */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back!</h1>
          <p className="text-slate-500">Here are your active skills and top peer matches.</p>
        </div>

        {/* Profile Skill Badges */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills You Teach</CardTitle>
              <CardDescription>Earn credits by scheduling sessions for these</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge className="bg-emerald-600 hover:bg-emerald-700">Python (Intermediate)</Badge>
              <Badge className="bg-emerald-600 hover:bg-emerald-700">DSA Basics</Badge>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Skills You Are Learning</CardTitle>
              <CardDescription>Spend credits to learn from peers</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-blue-500 text-blue-700">Fullstack Web Dev</Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-700">UI/UX Design</Badge>
            </CardContent>
          </Card>
        </div>

        {/* Suggested Peer Matches (Mocking Phase 7/8) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight">Top Skill Matches</h2>
            <Badge variant="secondary">Algorithm Matches</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Match 1 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Alex Rivera</CardTitle>
                    <CardDescription>Teaches: UI/UX Design • Wants: Python</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">95% Match</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Alex wants to automate design assets with Python scripts and can teach wireframing and design systems.
                </p>
                <div className="flex justify-end">
                  <Button size="sm">Request Session</Button>
                </div>
              </CardContent>
            </Card>

            {/* Match 2 */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-base">Sarah Chen</CardTitle>
                    <CardDescription>Teaches: Web Development • Wants: DSA</CardDescription>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">88% Match</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-slate-600">
                  Sarah is preparing for technical interviews and can mentor on frontend state management in return.
                </p>
                <div className="flex justify-end">
                  <Button size="sm">Request Session</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}