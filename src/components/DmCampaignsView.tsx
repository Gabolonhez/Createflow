'use client';

import React, { useState, useMemo } from 'react';
import {
  Send,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MoreVertical,
  ExternalLink,
  ShieldCheck,
  Zap,
  MousePointerClick,
  Sparkles,
  BarChart3,
  Flame,
  Trash2,
  Copy,
  Edit2,
  Power,
  History,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { InstagramLogo } from './BrandIcons';
import { CampaignBuilderModal } from './CampaignBuilderModal';
import type { DmCampaign } from '@/types';

interface DmCampaignsViewProps {
  campaigns: DmCampaign[];
  onSaveCampaign: (campaign: Partial<DmCampaign>) => Promise<void>;
  onDeleteCampaign: (id: string) => Promise<void>;
  onToggleCampaign: (id: string, isActive: boolean) => Promise<void>;
}

export function DmCampaignsView({
  campaigns,
  onSaveCampaign,
  onDeleteCampaign,
  onToggleCampaign,
}: DmCampaignsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DmCampaign | null>(null);

  // Backlog state
  const [backlogCampaign, setBacklogCampaign] = useState<DmCampaign | null>(null);
  const [isBacklogRunning, setIsBacklogRunning] = useState(false);
  const [backlogResult, setBacklogResult] = useState<{
    success: boolean;
    message?: string;
    totalFound?: number;
    processed?: number;
    skippedOld?: number;
    skippedDuplicate?: number;
    skippedSelf?: number;
    error?: string;
  } | null>(null);

  // KPIs
  const stats = useMemo(() => {
    const totalActive = campaigns.filter((c) => c.isActive).length;
    const totalDms = campaigns.reduce((acc, c) => acc + (c.dmsSentCount || 0), 0);
    const totalClicks = campaigns.reduce((acc, c) => acc + (c.clicksCount || 0), 0);
    const avgCtr = totalDms > 0 ? ((totalClicks / totalDms) * 100).toFixed(1) : '0.0';
    return { totalActive, totalDms, totalClicks, avgCtr };
  }, [campaigns]);

  // Filtered campaigns
  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (statusFilter === 'active' && !c.isActive) return false;
      if (statusFilter === 'inactive' && c.isActive) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(query);
        const matchesKeywords = c.keywords.some((kw) => kw.toLowerCase().includes(query));
        if (!matchesName && !matchesKeywords) return false;
      }
      return true;
    });
  }, [campaigns, statusFilter, search]);

  const handleOpenCreate = () => {
    setEditingCampaign(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (camp: DmCampaign) => {
    setEditingCampaign(camp);
    setIsModalOpen(true);
  };

  const handleCloneCampaign = (camp: DmCampaign) => {
    const cloned: DmCampaign = {
      ...camp,
      id: '',
      name: `${camp.name} (Cópia)`,
      postId: null,
      postUrl: null,
      postThumbnail: null,
      dmsSentCount: 0,
      clicksCount: 0,
      ctr: 0,
    };
    setEditingCampaign(cloned);
    setIsModalOpen(true);
  };

  const handleRunBacklog = async () => {
    if (!backlogCampaign) return;
    setIsBacklogRunning(true);
    setBacklogResult(null);
    try {
      const res = await fetch('/api/campaigns/process-backlog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ campaignId: backlogCampaign.id, batchLimit: 15 }),
      });
      const data = await res.json();
      setBacklogResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Falha ao processar comentários anteriores.';
      setBacklogResult({
        success: false,
        error: msg,
      });
    } finally {
      setIsBacklogRunning(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c] overflow-y-auto custom-scrollbar">
      {/* Top Header & Metrics Strip */}
      <div className="p-6 pb-4 border-b border-white/[0.07] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                Campanhas de Auto-DM
              </h1>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-pink-500/20 text-pink-300 border border-pink-500/30">
                Instagram Direct
              </span>
            </div>
            <p className="text-xs text-white/50 mt-1">
              Transforme comentários em vendas e leads instantâneos com funis oficiais da Meta no Instagram.
            </p>
          </div>

          <button
            type="button"
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-xs font-semibold text-white shadow-lg shadow-violet-600/25 transition-all active:scale-[0.98] shrink-0"
          >
            <Plus size={15} />
            Nova Campanha
          </button>
        </div>

        {/* 4 Stat Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.07] space-y-1">
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
              Campanhas Ativas
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {stats.totalActive}
              </span>
              <span className="text-[11px] text-white/40">/ {campaigns.length} total</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.07] space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
                DMs Enviadas
              </span>
              <span className="text-[10px] font-mono text-emerald-400">Meta Cap 750/h</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {stats.totalDms}
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">100% oficial</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.07] space-y-1">
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
              Cliques nos Links
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {stats.totalClicks}
              </span>
              <span className="text-[11px] text-indigo-400 font-mono">rastreados</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#111115] border border-white/[0.07] space-y-1">
            <span className="text-[11px] font-mono text-white/40 uppercase tracking-wider">
              CTR Médio
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-white font-mono">
                {stats.avgCtr}%
              </span>
              <span className="text-[11px] text-amber-400 font-mono">alta conversão</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.05] bg-[#0c0c10]/40">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou palavra-chave..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.08] text-xs text-white placeholder-white/30 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.07] text-xs text-white/70 focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Somente Ativas</option>
            <option value="inactive">Somente Pausadas</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid (3 Columns Desktop per DESIGN.md) */}
      <div className="p-6">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-white/[0.07] bg-[#101014] max-w-lg mx-auto space-y-3">
            <div className="size-12 rounded-full bg-violet-600/20 text-violet-300 flex items-center justify-center mx-auto">
              <Send size={20} />
            </div>
            <h3 className="text-sm font-semibold text-white">Nenhuma campanha encontrada</h3>
            <p className="text-xs text-white/50">
              Crie sua primeira regra de Auto-DM para Instagram e comece a enviar links no direct.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white"
            >
              <Plus size={14} />
              Criar Campanha
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((camp) => (
              <div
                key={camp.id}
                className="group relative rounded-2xl bg-[#111116] border border-white/[0.08] hover:border-white/[0.18] transition-all flex flex-col justify-between overflow-hidden shadow-sm"
              >
                {/* Card Header */}
                <div className="p-4 pb-3 border-b border-white/[0.05] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg flex items-center justify-center bg-pink-500/15 text-pink-300 border border-pink-500/25">
                      <InstagramLogo className="size-3.5" />
                    </div>
                    <span className="text-[11px] font-mono text-white/60">
                      @{camp.accountUsername || 'gabolonhez'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onToggleCampaign(camp.id, !camp.isActive)}
                      title={camp.isActive ? 'Pausar campanha' : 'Ativar campanha'}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                        camp.isActive
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          camp.isActive ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                        }`}
                      />
                      {camp.isActive ? 'Ativa' : 'Pausada'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCloneCampaign(camp)}
                      title="Clonar esta campanha"
                      className="p-1 rounded text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(camp)}
                      title="Editar campanha"
                      className="p-1 rounded text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCampaign(camp.id)}
                      title="Excluir campanha"
                      className="p-1 rounded text-white/40 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1">
                  <div>
                    <h3 className="text-sm font-semibold text-white tracking-tight line-clamp-1">
                      {camp.name}
                    </h3>
                    <p className="text-[11px] text-white/50 line-clamp-1 mt-0.5">
                      {camp.scope === 'any'
                        ? 'Gatilho em qualquer post ou reels'
                        : camp.scope === 'next'
                        ? 'Ativo no próximo reels/vídeo'
                        : camp.postUrl || 'Post específico vinculado'}
                    </p>
                  </div>

                  {/* Keywords pills */}
                  <div className="flex flex-wrap items-center gap-1">
                    {camp.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-[10px] font-mono text-indigo-300"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {camp.requireFollow && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/20">
                        <ShieldCheck size={11} />
                        Follow-Gate
                      </span>
                    )}
                    {camp.linkButtonLabel && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono border border-indigo-500/20">
                        <ExternalLink size={11} />
                        Card Link
                      </span>
                    )}
                    {camp.publicReplyEnabled && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.05] text-white/60 text-[10px] font-mono border border-white/[0.08]">
                        Reply Público ({camp.publicReplyMessages?.length || 1})
                      </span>
                    )}
                  </div>

                  {/* Safe Backlog Comment Processing Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setBacklogCampaign(camp);
                      setBacklogResult(null);
                    }}
                    className="mt-1 w-full py-1.5 px-2.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-[11px] font-medium transition-colors flex items-center justify-center gap-1.5"
                    title="Disparar com segurança para quem comentou antes com proteção anti-ban e janela de 7 dias"
                  >
                    <History size={12} className="text-indigo-400" />
                    <span>Responder Comentários Anteriores</span>
                  </button>
                </div>

                {/* Card Footer: Metrics Strip */}
                <div className="px-4 py-3 border-t border-white/[0.06] bg-[#09090d]/60 flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-white/60">
                      DMs:{' '}
                      <strong className="text-white font-bold">{camp.dmsSentCount}</strong>
                    </span>
                    <span className="text-white/60">
                      Clicks:{' '}
                      <strong className="text-indigo-400 font-bold">{camp.clicksCount}</strong>
                    </span>
                  </div>
                  <span className="text-emerald-400 font-bold">CTR {camp.ctr}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backlog Safe Processor Modal */}
      {backlogCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-[#101015] border border-white/[0.1] shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    Responder Comentários Anteriores
                  </h3>
                  <p className="text-[11px] text-white/50">
                    Campanha: {backlogCampaign.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBacklogCampaign(null)}
                className="p-1 rounded text-white/40 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Anti-Flood & Anti-Ban Guarantees */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2 text-xs text-amber-200/90">
              <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                <ShieldCheck size={14} />
                <span>Proteção Ativa Anti-Ban & Anti-Flood:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-amber-100/80 list-disc list-inside">
                <li>Janela de 7 Dias: descarta comentários mais antigos que a Meta bloqueia</li>
                <li>Deduplicação: quem já recebeu direct nunca recebe repetido</li>
                <li>Pausa Inteligente (Jitter): espera de 2.5s a 4.5s entre cada envio</li>
                <li>Lote Seguro: limitado a no máximo 15 envios por vez</li>
              </ul>
            </div>

            {backlogResult && (
              <div
                className={`p-3 rounded-xl border text-xs space-y-1 ${
                  backlogResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>
                    {backlogResult.success ? 'Lote Processado com Sucesso' : 'Aviso ao Processar'}
                  </span>
                </div>
                <p className="text-[11px] opacity-90">
                  {backlogResult.message || backlogResult.error}
                </p>
                {backlogResult.success && (
                  <div className="text-[10px] text-white/70 pt-1 flex flex-wrap gap-2">
                    <span>Enviados: <strong>{backlogResult.processed}</strong></span>
                    <span>Fora do prazo: <strong>{backlogResult.skippedOld}</strong></span>
                    <span>Já atendidos: <strong>{backlogResult.skippedDuplicate}</strong></span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setBacklogCampaign(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleRunBacklog}
                disabled={isBacklogRunning}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-1.5 shadow-sm"
              >
                {isBacklogRunning ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    <span>Disparando com Segurança...</span>
                  </>
                ) : (
                  <>
                    <Zap size={13} />
                    <span>Iniciar Envio Seguro</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign Builder Modal */}
      <CampaignBuilderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        campaignToEdit={editingCampaign}
        onSave={onSaveCampaign}
        existingCampaigns={campaigns}
      />
    </div>
  );
}
