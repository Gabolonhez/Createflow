import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'placeholder-key';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY && !process.env.SUPABASE_SERVICE_KEY && !process.env.SUPABASE_SECRET_KEY) {
  if (process.env.NODE_ENV !== 'production' || process.env.NEXT_RUNTIME) {
    console.warn('[Supabase] AVISO: SUPABASE_SERVICE_ROLE_KEY não encontrada nas variáveis de ambiente. Usando chave anon (sujeita a RLS).');
  }
}

// Cria cliente Supabase de servidor (utilizando service key para burlar RLS de forma segura no servidor)
export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
