export type Platform = 'x' | 'linkedin';

export type PostStatus = 
  | 'DRAFT' 
  | 'AWAITING_APPROVAL' 
  | 'SCHEDULED' 
  | 'PUBLISHING' 
  | 'PUBLISHED' 
  | 'REJECTED' 
  | 'ERROR';

export type ThreadStyle = 'single' | 'thread' | 'continuation';

export interface VoiceCheckItem {
  code: string;
  message: string;
}

export interface VoiceCheck {
  level: 'ok' | 'warn';
  message?: string;
  items: VoiceCheckItem[];
  samplesAnalyzed?: number;
}

export interface CreatorPost {
  id: string;
  text: string;
  thread: string[];
  threadStyle: ThreadStyle;
  platforms: Platform[];
  status: PostStatus;
  pillar?: string;
  mediaUrls: string[];
  scheduledFor?: string | null;
  publishedAt?: string | null;
  xPostId?: string | null;
  xPostUrl?: string | null;
  linkedinPostId?: string | null;
  linkedinPostUrl?: string | null;
  voiceCheck?: VoiceCheck;
  factId?: string | null;
  ideaId?: string | null;
  referenceUrl?: string | null;
  rejectReason?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostIdea {
  id: string;
  title: string;
  note: string;
  platforms: Platform[];
  pillar?: string | null;
  status: 'NEW' | 'DRAFTED' | 'DISCARDED';
  created_at: string;
  updated_at?: string;
}

export interface Topic {
  id: string;
  title: string;
  hook_angle: string;
  pillar: string;
  platforms: Platform[];
  created_at: string;
}

export interface Fact {
  id: string;
  category: string;
  subject: string;
  detail: string;
  created_at: string;
}

export interface Reference {
  id: string;
  url: string;
  platform: Platform;
  author: string;
  text: string;
  hook_analysis?: string;
  structure?: string;
  reusable_template?: string;
  created_at: string;
}

export interface PostingSlot {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  time: string; // "09:00", "15:30"
  platforms: Platform[];
}

export interface VoiceProfile {
  id: string;
  creator_name: string;
  handle_x: string;
  linkedin_name: string;
  headline: string;
  bio: string;
  pillars: string[];
  tone_traits: string[];
  forbidden_words: string[];
  writing_samples: string[];
  posting_slots: PostingSlot[];
  auto_publish_x: boolean;
  auto_publish_linkedin: boolean;
}

export interface AiLearning {
  id: string;
  lesson: string;
  category: 'tone' | 'structure' | 'topics' | 'formatting';
  source: 'rejection' | 'manual_edit';
  created_at: string;
}

export interface ConnectionsConfig {
  id: string;
  x_connected: boolean;
  x_username?: string;
  x_publish_mode: 'automatic' | 'manual';
  x_api_key?: string;
  x_bearer_token?: string;
  linkedin_connected: boolean;
  linkedin_name?: string;
  linkedin_profile_id?: string;
  linkedin_access_token?: string;
  linkedin_expires_at?: string;
  linkedin_publish_mode: 'automatic' | 'manual';
}

export type MainSection = 'plan' | 'ideas' | 'voice' | 'results' | 'settings';

export type PlanSubView = 'posts' | 'calendar';
export type IdeasSubView = 'my-ideas' | 'topics' | 'facts' | 'references';
export type VoiceSubView = 'manual' | 'learnings';
export type ResultsSubView = 'performance';
export type SettingsSubView = 'connection';

export type ActiveSubView = 
  | PlanSubView 
  | IdeasSubView 
  | VoiceSubView 
  | ResultsSubView 
  | SettingsSubView;
