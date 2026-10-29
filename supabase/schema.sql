-- ====================================================================
-- SISTEMA DE PRODUÇÃO ENXUTA (LEAN MES & ERP) - DI' LINHAS
-- PROJETOS CRIATIVOS (Bolsas, Mochilas e Carteiras)
-- SCHEMA & REGRAS DE NEGÓCIO AUTOMATIZADAS
-- ====================================================================

-- Habilitar extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE INSUMOS (MATÉRIAS-PRIMAS / COMPONENTES)
CREATE TABLE IF NOT EXISTS public.insumos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    unidade_medida VARCHAR(20) NOT NULL, -- 'm', 'm2', 'un', 'kg', 'par', 'rolo'
    custo_unitario NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    estoque_minimo NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    saldo_atual NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    fornecedor VARCHAR(255),
    categoria VARCHAR(100) DEFAULT 'Diversos',
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABELA DE PRODUTOS ACABADOS (CATÁLOGO & ENGENHARIA DE PRODUTO)
CREATE TABLE IF NOT EXISTS public.produtos_acabados (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL, -- 'Bolsas', 'Mochilas', 'Carteiras', 'Acessórios'
    descricao TEXT,
    preco_venda NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    margem_alvo NUMERIC(5, 2) NOT NULL DEFAULT 35.00, -- Margem percentual esperada (ex: 35.00%)
    tempo_padrao_total NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Tempo padrão total em minutos
    saldo_estoque INTEGER NOT NULL DEFAULT 0,
    imagem_url TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABELA DE FICHA TÉCNICA (BOM ENXUTA - BILL OF MATERIALS)
CREATE TABLE IF NOT EXISTS public.ficha_tecnica (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    produto_id UUID NOT NULL REFERENCES public.produtos_acabados(id) ON DELETE CASCADE,
    insumo_id UUID NOT NULL REFERENCES public.insumos(id) ON DELETE RESTRICT,
    quantidade_consumo NUMERIC(12, 4) NOT NULL,
    percentual_perda NUMERIC(5, 2) NOT NULL DEFAULT 5.00, -- Ex: 5% de quebra/perda técnica
    etapa_consumo VARCHAR(50) DEFAULT 'Corte', -- Corte, Costura, Montagem, Acabamento
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unq_produto_insumo UNIQUE (produto_id, insumo_id)
);

-- 4. TABELA DE CONFIGURAÇÃO DE CUSTOS & TAXA HORÁRIA DINÂMICA
CREATE TABLE IF NOT EXISTS public.configuracao_custos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    media_despesas_3m NUMERIC(14, 2) NOT NULL DEFAULT 12000.00, -- Média despesas operacionais 3 meses
    dias_uteis_mes INTEGER NOT NULL DEFAULT 22,
    horas_trabalhadas_dia NUMERIC(4, 2) NOT NULL DEFAULT 8.00,
    custo_hora_calculado NUMERIC(12, 4) GENERATED ALWAYS AS (
        CASE 
            WHEN (dias_uteis_mes * horas_trabalhadas_dia) > 0 
            THEN media_despesas_3m / (dias_uteis_mes * horas_trabalhadas_dia)
            ELSE 0.00 
        END
    ) STORED,
    taxa_operacional_fixa_unidade NUMERIC(10, 2) DEFAULT 8.50,
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABELA DE ORDENS DE PRODUÇÃO (OPs)
CREATE TABLE IF NOT EXISTS public.ordens_producao (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    codigo_op VARCHAR(50) UNIQUE NOT NULL, -- Ex: 'OP-2026-001'
    produto_id UUID NOT NULL REFERENCES public.produtos_acabados(id),
    quantidade INTEGER NOT NULL DEFAULT 1 CHECK (quantidade > 0),
    status VARCHAR(50) NOT NULL DEFAULT 'CRIADA', -- 'CRIADA', 'EM_PRODUCAO', 'PAUSADA', 'CONCLUIDA', 'CANCELADA'
    etapa_atual VARCHAR(50) DEFAULT 'Corte',
    data_inicio TIMESTAMPTZ,
    data_conclusao TIMESTAMPTZ,
    tempo_total_real INTEGER DEFAULT 0, -- Tempo líquido em segundos
    custo_total_real NUMERIC(12, 2) DEFAULT 0.00,
    custo_mo_orcado NUMERIC(12, 2) DEFAULT 0.00,
    custo_mo_real NUMERIC(12, 2) DEFAULT 0.00,
    operador_responsavel VARCHAR(100),
    notas_kaizen TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABELA DE ETAPAS DA OP (4 ETAPAS LEAN PADRONIZADAS)
CREATE TABLE IF NOT EXISTS public.op_etapas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    op_id UUID NOT NULL REFERENCES public.ordens_producao(id) ON DELETE CASCADE,
    etapa_nome VARCHAR(100) NOT NULL, -- 'Corte', 'Costura', 'Montagem', 'Acabamento e Controle de Qualidade'
    sequencia INTEGER NOT NULL DEFAULT 1,
    tempo_padrao_min NUMERIC(10, 2) NOT NULL DEFAULT 15.00,
    tempo_real_segundos INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDENTE', -- 'PENDENTE', 'EM_ANDAMENTO', 'PAUSADA', 'CONCLUIDA'
    operador_nome VARCHAR(100),
    inicio_etapa TIMESTAMPTZ,
    fim_etapa TIMESTAMPTZ,
    aprovado_qualidade BOOLEAN DEFAULT FALSE,
    checklist_qualidade JSONB DEFAULT '{"costura_alinhada": true, "sem_fios_soltos": true, "ziper_testado": true, "etiqueta_posicionada": true, "limpeza_geral": true}'::jsonb,
    notas TEXT,
    criado_em TIMESTAMPTZ DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 7. TABELA DE PAUSAS DA ETAPA (JUSTIFICATIVAS LEAN / ANDON)
CREATE TABLE IF NOT EXISTS public.op_pausas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    etapa_id UUID NOT NULL REFERENCES public.op_etapas(id) ON DELETE CASCADE,
    motivo_pausa VARCHAR(100) NOT NULL, -- 'Falta de Insumo', 'Quebra de Agulha', 'Ajuste de Máquina', 'Descanso', 'Dúvida de Projeto'
    inicio_pausa TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fim_pausa TIMESTAMPTZ,
    duracao_segundos INTEGER DEFAULT 0,
    observacao TEXT
);

-- 8. TABELA DE MOVIMENTAÇÕES DE ESTOQUE (KARDEX VISUAL COMPLETO)
CREATE TABLE IF NOT EXISTS public.movimentacoes_estoque (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_tipo VARCHAR(30) NOT NULL, -- 'INSUMO' ou 'PRODUTO_ACABADO'
    item_id UUID NOT NULL,
    item_nome VARCHAR(255) NOT NULL,
    tipo_movimento VARCHAR(20) NOT NULL, -- 'ENTRADA', 'SAIDA'
    quantidade NUMERIC(12, 4) NOT NULL,
    motivo VARCHAR(255) NOT NULL, -- 'Baixa Automática OP', 'Entrada Produção Concluída', 'Ajuste Manual', 'Recebimento NF'
    op_id UUID REFERENCES public.ordens_producao(id) ON DELETE SET NULL,
    operador VARCHAR(100) DEFAULT 'Sistema MES',
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABELA DE ATUALIZAÇÕES (MANTIDA POR PG_CRON)
CREATE TABLE IF NOT EXISTS public.atualizar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    mensagem TEXT NOT NULL,
    criado_em TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- HABILITAÇÃO DE ROW LEVEL SECURITY (RLS) COM POLÍTICAS ABERTAS P/ ANON
-- (Garante funcionamento no chão de fábrica e tablets da oficina)
-- ====================================================================

ALTER TABLE public.insumos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos_acabados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ficha_tecnica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracao_custos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ordens_producao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.op_etapas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.op_pausas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movimentacoes_estoque ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atualizar ENABLE ROW LEVEL SECURITY;

-- Políticas universais de acesso (público / anon key autorizada)
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN 
        SELECT unnest(ARRAY['insumos', 'produtos_acabados', 'ficha_tecnica', 'configuracao_custos', 
                            'ordens_producao', 'op_etapas', 'op_pausas', 'movimentacoes_estoque', 'atualizar'])
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Acesso Geral para %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Acesso Geral para %I" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;

-- ====================================================================
-- FUNÇÕES E TRIGGERS DE AUTOMAÇÃO INDUSTRIAL LEAN (JIT)
-- ====================================================================

-- Função 1: Baixa automática de insumos ao iniciar OP (Just-in-Time)
CREATE OR REPLACE FUNCTION public.fn_baixar_insumos_ao_iniciar_op()
RETURNS TRIGGER AS $$
DECLARE
    r RECORD;
    consumo_calculado NUMERIC(12, 4);
    insumo_rec RECORD;
BEGIN
    -- Se a OP passou para 'EM_PRODUCAO' e ainda não havia iniciado
    IF NEW.status = 'EM_PRODUCAO' AND (OLD.status = 'CRIADA' OR OLD.status IS NULL) THEN
        FOR r IN 
            SELECT ft.insumo_id, ft.quantidade_consumo, ft.percentual_perda, i.nome, i.saldo_atual
            FROM public.ficha_tecnica ft
            JOIN public.insumos i ON i.id = ft.insumo_id
            WHERE ft.produto_id = NEW.produto_id
        LOOP
            -- Cálculo: Quantidade * Consumo Unitário * (1 + Perda/100)
            consumo_calculado := (NEW.quantidade * r.quantidade_consumo * (1 + (r.percentual_perda / 100.00)));
            
            -- Atualiza saldo do insumo
            UPDATE public.insumos
            SET saldo_atual = saldo_atual - consumo_calculado,
                atualizado_em = NOW()
            WHERE id = r.insumo_id;
            
            -- Registra no Kardex
            INSERT INTO public.movimentacoes_estoque (
                item_tipo, item_id, item_nome, tipo_movimento, quantidade, motivo, op_id, operador
            ) VALUES (
                'INSUMO', r.insumo_id, r.nome, 'SAIDA', consumo_calculado, 
                'Baixa Automática OP: ' || NEW.codigo_op, NEW.id, COALESCE(NEW.operador_responsavel, 'Chão de Fábrica')
            );
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_baixar_insumos_ao_iniciar_op ON public.ordens_producao;
CREATE TRIGGER trg_baixar_insumos_ao_iniciar_op
AFTER UPDATE OF status ON public.ordens_producao
FOR EACH ROW
WHEN (NEW.status = 'EM_PRODUCAO' AND OLD.status = 'CRIADA')
EXECUTE FUNCTION public.fn_baixar_insumos_ao_iniciar_op();


-- Função 2: Entrada automática de acabados ao concluir a última etapa (Qualidade)
CREATE OR REPLACE FUNCTION public.fn_concluir_op_e_adicionar_acabado()
RETURNS TRIGGER AS $$
DECLARE
    v_op RECORD;
    v_produto RECORD;
    v_etapas_concluidas INTEGER;
    v_total_etapas INTEGER;
BEGIN
    -- Se a etapa concluída é 'Acabamento e Controle de Qualidade'
    IF NEW.etapa_nome = 'Acabamento e Controle de Qualidade' AND NEW.status = 'CONCLUIDA' AND (OLD.status != 'CONCLUIDA' OR OLD.status IS NULL) THEN
        SELECT * INTO v_op FROM public.ordens_producao WHERE id = NEW.op_id;
        SELECT * INTO v_produto FROM public.produtos_acabados WHERE id = v_op.produto_id;
        
        -- Atualiza saldo do produto acabado
        UPDATE public.produtos_acabados
        SET saldo_estoque = saldo_estoque + v_op.quantidade,
            atualizado_em = NOW()
        WHERE id = v_op.produto_id;
        
        -- Atualiza a Ordem de Produção para CONCLUIDA
        UPDATE public.ordens_producao
        SET status = 'CONCLUIDA',
            data_conclusao = NOW(),
            atualizado_em = NOW()
        WHERE id = v_op.id;
        
        -- Registra no Kardex de Acabados
        INSERT INTO public.movimentacoes_estoque (
            item_tipo, item_id, item_nome, tipo_movimento, quantidade, motivo, op_id, operador
        ) VALUES (
            'PRODUTO_ACABADO', v_op.produto_id, v_produto.nome, 'ENTRADA', v_op.quantidade,
            'Entrada Automática - OP Concluída com Qualidade Aprovada: ' || v_op.codigo_op, v_op.id, COALESCE(NEW.operador_nome, 'Controle de Qualidade')
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_concluir_op_e_adicionar_acabado ON public.op_etapas;
CREATE TRIGGER trg_concluir_op_e_adicionar_acabado
AFTER UPDATE OF status ON public.op_etapas
FOR EACH ROW
EXECUTE FUNCTION public.fn_concluir_op_e_adicionar_acabado();


-- ====================================================================
-- DADOS INICIAIS (SEED LEAN PARA DI' LINHAS - PROJETOS CRIATIVOS)
-- ====================================================================

-- Configuração padrão de custos
INSERT INTO public.configuracao_custos (id, media_despesas_3m, dias_uteis_mes, horas_trabalhadas_dia, taxa_operacional_fixa_unidade)
VALUES ('c1000000-0000-0000-0000-000000000001', 14500.00, 22, 8.0, 9.50)
ON CONFLICT (id) DO NOTHING;

-- Insumos reais de marroquinaria e costura criativa
INSERT INTO public.insumos (id, sku, nome, unidade_medida, custo_unitario, estoque_minimo, saldo_atual, fornecedor, categoria) VALUES
('i1000000-0000-0000-0000-000000000001', 'INS-LON-001', 'Lona Panamá Algodão 100% Terracota', 'm', 38.50, 15.0, 75.0, 'Têxtil São Bento', 'Tecidos'),
('i1000000-0000-0000-0000-000000000002', 'INS-LON-002', 'Lona Algodão Cru / Creme Claro', 'm', 34.00, 10.0, 50.0, 'Têxtil São Bento', 'Tecidos'),
('i1000000-0000-0000-0000-000000000003', 'INS-COU-001', 'Couro Bovino Crazy Horse Café', 'm2', 95.00, 5.0, 22.5, 'Curtume Minuano', 'Couro e Sintéticos'),
('i1000000-0000-0000-0000-000000000004', 'INS-ZIP-001', 'Zíper de Metal Ouro Velho Tratorado #5', 'm', 12.80, 20.0, 110.0, 'YKK Brasil', 'Aviamentos'),
('i1000000-0000-0000-0000-000000000005', 'INS-CUR-001', 'Cursor de Metal Ouro Velho #5', 'un', 1.85, 50.0, 320.0, 'YKK Brasil', 'Aviamentos'),
('i1000000-0000-0000-0000-000000000006', 'INS-MOS-001', 'Mosquetão Giratório 25mm Ouro Envelhecido', 'un', 4.50, 40.0, 140.0, 'Metais Eberle', 'Metais'),
('i1000000-0000-0000-0000-000000000007', 'INS-REG-001', 'Regulador de Alça 25mm Metal Ouro Velho', 'un', 3.20, 40.0, 155.0, 'Metais Eberle', 'Metais'),
('i1000000-0000-0000-0000-000000000008', 'INS-LIN-001', 'Linha Poliéster Costura Pesada 40 Marrom Café', 'rolo', 18.00, 4.0, 16.0, 'Linhas Corrente', 'Linhas e Fios'),
('i1000000-0000-0000-0000-000000000009', 'INS-FOR-001', 'Tecido Sarja Acetinada Forro Xadrez', 'm', 16.50, 15.0, 68.0, 'Têxtil Blumenau', 'Forros'),
('i1000000-0000-0000-0000-000000000010', 'INS-EST-001', 'Estruturador EVA Soft 2mm', 'm2', 14.00, 10.0, 42.0, 'Espumas Vitória', 'Estruturadores')
ON CONFLICT (id) DO NOTHING;

-- Produtos Acabados da Di' Linhas
INSERT INTO public.produtos_acabados (id, sku, nome, categoria, descricao, preco_venda, margem_alvo, tempo_padrao_total, saldo_estoque) VALUES
('p1000000-0000-0000-0000-000000000001', 'PROD-BOL-001', 'Bolsa Tote Vintage Terracota & Couro', 'Bolsas', 'Bolsa tote espaçosa em lona panamá e acabamento em couro bovino café com alça regulável.', 265.00, 38.00, 75.00, 8),
('p1000000-0000-0000-0000-000000000002', 'PROD-MOC-001', 'Mochila Urbana Classic Café & Creme', 'Mochilas', 'Mochila de design minimalista para notebook até 15.6 pol, bolso frontal anti-furto e ferragens ouro velho.', 340.00, 40.00, 110.00, 4),
('p1000000-0000-0000-0000-000000000003', 'PROD-CAR-001', 'Carteira Slim Minimalista Dobra Dupla', 'Carteiras', 'Carteira de bolso fino com 4 slots para cartões, bolso para cédulas e gravação a laser.', 115.00, 42.00, 35.00, 15)
ON CONFLICT (id) DO NOTHING;

-- Ficha Técnica (BOM) da Bolsa Tote Vintage Terracota
INSERT INTO public.ficha_tecnica (id, produto_id, insumo_id, quantidade_consumo, percentual_perda, etapa_consumo) VALUES
('f1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000001', 0.65, 6.00, 'Corte'),
('f1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000003', 0.22, 8.00, 'Corte'),
('f1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000009', 0.55, 5.00, 'Corte'),
('f1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000004', 0.45, 2.00, 'Costura'),
('f1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000005', 1.00, 0.00, 'Costura'),
('f1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000006', 2.00, 0.00, 'Montagem'),
('f1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000007', 1.00, 0.00, 'Montagem'),
('f1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000001', 'i1000000-0000-0000-0000-000000000010', 0.40, 5.00, 'Montagem')
ON CONFLICT (id) DO NOTHING;

-- Ficha Técnica (BOM) da Carteira Slim Minimalista
INSERT INTO public.ficha_tecnica (id, produto_id, insumo_id, quantidade_consumo, percentual_perda, etapa_consumo) VALUES
('f2000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000003', 0.12, 10.00, 'Corte'),
('f2000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000003', 'i1000000-0000-0000-0000-000000000009', 0.15, 5.00, 'Corte')
ON CONFLICT (id) DO NOTHING;

-- Exemplo de Ordem de Produção ativa no chão de fábrica
INSERT INTO public.ordens_producao (id, codigo_op, produto_id, quantidade, status, etapa_atual, data_inicio, tempo_total_real, custo_mo_orcado, operador_responsavel)
VALUES ('o1000000-0000-0000-0000-000000000001', 'OP-2026-0042', 'p1000000-0000-0000-0000-000000000001', 5, 'EM_PRODUCAO', 'Costura', NOW() - INTERVAL '45 minutes', 2100, 514.77, 'Juliana Silva')
ON CONFLICT (id) DO NOTHING;

-- Etapas da OP-2026-0042
INSERT INTO public.op_etapas (id, op_id, etapa_nome, sequencia, tempo_padrao_min, tempo_real_segundos, status, operador_nome, aprovado_qualidade) VALUES
('e1000000-0000-0000-0000-000000000001', 'o1000000-0000-0000-0000-000000000001', 'Corte', 1, 60.00, 3120, 'CONCLUIDA', 'Carlos Eduardo', TRUE),
('e1000000-0000-0000-0000-000000000002', 'o1000000-0000-0000-0000-000000000001', 'Costura', 2, 180.00, 2100, 'EM_ANDAMENTO', 'Juliana Silva', FALSE),
('e1000000-0000-0000-0000-000000000003', 'o1000000-0000-0000-0000-000000000001', 'Montagem', 3, 90.00, 0, 'PENDENTE', NULL, FALSE),
('e1000000-0000-0000-0000-000000000004', 'o1000000-0000-0000-0000-000000000001', 'Acabamento e Controle de Qualidade', 4, 45.00, 0, 'PENDENTE', NULL, FALSE)
ON CONFLICT (id) DO NOTHING;

-- Movimentações históricas no Kardex
INSERT INTO public.movimentacoes_estoque (item_tipo, item_id, item_nome, tipo_movimento, quantidade, motivo, op_id, operador, criado_em) VALUES
('INSUMO', 'i1000000-0000-0000-0000-000000000001', 'Lona Panamá Algodão 100% Terracota', 'SAIDA', 3.445, 'Baixa Automática OP: OP-2026-0042', 'o1000000-0000-0000-0000-000000000001', 'Juliana Silva', NOW() - INTERVAL '45 minutes'),
('INSUMO', 'i1000000-0000-0000-0000-000000000003', 'Couro Bovino Crazy Horse Café', 'SAIDA', 1.188, 'Baixa Automática OP: OP-2026-0042', 'o1000000-0000-0000-0000-000000000001', 'Juliana Silva', NOW() - INTERVAL '45 minutes');
