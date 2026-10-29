import React, { useState } from 'react';
import { useLeanSystem } from '../../context/LeanSystemContext';
import { formatarMoeda, formatarSegundos } from '../../lib/leanPricingEngine';
import { 
  Layers, 
  PlusCircle, 
  Play, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  Filter,
  User,
  PackageCheck
} from 'lucide-react';
import { StatusOP } from '../../types/database';

interface OrdersManagementProps {
  onIrParaChaoDeFabrica: () => void;
}

export const OrdersManagementModule: React.FC<OrdersManagementProps> = ({
  onIrParaChaoDeFabrica,
}) => {
  const { 
    ordensProducao, 
    produtos, 
    taxaHorariaMO, 
    criarOrdemProducao, 
    cancelarOrdemProducao 
  } = useLeanSystem();

  const [modalNovaOp, setModalNovaOp] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODAS');

  // Form Nova OP
  const [produtoId, setProdutoId] = useState(produtos[0]?.id || '');
  const [quantidade, setQuantidade] = useState<number>(5);
  const [operador, setOperador] = useState('Juliana Silva');
  const [criando, setCriando] = useState(false);

  const produtoSelecionado = produtos.find((p) => p.id === produtoId) || produtos[0];

  const opsFiltradas = ordensProducao.filter((op) => {
    if (filtroStatus === 'TODAS') return true;
    return op.status === filtroStatus;
  });

  const handleCriarOp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!produtoId || quantidade <= 0) return;
    setCriando(true);
    try {
      await criarOrdemProducao(produtoId, quantidade, operador);
      setModalNovaOp(false);
      setQuantidade(5);
    } finally {
      setCriando(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner de Ordens de Produção */}
      <div className="bg-white p-6 rounded-3xl border border-[#B85324]/20 shadow-soft-warm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#FAF6EE] text-[#B85324] rounded-xl">
              <Layers className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B85324]">
              PCP & Programação Enxuta
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#4A2013] mt-1">
            Gestão de Ordens de Produção (OPs)
          </h2>
          <p className="text-xs text-[#4A2013]/70 mt-0.5">
            Fluxo unificado em 4 etapas padronizadas com rastreabilidade completa de tempo e custo.
          </p>
        </div>

        <button
          onClick={() => setModalNovaOp(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Criar Nova OP</span>
        </button>
      </div>

      {/* Filtros por Status */}
      <div className="flex flex-wrap items-center gap-2">
        {['TODAS', 'EM_PRODUCAO', 'CRIADA', 'PAUSADA', 'CONCLUIDA'].map((st) => (
          <button
            key={st}
            onClick={() => setFiltroStatus(st)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              filtroStatus === st
                ? 'bg-[#4A2013] text-white border-[#4A2013] shadow-sm'
                : 'bg-white text-[#4A2013] border-[#4A2013]/15 hover:border-[#B85324]'
            }`}
          >
            {st === 'TODAS'
              ? 'Todas as OPs'
              : st === 'EM_PRODUCAO'
              ? 'Em Produção'
              : st === 'CRIADA'
              ? 'Aguardando Início'
              : st === 'PAUSADA'
              ? 'Pausadas (Andon)'
              : 'Concluídas'}
          </button>
        ))}
      </div>

      {/* Grid de Cards de OPs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {opsFiltradas.map((op) => {
          const etapasConcluidas = (op.etapas || []).filter((e) => e.status === 'CONCLUIDA').length;
          const progressoPercent = Math.round((etapasConcluidas / 4) * 100);

          return (
            <div
              key={op.id}
              className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm p-6 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#4A2013]/10">
                  <span className="font-mono font-bold text-sm text-[#B85324]">
                    {op.codigo_op}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      op.status === 'EM_PRODUCAO'
                        ? 'bg-amber-100 text-[#D97706]'
                        : op.status === 'CONCLUIDA'
                        ? 'bg-emerald-100 text-[#2D7A4C]'
                        : op.status === 'PAUSADA'
                        ? 'bg-red-100 text-[#991B1B]'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {op.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-4">
                  <h3 className="text-base font-bold text-[#4A2013]">
                    {op.produto?.nome || 'Modelo'}
                  </h3>
                  <span className="text-xs text-[#4A2013]/60">
                    Lote de fabricação: <strong>{op.quantidade} unidades</strong>
                  </span>
                </div>

                {/* Barra de Progresso das 4 Etapas */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#4A2013] mb-1.5">
                    <span>Etapa Atual: <strong className="text-[#B85324]">{op.etapa_atual}</strong></span>
                    <span className="font-mono">{progressoPercent}%</span>
                  </div>
                  <div className="w-full bg-[#FAF6EE] h-2.5 rounded-full overflow-hidden border border-[#4A2013]/10">
                    <div
                      className="bg-gradient-to-r from-[#B85324] to-[#2D7A4C] h-full transition-all duration-300"
                      style={{ width: `${progressoPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Mini Esteira das 4 Etapas */}
                <div className="mt-4 grid grid-cols-4 gap-1">
                  {(op.etapas || []).map((et) => (
                    <div
                      key={et.id}
                      className={`text-[9px] p-1.5 rounded-lg text-center font-bold border ${
                        et.status === 'CONCLUIDA'
                          ? 'bg-[#E8F5EE] border-[#2D7A4C] text-[#2D7A4C]'
                          : et.status === 'EM_ANDAMENTO'
                          ? 'bg-[#FEF3C7] border-[#D97706] text-[#D97706]'
                          : 'bg-[#FAF6EE] border-[#4A2013]/10 text-[#4A2013]/40'
                      }`}
                    >
                      {et.etapa_nome.split(' ')[0]}
                    </div>
                  ))}
                </div>

                {/* Métricas de Tempo e MO */}
                <div className="mt-5 pt-3 border-t border-[#4A2013]/10 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-[#4A2013]/60 block">Tempo Líquido:</span>
                    <strong className="font-mono text-[#4A2013]">
                      {formatarSegundos(op.tempo_total_real || 0)}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#4A2013]/60 block">MO Realizada:</span>
                    <strong className="font-mono text-[#B85324]">
                      {formatarMoeda(op.custo_mo_real || 0)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Botão de Chão de Fábrica */}
              <div className="mt-6 pt-3 border-t border-[#4A2013]/10 flex items-center justify-between">
                <span className="text-[10px] text-[#4A2013]/60 flex items-center gap-1">
                  <User className="w-3 h-3 text-[#B85324]" />
                  <span>{op.operador_responsavel || 'Equipe Geral'}</span>
                </span>

                <button
                  onClick={onIrParaChaoDeFabrica}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Bancada MES</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Criar Nova OP */}
      {modalNovaOp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#4A2013] mb-4">
              Emitir Nova Ordem de Produção (Lean MES)
            </h3>
            <form onSubmit={handleCriarOp} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                  Selecionar Produto Acabado
                </label>
                <select
                  value={produtoId}
                  onChange={(e) => setProdutoId(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-bold"
                >
                  {produtos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({p.sku}) — Tempo Padrão: {p.tempo_padrao_total} min
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                    Quantidade a Fabricar (un)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                    Operador Responsável
                  </label>
                  <input
                    type="text"
                    required
                    value={operador}
                    onChange={(e) => setOperador(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-semibold"
                  />
                </div>
              </div>

              {/* Prévia Lean */}
              {produtoSelecionado && (
                <div className="p-4 rounded-2xl bg-white border border-[#B85324]/20 space-y-2 text-xs">
                  <span className="font-bold text-[#4A2013] block">
                    Prévia de Mão de Obra e Cronograma:
                  </span>
                  <div className="flex justify-between text-[#4A2013]/70">
                    <span>Tempo Total Previsto:</span>
                    <strong className="font-mono text-[#4A2013]">
                      {((produtoSelecionado.tempo_padrao_total * quantidade) / 60).toFixed(1)} horas ({produtoSelecionado.tempo_padrao_total * quantidade} min)
                    </strong>
                  </div>
                  <div className="flex justify-between text-[#4A2013]/70">
                    <span>Custo Estimado M.O.:</span>
                    <strong className="font-mono text-[#B85324]">
                      {formatarMoeda(((produtoSelecionado.tempo_padrao_total * quantidade) / 60) * taxaHorariaMO)}
                    </strong>
                  </div>
                  <p className="text-[10px] text-[#2D7A4C] pt-1">
                    ⚡ Ao iniciar a OP, a baixa de matérias-primas ocorrerá de forma automática (Just-in-Time).
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setModalNovaOp(false)}
                  className="px-4 py-2 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={criando}
                  className="px-5 py-2 rounded-xl bg-[#B85324] text-white text-xs font-bold hover:bg-[#9A421A] cursor-pointer"
                >
                  {criando ? 'Emitindo OP...' : 'Confirmar & Liberar Linha'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
