'use client';

import React, { useState, useMemo } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  RotateCw,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { InstagramLogo, TikTokLogo } from './BrandIcons';
import type { DmLog, DmLogStatus, DmAutomationPlatform } from '@/types';

interface DmLogsViewProps {
  logs: DmLog[];
  onRetryLog: (logId: string) => Promise<void>;
}

export function DmLogsView({ logs, onRetryLog }: DmLogsViewProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | DmLogStatus>('ALL');
  const [platformFilter, setPlatformFilter] = useState<'all' | DmAutomationPlatform>('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const total = logs.length;
    const sent = logs.filter((l) => l.status === 'SENT').length;
    const skipped = logs.filter((l) => l.status === 'SKIPPED_WINDOW').length;
    const failed = logs.filter((l) => l.status === 'FAILED').length;
    return { total, sent, skipped, failed };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
      if (platformFilter !== 'all' && l.platform !== platformFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchUser = l.commenterUsername.toLowerCase().includes(q);
        const matchText = l.commentText.toLowerCase().includes(q);
        const matchCamp = l.campaignName.toLowerCase().includes(q);
        if (!matchUser && !matchText && !matchCamp) return false;
      }
      return true;
    });
  }, [logs, statusFilter, platformFilter, search]);

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await onRetryLog(id);
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: DmLogStatus) => {
    switch (status) {
      case 'SENT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle2 size={11} className="text-emerald-400" />
            Enviado
          </span>
        );
      case 'SKIPPED_WINDOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <Clock size={11} className="text-amber-400" />
            Janela 24h
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <XCircle size={11} className="text-rose-400" />
            Falha
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
            <Clock size={11} className="text-indigo-400" />
            Fila
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0c] overflow-y-auto custom-scrollbar">
      {/* Top Compact Audit Telemetry Strip */}
      <div className="px-6 py-3 border-b border-zinc-800/80 bg-[#0c0c10]/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700/80">
            Auditoria Meta &amp; TikTok
          </span>
          <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
            Eventos de webhooks e histórico de entregas
          </span>
        </div>

        {/* Inline Metrics Telemetry */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
            Total: <strong className="text-white">{stats.total}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            Enviados: <strong>{stats.sent}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
            Skips: <strong>{stats.skipped}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-400">
            Falhas: <strong>{stats.failed}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800/60 bg-[#0c0c10]/40">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search
              size={13}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por @usuário, comentário ou campanha..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Platform switch */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`px-2 py-1 rounded text-[11px] font-medium transition-all ${
                platformFilter === 'all' ? 'bg-zinc-800 text-white font-semibold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('instagram')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                platformFilter === 'instagram'
                  ? 'bg-pink-600/25 text-pink-300 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <InstagramLogo className="size-3" />
              IG
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('tiktok')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-medium transition-all ${
                platformFilter === 'tiktok'
                  ? 'bg-cyan-600/25 text-cyan-300 font-semibold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TikTokLogo className="size-3" />
              TT
            </button>
          </div>

          {/* Status switch */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none"
          >
            <option value="ALL">Todos os Status</option>
            <option value="SENT">Enviados</option>
            <option value="SKIPPED_WINDOW">Janela 24h</option>
            <option value="FAILED">Falhas</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-6">
        <div className="rounded-xl border border-zinc-800/80 bg-[#111116] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/80 text-[11px] font-mono text-zinc-400">
                  <th className="py-3 px-4">CANAL &amp; USUÁRIO</th>
                  <th className="py-3 px-4">COMENTÁRIO RECEBIDO</th>
                  <th className="py-3 px-4">CAMPANHA DISPARADA</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">HORÁRIO</th>
                  <th className="py-3 px-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-zinc-500 font-mono text-xs">
                      Nenhum registro de log encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-white/[0.02] transition-colors"
                    >
                      {/* User & Platform */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`size-6 rounded-md flex items-center justify-center shrink-0 ${
                              log.platform === 'instagram'
                                ? 'bg-pink-500/15 text-pink-300'
                                : 'bg-cyan-500/15 text-cyan-300'
                            }`}
                          >
                            {log.platform === 'instagram' ? (
                              <InstagramLogo className="size-3" />
                            ) : (
                              <TikTokLogo className="size-3" />
                            )}
                          </div>
                          <span className="font-semibold text-white">
                            @{log.commenterUsername}
                          </span>
                        </div>
                      </td>

                      {/* Comment - Clean direct text without nested box */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-xs text-zinc-300 line-clamp-2">
                          &ldquo;{log.commentText}&rdquo;
                        </span>
                      </td>

                      {/* Campaign */}
                      <td className="py-3 px-4">
                        <span className="text-zinc-200 font-medium">
                          {log.campaignName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {getStatusBadge(log.status)}
                          {log.errorMessage && (
                            <p className="text-[11px] text-zinc-400 max-w-[200px] truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-zinc-400 font-mono text-xs">
                        {new Date(log.createdAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {log.status !== 'SENT' && (
                          <button
                            type="button"
                            onClick={() => handleRetry(log.id)}
                            disabled={retryingId === log.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white/[0.06] hover:bg-white/[0.1] text-[11px] text-white transition-colors"
                          >
                            <RotateCw
                              size={11}
                              className={retryingId === log.id ? 'animate-spin' : ''}
                            />
                            Reenviar
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
