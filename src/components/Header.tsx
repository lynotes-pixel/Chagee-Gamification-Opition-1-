import React from 'react';
import { UserProfile } from '../types';
import { Ticket, Coins, Volume2, VolumeX, HelpCircle, Gift, Award, PlusCircle } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  user: UserProfile;
  onOpenRedeemModal: () => void;
  onOpenWalletModal: () => void;
  onOpenRulesModal: () => void;
  onToggleSound: () => void;
  onQuickTopup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenRedeemModal,
  onOpenWalletModal,
  onOpenRulesModal,
  onToggleSound,
  onQuickTopup,
}) => {
  return (
    <header className="relative z-30 border-b border-[#C5A059]/30 bg-[#0A1124]/90 backdrop-blur-md px-4 py-3 sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        {/* Brand Logo & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-full border-2 border-[#D4AF37] bg-gradient-to-b from-[#A81D24] to-[#7B1117] shadow-lg shadow-[#A81D24]/20">
            <span className="font-serif-sc text-sm sm:text-base font-bold text-[#FFFDF0]">茶</span>
            <div className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[9px] font-bold text-[#0C152B]">
              姬
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-cinzel text-lg sm:text-xl font-bold tracking-widest text-[#E5C158]">
                CHAGEE
              </span>
              <span className="font-serif-sc text-sm font-semibold tracking-wider text-[#F3E5AB]">
                霸王茶姬
              </span>
            </div>
            <p className="hidden text-[10px] uppercase tracking-wider text-[#A0AEC0] sm:block">
              Tea Master Gamification Arena
            </p>
          </div>
        </div>

        {/* Member Status & Resources */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Member Points balance */}
          <div
            id="points-balance-widget"
            className="flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#111C38] px-3 py-1.5 shadow-inner"
            title="Current Member Points"
          >
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#D4AF37] text-[#0C152B]">
              <Coins className="h-3 w-3" />
            </div>
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase tracking-wider text-[#CBD5E0]">Points</span>
              <span className="text-xs sm:text-sm font-bold text-[#F3E5AB]">{user.points} <span className="text-[9px] text-[#A0AEC0]">pts</span></span>
            </div>
            <button
              onClick={onQuickTopup}
              className="ml-1 text-[#D4AF37] hover:text-[#FFF] transition-colors"
              title="Daily Check-in +15 pts"
            >
              <PlusCircle className="h-4 w-4" />
            </button>
          </div>

          {/* Gamification Tokens badge */}
          <button
            id="tokens-status-btn"
            onClick={onOpenRedeemModal}
            className={`group relative flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-300 ${
              user.tokens > 0
                ? 'border-[#D4AF37] bg-gradient-to-r from-[#A81D24] to-[#8C141B] text-[#FFFDF0] shadow-md shadow-[#A81D24]/30 animate-pulse'
                : 'border-[#4A5568] bg-[#1A233A] text-[#CBD5E0] hover:border-[#D4AF37]/70'
            }`}
          >
            <Ticket className={`h-4 w-4 ${user.tokens > 0 ? 'text-[#F3E5AB]' : 'text-[#A0AEC0]'}`} />
            <div className="flex flex-col text-left leading-none">
              <span className="text-[9px] uppercase tracking-wider opacity-80">Game Tokens</span>
              <span className="text-xs sm:text-sm font-bold">
                {user.tokens} <span className="text-[9px] font-normal opacity-90">{user.tokens === 1 ? 'Token' : 'Tokens'}</span>
              </span>
            </div>
            {user.tokens === 0 && (
              <span className="hidden sm:inline-block ml-1 rounded bg-[#D4AF37]/20 px-1.5 py-0.5 text-[9px] font-semibold text-[#F3E5AB]">
                9 pts
              </span>
            )}
          </button>

          {/* Wallet / Vouchers modal trigger */}
          <button
            id="voucher-wallet-btn"
            onClick={onOpenWalletModal}
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#111C38] text-[#D4AF37] transition hover:bg-[#D4AF37]/20 hover:text-[#FFFDF0]"
            title="My Reward Vouchers"
          >
            <Gift className="h-4 w-4" />
            {user.vouchers.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E53E3E] text-[9px] font-bold text-white shadow">
                {user.vouchers.length}
              </span>
            )}
          </button>

          {/* Rules modal button */}
          <button
            id="how-to-play-btn"
            onClick={onOpenRulesModal}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A5568] bg-[#111C38] text-[#CBD5E0] transition hover:border-[#D4AF37] hover:text-[#F3E5AB]"
            title="Rules & Prize Table"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* Sound toggle */}
          <button
            id="sound-toggle-btn"
            onClick={onToggleSound}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#4A5568] bg-[#111C38] text-[#CBD5E0] transition hover:border-[#D4AF37] hover:text-[#F3E5AB]"
            title={user.soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
          >
            {user.soundEnabled ? <Volume2 className="h-4 w-4 text-[#D4AF37]" /> : <VolumeX className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
