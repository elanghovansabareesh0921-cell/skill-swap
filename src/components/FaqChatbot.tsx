'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquareText, 
  X, 
  Send, 
  Sparkles, 
  BookOpen, 
  HelpCircle, 
  ExternalLink, 
  ShieldCheck, 
  ArrowRightLeft, 
  ChevronRight,
  Headphones,
  CheckCircle2,
  Bot
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface FaqArticle {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  content: string;
}

const FAQ_KNOWLEDGE_BASE: FaqArticle[] = [
  {
    id: 'art-pricing',
    category: 'Skill Points & Pricing',
    title: 'How does the 70% Swap Discount formula work?',
    excerpt: 'When both members teach each other, in-kind value is deducted so you only pay a 30% swap fee.',
    content: 'Under PRD §7.6A, SkillSwap calculates the in-kind value exchanged, **M = min(Leg 1, Leg 2)**. Each learner pays: *(list price − M) + 0.30 × M*. For equal 60 SP sessions, both members pay only 18 SP each—a **70% reduction** compared to paying direct cash.'
  },
  {
    id: 'art-escrow',
    category: 'Escrow & Safety',
    title: 'How does double-entry escrow protect my skill points?',
    excerpt: 'Your skill points remain locked in our zero-overdraft ledger until both parties submit completion confirmation.',
    content: 'When you propose or accept an exchange, skill points move from **Available** to **Held** status. \n\n* The skill points are never released to the teacher until both parties tap "Confirm Completed". \n* If a session is cancelled or declined, skill points are automatically credited back to your Available wallet.'
  },
  {
    id: 'art-meet',
    category: 'Scheduling & Google Meet',
    title: 'How do we schedule sessions and get Google Meet links?',
    excerpt: 'Propose a time inside the temporary 1:1 chat. Once both peers confirm, a Google Meet link is generated automatically.',
    content: 'Inside the temporary chat thread, either participant can propose a date and time slot. When the other member taps "Accept", the platform automatically generates an authenticated **Google Meet** link (`meet.google.com`) and attaches it to both your calendar and session view.'
  },
  {
    id: 'art-disputes',
    category: 'Trust & Disputes',
    title: 'What happens if a partner does not show up?',
    excerpt: 'Teacher no-shows trigger a 100% full refund plus a strike on their profile. 3 strikes lead to review.',
    content: 'If a partner is absent after 15 minutes, you can tap **"Dispute"** on the session page. Escrow is immediately frozen, and our operations team reviews chat timestamps and join telemetry. Validated no-shows result in a **100% refund** to the learner and a penalty strike on the absent member.'
  },
  {
    id: 'art-tokens',
    category: 'Wallet & Currency',
    title: 'What is the skill point value and how do I top up?',
    excerpt: '1 Skill Point = ₹1.00 INR. Buy packs via Razorpay (UPI, Google Pay, Cards, Netbanking).',
    content: 'SkillSwap skill points have a guaranteed **1:1 parity** with the Indian Rupee (1 SP = ₹1.00) and are stored in integer paise for precision. You can top up your wallet in standard packs (50, 100, 250, 500, 1000) or any custom amount starting at ₹50.'
  },
  {
    id: 'art-admin',
    category: 'Admin & Support',
    title: 'How do I contact support or access the admin panel?',
    excerpt: 'Only verified admins can access the Escrow Admin dashboard.',
    content: 'The **Escrow Admin** panel is restricted to authorized platform administrators (e.g., `elanghovansabareesh0921@gmail.com`). If you have an issue with a session, please use the **Dispute** button on the session page or escalate through this chat to open a ticket.'
  }
];

interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  citedArticle?: FaqArticle;
  canEscalate?: boolean;
}

