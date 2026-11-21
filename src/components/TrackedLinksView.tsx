'use client';

import React, { useState, useMemo } from 'react';
import {
  Link as LinkIcon,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  MousePointerClick,
  TrendingUp,
  BarChart2,
  Sparkles,
  Globe,
} from 'lucide-react';
import { InstagramLogo, TikTokLogo } from './BrandIcons';
import type { TrackedLinkItem, DmAutomationPlatform } from '@/types';

interface TrackedLinksViewProps {
  links: TrackedLinkItem[];
  onSaveLink: (link: Partial<TrackedLinkItem>) => Promise<void>;
}

export function TrackedLinksView({ links, onSaveLink }: TrackedLinksViewProps) {
  const [search, setSearch] = useState('');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Link form state
  const [newLabel, setNewLabel] = useState('');
  const [newCampName, setNewCampName] = useState('');
  const [newDestination, setNewDestination] = useState('');
  const [newPlatform, setNewPlatform] = useState<DmAutomationPlatform>('instagram');
  const [isSaving, setIsSaving] = useState(false);

  // KPIs
  const stats = useMemo(() => {
    const totalLinks = links.length;
    const totalClicks = links.reduce((acc, l) => acc + (l.clicks || 0), 0);
    const totalUnique = links.reduce((acc, l) => acc + (l.uniqueClicks || 0), 0);
    const avgCtr =
      totalClicks > 0
        ? (
            links.reduce((acc, l) => acc + (l.ctr || 0), 0) / (totalLinks || 1)
          ).toFixed(1)
        : '0.0';
    return { totalLinks, totalClicks, totalUnique, avgCtr };
  }, [links]);

  const filtered = useMemo(() => {
    return links.filter((l) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchLabel = l.label.toLowerCase().includes(q);
        const matchCamp = l.campaignName.toLowerCase().includes(q);
        const matchUrl = l.destinationUrl.toLowerCase().includes(q);
        if (!matchLabel && !matchCamp && !matchUrl) return false;
      }
      return true;
    });
  }, [links, search]);

  const handleCopy = (shortUrl: string, slug: string) => {
    navigator.clipboard.writeText(shortUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newDestination.trim()) return;
    setIsSaving(true);
    try {
      const slug = `cf-${Date.now().toString(36)}`;
      await onSaveLink({
        label: newLabel,
        campaignName: newCampName || 'Geral',
        platform: newPlatform,
        destinationUrl: newDestination,
        shortSlug: slug,
        shortUrl: `https://createflow.io/r/${slug}`,
        clicks: 0,
        uniqueClicks: 0,
        ctr: 0,
      });
      setIsModalOpen(false);
      setNewLabel('');
      setNewCampName('');
      setNewDestination('');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
      {/* Header & Metrics Strip */}
      <div className="p-3.5 sm:p-6 pb-3 sm:pb-4 border-b border-[#1f1f1f] space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#1a1a1a] text-[#ececec] border border-[#262626]">
              Encurtador &amp; CTR
            </span>
            <span className="text-xs text-[#9a9a9a] font-mono">
              Monitoramento oficial de cliques para Direct no Instagram e TikTok
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f2f2f2] hover:bg-white text-xs font-medium text-[#0a0a0a] transition-all active:scale-[0.97] shadow-sm shrink-0"
          >
            <Plus size={14} />
            Novo Link Rastreado
          </button>
        </div>

        {/* 4 Stat Cards (Only when links exist) */}
        {links.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#161616] border border-[#222222] space-y-1">
              <span className="text-[10px] sm:text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                Links Ativos
              </span>
              <div className="text-lg sm:text-2xl font-medium tracking-[-0.03em] text-[#ececec] font-mono">{stats.totalLinks}</div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#161616] border border-[#222222] space-y-1">
              <span className="text-[10px] sm:text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                Cliques Totais
              </span>
              <div className="text-lg sm:text-2xl font-medium tracking-[-0.03em] text-[#ececec] font-mono">
                {stats.totalClicks}
              </div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#161616] border border-[#222222] space-y-1">
              <span className="text-[10px] sm:text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                Visitantes Únicos
              </span>
              <div className="text-lg sm:text-2xl font-medium tracking-[-0.03em] text-[#7ae6a0] font-mono">
                {stats.totalUnique}
              </div>
            </div>
            <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#161616] border border-[#222222] space-y-1">
              <span className="text-[10px] sm:text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                Taxa de Conversão Média
              </span>
              <div className="text-lg sm:text-2xl font-medium tracking-[-0.03em] text-[#ececec] font-mono">
                {stats.avgCtr}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-3.5 sm:p-6 py-2.5 sm:py-3.5 flex items-center justify-between border-b border-[#1f1f1f] bg-[#0e0e0e]">
        <div className="relative w-full max-w-sm">
          <Search
            size={13}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por rótulo, campanha ou URL..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-[#161616] border border-[#262626] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
          />
        </div>
      </div>

      {/* Tracked Links Table */}
      <div className="p-3.5 sm:p-6">
        <div className="rounded-[20px] border border-[#222222] bg-[#161616] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222222] bg-[#121212] text-[11px] font-mono text-[#6f6f6f]">
                  <th className="py-3 px-4">CANAL & RÓTULO</th>
                  <th className="py-3 px-4">URL ORIGINAL</th>
                  <th className="py-3 px-4">LINK CURTO RASTREADO</th>
                  <th className="py-3 px-4">CLIQUES TOTAIS</th>
                  <th className="py-3 px-4">ÚNICOS</th>
                  <th className="py-3 px-4">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto">
                        <div className="size-10 rounded-xl bg-[#212121] border border-[#2c2c2c] flex items-center justify-center text-[#9a9a9a]">
                          <LinkIcon size={18} />
                        </div>
                        <span className="text-xs font-medium text-[#ececec]">Nenhum link rastreado cadastrado</span>
                        <p className="text-[11px] text-[#8a8a8a]">
                          Crie links curtos para incluir em suas mensagens automáticas de DM e monitorar cliques em tempo real.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f2f2f2] hover:bg-white text-xs font-medium text-[#0a0a0a] transition-all active:scale-[0.97]"
                        >
                          <Plus size={13} />
                          Criar Primeiro Link
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-[#1a1a1a] transition-colors">
                      {/* Label & Platform */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-md flex items-center justify-center shrink-0 bg-[#212121] border border-[#2c2c2c]">
                            {item.platform === 'instagram' ? (
                              <InstagramLogo className="size-3 text-pink-400" />
                            ) : (
                              <TikTokLogo className="size-3 text-cyan-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-[#ececec]">{item.label}</div>
                            <div className="text-[10px] text-[#6f6f6f]">{item.campaignName}</div>
                          </div>
                        </div>
                      </td>

                      {/* Original URL */}
                      <td className="py-3 px-4 max-w-xs">
                        <a
                          href={item.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-[#9a9a9a] hover:text-[#ececec] truncate max-w-[220px]"
                        >
                          <span className="truncate">{item.destinationUrl}</span>
                          <ExternalLink size={10} className="shrink-0 text-[#6f6f6f]" />
                        </a>
                      </td>

                      {/* Short Tracked Link + Copy */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1c1c1c] border border-[#2a2a2a] font-mono text-[11px] text-[#ececec]">
                          <span>{item.shortUrl}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.shortUrl, item.shortSlug)}
                            title="Copiar link rastreado"
                            className="p-0.5 rounded text-[#6f6f6f] hover:text-[#ececec] transition-colors"
                          >
                            {copiedSlug === item.shortSlug ? (
                              <Check size={12} className="text-[#7ae6a0]" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Total Clicks */}
                      <td className="py-3 px-4 font-mono font-medium text-[#ececec]">
                        {item.clicks}
                      </td>

                      {/* Unique */}
                      <td className="py-3 px-4 font-mono text-[#7ae6a0]">
                        {item.uniqueClicks}
                      </td>

                      {/* CTR Bar */}
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-[#242424] overflow-hidden">
                            <div
                              className="h-full bg-[#ececec] rounded-full"
                              style={{ width: `${Math.min(item.ctr, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-medium text-[#ececec]">
                            {item.ctr}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Link Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-[24px] bg-[#141414] border border-[#262626] p-5 sm:p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-medium text-[#ececec] tracking-[-0.02em]">Criar Novo Link Rastreado</h3>
            <form onSubmit={handleCreateLink} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[#9a9a9a] mb-1.5">
                  Canal
                </label>
                <div className="grid grid-cols-2 p-1 rounded-full bg-[#101010] border border-[#242424]">
                  <button
                    type="button"
                    onClick={() => setNewPlatform('instagram')}
                    className={`py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] ${
                      newPlatform === 'instagram'
                        ? 'bg-[#262626] text-white'
                        : 'text-[#8a8a8a] hover:text-[#ececec]'
                    }`}
                  >
                    <InstagramLogo className="size-3.5 text-pink-400" />
                    Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlatform('tiktok')}
                    className={`py-1.5 rounded-full text-xs font-medium flex items-center justify-center gap-1.5 transition-all active:scale-[0.97] ${
                      newPlatform === 'tiktok'
                        ? 'bg-[#262626] text-white'
                        : 'text-[#8a8a8a] hover:text-[#ececec]'
                    }`}
                  >
                    <TikTokLogo className="size-3.5 text-cyan-400" />
                    TikTok
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9a9a9a] mb-1">
                  Rótulo do Link
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Ebook Agentes IA"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9a9a9a] mb-1">
                  Campanha Associada
                </label>
                <input
                  type="text"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  placeholder="Ex: Campanha Guia 2026"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9a9a9a] mb-1">
                  URL de Destino
                </label>
                <input
                  type="url"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="https://createflow.ai/..."
                  className="w-full px-3.5 py-2 rounded-xl bg-[#1c1c1c] border border-[#2a2a2a] text-xs text-[#ececec] placeholder-[#6f6f6f] font-mono focus:outline-none focus:border-[#4e4e4e]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-xs font-medium text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-full bg-[#f2f2f2] hover:bg-white text-xs font-medium text-[#0a0a0a] transition-all active:scale-[0.97]"
                >
                  {isSaving ? 'Salvando...' : 'Gerar Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
