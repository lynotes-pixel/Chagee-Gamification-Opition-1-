import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Ticket, Coins, Check, X, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { sounds } from '../utils/audio';

interface TokenRedeemModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onRedeem: (tokenAmount: number) => void;
  onQuickTopup: () => void;
}

export const TokenRedeemModal: React.FC<TokenRedeemModalProps> = ({
  isOpen,
  onClose,
  user,
  onRedeem,
  onQuickTopup,
}) => {
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1);
  const [isSuccessAnim, setIsSuccessAnim] = useState<boolean>(false);

  if (!isOpen) return null;

  const costPerToken = 9;
  const totalCost = selectedQuantity * costPerToken;
  const canAfford = user.points >= totalCost;

  const handleConfirmRedeem = () => {
    if (!canAfford) return;
    sounds.playRedeem();
    setIsSuccessAnim(true);
    setTimeout(() => {
      onRedeem(selectedQuantity);
      setIsSuccessAnim(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#111F3E] via-[#0C152B] to-[#080D1A] p-6 text-white shadow-2xl shadow-[#D4AF37]/20">
        {/* Background Oriental filigree motif */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full border border-[#D4AF37]/15 opacity-30" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-40 w-40 rounded-full border border-[#D4AF37]/15 opacity-30" />

        {/* Close button */}
        <button
          id="close-redeem-modal-btn"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-[#4A5568] bg-[#1A2544] p-1.5 text-[#A0AEC0] transition hover:border-[#D4AF37] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header Title */}
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-gradient-to-b from-[#A81D24] to-[#7B1117] shadow-lg shadow-[#A81D24]/40">
            <Ticket className="h-7 w-7 text-[#F3E5AB]" />
          </div>
          <span className="inline-block rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 py-0.5 text-[10px] font-semibold tracking-widest text-[#E5C158] uppercase">
            CHAGEE Tea Rush
          </span>
          <h3 className="mt-1 font-serif-sc text-xl font-bold text-[#FFFDF0]">
            Redeem Gamification Token
          </h3>
          <p className="mt-1 text-xs text-[#CBD5E0]">
            Exchange <span className="font-bold text-[#E5C158]">9 member points</span> for 1 Game Token to spin the tea cards!
          </p>
        </div>

        {/* Current Balance Display */}
        <div className="mt-5 rounded-xl border border-[#D4AF37]/30 bg-[#142247]/80 p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#A0AEC0]">Your Available Points:</span>
            <div className="flex items-center gap-1 font-bold text-[#E5C158]">
              <Coins className="h-4 w-4" />
              <span>{user.points} pts</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-[#A0AEC0]">Current Game Tokens:</span>
            <div className="flex items-center gap-1 font-bold text-[#FFFDF0]">
              <Ticket className="h-4 w-4 text-[#E53E3E]" />
              <span>{user.tokens} available</span>
            </div>
          </div>
        </div>

        {/* Token Quantity Selector */}
        <div className="mt-5">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#A0AEC0]">
            Select Token Package:
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 3, 5].map((qty) => {
              const cost = qty * 9;
              const isSelected = selectedQuantity === qty;
              return (
                <button
                  key={qty}
                  type="button"
                  id={`select-token-qty-${qty}`}
                  onClick={() => setSelectedQuantity(qty)}
                  className={`flex flex-col items-center justify-center rounded-xl border p-3 transition-all ${
                    isSelected
                      ? 'border-[#D4AF37] bg-gradient-to-b from-[#A81D24]/80 to-[#701217]/90 text-white shadow-md shadow-[#A81D24]/40 ring-1 ring-[#D4AF37]'
                      : 'border-[#2D3748] bg-[#111A33] text-[#CBD5E0] hover:border-[#D4AF37]/50 hover:bg-[#162347]'
                  }`}
                >
                  <span className="text-base font-bold">{qty} {qty === 1 ? 'Token' : 'Tokens'}</span>
                  <div className="mt-1 flex items-center gap-1 text-xs font-semibold text-[#E5C158]">
                    <Coins className="h-3 w-3" />
                    <span>{cost} pts</span>
                  </div>
                  {qty === 3 && (
                    <span className="mt-1 rounded bg-[#D4AF37] px-1.5 py-0.2 text-[8px] font-bold text-[#0C152B] uppercase">
                      Popular
                    </span>
                  )}
                  {qty === 5 && (
                    <span className="mt-1 rounded bg-[#E53E3E] px-1.5 py-0.2 text-[8px] font-bold text-white uppercase">
                      Best Value
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Breakdown of cost */}
        <div className="mt-5 flex items-center justify-between rounded-lg bg-[#080E1D] px-4 py-2.5 text-xs">
          <span className="text-[#A0AEC0]">Total Cost ({selectedQuantity} × 9 pts):</span>
          <span className="font-mono text-sm font-bold text-[#E5C158]">
            {totalCost} Points
          </span>
        </div>

        {/* Warning if not enough points */}
        {!canAfford && (
          <div className="mt-3 flex items-center justify-between rounded-lg border border-[#E53E3E]/40 bg-[#E53E3E]/10 p-2.5 text-xs text-[#FEB2B2]">
            <div className="flex items-center gap-1.5">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#FC8181]" />
              <span>Need {totalCost - user.points} more points</span>
            </div>
            <button
              onClick={onQuickTopup}
              className="font-bold underline hover:text-white"
            >
              +15 Free Points
            </button>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6 flex flex-col gap-2">
          <button
            id="confirm-redeem-token-btn"
            disabled={!canAfford || isSuccessAnim}
            onClick={handleConfirmRedeem}
            className={`group relative flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-bold tracking-wider uppercase transition-all duration-300 ${
              canAfford && !isSuccessAnim
                ? 'border-2 border-[#E5C158] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-[#0C152B] shadow-lg shadow-[#D4AF37]/30 hover:scale-[1.02] active:scale-[0.98]'
                : 'cursor-not-allowed border border-gray-600 bg-gray-800 text-gray-400'
            }`}
          >
            {isSuccessAnim ? (
              <>
                <Check className="h-5 w-5 text-emerald-700 animate-bounce" />
                <span className="text-emerald-950 font-bold">Redeemed Successfully!</span>
              </>
            ) : (
              <>
                <Ticket className="h-5 w-5" />
                <span>Confirm Redemption ({totalCost} pts)</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>

          <button
            onClick={onClose}
            className="text-center text-xs text-[#A0AEC0] hover:text-white"
          >
            Cancel and Return
          </button>
        </div>

        {/* Security / CHAGEE Guarantee */}
        <div className="mt-4 flex items-center justify-center gap-1 text-[10px] text-[#718096]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#D4AF37]" />
          <span>CHAGEE Member Guarantee • Tokens never expire</span>
        </div>
      </div>
    </div>
  );
};
