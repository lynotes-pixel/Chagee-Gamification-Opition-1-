import React, { useEffect, useRef, useState } from 'react';
import { TeaCard, GamePhase } from '../types';
import { CHAGEE_MENU_CARDS } from '../data/chageeMenu';
import { TeaCupVisual } from './TeaCupVisual';
import { Play, Square, Sparkles, RefreshCw, Zap, MoveDown, Hand, GripHorizontal } from 'lucide-react';
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

  // Single-row conveyor ribbon for running animation
  const conveyorRibbon = [
    ...CHAGEE_MENU_CARDS,
    ...CHAGEE_MENU_CARDS,
    ...CHAGEE_MENU_CARDS,
    ...CHAGEE_MENU_CARDS,
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

      // Randomly select 8 cards from the full menu (guaranteed variety with combo potential)
      const pool = [...CHAGEE_MENU_CARDS];
      for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      // Pick 7 unique + 1 duplicate favorite for combo potential (total 8 cards)
      const primarySelection = pool.slice(0, 7);
      const extraCard = pool[Math.floor(Math.random() * pool.length)];

      // Form 8 drawn cards with unique IDs for selecting
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

  // When stopped in selecting phase, 8 cards in 1 row
  const isFrozen = phase === 'selecting' && rolledCards.length === 8;

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-[#D4AF37]/70 bg-gradient-to-b from-[#0F1C38] via-[#0A1226] to-[#080D1A] p-4 sm:p-6 shadow-2xl shadow-[#D4AF37]/15">
      {/* Corner Filigrees */}
      <div className="pointer-events-none absolute left-2 top-2 h-6 w-6 border-l-2 border-t-2 border-[#D4AF37]" />
      <div className="pointer-events-none absolute right-2 top-2 h-6 w-6 border-r-2 border-t-2 border-[#D4AF37]" />
      <div className="pointer-events-none absolute bottom-2 left-2 h-6 w-6 border-b-2 border-l-2 border-[#D4AF37]" />
      <div className="pointer-events-none absolute bottom-2 right-2 h-6 w-6 border-b-2 border-r-2 border-[#D4AF37]" />

      {/* Header Bar */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-[#D4AF37]/20 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A81D24] text-xs font-bold text-[#FFFDF0]">
            2
          </span>
          <div>
            <h2 className="font-serif-sc text-base sm:text-lg font-bold tracking-wide text-[#F3E5AB]">
              Single-Row Tea Roulette Conveyor
            </h2>
            <p className="text-[11px] text-[#A0AEC0]">
              {phase === 'spinning'
                ? 'Cards are racing right to left! Tap STOP to freeze 8 cards on the conveyor.'
                : phase === 'stopping'
                ? 'Decelerating conveyor... Freezing 8 tea cards in 1 row!'
                : phase === 'selecting'
                ? 'Conveyor frozen! Drag & drop cards from the 8-card conveyor row into your recipe slots.'
                : 'Watch the continuous conveyor stream and tap PLAY to begin the speed run.'}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          {phase === 'spinning' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E53E3E] px-3 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
              <Zap className="h-3.5 w-3.5" /> High-Speed Rush (1 Row)
            </span>
          ) : phase === 'stopping' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37] px-3 py-1 text-xs font-bold text-[#0C152B]">
              <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Freezing Cards...
            </span>
          ) : phase === 'selecting' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37] bg-[#1A2E56] px-3 py-1 text-xs font-bold text-[#F3E5AB] shadow-md shadow-[#D4AF37]/20">
              <Hand className="h-3.5 w-3.5 text-[#D4AF37]" /> 8 Cards Frozen • Drag to Place
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D4AF37]/40 bg-[#162347] px-3 py-1 text-xs text-[#CBD5E0]">
              <Sparkles className="h-3.5 w-3.5 text-[#D4AF37]" /> Ready to Spin
            </span>
          )}
        </div>
      </div>

      {/* Conveyor Area: 1-Row Layout */}
      <div className="relative my-2 rounded-xl border border-[#D4AF37]/40 bg-[#070D1C] p-3 sm:p-4 shadow-inner">
        {/* Left & Right Edge Fade Shadows for Continuous Feel when spinning/idle */}
        {!isFrozen && (
          <>
            <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-14 bg-gradient-to-r from-[#070D1C] via-[#070D1C]/80 to-transparent" />
            <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-14 bg-gradient-to-l from-[#070D1C] via-[#070D1C]/80 to-transparent" />
          </>
        )}

        {isFrozen ? (
          /* FROZEN 8 CARDS ON THE CONVEYOR IN 1 SINGLE ROW */
          <div>
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="font-serif-sc text-xs font-semibold text-[#D4AF37]/90 flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                Conveyor Tier (Cards 1–8)
              </span>
              <span className="text-[10px] text-[#A0AEC0] flex items-center gap-1">
                <GripHorizontal className="h-3.5 w-3.5 text-[#D4AF37]" /> Drag card or tap to place into slot
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
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
                    className={`group relative flex cursor-grab active:cursor-grabbing flex-col items-center justify-between rounded-xl border p-2 text-center transition-all duration-200 select-none min-h-[175px] ${
                      isDraggingThis ? 'opacity-40 scale-95 border-dashed border-[#D4AF37]' : ''
                    } ${
                      placedSlot !== null
                        ? 'border-[#D4AF37] bg-gradient-to-b from-[#1C2F59] to-[#0F1B36] shadow-md shadow-[#D4AF37]/25 ring-1 ring-[#D4AF37]'
                        : 'border-[#2D3C60] bg-gradient-to-b from-[#13203F] via-[#0D162C] to-[#090F1E] hover:-translate-y-1 hover:border-[#D4AF37] hover:shadow-lg hover:shadow-[#D4AF37]/20'
                    }`}
                  >
                    {/* Top Bar with Number & Points */}
                    <div className="w-full flex items-center justify-between text-[9px] mb-1">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#0C152B] font-mono text-[9px] font-bold text-[#A0AEC0]">
                        #{colIdx + 1}
                      </span>
                      <span className="font-mono font-bold text-[#E5C158]">
                        +{card.pointsValue}p
                      </span>
                    </div>

                    {/* Tea Visual */}
                    <div className="my-0.5 pointer-events-none scale-85">
                      <TeaCupVisual card={card} size="sm" compact />
                    </div>

                    {/* Names & Aroma */}
                    <div className="w-full pointer-events-none mt-1">
                      <p className="truncate font-serif-sc text-xs font-bold text-[#FFFDF0]">
                        {card.chineseName}
                      </p>
                      <p className="truncate text-[9px] text-[#CBD5E0]">
                        {card.name}
                      </p>
                    </div>

                    {/* Status / Drag prompt badge */}
                    <div className="mt-1.5 w-full">
                      {placedSlot !== null ? (
                        <div className="flex items-center justify-center gap-1 rounded bg-[#A81D24] px-1 py-0.5 text-[9px] font-bold text-[#FFFDF0]">
                          <span>In Slot #{placedSlot}</span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1 rounded border border-[#D4AF37]/30 bg-[#0A1224] px-1 py-0.5 text-[9px] text-[#D4AF37] group-hover:border-[#D4AF37] group-hover:bg-[#D4AF37]/20">
                          <MoveDown className="h-2.5 w-2.5" />
                          <span>Drag to Slot</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* RUNNING 1 SINGLE CONVEYOR ROW */
          <div className="overflow-hidden py-1">
            <div
              className={`flex w-max gap-3 transition-all ${
                activeSpeed === 'hyperspeed'
                  ? 'animate-fast-marquee-blur'
                  : activeSpeed === 'stopping'
                  ? 'transition-transform duration-1000 ease-out'
                  : 'animate-fast-marquee'
              }`}
              style={{
                animationDuration: activeSpeed === 'hyperspeed' ? '2.2s' : activeSpeed === 'stopping' ? '5s' : '8.5s',
              }}
            >
              {conveyorRibbon.map((card, idx) => (
                <div
                  key={`ribbon-${card.id}-${idx}`}
                  className="flex h-[155px] w-[135px] sm:w-[150px] shrink-0 flex-col items-center justify-between rounded-xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#162547] via-[#0F1B35] to-[#0A1224] p-2.5 text-center shadow-md"
                >
                  <div className="w-full flex items-center justify-between text-[9px]">
                    <span className="rounded bg-[#A81D24] px-1.5 py-0.5 font-serif-sc font-bold text-[#FFFDF0]">
                      {card.chineseName.slice(0, 2)}
                    </span>
                    <span className="font-mono font-bold text-[#E5C158]">
                      +{card.pointsValue}p
                    </span>
                  </div>

                  <div className="scale-80 -my-0.5">
                    <TeaCupVisual card={card} size="sm" compact />
                  </div>

                  <div className="w-full">
                    <p className="truncate font-serif-sc text-xs font-bold text-[#FFFDF0]">
                      {card.chineseName}
                    </p>
                    <p className="truncate text-[9px] text-[#CBD5E0]">
                      {card.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Big Action Control Button Bar */}
      <div className="mt-4 flex flex-col items-center justify-center">
        {phase === 'spinning' ? (
          <button
            id="stop-spinning-btn"
            onClick={handleButtonClick}
            className="group relative flex items-center justify-center gap-3 rounded-2xl border-3 border-[#F3E5AB] bg-gradient-to-r from-[#A81D24] via-[#E53E3E] to-[#8C141B] px-8 py-3.5 sm:px-12 sm:py-4 text-lg sm:text-xl font-bold tracking-wider text-white shadow-2xl shadow-[#E53E3E]/60 transition-all duration-200 hover:scale-105 active:scale-95 glow-gold"
          >
            <Square className="h-6 w-6 fill-current text-white animate-pulse" />
            <span className="font-cinzel tracking-widest">STOP CARDS!</span>
            <span className="rounded bg-white/20 px-2 py-0.5 text-xs font-semibold uppercase">
              Freeze 8 Cards
            </span>
          </button>
        ) : phase === 'stopping' ? (
          <button
            disabled
            className="flex items-center justify-center gap-3 rounded-2xl border border-[#D4AF37]/50 bg-[#1A2544] px-8 py-3.5 text-base font-bold text-[#F3E5AB]"
          >
            <RefreshCw className="h-5 w-5 animate-spin text-[#D4AF37]" />
            <span>Freezing 8 Cards on Conveyor...</span>
          </button>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              id="start-play-btn"
              onClick={handleButtonClick}
              className={`group relative flex items-center justify-center gap-3 rounded-2xl border-2 px-8 py-3.5 sm:px-10 sm:py-4 text-base sm:text-lg font-bold tracking-widest transition-all duration-300 ${
                hasTokens
                  ? 'border-[#FFFDF0] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-[#0C152B] shadow-xl shadow-[#D4AF37]/40 hover:scale-105 active:scale-95 glow-gold'
                  : 'border-[#D4AF37]/50 bg-gradient-to-r from-[#A81D24] to-[#7B1117] text-[#FFFDF0] shadow-lg hover:scale-105'
              }`}
            >
              <Play className="h-5 w-5 fill-current" />
              <span className="font-cinzel">
                {phase === 'selecting' ? 'SPIN AGAIN (1 TOKEN)' : 'START SPEED RUN (PLAY)'}
              </span>
              <span className="rounded-full bg-[#0C152B]/30 px-2.5 py-0.5 text-xs font-mono font-bold">
                1 Token
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
