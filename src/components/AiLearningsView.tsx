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
      <div className="flex items-start gap-3 p-5 rounded-[22px] bg-[#141414] border border-[#242424]">
        <div className="size-9 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center shrink-0">
          <Brain size={16} className="text-[#ececec]" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#ececec]">
            Memória de Aprendizado Contínuo da IA
          </span>
          <p className="text-[12px] text-[#8a8a8a] leading-relaxed">
            Sempre que você rejeita um post com feedback ou faz ajustes finos no editor, a IA armazena essas diretrizes nesta memória para nunca mais repetir os erros e ficar progressivamente mais parecida com seu estilo.
          </p>
        </div>
      </div>

      {/* Learnings List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
          DIRETRIZES MEMORIZADAS ({learnings.length})
        </h3>

        {learnings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {learnings.map((learning) => (
              <div
                key={learning.id}
                className="flex flex-col justify-between p-5 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all group"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#212121] text-[#9a9a9a] border border-[#2c2c2c]">
                      {learning.category.toUpperCase()}
                    </span>

                    <span className="text-[10px] font-mono text-[#ececec] bg-[#212121] border border-[#2c2c2c] px-2.5 py-0.5 rounded-full">
                      {learning.source === 'rejection' ? 'Originado de Rejeição' : 'Edição Manual'}
                    </span>
                  </div>

                  <p className="text-xs text-[#d0d0d0] leading-relaxed font-sans">
                    {learning.lesson}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#222222]">
                  <span className="text-[10px] font-mono text-[#6f6f6f]">
                    {new Date(learning.created_at).toLocaleDateString('pt-BR')}
                  </span>

                  <button
                    type="button"
                    onClick={() => onDeleteLearning(learning.id)}
                    className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors cursor-pointer"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center rounded-[22px] bg-[#141414] border border-[#242424]">
            <p className="text-xs text-[#7a7a7a]">
              Nenhuma lição memorizada ainda. Ao rejeitar posts e adicionar observações, elas aparecerão aqui.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
