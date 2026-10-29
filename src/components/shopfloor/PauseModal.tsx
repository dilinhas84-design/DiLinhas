import React, { useState } from 'react';
import { MotivoPausa } from '../../types/database';
import { AlertCircle, X, PauseCircle } from 'lucide-react';

interface PauseModalProps {
  isOpen: boolean;
  etapaNome: string;
  onClose: () => void;
  onConfirm: (motivo: MotivoPausa, observacao?: string) => void;
}

const MOTIVOS: { label: MotivoPausa; desc: string; icon: string }[] = [
  { label: 'Falta de Insumo', desc: 'Aguardando corte, zíper, linha ou ferragem', icon: '📦' },
  { label: 'Quebra de Agulha', desc: 'Troca de agulha ou problema de ponta', icon: '🪡' },
  { label: 'Ajuste de Máquina', desc: 'Tensão de linha, transporte, lançadeira', icon: '⚙️' },
  { label: 'Descanso', desc: 'Pausa regulamentar ou café da equipe', icon: '☕' },
  { label: 'Dúvida de Projeto', desc: 'Conferência com ficha técnica ou modelagem', icon: '📐' },
  { label: 'Outro', desc: 'Qualquer outra interrupção não programada', icon: '⏱️' },
];

export const PauseModal: React.FC<PauseModalProps> = ({
  isOpen,
  etapaNome,
  onClose,
  onConfirm,
}) => {
  const [motivoSelecionado, setMotivoSelecionado] = useState<MotivoPausa>('Ajuste de Máquina');
  const [observacao, setObservacao] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#FAF6EE] border-2 border-[#D97706] rounded-3xl w-full max-w-lg p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-[#4A2013]/15">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#FEF3C7] text-[#D97706] rounded-2xl">
              <PauseCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#4A2013]">Pausar Linha de Produção</h3>
              <p className="text-sm text-[#4A2013]/70">Etapa: <strong className="text-[#B85324]">{etapaNome}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#4A2013]/50 hover:text-[#4A2013] rounded-full hover:bg-black/5"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mt-5">
          <label className="block text-sm font-bold text-[#4A2013] mb-3">
            Selecione o Motivo da Parada (Lean Andon):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {MOTIVOS.map((m) => (
              <button
                key={m.label}
                type="button"
                onClick={() => setMotivoSelecionado(m.label)}
                className={`p-3.5 rounded-2xl text-left border-2 transition-all cursor-pointer flex flex-col gap-1 ${
                  motivoSelecionado === m.label
                    ? 'border-[#D97706] bg-[#FEF3C7] shadow-sm'
                    : 'border-[#4A2013]/10 bg-white hover:border-[#D97706]/40'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-sm text-[#4A2013]">
                  <span className="text-lg">{m.icon}</span>
                  <span>{m.label}</span>
                </div>
                <span className="text-xs text-[#4A2013]/60 pl-6">{m.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-semibold text-[#4A2013] mb-1.5">
            Observações adicionais (opcional):
          </label>
          <input
            type="text"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: Regulando ponto na máquina reta #03..."
            className="w-full px-4 py-2.5 rounded-xl border border-[#4A2013]/20 bg-white text-sm focus:outline-none focus:border-[#D97706]"
          />
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#4A2013]/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-[#4A2013]/20 font-bold text-sm text-[#4A2013] hover:bg-black/5"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(motivoSelecionado, observacao)}
            className="px-6 py-3 rounded-xl bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-sm shadow-md flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            <span>Confirmar Pausa Andon</span>
          </button>
        </div>
      </div>
    </div>
  );
};
