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

  // 1. Buscar configuração do Instagram
  const { data: config } = await supabase
    .from('config')
    .select('*')
    .eq('id', 'instagram_config')
    .maybeSingle();

  // 2. Buscar automações
  const { data: automations } = await supabase
    .from('automations')
    .select('*')
    .order('created_at', { ascending: false });

  // 3. Buscar mídias do Instagram para seleção (se conectado)
  let mediaList: any[] = [];
  if (config) {
    mediaList = await fetchInstagramMediaAction();
  }

  // 4. Buscar estatísticas (contatos ativos, fila de envios)
  let stats = {
    totalContacts: 0,
    pendingQueue: 0,
    sentMessages: 0,
    failedMessages: 0,
  };

  if (config) {
    const { count: contactsCount } = await supabase
      .from('contacts')
      .select('id', { count: 'exact', head: true });

    const { count: pendingCount } = await supabase
      .from('queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending');

    const { count: sentCount } = await supabase
      .from('queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'sent');

    const { count: failedCount } = await supabase
      .from('queue')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'failed');

    stats = {
      totalContacts: contactsCount || 0,
      pendingQueue: pendingCount || 0,
      sentMessages: sentCount || 0,
      failedMessages: failedCount || 0,
    };
  }

  // 5. Buscar perfil do criador para o Estúdio de Criação
  const { data: creatorProfile } = await supabase
    .from('creator_profiles')
    .select('*')
    .eq('id', 'creator_config')
    .maybeSingle();

  // 6. Buscar banco de ideias
  const { data: ideas } = await supabase
    .from('ideas')
    .select('*')
    .order('created_at', { ascending: false });

  // 7. Buscar rascunhos e roteiros
  const { data: drafts } = await supabase
    .from('content_drafts')
    .select('*')
    .order('updated_at', { ascending: false });

  // 8. Buscar sessões de chat do Segundo Cérebro
  const { data: chatSessions } = await supabase
    .from('chat_sessions')
    .select('*')
    .order('updated_at', { ascending: false });

  // 9. Buscar templates analisados de posts virais
  const { data: templates } = await supabase
    .from('analyzed_templates')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <Dashboard
      config={config || null}
      automations={(automations as any[]) || []}
      mediaList={mediaList}
      stats={stats}
      connectedParam={connected}
      errorParam={error}
      creatorProfile={creatorProfile || null}
      ideas={(ideas as any[]) || []}
      drafts={(drafts as any[]) || []}
      chatSessions={(chatSessions as any[]) || []}
      templates={(templates as any[]) || []}
    />
  );
}
