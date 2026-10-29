import React, { useState, useMemo } from 'react';
import { useLeanSystem } from '../../context/LeanSystemContext';
import { 
  formatarMoeda, 
  calcularPrecificacaoProduto 
} from '../../lib/leanPricingEngine';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Save, 
  Clock, 
  Percent, 
  DollarSign, 
  Layers, 
  HelpCircle,
  PackagePlus,
  Sliders
} from 'lucide-react';
import { FichaTecnicaItemComInsumo, NomeEtapa } from '../../types/database';

export const PricingBOMModule: React.FC = () => {
  const { 
    produtos, 
    insumos, 
    fichasTecnicas, 
    taxaHorariaMO, 
    configCustos, 
    salvarFichaTecnica,
    criarProduto 
  } = useLeanSystem();

  // Produto selecionado
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState<string>(
    produtos[0]?.id || ''
  );

  const produtoAtual = useMemo(() => {
    return produtos.find((p) => p.id === produtoSelecionadoId) || produtos[0];
  }, [produtos, produtoSelecionadoId]);

  // Itens da ficha técnica em edição
  const [itensEdicao, setItensEdicao] = useState<FichaTecnicaItemComInsumo[]>([]);
  const [margemAlvoLocal, setMargemAlvoLocal] = useState<number>(38);
  const [tempoPadraoLocal, setTempoPadraoLocal] = useState<number>(60);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState('');

  // Modal para criar novo produto
  const [modalNovoProduto, setModalNovoProduto] = useState(false);
  const [novoSku, setNovoSku] = useState('');
  const [novoNome, setNovoNome] = useState('');
  const [novaCategoria, setNovaCategoria] = useState<'Bolsas' | 'Mochilas' | 'Carteiras' | 'Acessórios'>('Bolsas');
  const [novaDescricao, setNovaDescricao] = useState('');

  // Insumo a ser adicionado
  const [insumoSelecionadoId, setInsumoSelecionadoId] = useState(insumos[0]?.id || '');
  const [novoConsumo, setNovoConsumo] = useState<number>(0.5);
  const [novaPerda, setNovaPerda] = useState<number>(5);
  const [novaEtapa, setNovaEtapa] = useState<NomeEtapa>('Corte');

  // Sincronizar itens quando o produto selecionado mudar
  React.useEffect(() => {
    if (produtoAtual) {
      const itens = fichasTecnicas[produtoAtual.id] || produtoAtual.itens_ficha || [];
      // Garantir que cada item tenha o objeto insumo populado
      const itensCompletos = itens.map((item) => {
        const insObj = insumos.find((i) => i.id === item.insumo_id) || item.insumo;
        return {
          ...item,
          insumo: insObj,
        };
      });
      setItensEdicao(itensCompletos);
      setMargemAlvoLocal(produtoAtual.margem_alvo || 38);
      setTempoPadraoLocal(produtoAtual.tempo_padrao_total || 60);
    }
  }, [produtoAtual?.id, fichasTecnicas, insumos]);

  // Cálculo Dinâmico em Tempo Real
  const calculo = useMemo(() => {
    if (!produtoAtual) return null;
    return calcularPrecificacaoProduto(
      {
        tempo_padrao_total: tempoPadraoLocal,
        margem_alvo: margemAlvoLocal,
      },
      itensEdicao,
      taxaHorariaMO,
      configCustos.taxa_operacional_fixa_unidade || 9.5
    );
  }, [produtoAtual, tempoPadraoLocal, margemAlvoLocal, itensEdicao, taxaHorariaMO, configCustos]);

  // Adicionar insumo à ficha
  const handleAdicionarInsumo = () => {
    const insumoObj = insumos.find((i) => i.id === insumoSelecionadoId);
    if (!insumoObj || !produtoAtual) return;

    // Verificar se já existe na ficha
    if (itensEdicao.some((item) => item.insumo_id === insumoSelecionadoId)) {
      alert('Este insumo já foi adicionado na Ficha Técnica.');
      return;
    }

    const novoItem: FichaTecnicaItemComInsumo = {
      id: `f-${Date.now()}`,
      produto_id: produtoAtual.id,
      insumo_id: insumoObj.id,
      quantidade_consumo: Number(novoConsumo),
      percentual_perda: Number(novaPerda),
      etapa_consumo: novaEtapa,
      insumo: insumoObj,
    };

    setItensEdicao((prev) => [...prev, novoItem]);
  };

  const handleRemoverItem = (itemId: string) => {
    setItensEdicao((prev) => prev.filter((i) => i.id !== itemId));
  };

  const handleAtualizarItem = (itemId: string, campo: 'quantidade_consumo' | 'percentual_perda', valor: number) => {
    setItensEdicao((prev) =>
      prev.map((it) => (it.id === itemId ? { ...it, [campo]: valor } : it))
    );
  };

  const handleSalvarFicha = async () => {
    if (!produtoAtual) return;
    setSalvando(true);
    try {
      await salvarFichaTecnica(produtoAtual.id, itensEdicao);
      setMensagemSucesso('Ficha Técnica e Precificação salvas com sucesso!');
      setTimeout(() => setMensagemSucesso(''), 3000);
    } finally {
      setSalvando(false);
    }
  };

  const handleCriarNovoProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novoNome || !novoSku) return;

    await criarProduto(
      {
        sku: novoSku,
        nome: novoNome,
        categoria: novaCategoria,
        descricao: novaDescricao,
        preco_venda: 0,
        margem_alvo: 38,
        tempo_padrao_total: 60,
        saldo_estoque: 0,
      },
      []
    );

    setModalNovoProduto(false);
    setNovoNome('');
    setNovoSku('');
    setNovaDescricao('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Cabeçalho do Módulo de Precificação */}
      <div className="bg-white p-6 rounded-3xl border border-[#B85324]/20 shadow-soft-warm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#FAF6EE] text-[#B85324] rounded-xl">
              <Calculator className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B85324]">
              Engenharia Enxuta de Produto & BOM
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#4A2013] mt-1">
            Ficha Técnica & Precificação Dinâmica
          </h2>
          <p className="text-xs text-[#4A2013]/70 mt-0.5">
            Composição científica de custos baseada em absorção de despesas, tempos padrão e perdas técnicas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalNovoProduto(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#FAF6EE] border border-[#B85324]/30 text-[#4A2013] hover:bg-[#F9E8B8]/40 text-xs font-bold transition-all cursor-pointer"
          >
            <PackagePlus className="w-4 h-4 text-[#B85324]" />
            <span>Novo Modelo Di' Linhas</span>
          </button>

          <button
            onClick={handleSalvarFicha}
            disabled={salvando}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{salvando ? 'Salvando...' : 'Salvar Ficha'}</span>
          </button>
        </div>
      </div>

      {mensagemSucesso && (
        <div className="p-3 bg-[#E8F5EE] border border-[#2D7A4C] text-[#2D7A4C] text-xs font-bold rounded-2xl text-center">
          {mensagemSucesso}
        </div>
      )}

      {/* Seleção do Produto */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {produtos.map((p) => {
          const isSelected = p.id === produtoAtual?.id;
          return (
            <button
              key={p.id}
              onClick={() => setProdutoSelecionadoId(p.id)}
              className={`px-5 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-[#4A2013] text-white border-[#4A2013] shadow-md scale-102'
                  : 'bg-white text-[#4A2013] border-[#4A2013]/10 hover:border-[#B85324]'
              }`}
            >
              <span className="block">{p.nome}</span>
              <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-[#F9E8B8]' : 'text-[#4A2013]/60'}`}>
                {p.sku} • {p.categoria}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid Principal: Breakdown Financeiro (Bento) + Tabela de Insumos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Ficha Técnica (BOM) & Insumos (7 Colunas) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm p-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/10">
              <div>
                <h3 className="text-lg font-bold text-[#4A2013]">
                  Lista de Materiais (Bill of Materials)
                </h3>
                <span className="text-xs text-[#4A2013]/60">
                  {itensEdicao.length} insumos alocados na engenharia desta peça
                </span>
              </div>
            </div>

            {/* Adicionar Novo Insumo na Ficha */}
            <div className="mt-4 p-4 rounded-2xl bg-[#FAF6EE] border border-[#B85324]/20 space-y-3">
              <span className="text-xs font-bold text-[#4A2013] block">
                + Adicionar Insumo à Ficha Técnica
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                <div className="sm:col-span-2">
                  <label className="text-[10px] font-semibold text-[#4A2013]/70 block mb-1">Insumo</label>
                  <select
                    value={insumoSelecionadoId}
                    onChange={(e) => setInsumoSelecionadoId(e.target.value)}
                    className="w-full text-xs font-medium p-2 rounded-xl bg-white border border-[#4A2013]/20 focus:outline-none"
                  >
                    {insumos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome} ({formatarMoeda(i.custo_unitario)}/{i.unidade_medida})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#4A2013]/70 block mb-1">Consumo</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.001"
                    value={novoConsumo}
                    onChange={(e) => setNovoConsumo(Number(e.target.value))}
                    className="w-full text-xs font-medium p-2 rounded-xl bg-white border border-[#4A2013]/20"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-[#4A2013]/70 block mb-1">Perda (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="50"
                    value={novaPerda}
                    onChange={(e) => setNovaPerda(Number(e.target.value))}
                    className="w-full text-xs font-medium p-2 rounded-xl bg-white border border-[#4A2013]/20"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-[#4A2013]/70">Etapa de Consumo:</span>
                  <select
                    value={novaEtapa}
                    onChange={(e) => setNovaEtapa(e.target.value as NomeEtapa)}
                    className="text-xs p-1 rounded-lg bg-white border border-[#4A2013]/20"
                  >
                    <option value="Corte">Corte</option>
                    <option value="Costura">Costura</option>
                    <option value="Montagem">Montagem</option>
                    <option value="Acabamento e Controle de Qualidade">Acabamento</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleAdicionarInsumo}
                  className="px-4 py-1.5 rounded-xl bg-[#4A2013] text-white text-xs font-bold hover:bg-[#32150C] flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Incluir</span>
                </button>
              </div>
            </div>

            {/* Tabela de Insumos da Ficha Técnica */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#4A2013]/10 text-[#4A2013]/60 uppercase tracking-wider text-[10px]">
                    <th className="py-2.5 font-bold">Insumo</th>
                    <th className="py-2.5 font-bold">Consumo</th>
                    <th className="py-2.5 font-bold">Perda (%)</th>
                    <th className="py-2.5 font-bold">Custo Un.</th>
                    <th className="py-2.5 font-bold text-right">Subtotal</th>
                    <th className="py-2.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4A2013]/5">
                  {itensEdicao.map((item) => {
                    const insumoObj = insumos.find((i) => i.id === item.insumo_id) || item.insumo;
                    const custoUn = insumoObj?.custo_unitario || 0;
                    const consumoComPerda = item.quantidade_consumo * (1 + item.percentual_perda / 100);
                    const subtotal = consumoComPerda * custoUn;

                    return (
                      <tr key={item.id} className="hover:bg-[#FAF6EE]/50">
                        <td className="py-3 font-semibold text-[#4A2013]">
                          <div>{insumoObj?.nome || 'Insumo'}</div>
                          <span className="text-[10px] text-[#B85324] font-medium">
                            Etapa: {item.etapa_consumo || 'Corte'}
                          </span>
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            step="0.01"
                            value={item.quantidade_consumo}
                            onChange={(e) =>
                              handleAtualizarItem(item.id, 'quantidade_consumo', Number(e.target.value))
                            }
                            className="w-16 p-1 rounded-lg border border-[#4A2013]/20 text-center font-mono font-bold"
                          />
                          <span className="ml-1 text-[10px] text-[#4A2013]/60">{insumoObj?.unidade_medida}</span>
                        </td>
                        <td className="py-3">
                          <input
                            type="number"
                            step="0.5"
                            value={item.percentual_perda}
                            onChange={(e) =>
                              handleAtualizarItem(item.id, 'percentual_perda', Number(e.target.value))
                            }
                            className="w-14 p-1 rounded-lg border border-[#4A2013]/20 text-center font-mono"
                          />
                          <span className="ml-0.5">%</span>
                        </td>
                        <td className="py-3 font-mono text-[#4A2013]/80">
                          {formatarMoeda(custoUn)}
                        </td>
                        <td className="py-3 text-right font-mono font-bold text-[#4A2013]">
                          {formatarMoeda(subtotal)}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => handleRemoverItem(item.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remover insumo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Painel Direito: Composição Dinâmica & PVS (5 Colunas) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF6EE] p-6 rounded-3xl border-2 border-[#B85324]/30 shadow-soft-warm">
            <h3 className="text-lg font-black text-[#4A2013] pb-3 border-b border-[#B85324]/20 flex items-center justify-between">
              <span>Engenharia de Precificação</span>
              <span className="text-xs font-mono font-semibold text-[#B85324] px-2.5 py-1 rounded-lg bg-[#F9E8B8]">
                Lean Kaizen
              </span>
            </h3>

            {/* Sliders Interativos de Ajuste: Tempo Padrão e Margem Alvo */}
            <div className="mt-5 space-y-4">
              {/* Tempo Padrão */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#4A2013] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[#B85324]" />
                    <span>Tempo Padrão da Peça:</span>
                  </span>
                  <span className="font-mono text-[#B85324] text-sm">
                    {tempoPadraoLocal} minutos ({(tempoPadraoLocal / 60).toFixed(2)}h)
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="240"
                  step="5"
                  value={tempoPadraoLocal}
                  onChange={(e) => setTempoPadraoLocal(Number(e.target.value))}
                  className="w-full accent-[#B85324] cursor-pointer"
                />
              </div>

              {/* Margem Alvo */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#4A2013] mb-1">
                  <span className="flex items-center gap-1.5">
                    <Percent className="w-4 h-4 text-[#B85324]" />
                    <span>Margem de Lucro Alvo:</span>
                  </span>
                  <span className="font-mono text-[#B85324] text-sm">
                    {margemAlvoLocal}%
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="65"
                  step="1"
                  value={margemAlvoLocal}
                  onChange={(e) => setMargemAlvoLocal(Number(e.target.value))}
                  className="w-full accent-[#B85324] cursor-pointer"
                />
              </div>
            </div>

            {/* Breakdown dos 4 Pilares de Custo */}
            {calculo && (
              <div className="mt-6 space-y-3 pt-4 border-t border-[#B85324]/20 text-xs">
                {/* 1. Insumos */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#4A2013]/10">
                  <span className="text-[#4A2013]/70 font-semibold">
                    1. Insumos c/ Fator de Perda:
                  </span>
                  <strong className="font-mono text-[#4A2013] text-sm">
                    {formatarMoeda(calculo.custo_insumos_total)}
                  </strong>
                </div>

                {/* 2. Mão de Obra */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#4A2013]/10">
                  <div>
                    <span className="text-[#4A2013]/70 font-semibold block">
                      2. Mão de Obra Orçada:
                    </span>
                    <span className="text-[10px] text-[#4A2013]/50">
                      ({tempoPadraoLocal}m × {formatarMoeda(taxaHorariaMO)}/h)
                    </span>
                  </div>
                  <strong className="font-mono text-[#4A2013] text-sm">
                    {formatarMoeda(calculo.custo_mo_orcado)}
                  </strong>
                </div>

                {/* 3. Operacional Rateado */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-[#4A2013]/10">
                  <span className="text-[#4A2013]/70 font-semibold">
                    3. Custo Operacional Fixo Rateado:
                  </span>
                  <strong className="font-mono text-[#4A2013] text-sm">
                    {formatarMoeda(calculo.custo_operacional_rateado)}
                  </strong>
                </div>

                {/* Custo Total de Produção */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9E8B8]/50 border border-[#B85324]/30 font-bold text-sm text-[#4A2013]">
                  <span>Custo Total de Produção:</span>
                  <span className="font-mono text-[#B85324] text-base">
                    {formatarMoeda(calculo.custo_total_producao)}
                  </span>
                </div>

                {/* Destaque Gigante: PREÇO DE VENDA SUGERIDO (PVS) */}
                <div className="mt-4 p-5 rounded-3xl bg-[#4A2013] text-white shadow-lg text-center">
                  <span className="text-[11px] font-black uppercase tracking-widest text-[#F9E8B8] block mb-1">
                    Preço de Venda Sugerido (PVS)
                  </span>
                  <div className="font-mono text-3xl sm:text-4xl font-black text-[#FFFFFF]">
                    {formatarMoeda(calculo.preco_venda_sugerido)}
                  </div>
                  <div className="mt-2 text-[11px] text-[#F9E8B8]/80 flex items-center justify-center gap-3">
                    <span>Margem Bruta: <strong>{formatarMoeda(calculo.margem_lucro_valor)}</strong></span>
                    <span>•</span>
                    <span>Markup: <strong>{calculo.margem_lucro_percentual}%</strong></span>
                  </div>
                </div>

                <div className="p-3 bg-white/70 rounded-xl text-[10px] text-[#4A2013]/70 text-center italic">
                  Fórmula Lean: PVS = Custo Total / (1 - Margem Alvo %)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Criar Novo Produto */}
      {modalNovoProduto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-[#4A2013] mb-4">
              Cadastrar Novo Modelo Di' Linhas
            </h3>
            <form onSubmit={handleCriarNovoProduto} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">SKU</label>
                <input
                  type="text"
                  required
                  value={novoSku}
                  onChange={(e) => setNovoSku(e.target.value.toUpperCase())}
                  placeholder="PROD-BOL-002"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  placeholder="Mochila Roll-top Impermeável"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">Categoria</label>
                <select
                  value={novaCategoria}
                  onChange={(e) => setNovaCategoria(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                >
                  <option value="Bolsas">Bolsas</option>
                  <option value="Mochilas">Mochilas</option>
                  <option value="Carteiras">Carteiras</option>
                  <option value="Acessórios">Acessórios</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#4A2013] block mb-1">Descrição</label>
                <textarea
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  placeholder="Detalhes de acabamento, bolsos internos e estilo..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 h-20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalNovoProduto(false)}
                  className="px-4 py-2 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B85324] text-white text-xs font-bold hover:bg-[#9A421A]"
                >
                  Criar Modelo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
