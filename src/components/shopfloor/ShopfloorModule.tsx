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
  Package,
  Ruler,
  Info,
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
    operadores,
    iniciarEtapa, 
    pausarEtapa, 
    retomarEtapa, 
    concluirEtapa, 
    salvarNotasKaizen 
  } = useLeanSystem();

  const opsAtivas = useMemo(() => {
    return ordensProducao.filter((op) => op.status !== 'CANCELADA');
  }, [ordensProducao]);

  const [opSelecionadaId, setOpSelecionadaId] = useState<string>(() => {
    const ativa = ordensProducao.find((o) => o.status === 'EM_PRODUCAO');
    return ativa?.id || ordensProducao[0]?.id || '';
  });

  const opAtual = useMemo(() => {
    return ordensProducao.find((o) => o.id === opSelecionadaId) || ordensProducao[0];
  }, [ordensProducao, opSelecionadaId]);

  // Operador atual selecionado (inicializa com o primeiro operador cadastrado)
  const [operadorSelecionadoId, setOperadorSelecionadoId] = useState<string>(() => {
    return operadores[0]?.id || '';
  });

  const operadorAtual = useMemo(() => {
    return operadores.find(o => o.id === operadorSelecionadoId) || operadores[0];
  }, [operadores, operadorSelecionadoId]);

  const [operadorNomeCustom, setOperadorNomeCustom] = useState<string>(() => {
    return operadorAtual?.nome || 'Operador da Linha';
  });

  const nomeOperadorEfetivo = operadorAtual?.nome || operadorNomeCustom;

  // Modais de apoio
  const [modalPausaAberto, setModalPausaAberto] = useState(false);
  const [modalQualidadeAberto, setModalQualidadeAberto] = useState(false);
  const [modalRelatorioAberto, setModalRelatorioAberto] = useState(false);
  const [etapaAcao, setEtapaAcao] = useState<OpEtapa | null>(null);

  const [kaizenTexto, setKaizenTexto] = useState(opAtual?.notas_kaizen || '');

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

  const etapaEmAndamento = opAtual.etapas?.find((e) => e.status === 'EM_ANDAMENTO' || e.status === 'PAUSADA');
  const etapaAtiva = etapaEmAndamento || opAtual.etapas?.find((e) => e.status === 'PENDENTE') || opAtual.etapas?.[0];

  const analiseAndon = etapaAtiva
    ? analisarDesvioEtapa(
        etapaAtiva.tempo_padrao_min,
        etapaAtiva.tempo_real_segundos,
        taxaHorariaMO,
        opAtual.quantidade
      )
    : null;

  const handleIniciarOuRetomar = () => {
    if (!etapaAtiva) return;
    if (etapaAtiva.status === 'PAUSADA') {
      retomarEtapa(opAtual.id, etapaAtiva.id);
    } else {
      iniciarEtapa(opAtual.id, etapaAtiva.id, nomeOperadorEfetivo, operadorAtual?.id);
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
      {/* Barra de Seleção de OP & Seletor Visual de Operadores */}
      <div className="bg-white p-4 rounded-3xl border border-[#B85324]/20 shadow-soft-warm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#FAF6EE] border border-[#B85324]/30 rounded-2xl text-[#B85324]">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-[#4A2013]/60 uppercase tracking-wider block">
              Ordem de Produção Ativa
            </span>
            <select
              value={opAtual.id}
              onChange={(e) => setOpSelecionadaId(e.target.value)}
              className="font-bold text-base sm:text-lg text-[#4A2013] bg-transparent focus:outline-none cursor-pointer pr-4"
            >
              {opsAtivas.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.codigo_op} — {o.quantidade}x {o.produto?.nome} ({o.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Seletor Visual de Operador Touch */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-[#4A2013]/60 uppercase tracking-wider hidden sm:inline">
            Operador no Posto:
          </span>
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#FAF6EE] border border-[#B85324]/15">
            {operadores.map((op) => {
              const isSelected = op.id === operadorAtual?.id;
              return (
                <button
                  key={op.id}
                  onClick={() => {
                    setOperadorSelecionadoId(op.id);
                    setOperadorNomeCustom(op.nome);
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#B85324] text-white shadow-sm scale-102'
                      : 'text-[#4A2013] hover:bg-white'
                  }`}
                  title={`${op.nome} (${op.especialidade})`}
                >
                  {op.foto_url ? (
                    <img src={op.foto_url} alt={op.nome} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                  <span>{op.apelido}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Botão de Relatório de Custos */}
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
        {(opAtual.etapas || []).map((etapa) => {
          const isConcluida = etapa.status === 'CONCLUIDA';
          const isAndamento = etapa.status === 'EM_ANDAMENTO';
          const isPausada = etapa.status === 'PAUSADA';

          const tempoPadraoEtapaSeg = Math.round((etapa.tempo_padrao_min * 60) * opAtual.quantidade);
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

      {/* Painel Operacional Touch Principal com FOTO DO MODELO */}
      <div className="bg-white rounded-3xl border-2 border-[#B85324]/30 shadow-elevated-warm p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pb-6 border-b border-[#4A2013]/10">
          {/* Foto da Peça em Destaque Visual */}
          <div className="lg:col-span-3 flex sm:flex-row lg:flex-col items-center gap-4">
            <div className="w-32 h-32 lg:w-full lg:h-44 rounded-2xl overflow-hidden border-2 border-[#B85324]/30 shadow-sm bg-[#FAF6EE] shrink-0">
              {opAtual.produto?.imagem_url ? (
                <img
                  src={opAtual.produto.imagem_url}
                  alt={opAtual.produto.nome}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#4A2013]/40">
                  <Package className="w-10 h-10 mb-1" />
                  <span className="text-[10px]">Sem foto</span>
                </div>
              )}
            </div>

            <div className="text-left lg:text-center">
              <span className="font-mono text-xs font-bold text-[#B85324] block">{opAtual.produto?.sku}</span>
              <strong className="text-sm font-black text-[#4A2013] block line-clamp-1">{opAtual.produto?.nome}</strong>
              <span className="text-xs text-[#4A2013]/70">Lote: <strong>{opAtual.quantidade} peças</strong></span>
              {opAtual.produto?.dimensoes && (
                <span className="text-[10px] text-[#4A2013]/60 block mt-0.5">
                  {opAtual.produto.dimensoes.largura_cm}×{opAtual.produto.dimensoes.altura_cm}×{opAtual.produto.dimensoes.profundidade_cm} cm
                </span>
              )}
            </div>
          </div>

          {/* Etapa Atual & Alerta Andon */}
          <div className="lg:col-span-9 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="px-3 py-1 rounded-xl bg-[#F9E8B8] text-[#4A2013] font-black text-xs uppercase tracking-wider">
                  Posto de Trabalho Touch
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#4A2013] mt-1.5">
                  {etapaAtiva?.etapa_nome || 'Selecione uma etapa'}
                </h2>
                <span className="text-xs text-[#4A2013]/70 block mt-0.5">
                  Operador responsável: <strong className="text-[#B85324]">{nomeOperadorEfetivo}</strong>
                </span>
              </div>

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
                    <span className="text-[10px] font-black uppercase tracking-wider block">
                      Andon: {analiseAndon.status.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-semibold">{analiseAndon.mensagem}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Instruções Técnicas de Costura */}
            {opAtual.produto?.instrucoes_costura && (
              <div className="p-3 rounded-2xl bg-[#FAF6EE] border border-[#B85324]/20 flex items-start gap-2 text-xs text-[#4A2013]">
                <Info className="w-4 h-4 text-[#B85324] shrink-0 mt-0.5" />
                <span>
                  <strong>Atenção Técnica:</strong> {opAtual.produto.instrucoes_costura}
                </span>
              </div>
            )}
          </div>
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

        {/* Anotações Kaizen */}
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

      {/* Modais */}
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
