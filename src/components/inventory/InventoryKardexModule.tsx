import React, { useState } from 'react';
import { useLeanSystem } from '../../context/LeanSystemContext';
import { formatarMoeda } from '../../lib/leanPricingEngine';
import { 
  Boxes, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  PlusCircle, 
  Search, 
  Filter, 
  History, 
  Package, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { TipoItemEstoque, TipoMovimentoEstoque } from '../../types/database';

export const InventoryKardexModule: React.FC = () => {
  const { 
    insumos, 
    produtos, 
    kardex, 
    registrarMovimentacaoManual 
  } = useLeanSystem();

  const [abaEstoque, setAbaEstoque] = useState<'insumos' | 'acabados' | 'kardex'>('insumos');
  const [busca, setBusca] = useState('');
  const [modalEntradaAberto, setModalEntradaAberto] = useState(false);

  // Form de entrada manual
  const [tipoItem, setTipoItem] = useState<TipoItemEstoque>('INSUMO');
  const [itemId, setItemId] = useState(insumos[0]?.id || '');
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentoEstoque>('ENTRADA');
  const [quantidade, setQuantidade] = useState<number>(10);
  const [motivo, setMotivo] = useState('Recebimento Fornecedor / NF');
  const [operador, setOperador] = useState('Almoxarifado Di Linhas');

  // Filtros
  const insumosFiltrados = insumos.filter((i) =>
    i.nome.toLowerCase().includes(busca.toLowerCase()) ||
    i.sku.toLowerCase().includes(busca.toLowerCase()) ||
    (i.categoria && i.categoria.toLowerCase().includes(busca.toLowerCase()))
  );

  const produtosFiltrados = produtos.filter((p) =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.sku.toLowerCase().includes(busca.toLowerCase()) ||
    p.categoria.toLowerCase().includes(busca.toLowerCase())
  );

  const kardexFiltrado = kardex.filter((k) =>
    k.item_nome.toLowerCase().includes(busca.toLowerCase()) ||
    k.motivo.toLowerCase().includes(busca.toLowerCase()) ||
    (k.operador && k.operador.toLowerCase().includes(busca.toLowerCase()))
  );

  const handleSalvarMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemId || quantidade <= 0) return;

    await registrarMovimentacaoManual(
      tipoItem,
      itemId,
      tipoMovimento,
      quantidade,
      motivo,
      operador
    );

    setModalEntradaAberto(false);
    setQuantidade(10);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner do Almoxarifado Enxuto */}
      <div className="bg-white p-6 rounded-3xl border border-[#B85324]/20 shadow-soft-warm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#FAF6EE] text-[#B85324] rounded-xl">
              <Boxes className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B85324]">
              Gestão de Materiais & WMS Enxuto
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#4A2013] mt-1">
            Controle de Estoque & Kardex Visual (JIT)
          </h2>
          <p className="text-xs text-[#4A2013]/70 mt-0.5">
            Baixas automáticas sincronizadas no início da OP e entradas imediatas na aprovação de qualidade.
          </p>
        </div>

        <button
          onClick={() => setModalEntradaAberto(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Lançamento Manual no Kardex</span>
        </button>
      </div>

      {/* Navegação entre Insumos, Produtos Acabados e Kardex */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 bg-[#FAF6EE] p-1.5 rounded-2xl border border-[#B85324]/15">
          <button
            onClick={() => setAbaEstoque('insumos')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              abaEstoque === 'insumos'
                ? 'bg-[#4A2013] text-white shadow-sm'
                : 'text-[#4A2013] hover:text-[#B85324]'
            }`}
          >
            Insumos & Componentes ({insumos.length})
          </button>
          <button
            onClick={() => setAbaEstoque('acabados')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              abaEstoque === 'acabados'
                ? 'bg-[#4A2013] text-white shadow-sm'
                : 'text-[#4A2013] hover:text-[#B85324]'
            }`}
          >
            Produtos Acabados ({produtos.length})
          </button>
          <button
            onClick={() => setAbaEstoque('kardex')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              abaEstoque === 'kardex'
                ? 'bg-[#4A2013] text-white shadow-sm'
                : 'text-[#4A2013] hover:text-[#B85324]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Kardex Visual ({kardex.length})</span>
          </button>
        </div>

        {/* Campo de Busca Rápida */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#4A2013]/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por SKU, nome..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 focus:outline-none focus:border-[#B85324]"
          />
        </div>
      </div>

      {/* ABA 1: INSUMOS */}
      {abaEstoque === 'insumos' && (
        <div className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#FAF6EE] text-[#4A2013]/70 uppercase tracking-wider text-[10px] border-b border-[#4A2013]/10">
                  <th className="py-3 px-4 font-bold">SKU</th>
                  <th className="py-3 px-4 font-bold">Insumo / Matéria-Prima</th>
                  <th className="py-3 px-4 font-bold">Categoria</th>
                  <th className="py-3 px-4 font-bold">Custo Unitário</th>
                  <th className="py-3 px-4 font-bold">Saldo Atual</th>
                  <th className="py-3 px-4 font-bold">Estoque Mínimo</th>
                  <th className="py-3 px-4 font-bold">Status Lean</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4A2013]/5">
                {insumosFiltrados.map((item) => {
                  const saldoCritico = item.saldo_atual <= item.estoque_minimo;
                  return (
                    <tr key={item.id} className="hover:bg-[#FAF6EE]/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#4A2013]/70">
                        {item.sku}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-sm font-bold text-[#4A2013] block">
                          {item.nome}
                        </strong>
                        <span className="text-[10px] text-[#4A2013]/60">
                          Fornecedor: {item.fornecedor || 'Diversos'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#4A2013]/80">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF6EE] border border-[#4A2013]/10">
                          {item.categoria || 'Geral'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-[#4A2013]">
                        {formatarMoeda(item.custo_unitario)} / {item.unidade_medida}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm text-[#4A2013]">
                        {item.saldo_atual} {item.unidade_medida}
                      </td>
                      <td className="py-3 px-4 font-mono text-[#4A2013]/60">
                        {item.estoque_minimo} {item.unidade_medida}
                      </td>
                      <td className="py-3 px-4">
                        {saldoCritico ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEE2E2] text-[#991B1B] border border-[#991B1B]/20">
                            <AlertTriangle className="w-3 h-3" />
                            <span>Ponto de Pedido</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8F5EE] text-[#2D7A4C] border border-[#2D7A4C]/20">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Normal</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 2: PRODUTOS ACABADOS */}
      {abaEstoque === 'acabados' && (
        <div className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-[#FAF6EE] text-[#4A2013]/70 uppercase tracking-wider text-[10px] border-b border-[#4A2013]/10">
                  <th className="py-3 px-4 font-bold">SKU</th>
                  <th className="py-3 px-4 font-bold">Produto Acabado</th>
                  <th className="py-3 px-4 font-bold">Categoria</th>
                  <th className="py-3 px-4 font-bold">Tempo Padrão</th>
                  <th className="py-3 px-4 font-bold">Margem Alvo</th>
                  <th className="py-3 px-4 font-bold">Preço de Venda</th>
                  <th className="py-3 px-4 font-bold">Pronta Entrega</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4A2013]/5">
                {produtosFiltrados.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAF6EE]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-[#4A2013]/70">
                      {prod.sku}
                    </td>
                    <td className="py-3 px-4">
                      <strong className="text-sm font-bold text-[#4A2013] block">
                        {prod.nome}
                      </strong>
                      <span className="text-[10px] text-[#4A2013]/60 line-clamp-1">
                        {prod.descricao || 'Sem descrição'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-[#FAF6EE] border border-[#4A2013]/10 font-semibold text-[#4A2013]">
                        {prod.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#4A2013]">
                      {prod.tempo_padrao_total} min
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-[#2D7A4C]">
                      {prod.margem_alvo}%
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-sm text-[#B85324]">
                      {formatarMoeda(prod.preco_venda || 0)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-xl bg-[#E8F5EE] border border-[#2D7A4C]/30 text-[#2D7A4C] font-mono font-extrabold text-sm">
                        {prod.saldo_estoque || 0} peças
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ABA 3: KARDEX VISUAL COMPLETO */}
      {abaEstoque === 'kardex' && (
        <div className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm overflow-hidden">
          <div className="p-4 bg-[#FAF6EE] border-b border-[#4A2013]/10 flex items-center justify-between text-xs font-semibold text-[#4A2013]">
            <span>Histórico de Auditoria & Rastreabilidade de Movimentações</span>
            <span className="text-[10px] text-[#4A2013]/60 font-mono">
              Registrado via Triggers & Regras JIT
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#4A2013]/10 text-[#4A2013]/60 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 font-bold">Tipo</th>
                  <th className="py-3 px-4 font-bold">Item Movimentado</th>
                  <th className="py-3 px-4 font-bold">Quantidade</th>
                  <th className="py-3 px-4 font-bold">Motivo & Rastreabilidade</th>
                  <th className="py-3 px-4 font-bold">Responsável</th>
                  <th className="py-3 px-4 font-bold text-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4A2013]/5">
                {kardexFiltrado.map((mov) => {
                  const isEntrada = mov.tipo_movimento === 'ENTRADA';
                  return (
                    <tr key={mov.id} className="hover:bg-[#FAF6EE]/30">
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                            isEntrada
                              ? 'bg-[#E8F5EE] text-[#2D7A4C] border border-[#2D7A4C]/20'
                              : 'bg-[#FEE2E2] text-[#991B1B] border border-[#991B1B]/20'
                          }`}
                        >
                          {isEntrada ? (
                            <ArrowDownLeft className="w-3 h-3" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3" />
                          )}
                          <span>{mov.tipo_movimento}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <strong className="text-sm font-bold text-[#4A2013] block">
                          {mov.item_nome}
                        </strong>
                        <span className="text-[10px] text-[#B85324] font-semibold">
                          {mov.item_tipo.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-black text-sm">
                        <span className={isEntrada ? 'text-[#2D7A4C]' : 'text-[#991B1B]'}>
                          {isEntrada ? `+${mov.quantidade}` : `-${mov.quantidade}`}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#4A2013]">
                        <div>{mov.motivo}</div>
                      </td>
                      <td className="py-3 px-4 text-[#4A2013]/70 font-medium">
                        {mov.operador || 'Sistema MES'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-[#4A2013]/60">
                        {new Date(mov.criado_em).toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Lançamento Manual no Kardex */}
      {modalEntradaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#4A2013] mb-4">
              Lançamento Manual no Kardex
            </h3>
            <form onSubmit={handleSalvarMovimentacao} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                  Tipo de Item
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoItem('INSUMO');
                      setItemId(insumos[0]?.id || '');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      tipoItem === 'INSUMO'
                        ? 'bg-[#B85324] text-white border-[#B85324]'
                        : 'bg-white text-[#4A2013] border-[#4A2013]/20'
                    }`}
                  >
                    Insumo / Matéria-Prima
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setTipoItem('PRODUTO_ACABADO');
                      setItemId(produtos[0]?.id || '');
                    }}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      tipoItem === 'PRODUTO_ACABADO'
                        ? 'bg-[#B85324] text-white border-[#B85324]'
                        : 'bg-white text-[#4A2013] border-[#4A2013]/20'
                    }`}
                  >
                    Produto Acabado
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                  Selecionar Item
                </label>
                <select
                  value={itemId}
                  onChange={(e) => setItemId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                >
                  {tipoItem === 'INSUMO'
                    ? insumos.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.nome} (Saldo: {i.saldo_atual} {i.unidade_medida})
                        </option>
                      ))
                    : produtos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nome} (Saldo: {p.saldo_estoque} un)
                        </option>
                      ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                    Operação
                  </label>
                  <select
                    value={tipoMovimento}
                    onChange={(e) => setTipoMovimento(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                  >
                    <option value="ENTRADA">ENTRADA (+)</option>
                    <option value="SAIDA">SAÍDA (-)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                    Quantidade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                  Motivo da Movimentação
                </label>
                <input
                  type="text"
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Ex: Recebimento de rolo NF 4392..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">
                  Operador Responsável
                </label>
                <input
                  type="text"
                  value={operador}
                  onChange={(e) => setOperador(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalEntradaAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B85324] text-white text-xs font-bold hover:bg-[#9A421A]"
                >
                  Confirmar Movimentação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
