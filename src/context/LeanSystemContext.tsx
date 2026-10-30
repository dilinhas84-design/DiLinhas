import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Insumo, 
  ProdutoAcabado, 
  ConfiguracaoCustos, 
  OrdemProducao, 
  MovimentacaoEstoque,
  NomeEtapa,
  MotivoPausa,
  ChecklistQualidade,
  OpEtapa,
  FichaTecnicaItemComInsumo,
  Fornecedor,
  Operador,
  DespesaOperacional
} from '../types/database';
import { 
  INITIAL_CONFIG_CUSTOS, 
  INITIAL_INSUMOS, 
  INITIAL_PRODUTOS, 
  INITIAL_OPS, 
  INITIAL_KARDEX,
  INITIAL_FICHA_TECNICA,
  INITIAL_FORNECEDORES,
  INITIAL_OPERADORES,
  INITIAL_DESPESAS
} from '../lib/mockSeedData';
import { calcularTaxaHorariaMO } from '../lib/leanPricingEngine';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import confetti from 'canvas-confetti';

interface LeanContextType {
  // Dados
  configCustos: ConfiguracaoCustos;
  taxaHorariaMO: number;
  insumos: Insumo[];
  produtos: ProdutoAcabado[];
  fornecedores: Fornecedor[];
  operadores: Operador[];
  despesasOperacionais: DespesaOperacional[];
  ordensProducao: OrdemProducao[];
  kardex: MovimentacaoEstoque[];
  fichasTecnicas: Record<string, FichaTecnicaItemComInsumo[]>;
  isOnlineSupabase: boolean;
  isLoading: boolean;

  // Ações do Chão de Fábrica (MES)
  iniciarEtapa: (opId: string, etapaId: string, operadorNome: string, operadorId?: string) => Promise<void>;
  pausarEtapa: (opId: string, etapaId: string, motivo: MotivoPausa, obs?: string) => Promise<void>;
  retomarEtapa: (opId: string, etapaId: string) => Promise<void>;
  concluirEtapa: (
    opId: string, 
    etapaId: string, 
    checklist?: ChecklistQualidade, 
    notas?: string
  ) => Promise<void>;
  salvarNotasKaizen: (opId: string, notas: string) => Promise<void>;

  // Ações de Engenharia & Custos
  atualizarConfigCustos: (novosDados: Partial<ConfiguracaoCustos>) => Promise<void>;
  salvarFichaTecnica: (produtoId: string, itens: FichaTecnicaItemComInsumo[]) => Promise<void>;
  criarProduto: (produto: Omit<ProdutoAcabado, 'id' | 'itens_ficha'>, itensFicha: FichaTecnicaItemComInsumo[]) => Promise<void>;
  atualizarProduto: (id: string, produto: Partial<ProdutoAcabado>) => Promise<void>;
  removerProduto: (id: string) => Promise<void>;

  // Ações de Insumos (CRUD)
  adicionarInsumo: (insumo: Omit<Insumo, 'id'>) => Promise<void>;
  atualizarInsumo: (id: string, insumo: Partial<Insumo>) => Promise<void>;
  removerInsumo: (id: string) => Promise<void>;

  // Ações de Fornecedores (CRUD)
  adicionarFornecedor: (fornecedor: Omit<Fornecedor, 'id'>) => Promise<void>;
  atualizarFornecedor: (id: string, fornecedor: Partial<Fornecedor>) => Promise<void>;
  removerFornecedor: (id: string) => Promise<void>;

  // Ações de Operadores (CRUD)
  adicionarOperador: (operador: Omit<Operador, 'id'>) => Promise<void>;
  atualizarOperador: (id: string, operador: Partial<Operador>) => Promise<void>;
  removerOperador: (id: string) => Promise<void>;

  // Ações de Despesas
  adicionarDespesa: (despesa: Omit<DespesaOperacional, 'id'>) => Promise<void>;
  removerDespesa: (id: string) => Promise<void>;

  // Ações de PCP & Ordens
  criarOrdemProducao: (produtoId: string, quantidade: number, operador: string, operadorId?: string) => Promise<string>;
  cancelarOrdemProducao: (opId: string) => Promise<void>;

  // Ações de Estoque (WMS)
  registrarMovimentacaoManual: (
    tipoItem: 'INSUMO' | 'PRODUTO_ACABADO',
    itemId: string,
    tipoMovimento: 'ENTRADA' | 'SAIDA',
    quantidade: number,
    motivo: string,
    operador?: string
  ) => Promise<void>;
  recarregarDados: () => Promise<void>;
}

