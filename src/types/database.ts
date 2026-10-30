export type UnidadeMedida = 'm' | 'm2' | 'un' | 'kg' | 'par' | 'rolo' | 'cm' | 'cone';

export type CategoriaProduto = 'Bolsas' | 'Mochilas' | 'Carteiras' | 'Acessórios';

export type CategoriaInsumo = 
  | 'Tecidos e Lonas' 
  | 'Couros e Sintéticos' 
  | 'Aviamentos e Zíperes' 
  | 'Metais e Ferragens' 
  | 'Linhas e Fios' 
  | 'Forros' 
  | 'Estruturadores e Espumas' 
  | 'Embalagens e Tags'
  | 'Diversos';

export type StatusOP = 'CRIADA' | 'EM_PRODUCAO' | 'PAUSADA' | 'CONCLUIDA' | 'CANCELADA';

export type StatusEtapa = 'PENDENTE' | 'EM_ANDAMENTO' | 'PAUSADA' | 'CONCLUIDA';

export type NomeEtapa = 'Corte' | 'Costura' | 'Montagem' | 'Acabamento e Controle de Qualidade';

export type EspecialidadeOperador = 'Corte' | 'Costura' | 'Montagem' | 'Qualidade' | 'Polivalente';

export type CategoriaDespesa = 'Ocupacao' | 'Utilidades' | 'Manutencao' | 'MaoDeObraIndireta' | 'Administrativo';

export type MotivoPausa = 
  | 'Falta de Insumo'
  | 'Quebra de Agulha'
  | 'Ajuste de Máquina'
  | 'Descanso'
  | 'Dúvida de Projeto'
  | 'Manutenção Corretiva'
  | 'Outro';

export type TipoMovimentoEstoque = 'ENTRADA' | 'SAIDA';
export type TipoItemEstoque = 'INSUMO' | 'PRODUTO_ACABADO';

export interface Fornecedor {
  id: string;
  razao_social: string;
  nome_fantasia: string;
  cnpj_cpf?: string;
  contato_nome?: string;
  whatsapp?: string;
  email?: string;
  cidade?: string;
  uf?: string;
  lead_time_dias: number;
  condicao_pagamento?: string;
  categorias_fornecidas?: string[];
  ativo: boolean;
  criado_em?: string;
}

export interface Operador {
  id: string;
  nome: string;
  apelido: string;
  especialidade: EspecialidadeOperador;
  turno: 'Manhã' | 'Tarde' | 'Integral';
  foto_url?: string;
  ativo: boolean;
  criado_em?: string;
}

export interface DespesaOperacional {
  id: string;
  mes_referencia: string; // Ex: '2026-08', '2026-09', '2026-10'
  categoria: CategoriaDespesa;
  descricao: string;
  valor: number;
  pago: boolean;
  criado_em?: string;
}

export interface Insumo {
  id: string;
  sku: string;
  nome: string;
  unidade_medida: UnidadeMedida;
  custo_unitario: number;
  estoque_minimo: number;
  estoque_maximo?: number;
  saldo_atual: number;
  fornecedor?: string;
  fornecedor_id?: string;
  categoria?: CategoriaInsumo;
  imagem_url?: string;
  localizacao_almoxarifado?: string;
  codigo_fornecedor?: string;
  lead_time_dias?: number;
  cor_pantone?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface DimensoesProduto {
  largura_cm: number;
  altura_cm: number;
  profundidade_cm: number;
  peso_gramas?: number;
}

export interface TemposPorEtapa {
  corte_min: number;
  costura_min: number;
  montagem_min: number;
  acabamento_min: number;
}

export interface ProdutoAcabado {
  id: string;
  sku: string;
  nome: string;
  categoria: CategoriaProduto;
  colecao?: string;
  descricao?: string;
  preco_venda: number;
  margem_alvo: number; // Percentual (ex: 38.00%)
  tempo_padrao_total: number; // Em minutos
  tempos_por_etapa?: TemposPorEtapa;
  saldo_estoque: number;
  imagem_url?: string;
  galeria_fotos?: string[];
  dimensoes?: DimensoesProduto;
  instrucoes_costura?: string;
  criado_em?: string;
  atualizado_em?: string;
  itens_ficha?: FichaTecnicaItemComInsumo[];
}

export interface FichaTecnicaItem {
  id: string;
  produto_id: string;
  insumo_id: string;
  quantidade_consumo: number;
  percentual_perda: number; // Ex: 5.00%
  etapa_consumo?: NomeEtapa;
  criado_em?: string;
}

export interface FichaTecnicaItemComInsumo extends FichaTecnicaItem {
  insumo?: Insumo;
}

export interface ConfiguracaoCustos {
  id: string;
  media_despesas_3m: number;
  dias_uteis_mes: number;
  horas_trabalhadas_dia: number;
  custo_hora_calculado: number;
  taxa_operacional_fixa_unidade: number;
  atualizado_em?: string;
}

export interface OrdemProducao {
  id: string;
  codigo_op: string;
  produto_id: string;
  quantidade: number;
  status: StatusOP;
  etapa_atual: NomeEtapa;
  data_inicio?: string;
  data_conclusao?: string;
  tempo_total_real: number; // Segundos líquidos trabalhados
  custo_total_real: number;
  custo_mo_orcado: number;
  custo_mo_real: number;
  operador_responsavel?: string;
  operador_id?: string;
  notas_kaizen?: string;
  criado_em?: string;
  atualizado_em?: string;
  produto?: ProdutoAcabado;
  etapas?: OpEtapa[];
}

export interface ChecklistQualidade {
  costura_alinhada: boolean;
  sem_fios_soltos: boolean;
  ziper_testado: boolean;
  etiqueta_posicionada: boolean;
  limpeza_geral: boolean;
  medidas_conferidas: boolean;
}

export interface OpEtapa {
  id: string;
  op_id: string;
  etapa_nome: NomeEtapa;
  sequencia: number;
  tempo_padrao_min: number;
  tempo_real_segundos: number;
  status: StatusEtapa;
  operador_nome?: string;
  operador_id?: string;
  inicio_etapa?: string;
  fim_etapa?: string;
  aprovado_qualidade?: boolean;
  checklist_qualidade?: ChecklistQualidade;
  notas?: string;
  pausas?: OpPausa[];
}

export interface OpPausa {
  id: string;
  etapa_id: string;
  motivo_pausa: MotivoPausa;
  inicio_pausa: string;
  fim_pausa?: string;
  duracao_segundos: number;
  observacao?: string;
}

export interface MovimentacaoEstoque {
  id: string;
  item_tipo: TipoItemEstoque;
  item_id: string;
  item_nome: string;
  tipo_movimento: TipoMovimentoEstoque;
  quantidade: number;
  motivo: string;
  op_id?: string;
  operador?: string;
  criado_em: string;
}

export interface CalculoPrecificacao {
  custo_insumos_total: number;
  custo_mo_orcado: number;
  custo_operacional_rateado: number;
  custo_total_producao: number;
  margem_lucro_percentual: number;
  margem_lucro_valor: number;
  preco_venda_sugerido: number;
  detalhe_insumos: {
    insumo_nome: string;
    unidade: string;
    consumo_base: number;
    perda_percentual: number;
    consumo_com_perda: number;
    custo_unitario: number;
    subtotal: number;
  }[];
}
