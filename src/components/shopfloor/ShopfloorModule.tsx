import React, { useState, useMemo } from 'react';
import { useLeanSystem } from '../../context/LeanSystemContext';
import { 
  formatarMoeda, 
  formatarSegundos, 
  analisarDesvioEtapa 
} from '../../lib/leanPricingEngine';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  User, 
  Sparkles, 
  DollarSign, 
  AlertCircle,
  FileText,
  ChevronRight,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { PauseModal } from './PauseModal';
import { QualityChecklistModal } from './QualityChecklistModal';
import { CostVarianceReportModal } from './CostVarianceReportModal';
import { MotivoPausa, ChecklistQualidade, OpEtapa } from '../../types/database';

export const ShopfloorModule: React.FC = () => {
  const { 
    ordensProducao, 
    taxaHorariaMO, 
    iniciarEtapa, 
    pausarEtapa, 
    retomarEtapa, 
    concluirEtapa, 
    salvarNotasKaizen 
  } = useLeanSystem();

  // Filtrar OPs ativas (em produção, pausadas ou criadas)
  const opsAtivas = useMemo(() => {
    return ordensProducao.filter((op) => op.status !== 'CANCELADA');
  }, [ordensProducao]);

  // OP selecionada para o operador atual
  const [opSelecionadaId, setOpSelecionadaId] = useState<string>(() => {
    const ativa = ordensProducao.find((o) => o.status === 'EM_PRODUCAO');
    return ativa?.id || ordensProducao[0]?.id || '';
  });

  const opAtual = useMemo(() => {
    return ordensProducao.find((o) => o.id === opSelecionadaId) || ordensProducao[0];
  }, [ordensProducao, opSelecionadaId]);

  // Nome do Operador no posto touch
  const [operadorNome, setOperadorNome] = useState<string>('Juliana Silva');

  // Modais de apoio
  const [modalPausaAberto, setModalPausaAberto] = useState(false);
  const [modalQualidadeAberto, setModalQualidadeAberto] = useState(false);
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [etapaAcao, setEtapaAcao] = useState<OpEtapa | null>(null);

  // Anotações Kaizen locais
  const [kaizenTexto, setKaizenTexto] = useState(opAtual?.notas_kaizen || '');

  // Atualizar texto do Kaizen quando mudar OP
  React.useEffect(() => {
    if (opAtual) {
      setKaizenTexto(opAtual.notas_kaizen || '');
    }
  }, [opAtual?.id]);

  if (!opAtual) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#4A2013]/10 max-w-xl mx-auto my-12">
        <AlertCircle className="w-12 h-12 text-[#B85324] mx-auto mb-3" />
        <h3 className="text-xl font-bold text-[#4A2013]">Nenhuma Ordem de Produção no Sistema</h3>
        <p className="text-sm text-[#4A2013]/70 mt-1">
          Crie uma nova Ordem de Produção na aba "Ordens de Produção" para iniciar a linha.
        </p>
      </div>
    );
  }

  // Encontrar etapa em andamento ou a primeira pendente
  const etapaEmAndamento = opAtual.etapas?.find((e) => e.status === 'EM_ANDAMENTO' || e.status === 'PAUSADA');
  const etapaAtiva = etapaEmAndamento || opAtual.etapas?.find((e) => e.status === 'PENDENTE') || opAtual.etapas?.[0];

  // Análise Andon da etapa ativa
  const analiseAndon = etapaAtiva
    ? analisarDesvioEtapa(
        etapaAtiva.tempo_padrao_min,
        etapaAtiva.tempo_real_segundos,
        taxaHorariaMO,
        opAtual.quantidade
      )
    : null;

  // Handlers dos botões touch gigantes
  const handleIniciarOuRetomar = () => {
    if (!etapaAtiva) return;
    if (etapaAtiva.status === 'PAUSADA') {
      retomarEtapa(opAtual.id, etapaAtiva.id);
    } else {
      iniciarEtapa(opAtual.id, etapaAtiva.id, operadorNome);
    }
  };

  const handlePausar = () => {
    if (!etapaAtiva) return;
    setEtapaAcao(etapaAtiva);
    setModalPausaAberto(true);
  };

  const handleConfirmarPausa = (motivo: MotivoPausa, obs?: string) => {
    if (etapaAcao) {
      pausarEtapa(opAtual.id, etapaAcao.id, motivo, obs);
      setModalPausaAberto(false);
      setEtapaAcao(null);
    }
  };

  const handleConcluir = () => {
    if (!etapaAtiva) return;
    setEtapaAcao(etapaAtiva);

    // Se for a etapa de Acabamento e Controle de Qualidade, abre o checklist
    if (etapaAtiva.etapa_nome === 'Acabamento e Controle de Qualidade') {
      setModalQualidadeAberto(true);
    } else {
      concluirEtapa(opAtual.id, etapaAtiva.id);
    }
  };

  const handleConfirmarQualidade = (checklist: ChecklistQualidade, notas?: string) => {
    if (etapaAcao) {
      concluirEtapa(opAtual.id, etapaAcao.id, checklist, notas);
      setModalQualidadeAberto(false);
      setEtapaAcao(null);
    }
  };

  const handleSalvarKaizen = () => {
    salvarNotasKaizen(opAtual.id, kaizenTexto);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Barra de Seleção de OP & Operador do Posto */}
      <div className="bg-white p-4 rounded-3xl border border-[#B85324]/20 shadow-soft-warm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FAF6EE] border border-[#B85324]/30 rounded-2xl text-[#B85324]">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#4A2013]/60 uppercase tracking-wider block">
              Ordem de Produção Selecionada
            </span>
            <div className="flex items-center gap-2">
              <select
                value={opAtual.id}
                onChange={(e) => setOpSelecionadaId(e.target.value)}
                className="font-bold text-lg text-[#4A2013] bg-transparent focus:outline-none cursor-pointer pr-4"
              >
                {opsAtivas.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.codigo_op} — {o.quantidade}x {o.produto?.nome} ({o.status})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Operador Touch Input */}
        <div className="flex items-center gap-3 bg-[#FAF6EE] px-4 py-2 rounded-2xl border border-[#B85324]/15">
          <User className="w-5 h-5 text-[#B85324]" />
          <div>
            <span className="text-[10px] font-bold text-[#4A2013]/60 uppercase tracking-wider block">
              Operador Atual
            </span>
            <input
              type="text"
              value={operadorNome}
              onChange={(e) => setOperadorNome(e.target.value)}
              className="text-sm font-bold text-[#4A2013] bg-transparent focus:outline-none w-32 sm:w-40"
              placeholder="Nome do Operador"
            />
          </div>
        </div>

        {/* Botão para Relatório de Custos */}
        <button
          onClick={() => setModalRelatorioAberto(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#4A2013] hover:bg-[#32150C] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
        >
          <DollarSign className="w-4 h-4 text-[#F9E8B8]" />
          <span>Relatório de Desvio de Custo</span>
        </button>
      </div>

      {/* Esteira Visual das 4 Etapas Padronizadas (Lean Flow) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(opAtual.etapas || []).map((etapa, idx) => {
          const isAtiva = etapa.id === etapaAtiva?.id;
          const isConcluida = etapa.status === 'CONCLUIDA';
          const isAndamento = etapa.status === 'EM_ANDAMENTO';
          const isPausada = etapa.status === 'PAUSADA';

          const tempoPadraoEtapaSeg = Math.round((etapa.tempo_padrao_min * 60) * opAtual.quantidade);
          const desvioEtapa = etapa.tempo_real_segundos - tempoPadraoEtapaSeg;
          const isGargalo = etapa.tempo_real_segundos > (tempoPadraoEtapaSeg * 1.2);

          return (
            <div
              key={etapa.id}
              className={`p-4 rounded-3xl border-2 transition-all relative overflow-hidden ${
                isConcluida
                  ? 'bg-[#E8F5EE]/70 border-[#2D7A4C]/30 text-[#2D7A4C]'
                  : isAndamento
                  ? isGargalo
                    ? 'bg-[#FEE2E2] border-[#991B1B] text-[#991B1B] shadow-md ring-2 ring-[#991B1B]/20 animate-pulse'
                    : 'bg-white border-[#B85324] shadow-md ring-2 ring-[#B85324]/20'
                  : isPausada
                  ? 'bg-[#FEF3C7] border-[#D97706] text-[#D97706]'
                  : 'bg-white/60 border-[#4A2013]/10 text-[#4A2013]/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-black/5">
                  Etapa {etapa.sequencia}/4
                </span>
                {isConcluida && <CheckCircle2 className="w-5 h-5 text-[#2D7A4C]" />}
                {isAndamento && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-[#B85324]">
                    <span className="w-2 h-2 rounded-full bg-[#B85324] animate-ping"></span>
                    Em Linha
                  </span>
                )}
                {isPausada && (
                  <span className="text-[11px] font-bold text-[#D97706]">Pausada</span>
                )}
              </div>

              <h4 className="font-bold text-base text-[#4A2013] line-clamp-1">
                {etapa.etapa_nome}
              </h4>

              <div className="mt-3 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-[10px] text-[#4A2013]/60 block font-sans">Tempo Real:</span>
                  <strong className="text-sm font-bold text-[#4A2013]">
                    {formatarSegundos(etapa.tempo_real_segundos)}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#4A2013]/60 block font-sans">Padrão Lean:</span>
                  <span className="text-[#4A2013]/70">{formatarSegundos(tempoPadraoEtapaSeg)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Painel Operacional Touch Principal (Tablet Optimized) */}
      <div className="bg-white rounded-3xl border-2 border-[#B85324]/30 shadow-elevated-warm p-6 lg:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#4A2013]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#F9E8B8] text-[#4A2013] font-black text-xs uppercase tracking-wider">
                Posto de Trabalho Touch
              </span>
              <span className="text-xs text-[#4A2013]/60">
                Peça: <strong className="text-[#4A2013]">{opAtual.produto?.nome}</strong> ({opAtual.quantidade} un)
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#4A2013] mt-2">
              {etapaAtiva?.etapa_nome || 'Selecione uma etapa'}
            </h2>
          </div>

          {/* Andon Status Badge */}
          {analiseAndon && (
            <div
              className={`px-4 py-2.5 rounded-2xl border-2 flex items-center gap-3 ${
                analiseAndon.status === 'GARGALO_CRITICO'
                  ? 'bg-[#FEE2E2] border-[#991B1B] text-[#991B1B]'
                  : analiseAndon.status === 'ATENCAO'
                  ? 'bg-[#FEF3C7] border-[#D97706] text-[#D97706]'
                  : 'bg-[#E8F5EE] border-[#2D7A4C] text-[#2D7A4C]'
              }`}
            >
              {analiseAndon.status === 'GARGALO_CRITICO' ? (
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              ) : analiseAndon.status === 'ATENCAO' ? (
                <Clock className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider block">
                  Andon Lean: {analiseAndon.status.replace('_', ' ')}
                </span>
                <span className="text-xs font-semibold">{analiseAndon.mensagem}</span>
              </div>
            </div>
          )}
        </div>

        {/* Display Gigante do Cronômetro Líquido */}
        <div className="my-8 text-center bg-[#FAF6EE] py-8 px-4 rounded-3xl border border-[#B85324]/20 relative overflow-hidden">
          <span className="text-xs font-bold text-[#4A2013]/60 uppercase tracking-widest block mb-2">
            Cronômetro Líquido (Tempo Real Efetivo da Etapa)
          </span>

          <div className="font-mono text-5xl sm:text-7xl font-black text-[#4A2013] tracking-tight">
            {formatarSegundos(etapaAtiva?.tempo_real_segundos || 0)}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm text-[#4A2013]">
            <div className="flex items-center gap-2">
              <span className="text-[#4A2013]/60">Meta da Etapa:</span>
              <strong className="font-mono font-bold text-[#B85324]">
                {formatarSegundos(Math.round(((etapaAtiva?.tempo_padrao_min || 0) * 60) * opAtual.quantidade))}
              </strong>
            </div>
            <span className="text-[#4A2013]/30">•</span>
            <div className="flex items-center gap-2">
              <span className="text-[#4A2013]/60">Custo M.O. Acumulado da OP:</span>
              <strong className="font-mono font-bold text-[#4A2013]">
                {formatarMoeda(opAtual.custo_mo_real || 0)}
              </strong>
            </div>
          </div>
        </div>

        {/* BOTÕES GIGANTES DE AÇÃO TOUCH */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Botão 1: INICIAR / RETOMAR */}
          <button
            type="button"
            onClick={handleIniciarOuRetomar}
            disabled={etapaAtiva?.status === 'EM_ANDAMENTO' || etapaAtiva?.status === 'CONCLUIDA'}
            className={`py-5 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
              etapaAtiva?.status === 'EM_ANDAMENTO' || etapaAtiva?.status === 'CONCLUIDA'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-[#B85324] hover:bg-[#9A421A] text-white hover:shadow-touch-active'
            }`}
          >
            <Play className="w-7 h-7 fill-current" />
            <span>{etapaAtiva?.status === 'PAUSADA' ? 'RETOMAR LINHA' : 'INICIAR ETAPA'}</span>
          </button>

          {/* Botão 2: PAUSAR (com seleção de motivo) */}
          <button
            type="button"
            onClick={handlePausar}
            disabled={etapaAtiva?.status !== 'EM_ANDAMENTO'}
            className={`py-5 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
              etapaAtiva?.status !== 'EM_ANDAMENTO'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-[#D97706] hover:bg-[#B45309] text-white'
            }`}
          >
            <Pause className="w-7 h-7 fill-current" />
            <span>PAUSAR (ANDON)</span>
          </button>

          {/* Botão 3: CONCLUIR */}
          <button
            type="button"
            onClick={handleConcluir}
            disabled={etapaAtiva?.status === 'CONCLUIDA' || etapaAtiva?.status === 'PENDENTE'}
            className={`py-5 px-6 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
              etapaAtiva?.status === 'CONCLUIDA' || etapaAtiva?.status === 'PENDENTE'
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50 shadow-none'
                : 'bg-[#2D7A4C] hover:bg-[#23603B] text-white hover:shadow-touch-active'
            }`}
          >
            <CheckCircle2 className="w-7 h-7" />
            <span>CONCLUIR ETAPA</span>
          </button>
        </div>

        {/* Campo de Anotações Kaizen / Melhoria Contínua */}
        <div className="mt-8 pt-6 border-t border-[#4A2013]/10">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold text-[#4A2013] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#B85324]" />
              <span>Anotações Rápidas Kaizen (Retrabalho / Melhoria Contínua do Projeto):</span>
            </label>
            <button
              onClick={handleSalvarKaizen}
              className="text-xs font-bold text-[#B85324] hover:underline cursor-pointer"
            >
              Salvar Anotação
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={kaizenTexto}
              onChange={(e) => setKaizenTexto(e.target.value)}
              onBlur={handleSalvarKaizen}
              placeholder="Ex: Sugestão: chanfrar as pontas da alça antes da costura para evitar acúmulo de camadas..."
              className="w-full px-4 py-3 rounded-2xl border border-[#4A2013]/20 bg-[#FAF6EE] text-sm text-[#4A2013] focus:outline-none focus:border-[#B85324]"
            />
          </div>
        </div>
      </div>

      {/* Modais Integrados */}
      {etapaAcao && (
        <PauseModal
          isOpen={modalPausaAberto}
          etapaNome={etapaAcao.etapa_nome}
          onClose={() => {
            setModalPausaAberto(false);
            setEtapaAcao(null);
          }}
          onConfirm={handleConfirmarPausa}
        />
      )}

      {etapaAcao && (
        <QualityChecklistModal
          isOpen={modalQualidadeAberto}
          codigoOp={opAtual.codigo_op}
          produtoNome={opAtual.produto?.nome || 'Produto'}
          quantidade={opAtual.quantidade}
          onClose={() => {
            setModalQualidadeAberto(false);
            setEtapaAcao(null);
          }}
          onConfirm={handleConfirmarQualidade}
        />
      )}

      <CostVarianceReportModal
        isOpen={modalRelatorioAberto}
        op={opAtual}
        taxaHorariaMO={taxaHorariaMO}
        onClose={() => setModalRelatorioAberto(false)}
      />
    </div>
  );
};
