'use client';

import React from 'react';
import type { MainSection, ActiveSubView } from '@/types';

interface XSectionBarProps {
  currentSection: MainSection;
  currentSubView: ActiveSubView;
  onSelectSection: (section: MainSection) => void;
  onSelectSubView: (subView: ActiveSubView) => void;
}

const SECTION_CONFIG: {
  id: MainSection;
  label: string;
  subViews: { id: ActiveSubView; label: string }[];
}[] = [
  {
    id: 'plan',
    label: 'Planejamento',
    subViews: [
      { id: 'posts', label: 'Posts' },
      { id: 'calendar', label: 'Calendário' },
    ],
  },
  {
    id: 'ideas',
    label: 'Ideias',
    subViews: [
      { id: 'my-ideas', label: 'Minhas Ideias' },
      { id: 'topics', label: 'Pautas' },
      { id: 'facts', label: 'Fatos Reais' },
      { id: 'references', label: 'Referências' },
    ],
  },
  {
    id: 'automations',
    label: 'Funis & Auto-DM',
    subViews: [
      { id: 'dm-campaigns', label: 'Campanhas de DM' },
      { id: 'dm-inbox', label: 'Inbox Social' },
      { id: 'tracked-links', label: 'Links & Cliques' },
      { id: 'dm-logs', label: 'Logs de Disparos' },
    ],
  },
  {
    id: 'voice',
    label: 'Voz e Ajustes',
    subViews: [
      { id: 'manual', label: 'Meu Estilo & Regras' },
      { id: 'learnings', label: 'Aprendizados' },
    ],
  },
  {
    id: 'results',
    label: 'Desempenho',
    subViews: [
      { id: 'instagram-analytics', label: 'Analytics Instagram' },
      { id: 'performance', label: 'Fila & Posts' },
    ],
  },
  {
    id: 'settings',
    label: 'Configurações',
    subViews: [{ id: 'connection', label: 'Conexões' }],
  },
];

export function XSectionBar({
  currentSection,
  currentSubView,
  onSelectSection,
  onSelectSubView,
}: XSectionBarProps) {
  const activeGroup = SECTION_CONFIG.find((g) => g.id === currentSection) || SECTION_CONFIG[0];

  return (
    <div className="flex flex-col gap-3 min-w-0">
      {/* Main Groups Tablist */}
      <div
        className="flex gap-1 shrink-0 overflow-x-auto bg-[#141414] border border-[#242424] rounded-full p-1 w-fit max-w-full"
        role="tablist"
      >
        {SECTION_CONFIG.map((group) => {
          const isSelected = currentSection === group.id;
          return (
            <button
              key={group.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => {
                onSelectSection(group.id);
                onSelectSubView(group.subViews[0].id);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#212121] text-[#ececec]'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      {/* Sub-views Segmented Control */}
      {activeGroup.subViews.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          {activeGroup.subViews.map((sub) => {
            const isSubSelected = currentSubView === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubView(sub.id)}
                className={`px-3.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSubSelected
                    ? 'bg-[#212121] text-[#ececec] border border-[#3a3a3a]'
                    : 'bg-[#141414] text-[#8a8a8a] border border-[#242424] hover:text-[#ececec] hover:bg-[#1c1c1c]'
                }`}
              >
                {sub.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
