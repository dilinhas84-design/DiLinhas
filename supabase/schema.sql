-- ====================================================================
-- SISTEMA DE PRODUÇÃO ENXUTA (LEAN MES & ERP) - DI' LINHAS
-- SCHEMA & REGRAS DE NEGÓCIO AUTOMATIZADAS (V2 EXPANDIDA)
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FORNECEDORES
CREATE TABLE IF NOT EXISTS public.fornecedores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    razao_social VARCHAR(255) NOT NULL,
    nome_fantasia VARCHAR(255) NOT NULL,
    cnpj_cpf VARCHAR(30),
    contato_nome VARCHAR(100),
    whatsapp VARCHAR(50),
    email VARCHAR(100),
    cidade VARCHAR(100),
    uf VARCHAR(2),
    lead_time_dias INTEGER DEFAULT 7,
    condicao_pagamento VARCHAR(100) DEFAULT '30 dias',
    categorias_fornecidas TEXT[] DEFAULT '{}',
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. OPERADORES FABRIS
CREATE TABLE IF NOT EXISTS public.operadores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nome VARCHAR(255) NOT NULL,
    apelido VARCHAR(100) NOT NULL,
    especialidade VARCHAR(50) NOT NULL DEFAULT 'Costura', -- 'Corte', 'Costura', 'Montagem', 'Qualidade', 'Polivalente'
    turno VARCHAR(30) DEFAULT 'Integral',
    foto_url TEXT,
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LIVRO DE DESPESAS OPERACIONAIS (MÉDIA 3M)
CREATE TABLE IF NOT EXISTS public.despesas_operacionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mes_referencia VARCHAR(10) NOT NULL, -- Ex: '2026-08', '2026-09', '2026-10'
    categoria VARCHAR(50) NOT NULL, -- 'Ocupacao', 'Utilidades', 'Manutencao', 'MaoDeObraIndireta', 'Administrativo'
    descricao VARCHAR(255) NOT NULL,
    valor NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    pago BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 4. INSUMOS (MATÉRIAS-PRIMAS / COMPONENTES)
CREATE TABLE IF NOT EXISTS public.insumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL,
    custo_unitario NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    estoque_minimo NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    estoque_maximo NUMERIC(12, 2) DEFAULT 100.00,
    saldo_atual NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    fornecedor VARCHAR(255),
    fornecedor_id UUID REFERENCES public.fornecedores(id) ON DELETE SET NULL,
    categoria VARCHAR(100) DEFAULT 'Tecidos e Lonas',
    imagem_url TEXT,
    localizacao_almoxarifado VARCHAR(100),
    codigo_fornecedor VARCHAR(100),
    lead_time_dias INTEGER DEFAULT 7,
    cor_pantone VARCHAR(30),
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PRODUTOS ACABADOS (CATÁLOGO & ENGENHARIA)
CREATE TABLE IF NOT EXISTS public.produtos_acabados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    colecao VARCHAR(100),
    descricao TEXT,
    preco_venda NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    margem_alvo NUMERIC(5, 2) NOT NULL DEFAULT 38.00,
    tempo_padrao_total NUMERIC(10, 2) NOT NULL DEFAULT 60.00,
    tempos_por_etapa JSONB DEFAULT '{"corte_min": 15, "costura_min": 30, "montagem_min": 10, "acabamento_min": 5}'::jsonb,
    dimensoes JSONB DEFAULT '{"largura_cm": 30, "altura_cm": 25, "profundidade_cm": 10, "peso_gramas": 500}'::jsonb,
    instrucoes_costura TEXT,
    saldo_estoque INTEGER NOT NULL DEFAULT 0,
    imagem_url TEXT,
    galeria_fotos TEXT[] DEFAULT '{}',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FICHA TÉCNICA (BOM)
CREATE TABLE IF NOT EXISTS public.ficha_tecnica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES public.produtos_acabados(id) ON DELETE CASCADE,
    insumo_id UUID NOT NULL REFERENCES public.insumos(id) ON DELETE RESTRICT,
    quantidade_consumo NUMERIC(12, 4) NOT NULL,
    percentual_perda NUMERIC(5, 2) NOT NULL DEFAULT 5.00,
    etapa_consumo VARCHAR(50) DEFAULT 'Corte',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unq_produto_insumo UNIQUE (produto_id, insumo_id)
);

