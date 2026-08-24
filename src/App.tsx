import React, { useState } from 'react';
import { UserProfile, GamePhase, TeaCard, CombinationResult, Prize } from './types';
import { CHAGEE_MENU_CARDS } from './data/chageeMenu';
import { evaluateCombination, PRIZES } from './data/prizes';
import { Header } from './components/Header';
import { TokenRedeemModal } from './components/TokenRedeemModal';
import { CardRouletteConveyor } from './components/CardRouletteConveyor';
import { CardSelectionPile } from './components/CardSelectionPile';
import { PrizeRevealModal } from './components/PrizeRevealModal';
import { VoucherWalletModal } from './components/VoucherWalletModal';
import { RulesModal } from './components/RulesModal';
import { sounds } from './utils/audio';
import { 
  Ticket, 
  Coins, 
  Sparkles, 
  Flame, 
  Award, 
  Play, 
  CheckCircle2, 
  HelpCircle, 
  Gift, 
  Zap, 
  RotateCcw,
  Plus
} from 'lucide-react';

export default function App() {
  // User Profile with 45 points initial balance (good for multiple 9-point token redemptions)
  const [user, setUser] = useState<UserProfile>({
    points: 45,
    tokens: 1, // Start with 1 token ready, with 45 points to redeem more
    vouchers: [],
    gameHistoryCount: 0,
    totalWins: 0,
    soundEnabled: true,
  });

  // Game Engine State
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [rolledCards, setRolledCards] = useState<TeaCard[]>([]);
  const [slots, setSlots] = useState<(TeaCard | null)[]>([null, null, null, null]);
  const [draggingCard, setDraggingCard] = useState<TeaCard | null>(null);
  const [result, setResult] = useState<CombinationResult | null>(null);

  // Modals
  const [isRedeemOpen, setIsRedeemOpen] = useState<boolean>(false);
  const [isWalletOpen, setIsWalletOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Toggle audio
  const handleToggleSound = () => {
    const nextVal = !user.soundEnabled;
    setUser((prev) => ({ ...prev, soundEnabled: nextVal }));
    sounds.setMuted(!nextVal);
    showToast(nextVal ? 'Sound Effects Enabled 🔔' : 'Sound Effects Muted 🔇');
  };

  // (1) Redeem Gamification Token with 9 Points
  const handleRedeemToken = (tokenAmount: number) => {
    const cost = tokenAmount * 9;
    if (user.points < cost) {
      showToast('Insufficient points! Please top up.');
      return;
    }

    setUser((prev) => ({
      ...prev,
      points: prev.points - cost,
      tokens: prev.tokens + tokenAmount,
    }));

    showToast(`Redeemed ${tokenAmount} Token${tokenAmount > 1 ? 's' : ''} with ${cost} points!`);
  };

  // Quick top-up points bonus
  const handleQuickTopup = () => {
    sounds.playCardSelect();
    setUser((prev) => ({
      ...prev,
      points: prev.points + 15,
    }));
    showToast('Daily Tea Master Check-in: +15 Points Credited! 🍵');
  };

  // (2 & 3) Start Spinning Conveyor
  const handleStartSpin = () => {
    if (user.tokens <= 0) {
      setIsRedeemOpen(true);
      return;
    }

    // Deduct 1 token
    setUser((prev) => ({
      ...prev,
      tokens: Math.max(0, prev.tokens - 1),
    }));

    setSlots([null, null, null, null]);
    setRolledCards([]);
    setResult(null);
    setPhase('spinning');
  };

  // (3) Stop Spinning Conveyor & Freeze 6 Rolled Cards on Conveyor (2x3 grid)
  const handleStopSpin = (cards: TeaCard[]) => {
    setRolledCards(cards);
    setSlots([null, null, null, null]);
    setPhase('selecting');
    showToast('6 Cards Frozen on Conveyor! Drag cards into the 4 combination slots.');
  };

  // Toggle selection of a card (e.g. on click)
  const handleToggleCard = (card: TeaCard) => {
    setSlots((prev) => {
      const existingIdx = prev.findIndex((c) => c?.id === card.id);
      if (existingIdx !== -1) {
        // Remove from slot
        const next = [...prev];
        next[existingIdx] = null;
        return next;
      }

      // Find first empty slot
      const firstEmptyIdx = prev.findIndex((c) => c === null);
      if (firstEmptyIdx === -1) {
        showToast('All 4 recipe slots are full! Drag to swap or tap a slot to remove.');
        return prev;
      }

      const next = [...prev];
      next[firstEmptyIdx] = card;
      return next;
    });
  };

  // Handle Dragging card onto a specific slot index
  const handleDropOnSlot = (slotIndex: number, card: TeaCard, fromSlotIndex?: number) => {
    setSlots((prev) => {
      const next = [...prev];

      if (fromSlotIndex !== undefined && fromSlotIndex !== null) {
        // Swap or move within slots
        const targetExisting = next[slotIndex];
        next[slotIndex] = card;
        next[fromSlotIndex] = targetExisting;
        return next;
      }

      // If card was already in another slot, clear that previous slot
      const oldSlotIdx = next.findIndex((c) => c?.id === card.id);
      if (oldSlotIdx !== -1 && oldSlotIdx !== slotIndex) {
        next[oldSlotIdx] = null;
      }

      next[slotIndex] = card;
      return next;
    });
  };

  const handleRemoveSlot = (slotIndex: number) => {
    setSlots((prev) => {
      const next = [...prev];
      next[slotIndex] = null;
      return next;
    });
  };

  const handleDragStartCard = (card: TeaCard) => {
    setDraggingCard(card);
  };

  const handleDragEndCard = () => {
    setDraggingCard(null);
  };

  // Auto-pick highest synergy 4 cards
  const handleAutoSelectBest = () => {
    if (rolledCards.length === 0) return;

    // Prioritize Jasmine, Legendary, and high points
    const sorted = [...rolledCards].sort((a, b) => {
      const isAJasmine = a.name.includes('Jasmine') ? 200 : 0;
      const isBJasmine = b.name.includes('Jasmine') ? 200 : 0;
      const isALegend = a.rarity === 'legendary' ? 100 : a.rarity === 'epic' ? 50 : 0;
      const isBLegend = b.rarity === 'legendary' ? 100 : b.rarity === 'epic' ? 50 : 0;
      return isBJasmine + isBLegend + b.pointsValue - (isAJasmine + isALegend + a.pointsValue);
    });

    const best4 = sorted.slice(0, 4);
    setSlots([
      best4[0] || null,
      best4[1] || null,
      best4[2] || null,
      best4[3] || null,
    ]);
    showToast('Auto-selected highest synergy 4-card tea combination!');
  };

  const handleClearSelection = () => {
    setSlots([null, null, null, null]);
  };

  // (4) Submit the 4-card Combination
  const handleSubmitCombination = () => {
    const selectedCards = slots.filter((c): c is TeaCard => c !== null);
    if (selectedCards.length !== 4) {
      showToast('Please place exactly 4 cards into all combination slots before submitting!');
      return;
    }

    setPhase('submitting');
    sounds.playCardSelect();

    setTimeout(() => {
      const evaluation = evaluateCombination(selectedCards);
      const evalResult: CombinationResult = {
        prize: evaluation.prize,
        comboName: evaluation.comboName,
        synergyTags: evaluation.synergyTags,
        synergyScore: evaluation.synergyScore,
        matchTier: evaluation.matchTier,
        matchedRule: evaluation.matchedRule,
        cardCount: 4,
      };

      setResult(evalResult);
      setPhase('result');
      setUser((prev) => ({
        ...prev,
        gameHistoryCount: prev.gameHistoryCount + 1,
        totalWins: prev.totalWins + 1,
      }));
    }, 700);
  };

  // Save prize to user's wallet
  const handleSaveToWallet = () => {
    if (!result) return;
    setUser((prev) => {
      const exists = prev.vouchers.some((v) => v.id === result.prize.id && v.voucherCode === result.prize.voucherCode);
      if (exists) return prev;
      return {
        ...prev,
        vouchers: [result.prize, ...prev.vouchers],
      };
    });
    showToast('Saved to your CHAGEE Voucher Wallet! 🎉');
  };

  // Play Again flow
  const handlePlayAgain = () => {
    setResult(null);
    setSlots([null, null, null, null]);
    setRolledCards([]);
    if (user.tokens > 0) {
      setPhase('spinning');
      setUser((prev) => ({ ...prev, tokens: prev.tokens - 1 }));
    } else {
      setPhase('idle');
      setIsRedeemOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1124] text-[#F9F6F0] antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[#D4AF37] bg-[#0E1B38]/95 px-5 py-2.5 text-xs font-semibold text-[#F3E5AB] shadow-2xl shadow-[#D4AF37]/30 backdrop-blur-md transition-all animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Header Bar */}
      <Header
        user={user}
        onOpenRedeemModal={() => setIsRedeemOpen(true)}
        onOpenWalletModal={() => setIsWalletOpen(true)}
        onOpenRulesModal={() => setIsRulesOpen(true)}
        onToggleSound={handleToggleSound}
        onQuickTopup={handleQuickTopup}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        {/* Step 1 Quick Redemption Banner */}
        <div className="relative overflow-hidden rounded-2xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#17274E] via-[#101A33] to-[#0A1224] p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#D4AF37] bg-[#A81D24] text-[#F3E5AB] shadow-md">
                <Ticket className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-[#A81D24] px-2 py-0.5 font-serif-sc text-[10px] font-bold text-[#FFFDF0]">
                    STEP 1
                  </span>
                  <h3 className="font-serif-sc text-sm sm:text-base font-bold text-[#F3E5AB]">
                    Redeem Game Tokens for 9 Points
                  </h3>
                </div>
                <p className="mt-0.5 text-xs text-[#CBD5E0]">
                  Your Balance: <span className="font-bold text-[#E5C158]">{user.points} pts</span> • You have <span className="font-bold text-white">{user.tokens} Token{user.tokens === 1 ? '' : 's'}</span> ready.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                id="quick-redeem-9pts-btn"
                onClick={() => setIsRedeemOpen(true)}
                className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl border border-[#FFFDF0] bg-gradient-to-r from-[#D4AF37] to-[#C5A059] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#0C152B] shadow-md hover:scale-105 active:scale-95 transition-all"
              >
                <Coins className="h-4 w-4" />
                <span>Redeem (9 pts)</span>
              </button>

              <button
                id="quick-free-points-btn"
                onClick={handleQuickTopup}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-[#D4AF37]/40 bg-[#162447] px-3.5 py-2.5 text-xs font-semibold text-[#F3E5AB] hover:bg-[#1C2E5C] transition-all"
                title="Claim free daily check-in points"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>+15 pts</span>
              </button>
            </div>
          </div>
        </div>

        {/* Step 2 & 3: High-Speed Card Roulette Conveyor with Frozen 6 Cards (2x3 grid) */}
        <CardRouletteConveyor
          phase={phase}
          rolledCards={rolledCards}
          slots={slots}
          onStartSpin={handleStartSpin}
          onStopSpin={handleStopSpin}
          onToggleCard={handleToggleCard}
          onDragStartCard={handleDragStartCard}
          onDragEndCard={handleDragEndCard}
          hasTokens={user.tokens > 0}
          onNeedToken={() => setIsRedeemOpen(true)}
        />

        {/* Step 4: 4-Card Combination Slots & Recipe Submission */}
        {phase === 'selecting' && rolledCards.length > 0 && (
          <CardSelectionPile
            slots={slots}
            onDropOnSlot={handleDropOnSlot}
            onRemoveSlot={handleRemoveSlot}
            onAutoSelectBest={handleAutoSelectBest}
            onClearSelection={handleClearSelection}
            onSubmitCombination={handleSubmitCombination}
            onOpenRules={() => setIsRulesOpen(true)}
            draggingCard={draggingCard}
          />
        )}

        {/* Submitting Loading Indicator */}
        {phase === 'submitting' && (
          <div className="rounded-2xl border border-[#D4AF37] bg-[#111E3D] p-12 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#A81D24] text-[#D4AF37] animate-spin">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="mt-4 font-serif-sc text-xl font-bold text-[#F3E5AB]">
              Brewing Imperial 4-Card Combination...
            </h3>
            <p className="mt-1 text-xs text-[#CBD5E0]">
              Evaluating flavor notes, jasmine aromas, and rock tea depth for prize tier...
            </p>
          </div>
        )}

        {/* Informational Quick Cards Section */}
        {phase === 'idle' && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0F1B38] p-4">
              <div className="flex items-center gap-2 font-serif-sc text-sm font-bold text-[#F3E5AB]">
                <Flame className="h-4 w-4 text-[#A81D24]" />
                <span>Signature Boya Juexian</span>
              </div>
              <p className="mt-1 text-xs text-[#CBD5E0]">
                Match Jasmine Green Milk Tea cards with Oolong teas to unlock Grand Royal 1-for-1 vouchers!
              </p>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0F1B38] p-4">
              <div className="flex items-center gap-2 font-serif-sc text-sm font-bold text-[#F3E5AB]">
                <Award className="h-4 w-4 text-[#D4AF37]" />
                <span>100% Win Guarantee</span>
              </div>
              <p className="mt-1 text-xs text-[#CBD5E0]">
                Every 6-card submission earns a valid prize voucher: free drinks, 50% off coupons, or bonus points.
              </p>
            </div>

            <div className="rounded-xl border border-[#D4AF37]/30 bg-[#0F1B38] p-4">
              <div className="flex items-center gap-2 font-serif-sc text-sm font-bold text-[#F3E5AB]">
                <Gift className="h-4 w-4 text-[#68D391]" />
                <span>Instant Voucher Wallet</span>
              </div>
              <p className="mt-1 text-xs text-[#CBD5E0]">
                Redeemed prizes are saved directly into your CHAGEE voucher wallet for instant ordering.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t border-[#D4AF37]/20 bg-[#070D1C] py-6 text-center text-xs text-[#718096]">
        <div className="mx-auto flex max-w-6xl flex-col sm:flex-row items-center justify-between gap-3 px-4">
          <div className="flex items-center gap-2">
            <span className="font-cinzel font-bold text-[#E5C158]">CHAGEE</span>
            <span className="font-serif-sc text-[#F3E5AB]">霸王茶姬</span>
            <span>• Modern Oriental Tea Master</span>
          </div>
          <p className="text-[11px]">
            9 Points per Token • 6-Card Recipe Combinations • Grand Royal Rewards
          </p>
        </div>
      </footer>

      {/* Modals */}
      <TokenRedeemModal
        isOpen={isRedeemOpen}
        onClose={() => setIsRedeemOpen(false)}
        user={user}
        onRedeem={handleRedeemToken}
        onQuickTopup={handleQuickTopup}
      />

      <PrizeRevealModal
        isOpen={phase === 'result' && result !== null}
        result={result}
        user={user}
        onClose={() => setPhase('idle')}
        onSaveToWallet={handleSaveToWallet}
        onPlayAgain={handlePlayAgain}
        onRedeemMore={() => {
          setPhase('idle');
          setIsRedeemOpen(true);
        }}
      />

      <VoucherWalletModal
        isOpen={isWalletOpen}
        onClose={() => setIsWalletOpen(false)}
        vouchers={user.vouchers}
        onPlayAgain={() => {
          setIsWalletOpen(false);
          handleStartSpin();
        }}
      />

      <RulesModal
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
}
