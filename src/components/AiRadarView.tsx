'use client';

import React, { useState, useMemo } from 'react';
import { 
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
  Users,
  Check,
  Calendar
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
  const [filterMode, setFilterMode] = useState<'all' | 'swap' | 'direct'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'best' | 'rating' | 'rate-asc' | 'sessions'>('best');

  const categories = ['all', 'Software & Tech', 'Design & Creative', 'Languages', 'Business & Finance', 'Music & Arts'];
  const swapCount = matches.filter(m => m.isSwapMatch).length;
  const directCount = matches.filter(m => !m.isSwapMatch).length;

  const filteredMatches = useMemo(() => {
    return matches
      .filter(m => {
        if (filterMode === 'swap' && !m.isSwapMatch) return false;
        if (filterMode === 'direct' && m.isSwapMatch) return false;
        if (selectedCategory !== 'all' && m.teacherOfferingSkill.category !== selectedCategory) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const inName = m.teacher.fullName.toLowerCase().includes(q);
          const inSkill = m.teacherOfferingSkill.skillName.toLowerCase().includes(q);
          const inSeek = m.teacher.learnSkills.some(s => s.skillName.toLowerCase().includes(q));
          const inBio = m.teacher.bio.toLowerCase().includes(q);
          if (!inName && !inSkill && !inSeek && !inBio) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'rating') {
          return b.teacher.reputationScore - a.teacher.reputationScore;
        }
        if (sortBy === 'rate-asc') {
          return a.teacherOfferingSkill.hourlyRate - b.teacherOfferingSkill.hourlyRate;
        }
        if (sortBy === 'sessions') {
          return b.teacher.completedSessionsCount - a.teacher.completedSessionsCount;
        }
        // Default: 'best' - Swaps first, then matchScore
        if (a.isSwapMatch && !b.isSwapMatch) return -1;
        if (!a.isSwapMatch && b.isSwapMatch) return 1;
        return b.matchScore - a.matchScore;
      });
  }, [matches, filterMode, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="space-y-8">
      {/* Professional Peer Exchange Header */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-dark p-8 sm:p-10 text-white spatial-card shadow-2xl">
        {/* Specular Edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        
        {/* Subtle Ambient Lighting */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 ambient-glow-lagoon opacity-40 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 h-80 w-80 ambient-glow-saffron opacity-30 blur-3xl" />

        <div className="relative z-10 grid gap-8 lg:grid-cols-12 lg:items-center">
          {/* Left Column: Clear Value Proposition */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-mist-pure/10 border border-white/15 px-3 py-1 text-xs font-mono font-semibold text-teal-300 backdrop-blur-md">
              <ShieldCheck className="h-3.5 w-3.5 text-saffron" />
              <span>VERIFIED PEER EXCHANGE • ESCROW PROTECTED</span>
            </div>

            <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Professional skill exchange.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-saffron via-amber-200 to-white">
                Trade expertise in-kind.
              </span>
            </h1>

            <p className="text-sm text-white/75 max-w-xl leading-relaxed font-normal">
              Connect directly with verified peers to exchange knowledge. Mutual reciprocal swaps qualify for up to 70% discounted in-kind rates, with skill points secured in escrow until session completion.
            </p>

            {/* Quick Filter Pill Switcher */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setFilterMode('all')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all border cursor-pointer ${
                  filterMode === 'all'
                    ? 'border-white bg-mist-pure text-ink shadow-sm'
                    : 'border-white/15 bg-mist-pure/5 text-white/80 hover:text-white hover:border-white/30'
                }`}
              >
                <span>All Peers</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  filterMode === 'all' ? 'bg-ink/10 text-ink' : 'bg-mist-pure/10 text-white'
                }`}>
                  {matches.length}
                </span>
              </button>

              <button
                onClick={() => setFilterMode('swap')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all border cursor-pointer ${
                  filterMode === 'swap'
                    ? 'border-saffron bg-saffron text-ink dark:text-black shadow-lg shadow-saffron/25'
                    : 'border-white/15 bg-mist-pure/5 text-white/80 hover:text-white hover:border-white/30'
                }`}
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
                <span>Reciprocal Swaps</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  filterMode === 'swap' ? 'bg-ink/20 text-ink dark:text-black' : 'bg-mist-pure/10 text-white'
                }`}>
                  {swapCount}
                </span>
              </button>

              <button
                onClick={() => setFilterMode('direct')}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all border cursor-pointer ${
                  filterMode === 'direct'
                    ? 'border-lagoon-light bg-lagoon text-white shadow-sm'
                    : 'border-white/15 bg-mist-pure/5 text-white/80 hover:text-white hover:border-white/30'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-saffron" />
                <span>Direct Lessons</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                  filterMode === 'direct' ? 'bg-white/20 text-white' : 'bg-mist-pure/10 text-white'
                }`}>
                  {directCount}
                </span>
              </button>
            </div>
          </div>

          {/* Right Column: Clean Professional Metrics Summary Card */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl border border-white/15 bg-mist-pure/[0.04] backdrop-blur-md p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-mono uppercase tracking-wider text-white/60 font-semibold">
                  Network Summary
                </span>
                <button
                  onClick={onOpenEditSkills}
                  className="text-xs text-saffron hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Edit My Skills</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-mist-pure/5 border border-white/10 p-3">
                  <div className="text-[10px] text-white/60 uppercase font-mono">Available Peers</div>
                  <div className="mt-1 text-2xl font-bold font-display text-white">{matches.length}</div>
                  <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
                    <CheckCircle className="h-2.5 w-2.5" /> All Verified
                  </div>
                </div>

                <div className="rounded-xl bg-mist-pure/5 border border-white/10 p-3">
                  <div className="text-[10px] text-white/60 uppercase font-mono">Reciprocal Swaps</div>
                  <div className="mt-1 text-2xl font-bold font-display text-saffron">{swapCount}</div>
                  <div className="text-[10px] text-saffron/90 mt-0.5 font-medium">Save up to 70%</div>
                </div>

                <div className="rounded-xl bg-mist-pure/5 border border-white/10 p-3">
                  <div className="text-[10px] text-white/60 uppercase font-mono">Escrow Rate</div>
                  <div className="mt-1 text-sm font-bold text-white font-mono">1 SP = ₹1.00</div>
                  <div className="text-[10px] text-white/50 mt-0.5">Parity Guaranteed</div>
                </div>

                <div className="rounded-xl bg-mist-pure/5 border border-white/10 p-3">
                  <div className="text-[10px] text-white/60 uppercase font-mono">Scheduling</div>
                  <div className="mt-1 text-sm font-bold text-white">Google Meet</div>
                  <div className="text-[10px] text-white/50 mt-0.5">Automated Links</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search, Domain Filter & Sort Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-ink/40" />
          <input
            type="text"
            placeholder="Search by skill, peer name, or topic..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-full border border-ink/10 bg-mist-pure pl-10 pr-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none shadow-xs transition-all dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
          />
        </div>

        {/* Category & Sort controls */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1.5">
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

          <div className="h-4 w-px bg-ink/10 mx-1 hidden sm:block" />

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="rounded-full border border-ink/10 bg-mist-pure px-3.5 py-1.5 text-xs font-medium text-ink focus:outline-none focus:border-lagoon cursor-pointer dark:bg-mist-subtle dark:border-white/15 shadow-xs"
          >
            <option value="best">Best Fit</option>
            <option value="rating">Highest Rated</option>
            <option value="rate-asc">Lowest Rate (SP/hr)</option>
            <option value="sessions">Most Experienced</option>
          </select>
        </div>
      </div>

      {/* Peer Cards Grid */}
      {filteredMatches.length === 0 ? (
        <div className="rounded-3xl glass-panel p-12 text-center border border-ink/10 space-y-4">
          <Users className="h-10 w-10 text-ink/30 mx-auto" />
          <h3 className="font-display font-bold text-lg text-ink">No peers found matching your criteria</h3>
          <p className="text-xs text-ink/60 max-w-md mx-auto">
            Try resetting your search query or category filter to discover more verified teachers and exchange partners.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setFilterMode('all');
              }}
              className="rounded-full bg-ink px-4 py-2 text-xs font-semibold text-white hover:bg-lagoon transition-colors cursor-pointer dark:bg-saffron dark:text-black"
            >
              Reset Filters
            </button>
            <button
              onClick={onOpenEditSkills}
              className="rounded-full border border-ink/15 bg-mist-pure px-4 py-2 text-xs font-semibold text-ink hover:bg-ink/5 transition-colors cursor-pointer"
            >
              Edit Your Skills
            </button>
          </div>
        </div>
      ) : (
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
                {/* Card Header: Avatar & Status Badge */}
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
                    {match.isSwapMatch ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-saffron text-ink px-2.5 py-1 text-[10px] font-mono font-extrabold uppercase tracking-wider shadow-xs">
                        <ArrowRightLeft className="h-3 w-3" />
                        SWAP MATCH
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">
                        <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                        VERIFIED
                      </span>
                    )}
                  </div>
                </div>

                {/* Bio summary */}
                <p className="mt-3.5 text-xs text-ink/75 line-clamp-2 leading-relaxed font-normal">
                  {match.teacher.bio}
                </p>

                {/* Two-Sided Skill Exchange Matrix */}
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

                {/* Transparent Match Insights */}
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
      )}
    </div>
  );
};
