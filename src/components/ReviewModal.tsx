'use client';

import React, { useState } from 'react';
import { Star, X, EyeOff, CheckCircle2 } from 'lucide-react';
import { SessionLeg } from '@/types';

interface ReviewModalProps {
  session: SessionLeg;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (sessionId: string, rating: number, feedback: string, tags: string[]) => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  session,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [feedback, setFeedback] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const availableTags = [
    'Punctual & Prepared',
    'Clear Explanations',
    'Deep Domain Knowledge',
    'Hands-on Practical Examples',
    'Patient & Friendly',
    'Excellent Follow-up Resources',
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return;

    onSubmitReview(session.id, rating, feedback, selectedTags);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-xl p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg glass-panel-elevated rounded-3xl p-7 sm:p-9 shadow-2xl border border-white/40 overflow-hidden">
        {/* Specular Edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-600 shadow-xs">
              <Star className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-ink">Rate Session & Leave Review</h2>
              <p className="text-xs text-ink/60">Leg {session.legIndex}: {session.skillName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-ink/40 hover:bg-ink/5 hover:text-ink transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Double-Blind Escrow Notice */}
        <div className="mt-4 rounded-2xl bg-mist border border-ink/8 p-3.5 flex items-start gap-2.5 text-xs text-ink/75">
          <EyeOff className="h-4 w-4 text-lagoon shrink-0 mt-0.5" />
          <div className="leading-snug">
            <strong className="text-ink font-semibold block">Double-Blind Review Protocol (PRD §7.10)</strong>
            Your review and rating remain completely hidden from your peer until both parties have submitted feedback, eliminating bias.
          </div>
        </div>

        {isSubmitted ? (
          <div className="my-8 text-center py-6 space-y-2">
            <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h3 className="font-display font-bold text-ink text-base">Review Sealed in Escrow</h3>
            <p className="text-xs text-ink/60">It will unlock once your partner completes their review.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-5 space-y-5">
            {/* Star Rating Picker */}
            <div className="text-center space-y-2">
              <label className="text-xs font-semibold text-ink uppercase tracking-wider font-mono">
                Overall Experience Rating
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 transition-transform hover:scale-110 cursor-pointer focus:outline-none"
                  >
                    <Star
                      className={`h-7 w-7 transition-colors ${
                        (hoverRating || rating) >= star
                          ? 'text-saffron fill-saffron'
                          : 'text-ink/20'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-xs font-mono text-ink/50">
                {rating === 5 ? 'Exceptional Session' : rating === 4 ? 'Very Good' : rating === 3 ? 'Satisfactory' : 'Needs Improvement'}
              </div>
            </div>

            {/* Strength Tags */}
            <div>
              <label className="text-xs font-semibold text-ink block mb-2">
                Highlights & Strengths (Select all that apply)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map(tag => {
                  const selected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all border cursor-pointer ${
                        selected
                          ? 'border-lagoon bg-lagoon text-white shadow-xs'
                          : 'border-ink/10 bg-mist-pure/70 text-ink/70 hover:border-ink/20'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Written Feedback Textarea */}
            <div>
              <label className="text-xs font-semibold text-ink block mb-1">
                Written Feedback for Community Reputation
              </label>
              <textarea
                rows={3}
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="Share constructive feedback about what was covered, pacing, and learning outcomes..."
                className="w-full rounded-2xl border border-ink/15 bg-mist-pure p-3 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none shadow-xs resize-none dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-4 py-2 text-xs font-semibold text-ink/70 hover:bg-ink/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-lagoon px-6 py-2.5 text-xs font-semibold text-white hover:bg-lagoon-dark shadow-md shadow-lagoon/20 hover:shadow-lg transition-all cursor-pointer"
              >
                Submit Double-Blind Review
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
