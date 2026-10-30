import React, { useState, useRef, useEffect } from 'react';
import { ProdutoAcabado, ParteMolde, Insumo } from '../../types/database';
import { useLeanSystem } from '../../context/LeanSystemContext';
import { 
  Ruler, 
  PenTool, 
  Square, 
  Trash2, 
  Plus, 
  FileText, 
  Download, 
  Upload, 
  X, 
  Save, 
  Layers, 
  Maximize2, 
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  Check
} from 'lucide-react';

interface PatternStudioModalProps {
  isOpen: boolean;
  produto: ProdutoAcabado;
  onClose: () => void;
  onSalvar: (produtoAtualizado: Partial<ProdutoAcabado>) => void;
}

interface Ponto {
  x: number;
  y: number;
}

export const PatternStudioModal: React.FC<PatternStudioModalProps> = ({
  isOpen,
  produto,
  onClose,
  onSalvar,
}) => {
  const { insumos } = useLeanSystem();

  // Partes do Molde
  const [partes, setPartes] = useState<ParteMolde[]>(() => {
    return produto.partes_molde || [];
  });

  // PDF do Molde
  const [pdfUrl, setPdfUrl] = useState<string>(produto.arquivo_molde_pdf_url || '');
  const [modoEntradaPdf, setModoEntradaPdf] = useState<'link' | 'upload'>('link');

  // Modo do Canvas de Desenho
  const [modoDesenho, setModoDesenho] = useState<'lapis' | 'retangulo'>('retangulo');

  // Parâmetros do Retângulo / Fole
  const [rectLarguraCm, setRectLarguraCm] = useState<number>(38);
  const [rectAlturaCm, setRectAlturaCm] = useState<number>(32);
  const [rectNomePeça, setRectNomePeça] = useState<string>('Espelho Frontal');
  const [rectQtdCorte, setRectQtdCorte] = useState<number>(1);
  const [rectInsumoId, setRectInsumoId] = useState<string>(insumos[0]?.id || '');

  // Canvas e Desenho Livre
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pontosDesenhados, setPontosDesenhados] = useState<Ponto[]>([]);
  const [areaCalculadaLapis, setAreaCalculadaLapis] = useState<{ cm2: number; m2: number; perimetroCm: number } | null>(null);
  const [escalaPixelsPorCm, setEscalaPixelsPorCm] = useState<number>(8); // 8px = 1cm na tela

  // Redesenhar Canvas quando os pontos ou modo mudarem
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Limpar
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Grade Milimetrada & Centimétrica
    const step = escalaPixelsPorCm; // 1 cm
    ctx.strokeStyle = '#FAF6EE';
    ctx.lineWidth = 1;

    // Fundo da prancha de corte
    ctx.fillStyle = '#2A4335'; // Verde esteira de corte industrial
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Linhas da grade
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    for (let x = 0; x < canvas.width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Linhas principais a cada 5cm
    ctx.strokeStyle = 'rgba(249, 232, 184, 0.25)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x < canvas.width; x += step * 5) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += step * 5) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // 2. Se for modo Retângulo, desenha o molde paramétrico no centro
    if (modoDesenho === 'retangulo') {
      const wPx = rectLarguraCm * escalaPixelsPorCm;
      const hPx = rectAlturaCm * escalaPixelsPorCm;
      const startX = (canvas.width - wPx) / 2;
      const startY = (canvas.height - hPx) / 2;

      // Sombra
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(startX + 4, startY + 4, wPx, hPx);

      // Preenchimento do molde (tom terracota suave translúcido)
      ctx.fillStyle = 'rgba(184, 83, 36, 0.45)';
      ctx.fillRect(startX, startY, wPx, hPx);

      // Borda do corte
      ctx.strokeStyle = '#F9E8B8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(startX, startY, wPx, hPx);

      // Cotas / Medidas escritas
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Plus Jakarta Sans, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${rectLarguraCm} cm`, startX + wPx / 2, startY - 8);

      ctx.save();
      ctx.translate(startX - 10, startY + hPx / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText(`${rectAlturaCm} cm`, 0, 0);
      ctx.restore();

      ctx.fillStyle = '#F9E8B8';
      ctx.font = 'bold 13px Plus Jakarta Sans, sans-serif';
      ctx.fillText(rectNomePeça || 'Molde Retangular', startX + wPx / 2, startY + hPx / 2);
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`${(rectLarguraCm * rectAlturaCm).toFixed(0)} cm²`, startX + wPx / 2, startY + hPx / 2 + 18);
    }

    // 3. Se for modo Desenho Livre com Pontos
    if (modoDesenho === 'lapis' && pontosDesenhados.length > 1) {
      ctx.beginPath();
      ctx.moveTo(pontosDesenhados[0].x, pontosDesenhados[0].y);
      for (let i = 1; i < pontosDesenhados.length; i++) {
        ctx.lineTo(pontosDesenhados[i].x, pontosDesenhados[i].y);
      }

      // Se tiver mais de 3 pontos, fecha a forma
      if (pontosDesenhados.length > 2 && !isDrawing) {
        ctx.closePath();
        ctx.fillStyle = 'rgba(184, 83, 36, 0.4)';
        ctx.fill();
      }

      ctx.strokeStyle = '#F9E8B8';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Marcadores nos vértices
      ctx.fillStyle = '#B85324';
      pontosDesenhados.forEach((p) => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }, [modoDesenho, rectLarguraCm, rectAlturaCm, rectNomePeça, escalaPixelsPorCm, pontosDesenhados, isDrawing]);

  // Algoritmo Shoelace (Fórmula de Gauss) para calcular área de polígono desenhado
  const calcularMetricasDesenhoLivre = (pontos: Ponto[]) => {
    if (pontos.length < 3) return null;

    let areaPixels = 0;
    let perimetroPixels = 0;
    const n = pontos.length;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      areaPixels += pontos[i].x * pontos[j].y;
      areaPixels -= pontos[j].x * pontos[i].y;

      const dx = pontos[j].x - pontos[i].x;
      const dy = pontos[j].y - pontos[i].y;
      perimetroPixels += Math.sqrt(dx * dx + dy * dy);
    }

    areaPixels = Math.abs(areaPixels) / 2;

    // Converter pixels para cm (escala: escalaPixelsPorCm px = 1 cm)
    const areaCm2 = areaPixels / (escalaPixelsPorCm * escalaPixelsPorCm);
    const areaM2 = areaCm2 / 10000;
    const perimetroCm = perimetroPixels / escalaPixelsPorCm;

    return {
      cm2: Number(areaCm2.toFixed(1)),
      m2: Number(areaM2.toFixed(4)),
      perimetroCm: Number(perimetroCm.toFixed(1)),
    };
  };

  // Handlers do Mouse no Canvas (Touch / Lápis)
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (modoDesenho !== 'lapis') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setPontosDesenhados([{ x, y }]);
    setAreaCalculadaLapis(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || modoDesenho !== 'lapis') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPontosDesenhados((prev) => [...prev, { x, y }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || modoDesenho !== 'lapis') return;
    setIsDrawing(false);

    // Calcular área e perímetro
    if (pontosDesenhados.length > 2) {
      const metricas = calcularMetricasDesenhoLivre(pontosDesenhados);
      setAreaCalculadaLapis(metricas);
    }
  };

  const limparDesenhoLivre = () => {
    setPontosDesenhados([]);
    setAreaCalculadaLapis(null);
  };

  // Adicionar Molde Retangular à Cut List
  const handleAdicionarMoldeRetangular = () => {
    const areaUnitaria = rectLarguraCm * rectAlturaCm;
    const areaTotal = areaUnitaria * rectQtdCorte;
    const insumoObj = insumos.find((i) => i.id === rectInsumoId);

    const novaParte: ParteMolde = {
      id: `molde-${Date.now()}`,
      nome: rectNomePeça || 'Parte do Molde',
      largura_cm: Number(rectLarguraCm),
      altura_cm: Number(rectAlturaCm),
      quantidade_corte: Number(rectQtdCorte),
      material_insumo_id: rectInsumoId,
      material_nome: insumoObj?.nome || 'Tecido / Couro',
      area_unitaria_cm2: Number(areaUnitaria.toFixed(1)),
      area_total_cm2: Number(areaTotal.toFixed(1)),
      perimetro_cm: Number(((rectLarguraCm * 2) + (rectAlturaCm * 2)).toFixed(1)),
    };

    setPartes((prev) => [...prev, novaParte]);
  };

  // Adicionar Desenho Livre à Cut List
  const handleAdicionarDesenhoLivre = () => {
    if (!areaCalculadaLapis) return;
    const insumoObj = insumos.find((i) => i.id === rectInsumoId);
    const areaTotal = areaCalculadaLapis.cm2 * rectQtdCorte;

    const novaParte: ParteMolde = {
      id: `molde-${Date.now()}`,
      nome: rectNomePeça || 'Molde com Curvas',
      largura_cm: Number(Math.sqrt(areaCalculadaLapis.cm2).toFixed(1)),
      altura_cm: Number(Math.sqrt(areaCalculadaLapis.cm2).toFixed(1)),
      quantidade_corte: Number(rectQtdCorte),
      material_insumo_id: rectInsumoId,
      material_nome: insumoObj?.nome || 'Tecido / Couro',
      area_unitaria_cm2: areaCalculadaLapis.cm2,
      area_total_cm2: Number(areaTotal.toFixed(1)),
      perimetro_cm: areaCalculadaLapis.perimetroCm,
      observacao: 'Desenhado no canvas vetorial',
    };

    setPartes((prev) => [...prev, novaParte]);
    limparDesenhoLivre();
  };

  const handleRemoverParte = (id: string) => {
    setPartes((prev) => prev.filter((p) => p.id !== id));
  };

  // Upload simulado de PDF
  const handleUploadPdf = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const fakeUrl = URL.createObjectURL(file);
      setPdfUrl(fakeUrl);
    }
  };

  const handleSalvarTudo = () => {
    onSalvar({
      partes_molde: partes,
      arquivo_molde_pdf_url: pdfUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  // Totais por material
  const totaisPorMaterial: Record<string, { cm2: number; m2: number; count: number }> = {};
  partes.forEach((p) => {
    const mat = p.material_nome || 'Diversos';
    if (!totaisPorMaterial[mat]) {
      totaisPorMaterial[mat] = { cm2: 0, m2: 0, count: 0 };
    }
    totaisPorMaterial[mat].cm2 += p.area_total_cm2;
    totaisPorMaterial[mat].m2 += p.area_total_cm2 / 10000;
    totaisPorMaterial[mat].count += p.quantidade_corte;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#FAF6EE] border-2 border-[#B85324] rounded-3xl w-full max-w-6xl max-h-[95vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header do Estúdio de Modelagem */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#4A2013]/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#FAF6EE] border border-[#B85324]/30 text-[#B85324] rounded-2xl">
              <Ruler className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#B85324] px-2 py-0.5 rounded-full bg-[#F9E8B8]/60">
                  Estúdio CAD & Moldes
                </span>
                <span className="text-xs font-mono font-bold text-[#4A2013]/60">{produto.sku}</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-[#4A2013] mt-0.5">
                Modelagem & Engenharia de Corte: {produto.nome}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSalvarTudo}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Moldes & Projeto</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#4A2013]/50 hover:text-[#4A2013] rounded-full hover:bg-black/5"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Corpo do Estúdio: Grid 2 Colunas (Canvas à Esquerda, Cut List à Direita) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA: CANVAS DE DESENHO MILIMETRADO (7 colunas) */}
          <div className="lg:col-span-7 space-y-4 flex flex-col">
            <div className="bg-white p-4 rounded-3xl border border-[#4A2013]/15 shadow-sm space-y-3">
              {/* Barra de Ferramentas do Canvas */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#4A2013]/10">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModoDesenho('retangulo')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      modoDesenho === 'retangulo'
                        ? 'bg-[#4A2013] text-white shadow-sm'
                        : 'bg-[#FAF6EE] text-[#4A2013] hover:bg-[#F9E8B8]/40'
                    }`}
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>Retângulo / Fole</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setModoDesenho('lapis')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      modoDesenho === 'lapis'
                        ? 'bg-[#4A2013] text-white shadow-sm'
                        : 'bg-[#FAF6EE] text-[#4A2013] hover:bg-[#F9E8B8]/40'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5" />
                    <span>Lápis / Curvas Livres</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#4A2013]/60 font-semibold">Grade: 1cm = 10mm</span>
                  {modoDesenho === 'lapis' && pontosDesenhados.length > 0 && (
                    <button
                      type="button"
                      onClick={limparDesenhoLivre}
                      className="text-xs text-red-600 hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Limpar Traço</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Controles de Dimensões e Parâmetros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-2xl bg-[#FAF6EE] border border-[#B85324]/20 text-xs">
                <div>
                  <label className="text-[10px] font-bold text-[#4A2013] block mb-1">Nome da Parte</label>
                  <input
                    type="text"
                    value={rectNomePeça}
                    onChange={(e) => setRectNomePeça(e.target.value)}
                    placeholder="Ex: Espelho Frontal"
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-[#4A2013]/20 font-bold"
                  />
                </div>

                {modoDesenho === 'retangulo' ? (
                  <>
                    <div>
                      <label className="text-[10px] font-bold text-[#4A2013] block mb-1">Largura (cm)</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        step="0.5"
                        value={rectLarguraCm}
                        onChange={(e) => setRectLarguraCm(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-[#4A2013]/20 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[#4A2013] block mb-1">Altura (cm)</label>
                      <input
                        type="number"
                        min="1"
                        max="200"
                        step="0.5"
                        value={rectAlturaCm}
                        onChange={(e) => setRectAlturaCm(Number(e.target.value))}
                        className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-[#4A2013]/20 font-mono font-bold"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-span-2 flex items-center justify-center p-1 bg-white rounded-lg border text-center text-[10px] text-[#4A2013]/70">
                    ✍️ Desenhe livremente com o mouse/dedo na esteira verde para calcular a área e perímetro
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-[#4A2013] block mb-1">Qtd Cortes</label>
                  <select
                    value={rectQtdCorte}
                    onChange={(e) => setRectQtdCorte(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded-lg bg-white border border-[#4A2013]/20 font-bold"
                  >
                    <option value="1">1x por bolsa</option>
                    <option value="2">2x (par)</option>
                    <option value="4">4x</option>
                  </select>
                </div>
              </div>

              {/* Seleção do Insumo e Botão Adicionar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#4A2013]/70">Material de Corte:</span>
                  <select
                    value={rectInsumoId}
                    onChange={(e) => setRectInsumoId(e.target.value)}
                    className="text-xs p-1.5 rounded-xl bg-white border border-[#4A2013]/20 font-semibold"
                  >
                    {insumos.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.nome} ({i.categoria})
                      </option>
                    ))}
                  </select>
                </div>

                {modoDesenho === 'retangulo' ? (
                  <button
                    type="button"
                    onClick={handleAdicionarMoldeRetangular}
                    className="px-4 py-2 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Peça à Lista</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={!areaCalculadaLapis}
                    onClick={handleAdicionarDesenhoLivre}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                      areaCalculadaLapis
                        ? 'bg-[#2D7A4C] hover:bg-[#23603B] text-white cursor-pointer'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Salvar Curva Desenhada</span>
                  </button>
                )}
              </div>

              {/* CANVAS INTERATIVO MILIMETRADO */}
              <div className="relative rounded-2xl overflow-hidden border-2 border-[#4A2013]/20 shadow-inner">
                <canvas
                  ref={canvasRef}
                  width={640}
                  height={380}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  className={`w-full h-[320px] sm:h-[380px] block ${
                    modoDesenho === 'lapis' ? 'cursor-crosshair' : 'cursor-default'
                  }`}
                />

                {/* Badge com Resultados ao Vivo do Desenho Livre */}
                {modoDesenho === 'lapis' && areaCalculadaLapis && (
                  <div className="absolute bottom-3 left-3 p-3 rounded-2xl bg-black/80 backdrop-blur-md text-white text-xs border border-white/20 shadow-xl space-y-1">
                    <span className="text-[10px] font-black uppercase text-[#F9E8B8] block">
                      📐 Métricas do Desenho Livre (Shoelace):
                    </span>
                    <div className="flex gap-4 font-mono text-sm">
                      <div>Área: <strong>{areaCalculadaLapis.cm2} cm²</strong> ({areaCalculadaLapis.m2} m²)</div>
                      <div>Perímetro: <strong>{areaCalculadaLapis.perimetroCm} cm</strong></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA: CUT LIST & ANEXO DE PDF (5 colunas) */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* 1. Tabela de Peças do Molde (Cut List) */}
            <div className="bg-white p-5 rounded-3xl border border-[#4A2013]/15 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#4A2013]/10">
                <div>
                  <h3 className="font-bold text-base text-[#4A2013]">Partes do Molde Cadastradas</h3>
                  <span className="text-[10px] text-[#4A2013]/60">{partes.length} peças cortadas por unidade</span>
                </div>
              </div>

              {partes.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#4A2013]/50 border-2 border-dashed rounded-2xl border-[#4A2013]/10">
                  Nenhuma parte adicionada. Use o canvas ao lado para desenhar e incluir as peças do corte.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {partes.map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-xl bg-[#FAF6EE] border border-[#4A2013]/10 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="pr-1">
                        <strong className="text-sm font-bold text-[#4A2013] block">{p.nome}</strong>
                        <span className="text-[10px] text-[#B85324] font-semibold block">{p.material_nome}</span>
                        <span className="text-[11px] text-[#4A2013]/70 font-mono">
                          {p.largura_cm}×{p.altura_cm} cm • <strong>{p.quantidade_corte}x</strong> ({p.area_total_cm2} cm²)
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoverParte(p.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Remover peça"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Resumo Consumo por Material */}
              {Object.keys(totaisPorMaterial).length > 0 && (
                <div className="p-3.5 rounded-2xl bg-[#F9E8B8]/40 border border-[#B85324]/20 space-y-1.5 text-xs text-[#4A2013]">
                  <strong className="text-[11px] font-black uppercase text-[#B85324] block">
                    Consumo Líquido Estimado por Peça:
                  </strong>
                  {Object.entries(totaisPorMaterial).map(([mat, met]) => (
                    <div key={mat} className="flex justify-between font-mono text-[11px]">
                      <span className="font-sans font-medium text-[#4A2013]">{mat}:</span>
                      <strong>{met.m2.toFixed(3)} m² ({met.cm2} cm²)</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Campo de Anexo & Link do PDF do Projeto */}
            <div className="bg-white p-5 rounded-3xl border border-[#4A2013]/15 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#4A2013]/10">
                <span className="text-xs font-bold text-[#4A2013] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#B85324]" />
                  <span>Projeto & Molde em PDF</span>
                </span>
                <div className="flex gap-1 text-[10px]">
                  <button
                    type="button"
                    onClick={() => setModoEntradaPdf('link')}
                    className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                      modoEntradaPdf === 'link' ? 'bg-[#4A2013] text-white' : 'text-[#4A2013]/60'
                    }`}
                  >
                    Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setModoEntradaPdf('upload')}
                    className={`px-2 py-0.5 rounded-md font-bold cursor-pointer ${
                      modoEntradaPdf === 'upload' ? 'bg-[#4A2013] text-white' : 'text-[#4A2013]/60'
                    }`}
                  >
                    Arquivo
                  </button>
                </div>
              </div>

              {modoEntradaPdf === 'link' ? (
                <div>
                  <label className="text-[10px] text-[#4A2013]/70 block mb-1">
                    Link do Molde (Google Drive, Dropbox, etc.):
                  </label>
                  <input
                    type="url"
                    value={pdfUrl}
                    onChange={(e) => setPdfUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-3 py-2 text-xs rounded-xl bg-[#FAF6EE] border border-[#4A2013]/20 focus:outline-none focus:border-[#B85324]"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] text-[#4A2013]/70 block mb-1">
                    Selecione o arquivo PDF do Molde:
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUploadPdf}
                    className="w-full text-xs text-[#4A2013] file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#FAF6EE] file:text-[#B85324] hover:file:bg-[#F9E8B8]/40 cursor-pointer"
                  />
                </div>
              )}

              {/* Botão de Download / Visualização se houver PDF */}
              {pdfUrl && (
                <div className="pt-2">
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2 px-3 rounded-xl bg-[#FAF6EE] border border-[#B85324]/30 text-[#B85324] hover:bg-[#F9E8B8]/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Baixar / Imprimir Molde PDF</span>
                  </a>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Footer com Botão de Confirmação */}
        <div className="p-4 bg-white border-t border-[#4A2013]/10 flex items-center justify-between shrink-0">
          <span className="text-xs text-[#4A2013]/60">
            {partes.length} peças cadastradas • Consumo calculado automaticamente
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#4A2013]/20 text-xs font-bold text-[#4A2013]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSalvarTudo}
              className="px-6 py-2.5 rounded-xl bg-[#B85324] hover:bg-[#9A421A] text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Concluir & Aplicar Moldes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
