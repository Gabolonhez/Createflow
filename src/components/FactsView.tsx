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
      <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20 text-emerald-200">
        <ShieldCheck size={18} className="text-emerald-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-emerald-300">
            Fatos Reais = Grounding da IA (Zero Alucinação)
          </span>
          <p className="text-[12px] text-emerald-100/70 leading-relaxed">
            Cadastre conquistas, métricas reais, stack tecnológica e lições da sua trajetória. Ao redigir posts, a IA consultará essa base como verdade factual e nunca inventará números ou casos falsos.
          </p>
        </div>
      </div>

      {/* Add Fact Form */}
      <form
        onSubmit={handleAddFact}
        className="flex flex-col gap-3 p-4 rounded-xl bg-white/[0.025] border border-white/[0.08]"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
            <Plus size={14} className="text-violet-400" />
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
              className="px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-violet-500/50"
            />
          </div>

          <div className="flex flex-col gap-1">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#14141c] border border-white/[0.08] text-white text-xs focus:outline-none focus:border-violet-500/50"
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
          className="w-full px-3 py-2 rounded-lg bg-black/40 border border-white/[0.08] text-white text-xs placeholder:text-white/35 focus:outline-none focus:border-violet-500/50 resize-none"
        />

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!subject.trim() || !detail.trim() || isSubmitting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-white/90 disabled:opacity-40 transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Salvar fato</span>
          </button>
        </div>
      </form>

      {/* Facts List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-mono text-white/50 uppercase tracking-wider">
          BASE DE FATOS ({facts.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className="flex flex-col justify-between p-4 rounded-xl bg-[#0f0f15] border border-white/[0.07] hover:border-white/[0.14] transition-all group"
            >
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {fact.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteFact(fact.id)}
                    className="p-1 rounded text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-white/90 mt-1">{fact.subject}</h4>
                <p className="text-xs text-white/65 leading-relaxed">{fact.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
