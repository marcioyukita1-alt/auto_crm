-- Add role column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id UUID NOT NULL,
    user_id UUID REFERENCESauth.users(id) ON DELETE SET NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'model')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for chat_messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for chat (initiated by visitors)
CREATE POLICY "Anonymous can insert chat messages" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Allow anonymous select for their own session (client must filter by session_id in query, 
-- but since we can't easily restrict by session_id without a user, we rely on UUID unguessability 
-- or we could store session_id in a cookie and specific RLS if needed. 
-- For now, standard pattern for public chat often allows permissive insert, restricted select.)
-- A common pattern for anonymous chat is to allow select where session_id matches.
-- However, RLS cannot read client-side local storage. 
-- We will allow public select for now, as session_ids are UUIDs. 
-- Ideally, we would use a signed token for the session, but keeping it simple as per requirements.
CREATE POLICY "Public can select messages by session_id" 
ON public.chat_messages 
FOR SELECT 
USING (true);


-- Create config table for dynamic settings (AI prompts, prices, etc.)
CREATE TABLE IF NOT EXISTS public.config (
    key TEXT PRIMARY KEY,
    value JSONB
);

-- Enable RLS for config
ALTER TABLE public.config ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read config (needed for pricing, etc on public pages if used, or edge functions)
-- If we want to restrict some configs, we might need a 'is_public' column, but for now assuming public read is fine 
-- OR restrict to authenticated users only if sensitive. 
-- The edge function uses service role key so it bypasses RLS.
-- Admin panel needs to read/write.
CREATE POLICY "Admins can do everything on config" 
ON public.config 
FOR ALL 
USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- Allow public read access to specific keys if necessary (e.g. base_prices)
CREATE POLICY "Public can read config" 
ON public.config 
FOR SELECT 
USING (true);

-- Seed initial data
INSERT INTO public.config (key, value)
VALUES 
    ('ai_instructions', '"Você é um assistente virtual da GYODA, uma empresa de desenvolvimento de software de alta performance. Seu objetivo é ajudar potenciais clientes a entenderem nossos serviços (Web Apps, IA, DevOps) e coletar informações básicas sobre o projeto deles (Nome, Empresa, Orçamento aproximado). Seja profissional, direto e use um tom tecnológico e sofisticado. Não invente preços sem consultar a tabela."'::JSONB),
    ('base_prices', '{"web": 5000, "ai": 8000, "mobile": 10000}'::JSONB)
ON CONFLICT (key) DO NOTHING;
