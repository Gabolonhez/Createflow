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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#7ae6a0]/12 text-[#7ae6a0] border border-[#7ae6a0]/25">
            <CheckCircle2 size={11} className="text-[#7ae6a0]" />
            Enviado
          </span>
        );
      case 'SKIPPED_WINDOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#ffbd2e]/12 text-[#ffbd2e] border border-[#ffbd2e]/25">
            <Clock size={11} className="text-[#ffbd2e]" />
            Janela 24h
          </span>
        );
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#ff5f56]/12 text-[#ff8a84] border border-[#ff5f56]/25">
            <XCircle size={11} className="text-[#ff5f56]" />
            Falha
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#212121] text-[#ececec] border border-[#2c2c2c]">
            <Clock size={11} className="text-[#9a9a9a]" />
            Fila
          </span>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#0a0a0a] overflow-y-auto custom-scrollbar">
      {/* Top Compact Audit Telemetry Strip */}
      <div className="px-3.5 sm:px-6 py-2.5 sm:py-3 border-b border-[#1f1f1f] bg-[#111111] flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-[#1a1a1a] text-[#ececec] border border-[#262626]">
            Auditoria Meta &amp; TikTok
          </span>
          <span className="text-xs text-[#9a9a9a] font-mono hidden sm:inline">
            Eventos de webhooks e histórico de entregas
          </span>
        </div>

        {/* Inline Metrics Telemetry */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 font-mono text-[11px] sm:text-xs">
          <span className="px-2.5 py-1 rounded-full bg-[#161616] border border-[#262626] text-[#9a9a9a]">
            Total: <strong className="text-[#ececec]">{stats.total}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#7ae6a0]/10 border border-[#7ae6a0]/20 text-[#7ae6a0]">
            Enviados: <strong>{stats.sent}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#ffbd2e]/10 border border-[#ffbd2e]/20 text-[#ffbd2e]">
            Skips: <strong>{stats.skipped}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-[#ff5f56]/10 border border-[#ff5f56]/20 text-[#ff8a84]">
            Falhas: <strong>{stats.failed}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-3.5 sm:p-6 py-2.5 sm:py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f1f] bg-[#0e0e0e]">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <div className="relative w-full">
            <Search
              size={13}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6f6f6f]"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrar por @usuário, comentário ou campanha..."
              className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-[#161616] border border-[#262626] text-xs text-[#ececec] placeholder-[#6f6f6f] focus:outline-none focus:border-[#4e4e4e]"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Platform switch (Pluy Segmented Pill) */}
          <div className="inline-flex items-center p-1 rounded-full bg-[#141414] border border-[#242424]">
            <button
              type="button"
              onClick={() => setPlatformFilter('all')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all active:scale-[0.97] ${
                platformFilter === 'all' ? 'bg-[#282828] text-white' : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('instagram')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all active:scale-[0.97] ${
                platformFilter === 'instagram'
                  ? 'bg-[#282828] text-white'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <InstagramLogo className="size-3 text-pink-400" />
              IG
            </button>
            <button
              type="button"
              onClick={() => setPlatformFilter('tiktok')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all active:scale-[0.97] ${
                platformFilter === 'tiktok'
                  ? 'bg-[#282828] text-white'
                  : 'text-[#8a8a8a] hover:text-[#ececec]'
              }`}
            >
              <TikTokLogo className="size-3 text-cyan-400" />
              TT
            </button>
          </div>

          {/* Status switch */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3.5 py-1.5 rounded-full bg-[#161616] border border-[#262626] text-xs text-[#ececec] focus:outline-none focus:border-[#4e4e4e]"
          >
            <option value="ALL">Todos os Status</option>
            <option value="SENT">Enviados</option>
            <option value="SKIPPED_WINDOW">Janela 24h</option>
            <option value="FAILED">Falhas</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="p-3.5 sm:p-6">
        <div className="rounded-[20px] border border-[#222222] bg-[#161616] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#222222] bg-[#121212] text-[11px] font-mono text-[#6f6f6f]">
                  <th className="py-3 px-4">CANAL &amp; USUÁRIO</th>
                  <th className="py-3 px-4">COMENTÁRIO RECEBIDO</th>
                  <th className="py-3 px-4">CAMPANHA DISPARADA</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">HORÁRIO</th>
                  <th className="py-3 px-4 text-right">AÇÕES</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#222222] text-xs">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-[#6f6f6f] font-mono text-xs">
                      Nenhum registro de log encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-[#1a1a1a] transition-colors"
                    >
                      {/* User & Platform */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="size-6 rounded-md flex items-center justify-center shrink-0 bg-[#212121] border border-[#2c2c2c]">
                            {log.platform === 'instagram' ? (
                              <InstagramLogo className="size-3 text-pink-400" />
                            ) : (
                              <TikTokLogo className="size-3 text-cyan-400" />
                            )}
                          </div>
                          <span className="font-medium text-[#ececec]">
                            @{log.commenterUsername}
                          </span>
                        </div>
                      </td>

                      {/* Comment */}
                      <td className="py-3 px-4 max-w-xs">
                        <span className="text-xs text-[#9a9a9a] line-clamp-2">
                          &ldquo;{log.commentText}&rdquo;
                        </span>
                      </td>

                      {/* Campaign */}
                      <td className="py-3 px-4">
                        <span className="text-[#ececec] font-medium">
                          {log.campaignName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          {getStatusBadge(log.status)}
                          {log.errorMessage && (
                            <p className="text-[11px] text-[#8a8a8a] max-w-[200px] truncate" title={log.errorMessage}>
                              {log.errorMessage}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3 px-4 text-[#8a8a8a] font-mono text-xs">
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
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#212121] hover:bg-[#2a2a2a] border border-[#2c2c2c] text-[11px] text-[#ececec] transition-all active:scale-[0.97]"
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
