'use client';

import React from 'react';
import { Brain, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import type { AiLearning } from '@/types';

interface AiLearningsViewProps {
  learnings: AiLearning[];
  onDeleteLearning: (id: string) => Promise<void>;
}

export function AiLearningsView({ learnings, onDeleteLearning }: AiLearningsViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-violet-500/[0.08] border border-violet-500/20 text-violet-200">
        <Brain size={18} className="text-violet-400 shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-violet-300">
            Memória de Aprendizado Contínuo da IA
          </span>
          <p className="text-[12px] text-violet-100/70 leading-relaxed">
            Sempre que você rejeita um post com feedback ou faz ajustes finos no editor, a IA armazena essas diretrizes nesta memória para nunca mais repetir os erros e ficar progressivamente mais parecida com seu estilo.
          </p>
        </div>
      </div>

      {/* Learnings List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-xs font-mono text-white/50 uppercase tracking-wider">
          DIRETRIZES MEMORIZADAS ({learnings.length})
        </h3>

        {learnings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {learnings.map((learning) => (
              <div
                key={learning.id}
                className="flex flex-col justify-between p-4 rounded-xl bg-[#0f0f15] border border-white/[0.07] hover:border-violet-500/30 transition-all group"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.05] text-white/50 border border-white/[0.07]">
                      {learning.category.toUpperCase()}
                    </span>

                    <span className="text-[10px] font-mono text-violet-300 bg-violet-500/10 px-2 py-0.5 rounded">
                      {learning.source === 'rejection' ? 'Originado de Rejeição' : 'Edição Manual'}
                    </span>
                  </div>

                  <p className="text-xs text-white/85 leading-relaxed font-sans">
                    {learning.lesson}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/[0.04]">
                  <span className="text-[10px] font-mono text-white/30">
                    {new Date(learning.created_at).toLocaleDateString('pt-BR')}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteLearning(learning.id)}
                    className="p-1 rounded text-white/30 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center rounded-xl bg-white/[0.015] border border-white/[0.05]">
            <p className="text-xs text-white/40">
              Nenhuma lição memorizada ainda. Ao rejeitar posts e adicionar observações, elas aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
