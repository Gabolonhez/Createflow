import React from 'react';
import Dashboard from './Dashboard';
import {
  getCreatorPosts,
  getIdeas,
  getTopics,
  getFacts,
  getReferences,
  getVoiceProfile,
  getAiLearnings,
  getConnectionsConfig,
} from '@/lib/db';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const dynamic = 'force-dynamic';

export default async function Page({ searchParams }: PageProps) {
  const resolvedParams = await searchParams;
  const connected = resolvedParams.connected === 'true';
  const error = resolvedParams.error as string | undefined;

  // Carregamento ultrarrápido em paralelo de todos os dados do Criador
  const [
    posts,
    ideas,
    topics,
    facts,
    references,
    voiceProfile,
    learnings,
    connections,
  ] = await Promise.all([
    getCreatorPosts(),
    getIdeas(),
    getTopics(),
    getFacts(),
    getReferences(),
    getVoiceProfile(),
    getAiLearnings(),
    getConnectionsConfig(),
  ]);

  return (
    <Dashboard
      posts={posts}
      ideas={ideas}
      topics={topics}
      facts={facts}
      references={references}
      voiceProfile={voiceProfile}
      learnings={learnings}
      connections={connections}
      connectedParam={connected}
      errorParam={error}
    />
  );
}
