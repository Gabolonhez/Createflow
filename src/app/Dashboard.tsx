'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { DashboardHeader } from '@/components/DashboardHeader';
import { XSectionBar } from '@/components/XSectionBar';
import { PostsQueueView } from '@/components/PostsQueueView';
import { CalendarView } from '@/components/CalendarView';
import { MyIdeasView } from '@/components/MyIdeasView';
import { TopicsView } from '@/components/TopicsView';
import { FactsView } from '@/components/FactsView';
import { ReferencesView } from '@/components/ReferencesView';
import { VoiceProfileView } from '@/components/VoiceProfileView';
import { AiLearningsView } from '@/components/AiLearningsView';
import { PerformanceView } from '@/components/PerformanceView';
import { ConnectionsView } from '@/components/ConnectionsView';
import { PostComposerModal } from '@/components/PostComposerModal';
import { GeneratePostModal } from '@/components/GeneratePostModal';
import { RejectPostModal } from '@/components/RejectPostModal';

import {
  savePostAction,
  deletePostAction,
  approvePostAction,
  rejectPostAction,
  publishPostNowAction,
  markPostAsPublishedAction,
  generatePostAction,
  rewritePostAction,
  saveIdeaAction,
  deleteIdeaAction,
  generateIdeasWithAiAction,
  generateTopicsAction,
  saveTopicAction,
  deleteTopicAction,
  saveFactAction,
  deleteFactAction,
  analyzeAndSaveReferenceAction,
  deleteReferenceAction,
  saveVoiceProfileAction,
  deleteAiLearningAction,
  saveConnectionsAction,
} from './actions';

import type {
  CreatorPost,
  PostIdea,
  Topic,
  Fact,
  Reference,
  VoiceProfile,
  AiLearning,
  ConnectionsConfig,
  MainSection,
  ActiveSubView,
  Platform,
} from '@/types';

interface DashboardProps {
  posts: CreatorPost[];
  ideas: PostIdea[];
  topics: Topic[];
  facts: Fact[];
  references: Reference[];
  voiceProfile: VoiceProfile;
  learnings: AiLearning[];
  connections: ConnectionsConfig;
  connectedParam?: boolean;
  errorParam?: string;
}