const LeanSystemContext = createContext<LeanContextType | null>(null);

const STORAGE_KEYS = {
  CONFIG: 'dilinhas_config_custos',
  INSUMOS: 'dilinhas_insumos',
  PRODUTOS: 'dilinhas_produtos',
  FORNECEDORES: 'dilinhas_fornecedores',
  OPERADORES: 'dilinhas_operadores',
  DESPESAS: 'dilinhas_despesas',
  OPS: 'dilinhas_ops',
  KARDEX: 'dilinhas_kardex',
  FICHAS: 'dilinhas_fichas',
};

export const LeanSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [configCustos, setConfigCustos] = useState<ConfiguracaoCustos>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
    return saved ? JSON.parse(saved) : INITIAL_CONFIG_CUSTOS;
  });

  const [insumos, setInsumos] = useState<Insumo[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INSUMOS);
    return saved ? JSON.parse(saved) : INITIAL_INSUMOS;
  });

  const [produtos, setProdutos] = useState<ProdutoAcabado[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUTOS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUTOS;
  });

  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FORNECEDORES);
    return saved ? JSON.parse(saved) : INITIAL_FORNECEDORES;
  });

  const [operadores, setOperadores] = useState<Operador[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OPERADORES);
    return saved ? JSON.parse(saved) : INITIAL_OPERADORES;
  });

  const [despesasOperacionais, setDespesasOperacionais] = useState<DespesaOperacional[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DESPESAS);
    return saved ? JSON.parse(saved) : INITIAL_DESPESAS;
  });

  const [fichasTecnicas, setFichasTecnicas] = useState<Record<string, FichaTecnicaItemComInsumo[]>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FICHAS);
    return saved ? JSON.parse(saved) : INITIAL_FICHA_TECNICA;
  });

  const [ordensProducao, setOrdensProducao] = useState<OrdemProducao[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OPS);
    return saved ? JSON.parse(saved) : INITIAL_OPS;
  });

  const [kardex, setKardex] = useState<MovimentacaoEstoque[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.KARDEX);
    return saved ? JSON.parse(saved) : INITIAL_KARDEX;
  });

  const [isOnlineSupabase, setIsOnlineSupabase] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Recalcular média das despesas dos últimos 3 meses dinamicamente se houver dados
  useEffect(() => {
    if (despesasOperacionais.length > 0) {
      // Agrupar por mes_referencia
      const mesesMap: Record<string, number> = {};
      despesasOperacionais.forEach((d) => {
        mesesMap[d.mes_referencia] = (mesesMap[d.mes_referencia] || 0) + Number(d.valor);
      });

      const meses = Object.keys(mesesMap).sort().reverse().slice(0, 3);
      if (meses.length > 0) {
        const total = meses.reduce((acc, m) => acc + mesesMap[m], 0);
        const media = Number((total / meses.length).toFixed(2));

        setConfigCustos((prev) => {
          if (prev.media_despesas_3m !== media) {
            const horasTotais = prev.dias_uteis_mes * prev.horas_trabalhadas_dia;
            return {
              ...prev,
              media_despesas_3m: media,
              custo_hora_calculado: horasTotais > 0 ? media / horasTotais : 0,
            };
          }
          return prev;
        });
      }
    }
  }, [despesasOperacionais]);

  // Taxa Horária calculada
  const taxaHorariaMO = useMemo(() => {
    return calcularTaxaHorariaMO(configCustos);
  }, [configCustos]);

  // Persistir em LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(configCustos));
  }, [configCustos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INSUMOS, JSON.stringify(insumos));
  }, [insumos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUTOS, JSON.stringify(produtos));
  }, [produtos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FORNECEDORES, JSON.stringify(fornecedores));
  }, [fornecedores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPERADORES, JSON.stringify(operadores));
  }, [operadores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DESPESAS, JSON.stringify(despesasOperacionais));
  }, [despesasOperacionais]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OPS, JSON.stringify(ordensProducao));
  }, [ordensProducao]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.KARDEX, JSON.stringify(kardex));
  }, [kardex]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FICHAS, JSON.stringify(fichasTecnicas));
  }, [fichasTecnicas]);

  // Tentar carregar dados do Supabase
  const recarregarDados = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    setIsLoading(true);
    try {
      const { data: insumosData, error } = await supabase.from('insumos').select('*');
      if (!error && insumosData && insumosData.length > 0) {
        setIsOnlineSupabase(true);
        setInsumos(insumosData);

        const { data: configData } = await supabase.from('configuracao_custos').select('*').limit(1);
        if (configData && configData.length > 0) setConfigCustos(configData[0]);

        const { data: prodData } = await supabase.from('produtos_acabados').select('*');
        if (prodData && prodData.length > 0) setProdutos(prodData);

        const { data: fornData } = await supabase.from('fornecedores').select('*');
        if (fornData && fornData.length > 0) setFornecedores(fornData);

        const { data: opData } = await supabase.from('operadores').select('*');
        if (opData && opData.length > 0) setOperadores(opData);

        const { data: despData } = await supabase.from('despesas_operacionais').select('*');
        if (despData && despData.length > 0) setDespesasOperacionais(despData);

        const { data: opsData } = await supabase.from('ordens_producao').select('*, etapas:op_etapas(*)');
        if (opsData && opsData.length > 0) setOrdensProducao(opsData);

        const { data: kardexData } = await supabase.from('movimentacoes_estoque').select('*').order('criado_em', { ascending: false }).limit(100);
        if (kardexData && kardexData.length > 0) setKardex(kardexData);
      } else {
        setIsOnlineSupabase(false);
      }
    } catch {
      setIsOnlineSupabase(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    recarregarDados();
  }, [recarregarDados]);

  // Cronômetro em background para etapas 'EM_ANDAMENTO'
  useEffect(() => {
    const timer = setInterval(() => {
      setOrdensProducao((prevOps) => {
        let hasChanges = false;
        const newOps = prevOps.map((op) => {
          if (op.status !== 'EM_PRODUCAO' || !op.etapas) return op;

          let opTempoAdicionado = 0;
          const newEtapas = op.etapas.map((etapa) => {
            if (etapa.status === 'EM_ANDAMENTO') {
              hasChanges = true;
              opTempoAdicionado += 1;
              return {
                ...etapa,
                tempo_real_segundos: (etapa.tempo_real_segundos || 0) + 1,
              };
            }
            return etapa;
          });

          if (opTempoAdicionado > 0) {
            const novoTempoReal = (op.tempo_total_real || 0) + opTempoAdicionado;
            const custoMoReal = (novoTempoReal / 3600) * taxaHorariaMO;
            return {
              ...op,
              tempo_total_real: novoTempoReal,
              custo_mo_real: Number(custoMoReal.toFixed(2)),
              etapas: newEtapas,
            };
          }

          return op;
        });

        return hasChanges ? newOps : prevOps;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [taxaHorariaMO]);

  // =========================================================================
  // CHÃO DE FÁBRICA: INICIAR ETAPA (COM BAIXA AUTOMÁTICA JIT NA 1ª ETAPA)
  // =========================================================================
  const iniciarEtapa = async (
    opId: string, 
    etapaId: string, 
    operadorNome: string,
    operadorId?: string
  ) => {
    const agora = new Date().toISOString();
    let baixaNecessaria = false;
    let produtoOp: ProdutoAcabado | undefined;
    let qtdOp = 1;
    let codigoOp = '';

    setOrdensProducao((prev) =>
      prev.map((op) => {
        if (op.id !== opId) return op;

        if (op.status === 'CRIADA') {
          baixaNecessaria = true;
          produtoOp = produtos.find((p) => p.id === op.produto_id) || op.produto;
          qtdOp = op.quantidade;
          codigoOp = op.codigo_op;
        }

        const etapasAtualizadas = (op.etapas || []).map((et) => {
          if (et.id === etapaId) {
            return {
              ...et,
              status: 'EM_ANDAMENTO' as const,
              operador_nome: operadorNome || et.operador_nome || 'Operador',
              operador_id: operadorId || et.operador_id,
              inicio_etapa: et.inicio_etapa || agora,
            };
          }
          return et;
        });

        const etapaAtualObj = etapasAtualizadas.find((e) => e.id === etapaId);

        return {
          ...op,
          status: 'EM_PRODUCAO',
          etapa_atual: etapaAtualObj?.etapa_nome || op.etapa_atual,
          data_inicio: op.data_inicio || agora,
          operador_responsavel: operadorNome || op.operador_responsavel,
          operador_id: operadorId || op.operador_id,
          etapas: etapasAtualizadas,
        };
      })
    );

    // Efetuar Baixa Automática de Insumos (Just-in-Time)
    if (baixaNecessaria && produtoOp) {
      const ficha = fichasTecnicas[produtoOp.id] || produtoOp.itens_ficha || [];
      const movimentacoesCriadas: MovimentacaoEstoque[] = [];

      setInsumos((prevInsumos) => {
        const novosInsumos = [...prevInsumos];

        ficha.forEach((item) => {
          const fatorPerda = 1 + (item.percentual_perda / 100);
          const consumoTotal = item.quantidade_consumo * fatorPerda * qtdOp;

          const idx = novosInsumos.findIndex((i) => i.id === item.insumo_id);
          if (idx !== -1) {
            novosInsumos[idx] = {
              ...novosInsumos[idx],
              saldo_atual: Number((novosInsumos[idx].saldo_atual - consumoTotal).toFixed(3)),
            };

            movimentacoesCriadas.push({
              id: `k-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              item_tipo: 'INSUMO',
              item_id: item.insumo_id,
              item_nome: novosInsumos[idx].nome,
              tipo_movimento: 'SAIDA',
              quantidade: Number(consumoTotal.toFixed(3)),
              motivo: `Baixa Automática JIT - OP: ${codigoOp}`,
              op_id: opId,
              operador: operadorNome || 'Chão de Fábrica',
              criado_em: agora,
            });
          }
        });

        return novosInsumos;
      });

      if (movimentacoesCriadas.length > 0) {
        setKardex((prevK) => [...movimentacoesCriadas, ...prevK]);
      }
    }
  };

  const pausarEtapa = async (opId: string, etapaId: string, motivo: MotivoPausa, obs?: string) => {
    const agora = new Date().toISOString();
    setOrdensProducao((prev) =>
      prev.map((op) => {
        if (op.id !== opId) return op;

        const etapasAtualizadas = (op.etapas || []).map((et) => {
          if (et.id === etapaId) {
            const novaPausa = {
              id: `p-${Date.now()}`,
              etapa_id: etapaId,
              motivo_pausa: motivo,
              inicio_pausa: agora,
              duracao_segundos: 0,
              observacao: obs,
            };

            return {
              ...et,
              status: 'PAUSADA' as const,
              pausas: [...(et.pausas || []), novaPausa],
            };
          }
          return et;
        });

        return {
          ...op,
          status: 'PAUSADA',
          etapas: etapasAtualizadas,
        };
      })
    );
  };

  const retomarEtapa = async (opId: string, etapaId: string) => {
    const agora = new Date().toISOString();
    setOrdensProducao((prev) =>
      prev.map((op) => {
        if (op.id !== opId) return op;

        const etapasAtualizadas = (op.etapas || []).map((et) => {
          if (et.id === etapaId) {
            const pausasAtualizadas = (et.pausas || []).map((p, idx, arr) => {
              if (idx === arr.length - 1 && !p.fim_pausa) {
                const duracao = Math.round(
                  (new Date(agora).getTime() - new Date(p.inicio_pausa).getTime()) / 1000
                );
                return {
                  ...p,
                  fim_pausa: agora,
                  duracao_segundos: Math.max(duracao, 0),
                };
              }
              return p;
            });

            return {
              ...et,
              status: 'EM_ANDAMENTO' as const,
              pausas: pausasAtualizadas,
            };
          }
          return et;
        });

        return {
          ...op,
          status: 'EM_PRODUCAO',
          etapas: etapasAtualizadas,
        };
      })
    );
  };

  const concluirEtapa = async (
    opId: string, 
    etapaId: string, 
    checklist?: ChecklistQualidade, 
    notas?: string
  ) => {
    const agora = new Date().toISOString();
    let opConcluidaGeral = false;
    let produtoParaAdicionar: ProdutoAcabado | undefined;
    let quantidadeAdicionar = 0;
    let codigoOpConcluida = '';
    let operadorConclusao = '';

    setOrdensProducao((prev) =>
      prev.map((op) => {
        if (op.id !== opId) return op;

        let todasConcluidas = true;
        let proximaEtapaNome: NomeEtapa = op.etapa_atual;

        const etapasAtualizadas = (op.etapas || []).map((et) => {
          if (et.id === etapaId) {
            const pausasFechadas = (et.pausas || []).map((p) => {
              if (!p.fim_pausa) {
                const dur = Math.round((new Date(agora).getTime() - new Date(p.inicio_pausa).getTime()) / 1000);
                return { ...p, fim_pausa: agora, duracao_segundos: Math.max(dur, 0) };
              }
              return p;
            });

            const isQualidade = et.etapa_nome === 'Acabamento e Controle de Qualidade';
            if (isQualidade) {
              opConcluidaGeral = true;
              produtoParaAdicionar = produtos.find((p) => p.id === op.produto_id) || op.produto;
              quantidadeAdicionar = op.quantidade;
              codigoOpConcluida = op.codigo_op;
              operadorConclusao = et.operador_nome || 'Controle de Qualidade';
            }

            return {
              ...et,
              status: 'CONCLUIDA' as const,
              fim_etapa: agora,
              aprovado_qualidade: isQualidade ? true : et.aprovado_qualidade,
              checklist_qualidade: checklist || et.checklist_qualidade,
              notas: notas || et.notas,
              pausas: pausasFechadas,
            };
          }

          if (et.status !== 'CONCLUIDA') {
            todasConcluidas = false;
          }
          return et;
        });

        const prox = etapasAtualizadas.find((e) => e.status === 'PENDENTE');
        if (prox) {
          proximaEtapaNome = prox.etapa_nome;
        }

        const statusFinal: StatusOP = opConcluidaGeral ? 'CONCLUIDA' : 'EM_PRODUCAO';

        return {
          ...op,
          status: statusFinal,
          etapa_atual: proximaEtapaNome,
          data_conclusao: opConcluidaGeral ? agora : undefined,
          etapas: etapasAtualizadas,
        };
      })
    );

    // Entrada Automática no Estoque de Produtos Acabados
    if (opConcluidaGeral && produtoParaAdicionar) {
      const prodId = (produtoParaAdicionar as ProdutoAcabado).id;
      const prodNome = (produtoParaAdicionar as ProdutoAcabado).nome;

      setProdutos((prev) =>
        prev.map((p) => (p.id === prodId ? { ...p, saldo_estoque: (p.saldo_estoque || 0) + quantidadeAdicionar } : p))
      );

      const novoKardex: MovimentacaoEstoque = {
        id: `k-${Date.now()}`,
        item_tipo: 'PRODUTO_ACABADO',
        item_id: prodId,
        item_nome: prodNome,
        tipo_movimento: 'ENTRADA',
        quantidade: quantidadeAdicionar,
        motivo: `Entrada Automática - OP Concluída com Qualidade Aprovada: ${codigoOpConcluida}`,
        op_id: opId,
        operador: operadorConclusao,
        criado_em: agora,
      };

      setKardex((prev) => [novoKardex, ...prev]);

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B85324', '#2D7A4C', '#F9E8B8'],
        });
      } catch {}
    }
  };

  const salvarNotasKaizen = async (opId: string, notas: string) => {
    setOrdensProducao((prev) =>
      prev.map((op) => (op.id === opId ? { ...op, notas_kaizen: notas } : op))
    );
  };

  const atualizarConfigCustos = async (novosDados: Partial<ConfiguracaoCustos>) => {
    setConfigCustos((prev) => {
      const updated = { ...prev, ...novosDados, atualizado_em: new Date().toISOString() };
      const horasTotais = updated.dias_uteis_mes * updated.horas_trabalhadas_dia;
      updated.custo_hora_calculado = horasTotais > 0 ? updated.media_despesas_3m / horasTotais : 0;
      return updated;
    });
  };

  const salvarFichaTecnica = async (produtoId: string, itens: FichaTecnicaItemComInsumo[]) => {
    setFichasTecnicas((prev) => ({
      ...prev,
      [produtoId]: itens,
    }));

    setProdutos((prev) =>
      prev.map((p) => (p.id === produtoId ? { ...p, itens_ficha: itens } : p))
    );
  };

  // CRUD PRODUTOS
  const criarProduto = async (
    produtoData: Omit<ProdutoAcabado, 'id' | 'itens_ficha'>,
    itensFicha: FichaTecnicaItemComInsumo[]
  ) => {
    const novoProdutoId = `p-${Date.now()}`;
    const novoProduto: ProdutoAcabado = {
      ...produtoData,
      id: novoProdutoId,
      itens_ficha: itensFicha,
    };

    setProdutos((prev) => [novoProduto, ...prev]);
    setFichasTecnicas((prev) => ({
      ...prev,
      [novoProdutoId]: itensFicha,
    }));
  };

  const atualizarProduto = async (id: string, produtoAtualizado: Partial<ProdutoAcabado>) => {
    setProdutos((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...produtoAtualizado, atualizado_em: new Date().toISOString() } : p))
    );
  };

  const removerProduto = async (id: string) => {
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  };

  // CRUD INSUMOS
  const adicionarInsumo = async (novoInsumo: Omit<Insumo, 'id'>) => {
    const id = `ins-${Date.now()}`;
    const insumoCriado: Insumo = { ...novoInsumo, id };
    setInsumos((prev) => [insumoCriado, ...prev]);
  };

  const atualizarInsumo = async (id: string, insumoAtualizado: Partial<Insumo>) => {
    setInsumos((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...insumoAtualizado, atualizado_em: new Date().toISOString() } : i))
    );
  };

  const removerInsumo = async (id: string) => {
    setInsumos((prev) => prev.filter((i) => i.id !== id));
  };

  // CRUD FORNECEDORES
  const adicionarFornecedor = async (novoFornecedor: Omit<Fornecedor, 'id'>) => {
    const id = `forn-${Date.now()}`;
    setFornecedores((prev) => [{ ...novoFornecedor, id, criado_em: new Date().toISOString() }, ...prev]);
  };

  const atualizarFornecedor = async (id: string, fornecedorAtualizado: Partial<Fornecedor>) => {
    setFornecedores((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...fornecedorAtualizado } : f))
    );
  };

  const removerFornecedor = async (id: string) => {
    setFornecedores((prev) => prev.filter((f) => f.id !== id));
  };

  // CRUD OPERADORES
  const adicionarOperador = async (novoOperador: Omit<Operador, 'id'>) => {
    const id = `op-user-${Date.now()}`;
    setOperadores((prev) => [{ ...novoOperador, id, criado_em: new Date().toISOString() }, ...prev]);
  };

  const atualizarOperador = async (id: string, operadorAtualizado: Partial<Operador>) => {
    setOperadores((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...operadorAtualizado } : o))
    );
  };

  const removerOperador = async (id: string) => {
    setOperadores((prev) => prev.filter((o) => o.id !== id));
  };

  // CRUD DESPESAS
  const adicionarDespesa = async (novaDespesa: Omit<DespesaOperacional, 'id'>) => {
    const id = `desp-${Date.now()}`;
    setDespesasOperacionais((prev) => [{ ...novaDespesa, id, criado_em: new Date().toISOString() }, ...prev]);
  };

  const removerDespesa = async (id: string) => {
    setDespesasOperacionais((prev) => prev.filter((d) => d.id !== id));
  };

  // PCP
  const criarOrdemProducao = async (
    produtoId: string, 
    quantidade: number, 
    operador: string,
    operadorId?: string
  ): Promise<string> => {
    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) throw new Error('Produto não encontrado');

    const opSeq = ordensProducao.length + 43;
    const codigoOp = `OP-2026-${opSeq.toString().padStart(4, '0')}`;
    const opId = `op-${Date.now()}`;

    const temposEtapa = produto.tempos_por_etapa || {
      corte_min: Number(((produto.tempo_padrao_total || 60) * 0.2).toFixed(1)),
      costura_min: Number(((produto.tempo_padrao_total || 60) * 0.45).toFixed(1)),
      montagem_min: Number(((produto.tempo_padrao_total || 60) * 0.2).toFixed(1)),
      acabamento_min: Number(((produto.tempo_padrao_total || 60) * 0.15).toFixed(1)),
    };

    const tempoTotalMin = produto.tempo_padrao_total || 60;
    const custoMoOrcado = ((tempoTotalMin * quantidade) / 60) * taxaHorariaMO;

    const etapasIniciais: OpEtapa[] = [
      { id: `e-${Date.now()}-1`, op_id: opId, etapa_nome: 'Corte', sequencia: 1, tempo_padrao_min: temposEtapa.corte_min, tempo_real_segundos: 0, status: 'PENDENTE' },
      { id: `e-${Date.now()}-2`, op_id: opId, etapa_nome: 'Costura', sequencia: 2, tempo_padrao_min: temposEtapa.costura_min, tempo_real_segundos: 0, status: 'PENDENTE' },
      { id: `e-${Date.now()}-3`, op_id: opId, etapa_nome: 'Montagem', sequencia: 3, tempo_padrao_min: temposEtapa.montagem_min, tempo_real_segundos: 0, status: 'PENDENTE' },
      { id: `e-${Date.now()}-4`, op_id: opId, etapa_nome: 'Acabamento e Controle de Qualidade', sequencia: 4, tempo_padrao_min: temposEtapa.acabamento_min, tempo_real_segundos: 0, status: 'PENDENTE', checklist_qualidade: { costura_alinhada: false, sem_fios_soltos: false, ziper_testado: false, etiqueta_posicionada: false, limpeza_geral: false, medidas_conferidas: false } },
    ];

    const novaOp: OrdemProducao = {
      id: opId,
      codigo_op: codigoOp,
      produto_id: produtoId,
      quantidade,
      status: 'CRIADA',
      etapa_atual: 'Corte',
      tempo_total_real: 0,
      custo_total_real: 0,
      custo_mo_orcado: Number(custoMoOrcado.toFixed(2)),
      custo_mo_real: 0,
      operador_responsavel: operador || 'Equipe Geral',
      operador_id: operadorId,
      criado_em: new Date().toISOString(),
      produto,
      etapas: etapasIniciais,
    };

    setOrdensProducao((prev) => [novaOp, ...prev]);
    return codigoOp;
  };

  const cancelarOrdemProducao = async (opId: string) => {
    setOrdensProducao((prev) =>
      prev.map((op) => (op.id === opId ? { ...op, status: 'CANCELADA' } : op))
    );
  };

  const registrarMovimentacaoManual = async (
    tipoItem: 'INSUMO' | 'PRODUTO_ACABADO',
    itemId: string,
    tipoMovimento: 'ENTRADA' | 'SAIDA',
    quantidade: number,
    motivo: string,
    operador: string = 'Almoxarifado'
  ) => {
    let itemNome = '';

    if (tipoItem === 'INSUMO') {
      setInsumos((prev) =>
        prev.map((ins) => {
          if (ins.id === itemId) {
            itemNome = ins.nome;
            const delta = tipoMovimento === 'ENTRADA' ? quantidade : -quantidade;
            return { ...ins, saldo_atual: Number((ins.saldo_atual + delta).toFixed(3)) };
          }
          return ins;
        })
      );
    } else {
      setProdutos((prev) =>
        prev.map((prod) => {
          if (prod.id === itemId) {
            itemNome = prod.nome;
            const delta = tipoMovimento === 'ENTRADA' ? quantidade : -quantidade;
            return { ...prod, saldo_estoque: prod.saldo_estoque + delta };
          }
          return prod;
        })
      );
    }

    const novaMov: MovimentacaoEstoque = {
      id: `k-${Date.now()}`,
      item_tipo: tipoItem,
      item_id: itemId,
      item_nome: itemNome || 'Item',
      tipo_movimento: tipoMovimento,
      quantidade,
      motivo,
      operador,
      criado_em: new Date().toISOString(),
    };

    setKardex((prev) => [novaMov, ...prev]);
  };

  return (
    <LeanSystemContext.Provider
      value={{
        configCustos,
        taxaHorariaMO,
        insumos,
        produtos,
        fornecedores,
        operadores,
        despesasOperacionais,
        ordensProducao,
        kardex,
        fichasTecnicas,
        isOnlineSupabase,
        isLoading,
        iniciarEtapa,
        pausarEtapa,
        retomarEtapa,
        concluirEtapa,
        salvarNotasKaizen,
        atualizarConfigCustos,
        salvarFichaTecnica,
        criarProduto,
        atualizarProduto,
        removerProduto,
        adicionarInsumo,
        atualizarInsumo,
        removerInsumo,
        adicionarFornecedor,
        atualizarFornecedor,
        removerFornecedor,
        adicionarOperador,
        atualizarOperador,
        removerOperador,
        adicionarDespesa,
        removerDespesa,
        criarOrdemProducao,
        cancelarOrdemProducao,
        registrarMovimentacaoManual,
        recarregarDados,
      }}
    >
      {children}
    </LeanSystemContext.Provider>
  );
};

export const useLeanSystem = () => {
  const context = useContext(LeanSystemContext);
  if (!context) {
    throw new Error('useLeanSystem deve ser usado dentro de um LeanSystemProvider');
  }
  return context;
};
