import React from 'react';
import { X, Trophy, Sparkles, Ticket, Play, Layers, Send } from 'lucide-react';
import { PRIZES } from '../data/prizes';
import { SECRET_RECIPES } from '../data/chageeMenu';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#111F3E] via-[#0C152B] to-[#080D1A] text-white shadow-2xl shadow-[#D4AF37]/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/30 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#A81D24] text-[#F3E5AB]">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif-sc text-lg font-bold text-[#FFFDF0]">
                CHAGEE Tea Rush — Game Rules & Secret Recipes
              </h3>
              <p className="text-xs text-[#CBD5E0]">
                How to play, 9-point token redemption, and winning formula tips
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full border border-[#4A5568] bg-[#162347] p-1.5 text-[#A0AEC0] hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 4 Gamification Steps */}
          <div>
            <h4 className="font-serif-sc text-sm font-bold text-[#E5C158] uppercase tracking-wider">
              ✦ The 4-Step Gamification Flow
            </h4>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0E1A35] p-3.5">
                <div className="flex items-center gap-2 font-bold text-[#F3E5AB]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A81D24] text-xs text-white">1</span>
                  <span>Redeem Token with 9 Points</span>
                </div>
                <p className="mt-1.5 text-xs text-[#CBD5E0]">
                  Exchange 9 member points for 1 Game Token. Each token grants 1 spin of the tea card conveyor.
                </p>
              </div>

              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0E1A35] p-3.5">
                <div className="flex items-center gap-2 font-bold text-[#F3E5AB]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A81D24] text-xs text-white">2</span>
                  <span>Rapid Moving Tea Conveyor</span>
                </div>
                <p className="mt-1.5 text-xs text-[#CBD5E0]">
                  Watch the continuous line of CHAGEE signature teas moving at top speed from right to left.
                </p>
              </div>

              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0E1A35] p-3.5">
                <div className="flex items-center gap-2 font-bold text-[#F3E5AB]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A81D24] text-xs text-white">3</span>
                  <span>Tap STOP to Freeze 8 Cards</span>
                </div>
                <p className="mt-1.5 text-xs text-[#CBD5E0]">
                  Tap the button to decelerate the running conveyor. The single conveyor belt halts to freeze 8 cards directly in place.
                </p>
              </div>

              <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0E1A35] p-3.5">
                <div className="flex items-center gap-2 font-bold text-[#F3E5AB]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A81D24] text-xs text-white">4</span>
                  <span>Drag 4 Cards & Submit Blend</span>
                </div>
                <p className="mt-1.5 text-xs text-[#CBD5E0]">
                  Drag your preferred 4 tea cards into the recipe slots to formulate your signature combination and reveal your prize!
                </p>
              </div>
            </div>
          </div>

          {/* Secret Recipe Hints */}
          <div>
            <h4 className="font-serif-sc text-sm font-bold text-[#E5C158] uppercase tracking-wider">
              ✦ Secret Master Recipe Pairings
            </h4>
            <div className="mt-3 space-y-2.5">
              {SECRET_RECIPES.map((recipe) => (
                <div
                  key={recipe.id}
                  className="rounded-xl border border-[#D4AF37]/40 bg-[#16274D] p-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif-sc font-bold text-[#FFFDF0]">
                      {recipe.chineseName} — {recipe.name}
                    </span>
                    <span className="rounded bg-[#A81D24] px-2 py-0.5 text-[9px] font-bold text-[#F3E5AB]">
                      {recipe.rewardTier.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-[#CBD5E0]">{recipe.description}</p>
                  <p className="mt-1 text-[11px] font-semibold text-[#E5C158]">
                    💡 Hint: {recipe.hint}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Prize Payout Table */}
          <div>
            <h4 className="font-serif-sc text-sm font-bold text-[#E5C158] uppercase tracking-wider">
              ✦ Grand Prize Rewards Pool
            </h4>
            <div className="mt-3 space-y-2">
              {PRIZES.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-[#2D3748] bg-[#0E172E] p-2.5 text-xs"
                >
                  <div>
                    <span className="font-serif-sc font-bold text-[#F3E5AB]">
                      {p.chineseTitle}
                    </span>
                    <p className="text-[11px] text-[#CBD5E0]">{p.subtitle}</p>
                  </div>
                  <span className="rounded bg-[#1A284D] px-2 py-1 font-mono text-[10px] font-bold text-[#E5C158]">
                    {p.badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#D4AF37]/30 bg-[#0A1224] p-4 text-center">
          <button
            onClick={onClose}
            className="rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C5A059] px-8 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0C152B]"
          >
            I Understand, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
