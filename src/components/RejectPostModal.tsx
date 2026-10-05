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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0c0c12] border border-white/[0.1] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-rose-400" />
            <span className="font-semibold text-sm text-white">Rejeitar Post</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 text-xs text-violet-200">
            <Brain size={16} className="text-violet-400 shrink-0 mt-0.5" />
            <span>
              Ao explicar o motivo da rejeição, a IA grava esta instrução na memória e não comete o mesmo erro nas próximas gerações.
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50">Motivo Principal:</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-[#14141c] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
            >
              <option value="tone">Tom muito genérico / Parece escrito por IA</option>
              <option value="structure">Gancho ou estrutura fraca</option>
              <option value="topics">Tema ou pauta irrelevante para o momento</option>
              <option value="formatting">Formatação / Quebras de linha inadequadas</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-mono text-white/50">O que a IA deve evitar no futuro?</label>
            <textarea
              rows={3}
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              placeholder="Ex: Não use listas numeradas óbvias e pare de começar com perguntas retóricas..."
              className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-white/[0.08] bg-[#0c0c12]">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:text-white"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleConfirm}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Rejeitar & Treinar IA</span>
          </button>
        </div>
      </div>
    </div>
  );
}
