'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Brain, Trash2 } from 'lucide-react';

interface RejectPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  onConfirmReject: (
    postId: string,
    reasonText: string,
    category: 'tone' | 'structure' | 'topics' | 'formatting'
  ) => Promise<void>;
}

export function RejectPostModal({
  isOpen,
  onClose,
  postId,
  onConfirmReject,
}: RejectPostModalProps) {
  if (!isOpen) return null;

  const [category, setCategory] = useState<'tone' | 'structure' | 'topics' | 'formatting'>('tone');
  const [reasonText, setReasonText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      await onConfirmReject(postId, reasonText.trim(), category);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md max-h-[92dvh] rounded-[24px] bg-[#141414] border border-[#262626] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-[#1f1f1f]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-[#ff5f56]" />
            <span className="font-medium text-sm text-[#ececec]">Rejeitar Post</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-full flex items-center justify-center text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121]"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 flex flex-col gap-4 overflow-y-auto">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-[#1a1a1a] border border-[#262626] text-xs text-[#9a9a9a]">
            <Brain size={16} className="text-[#ececec] shrink-0 mt-0.5" />
            <span>
              Ao explicar o motivo da rejeição, a IA grava esta instrução na memória e não comete o mesmo erro nas próximas gerações.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#8a8a8a]">Motivo Principal:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4e4e4e]"
            >
              <option value="tone">Tom muito genérico / Parece escrito por IA</option>
              <option value="structure">Gancho ou estrutura fraca</option>
              <option value="topics">Tema ou pauta irrelevante para o momento</option>
              <option value="formatting">Formatação / Quebras de linha inadequadas</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-[#8a8a8a]">O que a IA deve evitar no futuro?</label>
            <textarea
              rows={3}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Ex: Não use listas numeradas óbvias e pare de começar com perguntas retóricas..."
              className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] placeholder-[#6f6f6f] text-xs focus:outline-none focus:border-[#4e4e4e] resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-4 sm:px-5 py-3 border-t border-[#1f1f1f] bg-[#141414]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97]"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium bg-[#ff5f56] hover:bg-[#ff5f56]/90 text-white shadow-sm transition-all active:scale-[0.97] disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Rejeitar &amp; Treinar IA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