export const FaqChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [ticketCreated, setTicketCreated] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'bot',
      text: 'Hi! I am the SkillSwap FAQ AI assistant. Ask me anything about our **70% swap discount**, **escrow safety**, **scheduling on Google Meet**, or **skill point purchases**.',
      timestamp: 'Just now',
    }
  ]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (userText: string) => {
    const q = userText.trim();
    if (!q) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate RAG grounded search against knowledge base
    setTimeout(() => {
      const lower = q.toLowerCase();
      let matchedArticle: FaqArticle | undefined;

      if (lower.includes('swap') || lower.includes('discount') || lower.includes('70') || lower.includes('cost') || lower.includes('price')) {
        matchedArticle = FAQ_KNOWLEDGE_BASE.find(a => a.id === 'art-pricing');
      } else if (lower.includes('escrow') || lower.includes('safe') || lower.includes('protect') || lower.includes('money')) {
        matchedArticle = FAQ_KNOWLEDGE_BASE.find(a => a.id === 'art-escrow');
      } else if (lower.includes('meet') || lower.includes('google') || lower.includes('schedule') || lower.includes('link') || lower.includes('time')) {
        matchedArticle = FAQ_KNOWLEDGE_BASE.find(a => a.id === 'art-meet');
      } else if (lower.includes('no show') || lower.includes('show up') || lower.includes('dispute') || lower.includes('strike') || lower.includes('cancel')) {
        matchedArticle = FAQ_KNOWLEDGE_BASE.find(a => a.id === 'art-disputes');
      } else if (lower.includes('token') || lower.includes('skill point') || lower.includes('wallet') || lower.includes('rupee') || lower.includes('inr') || lower.includes('buy') || lower.includes('pack')) {
        matchedArticle = FAQ_KNOWLEDGE_BASE.find(a => a.id === 'art-tokens');
      } else if (lower.includes('admin') || lower.includes('support') || lower.includes('contact') || lower.includes('issue')) {
        matchedArticle = FAQ_KNOWLEDGE_BASE.find(a => a.id === 'art-admin');
      }

      if (matchedArticle) {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: matchedArticle.content,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citedArticle: matchedArticle,
        };
        setMessages(prev => [...prev, botMsg]);
      } else {
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'bot',
          text: "I want to make sure you get the exact right answer. My automated knowledge base covers platform policies, skill points, escrow, Google Meet scheduling, and swap calculations. Would you like me to open a support ticket for our operations team?",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          canEscalate: true,
        };
        setMessages(prev => [...prev, botMsg]);
      }
      setIsTyping(false);
    }, 700);
  };

  const handleEscalateTicket = () => {
    const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketCreated(ticketId);
    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: `Support ticket #${ticketId} has been created and assigned to our operations queue with your conversation context. We will respond within our 24-hour SLA via email.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, botMsg]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Trigger Dock Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 rounded-full spatial-dock px-4 py-3 shadow-xl hover:shadow-2xl transition-all cursor-pointer hover:scale-105 border border-ink/10 bg-mist-pure/95"
          aria-label="Open SkillSwap FAQ Chatbot"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white dark:bg-saffron dark:text-black group-hover:bg-lagoon dark:group-hover:bg-saffron-light dark:group-hover:text-black transition-colors shadow-xs">
            <MessageSquareText className="h-4 w-4" />
            <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-saffron dark:bg-emerald-400 border-2 border-white dark:border-black animate-pulse" />
          </div>
          <div className="text-left pr-1 hidden sm:block">
            <div className="text-xs font-bold text-ink leading-tight flex items-center gap-1.5">
              <span>FAQ Radar Bot</span>
              <span className="rounded-full bg-lagoon/10 px-1.5 py-0.2 text-[9px] font-mono text-lagoon font-bold">
                AI HELP
              </span>
            </div>
            <div className="text-[10px] text-ink/50">Questions & Policy Guide</div>
          </div>
        </button>
      )}

      {/* Spatial Chat Modal Window */}
      {isOpen && (
        <div className="flex h-[560px] w-[380px] sm:w-[420px] flex-col rounded-3xl glass-panel-elevated shadow-2xl border border-white/50 overflow-hidden relative">
          {/* Specular Edge */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between border-b border-ink/8 bg-mist-pure/80 backdrop-blur-md px-5 py-3.5">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-2xl bg-lagoon text-white shadow-xs">
                <Sparkles className="h-4 w-4 text-saffron" />
              </div>
              <div>
                <h3 className="font-display font-bold text-ink text-sm flex items-center gap-1.5">
                  SkillSwap FAQ Assistant
                </h3>
                <p className="text-[10px] text-ink/50 font-mono">
                  Grounded in platform documentation & PRD v0.2
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1.5 text-ink/40 hover:bg-ink/5 hover:text-ink transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-ink text-white dark:bg-saffron dark:text-black rounded-br-none'
                      : 'glass-panel text-ink border border-ink/8 rounded-bl-none'
                  }`}
                >
                  <div className={`prose prose-sm ${msg.sender === 'user' ? 'prose-invert dark:prose-neutral dark:text-black' : 'dark:prose-invert'} max-w-none`}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>

                  {/* Knowledge Base Citation */}
                  {msg.citedArticle && (
                    <div className="mt-2.5 pt-2 border-t border-ink/10 text-[10px] flex items-center justify-between font-mono text-lagoon">
                      <span className="flex items-center gap-1 font-semibold truncate max-w-[200px]">
                        <BookOpen className="h-3 w-3 shrink-0" />
                        {msg.citedArticle.title}
                      </span>
                      <span className="rounded bg-lagoon/10 px-1 py-0.2 text-[9px]">
                        POLICY
                      </span>
                    </div>
                  )}

                  {/* Human Support Escalation Option */}
                  {msg.canEscalate && !ticketCreated && (
                    <div className="mt-3 pt-2.5 border-t border-ink/10">
                      <button
                        onClick={handleEscalateTicket}
                        className="flex items-center gap-1.5 rounded-full bg-lagoon px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-lagoon-dark transition-all cursor-pointer shadow-xs"
                      >
                        <Headphones className="h-3 w-3" />
                        <span>Escalate to Human Support</span>
                      </button>
                    </div>
                  )}
                </div>
                <span className="mt-1 text-[9px] text-ink/40 font-mono px-1">
                  {msg.timestamp}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-ink/40 text-[11px] pl-2 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-lagoon animate-bounce" />
                <span className="h-1.5 w-1.5 rounded-full bg-lagoon animate-bounce [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 rounded-full bg-lagoon animate-bounce [animation-delay:0.4s]" />
                <span className="ml-1">Checking policy documentation...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Question Suggestion Pills */}
          <div className="border-t border-ink/6 bg-mist-pure/50 p-2.5 overflow-x-auto flex gap-1.5 no-scrollbar">
            <button
              onClick={() => handleSend('How does the 70% swap discount work?')}
              className="whitespace-nowrap rounded-full border border-ink/10 bg-mist-pure/90 px-2.5 py-1 text-[10px] font-medium text-ink/70 hover:border-lagoon hover:text-ink cursor-pointer"
            >
              70% Swap Discount
            </button>
            <button
              onClick={() => handleSend('How does escrow protect my money?')}
              className="whitespace-nowrap rounded-full border border-ink/10 bg-mist-pure/90 px-2.5 py-1 text-[10px] font-medium text-ink/70 hover:border-lagoon hover:text-ink cursor-pointer"
            >
              Escrow Protection
            </button>
            <button
              onClick={() => handleSend('How do Google Meet links get generated?')}
              className="whitespace-nowrap rounded-full border border-ink/10 bg-mist-pure/90 px-2.5 py-1 text-[10px] font-medium text-ink/70 hover:border-lagoon hover:text-ink cursor-pointer"
            >
              Google Meet Links
            </button>
            <button
              onClick={() => handleSend('What happens on a no show or cancellation?')}
              className="whitespace-nowrap rounded-full border border-ink/10 bg-mist-pure/90 px-2.5 py-1 text-[10px] font-medium text-ink/70 hover:border-lagoon hover:text-ink cursor-pointer"
            >
              No-show & Strikes
            </button>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend(input);
            }}
            className="border-t border-ink/8 bg-mist-pure/90 p-3"
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about skill points, swaps, escrow..."
                className="flex-1 rounded-full border border-ink/15 bg-mist-pure px-3.5 py-2 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none shadow-xs dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-all cursor-pointer ${
                  input.trim()
                    ? 'bg-lagoon text-white hover:bg-lagoon-dark shadow-xs'
                    : 'bg-ink/10 text-ink/30 cursor-not-allowed'
                }`}
              >
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
