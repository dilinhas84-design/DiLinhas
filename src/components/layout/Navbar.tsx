import React from 'react';
import { BrandLogo } from '../ui/BrandLogo';
import { useLeanSystem } from '../../context/LeanSystemContext';
import { formatarMoeda } from '../../lib/leanPricingEngine';
import { 
  PlayCircle, 
  Layers, 
  Calculator, 
  Boxes, 
  Settings, 
  CheckCircle2, 
  AlertTriangle,
  RefreshCw,
  Database
} from 'lucide-react';

export type TabType = 'shopfloor' | 'orders' | 'pricing' | 'inventory' | 'settings';

interface NavbarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  onOpenSettingsModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettingsModal,
}) => {
  const { 
    taxaHorariaMO, 
    ordensProducao, 
    isOnlineSupabase, 
    isLoading, 
    recarregarDados 
  } = useLeanSystem();

  // Métricas rápidas de topo
  const opsEmProducao = ordensProducao.filter((o) => o.status === 'EM_PRODUCAO').length;
  const opsConcluidas = ordensProducao.filter((o) => o.status === 'CONCLUIDA').length;

  return (
    <header className="sticky top-0 z-30 bg-[#FFFFFF]/90 backdrop-blur-md border-b border-[#B85324]/15 shadow-sm">
      {/* Top Banner Informativo / Industrial */}
      <div className="bg-[#FAF6EE] border-b border-[#B85324]/10 px-4 py-1.5 text-xs text-[#4A2013]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#2D7A4C] animate-pulse"></span>
              Planta Fabril: <strong className="text-[#B85324]">Ativa</strong>
            </span>
            <span className="hidden sm:inline-block text-[#4A2013]/40">|</span>
            <span className="hidden sm:flex items-center gap-1">
              Taxa MO/Hora: 
              <button 
                onClick={onOpenSettingsModal}
                className="font-mono font-bold text-[#B85324] hover:underline cursor-pointer"
                title="Clique para ajustar despesas e dias úteis"
              >
                {formatarMoeda(taxaHorariaMO)}/h
              </button>
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase status badge */}
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
                isOnlineSupabase 
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}
              title={isOnlineSupabase ? 'Sincronizado com Supabase Cloud' : 'Operando em modo local seguro resiliente'}
            >
              <Database className="w-3 h-3" />
              <span>{isOnlineSupabase ? 'Supabase Online' : 'Local Storage Seguro'}</span>
            </div>

            <button
              onClick={recarregarDados}
              disabled={isLoading}
              className="p-1 rounded-md text-[#4A2013]/60 hover:text-[#B85324] hover:bg-[#FAF6EE] transition-colors"
              title="Recarregar dados"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <BrandLogo size="md" />

        {/* Abas Centrais */}
        <nav className="hidden md:flex items-center gap-1.5 bg-[#FAF6EE] p-1.5 rounded-2xl border border-[#B85324]/15">
          <button
            onClick={() => onSelectTab('shopfloor')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'shopfloor'
                ? 'bg-[#B85324] text-white shadow-touch-active'
                : 'text-[#4A2013] hover:text-[#B85324] hover:bg-[#F9E8B8]/40'
            }`}
          >
            <PlayCircle className="w-4 h-4" />
            <span>Chão de Fábrica (MES)</span>
            {opsEmProducao > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === 'shopfloor' ? 'bg-white text-[#B85324]' : 'bg-[#B85324] text-white'
              }`}>
                {opsEmProducao}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'orders'
                ? 'bg-[#B85324] text-white shadow-touch-active'
                : 'text-[#4A2013] hover:text-[#B85324] hover:bg-[#F9E8B8]/40'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Ordens de Produção</span>
          </button>

          <button
            onClick={() => onSelectTab('pricing')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'pricing'
                ? 'bg-[#B85324] text-white shadow-touch-active'
                : 'text-[#4A2013] hover:text-[#B85324] hover:bg-[#F9E8B8]/40'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Precificação & Ficha Técnica</span>
          </button>

          <button
            onClick={() => onSelectTab('inventory')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
              activeTab === 'inventory'
                ? 'bg-[#B85324] text-white shadow-touch-active'
                : 'text-[#4A2013] hover:text-[#B85324] hover:bg-[#F9E8B8]/40'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Estoque & Kardex (JIT)</span>
          </button>
        </nav>

        {/* Botão de Configuração de Custos */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSettingsModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[#B85324]/20 text-[#4A2013] hover:bg-[#F9E8B8]/40 transition-all text-xs font-semibold"
          >
            <Settings className="w-4 h-4 text-[#B85324]" />
            <span className="hidden lg:inline">Taxa Horária</span>
          </button>
        </div>
      </div>

      {/* Navegação Mobile / Tablet Inferior fixada */}
      <div className="md:hidden border-t border-[#B85324]/10 bg-white grid grid-cols-4 gap-1 p-1">
        <button
          onClick={() => onSelectTab('shopfloor')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium ${
            activeTab === 'shopfloor' ? 'bg-[#B85324] text-white font-bold' : 'text-[#4A2013]'
          }`}
        >
          <PlayCircle className="w-5 h-5 mb-0.5" />
          <span>Fábrica</span>
        </button>
        <button
          onClick={() => onSelectTab('orders')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium ${
            activeTab === 'orders' ? 'bg-[#B85324] text-white font-bold' : 'text-[#4A2013]'
          }`}
        >
          <Layers className="w-5 h-5 mb-0.5" />
          <span>OPs</span>
        </button>
        <button
          onClick={() => onSelectTab('pricing')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium ${
            activeTab === 'pricing' ? 'bg-[#B85324] text-white font-bold' : 'text-[#4A2013]'
          }`}
        >
          <Calculator className="w-5 h-5 mb-0.5" />
          <span>BOM</span>
        </button>
        <button
          onClick={() => onSelectTab('inventory')}
          className={`flex flex-col items-center py-2 px-1 rounded-lg text-xs font-medium ${
            activeTab === 'inventory' ? 'bg-[#B85324] text-white font-bold' : 'text-[#4A2013]'
          }`}
        >
          <Boxes className="w-5 h-5 mb-0.5" />
          <span>Estoque</span>
        </button>
      </div>
    </header>
  );
};
