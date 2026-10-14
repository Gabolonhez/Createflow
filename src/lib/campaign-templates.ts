import type { DmMatchMode } from '@/types';

export interface DmPresetTemplate {
  id: string;
  title: string;
  category: string;
  badge: string;
  summary: string;
  keywords: string[];
  matchType: DmMatchMode;
  openingDmEnabled: boolean;
  openingDmMessage: string;
  openingDmButtonLabel: string;
  dmMessage: string;
  cardImageUrl: string;
  cardTitle: string;
  cardSubtitle: string;
  linkButtonLabel: string;
  targetUrl: string;
  secondaryButtonLabel?: string;
  secondaryTargetUrl?: string;
  requireFollow: boolean;
  followPromptMessage: string;
  followPromptButtonLabel: string;
  followUpEnabled: boolean;
  followUpMessage: string;
  followUpDelayMinutes: number;
  publicReplyEnabled: boolean;
  publicReplyMessages: string[];
}

export const CAMPAIGN_PRESET_TEMPLATES: DmPresetTemplate[] = [
  {
    id: 'lead-magnet-guide',
    title: 'Entrega de Isca Digital / E-book / Guia',
    category: 'Geração de Leads',
    badge: 'Mais Popular',
    summary: 'Envie um PDF, Notion, planilha ou e-book gratuito para quem comentar na postagem.',
    keywords: ['GUIA', 'EU QUERO', 'MATERIAL', 'PDF'],
    matchType: 'contains',
    openingDmEnabled: true,
    openingDmMessage: 'Oi {username}! Tudo bem? Toque no botão abaixo para eu liberar o seu guia gratuito direto aqui:',
    openingDmButtonLabel: 'Quero o Guia! 🚀',
    dmMessage: 'Perfeito, {username}! Aqui está o seu material exclusivo em alta qualidade. Basta tocar para acessar:',
    cardImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
    cardTitle: 'Guia Completo de Alta Performance',
    cardSubtitle: 'Acesse o passo a passo prático para aplicar no seu negócio hoje.',
    linkButtonLabel: 'Baixar Guia Grátis',
    targetUrl: 'https://createflow.ai',
    secondaryButtonLabel: 'Entrar na Comunidade',
    secondaryTargetUrl: 'https://t.me/seugrupo',
    requireFollow: true,
    followPromptMessage: 'Ei {username}! Para receber o link oficial, siga o nosso perfil e toque em "Já segui" abaixo:',
    followPromptButtonLabel: 'Já segui ✅',
    followUpEnabled: true,
    followUpMessage: 'E aí {username}, conseguiu abrir o material? Qualquer dúvida sobre a implementação me dá um toque!',
    followUpDelayMinutes: 20,
    publicReplyEnabled: true,
    publicReplyMessages: [
      'Te mandei o material no direct! Dá uma olhada 🚀',
      'Acabei de enviar na sua DM, confere lá! ✨',
      'Link enviado no privado com sucesso! 📩',
      'Prontinho! Dá uma olhadinha no seu direct 🔥',
    ],
  },
  {
    id: 'product-sales-checkout',
    title: 'Envio de Link de Produto / Checkout Direto',
    category: 'E-commerce & Vendas',
    badge: 'Alta Conversão',
    summary: 'Converta comentários de alta intenção como LINK ou COMPRAR diretamente na página do produto.',
    keywords: ['LINK', 'QUERO', 'COMPRAR', 'PREÇO'],
    matchType: 'contains',
    openingDmEnabled: false,
    openingDmMessage: 'Oi {username}! Quer o link direto para garantir com as condições especiais do Reels?',
    openingDmButtonLabel: 'Sim, me envia! 🛍️',
    dmMessage: 'Fala {username}! Aqui está o link oficial com o desconto exclusivo para seguidores:',
    cardImageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
    cardTitle: 'Produto Oficial - Edição Limitada',
    cardSubtitle: 'Garantia de 30 dias + frete prioritário liberado hoje.',
    linkButtonLabel: 'Comprar com Desconto',
    targetUrl: 'https://sualoja.com.br/produto',
    secondaryButtonLabel: 'Ver Tabela de Medidas',
    secondaryTargetUrl: 'https://sualoja.com.br/tabela',
    requireFollow: false,
    followPromptMessage: 'Siga nosso perfil para desbloquear o cupom de desconto exclusivo!',
    followPromptButtonLabel: 'Já segui ✅',
    followUpEnabled: true,
    followUpMessage: 'Oi {username}! Ficou com alguma dúvida sobre o tamanho, prazos de entrega ou pagamento?',
    followUpDelayMinutes: 30,
    publicReplyEnabled: true,
    publicReplyMessages: [
      'Link enviado na sua DM com frete prioritário! 📦',
      'Mandei o acesso direto no seu privado! Confere lá ✨',
      'Te mandei o link com as condições especiais no direct! 🚀',
    ],
  },
  {
    id: 'event-webinar-rsvp',
    title: 'Inscrição em Live / Masterclass / Webinar',
    category: 'Lançamentos & Eventos',
    badge: 'Lançamentos',
    summary: 'Garanta assentos e inscrições para eventos ao vivo diretamente pelo comentário do seguidor.',
    keywords: ['AULA', 'AOVIVO', 'VOU', 'EVENTO'],
    matchType: 'contains',
    openingDmEnabled: true,
    openingDmMessage: 'Fala {username}! A aula magna será 100% online e gratuita. Deseja garantir seu lugar na sala VIP?',
    openingDmButtonLabel: 'Reservar Meu Lugar 🎟️',
    dmMessage: 'Show {username}! Sua vaga inicial foi pré-reservada. Toque abaixo para confirmar seu e-mail e receber o link:',
    cardImageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
    cardTitle: 'Masterclass Exclusiva - Ao Vivo',
    cardSubtitle: 'Aprenda as novas estratégias práticas na transmissão oficial.',
    linkButtonLabel: 'Confirmar Inscrição Gratuita',
    targetUrl: 'https://seuevento.com.br/inscricao',
    requireFollow: true,
    followPromptMessage: 'Para receber os alertas no privado quando entrarmos ao vivo, siga nosso perfil e confirme:',
    followPromptButtonLabel: 'Já segui ✅',
    followUpEnabled: true,
    followUpMessage: 'Lembrando que as vagas na sala Zoom são limitadas! Conseguiu preencher seus dados na página?',
    followUpDelayMinutes: 15,
    publicReplyEnabled: true,
    publicReplyMessages: [
      'Vaga pré-reservada! Te mandei o link no direct 🎟️',
      'Confere seu direct para garantir sua cadeira na aula! 🚀',
      'Inscrição enviada nas suas mensagens privadas! ✨',
    ],
  },
  {
    id: 'discount-coupon',
    title: 'Distribuição de Cupom de Desconto Secreto',
    category: 'Campanhas Promocionais',
    badge: 'Engajamento',
    summary: 'Estimule centenas de comentários entregando um cupom secreto com gatilho de urgência.',
    keywords: ['CUPOM', 'DESCONTO', 'PROMO', 'OFF'],
    matchType: 'contains',
    openingDmEnabled: false,
    openingDmMessage: 'Oi {username}! Liberamos 15% OFF exclusivo para quem comentar. Quer o código?',
    openingDmButtonLabel: 'Quero o Cupom! 🏷️',
    dmMessage: 'Aqui está seu cupom secreto, {username}! Use o código especial no checkout:',
    cardImageUrl: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=600&q=80',
    cardTitle: 'CUPOM 15% OFF: VIP15',
    cardSubtitle: 'Válido apenas nas próximas 24 horas para todos os produtos do site.',
    linkButtonLabel: 'Usar Cupom no Site',
    targetUrl: 'https://sualoja.com.br?cupom=VIP15',
    requireFollow: true,
    followPromptMessage: 'O cupom é restrito aos seguidores da nossa página! Siga o perfil e toque em "Já segui":',
    followPromptButtonLabel: 'Já segui ✅',
    followUpEnabled: true,
    followUpMessage: 'Passando pra avisar que o cupom expira em breve! Conseguiu aproveitar?',
    followUpDelayMinutes: 60,
    publicReplyEnabled: true,
    publicReplyMessages: [
      'Cupom enviado no seu direct! Aproveite antes que expire 🔥',
      'Código secreto enviado na sua DM! 🏷️',
      'Te mandei o cupom com 15% OFF no privado! 💸',
    ],
  },
  {
    id: 'whatsapp-consulting',
    title: 'Qualificação & Transição para o WhatsApp',
    category: 'Serviços & Consultoria',
    badge: 'High-Ticket',
    summary: 'Leve leads qualificados diretamente para o WhatsApp pessoal ou da sua equipe de vendas.',
    keywords: ['CONSULTORIA', 'FALAR', 'WHATSAPP', 'ORÇAMENTO'],
    matchType: 'contains',
    openingDmEnabled: true,
    openingDmMessage: 'Olá {username}! Quer falar diretamente com um de nossos especialistas no WhatsApp?',
    openingDmButtonLabel: 'Falar no WhatsApp 💬',
    dmMessage: 'Excelente, {username}! Nosso time já está a postos para te atender. Toque no botão para abrir a conversa:',
    cardImageUrl: 'https://images.unsplash.com/photo-1556745757-8d76bdb6984b?w=600&q=80',
    cardTitle: 'Atendimento Personalizado',
    cardSubtitle: 'Tire dúvidas e receba um diagnóstico exclusivo 1-a-1.',
    linkButtonLabel: 'Abrir Conversa no WhatsApp',
    targetUrl: 'https://wa.me/5511999999999?text=Vim%20pelo%20Instagram%20e%20gostaria%20de%20um%20atendimento',
    requireFollow: false,
    followPromptMessage: 'Siga nosso perfil para acompanhar as análises semanais!',
    followPromptButtonLabel: 'Já segui ✅',
    followUpEnabled: true,
    followUpMessage: 'Conseguiu iniciar o contato com nosso especialista pelo WhatsApp?',
    followUpDelayMinutes: 30,
    publicReplyEnabled: true,
    publicReplyMessages: [
      'Te mandei o contato direto no direct! Fale com a gente 📲',
      'Link do WhatsApp enviado na sua DM! ✨',
      'Confere seu direct, te mandei o acesso exclusivo! 💬',
    ],
  },
];
