import React from 'react';
import { TeaCard } from '../types';

interface TeaCupVisualProps {
  card: TeaCard;
  size?: 'sm' | 'md' | 'lg';
  compact?: boolean;
}

export const TeaCupVisual: React.FC<TeaCupVisualProps> = ({ card, size = 'md', compact = false }) => {
  const isLg = size === 'lg';
  const isSm = size === 'sm';

  const width = isLg ? 110 : isSm ? 54 : 80;
  const height = isLg ? 150 : isSm ? 74 : 110;

  return (
    <div className={`relative flex items-center justify-center ${compact ? 'py-1' : 'py-3'}`}>
      <svg
        width={width}
        height={height}
        viewBox="0 0 100 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-md transition-transform duration-300 group-hover:scale-105"
      >
        {/* Steam whispers */}
        {!isSm && (
          <g opacity="0.65" className="animate-pulse">
            <path
              d="M42 22C42 16 48 14 46 8"
              stroke="#E5C158"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2 3"
            />
            <path
              d="M50 20C50 14 56 12 54 6"
              stroke="#FFF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2 2"
            />
            <path
              d="M58 23C58 17 64 15 62 9"
              stroke="#E5C158"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeDasharray="2 3"
            />
          </g>
        )}

        {/* Cup Lid / Snow cap */}
        {card.category === 'snow_cap_specialty' ? (
          <g>
            {/* Fluffy snow cream dome */}
            <path
              d="M26 38C26 28 35 24 50 24C65 24 74 28 74 38H26Z"
              fill="#FFFDF7"
            />
            <path
              d="M32 30C38 27 62 27 68 30"
              stroke="#F6AD55"
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Freeze dried fig crumbles / pecan crunch */}
            <circle cx="42" cy="28" r="1.8" fill="#C53030" />
            <circle cx="50" cy="26" r="2.2" fill="#D69E2E" />
            <circle cx="58" cy="29" r="1.8" fill="#C53030" />
            <circle cx="46" cy="33" r="1.4" fill="#9B2C2C" />
            <circle cx="55" cy="32" r="1.6" fill="#D69E2E" />
            {/* Cup Rim Top */}
            <rect x="22" y="38" width="56" height="5" rx="2.5" fill="#D4AF37" />
          </g>
        ) : (
          <g>
            {/* Royal Gold Dome Top Lid */}
            <path
              d="M25 36C25 31 34 28 50 28C66 28 75 31 75 36H25Z"
              fill="#0F172A"
              stroke="#D4AF37"
              strokeWidth="1.5"
            />
            <rect x="23" y="36" width="54" height="4.5" rx="2" fill="#D4AF37" />
            {/* Sip hole tab */}
            <rect x="44" y="27" width="12" height="3" rx="1.5" fill="#C5A059" />
          </g>
        )}

        {/* Cup Body Base */}
        <path
          d="M25 41L32 128C32.5 132 36 135 40 135H60C64 135 67.5 132 68 128L75 41H25Z"
          fill={card.cupColor}
          stroke="#D4AF37"
          strokeWidth="1.5"
        />

        {/* Inner Cup Gradient Shade */}
        <path
          d="M26 42L33 127C33.5 130 36 133 39 133H48V42H26Z"
          fill="black"
          opacity="0.18"
        />

        {/* Traditional Oriental Damask Motif / Band */}
        <rect x="27.5" y="58" width="45" height="38" fill="#0E192D" fillOpacity="0.85" />
        <rect x="27.5" y="58" width="45" height="38" stroke="#D4AF37" strokeWidth="0.75" />

        {/* Gold Border Filigree */}
        <line x1="28" y1="61" x2="72" y2="61" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2 1" />
        <line x1="28" y1="93" x2="72" y2="93" stroke="#D4AF37" strokeWidth="0.5" strokeDasharray="2 1" />

        {/* Center Seal Stamp */}
        <rect
          x="40"
          y="66"
          width="20"
          height="22"
          rx="2"
          fill="#A81D24"
          stroke="#F3E5AB"
          strokeWidth="0.8"
        />
        {/* Chinese character / Brand mark */}
        <text
          x="50"
          y="76"
          fill="#FFFDF0"
          fontSize="7"
          fontWeight="bold"
          fontFamily="Noto Serif SC, serif"
          textAnchor="middle"
        >
          霸王
        </text>
        <text
          x="50"
          y="84"
          fill="#FFFDF0"
          fontSize="7"
          fontWeight="bold"
          fontFamily="Noto Serif SC, serif"
          textAnchor="middle"
        >
          茶姬
        </text>

        {/* Bottom Cup Band */}
        <path
          d="M31 118L32 128C32.5 132 36 135 40 135H60C64 135 67.5 132 68 128L69 118H31Z"
          fill="#D4AF37"
          opacity="0.9"
        />
        <text
          x="50"
          y="128"
          fill="#111827"
          fontSize="5"
          fontWeight="bold"
          fontFamily="Cinzel, serif"
          textAnchor="middle"
          letterSpacing="1"
        >
          CHAGEE
        </text>
      </svg>
    </div>
  );
};
