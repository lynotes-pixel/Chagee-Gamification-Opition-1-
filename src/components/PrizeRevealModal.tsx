import React, { useEffect, useState } from 'react';
import { CombinationResult, UserProfile } from '../types';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/audio';
import { Trophy, Gift, Sparkles, Copy, Check, ArrowRight, RotateCcw, Award, ShieldCheck, Ticket } from 'lucide-react';

interface PrizeRevealModalProps {
  isOpen: boolean;
  result: CombinationResult | null;
  user: UserProfile;
  onClose: () => void;
  onSaveToWallet: () => void;
  onPlayAgain: () => void;
  onRedeemMore: () => void;
}

export const PrizeRevealModal: React.FC<PrizeRevealModalProps> = ({
  isOpen,
  result,
  user,
  onClose,
  onSaveToWallet,
  onPlayAgain,
  onRedeemMore,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && result) {
      sounds.playWin();

      // Launch vibrant confetti fireworks
      try {
        const count = 200;
        const defaults = {
          origin: { y: 0.7 },
          colors: ['#D4AF37', '#E5C158', '#A81D24', '#FFFFFF', '#F6AD55'],
        };

        const fire = (particleRatio: number, opts: confetti.Options) => {
          confetti({
            ...defaults,
            ...opts,
            particleCount: Math.floor(count * particleRatio),
          });
        };

        fire(0.25, { spread: 26, startVelocity: 55 });
        fire(0.2, { spread: 60 });
        fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
        fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
        fire(0.1, { spread: 120, startVelocity: 45 });
      } catch {
        // Fallback
      }
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const { prize, comboName, synergyTags, synergyScore, matchTier, matchedRule } = result;

  const handleCopyCode = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(prize.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveWalletClick = () => {
    sounds.playCardSelect();
    setIsSaved(true);
    onSaveToWallet();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border-3 border-[#D4AF37] bg-gradient-to-b from-[#16274D] via-[#0D162B] to-[#070C18] p-6 text-center text-white shadow-2xl shadow-[#D4AF37]/30">
        {/* Oriental Gold Frame & Corners */}
        <div className="pointer-events-none absolute left-3 top-3 h-8 w-8 border-l-2 border-t-2 border-[#D4AF37]" />
        <div className="pointer-events-none absolute right-3 top-3 h-8 w-8 border-r-2 border-t-2 border-[#D4AF37]" />
        <div className="pointer-events-none absolute bottom-3 left-3 h-8 w-8 border-b-2 border-l-2 border-[#D4AF37]" />
        <div className="pointer-events-none absolute bottom-3 right-3 h-8 w-8 border-b-2 border-r-2 border-[#D4AF37]" />

        {/* Celebration Header */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#E5C158] bg-gradient-to-b from-[#A81D24] to-[#7B1117] shadow-xl shadow-[#A81D24]/50">
          <Trophy className="h-8 w-8 text-[#F3E5AB] animate-bounce" />
        </div>

        {/* Chinese Seal Stamp */}
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="animate-stamp inline-block rounded-md border border-[#F3E5AB] bg-[#A81D24] px-3 py-1 font-serif-sc text-xs font-bold tracking-widest text-[#FFFDF0] shadow-lg">
            {prize.badge}
          </span>
        </div>

        <h3 className="mt-2 font-serif-sc text-2xl sm:text-3xl font-black tracking-wide text-[#FFFDF0]">
          {prize.chineseTitle}
        </h3>
        <p className="font-cinzel text-sm sm:text-base font-bold text-[#E5C158]">
          {prize.title}
        </p>

        {/* Combination Recipe Breakdown */}
        <div className="mt-4 rounded-xl border border-[#D4AF37]/40 bg-[#0E1B38] p-3.5 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="font-serif-sc font-bold text-[#F3E5AB]">
              {comboName}
            </span>
            <span className="font-mono text-xs font-bold text-[#68D391]">
              Synergy: {synergyScore} pts
            </span>
          </div>

          <p className="mt-1 text-[11px] text-[#CBD5E0]">
            {matchedRule}
          </p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {synergyTags.map((tag, i) => (
              <span
                key={i}
                className="rounded bg-[#1A2D57] px-2 py-0.5 text-[9px] font-semibold text-[#E5C158]"
              >
                ✦ {tag}
              </span>
            ))}
          </div>
        </div>

        {/* The Voucher Box */}
        <div className="mt-4 rounded-2xl border-2 border-dashed border-[#D4AF37] bg-gradient-to-r from-[#1E1116] via-[#2A1820] to-[#1E1116] p-4">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <span className="text-[10px] uppercase tracking-wider text-[#FEB2B2]">
                VOUCHER CODE
              </span>
              <p className="font-mono text-base sm:text-lg font-extrabold tracking-wider text-[#F3E5AB]">
                {prize.voucherCode}
              </p>
            </div>
            <button
              id="copy-prize-code-btn"
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#162347] px-3 py-1.5 text-xs font-bold text-[#F3E5AB] transition hover:bg-[#D4AF37] hover:text-[#0C152B]"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[#4A5568]/40 pt-2 text-[10px] text-[#A0AEC0]">
            <span>{prize.validUntil}</span>
            <span>Applicable on CHAGEE App & In-Store</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex flex-col gap-2.5">
          <button
            id="save-to-rewards-wallet-btn"
            onClick={handleSaveWalletClick}
            disabled={isSaved}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold tracking-wider uppercase transition-all duration-300 ${
              isSaved
                ? 'bg-emerald-800/80 text-emerald-100 border border-emerald-500'
                : 'border-2 border-[#FFFDF0] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-[#0C152B] shadow-lg shadow-[#D4AF37]/40 hover:scale-[1.02]'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="h-5 w-5 text-emerald-300" />
                <span>Saved in Rewards Wallet!</span>
              </>
            ) : (
              <>
                <Gift className="h-5 w-5 text-[#0C152B]" />
                <span>Save to CHAGEE Rewards Wallet</span>
              </>
            )}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              id="play-again-btn"
              onClick={onPlayAgain}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/50 bg-[#16264A] py-2.5 text-xs font-bold text-[#F3E5AB] transition hover:bg-[#1E3363] hover:text-white"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{user.tokens > 0 ? 'Play Next Round' : 'Play Again (9 pts)'}</span>
            </button>

            <button
              onClick={onClose}
              className="rounded-xl border border-[#4A5568] bg-[#0E172E] py-2.5 text-xs font-medium text-[#CBD5E0] transition hover:border-[#D4AF37] hover:text-white"
            >
              Close Ceremony
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
