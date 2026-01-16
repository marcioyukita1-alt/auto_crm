import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.22.0"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { message, history } = await req.json()
        const geminiApiKey = Deno.env.get('GEMINI_API_KEY') || ''
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

        if (!geminiApiKey) throw new Error('GEMINI_API_KEY is missing')
        if (!supabaseUrl || !supabaseServiceRoleKey) throw new Error('Supabase config is missing')

        // Create Supabase client with Auth context to identify user
        const authHeader = req.headers.get('Authorization')
        if (!authHeader) {
            // Allow anon access, but we won't have user context
        }

        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)
        const genAI = new GoogleGenerativeAI(geminiApiKey)

        // Identify User
        let userContext = "";
        if (authHeader) {
            const supabaseAuth = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY') || '', {
                global: { headers: { Authorization: authHeader } }
            })
            const { data: { user } } = await supabaseAuth.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, company_name, email')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    userContext = `\n\nCONTEXTO DO CLIENTE ATUAL:\nNome: ${profile.full_name || 'Não informado'}\nEmpresa: ${profile.company_name || 'Não informada'}\nEmail: ${profile.email}\nUse essas informações para personalizar o atendimento, chamando-o pelo nome quando apropriado.`
                }
            }
        }

        // Fetch instructions from DB
        const { data: configData } = await supabase
            .from('config')
            .select('value')
            .eq('key', 'ai_instructions')
            .single()

        const baseInstruction = configData?.value || "Você é um assistente virtual da GYODA."
        const systemInstruction = baseInstruction + userContext

        // Priority list of stable models with better quotas
        const modelsToTry = [
            "gemini-1.5-flash",
            "gemini-pro"
        ];

        let lastError: any = null;

        for (const modelName of modelsToTry) {
            try {
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: systemInstruction
                });

                const chat = model.startChat({
                    history: history?.map((msg: any) => ({
                        role: msg.role === 'user' ? 'user' : 'model',
                        parts: [{ text: msg.parts }],
                    })) || [],
                })

                const result = await chat.sendMessage(message)
                const response = await result.response
                const text = response.text()

                return new Response(
                    JSON.stringify({ text }),
                    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
                )
            } catch (e) {
                console.warn(`Model ${modelName} failed:`, e)
                lastError = e
                // If it's a quota error (429), we stop trying other models to avoid unnecesary calls
                if (e.message?.includes('429')) {
                    break;
                }
            }
        }

        throw lastError || new Error("All models failed")
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
