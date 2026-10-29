# 🏭 DI' LINHAS - SISTEMA DE PRODUÇÃO ENXUTA (LEAN MES & ERP)
> **Projetos Criativos em Marroquinaria e Costura Industrial (Bolsas, Mochilas e Carteiras)**

Sistema integrado de manufatura enxuta (Lean Manufacturing) e gestão fabril em tempo real, construído com foco em chão de fábrica touch-first, absorção de custos dinâmicos e sincronização com backend **Supabase**.

---

## 🎨 1. Identidade Visual & Design System

O sistema foi rigorosamente desenvolvido com base na paleta oficial da Di' Linhas:
- **Cor Primária (Terracota / Laranja Queimado):** `#B85324` (Acentos, botões de ação principal, status ativo, destaques)
- **Cor Secundária (Marrom Café / Contorno):** `#4A2013` (Tipografia principal, bordas de destaque, elementos estruturais)
- **Cor de Fundo Suave (Creme / Warm Beige):** `#F9E8B8` (Backgrounds de cards, containers secundários)
- **Superfície / Base Limpa:** `#FAF6EE` / `#FFFFFF` (Fundo geral da aplicação para legibilidade e contraste industrial)
- **Feedback & Andon (Lean):**
  - **Verde Suave (`#2D7A4C`):** Produção em ritmo normal / Meta batida
  - **Âmbar / Laranja Queimado (`#D97706`):** Linha pausada / Ajuste de máquina / Desvio moderado
  - **Vinho Alerta (`#991B1B`):** Gargalo crítico identificado / Desvio de tempo acima de 20%
- **Identidade da Marca:** Borboleta estilizada em traço contínuo com tipografia serifada sofisticada (`DI' LINHAS - PROJETOS CRIATIVOS`).

---

## ⚙️ 2. Arquitetura de Dados & Supabase

- **Project ID:** `wpkkfpedurjsiiipemvb`
- **Project URL:** `https://wpkkfpedurjsiiipemvb.supabase.co`
- **Region:** `us-east-1`
- **Script SQL Completo:** localizável em [`supabase/schema.sql`](./supabase/schema.sql)

### Tabelas Primárias:
1. `insumos`: Código SKU, nome, unidade de medida, custo unitário, estoque mínimo, saldo atual e fornecedor.
2. `produtos_acabados`: SKU, nome, categoria (Bolsas, Mochilas, Carteiras), preço de venda, margem alvo, tempo padrão total.
3. `ficha_tecnica`: Matriz BOM relacionando produto, insumo, quantidade de consumo, percentual de quebra/perda técnica e etapa de consumo.
4. `configuracao_custos`: Média de despesas dos últimos 3 meses, dias úteis, horas diárias trabalhadas e taxa horária dinâmica.
5. `ordens_producao`: Código da OP, produto vinculado, quantidade, status, datas, tempos acumulados, custos orçados vs realizados e anotações Kaizen.
6. `op_etapas`: Rastreio das 4 etapas (`Corte`, `Costura`, `Montagem`, `Acabamento e Controle de Qualidade`) com tempo padrão vs real.
7. `op_pausas`: Registro analítico de paradas Andon (motivo, duração em segundos e observações).
8. `movimentacoes_estoque`: Kardex contábil e físico com baixas e entradas automáticas rastreadas.
9. `atualizar`: Tabela mantida pela rotina de pg_cron.

---

## 📐 3. Engenharia Lean & Precificação Dinâmica

A precificação dos produtos acabados é calculada em tempo real com base no método de absorção e mark-up divisor:

1. **Taxa Horária Dinâmica de Mão de Obra:**
   $$\text{Taxa MO/Hora} = \frac{\text{Média Despesas Operacionais (Últimos 3 Meses)}}{\text{Dias Úteis Médios} \times \text{Horas Diárias Trabalhadas}}$$
2. **Custo Unitário da Ficha Técnica (BOM Enxuta):**
   - **Insumos:** $\sum (\text{Quantidade Consumo} \times (1 + \text{Fator de Perda}) \times \text{Custo Unitário})$
   - **Mão de Obra Orçada:** $(\text{Tempo Padrão da Peça em Horas}) \times (\text{Taxa MO/Hora})$
   - **Custo Operacional Rateado:** Parcela fixa de absorção fabril por peça.
   - **Preço de Venda Sugerido (PVS):**
     $$\text{PVS} = \frac{\text{Custo Total de Produção}}{1 - \text{Margem de Lucro Desejada (\%)}}$$

---

## ⏱️ 4. Chão de Fábrica Touch-First (MES & Andon)

O fluxo produtivo adota a esteira em 4 etapas padronizadas:
1. `Corte`
2. `Costura`
3. `Montagem`
4. `Acabamento e Controle de Qualidade` *(com checklist formal de conformidade antes da aprovação)*

### Funcionalidades:
- **Botões Grandes Touch:** `INICIAR`, `PAUSAR` (com modal de motivos: *Falta de Insumo, Quebra de Agulha, Ajuste de Máquina, Descanso, Dúvida de Projeto*) e `CONCLUIR`.
- **Cronômetro Líquido:** Computa apenas o tempo real trabalhado, descartando períodos em pausa.
- **Detecção de Desvio em Tempo Real:** Alerta Andon dinâmico quando o tempo real ultrapassa a meta ou excede 20%.
- **Anotações Kaizen:** Registro rápido de retrabalho ou sugestões de melhoria contínua da modelagem.
- **Relatório Imediato de Desvio de Custo:** Compara o Custo de Mão de Obra Orçado vs Realizado.

---

## 📦 5. Controle de Estoque Just-in-Time (JIT)

- **Baixa Automática:** Ao iniciar a primeira etapa de uma OP, o sistema dá baixa imediata de todos os insumos componentes com seus respectivos fatores de perda técnica.
- **Entrada Automática de Acabados:** No momento em que a 4ª etapa (`Acabamento e Controle de Qualidade`) é aprovada no checklist, o saldo do produto acabado entra automaticamente no estoque de pronta entrega.
- **Kardex Visual:** Rastreabilidade de cada movimentação com data/hora, operador, quantidade e código da OP.

---

## 🚀 6. Execução e Deploy

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (Vite)
npm run dev

# Gerar build de produção otimizado para Cloudflare Pages / Vercel
npm run build
```
