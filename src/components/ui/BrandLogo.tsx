import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md',
  showSubtitle = true 
}) => {
  const iconSize = size === 'sm' ? 32 : size === 'md' ? 44 : 58;
  const titleSize = size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl';

  return (
    <div className="flex items-center gap-3">
      {/* Borboleta estilizada Di' Linhas em traço contínuo */}
      <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-br from-[#F9E8B8]/60 to-[#F9E8B8]/20 border border-[#B85324]/20 shadow-sm">
        <svg 
          width={iconSize} 
          height={iconSize} 
          viewBox="0 0 100 100" 
          fill="none" 
          stroke="#B85324" 
          strokeWidth="2.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="transition-transform duration-300 hover:scale-105"
        >
          {/* Antenas */}
          <path d="M50 20 C 50 15, 46 10, 42 12 C 38 14, 40 20, 50 30" />
          <path d="M50 20 C 50 15, 54 10, 58 12 C 62 14, 60 20, 50 30" />
          {/* Asa Superior Esquerda */}
          <path d="M50 32 C 35 15, 10 20, 12 45 C 13 60, 32 62, 50 68" />
          {/* Asa Inferior Esquerda */}
          <path d="M50 68 C 30 70, 20 85, 30 92 C 40 96, 48 85, 50 78" />
          {/* Asa Superior Direita */}
          <path d="M50 32 C 65 15, 90 20, 88 45 C 87 60, 68 62, 50 68" />
          {/* Asa Inferior Direita */}
          <path d="M50 68 C 70 70, 80 85, 70 92 C 60 96, 52 85, 50 78" />
          {/* Corpo central */}
          <path d="M50 28 L50 82" stroke="#4A2013" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="26" r="3" fill="#4A2013" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className={`font-brand font-bold tracking-wider text-[#4A2013] ${titleSize}`}>
            DI' LINHAS
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#B85324]"></span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-[#B85324]">
            Projetos Criativos • Lean MES
          </span>
        )}
      </div>
    </div>
  );
};
