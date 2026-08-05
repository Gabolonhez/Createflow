import React from 'react';
import { supabase } from '@/lib/supabase';
import Dashboard from './Dashboard';
import { fetchInstagramMediaAction } from './actions';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const connected = resolvedParams.connected === 'true';
  const error = resolvedParams.error as string | undefined;

  // Executar todas as consultas independentes do banco de dados em PARALELO para carregamento ultrarrápido (< 50ms)
  const [
    configRes,
    automationsRes,
    creatorProfileRes,
    ideasRes,
    draftsRes,
    chatSessionsRes,
    templatesRes,
  ] = await Promise.all([
    supabase.from('config').select('*').eq('id', 'instagram_config').maybeSingle(),
    supabase.from('automations').select('*').order('created_at', { ascending: false }),
    supabase.from('creator_profiles').select('*').eq('id', 'creator_config').maybeSingle(),
    supabase.from('ideas').select('*').order('created_at', { ascending: false }),
    supabase.from('content_drafts').select('*').order('updated_at', { ascending: false }),
    supabase.from('chat_sessions').select('*').order('updated_at', { ascending: false }),
    supabase.from('analyzed_templates').select('*').order('created_at', { ascending: false }),
  ]);

  const config = configRes.data || null;
  const automations = (automationsRes.data as any[]) || [];
  const creatorProfile = creatorProfileRes.data || null;
  const ideas = (ideasRes.data as any[]) || [];
  const drafts = (draftsRes.data as any[]) || [];
  const chatSessions = (chatSessionsRes.data as any[]) || [];
  const templates = (templatesRes.data as any[]) || [];

  // Buscar estatísticas e mídias do Instagram em paralelo se o Instagram estiver conectado
  let mediaList: any[] = [];
  let stats = {
    totalContacts: 0,
    pendingQueue: 0,
    sentMessages: 0,
    failedMessages: 0,
  };

  if (config) {
    const [
      contactsCountRes,
      pendingCountRes,
      sentCountRes,
      failedCountRes,
      mediaListRes
    ] = await Promise.all([
      supabase.from('contacts').select('id', { count: 'exact', head: true }),
      supabase.from('queue').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('queue').select('id', { count: 'exact', head: true }).eq('status', 'sent'),
      supabase.from('queue').select('id', { count: 'exact', head: true }).eq('status', 'failed'),
      fetchInstagramMediaAction().catch(() => []),
    ]);

    stats = {
      totalContacts: contactsCountRes.count || 0,
      pendingQueue: pendingCountRes.count || 0,
      sentMessages: sentCountCount(sentCountRes.count),
      failedMessages: failedCountRes.count || 0,
    };

    mediaList = mediaListRes || [];
  }

  return (
    <Dashboard
      config={config}
      automations={automations}
      mediaList={mediaList}
      stats={stats}
      connectedParam={connected}
      errorParam={error}
      creatorProfile={creatorProfile}
      ideas={ideas}
      drafts={drafts}
      chatSessions={chatSessions}
      templates={templates}
    />
  );
}

function sentCountCount(val: number | null): number {
  return val || 0;
}
