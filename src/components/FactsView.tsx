'use client';

import React, { useState } from 'react';
import { FileText, Plus, Trash2, ShieldCheck, Sparkles } from 'lucide-react';
import type { Fact } from '@/types';

interface FactsViewProps {
  facts: Fact[];
  onSaveFact: (fact: Partial<Fact>) => Promise<void>;
  onDeleteFact: (id: string) => Promise<void>;
}

const CATEGORIES = [
  'Métricas & Resultados',
  'Projetos & Stack',
  'Trajetória & Lições',
  'Produtos & Clientes',
  'Opiniões Técnicas Fortes',
];

export function FactsView({ facts, onSaveFact, onDeleteFact }: FactsViewProps) {
  const [subject, setSubject] = useState('');
  const [detail, setDetail] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddFact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !detail.trim()) return;

    setIsSubmitting(true);
    try {
      await onSaveFact({
        subject: subject.trim(),
        detail: detail.trim(),
        category,
      });
      setSubject('');
      setDetail('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Informative Banner */}
      <div className="flex items-start gap-3 p-5 rounded-[22px] bg-[#141414] border border-[#242424]">
        <div className="size-9 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center shrink-0">
          <ShieldCheck size={16} className="text-[#7ae6a0]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#ececec]">
            Fatos Reais = Grounding da IA (Zero Alucinação)
          </span>
          <p className="text-[12px] text-[#8a8a8a] leading-relaxed">
            Cadastre conquistas, métricas reais, stack tecnológica e lições da sua trajetória. Ao redigir posts, a IA consultará essa base como verdade factual e nunca inventará números ou casos falsos.
          </p>
        </div>
      </div>

      {/* Add Fact Form */}
      <form
        onSubmit={handleAddFact}
        className="flex flex-col gap-3 p-5 rounded-[22px] bg-[#141414] border border-[#242424]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-[#ececec] flex items-center gap-1.5">
            <Plus size={14} className="text-[#8a8a8a]" />
            Adicionar Fato Verificado
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex flex-col gap-1 md:col-span-2">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Assunto / Tópico (ex: Migração de microsserviços para monólito)..."
              className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs focus:outline-none focus:border-[#4a4a4a] transition-colors"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <textarea
          rows={2}
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          placeholder="O fato detalhado (ex: Reduzimos a latência de 800ms para 45ms e o custo de servidores caiu 40% em 3 meses)..."
          className="w-full px-3.5 py-2.5 rounded-[14px] bg-[#1c1c1c] border border-[#2a2a2a] text-[#ececec] text-xs placeholder:text-[#6f6f6f] focus:outline-none focus:border-[#4a4a4a] resize-none transition-colors"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!subject.trim() || !detail.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] disabled:opacity-40 transition-all active:scale-[0.97] cursor-pointer"
          >
            <Plus size={14} />
            <span>Salvar fato</span>
          </button>
        </div>
      </form>

      {/* Facts List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
          BASE DE FATOS ({facts.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className="flex flex-col justify-between p-5 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#303030] transition-all group"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#212121] text-[#7ae6a0] border border-[#2c2c2c]">
                    {fact.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteFact(fact.id)}
                    className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-[#ececec] mt-0.5">{fact.subject}</h4>
                <p className="text-xs text-[#9a9a9a] leading-relaxed">{fact.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
