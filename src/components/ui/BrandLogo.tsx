import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  variant?: 'full' | 'symbol' | 'compact';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md',
  showSubtitle = true,
  variant = 'compact'
}) => {
  // Configurações de altura da imagem conforme o tamanho
  const imgHeight = {
    sm: 'h-8 sm:h-9',
    md: 'h-11 sm:h-12',
    lg: 'h-16 sm:h-18',
    xl: 'h-24 sm:h-28',
  }[size];

  if (variant === 'full') {
    return (
      <div className="flex flex-col items-center justify-center gap-2">
        <img
          src="/logo-dilinhas.png"
          alt="Di' Linhas - Projetos Criativos"
          className={`${imgHeight} w-auto object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105`}
        />
        {showSubtitle && (
          <span className="text-[10px] sm:text-xs font-bold tracking-[0.2em] uppercase text-[#B85324] bg-[#F9E8B8]/60 px-3 py-0.5 rounded-full border border-[#B85324]/20">
            Sistema Lean MES & ERP Fabril
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Imagem Oficial Di' Linhas */}
      <div className="relative flex items-center justify-center p-1 rounded-2xl bg-white/80 border border-[#B85324]/20 shadow-sm overflow-hidden">
        <img
          src="/logo-dilinhas.png"
          alt="Di' Linhas - Projetos Criativos"
          className={`${imgHeight} w-auto object-contain transition-transform duration-300 hover:scale-105`}
        />
      </div>

      {showSubtitle && (
        <div className="hidden sm:flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-brand font-black tracking-wider text-[#4A2013] text-lg lg:text-xl">
              DI' LINHAS
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#B85324]"></span>
          </div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-[#B85324]">
            Projetos Criativos • Lean MES
          </span>
        </div>
      )}
    </div>
  );
};
