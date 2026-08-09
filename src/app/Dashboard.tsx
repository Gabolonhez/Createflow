'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Menu,
  Zap,
  Lightbulb,
  PenLine,
  Calendar,
  Rocket,
  Clapperboard,
  Target,
  Anchor,
  BookOpen,
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

// Reduced-motion: detect user preference for accessibility (impeccable skill)
const prefersReducedMotion =
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

const cardGridVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { staggerChildren: 0.04 },
  },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 12, scale: 1 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: prefersReducedMotion
      ? { duration: 0 }
      : {
          type: 'spring' as const,
          stiffness: 300,
          damping: 24,
        },
  },
};

const modalSpringVariants = {
  hidden: { opacity: 0, scale: prefersReducedMotion ? 1 : 0.96, y: prefersReducedMotion ? 0 : 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: prefersReducedMotion
      ? { duration: 0.1 }
      : {
          type: 'spring' as const,
          stiffness: 320,
          damping: 26,
        },
  },
  exit: {
    opacity: 0,
    scale: prefersReducedMotion ? 1 : 0.96,
    y: prefersReducedMotion ? 0 : 8,
    transition: { duration: 0.12 },
  },
};

// Hover border color as hex (fixes oklab color warning from Framer Motion)
const hoverBorderIndigo = '#6366f173';

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
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMediaSelectorOpen, setIsMediaSelectorOpen] = useState(false);
  const [currentMediaList, setCurrentMediaList] = useState<any[]>(mediaList);

  // Sistema de Busca Reativa 21st.dev
  const [searchQuery, setSearchQuery] = useState('');

  // Sistema de Notificações Toast Flutuante com Framer Motion
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'info' | 'error' }[]>([]);

  const addToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

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
      addToast(`Erro ao obter URL: ${e.message}`, 'error');
      setLoading(false);
    }
  };
  
  // Controle de abas principais
  const [activeMainTab, setActiveMainTab] = useState<'automations' | 'creator_studio'>('creator_studio');
  // Controle de sub-abas do Creator Studio
  const [activeStudioTab, setActiveStudioTab] = useState<'chat' | 'trends' | 'ideas' | 'drafts' | 'profile'>('ideas');

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
      addToast('Cronograma semanal gerado com IA!', 'success');
    } catch (err: any) {
      addToast(`Erro ao gerar cronograma: ${err.message}`, 'error');
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
      addToast('Perfil de marca salvo com sucesso!', 'success');
    } catch (err: any) {
      addToast(`Erro ao salvar perfil: ${err.message}`, 'error');
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
      addToast('Ideia salva no seu Segundo Cérebro!', 'success');
    } catch (err: any) {
      addToast(`Erro ao salvar ideia: ${err.message}`, 'error');
    } finally {
      setStudioLoading(false);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (confirm('Deseja excluir esta ideia permanentemente?')) {
      setStudioLoading(true);
      try {
        await deleteIdeaAction(id);
        addToast('Ideia removida.', 'info');
      } catch (err: any) {
        addToast(`Erro ao excluir: ${err.message}`, 'error');
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
      const suggestions: any = await generateIdeasAction();
      if (suggestions && suggestions.error) {
        addToast(suggestions.error, 'error');
        setShowAiSuggestionsModal(false);
        return;
      }
      setAiSuggestions(Array.isArray(suggestions) ? suggestions : []);
      addToast('Ideias geradas pelo Gemini Pro!', 'success');
    } catch (err: any) {
      addToast(err.message, 'error');
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
        description: aiIdea.reasoning,
        pillar: aiIdea.pillar,
        reference_url: '',
        status: 'idea',
      });
      setAiSuggestions((prev) => prev.filter((i) => i.title !== aiIdea.title));
      addToast('Ideia adicionada ao backlog!', 'success');
    } catch (err: any) {
      addToast(`Erro ao adicionar ideia: ${err.message}`, 'error');
    } finally {
      setStudioLoading(false);
    }
  };

  const handleOpenDraftFromIdea = (idea: Idea) => {
    setDraftForm({
      id: '',
      title: idea.title,
      platform: 'instagram',
      format: 'post',
      content: idea.description || '',
      visual_script: '',
      idea_id: idea.id,
      status: 'draft',
      media_url: idea.reference_url || '',
      scheduled_at: '',
    });
    setCustomPrompt('');
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

  const handleEditDraft = (draft: Draft) => {
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

  const handleDeleteDraft = async (id: string) => {
    if (confirm('Deseja excluir este rascunho?')) {
      setStudioLoading(true);
      try {
        await deleteDraftAction(id);
        addToast('Rascunho excluído.', 'info');
      } catch (err: any) {
        addToast(`Erro ao excluir: ${err.message}`, 'error');
      } finally {
        setStudioLoading(false);
      }
    }
  };

  const handleGenerateScript = async () => {
    if (!draftForm.title) {
      addToast('Por favor, dê um título ou tema para o rascunho.', 'error');
      return;
    }
    setIsGeneratingScript(true);
    try {
      const result: any = await generateScriptAction({
        title: draftForm.title,
        description: customPrompt,
        platform: draftForm.platform,
        format: draftForm.format,
        customPrompt,
      });

      if (result && result.error) {
        addToast(`Erro ao gerar roteiro: ${result.error}`, 'error');
        return;
      }

      setDraftForm((prev) => ({
        ...prev,
        content: result.content || '',
        visual_script: result.visual_script || '',
      }));
      addToast('Roteiro estruturado gerado com sucesso!', 'success');
    } catch (err: any) {
      addToast(`Erro ao gerar roteiro com IA: ${err.message}`, 'error');
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
      addToast('Rascunho salvo no estúdio!', 'success');
    } catch (err: any) {
      addToast(`Erro ao salvar rascunho: ${err.message}`, 'error');
    } finally {
      setStudioLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    addToast('Copiado para a área de transferência.', 'info');
  };

  const handlePublishLinkedIn = async (draft: Draft) => {
    if (!confirm('Deseja publicar este post agora no seu LinkedIn conectado?')) return;
    setIsPublishing(true);
    try {
      await publishToLinkedInAction(draft.id);
      addToast('Post publicado com sucesso no LinkedIn!', 'success');
    } catch (err: any) {
      addToast(`Erro ao publicar no LinkedIn: ${err.message}`, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishInstagram = async (draft: Draft) => {
    if (!confirm('Deseja publicar este post agora na sua conta do Instagram?')) return;
    setIsPublishing(true);
    try {
      await publishToInstagramAction(draft.id);
      addToast('Post publicado com sucesso no Instagram!', 'success');
    } catch (err: any) {
      addToast(`Erro ao publicar no Instagram: ${err.message}`, 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    try {
      const url = await getLinkedInOAuthUrlAction();
      window.location.href = url;
    } catch (err: any) {
      addToast(`Erro ao conectar LinkedIn: ${err.message}`, 'error');
    }
  };

  // Handlers do Chat com IA (Segundo Cérebro)
  const handleCreateSession = async () => {
    const title = prompt('Nome do novo Brainstorm ou Tópico:', 'Novo Brainstorm');
    if (!title) return;
    try {
      const newSession: any = await createChatSessionAction(title);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      addToast('Nova sessão de Brainstorm criada!', 'success');
    } catch (err: any) {
      addToast(`Erro ao criar sessão: ${err.message}`, 'error');
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Excluir esta sessão de conversa?')) return;
    try {
      await deleteChatSessionAction(sessionId);
      setSessions((prev) => prev.filter((s) => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
      addToast('Sessão excluída.', 'info');
    } catch (err: any) {
      addToast(`Erro ao excluir sessão: ${err.message}`, 'error');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isSendingMessage || !activeSessionId) return;

    const userText = inputMessage.trim();
    setInputMessage('');
    setIsSendingMessage(true);

    const tempUserMsg = {
      id: 'temp_u_' + Date.now(),
      session_id: activeSessionId,
      role: 'user',
      content: userText,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const modelMsg: any = await sendMessageAction(activeSessionId, userText);

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      addToast(`Erro ao enviar mensagem: ${err.message}`, 'error');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSaveChatMessageAsIdea = async (content: string) => {
    try {
      await saveIdeaAction({
        title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
        description: content,
        pillar: 'Chat IA',
        reference_url: '',
        status: 'idea',
      });
      addToast('Mensagem salva no Banco de Ideias!', 'success');
    } catch (err: any) {
      addToast(`Erro ao salvar: ${err.message}`, 'error');
    }
  };

  const handleSaveChatMessageAsDraft = (content: string) => {
    setDraftForm({
      id: '',
      title: content.slice(0, 40) + '...',
      platform: 'instagram',
      format: 'post',
      content,
      visual_script: '',
      idea_id: '',
      status: 'draft',
      media_url: '',
      scheduled_at: '',
    });
    setIsDraftModalOpen(true);
  };

  // Handlers do Analisador de Tendências & Deconstrutor
  const handleAnalyzeTrend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trendText.trim()) return;
    setIsAnalyzingTrend(true);
    setAnalyzedResult(null);

    try {
      const result: any = await analyzeTrendAction(trendText);
      if (result && result.error) {
        addToast(`Erro na análise: ${result.error}`, 'error');
        return;
      }
      if (result && (result.success || result.reusable_template)) {
        setAnalyzedResult(result);
        addToast('Análise de estrutura viral concluída!', 'success');
      } else {
        addToast('Não foi possível extrair a estrutura do post.', 'error');
      }
    } catch (err: any) {
      addToast(`Erro na análise: ${err.message}`, 'error');
    } finally {
      setIsAnalyzingTrend(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!analyzedResult) return;
    try {
      const newTemplate = await saveAnalyzedTemplateAction({
        title: analyzedResult.title || 'Template Viral',
        original_content: trendText || 'Texto original',
        hook: analyzedResult.hook || '',
        structure: analyzedResult.structure || '',
        key_takeaways: analyzedResult.key_takeaways || '',
        reusable_template: analyzedResult.reusable_template || '',
      });
      if (newTemplate) {
        setLocalTemplates((prev) => [newTemplate, ...prev]);
      }
      addToast('Template salvo na sua biblioteca de tendências!', 'success');
    } catch (err: any) {
      addToast(`Erro ao salvar template: ${err.message}`, 'error');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Excluir este template viral salvo?')) return;
    try {
      await deleteAnalyzedTemplateAction(templateId);
      setLocalTemplates((prev) => prev.filter((t) => t.id !== templateId));
      addToast('Template excluído.', 'info');
    } catch (err: any) {
      addToast(`Erro ao deletar: ${err.message}`, 'error');
    }
  };

  const handleOpenDraftFromTemplate = (template: any) => {
    setDraftForm({
      id: '',
      title: `Roteiro: ${template.title}`,
      platform: 'instagram',
      format: 'post',
      content: template.reusable_template,
      visual_script: `Gancho: ${template.hook}\nEstrutura: ${template.structure}`,
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
      addToast('Por favor, escreva ou gere algum texto antes de refinar.', 'error');
      return;
    }
    setIsGeneratingScript(true);
    try {
      const res: any = await refineDraftAction({
        content: draftForm.content,
        refinementType: type,
      });

      if (res && res.error) {
        addToast(`Erro ao humanizar/refinar texto: ${res.error}`, 'error');
        return;
      }

      const text = typeof res === 'string' ? res : (res.content || '');
      setDraftForm((prev) => ({ ...prev, content: text }));
      addToast('Texto refinado com sucesso!', 'success');
    } catch (err: any) {
      addToast(`Erro ao humanizar/refinar texto: ${err.message}`, 'error');
    } finally {
      setIsGeneratingScript(false);
    }
  };

  // Handler de Geração de Imagem por IA
  const handleGenerateAIImage = () => {
    if (!draftForm.title && !draftForm.content) {
      addToast('Digite um título ou conteúdo antes de gerar a imagem.', 'error');
      return;
    }
    const topic = encodeURIComponent(draftForm.title || draftForm.content.slice(0, 50));
    const imageUrl = `https://pollinations.ai/p/${topic}?width=1080&height=1080&seed=${Math.floor(Math.random() * 1000)}&nologo=true`;
    setDraftForm((prev) => ({
      ...prev,
      media_url: imageUrl,
    }));
    addToast('Imagem artística gerada por IA!', 'success');
  };

  const handleDisconnect = async () => {
    if (confirm('Tem certeza de que deseja desconectar o Instagram?')) {
      setLoading(true);
      try {
        await disconnectInstagramAction();
        window.location.reload();
      } catch (e: any) {
        addToast(`Erro ao desconectar: ${e.message}`, 'error');
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza de que deseja excluir esta automação?')) {
      setLoading(true);
      try {
        await deleteAutomationAction(id);
        addToast('Automação excluída.', 'info');
      } catch (e: any) {
        addToast(`Erro ao excluir: ${e.message}`, 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    setLoading(true);
    try {
      await toggleAutomationAction(id, active);
      addToast(`Automação ${active ? 'ativada' : 'pausada'}!`, 'info');
    } catch (e: any) {
      addToast(`Erro ao alternar: ${e.message}`, 'error');
    } finally {
      setLoading(false);
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
      addToast('Automação salva com sucesso!', 'success');
    } catch (e: any) {
      addToast(`Erro ao salvar: ${e.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filtragens Reativas
  const filteredIdeas = ideas.filter((idea) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return idea.title.toLowerCase().includes(q) || (idea.description && idea.description.toLowerCase().includes(q)) || (idea.pillar && idea.pillar.toLowerCase().includes(q));
  });

  const filteredDrafts = drafts.filter((draft) => {
    const matchesPlatform = filterPlatform === 'all' || draft.platform === filterPlatform;
    const matchesStatus = filterStatus === 'all' || draft.status === filterStatus;
    if (!matchesPlatform || !matchesStatus) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return draft.title.toLowerCase().includes(q) || (draft.content && draft.content.toLowerCase().includes(q));
  });

  const filteredAutomations = automations.filter((auto) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return auto.name.toLowerCase().includes(q) || auto.keywords.some((k) => k.toLowerCase().includes(q)) || auto.welcome_dm.toLowerCase().includes(q);
  });

  return (
    <div className="flex min-h-screen bg-[#0a0a0c] text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-x-hidden">
      
      {/* FLOATING TOAST NOTIFICATIONS (FRAMER MOTION) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className={`pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-lg backdrop-blur-xl text-xs font-mono font-medium ${
                t.type === 'error'
                  ? 'bg-rose-950/90 border-rose-500/40 text-rose-200'
                  : t.type === 'info'
                  ? 'bg-indigo-950/90 border-indigo-500/40 text-indigo-200'
                  : 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              }`}
            >
              <Sparkles className="h-4 w-4 shrink-0 text-current" />
              <span>{t.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* BACKDROP MOBILE DRAWER */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-30 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* LEFT SIDEBAR BARRA NAVEGAÇÃO FIXA / RESPONSIVA */}
      <aside className={`w-64 border-r border-zinc-800/70 bg-[#09090b] flex flex-col justify-between h-screen fixed lg:sticky top-0 left-0 shrink-0 select-none z-40 transition-transform duration-300 ${
        isMobileSidebarOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4 space-y-6 overflow-y-auto scrollbar-none">
          
          {/* BRAND LOGO E BOTAO FECHAR MOBILE */}
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex items-center gap-3">
              <motion.div 
                whileHover={{ rotate: 15, scale: 1.05 }}
                className="bg-indigo-600/20 border border-indigo-500/30 p-2 rounded-xl text-indigo-400"
              >
                <Sparkles className="h-5 w-5" />
              </motion.div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm tracking-tight text-white">CreateFlow</span>
                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">AI OS</span>
                </div>
                <span className="text-[11px] text-zinc-500 block font-medium">Segundo Cérebro & DM</span>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="lg:hidden text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-800/50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* BUSCA RÁPIDA ⌘K */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar... ⌘K"
              className="w-full bg-[#141416] border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* MENU PRINCIPAL */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-2 block mb-2 font-mono">Plataforma</span>
            
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('chat'); setIsMobileSidebarOpen(false); }}
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
            </motion.button>

            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('ideas'); setIsMobileSidebarOpen(false); }}
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
              {ideas.length > 0 && (
                <span className="text-[11px] bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  {ideas.length}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('drafts'); setIsMobileSidebarOpen(false); }}
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
                <span className="text-[11px] bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  {drafts.length}
                </span>
              )}
            </motion.button>

            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('trends'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeMainTab === 'creator_studio' && activeStudioTab === 'trends'
                  ? 'bg-[#18181c] text-white border border-zinc-700/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Compass className="h-4 w-4 text-cyan-400" />
                <span>Tendências Virais</span>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveMainTab('automations'); setIsMobileSidebarOpen(false); }}
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
                <span className="text-[11px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono border border-indigo-500/30">
                  {automations.length}
                </span>
              )}
            </motion.button>
          </div>

          {/* MENU FERRAMENTAS E CONFIGURAÇÕES */}
          <div className="space-y-1 pt-3 border-t border-zinc-800/60">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest px-2 block mb-2 font-mono">Estratégia</span>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { handleGenerateSchedulePlan(); setIsMobileSidebarOpen(false); }}
              disabled={isGeneratingSchedule}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 hover:bg-indigo-500/20 transition"
            >
              <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
              <span>Cronograma (IA)</span>
            </motion.button>

            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setActiveMainTab('creator_studio'); setActiveStudioTab('profile'); setIsMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                activeMainTab === 'creator_studio' && activeStudioTab === 'profile'
                  ? 'bg-[#18181c] text-white border border-zinc-700/80 shadow-sm font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-[#141416]'
              }`}
            >
              <Settings className="h-4 w-4 text-zinc-400" />
              <span>Marca & Conexões</span>
            </motion.button>
          </div>
        </div>

        {/* STATUS DO MOTOR IA & INSTAGRAM NO FOOTER DA SIDEBAR */}
        <div className="p-4 border-t border-zinc-800/60 bg-[#09090b] space-y-3">
          <div className="bg-[#121215] border border-zinc-800/80 rounded-xl p-2.5 space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400 font-mono">Motor IA</span>
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
                  <span className="text-[11px] text-emerald-400 block font-mono">Conectado</span>
                </div>
              </div>
              <button onClick={handleDisconnect} className="text-zinc-500 hover:text-rose-400 transition p-1">
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleConnect}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow"
            >
              <Instagram className="h-3.5 w-3.5" />
              Conectar Insta
            </motion.button>
          )}
        </div>
      </aside>

      {/* ÁREA PRINCIPAL DE CONTEÚDO */}
      <main className="flex-1 w-full min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6 bg-[#0a0a0c]">
        
        {/* TOP BAR HEADER REPLICADO 1:1 DA REFERÊNCIA */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2 border-b border-zinc-800/60 w-full">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* BOTAO HAMBURGER MOBILE */}
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden text-zinc-400 hover:text-white p-2 rounded-xl bg-[#121215] border border-zinc-800 shrink-0"
              title="Abrir Menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <div className="relative w-full sm:w-96">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search ideas, scripts, automations..."
                className="w-full bg-[#121215] border border-zinc-800/80 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-300 placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 transition font-mono"
              />
              <Compass className="h-4 w-4 text-zinc-500 absolute left-3 top-2.5" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300 text-xs"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <motion.button
              whileHover={{ scale: 1.03, borderColor: '#6366f199' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                if (activeStudioTab === 'ideas') setIsIdeaModalOpen(true);
                else if (activeStudioTab === 'drafts') handleOpenNewDraft();
                else if (activeMainTab === 'automations') handleOpenNew();
                else handleCreateSession();
              }}
              className="bg-[#141416] hover:bg-zinc-800 border border-zinc-700/80 hover:border-zinc-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
            >
              <Plus className="h-4 w-4 text-indigo-400" />
              <span>
                {activeStudioTab === 'ideas' ? '+ Create idea' :
                 activeStudioTab === 'drafts' ? '+ Create script' :
                 activeMainTab === 'automations' ? '+ Create automation' : '+ New session'}
              </span>
            </motion.button>
          </div>
        </div>

        {/* TRANSIÇÃO SUAVE ENTRE AS TELAS PRINCIPAIS */}
        <AnimatePresence mode="wait">
          {activeMainTab === 'automations' ? (
            <motion.div
              key="automations-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* PARAMS NOTIFICATIONS */}
              {connectedParam && (
                <div className="bg-emerald-950/30 border border-emerald-800/50 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">CreateFlow conectado com sucesso ao seu Instagram!</p>
                </div>
              )}
              {errorParam && (
                <div className="bg-red-950/30 border border-red-800/50 text-red-400 p-4 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <p className="text-sm font-medium">Ocorreu um erro: {decodeURIComponent(errorParam)}</p>
                </div>
              )}

              {/* STATUS CARD */}
              {config && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <motion.div whileHover={{ y: -2 }} className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider font-mono">Janela de 24h</span>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-white">{stats.totalContacts}</span>
                      <span className="text-zinc-500 text-xs font-mono">Contatos activos</span>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider font-mono">Fila Pendente</span>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-indigo-400">{stats.pendingQueue}</span>
                      <span className="text-zinc-500 text-xs font-mono">Aguardando envio</span>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider font-mono">Mensagens Enviadas</span>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-400">{stats.sentMessages}</span>
                      <span className="text-zinc-500 text-xs font-mono">DMs processadas</span>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                    <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider font-mono">Falhas</span>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-rose-400">{stats.failedMessages}</span>
                      <span className="text-zinc-500 text-xs font-mono">Erros registrados</span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* LISTA DE AUTOMAÇÕES COM PATTERN BENTO */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="text-left">
                    <h3 className="text-base font-bold text-white tracking-tight">Minhas Automações</h3>
                    <p className="text-xs text-zinc-400">Gerencie os gatilhos e fluxos do seu assistente do Instagram.</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={handleOpenNew}
                    className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 shrink-0"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Automação
                  </motion.button>
                </div>

                {filteredAutomations.length === 0 ? (
                  <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-12 text-center space-y-4">
                    <MessageSquare className="h-10 w-10 text-zinc-600 mx-auto" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        {searchQuery ? 'Nenhuma automação encontrada para a busca' : 'Nenhuma automação configurada'}
                      </h4>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        {searchQuery ? 'Tente buscar com outro termo ou limpe a busca.' : 'Crie sua primeira regra de resposta automática para comentários e DMs.'}
                      </p>
                    </div>
                    {searchQuery ? (
                      <button onClick={() => setSearchQuery('')} className="px-4 py-2 bg-zinc-800 text-white text-xs font-mono rounded-xl">
                        Limpar busca
                      </button>
                    ) : (
                      <button
                        onClick={handleOpenNew}
                        className="py-2 px-4 bg-indigo-600 text-white rounded-xl text-xs font-bold inline-flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Criar Automação
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    {/* SEÇÃO 1: RECENT AUTOMATIONS */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 font-mono">Recent automations</span>
                        <span className="text-[11px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                          {Math.min(filteredAutomations.length, 3)}
                        </span>
                      </div>

                      <motion.div 
                        variants={cardGridVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {filteredAutomations.slice(0, 3).map((auto) => (
                          <motion.div
                            key={auto.id}
                            variants={cardItemVariants}
                            whileHover={{ y: -3, borderColor: hoverBorderIndigo }}
                            className="bg-[#111114] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-mono font-bold">
                                ⚡
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggle(auto.id!, !auto.active)}
                                  className="text-zinc-500 hover:text-zinc-300 font-mono text-xs p-1"
                                  title={auto.active ? 'Pausar' : 'Ativar'}
                                >
                                  <Power className={`h-3.5 w-3.5 ${auto.active ? 'text-emerald-400' : 'text-zinc-600'}`} />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(auto)}
                                  className="text-zinc-600 hover:text-zinc-300 font-mono text-sm p-1 transition"
                                  title="Edit"
                                >
                                  •••
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 my-auto">
                              <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{auto.name}</h4>
                              <p className="text-[11px] font-mono text-zinc-500 truncate">
                                instagram • {auto.match_type === 'any' ? 'any msg' : auto.keywords.join(', ')} • DM
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                              <span className="text-zinc-500">Created Jun 12</span>
                              <span className={`font-bold flex items-center gap-1 ${auto.active ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${auto.active ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                                {auto.active ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* SEÇÃO 2: ALL AUTOMATIONS */}
                    <div className="space-y-4 pt-2 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 font-mono">All automations</span>
                        <span className="text-[11px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                          {filteredAutomations.length}
                        </span>
                      </div>

                      <motion.div 
                        variants={cardGridVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {filteredAutomations.map((auto) => (
                          <motion.div
                            key={auto.id}
                            variants={cardItemVariants}
                            whileHover={{ y: -3, borderColor: hoverBorderIndigo }}
                            className="bg-[#111114] border border-zinc-800/80 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-mono font-bold">
                                ⚡
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleToggle(auto.id!, !auto.active)}
                                  className="text-zinc-500 hover:text-zinc-300 font-mono text-xs p-1"
                                  title={auto.active ? 'Pausar' : 'Ativar'}
                                >
                                  <Power className={`h-3.5 w-3.5 ${auto.active ? 'text-emerald-400' : 'text-zinc-600'}`} />
                                </button>
                                <button
                                  onClick={() => handleOpenEdit(auto)}
                                  className="text-zinc-600 hover:text-zinc-300 font-mono text-sm p-1 transition"
                                  title="Edit"
                                >
                                  •••
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 my-auto">
                              <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{auto.name}</h4>
                              <p className="text-[11px] font-mono text-zinc-500 truncate">
                                instagram • {auto.match_type === 'any' ? 'any msg' : auto.keywords.join(', ')} • DM
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                              <span className="text-zinc-500">Created Jun 12</span>
                              <span className={`font-bold flex items-center gap-1 ${auto.active ? 'text-emerald-400' : 'text-zinc-500'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${auto.active ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-600'}`}></span>
                                {auto.active ? 'Active' : 'Disabled'}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            /* ESTÚDIO DE CRIAÇÃO UI PREMIUM COM FRAMER MOTION */
            <motion.div
              key="creator-studio-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              
              {/* SUB-ABAS DO ESTÚDIO COM SLIDING PILL INDICATOR */}
              <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#121215] border border-zinc-800/80 rounded-2xl w-full shadow-sm relative">
                {[
                  { key: 'chat', label: 'Segundo Cérebro', icon: Brain },
                  { key: 'trends', label: 'Analisar Tendências', icon: Compass },
                  { key: 'ideas', label: 'Banco de Ideias', icon: Layers },
                  { key: 'drafts', label: 'Roteiros & Rascunhos', icon: FileText },
                  { key: 'profile', label: 'Marca & Conexões', icon: Settings },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeStudioTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => setActiveStudioTab(tab.key as any)}
                      className={`relative py-2.5 px-4 rounded-xl text-xs font-semibold transition-colors duration-200 flex items-center gap-2 whitespace-nowrap z-10 ${
                        isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeSubTabIndicator"
                          className="absolute inset-0 bg-indigo-600 rounded-xl shadow-md shadow-indigo-600/30 -z-10"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handleGenerateSchedulePlan}
                  disabled={isGeneratingSchedule}
                  className="ml-auto py-2 px-3.5 rounded-xl text-xs font-semibold bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 transition flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4 text-indigo-400 animate-pulse" />
                  {isGeneratingSchedule ? 'Gerando Plano...' : 'Cronograma Semanal (IA)'}
                </motion.button>
              </div>

              {/* CONTEÚDO DE ACORDO COM A SUB-ABA (COM TRANSIÇÃO ANIMADA) */}
              <AnimatePresence mode="wait">
                
                {/* 1. SEGUNDO CÉREBRO (CHAT) */}
                {activeStudioTab === 'chat' && (
                  <motion.div
                    key="studio-chat"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-1 lg:grid-cols-4 gap-6 bg-[#121215]/90 border border-zinc-800/80 rounded-2xl p-6 min-h-[640px] shadow-[0_8px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl"
                  >
                    {/* BARRA LATERAL: BRAINSTORMS */}
                    <div className="lg:col-span-1 border-r border-zinc-800/80 pr-4 flex flex-col space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono">Brainstorms</span>
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={handleCreateSession}
                          className="px-2.5 py-1 bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 rounded-xl transition flex items-center gap-1 text-xs font-semibold"
                          title="Nova sessão"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Novo
                        </motion.button>
                      </div>
                      
                      <div className="space-y-1.5 overflow-y-auto max-h-[520px] scrollbar-thin">
                        {sessions.length === 0 ? (
                          <div className="text-center p-6 text-zinc-500 text-xs italic">Nenhuma conversa iniciada</div>
                        ) : (
                          sessions.map((s) => (
                            <motion.div
                              key={s.id}
                              whileHover={{ x: 2 }}
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
                            </motion.div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* PAINEL CENTRAL DO CHAT */}
                    <div className="lg:col-span-3 flex flex-col justify-between min-h-[560px]">
                      {!activeSessionId ? (
                        <div className="flex flex-col items-center justify-center flex-1 text-center p-6 space-y-6">
                          <motion.div 
                            animate={{ scale: [1, 1.05, 1] }}
                            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                            className="p-5 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-indigo-400 shadow-inner"
                          >
                            <Brain className="h-12 w-12 text-indigo-400" />
                          </motion.div>
                          <div className="space-y-2 max-w-md">
                            <h4 className="text-lg font-bold text-white tracking-tight">Segundo Cérebro Digital</h4>
                            <p className="text-xs text-zinc-400 leading-relaxed">
                              Alimentado com o <strong>Nicho, Público-Alvo e Tom de Voz</strong> da sua marca. Clique em um dos atalhos abaixo ou inicie uma conversa para criar posts estratégicos.
                            </p>
                          </div>

                          {/* PROMPTS INICIAIS RÁPIDOS */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-xl text-left">
                            {[
                              { title: '3 Ganchos Virais', prompt: 'Crie 3 ganchos virais irresistíveis para o meu nicho de mercado.' },
                              { title: 'Post para LinkedIn', prompt: 'Escreva um post estruturado e autêntico para o meu LinkedIn sobre superação de desafios.' },
                              { title: 'Roteiro de Reels/TikTok', prompt: 'Escreva um roteiro dinâmico de Reels em 3 cenas com falas e indicações visuais.' },
                              { title: 'Estratégia da Semana', prompt: 'Qual é a melhor ordem de postagens para esta semana baseada no meu público?' }
                            ].map((starter, i) => (
                              <motion.button
                                key={i}
                                whileHover={{ scale: 1.02, borderColor: hoverBorderIndigo }}
                                whileTap={{ scale: 0.98 }}
                                onClick={async () => {
                                  try {
                                    const newSession = await createChatSessionAction(starter.title);
                                    setSessions((prev) => [newSession, ...prev]);
                                    setActiveSessionId(newSession.id);
                                    setInputMessage(starter.prompt);
                                  } catch (e: any) {
                                    addToast(e.message, 'error');
                                  }
                                }}
                                className="p-3.5 bg-[#18181c] border border-zinc-800 hover:border-indigo-500/50 rounded-2xl text-left transition hover:bg-zinc-800/40 group space-y-1"
                              >
                                <span className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400 transition block">{starter.title}</span>
                                <span className="text-[11px] text-zinc-500 line-clamp-1 block">{starter.prompt}</span>
                              </motion.button>
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
                                <motion.div
                                  key={m.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
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
                                </motion.div>
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
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              type="submit"
                              disabled={!inputMessage.trim() || isSendingMessage}
                              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
                            >
                              <Sparkles className="h-3.5 w-3.5" />
                              Enviar
                            </motion.button>
                          </form>
                        </>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 2. ANALISADOR DE TENDÊNCIAS */}
                {activeStudioTab === 'trends' && (
                  <motion.div
                    key="studio-trends"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  >
                    {/* COLUNA ESQUERDA: DESCONSTRUTOR */}
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-sm text-left">
                        <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-wider font-mono flex items-center gap-2">
                          <Compass className="h-4 w-4 text-indigo-400" />
                          Engenharia Reversa de Posts
                        </h3>
                        <p className="text-xs text-zinc-400 leading-relaxed">
                          Cole um post viral do LinkedIn ou Instagram. A IA analisará o gancho, a retenção e extrairá um template reutilizável.
                        </p>
                        <form onSubmit={handleAnalyzeTrend} className="space-y-4">
                          <div>
                            <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Post de Sucesso original</label>
                            <textarea
                              rows={8}
                              value={trendText}
                              onChange={(e) => setTrendText(e.target.value)}
                              placeholder="Cole o texto bruto do post aqui..."
                              className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700/30 transition font-sans leading-relaxed"
                            />
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={isAnalyzingTrend || !trendText.trim()}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20"
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
                          </motion.button>
                        </form>
                      </div>
                    </div>

                    {/* COLUNA CENTRAL/DIREITA: RESULTADOS & TEMPLATES */}
                    <div className="lg:col-span-2 space-y-6">
                      {/* RESULTADO DA ANÁLISE ATUAL */}
                      {analyzedResult && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-[#121215] border border-indigo-500/30 rounded-2xl p-6 space-y-5 shadow-sm text-left"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
                            <h4 className="text-xs font-bold text-indigo-400 font-mono flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-indigo-400" />
                              {analyzedResult.title}
                            </h4>
                            <motion.button
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSaveTemplate}
                              className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold transition flex items-center gap-1 shadow-sm"
                            >
                              <Check className="h-3.5 w-3.5" />
                              Salvar Template
                            </motion.button>
                          </div>

                          <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800/80 text-left">
                                <span className="font-bold text-zinc-400 uppercase tracking-widest text-[11px] font-mono block mb-1"><Anchor className="h-3 w-3 inline mr-1 -mt-0.5" />O Gancho (Hook)</span>
                                <p className="text-zinc-300 leading-relaxed font-sans">{analyzedResult.hook}</p>
                              </div>
                              <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800/80 text-left">
                                <span className="font-bold text-zinc-400 uppercase tracking-widest text-[11px] font-mono block mb-1"><Layers className="h-3 w-3 inline mr-1 -mt-0.5" />Estrutura de Retenção</span>
                                <p className="text-zinc-300 leading-relaxed font-sans">{analyzedResult.structure}</p>
                              </div>
                            </div>
                            <div className="bg-[#09090b] p-4 rounded-xl border border-zinc-800/80 text-left">
                              <span className="font-bold text-zinc-400 uppercase tracking-widest text-[11px] font-mono block mb-1"><Lightbulb className="h-3 w-3 inline mr-1 -mt-0.5" />Aprendizados Chave</span>
                              <p className="text-zinc-300 leading-relaxed font-sans">{analyzedResult.key_takeaways}</p>
                            </div>
                            <div className="space-y-1.5 text-left">
                              <span className="font-bold text-zinc-400 uppercase tracking-widest text-[11px] font-mono block ml-1"><FileText className="h-3 w-3 inline mr-1 -mt-0.5" />Template Reutilizável</span>
                              <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-xl font-mono text-[11px] text-emerald-400 whitespace-pre-wrap leading-relaxed">
                                {analyzedResult.reusable_template}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* BIBLIOTECA DE TEMPLATES */}
                      <div className="space-y-4 text-left">
                        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2 ml-1 font-mono">
                          <Layers className="h-4 w-4 text-indigo-400" />
                          Modelos Desconstruídos Salvos ({localTemplates.length})
                        </h4>
                        
                        {localTemplates.length === 0 ? (
                          <div className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-10 text-center text-xs text-zinc-500 italic">
                            Nenhum modelo de escrita na biblioteca de tendências. Cole um post à esquerda para começar.
                          </div>
                        ) : (
                          <motion.div 
                            variants={cardGridVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 md:grid-cols-2 gap-4"
                          >
                            {localTemplates.map((t) => (
                              <motion.div 
                                key={t.id}
                                variants={cardItemVariants}
                                whileHover={{ y: -3, borderColor: hoverBorderIndigo }}
                                className="bg-[#111114] border border-zinc-800/80 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition duration-300 group"
                              >
                                <div className="space-y-2 text-left">
                                  <div className="flex items-start justify-between gap-2">
                                    <h5 className="text-xs font-bold text-white truncate">{t.title}</h5>
                                    <button
                                      onClick={() => handleDeleteTemplate(t.id)}
                                      className="text-zinc-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition duration-300 p-1.5 rounded-lg hover:bg-rose-500/10"
                                      title="Deletar modelo"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-[11px] text-zinc-400 line-clamp-3 bg-[#09090b] p-3 rounded-xl font-mono leading-relaxed border border-zinc-800">
                                    {t.reusable_template}
                                  </p>
                                </div>
                                <motion.button
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => handleOpenDraftFromTemplate(t)}
                                  className="w-full py-2 bg-indigo-600/10 hover:bg-indigo-600/25 border border-indigo-500/20 text-indigo-400 rounded-xl text-[11px] font-bold transition duration-300 flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                  Usar este Modelo
                                </motion.button>
                              </motion.div>
                            ))}
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. BANCO DE IDEIAS */}
                {activeStudioTab === 'ideas' && (
                  <motion.div
                    key="studio-ideas"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-8"
                  >
                    
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
                          className="bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600/30 font-mono w-full sm:w-72"
                        />
                        <input
                          type="text"
                          value={ideaForm.pillar}
                          onChange={(e) => setIdeaForm({ ...ideaForm, pillar: e.target.value })}
                          placeholder="Pilar/Canal"
                          className="bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-600 font-mono w-28"
                        />
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="submit"
                          disabled={studioLoading}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold transition shrink-0 shadow-md shadow-emerald-600/20"
                        >
                          + Save Idea
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          type="button"
                          onClick={handleGenerateIdeasWithAI}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1 shrink-0 shadow-md shadow-indigo-600/20"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          + AI Brainstorm
                        </motion.button>
                      </form>
                    </div>

                    {/* SEÇÃO 1: RECENT IDEAS */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 font-mono">Recent ideas</span>
                        <span className="text-[11px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                          {Math.min(filteredIdeas.filter(i => i.status === 'idea').length, 3)}
                        </span>
                      </div>

                      <motion.div 
                        variants={cardGridVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {filteredIdeas.filter(i => i.status === 'idea').slice(0, 3).map((idea) => (
                          <motion.div
                            key={idea.id}
                            variants={cardItemVariants}
                            whileHover={{ y: -3, borderColor: hoverBorderIndigo }}
                            className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">
                                <Lightbulb className="h-4 w-4" />
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenDraftFromIdea(idea)}
                                  className="text-zinc-500 hover:text-indigo-400 font-mono text-xs p-1"
                                  title="Criar Roteiro"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteIdea(idea.id)}
                                  className="text-zinc-600 hover:text-rose-400 font-mono text-sm p-1 transition"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 my-auto">
                              <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{idea.title}</h4>
                              <p className="text-[11px] font-mono text-zinc-500 truncate">
                                {idea.pillar ? `${idea.pillar} • ` : ''}ideia
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                              <span className="text-zinc-500">Created Jun 12</span>
                              <span className="font-bold text-emerald-400">Active</span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* SEÇÃO 2: ALL IDEAS */}
                    <div className="space-y-4 pt-2 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 font-mono">All ideas</span>
                        <span className="text-[11px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                          {filteredIdeas.length}
                        </span>
                      </div>

                      <motion.div 
                        variants={cardGridVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {filteredIdeas.map((idea) => (
                          <motion.div
                            key={idea.id}
                            variants={cardItemVariants}
                            whileHover={{ y: -3, borderColor: hoverBorderIndigo }}
                            className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-mono font-bold">
                                <Lightbulb className="h-4 w-4" />
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => handleOpenDraftFromIdea(idea)}
                                  className="text-zinc-500 hover:text-indigo-400 font-mono text-xs p-1"
                                  title="Criar Roteiro"
                                >
                                  <FileText className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteIdea(idea.id)}
                                  className="text-zinc-600 hover:text-rose-400 font-mono text-sm p-1 transition"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 my-auto">
                              <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{idea.title}</h4>
                              <p className="text-[11px] font-mono text-zinc-500 truncate">
                                {idea.pillar ? `${idea.pillar} • ` : ''}ideia
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                              <span className="text-zinc-500">Created Jun 12</span>
                              <span className="font-bold text-emerald-400">Active</span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                  </motion.div>
                )}

                {/* 4. ROTEIROS & RASCUNHOS */}
                {activeStudioTab === 'drafts' && (
                  <motion.div
                    key="studio-drafts"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-8"
                  >
                    
                    {/* BARRA SUPERIOR E FILTROS */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#121215] border border-zinc-800/80 p-4 rounded-2xl">
                      <div className="text-left">
                        <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-400" />
                          Filtro de Conteúdos & Roteiros
                        </h3>
                        <p className="text-xs text-zinc-400">Filtre por canal de publicação ou estado do post.</p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <select
                          value={filterPlatform}
                          onChange={(e) => setFilterPlatform(e.target.value)}
                          className="bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono"
                        >
                          <option value="all">Todas as Redes</option>
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="tiktok">TikTok</option>
                        </select>

                        <select
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                          className="bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-zinc-300 focus:outline-none focus:border-zinc-600 font-mono"
                        >
                          <option value="all">Todos os Status</option>
                          <option value="draft">Rascunho</option>
                          <option value="ready">Pronto</option>
                          <option value="published">Publicado</option>
                        </select>

                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleOpenNewDraft}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shrink-0 shadow-md shadow-indigo-600/20"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          + Create script
                        </motion.button>
                      </div>
                    </div>

                    {/* SEÇÃO 1: RECENT SCRIPTS */}
                    <div className="space-y-4 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 font-mono">Recent scripts</span>
                        <span className="text-[11px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                          {Math.min(filteredDrafts.length, 3)}
                        </span>
                      </div>

                      <motion.div 
                        variants={cardGridVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {filteredDrafts.slice(0, 3).map((draft) => (
                          <motion.div
                            key={draft.id}
                            variants={cardItemVariants}
                            whileHover={{ y: -3, borderColor: hoverBorderIndigo }}
                            className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="h-8 w-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-mono font-bold">
                                {draft.platform === 'linkedin' ? 'in' : draft.platform === 'instagram' ? 'ig' : 'tt'}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => copyToClipboard(draft.content)}
                                  className="text-zinc-500 hover:text-zinc-300 font-mono text-xs p-1"
                                  title="Copiar texto"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleEditDraft(draft)}
                                  className="text-zinc-600 hover:text-zinc-300 font-mono text-sm p-1 transition"
                                  title="Edit"
                                >
                                  •••
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 my-auto">
                              <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{draft.title}</h4>
                              <p className="text-[11px] font-mono text-zinc-500 truncate">
                                {draft.platform} • {draft.format} • {draft.status}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                              <span className="text-zinc-500">Created Jun 12</span>
                              <span className={`font-bold ${
                                draft.status === 'published' ? 'text-emerald-400' :
                                draft.status === 'ready' ? 'text-amber-400' : 'text-purple-400'
                              }`}>
                                {draft.status === 'published' ? 'Published' : draft.status === 'ready' ? 'Ready' : 'Draft'}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                    {/* SEÇÃO 2: ALL SCRIPTS */}
                    <div className="space-y-4 pt-2 text-left">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-zinc-400 font-mono">All scripts</span>
                        <span className="text-[11px] font-mono bg-[#141416] border border-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-bold">
                          {filteredDrafts.length}
                        </span>
                      </div>

                      <motion.div 
                        variants={cardGridVariants}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                      >
                        {filteredDrafts.map((draft) => (
                          <motion.div
                            key={draft.id}
                            variants={cardItemVariants}
                            whileHover={{ y: -3, borderColor: hoverBorderIndigo }}
                            className="bg-[#111114] border border-zinc-800/80 hover:border-zinc-700 rounded-xl p-5 flex flex-col justify-between h-[185px] transition group relative shadow-sm text-left"
                          >
                            <div className="flex items-center justify-between">
                              <div className="h-8 w-8 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center text-xs font-mono font-bold">
                                {draft.platform === 'linkedin' ? 'in' : draft.platform === 'instagram' ? 'ig' : 'tt'}
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => copyToClipboard(draft.content)}
                                  className="text-zinc-500 hover:text-zinc-300 font-mono text-xs p-1"
                                  title="Copiar texto"
                                >
                                  <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleEditDraft(draft)}
                                  className="text-zinc-600 hover:text-zinc-300 font-mono text-sm p-1 transition"
                                  title="Edit"
                                >
                                  •••
                                </button>
                              </div>
                            </div>

                            <div className="space-y-1 my-auto">
                              <h4 className="font-bold text-white text-sm tracking-tight truncate group-hover:text-indigo-300 transition">{draft.title}</h4>
                              <p className="text-[11px] font-mono text-zinc-500 truncate">
                                {draft.platform} • {draft.format} • {draft.status}
                              </p>
                            </div>

                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800/60 font-mono text-[11px]">
                              <span className="text-zinc-500">Created Jun 12</span>
                              <span className={`font-bold ${
                                draft.status === 'published' ? 'text-emerald-400' :
                                draft.status === 'ready' ? 'text-amber-400' : 'text-purple-400'
                              }`}>
                                {draft.status === 'published' ? 'Published' : draft.status === 'ready' ? 'Ready' : 'Draft'}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
                    </div>

                  </motion.div>
                )}

                {/* 5. PERFIL DE MARCA & CONEXÕES */}
                {activeStudioTab === 'profile' && (
                  <motion.div
                    key="studio-profile"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left"
                  >
                    
                    {/* FORMULÁRIO DE MARCA */}
                    <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-6 shadow-sm">
                      <div className="border-b border-zinc-800/80 pb-4">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Settings className="h-5 w-5 text-indigo-400" />
                          Perfil de Marca & Voz do Criador
                        </h4>
                        <p className="text-xs text-zinc-400 mt-1">
                          Essas diretrizes orientam o <strong>Google Gemini Pro</strong> a criar cópias autênticas e alinhadas ao seu posicionamento.
                        </p>
                      </div>

                      <form onSubmit={handleSaveProfile} className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">Nicho de Atuação</label>
                          <input
                            type="text"
                            value={profileForm.niche}
                            onChange={(e) => setProfileForm({ ...profileForm, niche: e.target.value })}
                            placeholder="Ex: Inteligência Artificial, Finanças, Produtividade..."
                            className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">Público-Alvo Ideal</label>
                          <input
                            type="text"
                            value={profileForm.target_audience}
                            onChange={(e) => setProfileForm({ ...profileForm, target_audience: e.target.value })}
                            placeholder="Ex: Founders, Profissionais de Tech, Estudantes..."
                            className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">Tom de Voz</label>
                          <input
                            type="text"
                            value={profileForm.voice_tone}
                            onChange={(e) => setProfileForm({ ...profileForm, voice_tone: e.target.value })}
                            placeholder="Ex: Direto, inspirador, técnico sem jargões excessivos..."
                            className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">Pilares de Conteúdo (separados por vírgula)</label>
                          <input
                            type="text"
                            value={profileForm.content_pillars}
                            onChange={(e) => setProfileForm({ ...profileForm, content_pillars: e.target.value })}
                            placeholder="Ex: Ferramentas de IA, Automação No-Code, Carreira Tech"
                            className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 font-mono">Objetivos com o Conteúdo</label>
                          <textarea
                            rows={3}
                            value={profileForm.objectives}
                            onChange={(e) => setProfileForm({ ...profileForm, objectives: e.target.value })}
                            placeholder="Ex: Gerar leads para consultoria, construir autoridade, atrair seguidores qualificados..."
                            className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 transition"
                          />
                        </div>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={studioLoading}
                          className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono transition shadow-lg shadow-indigo-600/20"
                        >
                          {studioLoading ? 'Salvando...' : 'Salvar Perfil de Marca'}
                        </motion.button>
                      </form>
                    </div>

                    {/* REDES SOCIAIS CONECTADAS & OAUTH */}
                    <div className="space-y-6">
                      <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
                        <h4 className="text-base font-bold text-white flex items-center gap-2">
                          <Link className="h-5 w-5 text-indigo-400" />
                          Canais de Distribuição & Redes Conectadas
                        </h4>
                        <p className="text-xs text-zinc-400">
                          Conecte suas contas para habilitar automações de DM e publicação com 1 clique direto do seu estúdio.
                        </p>

                        {/* INSTAGRAM STATUS */}
                        <div className="p-4 bg-[#09090b] border border-zinc-800 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 rounded-xl text-white">
                              <Instagram className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">Instagram Graph API</span>
                              <span className="text-[11px] text-zinc-400">Automações de DM & Publicação de Posts/Reels</span>
                            </div>
                          </div>
                          {config ? (
                            <span className="text-xs text-emerald-400 font-bold px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                              Conectado
                            </span>
                          ) : (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleConnect}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                            >
                              Conectar
                            </motion.button>
                          )}
                        </div>

                        {/* LINKEDIN STATUS */}
                        <div className="p-4 bg-[#09090b] border border-zinc-800 rounded-2xl flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-blue-600 rounded-xl text-white">
                              <ExternalLink className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-white block">LinkedIn Community API</span>
                              <span className="text-[11px] text-zinc-400">Publicação de Artigos e Posts com 1 clique</span>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleConnectLinkedIn}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-sm"
                          >
                            Conectar
                          </motion.button>
                        </div>
                      </div>
                    </div>

                  </motion.div>
                )}

              </AnimatePresence>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MODAL NOVA AUTOMAÇÃO (FRAMER MOTION) */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              variants={modalSpringVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#121215] border border-zinc-800/90 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-10 overflow-hidden relative"
            >
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="h-8 w-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Zap className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-tight">Configurar Automação</h4>
                    <p className="text-xs text-zinc-400">Disparo automático para comentários e DMs.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg bg-zinc-800/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Nome da Regra</label>
                  <input
                    type="text"
                    required
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    placeholder="Ex: Enviar Ebook ao comentar QUERO"
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Palavras-Chave (separadas por vírgula)</label>
                  <input
                    type="text"
                    required
                    value={rawKeywords}
                    onChange={(e) => setRawKeywords(e.target.value)}
                    placeholder="QUERO, LINK, MATERIAL, EU"
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Mensagem de Boas-Vindas (DM)</label>
                  <textarea
                    rows={3}
                    required
                    value={formState.welcome_dm}
                    onChange={(e) => setFormState({ ...formState, welcome_dm: e.target.value })}
                    placeholder="Olá! Aqui está o link que você pediu..."
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Texto do Link</label>
                    <input
                      type="text"
                      value={formState.link_text || ''}
                      onChange={(e) => setFormState({ ...formState, link_text: e.target.value })}
                      placeholder="Acesse aqui"
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">URL de Destino</label>
                    <input
                      type="url"
                      value={formState.link_url || ''}
                      onChange={(e) => setFormState({ ...formState, link_url: e.target.value })}
                      placeholder="https://..."
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-800 pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-semibold"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={loading}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold shadow-md shadow-indigo-600/20"
                  >
                    {loading ? 'Salvando...' : 'Salvar Automação'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CRIAÇÃO DE IDEIA (FRAMER MOTION) */}
      <AnimatePresence>
        {isIdeaModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsIdeaModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              variants={modalSpringVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#121215] border border-zinc-800/90 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-10 overflow-hidden relative text-left"
            >
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Lightbulb className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-tight">Criar Nova Ideia</h4>
                    <p className="text-xs text-zinc-400">Capture um insight para seu Segundo Cérebro.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsIdeaModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg bg-zinc-800/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveIdea} className="p-6 overflow-y-auto space-y-4 flex-1">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Título ou Insight</label>
                  <input
                    type="text"
                    required
                    value={ideaForm.title}
                    onChange={(e) => setIdeaForm({ ...ideaForm, title: e.target.value })}
                    placeholder="Ex: 5 erros fatais de quem cria conteúdo com IA..."
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Pilar / Canal</label>
                  <input
                    type="text"
                    value={ideaForm.pillar}
                    onChange={(e) => setIdeaForm({ ...ideaForm, pillar: e.target.value })}
                    placeholder="Ex: Inteligência Artificial, Finanças, Carreira"
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Descrição ou Notas (Opcional)</label>
                  <textarea
                    rows={4}
                    value={ideaForm.description}
                    onChange={(e) => setIdeaForm({ ...ideaForm, description: e.target.value })}
                    placeholder="Detalhes ou referências que você pensou para este tema..."
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-sans"
                  />
                </div>

                <div className="border-t border-zinc-800 pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsIdeaModalOpen(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-semibold"
                  >
                    Cancelar
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={studioLoading}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold shadow-md shadow-emerald-600/20"
                  >
                    {studioLoading ? 'Salvando...' : 'Salvar Ideia'}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE CRIAÇÃO E EDIÇÃO DE RASCUNHO (FRAMER MOTION) */}
      <AnimatePresence>
        {isDraftModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDraftModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              variants={modalSpringVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#121215] border border-zinc-800/90 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-10 overflow-hidden relative"
            >
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="h-8 w-8 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
                    <PenLine className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white tracking-tight">Estúdio de Criação de Conteúdo</h4>
                    <p className="text-xs text-zinc-400">Escreva, humanize e gere roteiros completos com IA.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDraftModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg bg-zinc-800/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveDraft} className="p-6 overflow-y-auto space-y-6 flex-1 text-left">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Título do Conteúdo</label>
                    <input
                      type="text"
                      required
                      value={draftForm.title}
                      onChange={(e) => setDraftForm({ ...draftForm, title: e.target.value })}
                      placeholder="Ex: Como economizar 10 horas semanais com IA..."
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Plataforma & Formato</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={draftForm.platform}
                        onChange={(e) => setDraftForm({ ...draftForm, platform: e.target.value as any })}
                        className="bg-[#09090b] border border-zinc-800 rounded-xl px-2.5 py-2.5 text-xs text-white font-mono"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="tiktok">TikTok</option>
                      </select>
                      <select
                        value={draftForm.format}
                        onChange={(e) => setDraftForm({ ...draftForm, format: e.target.value as any })}
                        className="bg-[#09090b] border border-zinc-800 rounded-xl px-2.5 py-2.5 text-xs text-white font-mono"
                      >
                        <option value="post">Post</option>
                        <option value="reels">Reels</option>
                        <option value="carousel">Carrossel</option>
                        <option value="text">Texto</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* BOTÕES DE REFINAMENTO RÁPIDO COM IA */}
                <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-[#09090b] border border-zinc-800/80 rounded-2xl">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-indigo-400" />
                    <span className="text-[11px] font-bold text-zinc-300 font-mono">Refinador de IA:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleRefineDraft('humanize')}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 rounded-lg text-[11px] font-bold font-mono transition"
                    >
                      Humanizar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleRefineDraft('engagement')}
                      className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/20 rounded-lg text-[11px] font-bold font-mono transition"
                    >
                      Mais Gancho
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleRefineDraft('shorten')}
                      className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded-lg text-[11px] font-bold font-mono transition"
                    >
                      Encurtar
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={handleGenerateScript}
                      disabled={isGeneratingScript}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold font-mono transition flex items-center gap-1 shadow-sm"
                    >
                      {isGeneratingScript ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                      Gerar com IA
                    </motion.button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 font-mono">Conteúdo do Post / Legenda</label>
                  <textarea
                    rows={8}
                    required
                    value={draftForm.content}
                    onChange={(e) => setDraftForm({ ...draftForm, content: e.target.value })}
                    placeholder="Escreva ou gere seu conteúdo aqui..."
                    className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-4 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans"
                  />
                </div>

                {draftForm.format === 'reels' && (
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5 font-mono">Roteiro Visual & Cenas</label>
                    <textarea
                      rows={4}
                      value={draftForm.visual_script}
                      onChange={(e) => setDraftForm({ ...draftForm, visual_script: e.target.value })}
                      placeholder="Cena 1: Mostrando a tela do computador..."
                      className="w-full bg-[#09090b] border border-zinc-800 rounded-xl p-4 text-xs text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-indigo-500 font-mono text-[11px]"
                    />
                  </div>
                )}

                <div className="border-t border-zinc-800 pt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {draftForm.media_url ? (
                      <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Imagem anexada
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGenerateAIImage}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-mono flex items-center gap-1 font-semibold"
                      >
                        <Image className="h-3.5 w-3.5" /> + Gerar Imagem com IA
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setIsDraftModalOpen(false)}
                      className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-mono font-semibold"
                    >
                      Cancelar
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={studioLoading}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-mono font-bold shadow-md shadow-indigo-600/20"
                    >
                      {studioLoading ? 'Salvando...' : 'Salvar no Estúdio'}
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL DE SUGESTÕES DE IA (BRAINSTORM) */}
      <AnimatePresence>
        {showAiSuggestionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAiSuggestionsModal(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              variants={modalSpringVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#121215] border border-zinc-800/90 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-10 overflow-hidden relative"
            >
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-left">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    💡
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Brainstorm com Google Gemini Pro</h4>
                    <p className="text-xs text-zinc-400">Sugestões de temas e ganchos personalizados para o seu nicho.</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiSuggestionsModal(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg bg-zinc-800/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4 flex-1 text-left">
                {isAiSuggestionsLoading ? (
                  <div className="py-12 text-center space-y-3">
                    <RefreshCw className="h-8 w-8 text-indigo-400 animate-spin mx-auto" />
                    <p className="text-xs text-zinc-400 font-mono">Gerando ideias estratégicas com IA...</p>
                  </div>
                ) : aiSuggestions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500 italic">
                    Nenhuma ideia retornada. Tente novamente.
                  </div>
                ) : (
                  aiSuggestions.map((ai, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-[#09090b] border border-zinc-800/80 rounded-2xl space-y-3"
                    >
                      <div>
                        <span className="text-[9px] font-bold px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono uppercase">
                          {ai.pillar || 'Geral'}
                        </span>
                        <h5 className="font-bold text-white text-xs mt-1.5">{ai.title}</h5>
                        <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">{ai.reasoning}</p>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800/60">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          type="button"
                          onClick={() => handleAddAiIdeaToBacklog(ai)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-mono font-bold transition shadow-sm"
                        >
                          + Salvar no Backlog
                        </motion.button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CRONOGRAMA ESTRATÉGICO DA SEMANA (FRAMER MOTION) */}
      <AnimatePresence>
        {isScheduleModalOpen && schedulePlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScheduleModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              variants={modalSpringVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#121215] border border-zinc-800/90 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.4)] z-10 overflow-hidden relative text-left"
            >
              <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-2 rounded-xl text-indigo-400">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      Cronograma Semanal Estratégico
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold font-mono">
                        {schedulePlan.weeklyFrequency}
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-400">Ordem, horários e pilares recomendados para maximizar alcance e conversão.</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="text-zinc-500 hover:text-white p-1 rounded-lg bg-zinc-800/50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto space-y-6">
                {/* Resumo da Estratégia */}
                <div className="bg-[#09090b] border border-zinc-800 p-4 rounded-2xl space-y-1">
                  <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-widest font-mono">Estratégia Recomendada para o seu Nicho</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">{schedulePlan.strategySummary}</p>
                </div>

                {/* Lista de Dias e Horários */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schedulePlan.items?.map((item: any, idx: number) => (
                    <motion.div 
                      key={idx} 
                      whileHover={{ y: -2 }}
                      className="bg-[#09090b] border border-zinc-800/80 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-zinc-700 transition"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-extrabold text-white flex items-center gap-1.5 font-mono">
                            📅 {item.dayOfWeek} às {item.recommendedTime}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-md font-bold uppercase font-mono">
                            {item.platform} • {item.format}
                          </span>
                        </div>

                        {item.pillar && (
                          <span className="text-[11px] text-zinc-400 block font-semibold font-mono">
                            Pilar: <span className="text-indigo-300">{item.pillar}</span>
                          </span>
                        )}

                        <h5 className="font-bold text-white text-xs leading-snug">{item.suggestedTopic}</h5>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{item.reasoning}</p>
                      </div>

                      <motion.button
                        whileTap={{ scale: 0.97 }}
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
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold font-mono transition flex items-center justify-center gap-1.5 shadow"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        + Rascunhar este Post
                      </motion.button>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-[#09090b]/80 border-t border-zinc-800 text-right">
                <button
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white transition rounded-xl text-xs font-semibold font-mono"
                >
                  Fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
