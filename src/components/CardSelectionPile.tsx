import React, { useState } from 'react';
import { TeaCard } from '../types';
import { TeaCupVisual } from './TeaCupVisual';
import { Wand2, RotateCcw, Send, Flame, AlertCircle, Info, ArrowDownCircle, Move } from 'lucide-react';
import { sounds } from '../utils/audio';

interface CardSelectionPileProps {
  slots: (TeaCard | null)[];
  onDropOnSlot: (slotIndex: number, card: TeaCard, fromSlotIndex?: number) => void;
  onRemoveSlot: (slotIndex: number) => void;
  onAutoSelectBest: () => void;
  onClearSelection: () => void;
  onSubmitCombination: () => void;
  onOpenRules: () => void;
  draggingCard: TeaCard | null;
}

export const CardSelectionPile: React.FC<CardSelectionPileProps> = ({
  slots,
  onDropOnSlot,
  onRemoveSlot,
  onAutoSelectBest,
  onClearSelection,
  onSubmitCombination,
  onOpenRules,
  draggingCard,
}) => {
  const [dragOverSlotIndex, setDragOverSlotIndex] = useState<number | null>(null);
  const [internalDraggedSlot, setInternalDraggedSlot] = useState<number | null>(null);

  const selectedCards = slots.filter((c): c is TeaCard => c !== null);
  const isComplete = selectedCards.length === 4;

  // Real-time synergy tags
  const jasmineCount = selectedCards.filter(
    (c) => c.name.includes('Jasmine') || c.chineseName.includes('茉莉') || c.chineseName.includes('伯牙')
  ).length;
  const oolongCount = selectedCards.filter(
    (c) =>
      c.teaBase.includes('Oolong') ||
      c.chineseName.includes('乌龙') ||
      c.chineseName.includes('铁观音') ||
      c.chineseName.includes('观音') ||
      c.chineseName.includes('山茶')
  ).length;
  const snowCapCount = selectedCards.filter(
    (c) => c.category === 'snow_cap_specialty' || c.chineseName.includes('桃桃') || c.chineseName.includes('雪山')
  ).length;
  const totalPoints = selectedCards.reduce((acc, c) => acc + c.pointsValue, 0);

  const handleDragOver = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverSlotIndex !== slotIdx) {
      setDragOverSlotIndex(slotIdx);
    }
  };

  const handleDragLeave = (e: React.DragEvent, slotIdx: number) => {
    e.preventDefault();
    if (dragOverSlotIndex === slotIdx) {
      setDragOverSlotIndex(null);
    }
  };

  const handleDrop = (slotIdx: number, e: React.DragEvent) => {
    e.preventDefault();
    setDragOverSlotIndex(null);

    try {
      const dataStr = e.dataTransfer.getData('text/plain');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (internalDraggedSlot !== null) {
        // Dragged from one slot to another
        const cardToMove = slots[internalDraggedSlot];
        if (cardToMove) {
          sounds.playCardSelect();
          onDropOnSlot(slotIdx, cardToMove, internalDraggedSlot);
        }
        setInternalDraggedSlot(null);
        return;
      }

      if (draggingCard) {
        sounds.playCardSelect();
        onDropOnSlot(slotIdx, draggingCard);
      }
    } catch {
      if (draggingCard) {
        sounds.playCardSelect();
        onDropOnSlot(slotIdx, draggingCard);
      }
    }
  };

  const handleSlotCardDragStart = (e: React.DragEvent, slotIdx: number, card: TeaCard) => {
    setInternalDraggedSlot(slotIdx);
    e.dataTransfer.setData('text/plain', JSON.stringify({ cardId: card.id, fromSlot: slotIdx }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleSlotCardDragEnd = () => {
    setInternalDraggedSlot(null);
    setDragOverSlotIndex(null);
  };

  return (
    <div className="mt-4 space-y-4">
      {/* 4 Combination Slots Recipe Tray */}
      <div className="rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#142347] via-[#0C152B] to-[#080E1C] p-4 sm:p-6 shadow-2xl shadow-[#D4AF37]/20">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#D4AF37]/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#A81D24] text-xs font-bold text-[#FFFDF0]">
              3
            </span>
            <div>
              <h3 className="font-serif-sc text-base sm:text-lg font-bold text-[#F3E5AB]">
                4-Card Combination Slots
              </h3>
              <p className="text-xs text-[#CBD5E0]">
                Drag cards from the 8-card conveyor into the 4 slots below (or tap any card on conveyor).
              </p>
            </div>
          </div>

          {/* Quick Helper Tools */}
          <div className="flex items-center gap-2">
            <button
              id="auto-optimize-recipe-btn"
              onClick={() => {
                sounds.playCardSelect();
                onAutoSelectBest();
              }}
              className="flex items-center gap-1.5 rounded-lg border border-[#D4AF37]/50 bg-[#1A284D] px-3 py-1.5 text-xs font-semibold text-[#F3E5AB] transition hover:bg-[#D4AF37]/20 hover:text-white"
            >
              <Wand2 className="h-3.5 w-3.5 text-[#D4AF37]" />
              <span>Auto-Pick Synergy (4)</span>
            </button>

            {selectedCards.length > 0 && (
              <button
                id="clear-recipe-btn"
                onClick={() => {
                  sounds.playCardSelect();
                  onClearSelection();
                }}
                className="flex items-center gap-1 rounded-lg border border-[#4A5568] bg-[#111A33] px-2.5 py-1.5 text-xs text-[#A0AEC0] transition hover:border-[#E53E3E] hover:text-[#FEB2B2]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={onOpenRules}
              className="text-[#CBD5E0] hover:text-[#D4AF37]"
              title="Winning Combinations Guide"
            >
              <Info className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* The 4 Drop Target Slots */}
        <div className="my-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2, 3].map((slotIdx) => {
            const card = slots[slotIdx];
            const isTarget = dragOverSlotIndex === slotIdx;

            return (
              <div
                key={slotIdx}
                id={`combi-slot-${slotIdx + 1}`}
                onDragOver={(e) => handleDragOver(e, slotIdx)}
                onDragLeave={(e) => handleDragLeave(e, slotIdx)}
                onDrop={(e) => handleDrop(slotIdx, e)}
                className={`relative flex min-h-[175px] flex-col items-center justify-between rounded-xl border p-3 text-center transition-all duration-200 ${
                  isTarget
                    ? 'border-2 border-[#FFFDF0] bg-[#1D3261] shadow-xl shadow-[#D4AF37]/50 scale-105 ring-2 ring-[#D4AF37]'
                    : card
                    ? 'border-[#D4AF37] bg-gradient-to-b from-[#1C2F59] via-[#121F3C] to-[#0A1326] shadow-md shadow-[#D4AF37]/25 ring-1 ring-[#D4AF37]/50'
                    : 'border-2 border-dashed border-[#3E4C6D] bg-[#0A1224]/80 hover:border-[#D4AF37]/60'
                }`}
              >
                {/* Slot Number badge */}
                <div className="absolute left-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#070D1C] text-[10px] font-bold text-[#E5C158] border border-[#D4AF37]/40 shadow">
                  #{slotIdx + 1}
                </div>

                {card ? (
                  <div
                    draggable={true}
                    onDragStart={(e) => handleSlotCardDragStart(e, slotIdx, card)}
                    onDragEnd={handleSlotCardDragEnd}
                    className="flex h-full w-full cursor-grab active:cursor-grabbing flex-col items-center justify-between select-none"
                  >
                    {/* Remove '×' Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        sounds.playCardSelect();
                        onRemoveSlot(slotIdx);
                      }}
                      className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#A81D24] text-xs font-bold text-white hover:scale-110 shadow"
                      title="Remove from slot"
                    >
                      ×
                    </button>

                    <div className="mt-4 pointer-events-none scale-90">
                      <TeaCupVisual card={card} size="sm" compact />
                    </div>

                    <div className="w-full pointer-events-none mt-1">
                      <p className="truncate font-serif-sc text-sm font-bold text-[#F3E5AB]">
                        {card.chineseName}
                      </p>
                      <p className="truncate text-[10px] text-[#CBD5E0]">
                        {card.name}
                      </p>
                    </div>

                    <div className="mt-2 flex w-full items-center justify-between border-t border-[#D4AF37]/20 pt-1.5 text-[9px] text-[#A0AEC0]">
                      <span className="flex items-center gap-0.5">
                        <Move className="h-2.5 w-2.5 text-[#D4AF37]" /> Drag to swap
                      </span>
                      <span className="font-mono font-bold text-[#E5C158]">
                        +{card.pointsValue}p
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center py-6 text-[#718096] pointer-events-none">
                    <ArrowDownCircle className={`h-7 w-7 transition-transform ${isTarget ? 'text-[#D4AF37] scale-125 animate-bounce' : 'opacity-40'}`} />
                    <span className="mt-2 text-[11px] uppercase font-bold tracking-wider text-[#A0AEC0]">
                      {isTarget ? 'Drop Card Here' : `Slot ${slotIdx + 1}`}
                    </span>
                    <span className="text-[9px] text-[#718096]">Drag card here</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Real-time synergy feedback */}
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#0A1224] p-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#CBD5E0]">
              Combination: <span className="font-bold text-[#E5C158]">{selectedCards.length}/4 Slots Filled</span>
            </span>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#A0AEC0]">
              {jasmineCount > 0 && (
                <span className="rounded bg-[#A81D24]/40 px-2 py-0.5 text-[#F3E5AB]">
                  {jasmineCount}x Jasmine
                </span>
              )}
              {oolongCount > 0 && (
                <span className="rounded bg-[#2B4136] px-2 py-0.5 text-[#C6F6D5]">
                  {oolongCount}x Oolong Base
                </span>
              )}
              {snowCapCount > 0 && (
                <span className="rounded bg-[#4C1D95]/40 px-2 py-0.5 text-[#E9D8FD]">
                  {snowCapCount}x Snow Cap
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 font-mono text-xs font-bold text-[#E5C158]">
              <Flame className="h-3.5 w-3.5 text-[#E53E3E]" />
              <span>{totalPoints} Points</span>
            </div>
          </div>
        </div>

        {/* Big Submit Button */}
        <div className="mt-4">
          <button
            id="submit-combination-btn"
            disabled={!isComplete}
            onClick={onSubmitCombination}
            className={`group relative flex w-full items-center justify-center gap-3 rounded-xl py-4 font-bold tracking-widest uppercase transition-all duration-300 ${
              isComplete
                ? 'border-2 border-[#FFFDF0] bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#C5A059] text-[#0C152B] shadow-xl shadow-[#D4AF37]/50 hover:scale-[1.01] active:scale-[0.99] glow-gold cursor-pointer'
                : 'cursor-not-allowed border border-[#4A5568] bg-[#1A2544] text-[#718096]'
            }`}
          >
            {isComplete ? (
              <>
                <Send className="h-5 w-5 fill-current text-[#0C152B]" />
                <span className="font-cinzel text-base tracking-wider">
                  MIX & BREW 4-CARD COMBINATION
                </span>
                <span className="rounded-full bg-[#0C152B]/20 px-2.5 py-0.5 text-xs font-mono font-bold">
                  Claim Reward
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-[#718096]" />
                <span>Fill {4 - selectedCards.length} More Slot{4 - selectedCards.length === 1 ? '' : 's'} to Submit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
