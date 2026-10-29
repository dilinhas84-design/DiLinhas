import React, { useState } from 'react';
import { ChecklistQualidade } from '../../types/database';
import { CheckCircle2, X, ShieldCheck, AlertOctagon } from 'lucide-react';

interface QualityChecklistModalProps {
  isOpen: boolean;
  codigoOp: string;
  produtoNome: string;
  quantidade: number;
  onClose: () => void;
  onConfirm: (checklist: ChecklistQualidade, notas?: string) => void;
}

export const QualityChecklistModal: React.FC<QualityChecklistModalProps> = ({
  isOpen,
  codigoOp,
  produtoNome,
  quantidade,
  onClose,
  onConfirm,
}) => {
  const [checklist, setChecklist] = useState<ChecklistQualidade>({
    costura_alinhada: true,
    sem_fios_soltos: true,
    ziper_testado: true,
    etiqueta_posicionada: true,
    limpeza_geral: true,
    medidas_conferidas: true,
  });

  const [notas, setNotas] = useState('');

  if (!isOpen) return null;

  const toggleItem = (key: keyof ChecklistQualidade) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const todosAprovados = Object.values(checklist).every(Boolean);

  const items: { key: keyof ChecklistQualidade; label: string; desc: string }[] = [
    {
      key: 'costura_alinhada',
      label: 'Alinhamento e Pesponto Reto',
      desc: 'Costura uniforme, sem pulos de ponto ou desvios visíveis',
    },
    {
      key: 'sem_fios_soltos',
      label: 'Corte e Arremate de Fios',
      desc: 'Peça limpa, sem pontas de linha ou rebarbas de costura',
    },
    {
      key: 'ziper_testado',
      label: 'Ferragens e Cursores Testados',
      desc: 'Zíper desliza suavemente, mosquetões e reguladores funcionais',
    },
    {
      key: 'etiqueta_posicionada',
      label: 'Etiqueta Di\' Linhas Posicionada',
      desc: 'Gravação da borboleta e marcação centralizada no padrão',
    },
    {
      key: 'medidas_conferidas',
      label: 'Gabarito e Medidas em Conformidade',
      desc: 'Largura, altura, profundidade e alças conforme a modelagem',
    },
    {
      key: 'limpeza_geral',
      label: 'Higienização e Embalagem Pronta',
      desc: 'Sem marcas de giz, poeira ou resíduos de cola de montagem',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF6EE] border-2 border-[#2D7A4C] rounded-3xl w-full max-w-xl p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#E8F5EE] text-[#2D7A4C] rounded-2xl">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#4A2013]">Controle de Qualidade & Acabamento</h3>
              <p className="text-sm text-[#4A2013]/70">
                {codigoOp} • <strong className="text-[#B85324]">{quantidade}x {produtoNome}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#4A2013]/50 hover:text-[#4A2013] rounded-full hover:bg-black/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-4 bg-[#E8F5EE] p-3.5 rounded-2xl border border-[#2D7A4C]/20 flex items-start gap-2.5 text-xs text-[#2D7A4C]">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Ao aprovar todos os critérios, a Ordem de Produção será <strong>automaticamente finalizada</strong> e o saldo de <strong>{quantidade} unidades</strong> entrará imediatamente no estoque de produtos acabados!
          </span>
        </div>

        {/* Checklist */}
        <div className="mt-4 space-y-2.5">
          {items.map((item) => (
            <label
              key={item.key}
              onClick={() => toggleItem(item.key)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                checklist[item.key]
                  ? 'border-[#2D7A4C] bg-white shadow-sm'
                  : 'border-red-300 bg-red-50/50'
              }`}
            >
              <div className="pr-3">
                <span className="font-bold text-sm text-[#4A2013] block">
                  {item.label}
                </span>
                <span className="text-xs text-[#4A2013]/60">{item.desc}</span>
              </div>
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border-2 transition-colors ${
                  checklist[item.key]
                    ? 'bg-[#2D7A4C] border-[#2D7A4C] text-white'
                    : 'border-red-400 bg-white text-transparent'
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </label>
          ))}
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-[#4A2013] mb-1.5">
            Observações de Inspeção / Registro de Conformidade (opcional):
          </label>
          <input
            type="text"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Ex: Lote 100% inspecionado, acabamento em couro hidratado..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#4A2013]/20 bg-white text-sm focus:outline-none focus:border-[#2D7A4C]"
          />
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#4A2013]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-[#4A2013]/20 font-bold text-sm text-[#4A2013] hover:bg-black/5"
          >
            Voltar
          </button>

          <button
            type="button"
            disabled={!todosAprovados}
            onClick={() => onConfirm(checklist, notas)}
            className={`px-6 py-3.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-lg transition-all ${
              todosAprovados
                ? 'bg-[#2D7A4C] hover:bg-[#23603B] text-white cursor-pointer hover:scale-[1.02]'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            {todosAprovados ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>Aprovar Qualidade & Entrada no Estoque</span>
              </>
            ) : (
              <>
                <AlertOctagon className="w-5 h-5" />
                <span>Marque todos os itens para aprovar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
