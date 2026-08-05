'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Power,
  Plus,
  Trash2,
  Edit,
  CheckCircle,
  Clock,
  Link,
  MessageSquare,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Search,
  Image,
  FileText,
  Check,
  X,
  Sparkles,
  Copy,
  ExternalLink,
  Brain,
  Compass,
  Video,
  Layers,
} from 'lucide-react';

const Instagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={props.className}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);
import {
  disconnectInstagramAction,
  getInstagramOAuthUrlAction,
  saveAutomationAction,
  deleteAutomationAction,
  toggleAutomationAction,
  saveCreatorProfileAction,
  saveIdeaAction,
  deleteIdeaAction,
  saveDraftAction,
  deleteDraftAction,
  generateIdeasAction,
  generateScriptAction,
  getLinkedInOAuthUrlAction,
  publishToLinkedInAction,
  publishToInstagramAction,
  createChatSessionAction,
  deleteChatSessionAction,
  sendMessageAction,
  analyzeTrendAction,
  saveAnalyzedTemplateAction,
  deleteAnalyzedTemplateAction,
  refineDraftAction,
  getChatMessagesAction,
  generateSchedulePlanAction,
} from './actions';

interface Automation {
  id?: string;
  name: string;
  active: boolean;
  trigger_comment: boolean;
  trigger_story: boolean;
  trigger_dm: boolean;
  keywords: string[];
  match_type: 'contains' | 'exact' | 'any';
  post_id: string | null;
  post_permalink: string | null;
  post_media_url: string | null;
  public_replies: string[];
  welcome_dm: string;
  quick_reply_button: string | null;
  link_text: string | null;
  link_button_label: string | null;
  link_url: string | null;
  reminder_text: string | null;
  reminder_delay_minutes: number | null;
}

interface CreatorProfile {
  id: string;
  niche: string;
  target_audience: string;
  objectives: string;
  voice_tone: string;
  content_pillars: string[];
  updated_at: string;
}

interface Idea {
  id: string;
  title: string;
  description: string | null;
  reference_url: string | null;
  pillar: string | null;
  status: 'idea' | 'drafted' | 'archived';
  created_at: string;
}

interface Draft {
  id: string;
  title: string;
  platform: 'linkedin' | 'instagram' | 'tiktok';
  format: 'reels' | 'carousel' | 'post' | 'text';
  content: string;
  visual_script: string | null;
  status: 'draft' | 'ready' | 'published';
  idea_id: string | null;
  created_at: string;
  updated_at: string;
  media_url?: string | null;
  scheduled_at?: string | null;
}

interface DashboardProps {
  config: any;
  automations: Automation[];
  mediaList: any[];
  stats: {
    totalContacts: number;
    pendingQueue: number;
    sentMessages: number;
    failedMessages: number;
  };
  connectedParam?: boolean;
  errorParam?: string;
  creatorProfile: CreatorProfile | null;
  ideas: Idea[];
  drafts: Draft[];
  chatSessions: any[];
  templates: any[];
}

