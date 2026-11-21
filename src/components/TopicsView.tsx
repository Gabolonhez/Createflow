'use client';

import React, { useState } from 'react';
import { Flame, Sparkles, Plus, Trash2, ArrowRight } from 'lucide-react';
import { XLogo, LinkedInLogo } from './BrandIcons';
import type { Topic } from '@/types';

interface TopicsViewProps {
  topics: Topic[];
  onGenerateNewTopics: () => Promise<void>;
  onDeleteTopic: (id: string) => Promise<void>;
  onGenerateFromTopic: (topic: Topic) => void;
}

export function TopicsView({
  topics,
  onGenerateNewTopics,
  onDeleteTopic,
  onGenerateFromTopic,
}: TopicsViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateTopics = async () => {
    setIsGenerating(true);
    try {
      await onGenerateNewTopics();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between p-5 rounded-[22px] bg-[#141414] border border-[#242424] flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-full bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#ececec] shrink-0">
            <Flame size={16} />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[13px] font-semibold tracking-tight text-[#ececec]">
              Pautas & Ângulos Estratégicos
            </h3>
            <p className="text-xs text-[#7a7a7a] mt-0.5">
              Ideias de alto engajamento sugeridas pela IA com base no seu nicho, pilares e tendências de tecnologia.
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={isGenerating}
          onClick={handleGenerateTopics}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-[#f2f2f2] hover:bg-white text-[#0a0a0a] transition-all disabled:opacity-50 cursor-pointer active:scale-[0.97]"
        >
          <Sparkles size={13} className={isGenerating ? 'animate-spin' : ''} />
          <span>{isGenerating ? 'Sugerindo pautas…' : 'Sugerir 5 pautas com IA'}</span>
        </button>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <div
            key={topic.id}
            className="flex flex-col justify-between p-5 rounded-[20px] bg-[#161616] border border-[#222222] hover:border-[#323232] transition-all group"
          >
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-[#212121] text-[#a0a0a0] border border-[#2c2c2c]">
                  {topic.pillar}
                </span>

                <div className="flex items-center gap-1.5">
                  {topic.platforms.includes('x') && <XLogo className="size-3 text-[#ececec]" />}
                  {topic.platforms.includes('linkedin') && (
                    <LinkedInLogo className="size-3 text-[#0A66C2]" />
                  )}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-[#ececec] leading-snug">
                {topic.title}
              </h4>

              <div className="p-3 rounded-[14px] bg-[#1c1c1c] border border-[#262626] text-xs text-[#8a8a8a] leading-relaxed">
                <strong className="text-[#ececec] font-medium">Ângulo provocativo: </strong>
                {topic.hook_angle}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3.5 mt-4 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => onGenerateFromTopic(topic)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium bg-[#212121] hover:bg-[#2a2a2a] text-[#ececec] border border-[#2e2e2e] transition-all active:scale-[0.97] cursor-pointer"
              >
                <Sparkles size={12} className="text-[#a0a0a0]" />
                <span>Gerar post desta pauta</span>
                <ArrowRight size={11} />
              </button>

              <button
                type="button"
                onClick={() => onDeleteTopic(topic.id)}
                className="p-1.5 rounded-full text-[#7a7a7a] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors cursor-pointer"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