export default function Dashboard({
  posts: initialPosts,
  ideas: initialIdeas,
  topics: initialTopics,
  facts: initialFacts,
  references: initialReferences,
  voiceProfile: initialVoiceProfile,
  learnings: initialLearnings,
  connections: initialConnections,
  connectedParam,
  errorParam,
}: DashboardProps) {
  // Navigation & View State
  const [currentSection, setCurrentSection] = useState<MainSection>('plan');
  const [currentSubView, setCurrentSubView] = useState<ActiveSubView>('posts');
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | 'all'>('all');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Local Reactive State for Entities
  const [posts, setPosts] = useState<CreatorPost[]>(initialPosts);
  const [ideas, setIdeas] = useState<PostIdea[]>(initialIdeas);
  const [topics, setTopics] = useState<Topic[]>(initialTopics);
  const [facts, setFacts] = useState<Fact[]>(initialFacts);
  const [references, setReferences] = useState<Reference[]>(initialReferences);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>(initialVoiceProfile);
  const [learnings, setLearnings] = useState<AiLearning[]>(initialLearnings);
  const [connections, setConnections] = useState<ConnectionsConfig>(initialConnections);

  // Modal States
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CreatorPost | null>(null);

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [generateIdeaSource, setGenerateIdeaSource] = useState<PostIdea | null>(null);
  const [generateTopicSource, setGenerateTopicSource] = useState<Topic | null>(null);
  const [generateRefSource, setGenerateRefSource] = useState<Reference | null>(null);

  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectingPostId, setRejectingPostId] = useState<string | null>(null);

  // Toast / Status banner
  const [toastMessage, setToastMessage] = useState<string | null>(
    connectedParam
      ? 'Conta conectada com sucesso!'
      : errorParam
      ? `Erro: ${decodeURIComponent(errorParam)}`
      : null
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter posts by platform if selected
  const filteredPosts =
    selectedPlatform === 'all'
      ? posts
      : posts.filter((p) => p.platforms.includes(selectedPlatform));

  const pendingApprovalsCount = posts.filter(
    (p) => p.status === 'AWAITING_APPROVAL'
  ).length;

  // Handlers for Navigation
  const handleNavigate = (section: MainSection, subView: ActiveSubView) => {
    setCurrentSection(section);
    setCurrentSubView(subView);
  };

  // Handlers for Composer
  const handleOpenComposer = (post?: CreatorPost | null) => {
    setEditingPost(post || null);
    setIsComposerOpen(true);
  };

  const handleOpenComposerWithDate = (dateIso: string) => {
    setEditingPost({
      id: '',
      text: '',
      thread: [],
      threadStyle: 'single',
      platforms: selectedPlatform === 'all' ? ['x', 'linkedin'] : [selectedPlatform],
      status: 'SCHEDULED',
      pillar: 'tech-insights',
      mediaUrls: [],
      scheduledFor: dateIso,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setIsComposerOpen(true);
  };

  const handleSavePost = async (postData: Partial<CreatorPost>) => {
    const res = await savePostAction(postData);
    if (res.post) {
      setPosts((prev) => {
        const idx = prev.findIndex((p) => p.id === res.post!.id);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = res.post!;
          return next;
        }
        return [res.post!, ...prev];
      });
      showToast('Post salvo com sucesso!');
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este post?')) return;
    await deletePostAction(id);
    setPosts((prev) => prev.filter((p) => p.id !== id));
    showToast('Post removido.');
  };

  const handleApprovePost = async (id: string, scheduledFor?: string) => {
    const res = await approvePostAction(id, scheduledFor);
    if (res.post) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'SCHEDULED', scheduledFor: res.post!.scheduledFor } : p))
      );
      showToast('Post aprovado e agendado com sucesso!');
    }
  };

  const handleOpenRejectModal = (postId: string) => {
    setRejectingPostId(postId);
    setIsRejectOpen(true);
  };

  const handleConfirmReject = async (
    postId: string,
    reasonText: string,
    category: 'tone' | 'structure' | 'topics' | 'formatting'
  ) => {
    await rejectPostAction(postId, reasonText, category);
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, status: 'REJECTED', rejectReason: reasonText } : p))
    );
    showToast('Post rejeitado. A instrução foi gravada na memória da IA!');
  };

  const handlePublishNow = async (id: string) => {
    const res = await publishPostNowAction(id);
    if (res.success) {
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'PUBLISHED', publishedAt: new Date().toISOString() } : p))
      );
      showToast('Post publicado com sucesso nas redes!');
    } else {
      showToast('Falha na publicação automática via API. Abrindo modo manual.');
      const post = posts.find((p) => p.id === id);
      if (post) handleOpenComposer(post);
    }
  };

  // Handlers for Generation
  const handleOpenGenerateModal = () => {
    setGenerateIdeaSource(null);
    setGenerateTopicSource(null);
    setGenerateRefSource(null);
    setIsGenerateOpen(true);
  };

  const handleGenerateFromIdea = (idea: PostIdea) => {
    setGenerateIdeaSource(idea);
    setGenerateTopicSource(null);
    setGenerateRefSource(null);
    setIsGenerateOpen(true);
  };

  const handleGenerateFromTopic = (topic: Topic) => {
    setGenerateTopicSource(topic);
    setGenerateIdeaSource(null);
    setGenerateRefSource(null);
    setIsGenerateOpen(true);
  };

  const handleGenerateFromReference = (ref: Reference) => {
    setGenerateRefSource(ref);
    setGenerateIdeaSource(null);
    setGenerateTopicSource(null);
    setIsGenerateOpen(true);
  };

  const handleGeneratePost = async (options: any) => {
    const res = await generatePostAction(options);
    if (res.post) {
      setPosts((prev) => [res.post!, ...prev]);
      showToast('Post gerado com IA! Aberto para sua revisão.');
      // Open in composer for user review
      handleOpenComposer(res.post);
      return { success: true, post: res.post };
    }
    return { success: false, error: res.error };
  };

  // Handlers for Ideas
  const handleSaveIdea = async (ideaData: Partial<PostIdea>) => {
    const res = await saveIdeaAction(ideaData);
    if (res.idea) {
      setIdeas((prev) => [res.idea!, ...prev]);
      showToast('Ideia salva!');
    }
  };

  const handleDeleteIdea = async (id: string) => {
    await deleteIdeaAction(id);
    setIdeas((prev) => prev.filter((i) => i.id !== id));
    showToast('Ideia excluída.');
  };

  const handleGenerateIdeasWithAi = async () => {
    const res = await generateIdeasWithAiAction(5);
    if (res.ideas && res.ideas.length > 0) {
      setIdeas((prev) => [...res.ideas!, ...prev]);
      showToast(`+${res.ideas.length} novas ideias sugeridas pela IA!`);
    } else if (res.error) {
      showToast(`Erro ao gerar ideias: ${res.error}`);
    }
  };

  // Handlers for Topics
  const handleGenerateTopics = async () => {
    const res = await generateTopicsAction(5);
    if (res.topics) {
      setTopics((prev) => [...res.topics!, ...prev]);
      showToast('5 novas pautas geradas com IA!');
    }
  };

  const handleDeleteTopic = async (id: string) => {
    await deleteTopicAction(id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
    showToast('Pauta excluída.');
  };

  // Handlers for Facts
  const handleSaveFact = async (factData: Partial<Fact>) => {
    const res = await saveFactAction(factData);
    if (res.fact) {
      setFacts((prev) => [res.fact!, ...prev]);
      showToast('Fato adicionado à base de conhecimento!');
    }
  };

  const handleDeleteFact = async (id: string) => {
    await deleteFactAction(id);
    setFacts((prev) => prev.filter((f) => f.id !== id));
    showToast('Fato removido.');
  };

  // Handlers for References
  const handleAnalyzeAndSaveReference = async (
    text: string,
    platform: Platform,
    url?: string,
    author?: string
  ) => {
    const res = await analyzeAndSaveReferenceAction(text, platform, url, author);
    if (res.reference) {
      setReferences((prev) => [res.reference!, ...prev]);
      showToast('Post analisado! Template reutilizável gerado.');
    }
  };

  const handleDeleteReference = async (id: string) => {
    await deleteReferenceAction(id);
    setReferences((prev) => prev.filter((r) => r.id !== id));
    showToast('Referência removida.');
  };

  // Handlers for Voice Profile
  const handleSaveVoiceProfile = async (profileData: Partial<VoiceProfile>) => {
    await saveVoiceProfileAction(profileData);
    setVoiceProfile((prev) => ({ ...prev, ...profileData }));
    showToast('Perfil de voz atualizado!');
  };

  // Handlers for Learnings
  const handleDeleteLearning = async (id: string) => {
    await deleteAiLearningAction(id);
    setLearnings((prev) => prev.filter((l) => l.id !== id));
    showToast('Aprendizado removido da memória.');
  };

  // Handlers for Connections
  const handleSaveConnections = async (cfg: Partial<ConnectionsConfig>) => {
    await saveConnectionsAction(cfg);
    setConnections((prev) => ({ ...prev, ...cfg }));
    showToast('Configurações de conexões salvas!');
  };

  // Subtitle per view
  const viewTitles: Record<ActiveSubView, { title: string; subtitle: string }> = {
    posts: {
      title: 'Fila de Posts',
      subtitle: 'Posts autorais para X e LinkedIn. Você aprova e agenda com 1 clique.',
    },
    calendar: {
      title: 'Calendário de Publicações',
      subtitle: 'Distribuição visual dos conteúdos agendados ao longo da semana.',
    },
    'my-ideas': {
      title: 'Minhas Ideias',
      subtitle: 'Captura rápida de insights e anotações para transformar em posts.',
    },
    topics: {
      title: 'Pautas & Ângulos',
      subtitle: 'Sugestões inteligentes de temas contra-intuitivos para founders e devs.',
    },
    facts: {
      title: 'Fatos Reais do Criador',
      subtitle: 'Base de conhecimento verídica sobre seus produtos, métricas e stack.',
    },
    references: {
      title: 'Referências Virais',
      subtitle: 'Posts de sucesso desconstruídos em templates de alta performance.',
    },
    manual: {
      title: 'Meu Estilo & Regras de Voz',
      subtitle: 'Defina seu jeito de escrever, palavras proibidas e amostras reais.',
    },
    learnings: {
      title: 'Memória da IA',
      subtitle: 'O que a IA aprendeu a partir das suas revisões e rejeições.',
    },
    performance: {
      title: 'Desempenho & Métricas',
      subtitle: 'Estatísticas de postagens acumuladas no X e no LinkedIn.',
    },
    connection: {
      title: 'Conexões X & LinkedIn',
      subtitle: 'Configurações de envio automático via API ou modo manual em 1 clique.',
    },
  };

  const headerMeta = viewTitles[currentSubView] || viewTitles.posts;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#050505] text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-xl bg-violet-600 text-white font-medium text-xs shadow-2xl shadow-violet-600/40 border border-violet-400/30 animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-white/60 hover:text-white"
          >
            ×
          </button>
        </div>
      )}

      {/* App Sidebar */}
      <AppSidebar
        currentSection={currentSection}
        currentSubView={currentSubView}
        onNavigate={handleNavigate}
        onOpenComposer={() => handleOpenComposer()}
        pendingApprovalsCount={pendingApprovalsCount}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        xConnected={connections.x_connected}
        linkedinConnected={connections.linkedin_connected}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#07070a] bg-grain">
        {/* Sticky Header */}
        <DashboardHeader
          title={headerMeta.title}
          subtitle={headerMeta.subtitle}
          selectedPlatform={selectedPlatform}
          onSelectPlatform={setSelectedPlatform}
          onOpenComposer={() => handleOpenComposer()}
          onOpenGenerate={handleOpenGenerateModal}
          authorHandle={voiceProfile.handle_x}
        />

        {/* Inner Container */}
        <div className="p-4 md:p-6 lg:p-8 flex flex-col gap-6 max-w-7xl w-full mx-auto">
          {/* Section Bar (PayPosts Inspired) */}
          <XSectionBar
            currentSection={currentSection}
            currentSubView={currentSubView}
            onSelectSection={setCurrentSection}
            onSelectSubView={setCurrentSubView}
          />

          {/* Active View Content */}
          {currentSubView === 'posts' && (
            <PostsQueueView
              posts={filteredPosts}
              onOpenPost={handleOpenComposer}
              onDeletePost={handleDeletePost}
              onPublishNow={handlePublishNow}
              onApprovePost={(id) => handleApprovePost(id)}
              onOpenGenerate={handleOpenGenerateModal}
              onOpenComposer={() => handleOpenComposer()}
            />
          )}

          {currentSubView === 'calendar' && (
            <CalendarView
              posts={filteredPosts}
              onOpenPost={handleOpenComposer}
              onOpenComposerWithDate={handleOpenComposerWithDate}
            />
          )}

          {currentSubView === 'my-ideas' && (
            <MyIdeasView
              ideas={ideas}
              onSaveIdea={handleSaveIdea}
              onDeleteIdea={handleDeleteIdea}
              onGenerateFromIdea={handleGenerateFromIdea}
              onGenerateIdeasWithAi={handleGenerateIdeasWithAi}
            />
          )}

          {currentSubView === 'topics' && (
            <TopicsView
              topics={topics}
              onGenerateNewTopics={handleGenerateTopics}
              onDeleteTopic={handleDeleteTopic}
              onGenerateFromTopic={handleGenerateFromTopic}
            />
          )}

          {currentSubView === 'facts' && (
            <FactsView
              facts={facts}
              onSaveFact={handleSaveFact}
              onDeleteFact={handleDeleteFact}
            />
          )}

          {currentSubView === 'references' && (
            <ReferencesView
              references={references}
              onAnalyzeAndSave={handleAnalyzeAndSaveReference}
              onDeleteReference={handleDeleteReference}
              onUseTemplate={handleGenerateFromReference}
            />
          )}

          {currentSubView === 'manual' && (
            <VoiceProfileView
              profile={voiceProfile}
              onSaveProfile={handleSaveVoiceProfile}
            />
          )}

          {currentSubView === 'learnings' && (
            <AiLearningsView
              learnings={learnings}
              onDeleteLearning={handleDeleteLearning}
            />
          )}

          {currentSubView === 'performance' && (
            <PerformanceView posts={posts} />
          )}

          {currentSubView === 'connection' && (
            <ConnectionsView
              connections={connections}
              onSaveConnections={handleSaveConnections}
            />
          )}
        </div>
      </main>

      {/* Composer Modal */}
      <PostComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        initialPost={editingPost}
        onSave={handleSavePost}
        onApprove={handleApprovePost}
        onPublishNow={handlePublishNow}
        onRewrite={rewritePostAction}
        authorHandle={voiceProfile.handle_x}
        authorName={voiceProfile.creator_name}
        authorHeadline={voiceProfile.headline}
      />

      {/* Quick AI Generator Modal */}
      <GeneratePostModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        onGenerate={handleGeneratePost}
        ideas={ideas}
        topics={topics}
        facts={facts}
        references={references}
        prefilledIdea={generateIdeaSource}
        prefilledTopic={generateTopicSource}
        prefilledReference={generateRefSource}
      />

      {/* Reject Modal */}
      <RejectPostModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        postId={rejectingPostId || ''}
        onConfirmReject={handleConfirmReject}
      />
    </div>
  );
}
