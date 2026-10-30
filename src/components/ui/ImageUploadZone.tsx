import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, Link, RefreshCw } from 'lucide-react';

interface ImageUploadZoneProps {
  label?: string;
  value?: string;
  onChange: (imageUrl: string) => void;
  aspectRatio?: 'square' | 'video' | 'avatar';
  placeholderText?: string;
}

export const ImageUploadZone: React.FC<ImageUploadZoneProps> = ({
  label,
  value,
  onChange,
  aspectRatio = 'square',
  placeholderText = 'Arraste uma foto ou clique para selecionar',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInputValue, setUrlInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compressão no navegador via Canvas (gera WebP/JPEG leve)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDimension = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
          onChange(compressedDataUrl);
        }
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (urlInputValue.trim()) {
      onChange(urlInputValue.trim());
      setUrlInputValue('');
      setShowUrlInput(false);
    }
  };

  const aspectClass = {
    square: 'aspect-square max-h-56',
    video: 'aspect-video max-h-48',
    avatar: 'w-24 h-24 rounded-full mx-auto',
  }[aspectRatio];

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-[#4A2013]">{label}</label>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-[10px] text-[#B85324] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
          >
            <Link className="w-3 h-3" />
            <span>{showUrlInput ? 'Ocultar URL' : 'Inserir por Link/URL'}</span>
          </button>
        </div>
      )}

      {/* Input de URL direta */}
      {showUrlInput && (
        <div className="flex gap-2 mb-2 animate-fadeIn">
          <input
            type="url"
            value={urlInputValue}
            onChange={(e) => setUrlInputValue(e.target.value)}
            placeholder="Cole o link da imagem (https://...)"
            className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-white border border-[#4A2013]/20 focus:outline-none focus:border-[#B85324]"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-3 py-1.5 rounded-xl bg-[#4A2013] text-white text-xs font-bold hover:bg-[#32150C]"
          >
            Aplicar
          </button>
        </div>
      )}

      {/* Área com Imagem ou Dropzone Vazio */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border-2 border-[#B85324]/30 bg-white shadow-sm">
          <div className={`w-full flex items-center justify-center bg-[#FAF6EE] ${aspectClass}`}>
            <img
              src={value}
              alt="Preview"
              className={`w-full h-full object-cover ${aspectRatio === 'avatar' ? 'rounded-full' : ''}`}
            />
          </div>

          {/* Overlay de Ações ao passar o mouse / toque */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl bg-white text-[#4A2013] hover:text-[#B85324] text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
              title="Trocar imagem"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Trocar</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold shadow-md flex items-center gap-1 cursor-pointer"
              title="Remover imagem"
            >
              <X className="w-4 h-4" />
              <span>Remover</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all cursor-pointer ${
            isDragging
              ? 'border-[#B85324] bg-[#F9E8B8]/40 scale-101'
              : 'border-[#4A2013]/20 bg-[#FAF6EE] hover:border-[#B85324]/60 hover:bg-white'
          } ${aspectClass}`}
        >
          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-6 h-6 text-[#B85324] animate-spin" />
              <span className="text-xs font-semibold text-[#4A2013]">Otimizando imagem...</span>
            </div>
          ) : (
            <>
              <div className="p-2.5 rounded-xl bg-[#F9E8B8]/60 text-[#B85324] mb-1.5 shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-[#4A2013] text-center block">
                {placeholderText}
              </span>
              <span className="text-[10px] text-[#4A2013]/60 text-center block mt-0.5">
                PNG, JPG ou WebP (compressão automática rápida)
              </span>
            </>
          )}
        </div>
      )}

      {/* Input de arquivo invisível */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};
