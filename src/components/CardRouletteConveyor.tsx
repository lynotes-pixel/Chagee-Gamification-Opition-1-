import React, { useEffect, useRef, useState } from 'react';
import { TeaCard, GamePhase } from '../types';
import { CHAGEE_MENU_CARDS } from '../data/chageeMenu';
import { TeaCupVisual } from './TeaCupVisual';
import { Play, Square, Sparkles, RefreshCw, Zap, MoveDown, Hand, GripHorizontal, Check, ArrowDown } from 'lucide-react';
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
              Top-Down Tea Roulette Conveyor (2 Cols × 3 Rows)
            </h2>
            <p className="text-[10px] sm:text-[11px] text-[#A0AEC0]">
              {phase === 'spinning'
                ? 'Conveyors running top-to-bottom! Tap STOP to freeze 6 cards in 2 columns & 3 rows.'
                : phase === 'stopping'
                ? 'Decelerating top-down conveyors... Freezing 6 cards in place!'
                : phase === 'selecting'
                ? 'Conveyor frozen! Drag & drop cards from the 6 cards below into your recipe slots.'
                : 'Conveyors cascade downward in 2 columns. Tap PLAY to start spinning!'}
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
          /* FROZEN 6 CARDS IN 2 COLUMNS AND 3 ROWS */
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-serif-sc text-xs font-semibold text-[#D4AF37]/90 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                Frozen Cards (2 Columns × 3 Rows)
              </span>
              <span className="text-[10px] text-[#A0AEC0] flex items-center gap-1">
                <GripHorizontal className="h-3 w-3 text-[#D4AF37]" /> Drag or tap card to place
              </span>
            </div>

            {/* Exact 2 Columns x 3 Rows Grid */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
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
                    className={`group relative flex cursor-grab active:cursor-grabbing items-center justify-between rounded-xl border p-2 sm:p-2.5 text-left transition-all duration-200 select-none min-h-[90px] sm:min-h-[98px] ${
                      isDraggingThis ? 'opacity-40 scale-95 border-dashed border-[#D4AF37]' : ''
                    } ${
                      placedSlot !== null
                        ? 'border-[#D4AF37] bg-gradient-to-r from-[#1C2F59] to-[#0F1B36] shadow-md shadow-[#D4AF37]/25 ring-1 ring-[#D4AF37]'
                        : 'border-[#2D3C60] bg-gradient-to-r from-[#13203F] via-[#0D162C] to-[#090F1E] hover:border-[#D4AF37] hover:shadow-md hover:shadow-[#D4AF37]/20'
                    }`}
                  >
                    {/* Left: Slot index + Tea Visual */}
                    <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 pointer-events-none">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#0C152B] font-mono text-[9px] font-bold text-[#A0AEC0] border border-[#D4AF37]/30">
                        #{colIdx + 1}
                      </span>
                      <div className="scale-75 -my-2 -mx-1 shrink-0">
                        <TeaCupVisual card={card} size="sm" compact />
                      </div>
                    </div>

                    {/* Middle: Details */}
                    <div className="min-w-0 flex-1 px-1.5 pointer-events-none">
                      <div className="flex items-center gap-1">
                        <p className="truncate font-serif-sc text-xs sm:text-sm font-bold text-[#FFFDF0]">
                          {card.chineseName}
                        </p>
                      </div>
                      <p className="truncate text-[9px] sm:text-[10px] text-[#CBD5E0]">
                        {card.name}
                      </p>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-[9px] font-bold text-[#E5C158]">
                          +{card.pointsValue}p
                        </span>
                        <span className="text-[8px] text-[#A0AEC0] truncate">
                          {card.topNotes.split('•')[0]}
                        </span>
                      </div>
                    </div>

                    {/* Right: Status badge or drag prompt */}
                    <div className="shrink-0 pl-1">
                      {placedSlot !== null ? (
                        <div className="flex items-center gap-0.5 rounded-full bg-[#A81D24] px-1.5 py-0.5 text-[9px] font-bold text-[#FFFDF0] shadow">
                          <Check className="h-2.5 w-2.5 stroke-[3]" />
                          <span>#{placedSlot}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-0.5 rounded border border-[#D4AF37]/40 bg-[#0A1224] px-1.5 py-0.5 text-[9px] text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/20">
                          <MoveDown className="h-2.5 w-2.5" />
                          <span className="hidden xs:inline text-[8px]">Place</span>
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
            <div className="mb-1.5 flex items-center justify-between px-1 text-[10px] text-[#A0AEC0]">
              <span className="flex items-center gap-1 text-[#D4AF37]">
                <ArrowDown className="h-3 w-3 animate-bounce" /> Cascade Column A
              </span>
              <span className="font-mono text-[9px] text-[#CBD5E0]">3 Visible Rows</span>
              <span className="flex items-center gap-1 text-[#D4AF37]">
                <ArrowDown className="h-3 w-3 animate-bounce" /> Cascade Column B
              </span>
            </div>

            {/* 2-Column Vertical Overflow Window displaying 3 visible rows (~280px tall) */}
            <div className="grid grid-cols-2 gap-2 sm:gap-2.5 h-[280px] sm:h-[300px] overflow-hidden rounded-lg bg-[#050A14] p-1.5 border border-[#1A284D]">
              {/* Column 1 Vertical Conveyor */}
              <div className="overflow-hidden relative h-full rounded-md border border-[#D4AF37]/20 bg-[#080E1C]/80">
                <div
                  className={`flex flex-col gap-2 ${
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
                      className="flex h-[88px] shrink-0 items-center justify-between rounded-lg border border-[#D4AF37]/30 bg-gradient-to-r from-[#162547] via-[#0F1B35] to-[#0A1224] p-2 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="scale-75 -my-2 -mx-1">
                          <TeaCupVisual card={card} size="sm" compact />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 px-1">
                        <p className="truncate font-serif-sc text-xs font-bold text-[#FFFDF0]">
                          {card.chineseName}
                        </p>
                        <p className="truncate text-[8px] text-[#CBD5E0]">
                          {card.name}
                        </p>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-[#E5C158] shrink-0">
                        +{card.pointsValue}p
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2 Vertical Conveyor */}
              <div className="overflow-hidden relative h-full rounded-md border border-[#D4AF37]/20 bg-[#080E1C]/80">
                <div
                  className={`flex flex-col gap-2 ${
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
                      className="flex h-[88px] shrink-0 items-center justify-between rounded-lg border border-[#D4AF37]/30 bg-gradient-to-r from-[#162547] via-[#0F1B35] to-[#0A1224] p-2 shadow-sm"
                    >
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className="scale-75 -my-2 -mx-1">
                          <TeaCupVisual card={card} size="sm" compact />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 px-1">
                        <p className="truncate font-serif-sc text-xs font-bold text-[#FFFDF0]">
                          {card.chineseName}
                        </p>
                        <p className="truncate text-[8px] text-[#CBD5E0]">
                          {card.name}
                        </p>
                      </div>
                      <span className="font-mono text-[9px] font-bold text-[#E5C158] shrink-0">
                        +{card.pointsValue}p
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Control Button Bar */}
      <div className="mt-3 flex flex-col items-center justify-center">
        {phase === 'spinning' ? (
          <button
            id="stop-spinning-btn"
            onClick={handleButtonClick}
            className="group relative flex items-center justify-center gap-2.5 rounded-2xl border-2 border-[#F3E5AB] bg-gradient-to-r from-[#A81D24] via-[#E53E3E] to-[#8C141B] px-8 py-3 sm:px-12 sm:py-3.5 text-base sm:text-lg font-bold tracking-wider text-white shadow-2xl shadow-[#E53E3E]/60 transition-all duration-200 hover:scale-105 active:scale-95 glow-gold"
          >
            <Square className="h-5 w-5 fill-current text-white animate-pulse" />
            <span className="font-cinzel tracking-widest">STOP CONVEYOR!</span>
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase">
              Freeze 2×3 Grid
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
