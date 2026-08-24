import React, { useState } from 'react';
import { Prize } from '../types';
import { Gift, X, Copy, Check, Ticket, ExternalLink, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface VoucherWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  vouchers: Prize[];
  onPlayAgain: () => void;
}

export const VoucherWalletModal: React.FC<VoucherWalletModalProps> = ({
  isOpen,
  onClose,
  vouchers,
  onPlayAgain,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (code: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#111F3E] via-[#0C152B] to-[#080D1A] text-white shadow-2xl shadow-[#D4AF37]/20">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#D4AF37]/30 p-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#A81D24] text-[#F3E5AB]">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif-sc text-lg font-bold text-[#FFFDF0]">
                My CHAGEE Voucher Wallet
              </h3>
              <p className="text-xs text-[#CBD5E0]">
                {vouchers.length} active reward{vouchers.length === 1 ? '' : 's'} claimed
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

        {/* Voucher List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {vouchers.length === 0 ? (
            <div className="py-12 text-center">
              <Ticket className="mx-auto h-12 w-12 text-[#4A5568]" />
              <h4 className="mt-3 font-serif-sc text-base font-bold text-[#CBD5E0]">
                No Vouchers Claimed Yet
              </h4>
              <p className="mt-1 text-xs text-[#A0AEC0]">
                Spin the tea roulette and submit a 6-card recipe to win free drinks and discount coupons!
              </p>
              <button
                onClick={() => {
                  onClose();
                  onPlayAgain();
                }}
                className="mt-5 rounded-xl border border-[#D4AF37] bg-gradient-to-r from-[#D4AF37] to-[#C5A059] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0C152B]"
              >
                Play CHAGEE Tea Rush
              </button>
            </div>
          ) : (
            vouchers.map((v, idx) => (
              <div
                key={`${v.id}-${idx}`}
                className="relative overflow-hidden rounded-xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#17264A] via-[#101D38] to-[#0D172E] p-4 shadow-md"
              >
                {/* Left Seal Cutout */}
                <div className="pointer-events-none absolute -left-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#080D1A] border-r border-[#D4AF37]/40" />
                <div className="pointer-events-none absolute -right-2.5 top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-[#080D1A] border-l border-[#D4AF37]/40" />

                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded bg-[#A81D24] px-2 py-0.5 font-serif-sc text-[9px] font-bold tracking-wider text-[#FFFDF0]">
                      {v.badge}
                    </span>
                    <h4 className="mt-1 font-serif-sc text-sm sm:text-base font-bold text-[#F3E5AB]">
                      {v.chineseTitle}
                    </h4>
                    <p className="text-xs text-[#CBD5E0]">{v.title}</p>
                    <p className="mt-1 text-[10px] text-[#A0AEC0]">{v.terms}</p>
                  </div>
                </div>

                {/* Voucher Code Box */}
                <div className="mt-3 flex items-center justify-between border-t border-[#4A5568]/40 pt-2.5">
                  <div className="font-mono text-xs font-bold text-[#E5C158]">
                    {v.voucherCode}
                  </div>
                  <button
                    onClick={() => handleCopy(v.voucherCode, `${v.id}-${idx}`)}
                    className="flex items-center gap-1 rounded bg-[#1C2C54] px-2.5 py-1 text-[11px] font-bold text-[#F3E5AB] hover:bg-[#D4AF37] hover:text-[#0C152B]"
                  >
                    {copiedId === `${v.id}-${idx}` ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#D4AF37]/30 bg-[#0A1224] p-4 text-center">
          <p className="text-[10px] text-[#718096]">
            Present these voucher codes at CHAGEE outlets or enter into the checkout voucher bar.
          </p>
        </div>
      </div>
    </div>
  );
};
