"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import BuyCreditsModal from "@/components/BuyCreditsModal";
import { useSkillSwap, CommunityPost } from "@/context/SkillSwapContext";
import {
  MessageSquare,
  ThumbsUp,
  Plus,
  Share2,
  X,
  Sparkles,
  HelpCircle,
  Code2,
  Trophy,
  Users,
} from "lucide-react";

const TAG_FILTERS = [
  "All",
  "Question",
  "Project",
  "Collaboration",
  "Achievement",
  "Discussion",
];

export default function CommunityPage() {
  const { communityPosts, upvotePost, createPost, currentUser } = useSkillSwap();

  const [activeTag, setActiveTag] = useState<string>("All");
  const [isBuyCreditsOpen, setIsBuyCreditsOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New post form fields
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<CommunityPost["tag"]>("Question");

  const filteredPosts = communityPosts.filter((post) => {
    if (activeTag === "All") return true;
    return post.tag === activeTag;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createPost({
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      authorRole: currentUser.role,
      title: title.trim(),
      content: content.trim(),
      tag,
    });

    setTitle("");
    setContent("");
    setIsCreateModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F9FAFB]">
      <Navbar onOpenBuyCredits={() => setIsBuyCreditsOpen(true)} />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-gray-200/80">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
              Community Discussions
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              Peer Exchange & Collaborate
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Ask questions, share projects, find pair-learning partners, and discuss skills.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-gray-900 hover:bg-indigo-600 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Start Discussion</span>
          </button>
        </div>

        {/* Filter Tags */}
        <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TAG_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTag(t)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTag === t
                  ? "bg-gray-900 text-white font-semibold shadow-sm"
                  : "bg-white text-gray-600 border border-gray-200 hover:border-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Discussion Posts Feed */}
        <div className="mt-6 space-y-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-5 sm:p-6 hover:border-gray-300 transition-colors"
            >
              {/* Post Header: Author info, tag badge, timestamp */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={post.authorAvatar}
                    alt={post.authorName}
                    className="w-9 h-9 rounded-full object-cover border border-gray-100"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-gray-900">{post.authorName}</h3>
                    <p className="text-[11px] text-gray-400">{post.authorRole}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-semibold">
                    {post.tag}
                  </span>
                  <span className="text-[11px] text-gray-400">{post.timeAgo}</span>
                </div>
              </div>

              {/* Title & Body */}
              <div className="mt-3.5">
                <h2 className="text-base font-bold text-gray-900 leading-snug">
                  {post.title}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                  {post.content}
                </p>
              </div>

              {/* Bottom Actions: Upvotes, Replies */}
              <div className="mt-5 pt-3.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => upvotePost(post.id)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border transition-all ${
                      post.hasUpvoted
                        ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-semibold"
                        : "border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{post.upvotes}</span>
                  </button>

                  <span className="flex items-center gap-1.5 text-gray-500">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{post.replyCount} replies</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      navigator.clipboard?.writeText(window.location.href);
                    }
                  }}
                  className="p-1 rounded text-gray-400 hover:text-gray-600"
                  title="Share link"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* New Discussion Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 overflow-hidden">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-gray-900">Start a Discussion</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Share knowledge, propose a topic swap, or ask fellow peers for guidance.
            </p>

            <form onSubmit={handleCreatePost} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Discussion Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Seeking mentor in Go concurrency, will teach React..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
                <select
                  value={tag}
                  onChange={(e) => setTag(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  <option value="Question">Question</option>
                  <option value="Collaboration">Collaboration</option>
                  <option value="Project">Project</option>
                  <option value="Achievement">Achievement</option>
                  <option value="Discussion">Discussion</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Content</label>
                <textarea
                  required
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Explain what you want to learn or discuss..."
                  className="w-full px-3 py-2 text-xs bg-gray-50 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
                >
                  Publish Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <BuyCreditsModal
        isOpen={isBuyCreditsOpen}
        onClose={() => setIsBuyCreditsOpen(false)}
      />
    </div>
  );
}