export default function Dashboard({
  config,
  automations,
  mediaList,
  stats,
  connectedParam,
  errorParam,
  creatorProfile,
  ideas,
  drafts,
  chatSessions,
  templates,
}: DashboardProps) {
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [currentMediaList, setCurrentMediaList] = useState<any[]>(mediaList);

  // Estado do formulário de automação
  const [formState, setFormState] = useState<Automation>({
    name: '',
    active: true,
    trigger_comment: true,
    trigger_story: false,
    trigger_dm: false,
    keywords: [],
    match_type: 'contains',
    post_id: null,
    post_permalink: null,
    post_media_url: null,
    public_replies: [],
    welcome_dm: '',
    quick_reply_button: '',
    link_text: '',
    link_button_label: '',
    link_url: '',
    reminder_text: '',
    reminder_delay_minutes: null,
  });

  const [rawKeywords, setRawKeywords] = useState('');
  const [rawPublicReplies, setRawPublicReplies] = useState('');

  const handleConnect = async () => {
    setLoading(true);
    try {
      const url = await getInstagramOAuthUrlAction();
      window.location.href = url;
    } catch (e: any) {
      alert(`Erro ao obter URL de autenticação: ${e.message}`);
      setLoading(false);
    }
  };
  
  // Controle de abas principais
  const [activeMainTab, setActiveMainTab] = useState<'automations' | 'creator_studio'>('automations');
  // Controle de sub-abas do Creator Studio (Padrão para CHAT do segundo cérebro!)
  const [activeStudioTab, setActiveStudioTab] = useState<'chat' | 'trends' | 'ideas' | 'drafts' | 'profile'>('chat');

  // Estado do Perfil de Marca
  const [profileForm, setProfileForm] = useState({
    niche: creatorProfile?.niche || '',
    target_audience: creatorProfile?.target_audience || '',
    objectives: creatorProfile?.objectives || '',
    voice_tone: creatorProfile?.voice_tone || '',
    content_pillars: creatorProfile?.content_pillars?.join(', ') || '',
  });

  // Estado de Ideias
  const [ideaForm, setIdeaForm] = useState({
    id: '',
    title: '',
    description: '',
    reference_url: '',
    pillar: '',
  });
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);
  const [isAiSuggestionsLoading, setIsAiSuggestionsLoading] = useState(false);
  const [showAiSuggestionsModal, setShowAiSuggestionsModal] = useState(false);

  // Estado de Rascunhos
  const [draftForm, setDraftForm] = useState({
    id: '',
    title: '',
    platform: 'instagram' as 'instagram' | 'linkedin' | 'tiktok',
    format: 'post' as 'reels' | 'carousel' | 'post' | 'text',
    content: '',
    visual_script: '',
    idea_id: '',
    status: 'draft' as 'draft' | 'ready' | 'published',
    media_url: '',
    scheduled_at: '',
  });
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');

  // Filtros de Rascunhos
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [studioLoading, setStudioLoading] = useState(false);

  // ESTADO DO CHAT (SEGUNDO CÉREBRO)
  const [sessions, setSessions] = useState<any[]>(chatSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  // ESTADO DO ANALISADOR DE TENDÊNCIAS
  const [trendText, setTrendText] = useState('');
  const [analyzedResult, setAnalyzedResult] = useState<any | null>(null);
  const [isAnalyzingTrend, setIsAnalyzingTrend] = useState(false);
  const [localTemplates, setLocalTemplates] = useState<any[]>(templates);

  const [isPublishing, setIsPublishing] = useState(false);

  // ESTADO DO CRONOGRAMA ESTRATÉGICO
  const [schedulePlan, setSchedulePlan] = useState<any | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  const handleGenerateSchedulePlan = async () => {
    setIsGeneratingSchedule(true);
    try {
      const plan = await generateSchedulePlanAction();
      setSchedulePlan(plan);
      setIsScheduleModalOpen(true);
    } catch (err: any) {
      alert(`Erro ao gerar cronograma: ${err.message}`);
    } finally {
      setIsGeneratingSchedule(false);
    }
  };

  // Carregar mensagens quando a sessão do chat ativo muda
  useEffect(() => {
    if (activeSessionId) {
      const loadMessages = async () => {
        try {
          const data = await getChatMessagesAction(activeSessionId);
          setMessages(data || []);
        } catch (err: any) {
          console.error('Erro ao carregar mensagens:', err.message);
        }
      };
      loadMessages();
    } else {
      setMessages([]);
    }
  }, [activeSessionId]);

  // Handlers do Creator Studio (Marca, Ideias, Rascunhos)
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudioLoading(true);
    try {
      await saveCreatorProfileAction(profileForm);
      alert('Perfil de marca salvo com sucesso!');
    } catch (err: any) {
      alert(`Erro ao salvar perfil: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleSaveIdea = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudioLoading(true);
    try {
      await saveIdeaAction(ideaForm);
      setIdeaForm({ id: '', title: '', description: '', reference_url: '', pillar: '' });
      setIsIdeaModalOpen(false);
    } catch (err: any) {
      alert(`Erro ao salvar ideia: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (confirm('Deseja excluir esta ideia permanentemente?')) {
      setStudioLoading(true);
      try {
        await deleteIdeaAction(id);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setStudioLoading(false);
      }
    }
  };

  const handleGenerateIdeasWithAI = async () => {
    setIsAiSuggestionsLoading(true);
    setShowAiSuggestionsModal(true);
    setAiSuggestions([]);
    try {
      const suggestions = await generateIdeasAction();
      setAiSuggestions(suggestions);
    } catch (err: any) {
      alert(err.message);
      setShowAiSuggestionsModal(false);
    } finally {
      setIsAiSuggestionsLoading(false);
    }
  };

  const handleAddAiIdeaToBacklog = async (aiIdea: any) => {
    setStudioLoading(true);
    try {
      await saveIdeaAction({
        title: aiIdea.title,
        description: aiIdea.description,
        pillar: aiIdea.pillar,
        status: 'idea',
      });
      setAiSuggestions((prev) => prev.filter((item) => item.title !== aiIdea.title));
    } catch (err: any) {
      alert(`Erro ao adicionar ideia: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleOpenDraftFromIdea = (idea: Idea) => {
    setDraftForm({
      id: '',
      title: idea.title,
      platform: idea.pillar?.toLowerCase().includes('linkedin') ? 'linkedin' : 'instagram',
      format: idea.pillar?.toLowerCase().includes('linkedin') ? 'text' : 'reels',
      content: '',
      visual_script: '',
      idea_id: idea.id,
      status: 'draft',
      media_url: '',
      scheduled_at: '',
    });
    setCustomPrompt(idea.description || '');
    setIsDraftModalOpen(true);
  };

  const handleOpenNewDraft = () => {
    setDraftForm({
      id: '',
      title: '',
      platform: 'instagram',
      format: 'post',
      content: '',
      visual_script: '',
      idea_id: '',
      status: 'draft',
      media_url: '',
      scheduled_at: '',
    });
    setCustomPrompt('');
    setIsDraftModalOpen(true);
  };

  const handleOpenEditDraft = (draft: Draft) => {
    setDraftForm({
      id: draft.id,
      title: draft.title,
      platform: draft.platform,
      format: draft.format,
      content: draft.content,
      visual_script: draft.visual_script || '',
      idea_id: draft.idea_id || '',
      status: draft.status,
      media_url: draft.media_url || '',
      scheduled_at: draft.scheduled_at || '',
    });
    setCustomPrompt('');
    setIsDraftModalOpen(true);
  };

  const handleGenerateScriptWithAI = async () => {
    if (!draftForm.title) {
      alert('Por favor, informe pelo menos o título do post para gerar o roteiro.');
      return;
    }
    setIsGeneratingScript(true);
    try {
      const result = await generateScriptAction({
        title: draftForm.title,
        description: customPrompt,
        platform: draftForm.platform,
        format: draftForm.format,
        customPrompt,
      });

      setDraftForm((prev) => ({
        ...prev,
        content: result.content,
        visual_script: result.visual_script || '',
      }));
    } catch (err: any) {
      alert(`Erro ao gerar roteiro com IA: ${err.message}`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setStudioLoading(true);
    try {
      await saveDraftAction(draftForm);
      setIsDraftModalOpen(false);
    } catch (err: any) {
      alert(`Erro ao salvar rascunho: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleDeleteDraft = async (id: string) => {
    if (confirm('Excluir este rascunho permanentemente?')) {
      setStudioLoading(true);
      try {
        await deleteDraftAction(id);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setStudioLoading(false);
      }
    }
  };

  const handleUpdateDraftStatus = async (draft: Draft, newStatus: 'draft' | 'ready' | 'published') => {
    setStudioLoading(true);
    try {
      await saveDraftAction({
        ...draft,
        status: newStatus,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setStudioLoading(false);
    }
  };

  const handlePlatformChange = (platform: 'instagram' | 'linkedin' | 'tiktok') => {
    let format: 'reels' | 'carousel' | 'post' | 'text' = 'post';
    if (platform === 'linkedin') format = 'text';
    if (platform === 'tiktok') format = 'reels';
    setDraftForm((prev) => ({ ...prev, platform, format }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Texto copiado com sucesso!');
  };

  // Handlers do Segundo Cérebro (Conversação Chat)
  const handleCreateSession = async () => {
    const title = prompt('Digite o título da nova sessão de brainstorming:');
    if (!title) return;
    setStudioLoading(true);
    try {
      const newSession = await createChatSessionAction(title);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
    } catch (err: any) {
      alert(`Erro ao criar sessão: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleDeleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Deseja excluir esta sessão e todo o histórico de mensagens?')) return;
    setStudioLoading(true);
    try {
      await deleteChatSessionAction(id);
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (activeSessionId === id) {
        setActiveSessionId(null);
      }
    } catch (err: any) {
      alert(`Erro ao deletar: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeSessionId || isSendingMessage) return;
    const text = inputMessage.trim();
    setInputMessage('');
    
    // Inserção temporária da msg do usuário no UI
    const tempUserMsg = { id: Math.random().toString(), role: 'user', content: text };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsSendingMessage(true);

    try {
      const result = await sendMessageAction(activeSessionId, text);
      const tempModelMsg = { id: Math.random().toString(), role: 'model', content: result.content };
      setMessages((prev) => [...prev, tempModelMsg]);
    } catch (err: any) {
      alert(`Erro ao obter resposta da IA: ${err.message}`);
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSaveChatMessageAsIdea = async (content: string) => {
    const title = prompt('Deseja dar um título para esta ideia?', content.substring(0, 40) + '...');
    if (title === null) return; // cancelou
    setStudioLoading(true);
    try {
      await saveIdeaAction({
        title: title || 'Insight do Chat',
        description: content,
        status: 'idea',
      });
      alert('Insight salvo no Banco de Ideias!');
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleSaveChatMessageAsDraft = (content: string) => {
    const title = prompt('Deseja dar um título para este rascunho?', 'Post criado do Chat');
    if (title === null) return;
    setDraftForm({
      id: '',
      title: title || 'Post criado do Chat',
      platform: 'linkedin',
      format: 'text',
      content: content,
      visual_script: '',
      idea_id: '',
      status: 'draft',
      media_url: '',
      scheduled_at: '',
    });
    setCustomPrompt('');
    setIsDraftModalOpen(true);
  };

  // Handlers do Analisador de Tendências
  const handleAnalyzeTrend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trendText.trim()) return;
    setIsAnalyzingTrend(true);
    setAnalyzedResult(null);
    try {
      const result = await analyzeTrendAction(trendText);
      setAnalyzedResult(result);
    } catch (err: any) {
      alert(`Erro ao analisar post: ${err.message}`);
    } finally {
      setIsAnalyzingTrend(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!analyzedResult) return;
    setStudioLoading(true);
    try {
      await saveAnalyzedTemplateAction({
        title: analyzedResult.title,
        original_content: trendText,
        hook: analyzedResult.hook,
        structure: analyzedResult.structure,
        key_takeaways: analyzedResult.key_takeaways,
        reusable_template: analyzedResult.reusable_template,
      });
      alert('Modelo de sucesso salvo na biblioteca!');
      setTrendText('');
      setAnalyzedResult(null);
      // Atualizar lista local de modelos
      window.location.reload(); // Recarga simples para atualizar os Server Components
    } catch (err: any) {
      alert(`Erro ao salvar modelo: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Deseja deletar este modelo da sua biblioteca?')) return;
    setStudioLoading(true);
    try {
      await deleteAnalyzedTemplateAction(id);
      setLocalTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      alert(err.message);
    } finally {
      setStudioLoading(false);
    }
  };

  const handleOpenDraftFromTemplate = (template: any) => {
    setDraftForm({
      id: '',
      title: `Novo post baseado em: ${template.title}`,
      platform: 'linkedin',
      format: 'text',
      content: template.reusable_template,
      visual_script: '',
      idea_id: '',
      status: 'draft',
      media_url: '',
      scheduled_at: '',
    });
    setCustomPrompt('Foque em adaptar os placeholders [entre colchetes] do template para o meu nicho.');
    setIsDraftModalOpen(true);
  };

  // Handlers do Refinador/Humanizador de Cópia
  const handleRefineDraft = async (type: 'humanize' | 'shorten' | 'simplify' | 'engagement') => {
    if (!draftForm.content) {
      alert('Por favor, escreva ou gere algum texto antes de refinar.');
      return;
    }
    setIsGeneratingScript(true);
    try {
      const refinedText = await refineDraftAction({
        content: draftForm.content,
        refinementType: type,
      });
      setDraftForm((prev) => ({ ...prev, content: refinedText }));
    } catch (err: any) {
      alert(`Erro ao humanizar/refinar texto: ${err.message}`);
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Handler de Geração de Imagem por IA
  const handleGenerateAIImage = () => {
    if (!draftForm.title && !draftForm.content) {
      alert('Digite um título ou conteúdo antes de gerar a imagem.');
      return;
    }
    const topic = encodeURIComponent(draftForm.title || draftForm.content.slice(0, 50));
    const generatedUrl = `https://image.pollinations.ai/prompt/professional%20minimalist%20social%20media%20graphic%20about%20${topic}?width=1080&height=1080&nologo=true&seed=${Math.floor(Math.random() * 10000)}`;
    setDraftForm((prev) => ({ ...prev, media_url: generatedUrl }));
  };

  // Handlers de Publicação
  const handleConnectLinkedIn = async () => {
    setStudioLoading(true);
    try {
      const url = await getLinkedInOAuthUrlAction();
      window.location.href = url;
    } catch (err: any) {
      alert(`Erro ao obter login do LinkedIn: ${err.message}`);
    } finally {
      setStudioLoading(false);
    }
  };

  const handlePublishLinkedIn = async (draftId: string) => {
    if (!confirm('Publicar este post imediatamente no seu perfil do LinkedIn?')) return;
    setIsPublishing(true);
    try {
      const result = await publishToLinkedInAction(draftId);
      alert('Post publicado com sucesso no LinkedIn!');
      window.location.reload();
    } catch (err: any) {
      alert(`Erro ao publicar no LinkedIn: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishInstagram = async (draftId: string) => {
    if (!confirm('Publicar este post/Reels imediatamente no seu Instagram?')) return;
    setIsPublishing(true);
    try {
      await publishToInstagramAction(draftId);
      alert('Post publicado com sucesso no Instagram!');
      window.location.reload();
    } catch (err: any) {
      alert(`Erro ao publicar no Instagram: ${err.message}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDisconnect = async () => {
    if (confirm('Tem certeza de que deseja desconectar sua conta do Instagram? As automações pararão de funcionar.')) {
      setLoading(true);
      try {
        await disconnectInstagramAction();
      } catch (e: any) {
        alert(e.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await toggleAutomationAction(id, active);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Excluir esta automação permanentemente?')) {
      try {
        await deleteAutomationAction(id);
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  const handleOpenNew = () => {
    setFormState({
      name: '',
      active: true,
      trigger_comment: true,
      trigger_story: false,
      trigger_dm: false,
      keywords: [],
      match_type: 'contains',
      post_id: null,
      post_permalink: null,
      post_media_url: null,
      public_replies: [],
      welcome_dm: '',
      quick_reply_button: '',
      link_text: '',
      link_button_label: '',
      link_url: '',
      reminder_text: '',
      reminder_delay_minutes: null,
    });
    setRawKeywords('');
    setRawPublicReplies('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (auto: Automation) => {
    setFormState({ ...auto });
    setRawKeywords(auto.keywords.join(', '));
    setRawPublicReplies(auto.public_replies.join('\n'));
    setIsModalOpen(true);
  };

  const handleSelectMedia = (media: any) => {
    setFormState((prev) => ({
      ...prev,
      post_id: media.id,
      post_permalink: media.permalink,
      post_media_url: media.media_url || media.thumbnail_url,
    }));
    setIsMediaSelectorOpen(false);
  };

  const handleClearMedia = () => {
    setFormState((prev) => ({
      ...prev,
      post_id: null,
      post_permalink: null,
      post_media_url: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formState,
        keywords: rawKeywords,
        public_replies: rawPublicReplies,
      };
      await saveAutomationAction(payload);
      setIsModalOpen(false);
    } catch (e: any) {
      alert(`Erro ao salvar: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0c0c0e] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* LEFT SIDEBAR BARRA NAVEGAÇÃO FIXA */}
      <aside className="w-64 border-r border-zinc-800/70 bg-[#09090b] flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none z-40">
        <div className="p-4 space-y-6 overflow-y-auto scrollbar-none">
          
          {/* BRAND LOGO */}
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-xl text-indigo-400">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">CreateFlow</span>
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI OS</span>
              </div>
              <span className="text-[11px] text-zinc-500 block font-medium">Segundo Cérebro & DM</span>
            </div>
          </div>

          {/* BUSCA RÁPIDA ⌘K */}
          <div className="relative">
            <input
              type="text"
              placeholder="Buscar... ⌘K"
              className="w-full bg-[#141416] border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 transition font-mono"
            />
          </div>

          {/* MENU PRINCIPAL */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 block mb-2 font-mono">Plataforma</span>
            
            <button
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('chat'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeMainTab === 'creator_studio' && activeStudioTab === 'chat'
                  ? 'bg-[#18181c] text-white border border-zinc-700/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Brain className="h-4 w-4 text-indigo-400" />
                <span>Segundo Cérebro</span>
              </div>
            </button>

            <button
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('ideas'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeMainTab === 'creator_studio' && activeStudioTab === 'ideas'
                  ? 'bg-[#18181c] text-white border border-zinc-700/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4 text-emerald-400" />
                <span>Banco de Ideias</span>
              </div>
              {ideas.filter(i => i.status === 'idea').length > 0 && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                  {ideas.filter(i => i.status === 'idea').length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('drafts'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeMainTab === 'creator_studio' && activeStudioTab === 'drafts'
                  ? 'bg-[#18181c] text-white border border-zinc-700/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-amber-400" />
                <span>Roteiros & Rascunhos</span>
              </div>
              {drafts.length > 0 && (
                <span className="text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded font-mono">
                  {drafts.length}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('trends'); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeMainTab === 'creator_studio' && activeStudioTab === 'trends'
                  ? 'bg-[#18181c] text-white border border-zinc-700/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="h-4 w-4 text-sky-400" />
                <span>Tendências Virais</span>
              </div>
            </button>

            <button
              onClick={() => setActiveMainTab('automations')}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeMainTab === 'automations'
                  ? 'bg-[#18181c] text-white border border-zinc-700/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <MessageSquare className="h-4 w-4 text-violet-400" />
                <span>Automações de DM</span>
              </div>
              {automations.length > 0 && (
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono border border-indigo-500/30">
                  {automations.length}
                </span>
              )}
            </button>
          </div>

          {/* MENU FERRAMENTAS E CONFIGURAÇÕES */}
          <div className="space-y-1 pt-3 border-t border-zinc-800/60">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-2 block mb-2 font-mono">Estratégia</span>
            
            <button
              onClick={handleGenerateSchedulePlan}
              disabled={isGeneratingSchedule}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
            >
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Cronograma (IA)</span>
            </button>

            <button
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('profile'); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeMainTab === 'creator_studio' && activeStudioTab === 'profile'
                  ? 'bg-[#18181c] text-white border border-zinc-700/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]'
              }`}
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              <span>Marca & Conexões</span>
            </button>
          </div>

        </div>

        {/* FOOTER SIDEBAR COM CONEXÃO E CRÉDITOS */}
        <div className="p-4 border-t border-zinc-800/70 space-y-3 bg-[#09090b]">
          <div className="bg-[#141416] border border-zinc-800/80 p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Motor IA</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Gemini Pro
              </span>
            </div>
            <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 w-full"></div>
            </div>
          </div>

          {config ? (
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5 truncate">
                {config.profile_picture_url ? (
                  <img src={config.profile_picture_url} className="h-7 w-7 rounded-full object-cover border border-indigo-500/40" />
                ) : (
                  <div className="h-7 w-7 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/40">
                    {config.instagram_username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="truncate text-left">
                  <span className="text-xs font-bold text-zinc-200 block truncate">@{config.instagram_username}</span>
                  <span className="text-[10px] text-emerald-400 block font-mono">Conectado</span>
                </div>
              </div>
              <button onClick={handleDisconnect} className="text-zinc-500 hover:text-rose-400 transition p-1">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
            >
              <Instagram className="h-3.5 w-3.5" />
              Conectar Insta
            </button>
          )}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTEÚDO */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-[1550px] space-y-6 bg-[#0a0a0c]">
        
        {/* TOP BAR HEADER REPLICADO 1:1 DA REFERÊNCIA (SEARCH + CTA BUTTON) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-800/60">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Search ideas, scripts, automations..."
              className="w-full bg-[#121215] border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition font-mono"
            />
            <Compass className="h-4 w-4 text-zinc-500 absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              onClick={() => {
                if (activeStudioTab === 'ideas') handleGenerateIdeasWithAI();
                else if (activeStudioTab === 'drafts') handleOpenNewDraft();
                else if (activeMainTab === 'automations') handleOpenNew();
                else handleCreateSession();
              }}
              className="bg-[#141416] hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4 text-indigo-400" />
              <span>
                {activeStudioTab === 'ideas' ? '+ Create idea' :
                 activeStudioTab === 'drafts' ? '+ Create script' :
                 activeMainTab === 'automations' ? '+ Create automation' : '+ New session'}
              </span>
            </button>
          </div>
        </div>

        {activeMainTab === 'automations' ? (
          <>
            {/* PARAMS NOTIFICATIONS */}
            {connectedParam && (
              <div className="bg-emerald-950/30 border border-emerald-800/50 text-emerald-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                <CheckCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">CreateFlow conectado com sucesso ao seu Instagram!</p>
              </div>
            )}
            {errorParam && (
              <div className="bg-red-950/30 border border-red-800/50 text-red-400 p-4 rounded-xl flex items-center gap-3 animate-fade-in">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-medium">Ocorreu um erro: {decodeURIComponent(errorParam)}</p>
              </div>
            )}

            {/* STATUS CARD */}
            {config && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Janela de 24h</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-white">{stats.totalContacts}</span>
                    <span className="text-slate-500 text-xs">Contatos activos</span>
                  </div>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Fila Pendente</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-indigo-400">{stats.pendingQueue}</span>
                    <span className="text-slate-500 text-xs">Aguardando envio</span>
                  </div>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Mensagens Enviadas</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-emerald-400">{stats.sentMessages}</span>
                    <span className="text-slate-500 text-xs">DMs processadas</span>
                  </div>
                </div>
                <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                  <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Falhas</span>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-rose-400">{stats.failedMessages}</span>
                    <span className="text-slate-500 text-xs">Erros registrados</span>
                  </div>
                </div>
              </div>
            )}

            {/* MAIN AUTOMATIONS PANEL */}
            <div className="bg-slate-900/30 border border-slate-900 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Minhas Automações</h2>
                  <p className="text-slate-400 text-sm">Gerencie os gatilhos e fluxos do seu assistente do Instagram.</p>
                </div>
                
                {config && (
                  <button
                    onClick={handleOpenNew}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 transition active:scale-95 self-start"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Automação
                  </button>
                )}
              </div>

              {!config ? (
                <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="bg-slate-900 p-4 rounded-full text-indigo-500">
                    <Instagram className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">Instagram Não Conectado</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Para começar a automatizar seus comentários, Stories e DMs, você precisa conectar sua conta do Instagram Profissional.
                  </p>
                  <button
                    onClick={handleConnect}
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-lg active:scale-95"
                  >
                    Conectar agora
                  </button>
                </div>
              ) : automations.length === 0 ? (
                <div className="border border-dashed border-slate-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center space-y-4">
                  <div className="bg-slate-900 p-4 rounded-full text-slate-500">
                    <Settings className="h-8 w-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-200">Nenhuma Automação Criada</h3>
                  <p className="text-slate-400 text-sm max-w-md mx-auto">
                    Crie sua primeira automação para que as pessoas possam receber seu link ao comentar palavras-chave.
                  </p>
                  <button
                    onClick={handleOpenNew}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition active:scale-95"
                  >
                    Criar Automação
                  </button>
                </div>
              ) : (
                <div className="space-y-8 text-left pt-2">
                  
                  {/* SEÇÃO 1: RECENT AUTOMATIONS [3] */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400 font-mono">Recent automations</span>
                      <span className="text-[10px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                        {Math.min(automations.length, 3)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {automations.slice(0, 3).map((auto) => (
                        <div
                          key={auto.id}
                          className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-mono font-bold">
                              ⚡
                            </div>
                            <button
                              onClick={() => handleOpenEdit(auto)}
                              className="text-zinc-600 hover:text-zinc-300 font-mono text-sm p-1 transition"
                              title="Edit"
                            >
                              •••
                            </button>
                          </div>

                          <div className="space-y-1 my-auto">
                            <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{auto.name}</h4>
                            <p className="text-[11px] font-mono text-zinc-500 truncate">
                              instagram • {auto.match_type === 'any' ? 'any msg' : auto.keywords.join(', ')} • DM
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                            <span className="text-zinc-500">Created Jun 12</span>
                            <span className={`font-bold ${auto.active ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {auto.active ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SEÇÃO 2: ALL AUTOMATIONS [N] */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-400 font-mono">All automations</span>
                      <span className="text-[10px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                        {automations.length}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {automations.map((auto) => (
                        <div
                          key={auto.id}
                          className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-mono font-bold">
                              ⚡
                            </div>
                            <button
                              onClick={() => handleOpenEdit(auto)}
                              className="text-zinc-600 hover:text-zinc-300 font-mono text-sm p-1 transition"
                              title="Edit"
                            >
                              •••
                            </button>
                          </div>

                          <div className="space-y-1 my-auto">
                            <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{auto.name}</h4>
                            <p className="text-[11px] font-mono text-zinc-500 truncate">
                              instagram • {auto.match_type === 'any' ? 'any msg' : auto.keywords.join(', ')} • DM
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                            <span className="text-zinc-500">Created Jun 12</span>
                            <span className={`font-bold ${auto.active ? 'text-emerald-400' : 'text-zinc-500'}`}>
                              {auto.active ? 'Active' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>
          </>
        ) : (
          /* ESTÚDIO DE CRIAÇÃO UI PREMIUM */
          <div className="space-y-6 animate-fade-in">
            
            {/* SUB-ABAS DO ESTÚDIO */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#121215] border border-zinc-800/80 rounded-2xl w-full shadow-sm">
              <button
                onClick={() => setActiveStudioTab('chat')}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  activeStudioTab === 'chat'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Brain className="h-4 w-4 shrink-0" />
                Segundo Cérebro
              </button>
              <button
                onClick={() => setActiveStudioTab('trends')}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  activeStudioTab === 'trends'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Compass className="h-4 w-4 shrink-0" />
                Analisar Tendências
              </button>
              <button
                onClick={() => setActiveStudioTab('ideas')}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  activeStudioTab === 'ideas'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Layers className="h-4 w-4 shrink-0" />
                Banco de Ideias
              </button>
              <button
                onClick={() => setActiveStudioTab('drafts')}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  activeStudioTab === 'drafts'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <FileText className="h-4 w-4 shrink-0" />
                Roteiros & Rascunhos
              </button>
              <button
                onClick={() => setActiveStudioTab('profile')}
                className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${
                  activeStudioTab === 'profile'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
                }`}
              >
                <Settings className="h-4 w-4 shrink-0" />
                Marca & Conexões
              </button>

              <button
                type="button"
                onClick={handleGenerateSchedulePlan}
                disabled={isGeneratingSchedule}
                className="ml-auto py-2 px-3.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                {isGeneratingSchedule ? 'Gerando Plano...' : '📅 Cronograma Semanal (IA)'}
              </button>
            </div>

            {/* CONTEÚDO DE ACORDO COM A SUB-ABA */}
            
            {/* 1. SEGUNDO CÉREBRO (CHAT) */}
            {activeStudioTab === 'chat' && (
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-[#121215]/90 border border-zinc-800/80 rounded-3xl p-6 min-h-[640px] shadow-2xl backdrop-blur-xl">
                {/* BARRA LATERAL: BRAINSTORMS */}
                <div className="lg:col-span-1 border-r border-zinc-800/80 pr-4 flex flex-col space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Brainstorms</span>
                    <button
                      onClick={handleCreateSession}
                      className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
                      title="Nova sessão"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Novo
                    </button>
                  </div>
                  
                  <div className="space-y-1.5 overflow-y-auto max-h-[520px] scrollbar-thin">
                    {sessions.length === 0 ? (
                      <div className="text-center p-6 text-zinc-500 text-xs italic">Nenhuma conversa iniciada</div>
                    ) : (
                      sessions.map((s) => (
                        <div
                          key={s.id}
                          onClick={() => setActiveSessionId(s.id)}
                          className={`w-full text-left p-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-2 group border ${
                            activeSessionId === s.id
                              ? 'bg-indigo-600/10 text-indigo-300 border-indigo-500/30 shadow-sm'
                              : 'hover:bg-zinc-800/50 text-zinc-400 border-transparent hover:text-zinc-200'
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <MessageSquare className="h-4 w-4 shrink-0 text-zinc-500 group-hover:text-indigo-400" />
                            <span className="text-xs font-semibold truncate">{s.title}</span>
                          </div>
                          <button
                            onClick={(e) => handleDeleteSession(s.id, e)}
                            className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1 rounded-lg hover:bg-rose-500/10"
                            title="Excluir"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* PAINEL CENTRAL DO CHAT */}
                <div className="lg:col-span-3 flex flex-col justify-between min-h-[560px]">
                  {!activeSessionId ? (
                    <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-6">
                      <div className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl text-indigo-400 shadow-inner">
                        <Brain className="h-12 w-12 animate-pulse text-indigo-400" />
                      </div>
                      <div className="space-y-2 max-w-md">
                        <h4 className="text-lg font-bold text-white tracking-tight">Segundo Cérebro Digital</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Alimentado com o **Nicho, Público-Alvo e Tom de Voz** da sua marca. Clique em um dos atalhos abaixo ou inicie uma conversa para criar posts estratégicos.
                        </p>
                      </div>

                      {/* PROMPTS INICIAIS RÁPIDOS */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl text-left">
                        {[
                          { title: '🚀 3 Ganchos Virais', prompt: 'Crie 3 ganchos virais irresistíveis para o meu nicho de mercado.' },
                          { title: '📝 Post para LinkedIn', prompt: 'Escreva um post estruturado e autêntico para o meu LinkedIn sobre superação de desafios.' },
                          { title: '🎬 Roteiro de Reels/TikTok', prompt: 'Escreva um roteiro dinâmico de Reels em 3 cenas com falas e indicações visuais.' },
                          { title: '📅 Estratégia da Semana', prompt: 'Qual é a melhor ordem de postagens para esta semana baseada no meu público?' }
                        ].map((starter, i) => (
                          <button
                            key={i}
                            onClick={async () => {
                              try {
                                const newSession = await createChatSessionAction(starter.title);
                                setSessions((prev) => [newSession, ...prev]);
                                setActiveSessionId(newSession.id);
                                setInputMessage(starter.prompt);
                              } catch (e: any) {
                                alert(e.message);
                              }
                            }}
                            className="p-3.5 bg-[#18181c] border border-zinc-800 hover:border-indigo-500/50 rounded-2xl text-left transition hover:bg-zinc-800/40 group space-y-1"
                          >
                            <span className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400 transition block">{starter.title}</span>
                            <span className="text-[11px] text-zinc-500 line-clamp-1 block">{starter.prompt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* HISTÓRICO DE MENSAGENS */}
                      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4 scrollbar-thin flex flex-col">
                        {messages.length === 0 ? (
                          <div className="text-center p-12 text-zinc-500 text-xs italic my-auto space-y-3">
                            <Sparkles className="h-8 w-8 mx-auto text-indigo-400 animate-bounce" />
                            <p>O cérebro está pronto. O que você gostaria de criar ou analisar agora?</p>
                          </div>
                        ) : (
                          messages.map((m) => (
                            <div
                              key={m.id}
                              className={`flex gap-3 max-w-[88%] ${
                                m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                              }`}
                            >
                              <div
                                className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold border ${
                                  m.role === 'user'
                                    ? 'bg-zinc-800 text-zinc-200 border-zinc-700'
                                    : 'bg-indigo-600/20 text-indigo-300 border-indigo-500/30'
                                }`}
                              >
                                {m.role === 'user' ? 'U' : 'IA'}
                              </div>
                              <div className="space-y-2 text-left">
                                <div
                                  className={`p-4 rounded-2xl text-xs leading-relaxed shadow-md ${
                                    m.role === 'user'
                                      ? 'bg-indigo-600 text-white rounded-tr-none font-medium'
                                      : 'bg-[#18181c] border border-zinc-800 text-zinc-200 rounded-tl-none whitespace-pre-wrap'
                                  }`}
                                >
                                  {m.content}
                                </div>
                                {m.role === 'model' && (
                                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 font-medium ml-1">
                                    <button
                                      onClick={() => handleSaveChatMessageAsIdea(m.content)}
                                      className="flex items-center gap-1 hover:text-indigo-400 transition"
                                    >
                                      <Brain className="h-3.5 w-3.5 text-indigo-400" />
                                      Salvar como Ideia
                                    </button>
                                    <span className="text-zinc-700">•</span>
                                    <button
                                      onClick={() => handleSaveChatMessageAsDraft(m.content)}
                                      className="flex items-center gap-1 hover:text-indigo-400 transition"
                                    >
                                      <FileText className="h-3.5 w-3.5 text-indigo-400" />
                                      Escrever Post
                                    </button>
                                    <span className="text-zinc-700">•</span>
                                    <button
                                      onClick={() => copyToClipboard(m.content)}
                                      className="flex items-center gap-1 hover:text-indigo-400 transition"
                                    >
                                      <Copy className="h-3.5 w-3.5" />
                                      Copiar
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                        {isSendingMessage && (
                          <div className="flex gap-3 max-w-[85%] mr-auto">
                            <div className="h-8 w-8 rounded-full bg-indigo-600/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30 animate-pulse">
                              IA
                            </div>
                            <div className="bg-[#18181c] border border-zinc-800 text-zinc-400 p-4 rounded-2xl rounded-tl-none text-xs flex items-center gap-2">
                              <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                              <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                              <span className="h-2 w-2 bg-indigo-400 rounded-full animate-bounce"></span>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* ENTRADA DE MENSAGEM */}
                      <form onSubmit={handleSendMessage} className="flex gap-2 bg-[#09090b] border border-zinc-800 p-2 rounded-2xl focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/10 transition">
                        <input
                          type="text"
                          value={inputMessage}
                          onChange={(e) => setInputMessage(e.target.value)}
                          placeholder="Fale com o seu segundo cérebro (Ex: Crie um roteiro em 3 passos para Reels)..."
                          className="flex-1 bg-transparent px-3 text-xs text-white focus:outline-none placeholder-zinc-500"
                        />
                        <button
                          type="submit"
                          disabled={!inputMessage.trim() || isSendingMessage}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          Enviar
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* 2. ANALISADOR DE TENDÊNCIAS */}
            {activeStudioTab === 'trends' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* COLUNA ESQUERDA: DESCONSTRUTOR */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4 backdrop-blur-md">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Compass className="h-4 w-4 text-indigo-400 animate-pulse" />
                      Engenharia Reversa de Posts
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Viu um post com muito engajamento no LinkedIn ou Instagram? Cole o texto completo dele abaixo. O Gemini analisará a estrutura mental por trás e extrairá um template reutilizável para você.
                    </p>
                    <form onSubmit={handleAnalyzeTrend} className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Post de Sucesso original</label>
                        <textarea
                          rows={8}
                          value={trendText}
                          onChange={(e) => setTrendText(e.target.value)}
                          placeholder="Cole o texto bruto do post aqui..."
                          className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition duration-300 font-sans leading-relaxed"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isAnalyzingTrend || !trendText.trim()}
                        className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-900 disabled:text-slate-650 text-white rounded-xl text-xs font-bold transition duration-300 flex items-center justify-center gap-2"
                      >
                        {isAnalyzingTrend ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Decompondo Estrutura...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            Analisar e Decompor
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* COLUNA CENTRAL/DIREITA: RESULTADOS & TEMPLATES */}
                <div className="lg:col-span-2 space-y-6">
                  {/* RESULTADO DA ANÁLISE ATUAL */}
                  {analyzedResult && (
                    <div className="bg-slate-900/30 border border-indigo-500/20 rounded-3xl p-6 space-y-5 animate-fade-in shadow-xl">
                      <div className="flex items-center justify-between border-b border-slate-900 pb-4">
                        <h4 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                          <Sparkles className="h-4 w-4 text-indigo-400" />
                          {analyzedResult.title}
                        </h4>
                        <button
                          onClick={handleSaveTemplate}
                          className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition duration-300 flex items-center gap-1 shadow-md shadow-indigo-500/10"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Salvar Template
                        </button>
                      </div>

                      <div className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 text-left">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block mb-1">🪝 O Gancho (Hook)</span>
                            <p className="text-slate-300 leading-relaxed">{analyzedResult.hook}</p>
                          </div>
                          <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 text-left">
                            <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block mb-1">🏗️ Estrutura de Retenção</span>
                            <p className="text-slate-300 leading-relaxed">{analyzedResult.structure}</p>
                          </div>
                        </div>
                        <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-900 text-left">
                          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block mb-1">💡 Aprendizados Chave</span>
                          <p className="text-slate-300 leading-relaxed">{analyzedResult.key_takeaways}</p>
                        </div>
                        <div className="space-y-1.5 text-left">
                          <span className="font-bold text-slate-400 uppercase tracking-widest text-[9px] block ml-1">📝 Template Reutilizável com Placeholders</span>
                          <div className="bg-slate-950 border border-slate-900 p-4 rounded-2xl font-mono text-[10px] text-emerald-400 whitespace-pre-wrap leading-relaxed shadow-inner">
                            {analyzedResult.reusable_template}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* BIBLIOTECA DE TEMPLATES */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                      <Layers className="h-4 w-4 text-indigo-400" />
                      Modelos Desconstruídos Salvos ({localTemplates.length})
                    </h4>
                    
                    {localTemplates.length === 0 ? (
                      <div className="bg-slate-900/10 border border-slate-900 rounded-3xl p-10 text-center text-xs text-slate-500 italic">
                        Nenhum modelo de escrita na biblioteca de tendências. Cole um post à esquerda para começar.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {localTemplates.map((t) => (
                          <div key={t.id} className="bg-slate-900/20 border border-slate-900/60 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-800 transition duration-300 group">
                            <div className="space-y-2 text-left">
                              <div className="flex items-start justify-between gap-2">
                                <h5 className="text-xs font-bold text-white truncate">{t.title}</h5>
                                <button
                                  onClick={() => handleDeleteTemplate(t.id)}
                                  className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition duration-300 p-1.5 rounded-lg hover:bg-red-500/10"
                                  title="Deletar modelo"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                              <p className="text-[10px] text-slate-400 line-clamp-3 bg-slate-950/40 p-3 rounded-xl font-mono leading-relaxed border border-slate-950">
                                {t.reusable_template}
                              </p>
                            </div>
                            <button
                              onClick={() => handleOpenDraftFromTemplate(t)}
                              className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/20 text-indigo-400 rounded-xl text-[10px] font-bold transition duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Usar este Modelo
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 3. BANCO DE IDEIAS (1:1 RÉPLICA DO PAINEL DE AGENTES DA REFERÊNCIA) */}
            {activeStudioTab === 'ideas' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* BARRA SUPERIOR E FORMULARIO DE INGESTÃO RÁPIDA */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121215] border border-zinc-800/80 p-4 rounded-2xl">
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <Layers className="h-4 w-4 text-emerald-400" />
                      Captura & Ingestão de Ideias
                    </h3>
                    <p className="text-xs text-zinc-400">Digite um insight rápido ou peça sugestões ao Segundo Cérebro.</p>
                  </div>

                  <form onSubmit={handleSaveIdea} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                    <input
                      type="text"
                      required
                      value={ideaForm.title}
                      onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                      placeholder="Título ou insight..."
                      className="bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono w-full sm:w-72"
                    />
                    <input
                      type="text"
                      value={ideaForm.pillar}
                      onChange={(e) => setIdeaForm({ ...ideaForm, pillar: e.target.value })}
                      placeholder="Pilar/Canal"
                      className="bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono w-28"
                    />
                    <button
                      type="submit"
                      disabled={studioLoading}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold transition shrink-0"
                    >
                      + Save Idea
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateIdeasWithAI}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      + AI Brainstorm
                    </button>
                  </form>
                </div>

                {/* SEÇÃO 1: RECENT IDEAS [3] */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 font-mono">Recent ideas</span>
                    <span className="text-[10px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                      {Math.min(ideas.filter(i => i.status === 'idea').length, 3)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {ideas.filter(i => i.status === 'idea').slice(0, 3).map((idea) => (
                      <div
                        key={idea.id}
                        className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
                            💡
                          </div>
                          <button
                            onClick={() => handleDeleteIdea(idea.id)}
                            className="text-zinc-600 hover:text-rose-400 font-mono text-sm p-1 transition"
                            title="Excluir"
                          >
                            •••
                          </button>
                        </div>

                        <div className="space-y-1 my-auto">
                          <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-emerald-300 transition">{idea.title}</h4>
                          <p className="text-[11px] font-mono text-zinc-500 truncate">
                            {idea.pillar ? `${creatorProfile?.niche?.toLowerCase() || 'nicho'} • ${idea.pillar.toLowerCase()} • ideia` : 'nicho • geral • ideia'}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                          <span className="text-zinc-500">Created {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                          <button
                            onClick={() => handleOpenDraftFromIdea(idea)}
                            className="text-emerald-400 font-bold hover:underline"
                          >
                            Active
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEÇÃO 2: ALL IDEAS [N] */}
                <div className="space-y-4 text-left pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 font-mono">All ideas</span>
                    <span className="text-[10px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                      {ideas.filter(i => i.status === 'idea').length}
                    </span>
                  </div>

                  {ideas.filter(i => i.status === 'idea').length === 0 ? (
                    <div className="bg-[#111114] border border-zinc-800/80 rounded-xl p-16 text-center text-xs text-zinc-500 font-mono">
                      No ideas captured yet. Use the bar above to add your first idea!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {ideas.filter(i => i.status === 'idea').map((idea) => (
                        <div
                          key={idea.id}
                          className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-mono font-bold">
                              💡
                            </div>
                            <button
                              onClick={() => handleDeleteIdea(idea.id)}
                              className="text-zinc-600 hover:text-rose-400 font-mono text-sm p-1 transition"
                              title="Excluir"
                            >
                              •••
                            </button>
                          </div>

                          <div className="space-y-1 my-auto">
                            <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-emerald-300 transition">{idea.title}</h4>
                            <p className="text-[11px] font-mono text-zinc-500 truncate">
                              {idea.pillar ? `${creatorProfile?.niche?.toLowerCase() || 'nicho'} • ${idea.pillar.toLowerCase()} • ideia` : 'nicho • geral • ideia'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                            <span className="text-zinc-500">Created {new Date(idea.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                            <button
                              onClick={() => handleOpenDraftFromIdea(idea)}
                              className="text-emerald-400 font-bold hover:underline"
                            >
                              Active
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 4. ROTEIROS & RASCUNHOS (1:1 RÉPLICA DA IMAGEM DE REFERÊNCIA) */}
            {activeStudioTab === 'drafts' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* CONTROLES E FILTROS */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121215] border border-zinc-800/80 p-4 rounded-2xl">
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <FileText className="h-4 w-4 text-amber-400" />
                      Filtro de Conteúdos & Roteiros
                    </h3>
                    <p className="text-xs text-zinc-400">Filtre por canal de publicação ou estado do post.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={filterPlatform}
                      onChange={(e) => setFilterPlatform(e.target.value)}
                      className="bg-[#09090b] border border-zinc-800 text-zinc-400 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-zinc-600 font-mono"
                    >
                      <option value="all">Todas as Redes</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="bg-[#09090b] border border-zinc-800 text-zinc-400 text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-zinc-600 font-mono"
                    >
                      <option value="all">Todos os Status</option>
                      <option value="draft">Rascunhos</option>
                      <option value="ready">Prontos para Postar</option>
                      <option value="published">Publicados</option>
                    </select>

                    <button
                      onClick={handleOpenNewDraft}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      + Create script
                    </button>
                  </div>
                </div>

                {/* SEÇÃO 1: RECENT SCRIPTS [3] */}
                <div className="space-y-4 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 font-mono">Recent scripts</span>
                    <span className="text-[10px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                      {Math.min(drafts.filter(d => 
                        (filterPlatform === 'all' || d.platform === filterPlatform) &&
                        (filterStatus === 'all' || d.status === filterStatus)
                      ).length, 3)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {drafts.filter(d => 
                      (filterPlatform === 'all' || d.platform === filterPlatform) &&
                      (filterStatus === 'all' || d.status === filterStatus)
                    ).slice(0, 3).map((draft) => (
                      <div
                        key={draft.id}
                        className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                      >
                        <div className="flex items-center justify-between">
                          <div className={`h-8 w-8 rounded-lg border flex items-center justify-center text-xs font-mono font-bold ${
                            draft.platform === 'linkedin' ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' :
                            draft.platform === 'instagram' ? 'bg-pink-600/10 text-pink-400 border-pink-500/20' :
                            'bg-purple-600/10 text-purple-400 border-purple-500/20'
                          }`}>
                            {draft.platform === 'linkedin' ? 'in' : draft.platform === 'instagram' ? 'ig' : 'tt'}
                          </div>
                          <button
                            onClick={() => handleOpenEditDraft(draft)}
                            className="text-zinc-600 hover:text-zinc-300 font-mono text-sm p-1 transition"
                            title="Edit"
                          >
                            •••
                          </button>
                        </div>

                        <div className="space-y-1 my-auto">
                          <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{draft.title}</h4>
                          <p className="text-[11px] font-mono text-zinc-500 truncate">
                            {draft.platform} • {draft.format} • {draft.status}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                          <span className="text-zinc-500">Created {new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                          <span className={`font-bold ${
                            draft.status === 'published' ? 'text-emerald-400' :
                            draft.status === 'ready' ? 'text-amber-400' : 'text-purple-400'
                          }`}>
                            {draft.status === 'published' ? 'Active' : draft.status === 'ready' ? 'Ready' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SEÇÃO 2: ALL SCRIPTS [N] */}
                <div className="space-y-4 text-left pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-zinc-400 font-mono">All scripts</span>
                    <span className="text-[10px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                      {drafts.filter(d => 
                        (filterPlatform === 'all' || d.platform === filterPlatform) &&
                        (filterStatus === 'all' || d.status === filterStatus)
                      ).length}
                    </span>
                  </div>

                  {drafts.filter(d => 
                    (filterPlatform === 'all' || d.platform === filterPlatform) &&
                    (filterStatus === 'all' || d.status === filterStatus)
                  ).length === 0 ? (
                    <div className="bg-[#111114] border border-zinc-800/80 rounded-xl p-16 text-center text-xs text-zinc-500 font-mono">
                      No scripts found. Click "+ Create script" above to create one!
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {drafts.filter(d => 
                        (filterPlatform === 'all' || d.platform === filterPlatform) &&
                        (filterStatus === 'all' || d.status === filterStatus)
                      ).map((draft) => (
                        <div
                          key={draft.id}
                          className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                        >
                          <div className="flex items-center justify-between">
                            <div className={`h-8 w-8 rounded-lg border flex items-center justify-center text-xs font-mono font-bold ${
                              draft.platform === 'linkedin' ? 'bg-blue-600/10 text-blue-400 border-blue-500/20' :
                              draft.platform === 'instagram' ? 'bg-pink-600/10 text-pink-400 border-pink-500/20' :
                              'bg-purple-600/10 text-purple-400 border-purple-500/20'
                            }`}>
                              {draft.platform === 'linkedin' ? 'in' : draft.platform === 'instagram' ? 'ig' : 'tt'}
                            </div>
                            <button
                              onClick={() => handleOpenEditDraft(draft)}
                              className="text-zinc-600 hover:text-zinc-300 font-mono text-sm p-1 transition"
                              title="Edit"
                            >
                              •••
                            </button>
                          </div>

                          <div className="space-y-1 my-auto">
                            <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{draft.title}</h4>
                            <p className="text-[11px] font-mono text-zinc-500 truncate">
                              {draft.platform} • {draft.format} • {draft.status}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                            <span className="text-zinc-500">Created {new Date(draft.created_at).toLocaleDateString('en-US', { month: 'short', day: '2-digit' })}</span>
                            <span className={`font-bold ${
                              draft.status === 'published' ? 'text-emerald-400' :
                              draft.status === 'ready' ? 'text-amber-400' : 'text-purple-400'
                            }`}>
                              {draft.status === 'published' ? 'Active' : draft.status === 'ready' ? 'Ready' : 'Draft'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 5. MARCA, NICHO & CONEXÕES */}
            {activeStudioTab === 'profile' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* DEFINIÇÕES DE PERSONA */}
                <div className="lg:col-span-2">
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-6 backdrop-blur-md">
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Identidade de Marca</h3>
                      <p className="text-xs text-slate-400">Personalize o contexto estratégico usado na criação inteligente de conteúdo.</p>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nicho de Atuação *</label>
                          <input
                            type="text"
                            required
                            value={profileForm.niche}
                            onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })}
                            placeholder="Ex: Marketing para PMEs, Nutrição Esportiva"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Público-Alvo *</label>
                          <input
                            type="text"
                            required
                            value={profileForm.target_audience}
                            onChange={(e) => setProfileForm({ ...profileForm, target_audience: e.target.value })}
                            placeholder="Ex: Empreendedores que faturam até R$ 50k"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Objetivos do Perfil *</label>
                          <input
                            type="text"
                            required
                            value={profileForm.objectives}
                            onChange={(e) => setProfileForm({ ...profileForm, objectives: e.target.value })}
                            placeholder="Ex: Obter leads para mentoria, criar autoridade"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>
                        <div className="space-y-1 text-left">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tom de Voz *</label>
                          <input
                            type="text"
                            required
                            value={profileForm.voice_tone}
                            onChange={(e) => setProfileForm({ ...profileForm, voice_tone: e.target.value })}
                            placeholder="Ex: Prático, enérgico, direto ao ponto, sincero"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pilares de Conteúdo (Separados por vírgula)</label>
                        <input
                          type="text"
                          value={profileForm.content_pillars}
                          onChange={(e) => setProfileForm({ ...profileForm, content_pillars: e.target.value })}
                          placeholder="Ex: Estratégias de Vendas, Cases de Sucesso, Hacks de Produtividade"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                        />
                      </div>

                      <div className="pt-2 text-left">
                        <button
                          type="submit"
                          disabled={studioLoading}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow"
                        >
                          {studioLoading ? 'Salvando...' : 'Salvar Diretrizes de Marca'}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* CONEXÕES COM REDES SOCIAIS */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4 backdrop-blur-md">
                    <div className="text-left">
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <Link className="h-4 w-4 text-indigo-400" />
                        Conectar Redes Sociais
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Habilite a postagem direta dos seus roteiros de conteúdo aprovados do estúdio de criação.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {/* INSTAGRAM BUSINESS CONNECTION */}
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Image className="h-4.5 w-4.5 text-pink-400" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">Instagram Business</p>
                            <p className="text-[10px] text-slate-500">
                              {config?.instagram_username ? `@${config.instagram_username}` : 'Desconectado'}
                            </p>
                          </div>
                        </div>
                        {config?.instagram_username ? (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">Ativo</span>
                        ) : (
                          <span className="text-[9px] font-bold text-slate-500 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md uppercase tracking-wider">Pendente</span>
                        )}
                      </div>

                      {/* LINKEDIN PROFILE CONNECTION */}
                      <div className="p-4 bg-slate-950 rounded-2xl border border-slate-900 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4.5 w-4.5 text-blue-450" />
                          <div className="text-left">
                            <p className="text-xs font-bold text-white">LinkedIn Perfil</p>
                            <p className="text-[10px] text-slate-500">
                              {config?.linkedin_name ? config.linkedin_name : 'Desconectado'}
                            </p>
                          </div>
                        </div>
                        {config?.linkedin_name ? (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider">Ativo</span>
                        ) : (
                          <button
                            onClick={handleConnectLinkedIn}
                            className="text-[9px] font-bold bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg transition duration-300 uppercase tracking-wider shadow-sm shadow-blue-500/10"
                          >
                            Conectar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        )}

      </main>

      {/* FORM DRAWER/MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between shadow-2xl space-y-6">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {formState.id ? 'Editar Automação' : 'Criar Automação'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure os gatilhos e a resposta da sua campanha.</p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. Nome */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Nome da Automação *
                  </label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Ex: Campanha de Lançamento Ebook"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* 2. Gatilhos */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Gatilhos de Disparo
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <label
                      className={`flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer select-none transition ${
                        formState.trigger_comment
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formState.trigger_comment}
                        onChange={(e) =>
                          setFormState({ ...formState, trigger_comment: e.target.checked })
                        }
                        className="hidden"
                      />
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-xs font-medium">Comentário</span>
                    </label>

                    <label
                      className={`flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer select-none transition ${
                        formState.trigger_story
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formState.trigger_story}
                        onChange={(e) =>
                          setFormState({ ...formState, trigger_story: e.target.checked })
                        }
                        className="hidden"
                      />
                      <Image className="h-5 w-5" />
                      <span className="text-xs font-medium">Stories</span>
                    </label>

                    <label
                      className={`flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer select-none transition ${
                        formState.trigger_dm
                          ? 'border-indigo-500 bg-indigo-500/5 text-indigo-400'
                          : 'border-slate-800 bg-slate-950/40 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formState.trigger_dm}
                        onChange={(e) =>
                          setFormState({ ...formState, trigger_dm: e.target.checked })
                        }
                        className="hidden"
                      />
                      <Instagram className="h-5 w-5" />
                      <span className="text-xs font-medium">Mensagem</span>
                    </label>
                  </div>
                </div>

                {/* 3. Seletor de post específico se Comentário ativo */}
                {formState.trigger_comment && (
                  <div className="space-y-2 p-4 bg-slate-950/40 border border-slate-800 rounded-xl">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Restringir a um Post específico?
                      </span>
                      {formState.post_id ? (
                        <button
                          type="button"
                          onClick={handleClearMedia}
                          className="text-xs text-rose-400 hover:underline"
                        >
                          Limpar seleção
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsMediaSelectorOpen(true)}
                          className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                        >
                          <Search className="h-3 w-3" />
                          Selecionar Post
                        </button>
                      )}
                    </div>

                    {formState.post_id ? (
                      <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800 mt-2">
                        {formState.post_media_url ? (
                          <img
                            src={formState.post_media_url}
                            alt="Post selecionado"
                            className="h-12 w-12 rounded object-cover"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-slate-800 flex items-center justify-center rounded">
                            <Image className="h-5 w-5 text-slate-500" />
                          </div>
                        )}
                        <div className="flex-1 overflow-hidden">
                          <span className="text-xs text-slate-400 block font-semibold">Post Selecionado</span>
                          <span className="text-xs text-slate-500 truncate block">
                            ID: {formState.post_id}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 mt-1">
                        Deixe vazio para acionar em qualquer publicação da sua conta.
                      </p>
                    )}
                  </div>
                )}

                {/* 4. Palavras-chave */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Palavras-chave *
                    </label>
                    <select
                      value={formState.match_type}
                      onChange={(e: any) =>
                        setFormState({ ...formState, match_type: e.target.value })
                      }
                      className="bg-slate-950 border border-slate-800 text-xs rounded-lg px-2 py-1 text-slate-300"
                    >
                      <option value="contains">Contém</option>
                      <option value="exact">Exato</option>
                      <option value="any">Qualquer mensagem</option>
                    </select>
                  </div>
                  {formState.match_type !== 'any' && (
                    <input
                      type="text"
                      required
                      value={rawKeywords}
                      onChange={(e) => setRawKeywords(e.target.value)}
                      placeholder="Ex: ebook, quero, link (separadas por vírgula)"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                  )}
                </div>

                {/* 5. Mensagem de boas-vindas */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mensagem de Boas-vindas (DM) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formState.welcome_dm}
                    onChange={(e) => setFormState({ ...formState, welcome_dm: e.target.value })}
                    placeholder="Olá! Obrigado pelo interesse. Toque no botão abaixo para receber o material."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                  />
                </div>

                {/* 6. Botão de resposta rápida */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rótulo do Botão de Resposta Rápida (Abre a janela de 24h)
                  </label>
                  <input
                    type="text"
                    value={formState.quick_reply_button || ''}
                    onChange={(e) =>
                      setFormState({ ...formState, quick_reply_button: e.target.value })
                    }
                    placeholder="Ex: Enviar link!"
                    maxLength={20}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                  />
                  <p className="text-xs text-slate-500">
                    Importante: A Meta exige que o usuário responda/interaja para podermos enviar links. O clique neste botão conta como resposta.
                  </p>
                </div>

                {/* 7. Link de Destino (Texto + Rótulo + URL) */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                    <Link className="h-4 w-4 text-indigo-400" />
                    Mensagem subsequente com Link
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Texto da mensagem
                      </label>
                      <input
                        type="text"
                        value={formState.link_text || ''}
                        onChange={(e) => setFormState({ ...formState, link_text: e.target.value })}
                        placeholder="Ex: Aqui está seu link especial de acesso!"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Rótulo do botão
                      </label>
                      <input
                        type="text"
                        value={formState.link_button_label || ''}
                        onChange={(e) =>
                          setFormState({ ...formState, link_button_label: e.target.value })
                        }
                        placeholder="Ex: Baixar Ebook"
                        maxLength={20}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        URL do link
                      </label>
                      <input
                        type="url"
                        value={formState.link_url || ''}
                        onChange={(e) => setFormState({ ...formState, link_url: e.target.value })}
                        placeholder="https://meusite.com/download"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 8. Lembrete (Reminder) */}
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 space-y-4">
                  <h4 className="text-sm font-bold text-slate-300 flex items-center gap-1.5">
                    <Clock className="h-4 w-4 text-indigo-400" />
                    Lembrete de Acompanhamento (Opcional)
                  </h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Mensagem do lembrete
                      </label>
                      <textarea
                        rows={2}
                        value={formState.reminder_text || ''}
                        onChange={(e) => setFormState({ ...formState, reminder_text: e.target.value })}
                        placeholder="Ex: Vi que você ainda não baixou o ebook. Caso tenha dúvidas, me mande uma mensagem!"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Atraso para envio (minutos)
                      </label>
                      <input
                        type="number"
                        value={formState.reminder_delay_minutes || ''}
                        onChange={(e) =>
                          setFormState({
                            ...formState,
                            reminder_delay_minutes: e.target.value ? parseInt(e.target.value, 10) : null,
                          })
                        }
                        placeholder="Ex: 15"
                        min={1}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {/* 9. Respostas Públicas de Comentários */}
                {formState.trigger_comment && (
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Variações de Resposta Pública (Uma por linha)
                    </label>
                    <textarea
                      rows={3}
                      value={rawPublicReplies}
                      onChange={(e) => setRawPublicReplies(e.target.value)}
                      placeholder="Te enviei o link no direct!&#10;Dá uma olhada nas suas DMs!&#10;Acabei de enviar, confere o direct!"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
                    />
                    <p className="text-xs text-slate-500">
                      O sistema sorteará uma dessas respostas de forma aleatória para responder ao comentário de forma natural no seu post.
                    </p>
                  </div>
                )}

                {/* SUBMIT BUTTON */}
                <div className="border-t border-slate-800 pt-6 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm active:scale-95 disabled:opacity-50"
                  >
                    {loading ? 'Salvando...' : 'Salvar Automação'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* 1. MODAL DE SUGESTÕES DE IDEIAS DA IA */}
      {showAiSuggestionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <div>
                  <h4 className="text-base font-bold text-white">Ideias Sugeridas por IA</h4>
                  <p className="text-xs text-slate-500">Adicione as ideias que gostar ao seu banco de ideias.</p>
                </div>
              </div>
              <button
                onClick={() => setShowAiSuggestionsModal(false)}
                className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {isAiSuggestionsLoading ? (
                <div className="text-center py-12 space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="text-sm text-slate-400">Analisando sua estratégia e gerando ideias inovadoras...</p>
                </div>
              ) : aiSuggestions.length === 0 ? (
                <p className="text-center text-slate-500 py-6 text-sm">Nenhuma sugestão encontrada.</p>
              ) : (
                <div className="space-y-4">
                  {aiSuggestions.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-4"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-semibold uppercase">
                            {item.platform}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-full font-medium">
                            {item.format}
                          </span>
                          {item.pillar && (
                            <span className="text-[10px] text-slate-500">
                              • Pilar: {item.pillar}
                            </span>
                          )}
                        </div>
                        <h5 className="font-bold text-white text-sm">{item.title}</h5>
                        <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                      </div>
                      <button
                        onClick={() => handleAddAiIdeaToBacklog(item)}
                        className="sm:self-center bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg shrink-0 transition"
                      >
                        + Salvar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-right">
              <button
                onClick={() => setShowAiSuggestionsModal(false)}
                className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white transition rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 2. DRAWER/MODAL DE EDITAR RASCUNHO & GERAR SCRIPT IA */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full overflow-y-auto p-6 md:p-8 flex flex-col justify-between shadow-2xl space-y-6">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {draftForm.id ? 'Editar Roteiro/Post' : 'Escrever Roteiro/Post'}
                  </h3>
                  <p className="text-xs text-slate-400">Estruture o conteúdo para suas redes sociais.</p>
                </div>
                <button
                  onClick={() => setIsDraftModalOpen(false)}
                  className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDraft} className="space-y-6">
                
                {/* Título */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Título do Post *
                  </label>
                  <input
                    type="text"
                    required
                    value={draftForm.title}
                    onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
                    placeholder="Ex: Guia rápido de automação para Instagram"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                  />
                </div>

                {/* Plataforma e Formato */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Rede Social *
                    </label>
                    <select
                      value={draftForm.platform}
                      onChange={(e) => handlePlatformChange(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    >
                      <option value="instagram">Instagram</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="tiktok">TikTok</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Formato *
                    </label>
                    <select
                      value={draftForm.format}
                      onChange={(e) => setDraftForm({ ...draftForm, format: e.target.value as any })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    >
                      {draftForm.platform === 'instagram' && (
                        <>
                          <option value="reels">🎥 Reels / Vídeo Curto</option>
                          <option value="carousel">📚 Carrossel (Imagens/Slides)</option>
                          <option value="post">🖼️ Post de Imagem Única</option>
                        </>
                      )}
                      {draftForm.platform === 'linkedin' && (
                        <>
                          <option value="text">✍️ Post de Texto (Formatado)</option>
                          <option value="carousel">📚 Carrossel (PDF/Slides)</option>
                        </>
                      )}
                      {draftForm.platform === 'tiktok' && (
                        <option value="reels">🎥 Vídeo Curto (TikTok)</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Bloco Auxiliar de Geração por IA */}
                <div className="bg-gradient-to-tr from-indigo-950/20 to-slate-950/40 border border-indigo-950/40 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-400 animate-pulse" />
                    <div>
                      <h4 className="text-xs font-bold text-white">Assistente de Copywriting</h4>
                      <p className="text-[10px] text-slate-500">Deixe que o Gemini escreva a primeira versão do roteiro para você.</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase">Instruções Extras ou Conceito (Opcional)</label>
                    <textarea
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder="Ex: Quero focar em profissionais de TI, adicione um call to action forte dizendo para comentar 'QUERO'..."
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateScriptWithAI}
                    disabled={isGeneratingScript}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-lg flex items-center justify-center gap-2 shadow transition active:scale-95 disabled:opacity-50"
                  >
                    {isGeneratingScript ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        Criando roteiro magnético...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        Gerar Conteúdo e Roteiro com IA
                      </>
                    )}
                  </button>
                </div>

                {/* Campos do Editor */}
                <div className="space-y-4">
                  
                  {/* Legenda / Conteúdo Escrito */}
                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      {draftForm.format === 'reels' ? 'Legenda do Reels' : 
                       draftForm.format === 'carousel' ? 'Legenda do Post' : 
                       'Texto Principal / Copy do Post *'}
                    </label>
                    <textarea
                      required
                      rows={8}
                      value={draftForm.content}
                      onChange={(e) => setDraftForm({ ...draftForm, content: e.target.value })}
                      placeholder="Escreva a legenda ou o post final aqui..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-800 focus:outline-none focus:border-indigo-500 transition font-sans"
                    />

                    {/* AI REFINEMENT TOOLBAR */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[9px] font-bold text-slate-500 uppercase mr-1">Refinar com IA:</span>
                      <button
                        type="button"
                        onClick={() => handleRefineDraft('humanize')}
                        disabled={isGeneratingScript || !draftForm.content}
                        className="py-1 px-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
                        🤖 Humanizar Texto
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefineDraft('shorten')}
                        disabled={isGeneratingScript || !draftForm.content}
                        className="py-1 px-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold transition flex items-center gap-1 disabled:opacity-50"
                      >
                        ✂️ Encurtar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefineDraft('simplify')}
                        disabled={isGeneratingScript || !draftForm.content}
                        className="py-1 px-2.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold transition flex items-center gap-1 disabled:opacity-50"
                      >
                        💡 Simplificar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRefineDraft('engagement')}
                        disabled={isGeneratingScript || !draftForm.content}
                        className="py-1 px-2.5 bg-indigo-600/10 hover:bg-indigo-650/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-[10px] font-bold transition flex items-center gap-1 disabled:opacity-50"
                      >
                        🔥 Mais Engajamento
                      </button>
                    </div>
                  </div>

                  {/* Roteiro Visual (Cenas / Slides) */}
                  {(draftForm.format === 'carousel' || draftForm.format === 'reels') && (
                    <div className="space-y-2 text-left">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {draftForm.format === 'carousel' ? 'Roteiro dos Slides (Carrossel)' : 'Roteiro de Cenas (Reels/Vídeo)'}
                      </label>
                      <textarea
                        rows={6}
                        value={draftForm.visual_script}
                        onChange={(e) => setDraftForm({ ...draftForm, visual_script: e.target.value })}
                        placeholder={
                          draftForm.format === 'carousel'
                            ? "Slide 1:\n[Título] O Segredo da Automação\n[Visual] Imagem de um robô simpático no celular\n[Texto] Veja como automatizar o Insta...\n\nSlide 2:..."
                            : "Cena 1 (0-3s):\n[Ação] Apontando para o texto flutuante na tela com cara de surpresa.\n[Áudio] Sabia que dá para programar respostas automáticas de graça?"
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-850 focus:outline-none focus:border-indigo-500 transition font-sans"
                      />
                    </div>
                  )}

                  {/* Mídia e Imagens */}
                  <div className="space-y-3 text-left bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                        Mídia do Post (Imagem / Vídeo)
                      </label>
                      <span className="text-[10px] text-slate-500">
                        {draftForm.platform === 'instagram' ? 'Obrigatório no Insta' : 'Opcional no LinkedIn'}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={draftForm.media_url || ''}
                        onChange={(e) => setDraftForm({ ...draftForm, media_url: e.target.value })}
                        placeholder="https://exemplo.com/sua-imagem.jpg"
                        className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                      />
                      <button
                        type="button"
                        onClick={handleGenerateAIImage}
                        className="py-2 px-3 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        {draftForm.media_url ? '🔄 Regenerar Imagem' : '🎨 Gerar Imagem por IA'}
                      </button>
                    </div>

                    {/* Preview da Imagem Anexada */}
                    {draftForm.media_url ? (
                      <div className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 max-h-48 flex items-center justify-center">
                        <img
                          src={draftForm.media_url}
                          alt="Preview do Post"
                          className="w-full h-48 object-cover rounded-xl"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-3 transition">
                          <button
                            type="button"
                            onClick={handleGenerateAIImage}
                            className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold shadow hover:bg-indigo-500 transition"
                          >
                            🔄 Regenerar IA
                          </button>
                          <button
                            type="button"
                            onClick={() => setDraftForm({ ...draftForm, media_url: '' })}
                            className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-bold shadow hover:bg-rose-500 transition"
                          >
                            <Trash2 className="h-3.5 w-3.5 inline mr-1" /> Remover
                          </button>
                        </div>
                      </div>
                    ) : (
                      config && (
                        <button
                          type="button"
                          onClick={() => setIsMediaSelectorOpen(true)}
                          className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1.5 transition"
                        >
                          <Image className="h-3.5 w-3.5" />
                          Selecionar foto/vídeo das suas mídias do Instagram
                        </button>
                      )
                    )}
                  </div>

                  {/* Agendamento Automático */}
                  <div className="space-y-2 text-left">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Agendamento Automático de Publicação (Opcional)
                    </label>
                    <input
                      type="datetime-local"
                      value={draftForm.scheduled_at ? new Date(draftForm.scheduled_at).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setDraftForm({ ...draftForm, scheduled_at: e.target.value ? new Date(e.target.value).toISOString() : '' })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition"
                    />
                    <p className="text-[10px] text-slate-500">
                      Se definido e o status for "Pronto para Postar", a publicação será disparada automaticamente no horário agendado.
                    </p>
                  </div>

                </div>

                {/* SUBMIT BUTTON */}
                <div className="border-t border-slate-800 pt-6 flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setIsDraftModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={studioLoading}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm active:scale-95 disabled:opacity-50"
                  >
                    {studioLoading ? 'Salvando...' : 'Salvar no Estúdio'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

      {/* INSTAGRAM MEDIA SELECTOR MODAL */}
      {isMediaSelectorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[80vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h4 className="text-base font-bold text-white">Selecionar Publicação</h4>
                <p className="text-xs text-slate-500">Escolha o post ou reels em que deseja ativar o gatilho.</p>
              </div>
              <button
                onClick={() => setIsMediaSelectorOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 flex-1 overflow-y-auto">
              {currentMediaList.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Instagram className="h-8 w-8 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-400">Nenhum post recente encontrado ou conta desconectada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {currentMediaList.map((media) => (
                    <div
                      key={media.id}
                      onClick={() => handleSelectMedia(media)}
                      className="group aspect-square relative rounded-xl overflow-hidden border border-slate-800 cursor-pointer bg-slate-950 hover:border-indigo-500 transition"
                    >
                      {media.thumbnail_url || media.media_url ? (
                        <img
                          src={media.thumbnail_url || media.media_url}
                          alt={media.caption || 'Instagram Post'}
                          className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-500">
                          <Image className="h-6 w-6" />
                        </div>
                      )}
                      
                      {/* CAPTION HOVER */}
                      <div className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 flex flex-col justify-end p-2 transition duration-200">
                        <p className="text-[10px] text-white line-clamp-3 leading-tight font-medium">
                          {media.caption || '(Sem legenda)'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-right">
              <button
                onClick={() => setIsMediaSelectorOpen(false)}
                className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white transition rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* MODAL CRONOGRAMA ESTRATÉGICO DA SEMANA */}
      {isScheduleModalOpen && schedulePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl text-indigo-400">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    Cronograma Semanal Estratégico
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold">
                      {schedulePlan.weeklyFrequency}
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">Ordem, horários e pilares recomendados para maximizar seu alcance e conversão.</p>
                </div>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="text-slate-400 hover:text-white transition p-1 bg-slate-800 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 flex-1 overflow-y-auto space-y-6">
              {/* Resumo da Estratégia */}
              <div className="bg-slate-950/70 border border-slate-800 p-4 rounded-xl space-y-1 text-left">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Estratégia Recomendada para o seu Nicho</span>
                <p className="text-xs text-slate-300 leading-relaxed">{schedulePlan.strategySummary}</p>
              </div>

              {/* Lista de Dias e Horários */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {schedulePlan.items?.map((item: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-extrabold text-white flex items-center gap-1.5">
                          📅 {item.dayOfWeek} às {item.recommendedTime}
                        </span>
                        <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md font-bold uppercase">
                          {item.platform} • {item.format}
                        </span>
                      </div>

                      {item.pillar && (
                        <span className="text-[10px] text-slate-400 block font-semibold">
                          Pilar: <span className="text-indigo-300">{item.pillar}</span>
                        </span>
                      )}

                      <h5 className="font-bold text-white text-xs leading-snug">{item.suggestedTopic}</h5>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{item.reasoning}</p>
                    </div>

                    <button
                      onClick={() => {
                        setIsScheduleModalOpen(false);
                        handleOpenDraftFromIdea({
                          id: '',
                          title: item.suggestedTopic,
                          description: item.reasoning,
                          reference_url: null,
                          pillar: item.pillar,
                          status: 'idea',
                          created_at: new Date().toISOString()
                        });
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      + Rascunhar este Post
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-950/50 border-t border-slate-800 text-right">
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-white transition rounded-lg text-xs font-semibold"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
