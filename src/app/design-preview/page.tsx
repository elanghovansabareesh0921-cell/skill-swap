"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { GradientGlow } from "@/components/ui/gradient-glow"
import {
  Sparkles,
  ArrowRight,
  Check,
  Search,
  Sliders,
  Send,
  Clock,
  Layers,
  Star,
  ExternalLink,
} from "lucide-react"

export default function DesignPreviewPage() {
  const [inputValue, setInputValue] = useState("")

  return (
    <div className="relative min-h-screen w-full bg-[#08090D] text-[#F3F4F6] selection:bg-[#7C6CF6]/30 selection:text-white pb-24 overflow-x-hidden">
      {/* Background Glow Layer */}
      <GradientGlow variant="default" />

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16">
        {/* Navigation & Breadcrumb */}
        <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-12">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#7C6CF6] to-[#06B6D4] text-white shadow-lg shadow-[#7C6CF6]/30">
              <Layers className="size-5" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest text-[#06B6D4] font-semibold">
                SkillSwap System
              </span>
              <h2 className="text-sm font-medium text-white/90">
                Phase 1: Design System Foundation
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="active">Design Tokens Active</Badge>
            <Link href="/">
              <Button variant="secondary" size="sm" className="gap-1.5 text-xs">
                Back to App
                <ExternalLink className="size-3.5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Hero Section */}
        <div className="mb-16 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 mb-4">
            <Badge variant="outline" className="px-3 py-1 text-xs">
              <Sparkles className="size-3 text-[#7C6CF6]" />
              Dark Glassmorphism Preview
            </Badge>
          </div>
          <h1 className="heading-hero mb-4 text-white">
            Dark Glassmorphism <span className="text-gradient">Design Foundation</span>
          </h1>
          <p className="max-w-2xl text-base sm:text-lg text-white/60 leading-relaxed">
            Near-black canvas with 4–6% translucent glass layers, 10% white borders,
            indigo-to-cyan gradient accents, and 0.875rem rounded radii.
          </p>
        </div>

        {/* Section 1: Color Tokens & Surface Swatches */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="heading-section text-white">1. Design Tokens & Surfaces</h2>
              <p className="text-sm text-white/60">
                CSS variables mapped to Tailwind theme tokens
              </p>
            </div>
            <Badge variant="secondary">globals.css</Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {/* Background Token */}
            <div className="glass rounded-xl p-4 flex flex-col gap-2">
              <div className="h-12 w-full rounded-lg bg-[#08090D] border border-white/20 shadow-inner" />
              <div className="text-xs font-semibold text-white">Background</div>
              <div className="text-[11px] font-mono text-white/50">#08090D</div>
              <div className="text-[10px] text-white/40">Canvas base</div>
            </div>

            {/* Card Glass Token */}
            <div className="glass rounded-xl p-4 flex flex-col gap-2">
              <div className="h-12 w-full rounded-lg glass flex items-center justify-center text-[10px] text-white/70">
                rgba(255,255,255,0.05)
              </div>
              <div className="text-xs font-semibold text-white">Glass Card</div>
              <div className="text-[11px] font-mono text-white/50">white @ ~5%</div>
              <div className="text-[10px] text-white/40">+ backdrop blur</div>
            </div>

            {/* Border Token */}
            <div className="glass rounded-xl p-4 flex flex-col gap-2">
              <div className="h-12 w-full rounded-lg bg-black/40 border-2 border-white/10 flex items-center justify-center text-[10px] text-white/70">
                10% Border
              </div>
              <div className="text-xs font-semibold text-white">Border</div>
              <div className="text-[11px] font-mono text-white/50">white @ ~10%</div>
              <div className="text-[10px] text-white/40">Subtle separation</div>
            </div>

            {/* Primary Violet Token */}
            <div className="glass rounded-xl p-4 flex flex-col gap-2">
              <div className="h-12 w-full rounded-lg bg-[#7C6CF6] shadow-md shadow-[#7C6CF6]/40" />
              <div className="text-xs font-semibold text-white">Primary Indigo</div>
              <div className="text-[11px] font-mono text-white/50">#7C6CF6</div>
              <div className="text-[10px] text-white/40">Gradient start</div>
            </div>

            {/* Cyan Token */}
            <div className="glass rounded-xl p-4 flex flex-col gap-2">
              <div className="h-12 w-full rounded-lg bg-[#06B6D4] shadow-md shadow-[#06B6D4]/40" />
              <div className="text-xs font-semibold text-white">Cyan Accent</div>
              <div className="text-[11px] font-mono text-white/50">#06B6D4</div>
              <div className="text-[10px] text-white/40">Gradient stop</div>
            </div>

            {/* Gradient Swatch */}
            <div className="glass rounded-xl p-4 flex flex-col gap-2">
              <div className="h-12 w-full rounded-lg bg-gradient-to-r from-[#7C6CF6] via-[#6857F3] to-[#06B6D4] shadow-md shadow-indigo-500/30" />
              <div className="text-xs font-semibold text-white">Accent Gradient</div>
              <div className="text-[11px] font-mono text-white/50">Indigo → Cyan</div>
              <div className="text-[10px] text-white/40">CTA & highlights</div>
            </div>
          </div>
        </section>

        {/* Section 2: Typography Scale & Gradient Text */}
        <section className="mb-16">
          <div className="mb-6">
            <h2 className="heading-section text-white">2. Typography & Gradient Text</h2>
            <p className="text-sm text-white/60">
              Font: Geist Sans with calibrated scale and clipped gradient text utilities
            </p>
          </div>

          <Card className="p-8 space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                .heading-hero (5xl / 6xl)
              </span>
              <h1 className="heading-hero text-white">
                Learn Any Skill <span className="text-gradient">Zero Dollar Exchange</span>
              </h1>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-1">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                .heading-section (3xl / 4xl)
              </span>
              <h2 className="heading-section text-white">
                Accelerate Mentorship with{" "}
                <span className="text-gradient">Real-Time Sessions</span>
              </h2>
            </div>

            <div className="border-t border-white/10 pt-4 space-y-1">
              <span className="text-xs font-mono text-white/40 uppercase tracking-wider">
                .heading-card (xl / 2xl)
              </span>
              <h3 className="heading-card text-white">
                Full-Stack Next.js 16 Architecture & WebRTC
              </h3>
            </div>

            <div className="border-t border-white/10 pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass rounded-xl p-4">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-1">
                  .text-gradient
                </span>
                <span className="text-xl font-bold text-gradient">
                  Indigo to Cyan Accent
                </span>
              </div>
              <div className="glass rounded-xl p-4">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-1">
                  .text-gradient-cyan
                </span>
                <span className="text-xl font-bold text-gradient-cyan">
                  Cyan to Sky Blue Accent
                </span>
              </div>
              <div className="glass rounded-xl p-4">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-1">
                  .text-gradient-violet
                </span>
                <span className="text-xl font-bold text-gradient-violet">
                  Purple to Violet Accent
                </span>
              </div>
            </div>
          </Card>
        </section>

        {/* Section 3: Button Showcase */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="heading-section text-white">3. Button Primitives</h2>
              <p className="text-sm text-white/60">
                Primary gradient-fill (indigo→cyan) + Secondary glass-outline
              </p>
            </div>
            <Badge variant="active">All Variants & Sizes</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary & Secondary Variants */}
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Core Action Variants
                </h3>
                <p className="text-xs text-white/50">
                  Primary gradient fill and glass-outline secondary
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button variant="default">
                  Primary Action
                  <ArrowRight className="size-4" />
                </Button>
                <Button variant="secondary">
                  <Sliders className="size-4" />
                  Secondary Glass
                </Button>
                <Button variant="outline">
                  Glass Outline
                </Button>
                <Button variant="ghost">
                  Ghost Action
                </Button>
                <Button variant="destructive">
                  Destructive
                </Button>
                <Button variant="link">
                  Link Style
                </Button>
              </div>

              <div className="border-t border-white/10 pt-4">
                <span className="text-xs font-mono text-white/40 block mb-3">
                  BUTTON SIZES: lg, default, sm, xs
                </span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="lg">
                    Large Button
                    <Sparkles className="size-4" />
                  </Button>
                  <Button size="default">
                    Default Button
                  </Button>
                  <Button size="sm">
                    Small Button
                  </Button>
                  <Button size="xs">
                    Extra Small
                  </Button>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4">
                <span className="text-xs font-mono text-white/40 block mb-3">
                  ICON BUTTONS
                </span>
                <div className="flex items-center gap-3">
                  <Button size="icon-lg">
                    <Sparkles className="size-5" />
                  </Button>
                  <Button size="icon">
                    <Send className="size-4" />
                  </Button>
                  <Button size="icon-sm" variant="secondary">
                    <Search className="size-3.5" />
                  </Button>
                  <Button size="icon-xs" variant="secondary">
                    <Check className="size-3" />
                  </Button>
                </div>
              </div>
            </Card>

            {/* Interactive & State Examples */}
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  States & Focus Rings
                </h3>
                <p className="text-xs text-white/50">
                  Disabled, active elevation, and focus states
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <Button variant="default" disabled>
                    Disabled Primary
                  </Button>
                  <Button variant="secondary" disabled>
                    Disabled Secondary
                  </Button>
                </div>

                <div className="glass rounded-xl p-4 space-y-2">
                  <span className="text-xs font-semibold text-white">Focus Ring Test</span>
                  <p className="text-xs text-white/60">
                    Tab onto the button below to inspect the gradient accent focus ring (#7C6CF6/70).
                  </p>
                  <div className="pt-2 flex gap-3">
                    <Button variant="default">Tab focus here</Button>
                    <Button variant="secondary">Or focus here</Button>
                  </div>
                </div>

                <div className="glass rounded-xl p-4">
                  <span className="text-xs font-semibold text-white block mb-1">
                    Elevation & Inset Highlight
                  </span>
                  <p className="text-xs text-white/60">
                    Secondary buttons use subtle inset top-highlight (rgba 255,255,255,0.06)
                    and backdrop-filter blur for authentic depth.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 4: Card Primitives */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="heading-section text-white">4. Card Primitive (.glass)</h2>
              <p className="text-sm text-white/60">
                Card applies .glass by default: backdrop-blur-xl, ~5% white fill, 10% border, inset top-highlight
              </p>
            </div>
            <Badge variant="success">Glass Default</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Standard Glass Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="active">Active Session</Badge>
                  <span className="text-xs font-mono text-white/50">30 credits/hr</span>
                </div>
                <CardTitle className="mt-2">Full-Stack Mentorship</CardTitle>
                <CardDescription>
                  1-on-1 code reviews and Next.js 16 architectural planning.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70">
                  Includes real-time collaborative whiteboard, live WebRTC video room, and
                  AI-assisted session transcripts.
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="text-xs text-white/50">Available today</span>
                <Button size="sm">Book Slot</Button>
              </CardFooter>
            </Card>

            {/* Interactive Hover Card */}
            <Card className="glass-interactive cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="pending">Pending Match</Badge>
                  <div className="flex items-center gap-1 text-xs text-amber-300">
                    <Star className="size-3.5 fill-amber-300" />
                    <span>4.9</span>
                  </div>
                </div>
                <CardTitle className="mt-2">UI/UX Design Systems</CardTitle>
                <CardDescription>
                  Interactive hover elevation card with accent border glow.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-white/70">
                  Hover over this card to verify the smooth transform translateY(-1px),
                  enhanced border brightness, and indigo shadow elevation.
                </p>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <span className="text-xs text-white/50">4.8 Rating (24 reviews)</span>
                <Button variant="secondary" size="sm">
                  View Profile
                </Button>
              </CardFooter>
            </Card>

            {/* Small Size Card */}
            <Card size="sm">
              <CardHeader>
                <CardTitle>Compact Card (size=&quot;sm&quot;)</CardTitle>
                <CardDescription>Tighter padding and spacing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white/60">Credit balance</span>
                    <span className="font-semibold text-white">45 credits</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#7C6CF6] to-[#06B6D4]" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button size="xs" variant="secondary">
                  Top Up
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>

        {/* Section 5: Input Primitives */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="heading-section text-white">5. Input Primitive</h2>
              <p className="text-sm text-white/60">
                Dark glass background (bg-white/[0.04]), subtle border, gradient accent focus ring
              </p>
            </div>
            <Badge variant="secondary">Input Component</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4">
              <h3 className="text-base font-semibold text-white">Interactive Inputs</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-white/70 block mb-1.5">
                    Standard Dark Glass Input
                  </label>
                  <Input
                    placeholder="Search by skill, e.g. React, Python, UI Design..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/70 block mb-1.5">
                    Input With Default Value
                  </label>
                  <Input defaultValue="TypeScript & Tailwind Glassmorphism" />
                </div>

                <div>
                  <label className="text-xs font-medium text-white/70 block mb-1.5">
                    Disabled State
                  </label>
                  <Input disabled placeholder="This field is currently disabled" />
                </div>

                <div>
                  <label className="text-xs font-medium text-red-400 block mb-1.5">
                    Invalid / Error State
                  </label>
                  <Input
                    aria-invalid="true"
                    defaultValue="invalid-format-input"
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4">
              <h3 className="text-base font-semibold text-white">Input With Add-ons</h3>
              <p className="text-xs text-white/50">
                Composite search bar pattern built with glass input and buttons
              </p>

              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-white/40" />
                <Input
                  className="pl-10 pr-24"
                  placeholder="Find mentors or skills..."
                />
                <Button
                  size="xs"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs"
                >
                  Search
                </Button>
              </div>

              <div className="glass rounded-xl p-4 text-xs text-white/70 space-y-2">
                <span className="font-semibold text-white block">Focus Behavior:</span>
                <p>
                  Click into any input above to see the sharp focus ring transition to{" "}
                  <span className="font-mono text-[#7C6CF6]">#7C6CF6</span> with ambient glow.
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 6: Badge Primitives */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="heading-section text-white">6. Badge Primitives</h2>
              <p className="text-sm text-white/60">
                Glass pill with colored status dots: pending, active, success, error
              </p>
            </div>
            <Badge variant="active">Status Dots</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status Dot Badges */}
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Status Dot Badges
                </h3>
                <p className="text-xs text-white/50">
                  Spec-defined status dots for lifecycle states
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="pending">Pending Review</Badge>
                <Badge variant="active">Active Session</Badge>
                <Badge variant="success">Completed Exchange</Badge>
                <Badge variant="error">Connection Dropped</Badge>
              </div>

              <div className="border-t border-white/10 pt-4 space-y-2">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block">
                  Status Dot Highlights:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-2 text-amber-300">
                    <span className="size-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    <span>Pending (Amber)</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyan-300">
                    <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)] animate-pulse" />
                    <span>Active (Cyan pulse)</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-300">
                    <span className="size-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <span>Success (Emerald)</span>
                  </div>
                  <div className="flex items-center gap-2 text-rose-300">
                    <span className="size-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                    <span>Error (Rose)</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Standard Glass Pill Variants */}
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-white mb-1">
                  Glass Pill Variants
                </h3>
                <p className="text-xs text-white/50">
                  Standard backward-compatible variants restyled with glass
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="default">Default Glass</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline Pill</Badge>
                <Badge variant="ghost">Ghost Pill</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>

              <div className="border-t border-white/10 pt-4">
                <span className="text-xs font-mono text-white/40 uppercase tracking-wider block mb-2">
                  With Custom Status Prop:
                </span>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" status="active">
                    Step 1 of 3 (In Progress)
                  </Badge>
                  <Badge variant="secondary" status="success">
                    Verified Mentor
                  </Badge>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* Section 7: Composite Mock Card (Sanity Check) */}
        <section className="mb-16">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="heading-section text-white">7. Composite Experience Sanity Check</h2>
              <p className="text-sm text-white/60">
                How all Phase 1 primitives look assembled together in a real-world card
              </p>
            </div>
            <Badge variant="active">All Primitives Combined</Badge>
          </div>

          <Card className="max-w-2xl mx-auto p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 size-40 rounded-full bg-[#7C6CF6]/20 blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-2xl bg-gradient-to-tr from-[#7C6CF6] to-[#06B6D4] p-0.5 shadow-lg shadow-indigo-500/25">
                  <div className="h-full w-full rounded-[14px] bg-[#08090D] flex items-center justify-center font-bold text-white">
                    JS
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    Jordan Santos
                    <Badge variant="success">Verified Pro</Badge>
                  </h3>
                  <p className="text-xs text-white/60">
                    Senior Frontend Architect • Ex-Stripe
                  </p>
                </div>
              </div>
              <Badge variant="active">Online Now</Badge>
            </div>

            <p className="text-sm text-white/80 mb-6 leading-relaxed">
              Offering deep-dive sessions on{" "}
              <span className="text-gradient font-semibold">
                React 19, Turbopack, and Glassmorphic Component Systems
              </span>
              . Swap coding mentorship for UI design or mobile dev skills.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <Badge variant="secondary">Next.js 16</Badge>
              <Badge variant="secondary">TypeScript</Badge>
              <Badge variant="secondary">Tailwind CSS</Badge>
              <Badge variant="pending">3 Slots Remaining</Badge>
            </div>

            <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/70">
                <Clock className="size-4 text-[#06B6D4]" />
                <span>Next Available: Today at 4:00 PM EST</span>
              </div>
              <span className="text-xs font-semibold text-white">
                30 Credits / Hr
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
              <Button variant="secondary">
                View Curriculum
              </Button>
              <Button variant="default">
                Request Skill Swap
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </Card>
        </section>

        {/* Footer info */}
        <div className="text-center text-xs text-white/40 pt-8 border-t border-white/10">
          SkillSwap Dark Glassmorphism Redesign — Phase 1 Design System Foundation Complete.
        </div>
      </div>
    </div>
  )
}
