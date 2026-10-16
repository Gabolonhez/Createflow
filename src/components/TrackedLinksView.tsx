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
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c] overflow-y-auto custom-scrollbar">
      {/* Header & Metrics Strip */}
      <div className="p-6 pb-4 border-b border-zinc-800/80 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/25">
              Encurtador &amp; CTR
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              Monitoramento oficial de cliques para Direct no Instagram e TikTok
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-zinc-200 text-xs font-semibold text-zinc-950 transition-all active:scale-[0.98] shadow-sm shrink-0"
          >
            <Plus size={14} />
            Novo Link Rastreado
          </button>
        </div>

        {/* 4 Stat Cards (Only when links exist) */}
        {links.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-[#111115] border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Links Ativos
              </span>
              <div className="text-xl font-bold text-white font-mono">{stats.totalLinks}</div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Cliques Totais
              </span>
              <div className="text-xl font-bold text-indigo-400 font-mono">
                {stats.totalClicks}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Visitantes Únicos
              </span>
              <div className="text-xl font-bold text-emerald-400 font-mono">
                {stats.totalUnique}
              </div>
            </div>
            <div className="p-3.5 rounded-xl bg-[#111115] border border-zinc-800/80 space-y-1">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Taxa de Conversão Média
              </span>
              <div className="text-xl font-bold text-amber-400 font-mono">
                {stats.avgCtr}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <div className="p-6 py-3.5 flex items-center justify-between border-b border-white/[0.05] bg-[#0c0c10]/40">
        <div className="relative w-full max-w-sm">
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por rótulo, campanha ou URL..."
            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Tracked Links Table */}
      <div className="p-6">
        <div className="rounded-xl border border-white/[0.08] bg-[#111116] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] bg-[#0c0c10] text-[11px] font-mono text-white/50">
                  <th className="py-3 px-4">CANAL & RÓTULO</th>
                  <th className="py-3 px-4">URL ORIGINAL</th>
                  <th className="py-3 px-4">LINK CURTO RASTREADO</th>
                  <th className="py-3 px-4">CLIQUES TOTAIS</th>
                  <th className="py-3 px-4">ÚNICOS</th>
                  <th className="py-3 px-4">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05] text-xs">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                        <div className="size-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                          <LinkIcon size={18} />
                        </div>
                        <span className="text-xs font-semibold text-white">Nenhum link rastreado cadastrado</span>
                        <p className="text-[11px] text-zinc-400">
                          Crie links curtos para incluir em suas mensagens automáticas de DM e monitorar cliques em tempo real.
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsModalOpen(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-xs font-medium text-zinc-200 border border-zinc-700/80 transition-all"
                        >
                          <Plus size={13} />
                          Criar Primeiro Link
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Label & Platform */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-6 rounded-md flex items-center justify-center shrink-0 ${
                              item.platform === 'instagram'
                                ? 'bg-pink-500/15 text-pink-300'
                                : 'bg-cyan-500/15 text-cyan-300'
                            }`}
                          >
                            {item.platform === 'instagram' ? (
                              <InstagramLogo className="size-3" />
                            ) : (
                              <TikTokLogo className="size-3" />
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{item.label}</div>
                            <div className="text-[10px] text-white/40">{item.campaignName}</div>
                          </div>
                        </div>
                      </td>

                      {/* Original URL */}
                      <td className="py-3 px-4 max-w-xs">
                        <a
                          href={item.destinationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-white/60 hover:text-white truncate max-w-[220px]"
                        >
                          <span className="truncate">{item.destinationUrl}</span>
                          <ExternalLink size={10} className="shrink-0 text-white/40" />
                        </a>
                      </td>

                      {/* Short Tracked Link + Copy */}
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-black/40 border border-white/[0.08] font-mono text-[11px] text-indigo-300">
                          <span>{item.shortUrl}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(item.shortUrl, item.shortSlug)}
                            title="Copiar link rastreado"
                            className="p-0.5 rounded text-white/40 hover:text-white transition-colors"
                          >
                            {copiedSlug === item.shortSlug ? (
                              <Check size={12} className="text-emerald-400" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Total Clicks */}
                      <td className="py-3 px-4 font-mono font-bold text-white">
                        {item.clicks}
                      </td>

                      {/* Unique */}
                      <td className="py-3 px-4 font-mono text-emerald-400">
                        {item.uniqueClicks}
                      </td>

                      {/* CTR Bar */}
                      <td className="py-3 px-4 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full"
                              style={{ width: `${Math.min(item.ctr, 100)}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-white">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#0e0e12] border border-white/[0.1] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Criar Novo Link Rastreado</h3>
            <form onSubmit={handleCreateLink} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Canal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewPlatform('instagram')}
                    className={`py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      newPlatform === 'instagram'
                        ? 'bg-pink-600/20 border-pink-500/40 text-pink-300'
                        : 'border-white/[0.08] text-white/50'
                    }`}
                  >
                    <InstagramLogo className="size-3.5" />
                    Instagram
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewPlatform('tiktok')}
                    className={`py-1.5 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                      newPlatform === 'tiktok'
                        ? 'bg-cyan-600/20 border-cyan-500/40 text-cyan-300'
                        : 'border-white/[0.08] text-white/50'
                    }`}
                  >
                    <TikTokLogo className="size-3.5" />
                    TikTok
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Rótulo do Link
                </label>
                <input
                  type="text"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  placeholder="Ex: Ebook Agentes IA"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  Campanha Associada
                </label>
                <input
                  type="text"
                  value={newCampName}
                  onChange={(e) => setNewCampName(e.target.value)}
                  placeholder="Ex: Campanha Guia 2026"
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1">
                  URL de Destino
                </label>
                <input
                  type="url"
                  value={newDestination}
                  onChange={(e) => setNewDestination(e.target.value)}
                  placeholder="https://createflow.ai/..."
                  className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.1] text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-white/[0.06]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg text-xs text-white/60 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition-colors"
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
