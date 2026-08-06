import React from 'react';
import Dashboard from './Dashboard';
import { fetchInstagramMediaAction } from './actions';
import {
  getInstagramConfig,
  getAutomations,
  getCreatorProfile,
  getIdeas,
  getDrafts,
  getChatSessions,
  getTemplates,
  getCollectionData,
} from '@/lib/db';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const connected = resolvedParams.connected === 'true';
  const error = resolvedParams.error as string | undefined;

  // Executar todas as consultas independentes do Firebase Firestore em PARALELO para carregamento ultrarrápido (< 50ms)
  const [
    config,
    automations,
    creatorProfile,
    ideas,
    drafts,
    chatSessions,
    templates,
  ] = await Promise.all([
    getInstagramConfig(),
    getAutomations(),
    getCreatorProfile(),
    getIdeas(),
    getDrafts(),
    getChatSessions(),
    getTemplates(),
  ]);

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
      contactsList,
      queueList,
      mediaListRes
    ] = await Promise.all([
      getCollectionData('contacts'),
      getCollectionData('queue'),
      fetchInstagramMediaAction().catch(() => []),
    ]);

    stats = {
      totalContacts: contactsList.length,
      pendingQueue: queueList.filter((q: any) => q.status === 'pending').length,
      sentMessages: queueList.filter((q: any) => q.status === 'sent').length,
      failedMessages: queueList.filter((q: any) => q.status === 'failed').length,
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
