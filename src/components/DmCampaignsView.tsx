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
  onNavigateToAnalytics?: () => void;
}

export function DmCampaignsView({
  campaigns,
  onSaveCampaign,
  onDeleteCampaign,
  onToggleCampaign,
  onNavigateToAnalytics,
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
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
      {/* Top Action & Metrics Strip */}
      <div className="p-3.5 sm:p-6 pb-3 sm:pb-4 border-b border-[#1f1f1f] space-y-3 sm:space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#1a1a1a] text-[#ececec] border border-[#262626] inline-flex items-center gap-1.5">
              <InstagramLogo className="size-3 text-pink-400" />
              Instagram Direct
            </span>
            <span className="text-xs text-[#9a9a9a] font-mono">
              Respostas automáticas por palavra-chave oficial da Meta
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
            {onNavigateToAnalytics && (
              <button
                type="button"
                onClick={onNavigateToAnalytics}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-xs font-medium text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97] font-mono"
              >
                <InstagramLogo className="size-3.5 text-pink-400" />
                <span>Analytics Instagram</span>
                <span className="size-1.5 rounded-full bg-[#7ae6a0]" />
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenCreate}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full bg-[#f2f2f2] hover:bg-white text-xs font-medium text-[#0a0a0a] transition-all active:scale-[0.97] shadow-sm shrink-0"
            >
              <Plus size={14} />
              <span>Nova Campanha</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Cards Grid */}
        {campaigns.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 pt-1">
            <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#161616] border border-[#222222] space-y-1">
              <span className="text-[10px] sm:text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                Campanhas Ativas
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-medium tracking-[-0.03em] text-[#ececec] font-mono">
                  {stats.totalActive}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#6f6f6f] font-mono">/ {campaigns.length} total</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#161616] border border-[#222222] space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] sm:text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                  DMs Enviadas
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-[#6f6f6f]">Cap 750/h</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-medium tracking-[-0.03em] text-[#ececec] font-mono">
                  {stats.totalDms}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#7ae6a0] font-mono truncate">
                  {stats.totalDms > 0 ? 'Entregas registradas' : 'Sem envios'}
                </span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#161616] border border-[#222222] space-y-1">
              <span className="text-[10px] sm:text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                Cliques nos Links
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-medium tracking-[-0.03em] text-[#ececec] font-mono">
                  {stats.totalClicks}
                </span>
                <span className="text-[10px] sm:text-[11px] text-[#9a9a9a] font-mono">rastreados</span>
              </div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-[20px] bg-[#161616] border border-[#222222] space-y-1">
              <span className="text-[10px] sm:text-[11px] font-mono text-[#6f6f6f] uppercase tracking-wider">
                CTR Médio
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-medium tracking-[-0.03em] text-[#ececec] font-mono">
                  {stats.avgCtr}%
                </span>
                {Number(stats.avgCtr) >= 15 && (
                  <span className="text-[10px] sm:text-[11px] text-[#7ae6a0] font-mono">alta conv.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3.5 sm:p-6 py-3 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 border-b border-[#1f1f1f] bg-[#0e0e0e]">
        <div className="flex items-center gap-2 flex-1 max-w-md w-full">
          <div className="relative w-full">
            <Search
              size={14}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome ou palavra-chave..."
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-[#161616] border border-[#262626] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e] transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full sm:w-auto px-3.5 py-1.5 rounded-full bg-[#161616] border border-[#262626] text-xs text-[#ececec] focus:outline-none focus:border-[#4e4e4e]"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Somente Ativas</option>
            <option value="inactive">Somente Pausadas</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="p-3.5 sm:p-6">
        {filtered.length === 0 ? (
          <div className="p-12 text-center rounded-[24px] border border-[#222222] bg-[#141414] max-w-lg mx-auto space-y-3">
            <div className="size-12 rounded-full bg-[#212121] border border-[#2c2c2c] text-[#ececec] flex items-center justify-center mx-auto">
              <Send size={18} />
            </div>
            <h3 className="text-sm font-medium text-[#ececec] tracking-[-0.02em]">Nenhuma campanha encontrada</h3>
            <p className="text-xs text-[#9a9a9a]">
              Crie sua primeira regra de Auto-DM para Instagram e comece a enviar links no direct.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f2f2f2] hover:bg-white text-xs font-medium text-[#0a0a0a] transition-all active:scale-[0.97]"
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
                className="group relative rounded-[22px] bg-[#161616] border border-[#222222] hover:border-[#333333] transition-all flex flex-col justify-between overflow-hidden"
              >
                {/* Card Header */}
                <div className="p-4 pb-3 border-b border-[#222222] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="size-7 rounded-lg flex items-center justify-center bg-[#212121] text-pink-400 border border-[#2c2c2c]">
                      <InstagramLogo className="size-3.5" />
                    </div>
                    <span className="text-[11px] font-mono text-[#9a9a9a]">
                      @{camp.accountUsername || 'gabolonhez'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onToggleCampaign(camp.id, !camp.isActive)}
                      title={camp.isActive ? 'Pausar campanha' : 'Ativar campanha'}
                      className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-colors ${
                        camp.isActive
                          ? 'bg-[#7ae6a0]/12 text-[#7ae6a0] border border-[#7ae6a0]/25'
                          : 'bg-[#212121] text-[#8a8a8a] border border-[#2c2c2c]'
                      }`}
                    >
                      <span
                        className={`size-1.5 rounded-full ${
                          camp.isActive ? 'bg-[#7ae6a0]' : 'bg-[#6f6f6f]'
                        }`}
                      />
                      {camp.isActive ? 'Ativa' : 'Pausada'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCloneCampaign(camp)}
                      title="Clonar esta campanha"
                      className="p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
                    >
                      <Copy size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEdit(camp)}
                      title="Editar campanha"
                      className="p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121] transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeleteCampaign(camp.id)}
                      title="Excluir campanha"
                      className="p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ff5f56] hover:bg-[#ff5f56]/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4 space-y-3 flex-1">
                  <div>
                    <h3 className="text-sm font-medium text-[#ececec] tracking-[-0.02em] line-clamp-1">
                      {camp.name}
                    </h3>
                    <p className="text-[11px] text-[#8a8a8a] line-clamp-1 mt-0.5">
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
                        className="px-2 py-0.5 rounded-[6px] bg-[#222222] border border-[#2c2c2c] text-[10px] font-mono text-[#ececec]"
                      >
                        #{kw}
                      </span>
                    ))}
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    {camp.requireFollow && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#7ae6a0]/10 text-[#7ae6a0] text-[10px] font-mono border border-[#7ae6a0]/20">
                        <ShieldCheck size={11} />
                        Follow-Gate
                      </span>
                    )}
                    {camp.linkButtonLabel && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#212121] text-[#ececec] text-[10px] font-mono border border-[#2c2c2c]">
                        <ExternalLink size={11} className="text-[#9a9a9a]" />
                        Card Link
                      </span>
                    )}
                    {camp.publicReplyEnabled && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-[#212121] text-[#9a9a9a] text-[10px] font-mono border border-[#2c2c2c]">
                        Reply Público ({camp.publicReplyMessages?.length || 1})
                      </span>
                    )}
                  </div>

                  {/* Safe Backlog Comment Processing Button (Pluy Quiet Pill) */}
                  <button
                    type="button"
                    onClick={() => {
                      setBacklogCampaign(camp);
                      setBacklogResult(null);
                    }}
                    className="mt-1 w-full py-2 px-3 rounded-full bg-[#212121] hover:bg-[#2b2b2b] border border-[#2c2c2c] text-[#ececec] text-[11px] font-medium transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
                    title="Disparar com segurança para quem comentou antes com proteção anti-ban e janela de 7 dias"
                  >
                    <History size={12} className="text-[#9a9a9a]" />
                    <span>Responder Comentários Anteriores</span>
                  </button>
                </div>

                {/* Card Footer: Metrics Strip */}
                <div className="px-4 py-3 border-t border-[#222222] bg-[#121212] flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-[#8a8a8a]">
                      DMs:{' '}
                      <strong className="text-[#ececec] font-medium">{camp.dmsSentCount}</strong>
                    </span>
                    <span className="text-[#8a8a8a]">
                      Clicks:{' '}
                      <strong className="text-[#ececec] font-medium">{camp.clicksCount}</strong>
                    </span>
                  </div>
                  <span className="text-[#7ae6a0] font-medium">CTR {camp.ctr}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backlog Safe Processor Modal */}
      {backlogCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md rounded-[24px] bg-[#141414] border border-[#262626] shadow-2xl p-5 sm:p-6 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="size-8 rounded-lg bg-[#212121] border border-[#2c2c2c] text-[#ececec] flex items-center justify-center">
                  <History size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-[#ececec] tracking-[-0.02em]">
                    Responder Comentários Anteriores
                  </h3>
                  <p className="text-[11px] text-[#8a8a8a]">
                    Campanha: {backlogCampaign.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBacklogCampaign(null)}
                className="p-1.5 rounded-full text-[#6f6f6f] hover:text-[#ececec] hover:bg-[#212121]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Anti-Flood & Anti-Ban Guarantees */}
            <div className="p-3.5 rounded-2xl bg-[#ffbd2e]/10 border border-[#ffbd2e]/20 space-y-2 text-xs text-[#ffd27d]">
              <div className="flex items-center gap-1.5 font-medium text-[#ffbd2e]">
                <ShieldCheck size={14} />
                <span>Proteção Ativa Anti-Ban &amp; Anti-Flood:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-[#ffd27d]/80 list-disc list-inside">
                <li>Janela de 7 Dias: descarta comentários mais antigos que a Meta bloqueia</li>
                <li>Deduplicação: quem já recebeu direct nunca recebe repetido</li>
                <li>Pausa Inteligente (Jitter): espera de 2.5s a 4.5s entre cada envio</li>
                <li>Lote Seguro: limitado a no máximo 15 envios por vez</li>
              </ul>
            </div>

            {backlogResult && (
              <div
                className={`p-3 rounded-2xl border text-xs space-y-1 ${
                  backlogResult.success
                    ? 'bg-[#7ae6a0]/10 border-[#7ae6a0]/25 text-[#7ae6a0]'
                    : 'bg-[#ff5f56]/10 border-[#ff5f56]/25 text-[#ff8a84]'
                }`}
              >
                <div className="font-medium flex items-center gap-1.5">
                  <CheckCircle2 size={13} />
                  <span>
                    {backlogResult.success ? 'Lote Processado com Sucesso' : 'Aviso ao Processar'}
                  </span>
                </div>
                <p className="text-[11px] opacity-90">
                  {backlogResult.message || backlogResult.error}
                </p>
                {backlogResult.success && (
                  <div className="text-[10px] text-[#ececec]/80 pt-1 flex flex-wrap gap-2">
                    <span>Enviados: <strong>{backlogResult.processed}</strong></span>
                    <span>Fora do prazo: <strong>{backlogResult.skippedOld}</strong></span>
                    <span>Já atendidos: <strong>{backlogResult.skippedDuplicate}</strong></span>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#222222]">
              <button
                type="button"
                onClick={() => setBacklogCampaign(null)}
                className="px-4 py-1.5 rounded-full bg-[#212121] hover:bg-[#2a2a2a] text-xs font-medium text-[#ececec] border border-[#2c2c2c] transition-all active:scale-[0.97]"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleRunBacklog}
                disabled={isBacklogRunning}
                className="px-4 py-1.5 rounded-full bg-[#f2f2f2] hover:bg-white disabled:opacity-50 text-xs font-medium text-[#0a0a0a] flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.97]"
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
