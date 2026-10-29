import { 
  ConfiguracaoCustos, 
  FichaTecnicaItemComInsumo, 
  ProdutoAcabado, 
  CalculoPrecificacao 
} from '../types/database';

/**
 * 1. Calcula a Taxa Horária Dinâmica de Mão de Obra
 * Fórmula: Média Despesas 3M / (Dias Úteis Médios * Horas Diárias Trabalhadas)
 */
export function calcularTaxaHorariaMO(config: Pick<ConfiguracaoCustos, 'media_despesas_3m' | 'dias_uteis_mes' | 'horas_trabalhadas_dia'>): number {
  const horasTotaisMes = config.dias_uteis_mes * config.horas_trabalhadas_dia;
  if (horasTotaisMes <= 0) return 0;
  return config.media_despesas_3m / horasTotaisMes;
}

/**
 * 2. Calcula a Ficha Técnica Completa (BOM Enxuta) e Preço de Venda Sugerido (PVS)
 */
export function calcularPrecificacaoProduto(
  produto: Pick<ProdutoAcabado, 'tempo_padrao_total' | 'margem_alvo'>,
  itensFicha: FichaTecnicaItemComInsumo[],
  taxaHorariaMO: number,
  taxaOperacionalRateada: number = 0
): CalculoPrecificacao {
  // A) Custo Total de Insumos com Fator de Perda
  let custoInsumosTotal = 0;
  const detalheInsumos = itensFicha.map((item) => {
    const custoUnitario = item.insumo?.custo_unitario ?? 0;
    const fatorPerda = 1 + (item.percentual_perda / 100);
    const consumoComPerda = item.quantidade_consumo * fatorPerda;
    const subtotal = consumoComPerda * custoUnitario;
    
    custoInsumosTotal += subtotal;

    return {
      insumo_nome: item.insumo?.nome ?? 'Insumo não identificado',
      unidade: item.insumo?.unidade_medida ?? 'un',
      consumo_base: item.quantidade_consumo,
      perda_percentual: item.percentual_perda,
      consumo_com_perda: consumoComPerda,
      custo_unitario: custoUnitario,
      subtotal: subtotal,
    };
  });

  // B) Mão de Obra Orçada
  // Tempo padrão em horas = minutos / 60
  const tempoPadraoHoras = (produto.tempo_padrao_total || 0) / 60;
  const custoMoOrcado = tempoPadraoHoras * taxaHorariaMO;

  // C) Custo Total de Produção
  const custoTotalProducao = custoInsumosTotal + custoMoOrcado + taxaOperacionalRateada;

  // D) Preço de Venda Sugerido (PVS) com Mark-up divisor
  // PVS = Custo Total / (1 - (Margem / 100))
  const margemFracao = Math.min(Math.max((produto.margem_alvo || 0) / 100, 0), 0.95);
  const divisor = 1 - margemFracao;
  const precoVendaSugerido = divisor > 0 ? custoTotalProducao / divisor : custoTotalProducao;
  const margemLucroValor = precoVendaSugerido - custoTotalProducao;

  return {
    custo_insumos_total: Number(custoInsumosTotal.toFixed(2)),
    custo_mo_orcado: Number(custoMoOrcado.toFixed(2)),
    custo_operacional_rateado: Number(taxaOperacionalRateada.toFixed(2)),
    custo_total_producao: Number(custoTotalProducao.toFixed(2)),
    margem_lucro_percentual: produto.margem_alvo,
    margem_lucro_valor: Number(margemLucroValor.toFixed(2)),
    preco_venda_sugerido: Number(precoVendaSugerido.toFixed(2)),
    detalhe_insumos: detalheInsumos,
  };
}

/**
 * 3. Classificação Andon e Análise de Desvio de Chão de Fábrica
 */
export interface AnaliseDesvioAndon {
  status: 'NORMAL' | 'ATENCAO' | 'GARGALO_CRITICO';
  corHex: string;
  desvioPercentual: number;
  tempoPadraoSegundos: number;
  tempoRealSegundos: number;
  custoMoOrcado: number;
  custoMoReal: number;
  diferencaCustoMo: number;
  mensagem: string;
}

export function analisarDesvioEtapa(
  tempoPadraoMin: number,
  tempoRealSegundos: number,
  taxaHorariaMO: number,
  quantidadeOp: number = 1
): AnaliseDesvioAndon {
  const tempoPadraoSegundos = Math.round(tempoPadraoMin * 60 * quantidadeOp);
  const diferencaSegundos = tempoRealSegundos - tempoPadraoSegundos;
  
  const desvioPercentual = tempoPadraoSegundos > 0
    ? Number(((diferencaSegundos / tempoPadraoSegundos) * 100).toFixed(1))
    : 0;

  const custoMoOrcado = (tempoPadraoSegundos / 3600) * taxaHorariaMO;
  const custoMoReal = (tempoRealSegundos / 3600) * taxaHorariaMO;
  const diferencaCustoMo = custoMoReal - custoMoOrcado;

  if (desvioPercentual > 20) {
    return {
      status: 'GARGALO_CRITICO',
      corHex: '#991B1B', // Vinho Alerta
      desvioPercentual,
      tempoPadraoSegundos,
      tempoRealSegundos,
      custoMoOrcado: Number(custoMoOrcado.toFixed(2)),
      custoMoReal: Number(custoMoReal.toFixed(2)),
      diferencaCustoMo: Number(diferencaCustoMo.toFixed(2)),
      mensagem: `Gargalo identificado! Desvio de ${desvioPercentual}% acima do tempo padrão estipulado.`,
    };
  }

  if (desvioPercentual > 0) {
    return {
      status: 'ATENCAO',
      corHex: '#D97706', // Âmbar
      desvioPercentual,
      tempoPadraoSegundos,
      tempoRealSegundos,
      custoMoOrcado: Number(custoMoOrcado.toFixed(2)),
      custoMoReal: Number(custoMoReal.toFixed(2)),
      diferencaCustoMo: Number(diferencaCustoMo.toFixed(2)),
      mensagem: `Atenção: ritmo ligeiramente acima do previsto (+${desvioPercentual}%).`,
    };
  }

  return {
    status: 'NORMAL',
    corHex: '#2D7A4C', // Verde Suave
    desvioPercentual,
    tempoPadraoSegundos,
    tempoRealSegundos,
    custoMoOrcado: Number(custoMoOrcado.toFixed(2)),
    custoMoReal: Number(custoMoReal.toFixed(2)),
    diferencaCustoMo: Number(diferencaCustoMo.toFixed(2)),
    mensagem: 'Produção em ritmo normal e dentro da meta Lean.',
  };
}

/**
 * Utilitários de formatação pt-BR
 */
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor || 0);
}

export function formatarSegundos(segundos: number): string {
  const h = Math.floor(segundos / 3600);
  const m = Math.floor((segundos % 3600) / 60);
  const s = segundos % 60;
  
  if (h > 0) {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}
