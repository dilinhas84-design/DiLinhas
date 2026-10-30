import React, { useState } from 'react';
import { useLeanSystem } from '../../context/LeanSystemContext';
import { formatarMoeda } from '../../lib/leanPricingEngine';
import { ImageUploadZone } from '../ui/ImageUploadZone';
import { 
  FolderPlus, 
  Package, 
  Layers, 
  Truck, 
  Users, 
  Receipt, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle2, 
  Clock, 
  Ruler, 
  Sparkles,
  MapPin,
  Calendar,
  AlertTriangle,
  Phone,
  Mail,
  X
} from 'lucide-react';
import { 
  ProdutoAcabado, 
  Insumo, 
  Fornecedor, 
  Operador, 
  DespesaOperacional,
  CategoriaProduto,
  CategoriaInsumo,
  UnidadeMedida,
  EspecialidadeOperador,
  CategoriaDespesa
} from '../../types/database';

export const RegistrationsHubModule: React.FC = () => {
  const { 
    produtos, 
    adicionarProduto, 
    atualizarProduto, 
    removerProduto,
    insumos, 
    adicionarInsumo, 
    atualizarInsumo, 
    removerInsumo,
    fornecedores, 
    adicionarFornecedor, 
    atualizarFornecedor, 
    removerFornecedor,
    operadores, 
    adicionarOperador, 
    atualizarOperador, 
    removerOperador,
    despesasOperacionais,
    adicionarDespesa,
    removerDespesa,
    taxaHorariaMO
  } = useLeanSystem();

  const [activeTab, setActiveTab] = useState<'produtos' | 'insumos' | 'fornecedores' | 'operadores' | 'despesas'>('produtos');
  const [busca, setBusca] = useState('');

  // Modais de Cadastro / Edição
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState<ProdutoAcabado | null>(null);

  const [modalInsumoAberto, setModalInsumoAberto] = useState(false);
  const [insumoEditando, setInsumoEditando] = useState<Insumo | null>(null);

  const [modalFornecedorAberto, setModalFornecedorAberto] = useState(false);
  const [fornecedorEditando, setFornecedorEditando] = useState<Fornecedor | null>(null);

  const [modalOperadorAberto, setModalOperadorAberto] = useState(false);
  const [operadorEditando, setOperadorEditando] = useState<Operador | null>(null);

  const [modalDespesaAberto, setModalDespesaAberto] = useState(false);

  // ==========================================
  // ESTADOS DO FORMULÁRIO DE PRODUTO
  // ==========================================
  const [prodSku, setProdSku] = useState('');
  const [prodNome, setProdNome] = useState('');
  const [prodCategoria, setProdCategoria] = useState<CategoriaProduto>('Bolsas');
  const [prodColecao, setProdColecao] = useState('');
  const [prodDescricao, setProdDescricao] = useState('');
  const [prodPrecoVenda, setProdPrecoVenda] = useState(250);
  const [prodMargemAlvo, setProdMargemAlvo] = useState(38);
  const [prodImagemUrl, setProdImagemUrl] = useState('');
  const [prodLargura, setProdLargura] = useState(35);
  const [prodAltura, setProdAltura] = useState(30);
  const [prodProfundidade, setProdProfundidade] = useState(12);
  const [prodPeso, setProdPeso] = useState(600);
  const [prodCorteMin, setProdCorteMin] = useState(15);
  const [prodCosturaMin, setProdCosturaMin] = useState(35);
  const [prodMontagemMin, setProdMontagemMin] = useState(15);
  const [prodAcabamentoMin, setProdAcabamentoMin] = useState(10);
  const [prodInstrucoes, setProdInstrucoes] = useState('');

  const abrirModalNovoProduto = () => {
    setProdutoEditando(null);
    setProdSku(`PROD-BOL-${(produtos.length + 1).toString().padStart(3, '0')}`);
    setProdNome('');
    setProdCategoria('Bolsas');
    setProdColecao('Linha 2026');
    setProdDescricao('');
    setProdPrecoVenda(250);
    setProdMargemAlvo(38);
    setProdImagemUrl('');
    setProdLargura(35);
    setProdAltura(30);
    setProdProfundidade(12);
    setProdPeso(600);
    setProdCorteMin(15);
    setProdCosturaMin(35);
    setProdMontagemMin(15);
    setProdAcabamentoMin(10);
    setProdInstrucoes('');
    setModalProdutoAberto(true);
  };

  const abrirModalEditarProduto = (p: ProdutoAcabado) => {
    setProdutoEditando(p);
    setProdSku(p.sku);
    setProdNome(p.nome);
    setProdCategoria(p.categoria);
    setProdColecao(p.colecao || '');
    setProdDescricao(p.descricao || '');
    setProdPrecoVenda(p.preco_venda);
    setProdMargemAlvo(p.margem_alvo);
    setProdImagemUrl(p.imagem_url || '');
    setProdLargura(p.dimensoes?.largura_cm || 30);
    setProdAltura(p.dimensoes?.altura_cm || 25);
    setProdProfundidade(p.dimensoes?.profundidade_cm || 10);
    setProdPeso(p.dimensoes?.peso_gramas || 500);
    setProdCorteMin(p.tempos_por_etapa?.corte_min || 15);
    setProdCosturaMin(p.tempos_por_etapa?.costura_min || 30);
    setProdMontagemMin(p.tempos_por_etapa?.montagem_min || 10);
    setProdAcabamentoMin(p.tempos_por_etapa?.acabamento_min || 5);
    setProdInstrucoes(p.instrucoes_costura || '');
    setModalProdutoAberto(true);
  };

  const handleSalvarProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    const tempoTotal = Number(prodCorteMin) + Number(prodCosturaMin) + Number(prodMontagemMin) + Number(prodAcabamentoMin);

    const dados = {
      sku: prodSku,
      nome: prodNome,
      categoria: prodCategoria,
      colecao: prodColecao,
      descricao: prodDescricao,
      preco_venda: Number(prodPrecoVenda),
      margem_alvo: Number(prodMargemAlvo),
      tempo_padrao_total: tempoTotal,
      tempos_por_etapa: {
        corte_min: Number(prodCorteMin),
        costura_min: Number(prodCosturaMin),
        montagem_min: Number(prodMontagemMin),
        acabamento_min: Number(prodAcabamentoMin),
      },
      dimensoes: {
        largura_cm: Number(prodLargura),
        altura_cm: Number(prodAltura),
        profundidade_cm: Number(prodProfundidade),
        peso_gramas: Number(prodPeso),
      },
      instrucoes_costura: prodInstrucoes,
      imagem_url: prodImagemUrl,
    };

    if (produtoEditando) {
      await atualizarProduto(produtoEditando.id, dados);
    } else {
      await adicionarProduto({ ...dados, saldo_estoque: 0 }, []);
    }
    setModalProdutoAberto(false);
  };

  // ==========================================
  // ESTADOS DO FORMULÁRIO DE INSUMO
  // ==========================================
  const [insSku, setInsSku] = useState('');
  const [insNome, setInsNome] = useState('');
  const [insUnidade, setInsUnidade] = useState<UnidadeMedida>('m');
  const [insCusto, setInsCusto] = useState(25.0);
  const [insMinimo, setInsMinimo] = useState(10.0);
  const [insMaximo, setInsMaximo] = useState(100.0);
  const [insSaldo, setInsSaldo] = useState(50.0);
  const [insCategoria, setInsCategoria] = useState<CategoriaInsumo>('Tecidos e Lonas');
  const [insFornecedor, setInsFornecedor] = useState('');
  const [insLocalizacao, setInsLocalizacao] = useState('Prateleira A1');
  const [insImagemUrl, setInsImagemUrl] = useState('');
  const [insLeadTime, setInsLeadTime] = useState(7);
  const [insCorPantone, setInsCorPantone] = useState('#B85324');

  const abrirModalNovoInsumo = () => {
    setInsumoEditando(null);
    setInsSku(`INS-${(insumos.length + 1).toString().padStart(3, '0')}`);
    setInsNome('');
    setInsUnidade('m');
    setInsCusto(25.0);
    setInsMinimo(10.0);
    setInsMaximo(100.0);
    setInsSaldo(50.0);
    setInsCategoria('Tecidos e Lonas');
    setInsFornecedor(fornecedores[0]?.nome_fantasia || 'Têxtil São Bento');
    setInsLocalizacao('Prateleira A1');
    setInsImagemUrl('');
    setInsLeadTime(7);
    setInsCorPantone('#B85324');
    setModalInsumoAberto(true);
  };

  const abrirModalEditarInsumo = (item: Insumo) => {
    setInsumoEditando(item);
    setInsSku(item.sku);
    setInsNome(item.nome);
    setInsUnidade(item.unidade_medida);
    setInsCusto(item.custo_unitario);
    setInsMinimo(item.estoque_minimo);
    setInsMaximo(item.estoque_maximo || 100);
    setInsSaldo(item.saldo_atual);
    setInsCategoria(item.categoria || 'Tecidos e Lonas');
    setInsFornecedor(item.fornecedor || '');
    setInsLocalizacao(item.localizacao_almoxarifado || '');
    setInsImagemUrl(item.imagem_url || '');
    setInsLeadTime(item.lead_time_dias || 7);
    setInsCorPantone(item.cor_pantone || '#B85324');
    setModalInsumoAberto(true);
  };

  const handleSalvarInsumo = async (e: React.FormEvent) => {
    e.preventDefault();
    const dados = {
      sku: insSku,
      nome: insNome,
      unidade_medida: insUnidade,
      custo_unitario: Number(insCusto),
      estoque_minimo: Number(insMinimo),
      estoque_maximo: Number(insMaximo),
      saldo_atual: Number(insSaldo),
      categoria: insCategoria,
      fornecedor: insFornecedor,
      localizacao_almoxarifado: insLocalizacao,
      imagem_url: insImagemUrl,
      lead_time_dias: Number(insLeadTime),
      cor_pantone: insCorPantone,
    };

    if (insumoEditando) {
      await atualizarInsumo(insumoEditando.id, dados);
    } else {
      await adicionarInsumo(dados);
    }
    setModalInsumoAberto(false);
  };

  // ==========================================
  // ESTADOS DO FORMULÁRIO DE FORNECEDOR
  // ==========================================
  const [fornRazao, setFornRazao] = useState('');
  const [fornFantasia, setFornFantasia] = useState('');
  const [fornCnpj, setFornCnpj] = useState('');
  const [fornContato, setFornContato] = useState('');
  const [fornWhatsapp, setFornWhatsapp] = useState('');
  const [fornEmail, setFornEmail] = useState('');
  const [fornCidade, setFornCidade] = useState('');
  const [fornUf, setFornUf] = useState('SP');
  const [fornLeadTime, setFornLeadTime] = useState(7);
  const [fornCondicao, setFornCondicao] = useState('30 dias');

  const abrirModalNovoFornecedor = () => {
    setFornecedorEditando(null);
    setFornRazao('');
    setFornFantasia('');
    setFornCnpj('');
    setFornContato('');
    setFornWhatsapp('');
    setFornEmail('');
    setFornCidade('');
    setFornUf('SP');
    setFornLeadTime(7);
    setFornCondicao('30 dias');
    setModalFornecedorAberto(true);
  };

  const abrirModalEditarFornecedor = (f: Fornecedor) => {
    setFornecedorEditando(f);
    setFornRazao(f.razao_social);
    setFornFantasia(f.nome_fantasia);
    setFornCnpj(f.cnpj_cpf || '');
    setFornContato(f.contato_nome || '');
    setFornWhatsapp(f.whatsapp || '');
    setFornEmail(f.email || '');
    setFornCidade(f.cidade || '');
    setFornUf(f.uf || 'SP');
    setFornLeadTime(f.lead_time_dias || 7);
    setFornCondicao(f.condicao_pagamento || '30 dias');
    setModalFornecedorAberto(true);
  };

  const handleSalvarFornecedor = async (e: React.FormEvent) => {
    e.preventDefault();
    const dados = {
      razao_social: fornRazao,
      nome_fantasia: fornFantasia,
      cnpj_cpf: fornCnpj,
      contato_nome: fornContato,
      whatsapp: fornWhatsapp,
      email: fornEmail,
      cidade: fornCidade,
      uf: fornUf,
      lead_time_dias: Number(fornLeadTime),
      condicao_pagamento: fornCondicao,
      ativo: true,
    };

    if (fornecedorEditando) {
      await atualizarFornecedor(fornecedorEditando.id, dados);
    } else {
      await adicionarFornecedor(dados);
    }
    setModalFornecedorAberto(false);
  };

  // ==========================================
  // ESTADOS DO FORMULÁRIO DE OPERADOR
  // ==========================================
  const [opNome, setOpNome] = useState('');
  const [opApelido, setOpApelido] = useState('');
  const [opEspecialidade, setOpEspecialidade] = useState<EspecialidadeOperador>('Costura');
  const [opTurno, setOpTurno] = useState<'Manhã' | 'Tarde' | 'Integral'>('Integral');
  const [opFotoUrl, setOpFotoUrl] = useState('');

  const abrirModalNovoOperador = () => {
    setOperadorEditando(null);
    setOpNome('');
    setOpApelido('');
    setOpEspecialidade('Costura');
    setOpTurno('Integral');
    setOpFotoUrl('');
    setModalOperadorAberto(true);
  };

  const abrirModalEditarOperador = (o: Operador) => {
    setOperadorEditando(o);
    setOpNome(o.nome);
    setOpApelido(o.apelido);
    setOpEspecialidade(o.especialidade);
    setOpTurno(o.turno);
    setOpFotoUrl(o.foto_url || '');
    setModalOperadorAberto(true);
  };

  const handleSalvarOperador = async (e: React.FormEvent) => {
    e.preventDefault();
    const dados = {
      nome: opNome,
      apelido: opApelido,
      especialidade: opEspecialidade,
      turno: opTurno,
      foto_url: opFotoUrl,
      ativo: true,
    };

    if (operadorEditando) {
      await atualizarOperador(operadorEditando.id, dados);
    } else {
      await adicionarOperador(dados);
    }
    setModalOperadorAberto(false);
  };

  // ==========================================
  // ESTADOS DO FORMULÁRIO DE DESPESA
  // ==========================================
  const [despMes, setDespMes] = useState('2026-10');
  const [despCategoria, setDespCategoria] = useState<CategoriaDespesa>('Ocupacao');
  const [despDescricao, setDespDescricao] = useState('');
  const [despValor, setDespValor] = useState(1500);

  const handleSalvarDespesa = async (e: React.FormEvent) => {
    e.preventDefault();
    await adicionarDespesa({
      mes_referencia: despMes,
      categoria: despCategoria,
      descricao: despDescricao,
      valor: Number(despValor),
      pago: true,
    });
    setModalDespesaAberto(false);
    setDespDescricao('');
  };

  // Filtragem
  const produtosFiltrados = produtos.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()) || p.sku.toLowerCase().includes(busca.toLowerCase()));
  const insumosFiltrados = insumos.filter(i => i.nome.toLowerCase().includes(busca.toLowerCase()) || i.sku.toLowerCase().includes(busca.toLowerCase()));
  const fornecedoresFiltrados = fornecedores.filter(f => f.nome_fantasia.toLowerCase().includes(busca.toLowerCase()) || f.razao_social.toLowerCase().includes(busca.toLowerCase()));
  const operadoresFiltrados = operadores.filter(o => o.nome.toLowerCase().includes(busca.toLowerCase()) || o.apelido.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      {/* Header do Hub de Cadastros */}
      <div className="bg-white p-6 rounded-3xl border border-[#B85324]/20 shadow-soft-warm flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-[#FAF6EE] text-[#B85324] rounded-xl">
              <FolderPlus className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#B85324]">
              Engenharia de Dados & Gestão Visual
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#4A2013] mt-1">
            Hub Central de Cadastros Di' Linhas
          </h2>
          <p className="text-xs text-[#4A2013]/70 mt-0.5">
            Cadastros ricos com imagens de alta definição, amostras físicas, equipe fabril e custos operacionais reais.
          </p>
        </div>

        {/* Botão de Ação Primária dinâmico conforme a sub-aba */}
        <div>
          {activeTab === 'produtos' && (
            <button
              onClick={abrirModalNovoProduto}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Novo Produto</span>
            </button>
          )}
          {activeTab === 'insumos' && (
            <button
              onClick={abrirModalNovoInsumo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Matéria-Prima</span>
            </button>
          )}
          {activeTab === 'fornecedores' && (
            <button
              onClick={abrirModalNovoFornecedor}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Fornecedor</span>
            </button>
          )}
          {activeTab === 'operadores' && (
            <button
              onClick={abrirModalNovoOperador}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Operador</span>
            </button>
          )}
          {activeTab === 'despesas' && (
            <button
              onClick={() => setModalDespesaAberto(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Despesa Mensal</span>
            </button>
          )}
        </div>
      </div>

      {/* Navegação entre Sub-abas */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF6EE] p-1.5 rounded-2xl border border-[#B85324]/15">
          <button
            onClick={() => { setActiveTab('produtos'); setBusca(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'produtos' ? 'bg-[#4A2013] text-white shadow-sm' : 'text-[#4A2013] hover:text-[#B85324]'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produtos Acabados ({produtos.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('insumos'); setBusca(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'insumos' ? 'bg-[#4A2013] text-white shadow-sm' : 'text-[#4A2013] hover:text-[#B85324]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Insumos & Amostras ({insumos.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('fornecedores'); setBusca(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'fornecedores' ? 'bg-[#4A2013] text-white shadow-sm' : 'text-[#4A2013] hover:text-[#B85324]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Fornecedores ({fornecedores.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('operadores'); setBusca(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'operadores' ? 'bg-[#4A2013] text-white shadow-sm' : 'text-[#4A2013] hover:text-[#B85324]'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Equipe Fabril ({operadores.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('despesas'); setBusca(''); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'despesas' ? 'bg-[#4A2013] text-white shadow-sm' : 'text-[#4A2013] hover:text-[#B85324]'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Centro de Custos 3M ({despesasOperacionais.length})</span>
          </button>
        </div>

        {activeTab !== 'despesas' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#4A2013]/40 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Filtrar por nome, SKU..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 focus:outline-none focus:border-[#B85324]"
            />
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 1. ABA DE PRODUTOS ACABADOS COM GALERIA & IMAGENS        */}
      {/* ======================================================== */}
      {activeTab === 'produtos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtosFiltrados.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Imagem do Produto em Destaque */}
                <div className="relative h-52 bg-[#FAF6EE] overflow-hidden border-b border-[#4A2013]/10">
                  {prod.imagem_url ? (
                    <img
                      src={prod.imagem_url}
                      alt={prod.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#4A2013]/40">
                      <Package className="w-12 h-12 mb-1" />
                      <span className="text-xs font-semibold">Sem foto cadastrada</span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white font-mono text-xs font-bold">
                    {prod.sku}
                  </span>

                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-[#F9E8B8] text-[#4A2013] text-[10px] font-black uppercase">
                    {prod.categoria}
                  </span>
                </div>

                {/* Conteúdo do Produto */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-[#4A2013] line-clamp-1">{prod.nome}</h3>
                    {prod.colecao && (
                      <span className="text-[10px] font-semibold text-[#B85324] block uppercase tracking-wider">
                        {prod.colecao}
                      </span>
                    )}
                    <p className="text-xs text-[#4A2013]/70 line-clamp-2 mt-1">
                      {prod.descricao || 'Sem descrição cadastrada.'}
                    </p>
                  </div>

                  {/* Dimensões */}
                  {prod.dimensoes && (
                    <div className="p-2.5 rounded-xl bg-[#FAF6EE] border border-[#4A2013]/10 flex items-center justify-between text-[11px] text-[#4A2013]">
                      <span className="flex items-center gap-1 text-[#4A2013]/60">
                        <Ruler className="w-3.5 h-3.5 text-[#B85324]" />
                        <span>Dimensões:</span>
                      </span>
                      <strong className="font-mono">
                        {prod.dimensoes.largura_cm} × {prod.dimensoes.altura_cm} × {prod.dimensoes.profundidade_cm} cm
                      </strong>
                    </div>
                  )}

                  {/* Tempos de Fábrica por Etapa */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#4A2013]/60 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#B85324]" />
                        <span>Tempo Padrão Lean:</span>
                      </span>
                      <strong className="font-mono text-[#4A2013]">{prod.tempo_padrao_total} minutos</strong>
                    </div>
                    {prod.tempos_por_etapa && (
                      <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-center pt-1">
                        <span className="p-1 rounded bg-gray-50 border border-gray-200">Corte: {prod.tempos_por_etapa.corte_min}m</span>
                        <span className="p-1 rounded bg-gray-50 border border-gray-200">Cost: {prod.tempos_por_etapa.costura_min}m</span>
                        <span className="p-1 rounded bg-gray-50 border border-gray-200">Mont: {prod.tempos_por_etapa.montagem_min}m</span>
                        <span className="p-1 rounded bg-gray-50 border border-gray-200">Qual: {prod.tempos_por_etapa.acabamento_min}m</span>
                      </div>
                    )}
                  </div>

                  {/* Preço e Margem */}
                  <div className="pt-2 border-t border-[#4A2013]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-[#4A2013]/60 block">Preço de Venda:</span>
                      <span className="font-mono font-black text-lg text-[#B85324]">
                        {formatarMoeda(prod.preco_venda)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#4A2013]/60 block">Margem Alvo:</span>
                      <span className="px-2 py-0.5 rounded-md bg-[#E8F5EE] border border-[#2D7A4C]/30 text-[#2D7A4C] font-mono font-bold text-xs">
                        {prod.margem_alvo}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="p-4 pt-0 flex items-center justify-end gap-2">
                <button
                  onClick={() => abrirModalEditarProduto(prod)}
                  className="p-2 rounded-xl border border-[#4A2013]/20 text-[#4A2013] hover:text-[#B85324] hover:bg-[#FAF6EE] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja remover o modelo "${prod.nome}"?`)) removerProduto(prod.id);
                  }}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. ABA DE INSUMOS & MATÉRIAS-PRIMAS COM AMOSTRAS         */}
      {/* ======================================================== */}
      {activeTab === 'insumos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {insumosFiltrados.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                <div className="relative h-40 bg-[#FAF6EE] overflow-hidden border-b border-[#4A2013]/10">
                  {item.imagem_url ? (
                    <img
                      src={item.imagem_url}
                      alt={item.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-[#4A2013]/40">
                      <Layers className="w-10 h-10 mb-1" />
                      <span className="text-xs font-semibold">Sem amostra fotográfica</span>
                    </div>
                  )}

                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white font-mono text-[10px] font-bold">
                    {item.sku}
                  </span>

                  {item.cor_pantone && (
                    <span 
                      className="absolute top-3 right-3 w-5 h-5 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: item.cor_pantone }}
                      title={`Cor: ${item.cor_pantone}`}
                    ></span>
                  )}
                </div>

                <div className="p-5 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85324]">
                      {item.categoria || 'Geral'}
                    </span>
                    <h3 className="font-bold text-base text-[#4A2013] line-clamp-1">{item.nome}</h3>
                    <span className="text-[11px] text-[#4A2013]/60 block mt-0.5">
                      Fornecedor: <strong>{item.fornecedor || 'Diversos'}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2 rounded-xl bg-[#FAF6EE] border border-[#4A2013]/10">
                      <span className="text-[10px] text-[#4A2013]/60 block">Custo Unitário:</span>
                      <strong className="font-mono text-[#4A2013]">
                        {formatarMoeda(item.custo_unitario)}/{item.unidade_medida}
                      </strong>
                    </div>

                    <div className="p-2 rounded-xl bg-[#FAF6EE] border border-[#4A2013]/10">
                      <span className="text-[10px] text-[#4A2013]/60 block">Saldo Atual:</span>
                      <strong className="font-mono text-[#2D7A4C]">
                        {item.saldo_atual} {item.unidade_medida}
                      </strong>
                    </div>
                  </div>

                  {item.localizacao_almoxarifado && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#4A2013]/70 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-[#B85324]" />
                      <span>Almoxarifado: <strong>{item.localizacao_almoxarifado}</strong></span>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-end gap-2">
                <button
                  onClick={() => abrirModalEditarInsumo(item)}
                  className="p-2 rounded-xl border border-[#4A2013]/20 text-[#4A2013] hover:text-[#B85324] hover:bg-[#FAF6EE] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja remover o insumo "${item.nome}"?`)) removerInsumo(item.id);
                  }}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. ABA DE FORNECEDORES & SUPRIMENTOS                     */}
      {/* ======================================================== */}
      {activeTab === 'fornecedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fornecedoresFiltrados.map((forn) => (
            <div
              key={forn.id}
              className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#4A2013]/10">
                  <span className="font-bold text-base text-[#4A2013]">{forn.nome_fantasia}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    Ativo
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-[#4A2013]">
                  <div>
                    <span className="text-[#4A2013]/60 block text-[10px]">Razão Social:</span>
                    <span className="font-semibold text-xs">{forn.razao_social}</span>
                  </div>
                  {forn.cnpj_cpf && (
                    <div>
                      <span className="text-[#4A2013]/60 block text-[10px]">CNPJ/CPF:</span>
                      <span className="font-mono text-xs">{forn.cnpj_cpf}</span>
                    </div>
                  )}
                  {forn.whatsapp && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <Phone className="w-3.5 h-3.5 text-[#2D7A4C]" />
                      <span>{forn.whatsapp} ({forn.contato_nome || 'Comercial'})</span>
                    </div>
                  )}
                  {forn.email && (
                    <div className="flex items-center gap-1.5 text-xs text-[#4A2013]/70">
                      <Mail className="w-3.5 h-3.5 text-[#B85324]" />
                      <span>{forn.email}</span>
                    </div>
                  )}
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF6EE] border border-[#4A2013]/10 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#4A2013]/60 block">Lead Time:</span>
                    <strong className="font-mono text-[#B85324]">{forn.lead_time_dias} dias</strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#4A2013]/60 block">Condição:</span>
                    <strong className="text-xs">{forn.condicao_pagamento || '30 dias'}</strong>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-[#4A2013]/10 mt-3">
                <button
                  onClick={() => abrirModalEditarFornecedor(forn)}
                  className="p-2 rounded-xl border border-[#4A2013]/20 text-[#4A2013] hover:text-[#B85324] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja remover o fornecedor "${forn.nome_fantasia}"?`)) removerFornecedor(forn.id);
                  }}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. ABA DE OPERADORES & EQUIPE FABRIL COM FOTOS / AVATAR  */}
      {/* ======================================================== */}
      {activeTab === 'operadores' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {operadoresFiltrados.map((op) => (
            <div
              key={op.id}
              className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm p-6 text-center flex flex-col justify-between hover:shadow-md transition-all group"
            >
              <div>
                {/* Foto / Avatar */}
                <div className="relative w-24 h-24 mx-auto mb-3 rounded-full overflow-hidden border-2 border-[#B85324] shadow-sm bg-[#FAF6EE]">
                  {op.foto_url ? (
                    <img
                      src={op.foto_url}
                      alt={op.nome}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#4A2013]/40">
                      <Users className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#2D7A4C] border-2 border-white"></span>
                </div>

                <h3 className="font-bold text-base text-[#4A2013]">{op.nome}</h3>
                <span className="text-xs font-semibold text-[#B85324] block">"{op.apelido}"</span>

                <div className="mt-3 inline-block px-3 py-1 rounded-xl bg-[#FAF6EE] border border-[#B85324]/20 text-xs font-bold text-[#4A2013]">
                  {op.especialidade}
                </div>

                <span className="text-[11px] text-[#4A2013]/60 block mt-2">
                  Turno: <strong>{op.turno}</strong>
                </span>
              </div>

              <div className="pt-4 flex items-center justify-center gap-2 border-t border-[#4A2013]/10 mt-4">
                <button
                  onClick={() => abrirModalEditarOperador(op)}
                  className="p-2 rounded-xl border border-[#4A2013]/20 text-[#4A2013] hover:text-[#B85324] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Deseja remover o operador "${op.nome}"?`)) removerOperador(op.id);
                  }}
                  className="p-2 rounded-xl text-red-500 hover:bg-red-50 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. ABA DE DESPESAS OPERACIONAIS (MÉDIA 3 MESES PONDERADA)*/}
      {/* ======================================================== */}
      {activeTab === 'despesas' && (
        <div className="space-y-6">
          <div className="bg-[#FAF6EE] p-5 rounded-3xl border border-[#B85324]/20 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#B85324] block">
                Cálculo Dinâmico da Taxa Horária
              </span>
              <p className="text-xs text-[#4A2013] max-w-xl">
                O sistema soma automaticamente todas as despesas dos últimos 3 meses lançados e divide por 3 para obter o custo operacional base de absorção fabril.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#4A2013]/60 block font-semibold">Taxa Horária Vigente:</span>
              <span className="font-mono font-black text-2xl text-[#B85324]">
                {formatarMoeda(taxaHorariaMO)}/h
              </span>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#4A2013]/15 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#FAF6EE] text-[#4A2013]/70 uppercase tracking-wider text-[10px] border-b border-[#4A2013]/10">
                    <th className="py-3 px-4 font-bold">Mês Ref.</th>
                    <th className="py-3 px-4 font-bold">Categoria</th>
                    <th className="py-3 px-4 font-bold">Descrição da Despesa</th>
                    <th className="py-3 px-4 font-bold text-right">Valor (R$)</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#4A2013]/5">
                  {despesasOperacionais.map((desp) => (
                    <tr key={desp.id} className="hover:bg-[#FAF6EE]/40">
                      <td className="py-3 px-4 font-mono font-bold text-[#4A2013]">
                        {desp.mes_referencia}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF6EE] border border-[#4A2013]/10 text-[10px] font-semibold text-[#4A2013]">
                          {desp.categoria}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-[#4A2013]">
                        {desp.descricao}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#B85324] text-sm">
                        {formatarMoeda(desp.valor)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5EE] text-[#2D7A4C]">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Liquidado</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Remover despesa "${desp.descricao}"?`)) removerDespesa(desp.id);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CADASTRO / EDIÇÃO DE PRODUTO ACABADO COM IMAGEM   */}
      {/* ======================================================== */}
      {modalProdutoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-2xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
              <h3 className="text-xl font-bold text-[#4A2013]">
                {produtoEditando ? 'Editar Produto de Marroquinaria' : 'Cadastrar Novo Modelo Di\' Linhas'}
              </h3>
              <button onClick={() => setModalProdutoAberto(false)} className="p-1 text-[#4A2013]/60 hover:text-[#4A2013]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSalvarProduto} className="mt-4 space-y-4">
              {/* Upload da Foto da Peça */}
              <ImageUploadZone
                label="Foto Principal da Peça (Visualização no Chão de Fábrica e Catálogo):"
                value={prodImagemUrl}
                onChange={setProdImagemUrl}
                aspectRatio="square"
                placeholderText="Arraste ou selecione a foto da bolsa/mochila montada"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={prodSku}
                    onChange={(e) => setProdSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Nome Comercial</label>
                  <input
                    type="text"
                    required
                    value={prodNome}
                    onChange={(e) => setProdNome(e.target.value)}
                    placeholder="Bolsa Tote Vintage Terracota"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Categoria</label>
                  <select
                    value={prodCategoria}
                    onChange={(e) => setProdCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-semibold"
                  >
                    <option value="Bolsas">Bolsas</option>
                    <option value="Mochilas">Mochilas</option>
                    <option value="Carteiras">Carteiras</option>
                    <option value="Acessórios">Acessórios</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Coleção / Linha</label>
                  <input
                    type="text"
                    value={prodColecao}
                    onChange={(e) => setProdColecao(e.target.value)}
                    placeholder="Linha Vintage Criativa"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2013] block mb-1">Descrição Comercial</label>
                <textarea
                  value={prodDescricao}
                  onChange={(e) => setProdDescricao(e.target.value)}
                  placeholder="Detalhes de bolsos, forros e acabamentos..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 h-16"
                />
              </div>

              {/* Dimensões */}
              <div className="p-4 rounded-2xl bg-white border border-[#4A2013]/10 space-y-2">
                <span className="text-xs font-bold text-[#4A2013] block">Dimensões da Peça Acabada:</span>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#4A2013]/60 block">Largura (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={prodLargura}
                      onChange={(e) => setProdLargura(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#4A2013]/60 block">Altura (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={prodAltura}
                      onChange={(e) => setProdAltura(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#4A2013]/60 block">Profundidade (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={prodProfundidade}
                      onChange={(e) => setProdProfundidade(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#4A2013]/60 block">Peso Médio (g)</label>
                    <input
                      type="number"
                      value={prodPeso}
                      onChange={(e) => setProdPeso(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Tempos Padrão por Etapa */}
              <div className="p-4 rounded-2xl bg-white border border-[#4A2013]/10 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-[#4A2013]">Tempos Padrão por Etapa Lean (minutos):</span>
                  <span className="font-mono text-xs font-bold text-[#B85324]">
                    Total: {Number(prodCorteMin) + Number(prodCosturaMin) + Number(prodMontagemMin) + Number(prodAcabamentoMin)} min
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-[#4A2013]/60 block">1. Corte</label>
                    <input
                      type="number"
                      value={prodCorteMin}
                      onChange={(e) => setProdCorteMin(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#4A2013]/60 block">2. Costura</label>
                    <input
                      type="number"
                      value={prodCosturaMin}
                      onChange={(e) => setProdCosturaMin(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#4A2013]/60 block">3. Montagem</label>
                    <input
                      type="number"
                      value={prodMontagemMin}
                      onChange={(e) => setProdMontagemMin(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[#4A2013]/60 block">4. Qualidade</label>
                    <input
                      type="number"
                      value={prodAcabamentoMin}
                      onChange={(e) => setProdAcabamentoMin(Number(e.target.value))}
                      className="w-full px-2 py-1.5 text-xs rounded-lg border font-mono font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Preço e Margem */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Preço de Venda Praticado (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={prodPrecoVenda}
                    onChange={(e) => setProdPrecoVenda(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-black text-sm text-[#B85324]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Margem de Lucro Alvo (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={prodMargemAlvo}
                    onChange={(e) => setProdMargemAlvo(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold text-sm text-[#2D7A4C]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2013] block mb-1">Instruções Técnicas para o Chão de Fábrica</label>
                <input
                  type="text"
                  value={prodInstrucoes}
                  onChange={(e) => setProdInstrucoes(e.target.value)}
                  placeholder="Ex: Agulha Schmetz 110/18 ponta lança nas partes de couro..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#4A2013]/10">
                <button
                  type="button"
                  onClick={() => setModalProdutoAberto(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {produtoEditando ? 'Salvar Alterações' : 'Cadastrar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CADASTRO / EDIÇÃO DE INSUMO COM FOTO              */}
      {/* ======================================================== */}
      {modalInsumoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
              <h3 className="text-xl font-bold text-[#4A2013]">
                {insumoEditando ? 'Editar Matéria-Prima' : 'Cadastrar Nova Matéria-Prima'}
              </h3>
              <button onClick={() => setModalInsumoAberto(false)} className="p-1 text-[#4A2013]/60 hover:text-[#4A2013]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSalvarInsumo} className="mt-4 space-y-4">
              <ImageUploadZone
                label="Amostra Física do Insumo (Foto do tecido, couro ou ferragem):"
                value={insImagemUrl}
                onChange={setInsImagemUrl}
                aspectRatio="square"
                placeholderText="Arraste ou selecione a foto da amostra física"
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">SKU</label>
                  <input
                    type="text"
                    required
                    value={insSku}
                    onChange={(e) => setInsSku(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Nome do Insumo</label>
                  <input
                    type="text"
                    required
                    value={insNome}
                    onChange={(e) => setInsNome(e.target.value)}
                    placeholder="Lona Panamá 100% Algodão 420g"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Categoria</label>
                  <select
                    value={insCategoria}
                    onChange={(e) => setInsCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-semibold"
                  >
                    <option value="Tecidos e Lonas">Tecidos e Lonas</option>
                    <option value="Couros e Sintéticos">Couros e Sintéticos</option>
                    <option value="Aviamentos e Zíperes">Aviamentos e Zíperes</option>
                    <option value="Metais e Ferragens">Metais e Ferragens</option>
                    <option value="Linhas e Fios">Linhas e Fios</option>
                    <option value="Forros">Forros</option>
                    <option value="Estruturadores e Espumas">Estruturadores e Espumas</option>
                    <option value="Embalagens e Tags">Embalagens e Tags</option>
                    <option value="Diversos">Diversos</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Unidade de Medida</label>
                  <select
                    value={insUnidade}
                    onChange={(e) => setInsUnidade(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold"
                  >
                    <option value="m">Metro linear (m)</option>
                    <option value="m2">Metro quadrado (m²)</option>
                    <option value="un">Unidade (un)</option>
                    <option value="kg">Quilo (kg)</option>
                    <option value="rolo">Rolo</option>
                    <option value="cone">Cone</option>
                    <option value="par">Par</option>
                    <option value="cm">Centímetro (cm)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Custo Unitário (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={insCusto}
                    onChange={(e) => setInsCusto(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold text-[#B85324]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Estoque Mínimo</label>
                  <input
                    type="number"
                    step="0.1"
                    value={insMinimo}
                    onChange={(e) => setInsMinimo(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Saldo Atual</label>
                  <input
                    type="number"
                    step="0.1"
                    value={insSaldo}
                    onChange={(e) => setInsSaldo(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold text-[#2D7A4C]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Fornecedor Principal</label>
                  <input
                    type="text"
                    value={insFornecedor}
                    onChange={(e) => setInsFornecedor(e.target.value)}
                    placeholder="Têxtil São Bento"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Localização no Almoxarifado</label>
                  <input
                    type="text"
                    value={insLocalizacao}
                    onChange={(e) => setInsLocalizacao(e.target.value)}
                    placeholder="Prateleira A1 - Rolo 04"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#4A2013]/10">
                <button
                  type="button"
                  onClick={() => setModalInsumoAberto(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold shadow-md cursor-pointer"
                >
                  {insumoEditando ? 'Salvar Insumo' : 'Cadastrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CADASTRO / EDIÇÃO DE FORNECEDOR                   */}
      {/* ======================================================== */}
      {modalFornecedorAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
              <h3 className="text-xl font-bold text-[#4A2013]">
                {fornecedorEditando ? 'Editar Fornecedor' : 'Cadastrar Novo Fornecedor'}
              </h3>
              <button onClick={() => setModalFornecedorAberto(false)} className="p-1 text-[#4A2013]/60 hover:text-[#4A2013]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSalvarFornecedor} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-[#4A2013] block mb-1">Nome Fantasia</label>
                <input
                  type="text"
                  required
                  value={fornFantasia}
                  onChange={(e) => setFornFantasia(e.target.value)}
                  placeholder="Têxtil São Bento"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2013] block mb-1">Razão Social</label>
                <input
                  type="text"
                  required
                  value={fornRazao}
                  onChange={(e) => setFornRazao(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">CNPJ / CPF</label>
                  <input
                    type="text"
                    value={fornCnpj}
                    onChange={(e) => setFornCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">WhatsApp / Telefone</label>
                  <input
                    type="text"
                    value={fornWhatsapp}
                    onChange={(e) => setFornWhatsapp(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Cidade / UF</label>
                  <input
                    type="text"
                    value={fornCidade}
                    onChange={(e) => setFornCidade(e.target.value)}
                    placeholder="Americana - SP"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Lead Time de Entrega (dias)</label>
                  <input
                    type="number"
                    value={fornLeadTime}
                    onChange={(e) => setFornLeadTime(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#4A2013]/10">
                <button
                  type="button"
                  onClick={() => setModalFornecedorAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold cursor-pointer"
                >
                  {fornecedorEditando ? 'Salvar Fornecedor' : 'Cadastrar Fornecedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: CADASTRO / EDIÇÃO DE OPERADOR COM FOTO/AVATAR     */}
      {/* ======================================================== */}
      {modalOperadorAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
              <h3 className="text-xl font-bold text-[#4A2013]">
                {operadorEditando ? 'Editar Operador' : 'Cadastrar Operador da Oficina'}
              </h3>
              <button onClick={() => setModalOperadorAberto(false)} className="p-1 text-[#4A2013]/60 hover:text-[#4A2013]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSalvarOperador} className="mt-4 space-y-4">
              <ImageUploadZone
                label="Foto de Identificação do Operador:"
                value={opFotoUrl}
                onChange={setOpFotoUrl}
                aspectRatio="avatar"
                placeholderText="Foto do colaborador para o terminal touch"
              />

              <div>
                <label className="text-xs font-bold text-[#4A2013] block mb-1">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={opNome}
                  onChange={(e) => setOpNome(e.target.value)}
                  placeholder="Carlos Eduardo Ramos"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Apelido na Linha</label>
                  <input
                    type="text"
                    required
                    value={opApelido}
                    onChange={(e) => setOpApelido(e.target.value)}
                    placeholder="Cadu"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Turno</label>
                  <select
                    value={opTurno}
                    onChange={(e) => setOpTurno(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                  >
                    <option value="Integral">Integral</option>
                    <option value="Manhã">Manhã</option>
                    <option value="Tarde">Tarde</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2013] block mb-1">Especialidade Principal</label>
                <select
                  value={opEspecialidade}
                  onChange={(e) => setOpEspecialidade(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-bold"
                >
                  <option value="Costura">Costura Industrial</option>
                  <option value="Corte">Corte & Modelagem</option>
                  <option value="Montagem">Montagem & Colagem</option>
                  <option value="Qualidade">Controle de Qualidade</option>
                  <option value="Polivalente">Polivalente (Todas as Etapas)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#4A2013]/10">
                <button
                  type="button"
                  onClick={() => setModalOperadorAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold cursor-pointer"
                >
                  {operadorEditando ? 'Salvar Operador' : 'Cadastrar Operador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: LANÇAMENTO DE DESPESA OPERACIONAL MENSAL          */}
      {/* ======================================================== */}
      {modalDespesaAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
              <h3 className="text-xl font-bold text-[#4A2013]">Lançar Despesa Operacional</h3>
              <button onClick={() => setModalDespesaAberto(false)} className="p-1 text-[#4A2013]/60 hover:text-[#4A2013]">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSalvarDespesa} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Mês de Referência</label>
                  <input
                    type="month"
                    required
                    value={despMes}
                    onChange={(e) => setDespMes(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#4A2013] block mb-1">Categoria</label>
                  <select
                    value={despCategoria}
                    onChange={(e) => setDespCategoria(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-semibold"
                  >
                    <option value="Ocupacao">Ocupação / Aluguel</option>
                    <option value="Utilidades">Energia / Luz / Água</option>
                    <option value="Manutencao">Manutenção de Máquinas</option>
                    <option value="MaoDeObraIndireta">Mão de Obra Oficina</option>
                    <option value="Administrativo">Software / Contabilidade</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2013] block mb-1">Descrição da Despesa</label>
                <input
                  type="text"
                  required
                  value={despDescricao}
                  onChange={(e) => setDespDescricao(e.target.value)}
                  placeholder="Ex: Energia Elétrica Trifásica das Máquinas"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#4A2013] block mb-1">Valor da Conta (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={despValor}
                  onChange={(e) => setDespValor(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-[#4A2013]/20 font-mono font-bold text-sm text-[#B85324]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#4A2013]/10">
                <button
                  type="button"
                  onClick={() => setModalDespesaAberto(false)}
                  className="px-4 py-2 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold cursor-pointer"
                >
                  Confirmar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
