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
    subViews: [{ id: 'performance', label: 'Métricas' }],
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
        className="flex gap-1 shrink-0 overflow-x-auto bg-white/[0.03] border border-white/[0.07] rounded-lg p-1 w-fit max-w-full"
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
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all whitespace-nowrap ${
                isSelected
                  ? 'bg-white/[0.10] text-white shadow-sm font-semibold'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {group.label}
            </button>
          );
        })}
      </div>

      {/* Sub-views Segmented Control */}
      {activeGroup.subViews.length > 1 && (
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          {activeGroup.subViews.map((sub) => {
            const isSubSelected = currentSubView === sub.id;
            return (
              <button
                key={sub.id}
                type="button"
                onClick={() => onSelectSubView(sub.id)}
                className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                  isSubSelected
                    ? 'bg-violet-500/15 text-violet-300 border border-violet-500/30'
                    : 'bg-white/[0.02] text-white/50 border border-white/[0.05] hover:text-white hover:bg-white/[0.05]'
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
