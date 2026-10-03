'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRightLeft, 
  Star, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Zap, 
  CheckCircle, 
  Search, 
  ArrowRight,
  SlidersHorizontal,
  Compass,
  Radio
} from 'lucide-react';
import { RadarMatch } from '@/types';

interface AiRadarViewProps {
  matches: RadarMatch[];
  onSelectMatch: (match: RadarMatch, initialMode?: 'SWAP' | 'DIRECT') => void;
  onOpenEditSkills: () => void;
}

export const AiRadarView: React.FC<AiRadarViewProps> = ({
  matches,
  onSelectMatch,
  onOpenEditSkills,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'swap'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredMatches = matches.filter(m => {
    if (filterMode === 'swap' && !m.isSwapMatch) return false;
    if (selectedCategory !== 'all' && m.teacherOfferingSkill.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inName = m.teacher.fullName.toLowerCase().includes(q);
      const inSkill = m.teacherOfferingSkill.skillName.toLowerCase().includes(q);
      const inBio = m.teacher.bio.toLowerCase().includes(q);
      if (!inName && !inSkill && !inBio) return false;
    }
    return true;
  });

  const categories = ['all', 'Software & Tech', 'Design & Creative', 'Languages', 'Business & Finance', 'Music & Arts'];
  const swapCount = matches.filter(m => m.isSwapMatch).length;

  return (
    <div className="space-y-8">
      {/* Spatial Atmospheric Radar Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-dark p-8 sm:p-10 text-white spatial-card shadow-2xl">
        {/* Directional Specular Edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        {/* Soft Ambient Depth Glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 ambient-glow-lagoon opacity-50 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 ambient-glow-saffron opacity-40 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Text / Controls */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-mist-pure/10 border border-white/15 px-3 py-1 text-xs font-mono font-semibold text-teal-300 backdrop-blur-md">
              <Radio className="h-3.5 w-3.5 text-saffron animate-pulse" />
              <span>SPATIAL RADAR ACTIVE • 2-SIDED REPUTATION</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.08]">
              Exchange skills with vetted peers.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron via-amber-200 to-white">
                Save 70% with mutual swaps.
              </span>
            </h1>

            <p className="text-sm text-white/75 max-w-2xl leading-relaxed font-normal">
              Our spatial matcher ranks compatible peers based on mutual skill intersection, schedule overlap, language, and trust history. Skill points remain locked in automated escrow until both parties confirm completion.
            </p>

            {/* Quick Filter Pill Switcher */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFilterMode('swap')}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all border cursor-pointer ${
                  filterMode === 'swap'
                    ? 'border-saffron bg-saffron text-ink dark:text-black shadow-lg shadow-saffron/25'
                    : 'border-white/15 bg-mist-pure/5 text-white hover:border-white/30'
                }`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Swap Matches Only</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  filterMode === 'swap' ? 'bg-ink/20 text-ink dark:text-black' : 'bg-mist-pure/10 text-white'
                }`}>
                  {swapCount}
                </span>
              </button>

              <button
                onClick={() => setFilterMode('all')}
                className={`flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold transition-all border cursor-pointer ${
                  filterMode === 'all'
                    ? 'border-white bg-mist-pure text-ink shadow-sm'
                    : 'border-white/15 bg-mist-pure/5 text-white/75 hover:text-white'
                }`}
              >
                <span>All Mutual Matches</span>
                <span className="rounded-full bg-mist-pure/10 px-2 py-0.5 text-[10px] font-mono">
                  {matches.length}
                </span>
              </button>

              <button
                onClick={onOpenEditSkills}
                className="text-xs text-saffron hover:underline ml-auto font-medium cursor-pointer flex items-center gap-1.5"
              >
                <span>Edit Teach / Learn Vectors</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Right Visual Spatial Radar Widget */}
          <div className="hidden lg:flex lg:col-span-4 items-center justify-center">
            <div className="relative h-56 w-56 rounded-full border border-white/15 flex items-center justify-center bg-mist-pure/[0.02] backdrop-blur-xs">
              {/* Concentric rings */}
              <div className="absolute inset-4 rounded-full border border-white/10 border-dashed" />
              <div className="absolute inset-12 rounded-full border border-white/10" />
              <div className="absolute inset-20 rounded-full border border-white/10 border-dashed" />
              
              {/* Rotating sweep line */}
              <div className="absolute inset-0 flex items-center justify-center radar-sweep-beam pointer-events-none">
                <div className="h-28 w-28 bg-gradient-to-tr from-lagoon/20 via-saffron/15 to-transparent rounded-full -translate-x-1/2 -translate-y-1/2" />
              </div>

              {/* Center User Node */}
              <div className="relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-ink dark:bg-[#0f1b2d] border-2 border-lagoon text-white shadow-lg">
                <Compass className="h-5 w-5 text-saffron" />
              </div>

              {/* Orbital Peer Blips */}
              <div 
                className="absolute top-8 right-10 h-3 w-3 rounded-full bg-saffron shadow-md shadow-saffron/60 animate-ping" 
                title="Mutual Swap Match"
              />
              <div 
                className="absolute top-8 right-10 h-3 w-3 rounded-full bg-saffron border border-white cursor-pointer" 
                title="Mutual Swap Match"
              />
              <div 
                className="absolute bottom-10 left-12 h-2.5 w-2.5 rounded-full bg-teal-400 border border-white shadow-sm cursor-pointer" 
                title="Skill Match"
              />
              <div 
                className="absolute top-16 left-8 h-2.5 w-2.5 rounded-full bg-emerald-400 border border-white shadow-sm cursor-pointer" 
                title="Active Now"
              />

              <div className="absolute bottom-2 text-[10px] font-mono text-white/50 tracking-wider">
                RADAR: {matches.length} NODES
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Minimal Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink/40" />
          <input
            type="text"
            placeholder="Search skills, names, or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-ink/10 bg-mist-pure pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none shadow-xs transition-all dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
          />
        </div>

        {/* Category tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-medium transition-all border cursor-pointer ${
                selectedCategory === cat
                  ? 'border-ink bg-ink text-white shadow-xs dark:border-saffron dark:bg-saffron dark:text-black'
                  : 'border-ink/10 bg-mist-pure/70 text-ink/70 hover:border-ink/20 hover:text-ink'
              }`}
            >
              {cat === 'all' ? 'All Domains' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Spatial Match Tiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredMatches.map(match => (
          <div
            key={match.teacher.id}
            className={`group relative rounded-3xl p-6 transition-all duration-300 spatial-card flex flex-col justify-between ${
              match.isSwapMatch
                ? 'glass-panel border-saffron/40 bg-mist-pure/95 shadow-md hover:border-saffron hover:shadow-xl'
                : 'glass-panel border-ink/8 hover:border-ink/20'
            }`}
          >
            <div>
              {/* Card Header: Avatar & Match Score */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <img
                      src={match.teacher.avatarUrl}
                      alt={match.teacher.fullName}
                      className="h-12 w-12 rounded-2xl object-cover border border-ink/10 shadow-xs"
                    />
                    <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs" title="Verified Member">
                      <ShieldCheck className="h-3 w-3" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-ink text-base flex items-center gap-2">
                      {match.teacher.fullName}
                      <span className="flex items-center text-xs font-mono font-bold text-amber-600 dark:text-saffron">
                        <Star className="h-3 w-3 fill-current mr-0.5" />
                        {match.teacher.reputationScore.toFixed(2)}
                      </span>
                    </h3>
                    <p className="text-xs text-ink/60 flex items-center gap-1.5 mt-0.5">
                      <MapPin className="h-3 w-3 inline text-ink/40" />
                      {match.teacher.city}, {match.teacher.country} • {match.teacher.completedSessionsCount} sessions
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    <Sparkles className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    {match.matchScore}% FIT
                  </div>
                  {match.isSwapMatch && (
                    <div className="mt-1">
                      <span className="inline-block rounded-full bg-saffron text-ink px-2 py-0.5 text-[9px] font-mono font-extrabold uppercase tracking-wider shadow-xs">
                        SWAP MATCH
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bio summary */}
              <p className="mt-3.5 text-xs text-ink/75 line-clamp-2 leading-relaxed font-normal">
                {match.teacher.bio}
              </p>

              {/* Two-Sided Skill Exchange Vectors */}
              <div className="mt-4 grid grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-2xl border border-ink/8 bg-mist p-3">
                  <div className="text-[10px] font-mono uppercase text-lagoon font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-lagoon" />
                    They Teach
                  </div>
                  <div className="font-semibold text-ink truncate mt-1">
                    {match.teacherOfferingSkill.skillName}
                  </div>
                  <div className="text-[10px] text-ink/50 mt-0.5">
                    {match.teacherOfferingSkill.level} • {match.teacherOfferingSkill.hourlyRate} SP/hr
                  </div>
                </div>

                <div className="rounded-2xl border border-ink/8 bg-mist p-3">
                  <div className="text-[10px] font-mono uppercase text-amber-700 dark:text-saffron font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-saffron" />
                    They Seek
                  </div>
                  <div className="font-semibold text-ink truncate mt-1">
                    {match.teacher.learnSkills[0]?.skillName || 'Open to learn'}
                  </div>
                  <div className="text-[10px] text-ink/50 mt-0.5">
                    {match.teacher.learnSkills[0]?.targetLevel || 'Curious'}
                  </div>
                </div>
              </div>

              {/* AI Radar Match Rationales */}
              <div className="mt-3.5 space-y-1">
                {match.reasons.map((reason, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-[11px] text-ink/65">
                    <CheckCircle className="h-3 w-3 text-lagoon shrink-0" />
                    <span>{reason}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Preview & Primary CTA Bar */}
            <div className="mt-5 pt-4 border-t border-ink/8 flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] text-ink/50 font-mono uppercase tracking-wider">
                  {match.isSwapMatch ? 'MUTUAL SWAP RATE' : 'LIST RATE'}
                </div>
                {match.isSwapMatch && match.swapPriceTokens ? (
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-mono font-extrabold text-ink">
                      {match.swapPriceTokens} SP
                    </span>
                    <span className="text-xs text-ink/40 line-through font-mono">
                      {match.directPriceTokens} SP
                    </span>
                    <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.2 text-[9px] font-mono font-bold text-emerald-800">
                      -70% SAVED
                    </span>
                  </div>
                ) : (
                  <div className="text-xl font-mono font-extrabold text-ink">
                    {match.directPriceTokens} SP
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {match.isSwapMatch ? (
                  <button
                    onClick={() => onSelectMatch(match, 'SWAP')}
                    className="flex items-center gap-1.5 rounded-full bg-lagoon px-5 py-2 text-xs font-semibold text-white shadow-md shadow-lagoon/20 hover:bg-lagoon-dark transition-all cursor-pointer"
                  >
                    <ArrowRightLeft className="h-3.5 w-3.5" />
                    <span>Propose Swap</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectMatch(match, 'DIRECT')}
                    className="flex items-center gap-1.5 rounded-full border border-ink/15 bg-mist-pure px-4 py-2 text-xs font-semibold text-ink hover:bg-ink hover:text-white dark:hover:bg-saffron dark:hover:text-black dark:hover:border-saffron transition-all cursor-pointer shadow-xs"
                  >
                    <Zap className="h-3.5 w-3.5 text-saffron" />
                    <span>Request Direct</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
