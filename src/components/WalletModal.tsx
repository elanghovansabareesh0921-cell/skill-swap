'use client';

import React, { useState } from 'react';
import { 
  X, 
  Wallet as WalletIcon, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  Receipt,
  Download
} from 'lucide-react';
import { Profile, Wallet, LedgerTransaction } from '@/types';

interface WalletModalProps {
  currentUser: Profile;
  wallet: Wallet;
  transactions: LedgerTransaction[];
  isOpen: boolean;
  onClose: () => void;
  onBuyTokens: (tokens: number) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  currentUser,
  wallet,
  transactions,
  isOpen,
  onClose,
  onBuyTokens,
}) => {
  const [selectedPack, setSelectedPack] = useState<number>(100);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const availableTokens = Math.floor(wallet.availablePaise / 100);
  const heldTokens = Math.floor(wallet.heldPaise / 100);
  const earnedTokens = Math.floor(wallet.lifetimeEarnedPaise / 100);
  const spentTokens = Math.floor(wallet.lifetimeSpentPaise / 100);

  const packs = [50, 100, 250, 500, 1000];

  const initializeRazorpay = () => {
    return new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    const amount = customAmount ? parseInt(customAmount, 10) : selectedPack;
    if (!amount || amount < 50 || amount > 10000) return;

    setIsProcessing(true);
    
    try {
      // 1. Create order on backend
      const res = await fetch('/api/wallet/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountTokens: amount }),
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Payment initialization failed');
      }

      const resLoad = await initializeRazorpay();
      if (!resLoad) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      // 2. Initialize Razorpay options using the returned keyId 
      // (Next.js public vars might be missing if build was cached, so backend keyId is more reliable)
      const options = {
        key: data.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: data.amountPaise.toString(),
        currency: data.currency,
        name: "SkillSwap",
        description: `Purchase of ${data.amountTokens} Skill Points (SP)`,
        order_id: data.orderId,
        handler: async function (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) {
          // 4. Verify Signature
          try {
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amountTokens: amount,
              }),
            });
            const verifyData = await verifyRes.json();
            
            if (verifyRes.ok && verifyData.success) {
              onBuyTokens(amount);
              setShowSuccess(true);
              setTimeout(() => setShowSuccess(false), 2400);
            } else {
              throw new Error(verifyData.error || 'Verification failed');
            }
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            console.error(err);
            alert(`Payment verification failed: ${message}`);
          }
        },
        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
        prefill: {
          name: currentUser.fullName,
          email: currentUser.email,
        },
        theme: {
          color: "#0f766e",
        },
      };

      interface RazorpayInstance {
        open: () => void;
        on: (event: string, handler: (res: { error: { description: string } }) => void) => void;
      }
      type RazorpayConstructor = new (opts: unknown) => RazorpayInstance;
      const RazorpayClass = (window as unknown as { Razorpay: RazorpayConstructor }).Razorpay;
      const paymentObject = new RazorpayClass(options);
      paymentObject.open();
      
      paymentObject.on('payment.failed', function (res: { error: { description: string } }) {
         alert(`Payment Failed: ${res.error.description}`);
         setIsProcessing(false);
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(err);
      alert(`Could not start checkout: ${message}`);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[var(--color-surface)]/70 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[var(--color-border)]/50 rounded-[24px] p-7 sm:p-9 overflow-hidden">
        {/* Specular Edge */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ink/10 dark:via-white/20 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-ink/8 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-lagoon text-white shadow-md shadow-lagoon/20">
              <WalletIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-display text-ink">SkillSwap Wallet & Escrow</h2>
              <p className="text-xs text-ink/60 font-mono">1 Skill Point = SP1.00 (Backed by double-entry ledger)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-ink/40 hover:bg-ink/5 hover:text-ink transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Wallet Balances Card */}
        <div className="mt-5 rounded-2xl bg-linear-to-br from-[#0f1b2d] to-[#1e293b] dark:from-[#0a121e] dark:to-[#142032] border border-white/10 p-6 text-white shadow-xl relative overflow-hidden">
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 ambient-glow-lagoon opacity-40 blur-2xl" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="text-[11px] font-mono text-white/60 uppercase tracking-wider">AVAILABLE BALANCE</div>
              <div className="mt-1 text-4xl font-extrabold font-mono tracking-tight text-white flex items-baseline gap-2">
                <span>{availableTokens}</span>
                <span className="text-sm font-sans font-semibold text-lagoon-light">SP (SP{availableTokens})</span>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-mist-pure/10 px-3 py-1 text-xs font-mono text-emerald-300 border border-white/15">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>ESCROW READY</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-white/60 text-[10px] uppercase block">Locked in Escrow</span>
              <span className="text-saffron font-bold text-sm">{heldTokens} SP</span>
            </div>
            <div>
              <span className="text-white/60 text-[10px] uppercase block">Lifetime Transacted</span>
              <span className="text-white font-bold text-sm">SP{earnedTokens + spentTokens}</span>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {showSuccess && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 p-3.5 text-xs text-emerald-900 dark:text-emerald-300 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>Skill points successfully added via Razorpay test gateway! Your available balance has been credited.</span>
          </div>
        )}

        {/* Top-up Form */}
        <div className="mt-6 space-y-4">
          <label className="text-xs font-semibold text-ink block">Select Skill Points Pack</label>
          <div className="grid grid-cols-5 gap-2">
            {packs.map(amount => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setSelectedPack(amount);
                  setCustomAmount('');
                }}
                className={`rounded-2xl py-3 text-center transition-all border cursor-pointer ${
                  selectedPack === amount && !customAmount
                    ? 'border-ink bg-ink text-white shadow-xs dark:border-saffron dark:bg-saffron dark:text-black'
                    : 'border-ink/10 bg-mist-pure/80 text-ink hover:border-ink/20'
                }`}
              >
                <div className="font-mono text-sm font-bold">{amount}SP</div>
                <div className="text-[10px] opacity-70">SP{amount}</div>
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-ink block mb-1">Or custom amount (Min SP50)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-mono text-sm text-ink/50">SP</span>
              <input
                type="number"
                min="50"
                max="10000"
                placeholder="Enter custom amount..."
                value={customAmount}
                onChange={e => {
                  setCustomAmount(e.target.value);
                  setSelectedPack(0);
                }}
                className="w-full rounded-2xl border border-ink/15 bg-mist-pure pl-8 pr-4 py-2.5 text-xs text-ink placeholder:text-ink-muted/50 focus:border-lagoon focus:outline-none shadow-xs dark:bg-mist-subtle dark:border-white/15 dark:placeholder:text-ink-muted/40"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCheckout}
            disabled={isProcessing}
            className="w-full flex items-center justify-center gap-2 rounded-full bg-lagoon py-3 text-xs font-semibold text-white hover:bg-lagoon-dark shadow-md shadow-lagoon/20 hover:shadow-lg transition-all cursor-pointer"
          >
            <CreditCard className="h-4 w-4" />
            <span>
              {isProcessing
                ? 'Processing Razorpay Order...'
                : `Add ${customAmount ? customAmount : selectedPack} SP (SP${customAmount ? customAmount : selectedPack})`}
            </span>
          </button>
        </div>

        {/* Ledger Transaction Audit Trail */}
        <div className="mt-6 border-t border-ink/8 pt-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/60 font-mono flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5" />
              Double-Entry Ledger Audit Log
            </span>
            <div className="flex items-center gap-2">
              <a
                href="/api/wallet/statement"
                download="skillswap_statement.csv"
                className="text-[10px] font-mono font-semibold text-lagoon hover:underline flex items-center gap-1 cursor-pointer"
                title="Download CSV Statement (PRD FR-WAL-04)"
              >
                <span>Export CSV</span>
                <Download className="h-3 w-3" />
              </a>
              <span className="text-[10px] font-mono text-ink/30">|</span>
              <span className="text-[10px] font-mono text-ink/40">Verified Invariants</span>
            </div>
          </div>

          <div className="max-h-36 overflow-y-auto space-y-2 pr-1">
            {transactions.map(tx => (
              <div
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-xl border border-ink/6 bg-mist-pure/70 text-xs font-mono"
              >
                <div>
                  <div className="text-ink font-semibold">{tx.description}</div>
                  <div className="text-[10px] text-ink/40">{tx.timestamp} • {tx.id}</div>
                </div>
                <div className={`font-bold ${tx.type === 'PURCHASE' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-800 dark:text-saffron'}`}>
                  {tx.type === 'PURCHASE' ? '+' : '-'}{(tx.amountPaise / 100).toFixed(0)} SP
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
