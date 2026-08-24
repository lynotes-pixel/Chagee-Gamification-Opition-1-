import React, { useEffect, useRef, useState } from 'react';
import { TeaCard, GamePhase } from '../types';
import { CHAGEE_MENU_CARDS } from '../data/chageeMenu';
import { TeaCupVisual } from './TeaCupVisual';
import { Play, Square, Sparkles, RefreshCw, Zap, Hand, Check, ArrowDown, MoveDown, Star } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CardRouletteConveyorProps {
  phase: GamePhase;
  rolledCards: TeaCard[];
  slots: (TeaCard | null)[];
  onStartSpin: () => void;
  onStopSpin: (rolledCards: TeaCard[]) => void;
  onToggleCard: (card: TeaCard) => void;
  onDragStartCard: (card: TeaCard, fromSlotIndex?: number) => void;
  onDragEndCard: () => void;
  hasTokens: boolean;
  onNeedToken: () => void;
}

export const CardRouletteConveyor: React.FC<CardRouletteConveyorProps> = ({
  phase,
  rolledCards,
  slots,
  onStartSpin,
  onStopSpin,
  onToggleCard,
  onDragStartCard,
  onDragEndCard,
  hasTokens,
  onNeedToken,
}) => {
  const [activeSpeed, setActiveSpeed] = useState<'idle' | 'hyperspeed' | 'stopping'>('idle');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const audioIntervalRef = useRef<any>(null);

  // Two columns of running vertical ribbons for top-down conveyor animation
  const column1Cards = [
    ...CHAGEE_MENU_CARDS.slice(0, 6),
    ...CHAGEE_MENU_CARDS.slice(0, 6),
    ...CHAGEE_MENU_CARDS.slice(0, 6),
  ];
  const column2Cards = [
    ...CHAGEE_MENU_CARDS.slice(6, 12),
    ...CHAGEE_MENU_CARDS.slice(6, 12),
    ...CHAGEE_MENU_CARDS.slice(6, 12),
  ];

  useEffect(() => {
    if (phase === 'spinning') {
      setActiveSpeed('hyperspeed');
      audioIntervalRef.current = setInterval(() => {
        sounds.playSpinTick();
      }, 90);
    } else if (phase === 'stopping') {
      setActiveSpeed('stopping');
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    } else {
      setActiveSpeed('idle');
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    }

    return () => {
      if (audioIntervalRef.current) {
        clearInterval(audioIntervalRef.current);
      }
    };
  }, [phase]);

  // Handle Play/Stop button tap
  const handleButtonClick = () => {
    if (phase === 'idle' || phase === 'selecting') {
      if (!hasTokens) {
        onNeedToken();
        return;
      }
      sounds.playCardSelect();
      onStartSpin();
    } else if (phase === 'spinning') {
      sounds.playStopSound();
      setActiveSpeed('stopping');

      // Randomly select 6 cards from the full menu (5 unique + 1 potential combo duplicate)
      const pool = [...CHAGEE_MENU_CARDS];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const primarySelection = pool.slice(0, 5);
      const extraCard = pool[Math.floor(Math.random() * pool.length)];

      // Form 6 drawn cards with unique IDs (ordered for 2 columns x 3 rows grid)
      const finalRolled = [...primarySelection, extraCard].map((c, index) => ({
        ...c,
        id: `${c.id}-rolled-${index}-${Date.now()}`,
      }));

      setTimeout(() => {
        onStopSpin(finalRolled);
      }, 1000);
    }
  };

  // Helper to check if a card is placed in any of the slots
  const getPlacedSlotNumber = (cardId: string): number | null => {
    const idx = slots.findIndex((c) => c?.id === cardId);
    return idx !== -1 ? idx + 1 : null;
  };

  const handleDragStart = (e: React.DragEvent, card: TeaCard) => {
    setDraggedCardId(card.id);
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id }));
    e.dataTransfer.effectAllowed = 'copyMove';
    onDragStartCard(card);
  };

  const handleDragEnd = () => {
    setDraggedCardId(null);
    onDragEndCard();
  };

  // When stopped in selecting phase, 6 cards in 2 cols x 3 rows
  const isFrozen = phase === 'selecting' && rolledCards.length === 6;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4AF37]/70 bg-gradient-to-b from-[#0F1C38] via-[#0A1226] to-[#080D1A] p-3.5 sm:p-5 shadow-2xl shadow-[#D4AF37]/15">
      {/* Corner Filigrees */}
      <div className="pointer-events-none absolute left-2 top-2 h-5 w-5 border-l-2 border-t-2 border-[#D4AF37]" />
      <div className="pointer-events-none absolute right-2 top-2 h-5 w-5 border-r-2 border-t-2 border-[#D4AF37]" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-5 w-5 border-b-2 border-l-2 border-[#D4AF37]" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-5 w-5 border-b-2 border-r-2 border-[#D4AF37]" />

      {/* Header Bar */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#A81D24] text-xs font-bold text-[#FFFDF0]">
            2
          </span>
          <div>
            <h2 className="font-serif-sc text-sm sm:text-base md:text-lg font-bold tracking-wide text-[#F3E5AB]">
              Top-Down Tea Conveyor (2 Columns × 3 Rows)
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[#A0AEC0]">
              {phase === 'spinning'
                ? 'Conveyors running top-to-bottom! Tap STOP to freeze 6 cards.'
                : phase === 'stopping'
                ? 'Decelerating top-down conveyors... Freezing 6 cards in place!'
                : phase === 'selecting'
                ? 'Conveyor frozen! Drag or tap cards from the 6 cards below into the 4 recipe slots.'
                : 'Conveyors cascade downward in 2 columns. Tap PLAY to start!'}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-1.5">
          {phase === 'spinning' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#E53E3E] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-white shadow-lg animate-pulse">
              <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> 2-Column Cascade (Running Down)
            </span>
          ) : phase === 'stopping' ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-[#0C152B]">
              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" /> Freezing 6 Cards...
            </span>
          ) : phase === 'selecting' ? (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37] bg-[#1A2E56] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-bold text-[#F3E5AB] shadow-md shadow-[#D4AF37]/20">
              <Hand className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#D4AF37]" /> 6 Cards Frozen (2 Cols × 3 Rows)
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full border border-[#D4AF37]/40 bg-[#162347] px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs text-[#CBD5E0]">
              <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#D4AF37]" /> Ready to Spin
            </span>
          )}
        </div>
      </div>

      {/* Conveyor Area: 2 Columns x 3 Rows, running top-to-bottom */}
      <div className="relative my-2 rounded-xl border border-[#D4AF37]/40 bg-[#070D1C] p-2.5 sm:p-3.5 shadow-inner">
        {/* Top and Bottom Fades for top-down conveyor window */}
        {!isFrozen && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-10 w-full bg-gradient-to-b from-[#070D1C] via-[#070D1C]/90 to-transparent" />
            <div className="pointer-events-none absolute bottom-0 left-0 z-10 h-10 w-full bg-gradient-to-t from-[#070D1C] via-[#070D1C]/90 to-transparent" />
          </>
        )}

        {isFrozen ? (
          /* FROZEN 6 CARDS IN 2 COLUMNS AND 3 ROWS (CLEAR VERTICAL CARD WITH TEXT AT BOTTOM OF CUP) */
          <div>
            <div className="mb-2.5 flex items-center justify-between px-1">
              <span className="font-serif-sc text-xs font-bold text-[#F3E5AB] flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                6 Frozen Tea Cards (2 Columns × 3 Rows)
              </span>
              <span className="text-[11px] text-[#CBD5E0] font-medium">
                Tap card or drag to recipe slots
              </span>
            </div>

            {/* 2 Columns x 3 Rows Grid - Text positioned clearly at bottom of cup image */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              {rolledCards.map((card, colIdx) => {
                const placedSlot = getPlacedSlotNumber(card.id);
                const isDraggingThis = draggedCardId === card.id;

                return (
                  <div
                    key={card.id}
                    id={`conveyor-card-${card.id}`}
                    draggable={true}
                    onDragStart={(e) => handleDragStart(e, card)}
                    onDragEnd={handleDragEnd}
                    onClick={() => {
                      sounds.playCardSelect();
                      onToggleCard(card);
                    }}
                    className={`group relative flex cursor-grab active:cursor-grabbing flex-col items-center justify-between rounded-xl border p-2.5 sm:p-3 text-center transition-all duration-200 select-none ${
                      isDraggingThis ? 'opacity-40 scale-95 border-dashed border-[#D4AF37]' : ''
                    } ${
                      placedSlot !== null
                        ? 'border-[#D4AF37] bg-gradient-to-b from-[#1E335E] via-[#142240] to-[#0A1224] shadow-md shadow-[#D4AF37]/30 ring-2 ring-[#D4AF37]'
                        : 'border-[#304168] bg-gradient-to-b from-[#152345] via-[#0E172E] to-[#080E1C] hover:border-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/20 hover:-translate-y-0.5'
                    }`}
                  >
                    {/* Top Row: Slot # Badge + Points Value */}
                    <div className="w-full flex items-center justify-between">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#070D1C] font-mono text-[10px] font-bold text-[#E5C158] border border-[#D4AF37]/40 shadow">
                        #{colIdx + 1}
                      </span>
                      <span className="flex items-center gap-0.5 rounded bg-[#070D1C]/80 px-2 py-0.5 font-mono text-[10px] font-bold text-[#E5C158] border border-[#D4AF37]/30 shadow-sm">
                        <Star className="h-2.5 w-2.5 text-[#D4AF37] fill-current" />
                        +{card.pointsValue}p
                      </span>
                    </div>

                    {/* Middle: Tea Cup Visual Image */}
                    <div className="my-1 flex items-center justify-center pointer-events-none scale-90 sm:scale-95">
                      <TeaCupVisual card={card} size="sm" compact />
                    </div>

                    {/* Bottom: Text placed cleanly at the bottom of the cup image */}
                    <div className="w-full rounded-lg bg-[#070D1C]/90 p-2 border border-[#D4AF37]/20 pointer-events-none mt-1">
                      {/* Chinese Name - Large, High Contrast, Crystal Clear */}
                      <p className="font-serif-sc text-sm sm:text-base font-bold text-[#FFFDF0] tracking-wide line-clamp-1">
                        {card.chineseName}
                      </p>

                      {/* English Name - Crisp, Highly Legible */}
                      <p className="text-xs sm:text-[13px] font-medium text-[#E2E8F0] line-clamp-1 mt-0.5">
                        {card.name}
                      </p>

                      {/* Aroma / Tea Base Tag */}
                      <div className="mt-1 flex items-center justify-center gap-1">
                        <span className="rounded bg-[#1A2E56] px-1.5 py-0.5 text-[10px] font-semibold text-[#F3E5AB] truncate max-w-full">
                          {card.teaBase}
                        </span>
                      </div>
                    </div>

                    {/* Card Footer Action / Status Indicator */}
                    <div className="w-full mt-2">
                      {placedSlot !== null ? (
                        <div className="flex w-full items-center justify-center gap-1 rounded-md bg-[#A81D24] py-1 text-[11px] font-bold text-white shadow">
                          <Check className="h-3 w-3 stroke-[3]" />
                          <span>In Recipe Slot #{placedSlot}</span>
                        </div>
                      ) : (
                        <div className="flex w-full items-center justify-center gap-1 rounded-md border border-[#D4AF37]/50 bg-[#0F1C38] py-1 text-[10px] sm:text-[11px] font-semibold text-[#F3E5AB] group-hover:bg-[#D4AF37] group-hover:text-[#0C152B] transition-colors">
                          <MoveDown className="h-3 w-3" />
                          <span>Tap / Drag to Place</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* RUNNING 2 COLUMNS OF CONVEYORS MOVING TOP-TO-BOTTOM (3 VISIBLE ROWS TALL) */
          <div>
            <div className="mb-2 flex items-center justify-between px-1 text-[11px] text-[#A0AEC0]">
              <span className="flex items-center gap-1 text-[#D4AF37] font-semibold">
                <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Cascade Track 1
              </span>
              <span className="font-mono text-[10px] text-[#CBD5E0] bg-[#142347] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                3 Visible Rows
              </span>
              <span className="flex items-center gap-1 text-[#D4AF37] font-semibold">
                <ArrowDown className="h-3.5 w-3.5 animate-bounce" /> Cascade Track 2
              </span>
            </div>

            {/* 2-Column Vertical Overflow Window displaying 3 visible rows (~330px tall) */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 h-[330px] sm:h-[350px] overflow-hidden rounded-xl bg-[#050A14] p-2 border border-[#1A284D]">
              {/* Column 1 Vertical Conveyor Track */}
              <div className="overflow-hidden relative h-full rounded-lg border border-[#D4AF37]/20 bg-[#080E1C]/90 p-1">
                <div
                  className={`flex flex-col gap-2.5 ${
                    activeSpeed === 'hyperspeed'
                      ? 'animate-vertical-conveyor-fast'
                      : activeSpeed === 'stopping'
                      ? 'transition-transform duration-1000 ease-out'
                      : 'animate-vertical-conveyor'
                  }`}
                >
                  {column1Cards.map((card, idx) => (
                    <div
                      key={`col1-${card.id}-${idx}`}
                      className="flex h-[155px] shrink-0 flex-col items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#162547] via-[#0F1B35] to-[#0A1224] p-2 text-center shadow-md"
                    >
                      {/* Top Bar */}
                      <div className="w-full flex items-center justify-between text-[10px]">
                        <span className="rounded bg-[#A81D24] px-1.5 py-0.5 font-serif-sc font-bold text-[#FFFDF0]">
                          CHAGEE
                        </span>
                        <span className="font-mono font-bold text-[#E5C158]">
                          +{card.pointsValue}p
                        </span>
                      </div>

                      {/* Middle: Cup Image */}
                      <div className="scale-85 -my-1">
                        <TeaCupVisual card={card} size="sm" compact />
                      </div>

                      {/* Bottom: Text below cup image */}
                      <div className="w-full rounded-md bg-[#070D1C]/90 p-1.5 border border-[#D4AF37]/20">
                        <p className="truncate font-serif-sc text-xs sm:text-sm font-bold text-[#FFFDF0]">
                          {card.chineseName}
                        </p>
                        <p className="truncate text-[10px] sm:text-xs font-medium text-[#E2E8F0]">
                          {card.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2 Vertical Conveyor Track */}
              <div className="overflow-hidden relative h-full rounded-lg border border-[#D4AF37]/20 bg-[#080E1C]/90 p-1">
                <div
                  className={`flex flex-col gap-2.5 ${
                    activeSpeed === 'hyperspeed'
                      ? 'animate-vertical-conveyor-alt-fast'
                      : activeSpeed === 'stopping'
                      ? 'transition-transform duration-1000 ease-out'
                      : 'animate-vertical-conveyor-alt'
                  }`}
                >
                  {column2Cards.map((card, idx) => (
                    <div
                      key={`col2-${card.id}-${idx}`}
                      className="flex h-[155px] shrink-0 flex-col items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#162547] via-[#0F1B35] to-[#0A1224] p-2 text-center shadow-md"
                    >
                      {/* Top Bar */}
                      <div className="w-full flex items-center justify-between text-[10px]">
                        <span className="rounded bg-[#A81D24] px-1.5 py-0.5 font-serif-sc font-bold text-[#FFFDF0]">
                          CHAGEE
                        </span>
                        <span className="font-mono font-bold text-[#E5C158]">
                          +{card.pointsValue}p
                        </span>
                      </div>

                      {/* Middle: Cup Image */}
                      <div className="scale-85 -my-1">
                        <TeaCupVisual card={card} size="sm" compact />
                      </div>

                      {/* Bottom: Text below cup image */}
                      <div className="w-full rounded-md bg-[#070D1C]/90 p-1.5 border border-[#D4AF37]/20">
                        <p className="truncate font-serif-sc text-xs sm:text-sm font-bold text-[#FFFDF0]">
                          {card.chineseName}
                        </p>
                        <p className="truncate text-[10px] sm:text-xs font-medium text-[#E2E8F0]">
                          {card.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Control Button Bar */}
      <div className="mt-3.5 flex flex-col items-center justify-center">
        {phase === 'spinning' ? (
          <button
            id="stop-spinning-btn"
            onClick={handleButtonClick}
            className="group relative flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#F3E5AB] bg-gradient-to-r from-[#A81D24] via-[#E53E3E] to-[#8C141B] px-8 py-3 sm:px-12 sm:py-3.5 text-base sm:text-lg font-bold tracking-wider text-white shadow-2xl shadow-[#E53E3E]/60 transition-all duration-200 hover:scale-105 active:scale-95 glow-gold"
          >
            <Square className="h-5 w-5 fill-current text-white animate-pulse" />
            <span className="font-cinzel tracking-widest">STOP CONVEYOR!</span>
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase">
              Freeze 6 Cards (2×3)
            </span>
          </button>
        ) : phase === 'stopping' ? (
          <button
            disabled
            className="flex items-center justify-center gap-2.5 rounded-2xl border border-[#D4AF37]/50 bg-[#1A2544] px-7 py-3 text-sm font-bold text-[#F3E5AB]"
          >
            <RefreshCw className="h-4 w-4 animate-spin text-[#D4AF37]" />
            <span>Freezing 6 Cards (2 Cols × 3 Rows)...</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="start-play-btn"
              onClick={handleButtonClick}
              className={`group relative flex items-center justify-center gap-2.5 rounded-2xl border-2 px-7 py-3 sm:px-10 sm:py-3.5 text-sm sm:text-base font-bold tracking-widest transition-all duration-300 ${
                hasTokens
                  ? 'border-[#FFFDF0] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-[#0C152B] shadow-xl shadow-[#D4AF37]/40 hover:scale-105 active:scale-95 glow-gold'
                  : 'border-[#D4AF37]/50 bg-gradient-to-r from-[#A81D24] to-[#7B1117] text-[#FFFDF0] shadow-lg hover:scale-105'
              }`}
            >
              <Play className="h-4 w-4 sm:h-5 sm:w-5 fill-current" />
              <span className="font-cinzel">
                {phase === 'selecting' ? 'SPIN AGAIN (1 TOKEN)' : 'START SPEED RUN (PLAY)'}
              </span>
              <span className="rounded-full bg-[#0C152B]/30 px-2 py-0.5 text-xs font-mono font-bold">
                1 Token
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
