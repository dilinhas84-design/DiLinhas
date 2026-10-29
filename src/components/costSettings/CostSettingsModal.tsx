import React, { useState } from 'react';
import { useLeanSystem } from '../../context/LeanSystemContext';
import { formatarMoeda, calcularTaxaHorariaMO } from '../../lib/leanPricingEngine';
import { Settings, X, Calculator, Check, Info } from 'lucide-react';

interface CostSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CostSettingsModal: React.FC<CostSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { configCustos, atualizarConfigCustos } = useLeanSystem();

  const [despesas3m, setDespesas3m] = useState<number>(configCustos.media_despesas_3m);
  const [diasUteis, setDiasUteis] = useState<number>(configCustos.dias_uteis_mes);
  const [horasDia, setHorasDia] = useState<number>(configCustos.horas_trabalhadas_dia);
  const [taxaFixa, setTaxaFixa] = useState<number>(configCustos.taxa_operacional_fixa_unidade || 9.5);
  const [salvando, setSalvando] = useState(false);

  if (!isOpen) return null;

  // Cálculo prévio em tempo real
  const taxaCalculada = calcularTaxaHorariaMO({
    media_despesas_3m: despesas3m,
    dias_uteis_mes: diasUteis,
    horas_trabalhadas_dia: horasDia,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      await atualizarConfigCustos({
        media_despesas_3m: despesas3m,
        dias_uteis_mes: diasUteis,
        horas_trabalhadas_dia: horasDia,
        taxa_operacional_fixa_unidade: taxaFixa,
      });
      onClose();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#B85324]/10 text-[#B85324] rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#4A2013]">
                Taxa Horária Dinâmica de Mão de Obra
              </h3>
              <p className="text-xs text-[#4A2013]/70">
                Fórmula Lean de Absorção Operacional
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#4A2013]/50 hover:text-[#4A2013] rounded-full hover:bg-black/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Card Explicativo da Fórmula */}
        <div className="mt-4 p-4 rounded-2xl bg-white border border-[#B85324]/20 space-y-2 text-xs text-[#4A2013]">
          <div className="font-mono text-center text-sm font-bold text-[#B85324] bg-[#FAF6EE] py-2 px-3 rounded-xl border border-[#B85324]/20">
            Taxa MO/Hora = Despesas Médias 3M ÷ (Dias Úteis × Horas/Dia)
          </div>
          <div className="flex items-start gap-1.5 text-[11px] text-[#4A2013]/70 pt-1">
            <Info className="w-4 h-4 shrink-0 text-[#B85324] mt-0.5" />
            <span>
              Qualquer alteração recalcula imediatamente todas as fichas técnicas, OPs e orçamentos da fábrica.
            </span>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#4A2013] block mb-1">
              Média das Despesas Operacionais dos Últimos 3 Meses (R$)
            </label>
            <input
              type="number"
              step="100"
              required
              value={despesas3m}
              onChange={(e) => setDespesas3m(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#4A2013]/20 bg-white text-sm font-mono font-bold focus:outline-none focus:border-[#B85324]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#4A2013] block mb-1">
                Dias Úteis Médios/Mês
              </label>
              <input
                type="number"
                min="10"
                max="31"
                required
                value={diasUteis}
                onChange={(e) => setDiasUteis(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#4A2013]/20 bg-white text-sm font-mono font-bold focus:outline-none focus:border-[#B85324]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#4A2013] block mb-1">
                Horas Diárias Trabalhadas
              </label>
              <input
                type="number"
                step="0.5"
                min="4"
                max="12"
                required
                value={horasDia}
                onChange={(e) => setHorasDia(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#4A2013]/20 bg-white text-sm font-mono font-bold focus:outline-none focus:border-[#B85324]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#4A2013] block mb-1">
              Custo Operacional Fixo Rateado por Unidade (R$)
            </label>
            <input
              type="number"
              step="0.5"
              value={taxaFixa}
              onChange={(e) => setTaxaFixa(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl border border-[#4A2013]/20 bg-white text-sm font-mono font-bold focus:outline-none focus:border-[#B85324]"
            />
          </div>

          {/* Destaque do Resultado */}
          <div className="p-4 rounded-2xl bg-[#4A2013] text-white flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#F9E8B8] block">
                Nova Taxa Horária Calculada:
              </span>
              <span className="text-xs text-white/70">
                {diasUteis * horasDia} horas produtivas no mês
              </span>
            </div>
            <div className="font-mono text-2xl font-black text-[#F9E8B8]">
              {formatarMoeda(taxaCalculada)}/h
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[#4A2013]/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013] hover:bg-black/5"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={salvando}
              className="px-6 py-2.5 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Check className="w-4 h-4" />
              <span>{salvando ? 'Atualizando...' : 'Aplicar Taxa na Fábrica'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
