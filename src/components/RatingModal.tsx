"use client";

import React, { useState } from "react";
import { X, Star, Sparkles, CheckCircle2 } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  teacherName: string;
  skillTitle: string;
  onClose: () => void;
  onSubmit: (data: { rating: number; comment: string; endorsements: string[] }) => void;
}

const ENDORSEMENTS = [
  "Clear explanations",
  "Patient & friendly",
  "Real-world code examples",
  "Actionable roadmap",
  "Great pace",
  "Highly recommended",
];

export default function RatingModal({
  isOpen,
  teacherName,
  skillTitle,
  onClose,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedEndorsements, setSelectedEndorsements] = useState<string[]>([
    "Clear explanations",
    "Real-world code examples",
  ]);

  if (!isOpen) return null;

  const toggleEndorsement = (tag: string) => {
    setSelectedEndorsements((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ rating, comment, endorsements: selectedEndorsements });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl border border-gray-200/90 shadow-2xl p-6 sm:p-7 overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">How was your session?</h3>
          <p className="text-xs text-gray-500 mt-1">
            {skillTitle} with <span className="font-semibold text-gray-700">{teacherName}</span>
          </p>

          {/* Star Rating */}
          <div className="flex items-center justify-center gap-2 mt-5">
            {[1, 2, 3, 4, 5].map((star) => {
              const active = (hoverRating || rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 text-2xl transition-transform hover:scale-110 focus:outline-none"
                >
                  <Star
                    className={`w-7 h-7 ${
                      active ? "text-amber-400 fill-amber-400" : "text-gray-200"
                    }`}
                  />
                </button>
              );
            })}
          </div>
          <span className="text-xs font-semibold text-gray-500 mt-1.5 block">
            {rating === 5
              ? "Exceptional!"
              : rating === 4
              ? "Very Good"
              : rating === 3
              ? "Good"
              : "Could be better"}
          </span>
        </div>

        {/* Endorsements Chips */}
        <div className="mt-5">
          <label className="block text-xs font-semibold text-gray-700 mb-2">
            Skill Endorsements
          </label>
          <div className="flex flex-wrap gap-1.5">
            {ENDORSEMENTS.map((tag) => {
              const isSelected = selectedEndorsements.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleEndorsement(tag)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                    isSelected
                      ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                      : "bg-gray-50 text-gray-600 border border-gray-200/80 hover:bg-gray-100"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Feedback text */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Feedback & Takeaways (Optional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What was most helpful? Any key advice to remember?"
            rows={3}
            className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-gray-800"
          />
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit & Release Credits
          </button>
        </div>
      </div>
    </div>
  );
}
