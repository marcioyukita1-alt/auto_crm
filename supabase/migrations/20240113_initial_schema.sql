-- Profiles table to store user information
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    company_name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- CRM Settings for each user
CREATE TABLE public.crm_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    branding JSONB DEFAULT '{"primary_color": "#000000", "logo_url": null}'::JSONB,
    proposal_template TEXT,
    contract_template TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.crm_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings" ON public.crm_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.crm_settings
    FOR ALL USING (auth.uid() = user_id);

-- Leads table
CREATE TABLE public.leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    company_name TEXT,
    contact_name TEXT,
    email TEXT,
    phone TEXT,
    service_details JSONB,
    status TEXT DEFAULT 'new', -- 'new', 'info_gathered', 'proposal_sent', 'contract_signed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own leads" ON public.leads
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Leads can be created by anyone (for the wizard)" ON public.leads
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own leads" ON public.leads
    FOR UPDATE USING (auth.uid() = user_id);

-- Storage bucket for logos/docs (Optional setup)
-- INSERT INTO storage.buckets (id, name) VALUES ('crm-assets', 'crm-assets');
