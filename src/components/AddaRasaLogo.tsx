import React from 'react';

interface AddaRasaLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  showText?: boolean;
  theme?: 'gold' | 'white' | 'dark';
}

export const AddaRasaLogo: React.FC<AddaRasaLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  theme = 'gold',
}) => {
  const sizeMap = {
    sm: 'w-8 h-10',
    md: 'w-16 h-20',
    lg: 'w-24 h-30',
    xl: 'w-32 h-40',
    custom: '',
  };

  const primaryGold = theme === 'white' ? '#FFFFFF' : theme === 'dark' ? '#1a1b22' : '#9D852C';
  const lightGold = theme === 'white' ? '#F3F4F6' : theme === 'dark' ? '#333544' : '#C5AA46';
  const darkGold = theme === 'white' ? '#E5E7EB' : theme === 'dark' ? '#0b0c10' : '#7D671A';

  return (
    <svg
      viewBox="0 0 300 380"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeMap[size]} ${className} object-contain`}
      aria-label="Logo Adda Rasa"
    >
      <defs>
        <linearGradient id="addaRasaGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={lightGold} />
          <stop offset="45%" stopColor={primaryGold} />
          <stop offset="100%" stopColor={darkGold} />
        </linearGradient>

        <radialGradient id="addaRasaDotGrad" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor={lightGold} />
          <stop offset="70%" stopColor={primaryGold} />
          <stop offset="100%" stopColor={darkGold} />
        </radialGradient>

        <filter id="addaSoftGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor="#000000" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Top Text: Adda */}
      {showText && (
        <text
          x="150"
          y="70"
          textAnchor="middle"
          fill="url(#addaRasaGoldGrad)"
          style={{
            fontFamily: "'Playfair Display', 'Cinzel', 'Times New Roman', Georgia, serif",
            fontWeight: 700,
            fontSize: '66px',
            letterSpacing: '1px',
          }}
          filter="url(#addaSoftGlow)"
        >
          Adda
        </text>
      )}

      {/* Center Motif / Petal Knot */}
      <g id="center-emblem" filter="url(#addaSoftGlow)">
        {/* 4 Outer Dots */}
        <circle cx="76" cy="120" r="18" fill="url(#addaRasaDotGrad)" />
        <circle cx="224" cy="120" r="18" fill="url(#addaRasaDotGrad)" />
        <circle cx="76" cy="260" r="18" fill="url(#addaRasaDotGrad)" />
        <circle cx="224" cy="260" r="18" fill="url(#addaRasaDotGrad)" />

        {/* 4 Swirling Curved Ribbon Blades */}
        <g transform="translate(150, 190)">
          {/* Top Blade */}
          <path
            d="M -36 -50 C -14 -72 18 -76 40 -58 C 34 -44 26 -30 4 -14 C -2 -28 -12 -40 -36 -50 Z"
            fill="url(#addaRasaGoldGrad)"
          />
          {/* Right Blade */}
          <path
            d="M 50 -36 C 72 -14 76 18 58 40 C 44 34 30 26 14 4 C 28 -2 40 -12 50 -36 Z"
            fill="url(#addaRasaGoldGrad)"
          />
          {/* Bottom Blade */}
          <path
            d="M 36 50 C 14 72 -18 76 -40 58 C -34 44 -26 30 -4 14 C 2 28 12 40 36 50 Z"
            fill="url(#addaRasaGoldGrad)"
          />
          {/* Left Blade */}
          <path
            d="M -50 36 C -72 14 -76 -18 -58 -40 C -44 -34 -30 -26 -14 -4 C -28 2 -40 12 -50 36 Z"
            fill="url(#addaRasaGoldGrad)"
          />
        </g>
      </g>

      {/* Bottom Text: Rasa */}
      {showText && (
        <>
          <text
            x="150"
            y="336"
            textAnchor="middle"
            fill="url(#addaRasaGoldGrad)"
            style={{
              fontFamily: "'Playfair Display', 'Cinzel', 'Times New Roman', Georgia, serif",
              fontWeight: 700,
              fontSize: '66px',
              letterSpacing: '1px',
            }}
            filter="url(#addaSoftGlow)"
          >
            Rasa
          </text>

          {/* Underline Bar */}
          <line
            x1="36"
            y1="358"
            x2="264"
            y2="358"
            stroke="url(#addaRasaGoldGrad)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </>
      )}
    </svg>
  );
};