-- 7. CONFIGURAÇÃO DE CUSTOS & TAXA HORÁRIA
CREATE TABLE IF NOT EXISTS public.configuracao_custos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_despesas_3m NUMERIC(14, 2) NOT NULL DEFAULT 14500.00,
    dias_uteis_mes INTEGER NOT NULL DEFAULT 22,
    horas_trabalhadas_dia NUMERIC(4, 2) NOT NULL DEFAULT 8.00,
    custo_hora_calculado NUMERIC(12, 4) GENERATED ALWAYS AS (
        CASE 
            WHEN (dias_uteis_mes * horas_trabalhadas_dia) > 0 
            THEN media_despesas_3m / (dias_uteis_mes * horas_trabalhadas_dia)
            ELSE 0.00 
        END
    ) STORED,
    taxa_operacional_fixa_unidade NUMERIC(10, 2) DEFAULT 9.50,
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ORDENS DE PRODUÇÃO
CREATE TABLE IF NOT EXISTS public.ordens_producao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_op VARCHAR(50) UNIQUE NOT NULL,
    produto_id UUID NOT NULL REFERENCES public.produtos_acabados(id),
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'CRIADA',
    etapa_atual VARCHAR(50) DEFAULT 'Corte',
    data_inicio TIMESTAMPTZ,
    data_conclusao TIMESTAMPTZ,
    tempo_total_real INTEGER DEFAULT 0,
    custo_total_real NUMERIC(12, 2) DEFAULT 0.00,
    custo_mo_orcado NUMERIC(12, 2) DEFAULT 0.00,
    custo_mo_real NUMERIC(12, 2) DEFAULT 0.00,
    operador_responsavel VARCHAR(100),
    operador_id UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
    notas_kaizen TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ETAPAS DA OP
CREATE TABLE IF NOT EXISTS public.op_etapas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    op_id UUID NOT NULL REFERENCES public.ordens_producao(id) ON DELETE CASCADE,
    etapa_nome VARCHAR(100) NOT NULL,
    sequencia INTEGER NOT NULL DEFAULT 1,
    tempo_padrao_min NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
    tempo_real_segundos INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE',
    operador_nome VARCHAR(100),
    operador_id UUID REFERENCES public.operadores(id) ON DELETE SET NULL,
    inicio_etapa TIMESTAMPTZ,
    fim_etapa TIMESTAMPTZ,
    aprovado_qualidade BOOLEAN DEFAULT FALSE,
    checklist_qualidade JSONB DEFAULT '{"costura_alinhada": true, "sem_fios_soltos": true, "ziper_testado": true, "etiqueta_posicionada": true, "limpeza_geral": true, "medidas_conferidas": true}'::jsonb,
    notas TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PAUSAS DA ETAPA
CREATE TABLE IF NOT EXISTS public.op_pausas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etapa_id UUID NOT NULL REFERENCES public.op_etapas(id) ON DELETE CASCADE,
    motivo_pausa VARCHAR(100) NOT NULL,
    inicio_pausa TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fim_pausa TIMESTAMPTZ,
    duracao_segundos INTEGER DEFAULT 0,
    observacao TEXT
);

-- 11. MOVIMENTAÇÕES DE ESTOQUE (KARDEX)
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_tipo VARCHAR(30) NOT NULL,
    item_id UUID NOT NULL,
    item_nome VARCHAR(255) NOT NULL,
    tipo_movimento VARCHAR(20) NOT NULL,
    quantidade NUMERIC(12, 4) NOT NULL,
    motivo VARCHAR(255) NOT NULL,
    op_id UUID REFERENCES public.ordens_producao(id) ON DELETE SET NULL,
    operador VARCHAR(100) DEFAULT 'Sistema MES',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 12. TABELA ATUALIZAR
CREATE TABLE IF NOT EXISTS public.atualizar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- POLÍTICAS RLS PÚBLICAS/ANON
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.despesas_operacionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_acabados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ficha_tecnica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao_custos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.op_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.op_pausas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atualizar ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY['fornecedores', 'operadores', 'despesas_operacionais', 'insumos', 'produtos_acabados', 
                            'ficha_tecnica', 'configuracao_custos', 'ordens_producao', 'op_etapas', 'op_pausas', 
                            'movimentacoes_estoque', 'atualizar'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Acesso Geral para %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Acesso Geral para %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;
