import React from 'react';
import { OrdemProducao } from '../../types/database';
import { formatarMoeda, formatarSegundos } from '../../lib/leanPricingEngine';
import { DollarSign, X, TrendingUp, TrendingDown, Clock, ShieldAlert, CheckCircle } from 'lucide-react';

interface CostVarianceReportModalProps {
  isOpen: boolean;
  op: OrdemProducao;
  taxaHorariaMO: number;
  onClose: () => void;
}

export const CostVarianceReportModal: React.FC<CostVarianceReportModalProps> = ({
  isOpen,
  op,
  taxaHorariaMO,
  onClose,
}) => {
  if (!isOpen) return null;

  const tempoTotalSegundos = op.tempo_total_real || 0;
  const tempoOrcadoSegundos = Math.round(((op.produto?.tempo_padrao_total || 60) * 60) * op.quantidade);
  const diferencaSegundos = tempoTotalSegundos - tempoOrcadoSegundos;
  const desvioPercentual = tempoOrcadoSegundos > 0
    ? Number(((diferencaSegundos / tempoOrcadoSegundos) * 100).toFixed(1))
    : 0;

  const custoMoOrcado = op.custo_mo_orcado || ((tempoOrcadoSegundos / 3600) * taxaHorariaMO);
  const custoMoReal = (tempoTotalSegundos / 3600) * taxaHorariaMO;
  const diferencaCustoMo = custoMoReal - custoMoOrcado;
  const isEconomia = diferencaCustoMo <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#B85324]/10 text-[#B85324] rounded-2xl">
              <DollarSign className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#4A2013]">Relatório de Desvio de Custo Lean</h3>
              <p className="text-sm text-[#4A2013]/70">
                {op.codigo_op} • <strong className="text-[#B85324]">{op.quantidade}x {op.produto?.nome}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#4A2013]/50 hover:text-[#4A2013] rounded-full hover:bg-black/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Banner do Veredito */}
        <div
          className={`mt-5 p-4 rounded-2xl border-2 flex items-center justify-between gap-4 ${
            isEconomia
              ? 'bg-[#E8F5EE] border-[#2D7A4C] text-[#2D7A4C]'
              : desvioPercentual > 20
              ? 'bg-[#FEE2E2] border-[#991B1B] text-[#991B1B]'
              : 'bg-[#FEF3C7] border-[#D97706] text-[#D97706]'
          }`}
        >
          <div className="flex items-center gap-3">
            {isEconomia ? (
              <CheckCircle className="w-8 h-8 shrink-0" />
            ) : (
              <ShieldAlert className="w-8 h-8 shrink-0" />
            )}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider block">
                {isEconomia ? 'Eficiência Lean Positiva' : desvioPercentual > 20 ? 'Gargalo Crítico de Custo' : 'Atenção ao Ritmo'}
              </span>
              <p className="text-base font-bold">
                {isEconomia
                  ? `Economia de ${formatarMoeda(Math.abs(diferencaCustoMo))} na mão de obra (${Math.abs(desvioPercentual)}% mais rápido que a meta)`
                  : `Sobrecusto de ${formatarMoeda(diferencaCustoMo)} (${desvioPercentual}% acima do previsto)`}
              </p>
            </div>
          </div>
        </div>

        {/* Cards comparativos */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Orçado */}
          <div className="bg-white p-5 rounded-2xl border border-[#4A2013]/15 shadow-sm">
            <span className="text-xs font-bold text-[#4A2013]/60 uppercase tracking-wider block mb-1">
              Mão de Obra Orçada (Meta)
            </span>
            <div className="text-2xl font-black text-[#4A2013]">
              {formatarMoeda(custoMoOrcado)}
            </div>
            <div className="mt-2 text-xs text-[#4A2013]/70 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B85324]" />
              <span>Tempo Padrão: <strong>{formatarSegundos(tempoOrcadoSegundos)}</strong> ({((tempoOrcadoSegundos / 3600)).toFixed(2)}h)</span>
            </div>
          </div>

          {/* Realizado */}
          <div className="bg-white p-5 rounded-2xl border border-[#4A2013]/15 shadow-sm">
            <span className="text-xs font-bold text-[#4A2013]/60 uppercase tracking-wider block mb-1">
              Mão de Obra Realizada (Chão de Fábrica)
            </span>
            <div className={`text-2xl font-black ${isEconomia ? 'text-[#2D7A4C]' : 'text-[#991B1B]'}`}>
              {formatarMoeda(custoMoReal)}
            </div>
            <div className="mt-2 text-xs text-[#4A2013]/70 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#B85324]" />
              <span>Tempo Real Líquido: <strong>{formatarSegundos(tempoTotalSegundos)}</strong> ({((tempoTotalSegundos / 3600)).toFixed(2)}h)</span>
            </div>
          </div>
        </div>

        {/* Breakdown por Etapas */}
        <div className="mt-6">
          <h4 className="text-sm font-bold text-[#4A2013] mb-3 flex items-center gap-2">
            <span>Desempenho por Etapa Produtiva</span>
          </h4>
          <div className="space-y-2">
            {(op.etapas || []).map((et) => {
              const tempoEtapaPadraoSeg = Math.round((et.tempo_padrao_min * 60) * op.quantidade);
              const deltaEtapaSeg = et.tempo_real_segundos - tempoEtapaPadraoSeg;
              const custoEtapaOrcado = (tempoEtapaPadraoSeg / 3600) * taxaHorariaMO;
              const custoEtapaReal = (et.tempo_real_segundos / 3600) * taxaHorariaMO;
              const difEtapaCusto = custoEtapaReal - custoEtapaOrcado;

              return (
                <div
                  key={et.id}
                  className="bg-white p-3.5 rounded-xl border border-[#4A2013]/10 flex flex-wrap items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-[#FAF6EE] border border-[#B85324]/30 font-bold flex items-center justify-center text-[#B85324]">
                      {et.sequencia}
                    </span>
                    <div>
                      <strong className="text-[#4A2013] text-sm block">{et.etapa_nome}</strong>
                      <span className="text-[#4A2013]/60">Operador: {et.operador_nome || 'Não definido'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-[#4A2013]/60 block">Tempo Real / Meta</span>
                      <strong className="font-mono text-[#4A2013]">
                        {formatarSegundos(et.tempo_real_segundos)} / {formatarSegundos(tempoEtapaPadraoSeg)}
                      </strong>
                    </div>

                    <div className="text-right">
                      <span className="text-[#4A2013]/60 block">Variação MO</span>
                      <strong className={`font-mono ${difEtapaCusto <= 0 ? 'text-[#2D7A4C]' : 'text-[#991B1B]'}`}>
                        {difEtapaCusto > 0 ? `+${formatarMoeda(difEtapaCusto)}` : formatarMoeda(difEtapaCusto)}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Anotações Kaizen Registradas */}
        {op.notas_kaizen && (
          <div className="mt-5 p-4 rounded-2xl bg-[#F9E8B8]/30 border border-[#B85324]/20 text-xs text-[#4A2013]">
            <strong className="block text-[#B85324] font-bold mb-1">Anotações Kaizen da OP:</strong>
            <p className="italic">"{op.notas_kaizen}"</p>
          </div>
        )}

        <div className="mt-6 flex justify-end pt-4 border-t border-[#4A2013]/10">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#4A2013] text-white font-bold text-sm hover:bg-[#32150C]"
          >
            Fechar Relatório
          </button>
        </div>
      </div>
    </div>
  );
};
