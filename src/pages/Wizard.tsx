import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { EmbeddedChat } from '../components/GeminiChat';

interface WizardStep {
    id: string;
    title: string;
    subtitle: string;
    fields?: { key: string; label: string; placeholder: string; type?: string }[];
    options?: { value: string; label: string; icon?: string }[];
    field?: string;
    isTextArea?: boolean;
    placeholder?: string;
    type?: string;
}

const formatWhatsApp = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/\D/g, '');
    if (phoneNumber.length <= 2) return phoneNumber;
    if (phoneNumber.length <= 6) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2)}`;
    if (phoneNumber.length <= 10) return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 6)}-${phoneNumber.slice(6)}`;
    return `(${phoneNumber.slice(0, 2)}) ${phoneNumber.slice(2, 7)}-${phoneNumber.slice(7, 11)}`;
};

const Wizard = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>({
        name: '',
        email: '',
        company: '',
        whatsapp: '',
        project_type: '',
        requirements: '',
        budget_range: ''
    });
    const [loading, setLoading] = useState(false);
    const [leadId, setLeadId] = useState<string | null>(null);
    const navigate = useNavigate();

    const steps: WizardStep[] = [
        {
            id: 'intro',
            title: 'Quem é você?',
            subtitle: 'Como o time da GYODA deve te chamar?',
            fields: [
                { key: 'name', label: 'Nome Completo', placeholder: 'Ex: Romualdo Silva' },
                { key: 'email', label: 'Email Corporativo', placeholder: 'seu@empresa.com', type: 'email' },
                { key: 'whatsapp', label: 'WhatsApp', placeholder: '(11) 99999-9999' },
                { key: 'company', label: 'Nome da Empresa', placeholder: 'Sua Empresa S.A.' }
            ]
        },
        {
            id: 'type',
            title: 'Tipo de Projeto',
            subtitle: 'Qual solução você busca hoje?',
            options: [
                { value: 'web', label: 'Web Application', icon: '🌐' },
                { value: 'mobile', label: 'Mobile App', icon: '📱' },
                { value: 'ai', label: 'Sistemas de IA', icon: '🧠' },
                { value: 'other', label: 'Outro / Consultoria', icon: '🛠️' }
            ]
        },
        {
            id: 'details',
            title: 'Requisitos',
            subtitle: 'Conte-nos sua visão e os objetivos principais.',
            field: 'requirements',
            isTextArea: true,
            placeholder: 'Gostaria de desenvolver uma plataforma que...'
        },
        {
            id: 'budget',
            title: 'Investimento',
            subtitle: 'Qual a faixa de investimento disponível?',
            options: [
                { value: '5-15k', label: 'R$ 5k - R$ 15k' },
                { value: '15-50k', label: 'R$ 15k - R$ 50k' },
                { value: '50k+', label: 'Acima de R$ 50k' }
            ]
        }
    ];

    const currentStep = steps[step];

    const submitLead = async (isFinal = false) => {
        if (loading) return;
        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                company: formData.company,
                whatsapp: formData.whatsapp,
                project_type: formData.project_type,
                requirements: formData.requirements,
                budget_range: formData.budget_range,
                status: isFinal ? 'proposed' : 'capturing'
            };

            if (leadId) {
                const { error } = await supabase.from('leads').update(payload).eq('id', leadId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase.from('leads').insert(payload).select().single();
                if (error) throw error;
                if (data) {
                    setLeadId(data.id);
                    if (isFinal) navigate(`/proposal/${data.id}`);
                }
            }

            if (isFinal && leadId) navigate(`/proposal/${leadId}`);
        } catch (error) {
            console.error('Error saving lead:', error);
            if (isFinal) alert(error instanceof Error ? error.message : 'Ocorreu um erro ao gerar a proposta');
        } finally {
            setLoading(false);
        }
    };

    const handleNext = async () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
            await submitLead(false);
        } else {
            await submitLead(true);
        }
    };

    const handleBack = () => step > 0 && setStep(step - 1);

    return (
        <div className="min-h-screen bg-[#050507] text-white flex overflow-hidden font-sans selection:bg-blue-500/30 selection:text-blue-200">
            <SEO title="Novo Projeto" description="Descreva seu projeto para receber uma proposta personalizada." />

            {/* Sidebar - Chat (Desktop only) */}
            <div className="wizard-sidebar-desktop" style={{
                flex: 1,
                backgroundColor: '#0a0a0c',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                position: 'relative',
                overflow: 'hidden',
                borderRight: '1px solid var(--border)',
                height: '100vh'
            }}>
                {/* Decorative Image Background */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundImage: 'url("/images/tech_support_v2.png")',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: 0.12,
                    filter: 'grayscale(100%) brightness(0.4)',
                    pointerEvents: 'none'
                }}></div>

                {/* Layered Gradients for Depth */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'radial-gradient(circle at center, rgba(37, 99, 235, 0.15) 0%, transparent 70%), linear-gradient(to bottom, rgba(10, 10, 12, 0.8) 0%, transparent 40%, rgba(10, 10, 12, 0.8) 100%)',
                    pointerEvents: 'none'
                }}></div>

                <div style={{
                    width: '100%',
                    maxWidth: '450px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2.5rem',
                    zIndex: 2
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', justifyContent: 'center' }}>
                            {[0, 1, 2, 3].map(i => (
                                <div key={i} style={{ width: i === step ? '40px' : '10px', height: '4px', background: i === step ? 'var(--accent)' : 'rgba(255,255,255,0.2)', borderRadius: '2px', transition: '0.3s' }}></div>
                            ))}
                        </div>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', margin: '0 0 0.75rem 0', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                            Atendimento <span style={{ color: 'var(--accent)' }}>Inteligente</span>
                        </h2>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.05rem', margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
                            Dúvidas sobre o projeto? Nossa IA está pronta para ajudar você agora.
                        </p>
                    </div>

                    <div style={{
                        width: '100%',
                        height: '550px',
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '2.5rem',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(15, 15, 18, 0.6)',
                        backdropFilter: 'blur(12px)'
                    }}>
                        <EmbeddedChat />
                    </div>
                </div>
            </div>

            {/* Form Section */}
            <div style={{ flex: 1.2, display: 'flex', flexDirection: 'column', padding: '4rem' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6rem' }}>
                    <div className="logo" onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <img src="/logo_g.svg" alt="Gyoda Logo" style={{ width: '28px', height: '28px', objectFit: 'contain' }} />
                        <span className="logo-text" style={{ fontSize: '1.25rem' }}>GYODA</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-foreground)' }}>Progresso</div>
                            <div style={{ fontSize: '1rem', fontWeight: 900, color: 'white' }}>{Math.round(((step + 1) / steps.length) * 100)}% concluído</div>
                        </div>
                    </div>
                </header>

                <main style={{ maxWidth: '600px', width: '100%', margin: '0 auto' }}>
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                        >
                            <h1 style={{ fontSize: '3rem', marginBottom: '1rem', fontWeight: 900, letterSpacing: '-0.05em' }}>{currentStep.title}</h1>
                            <p style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem', marginBottom: '4rem' }}>{currentStep.subtitle}</p>

                            <div style={{ display: 'grid', gap: '2rem' }}>
                                {currentStep.fields?.map(f => (
                                    <div key={f.key} className="input-group">
                                        <label className="label">{f.label}</label>
                                        <input
                                            className="input"
                                            type={f.type || 'text'}
                                            value={formData[f.key] || ''}
                                            onChange={(e) => {
                                                let value = e.target.value;
                                                if (f.key === 'whatsapp') {
                                                    value = formatWhatsApp(value);
                                                }
                                                setFormData({ ...formData, [f.key]: value });
                                            }}
                                            placeholder={f.placeholder}
                                            style={{ padding: '1.25rem' }}
                                        />
                                    </div>
                                ))}

                                {currentStep.options?.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`btn ${formData.project_type === opt.value || formData.budget_range === opt.value ? 'btn-accent' : 'btn-outline'} `}
                                        style={{ justifyContent: 'flex-start', padding: '1.5rem 2rem', border: '1px solid var(--border)', color: 'white' }}
                                        onClick={() => {
                                            if (currentStep.id === 'type') setFormData({ ...formData, project_type: opt.value });
                                            if (currentStep.id === 'budget') setFormData({ ...formData, budget_range: opt.value });
                                        }}
                                    >
                                        {opt.icon && <span style={{ marginRight: '1.5rem', fontSize: '1.5rem' }}>{opt.icon}</span>}
                                        <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{opt.label}</span>
                                        {(formData.project_type === opt.value || formData.budget_range === opt.value) && (
                                            <CheckCircle2 size={20} style={{ marginLeft: 'auto' }} />
                                        )}
                                    </button>
                                ))}

                                {currentStep.isTextArea && (
                                    <div className="input-group">
                                        <label className="label">Descrição Detalhada</label>
                                        <textarea
                                            className="input"
                                            style={{ minHeight: '200px', padding: '1.5rem', resize: 'none' }}
                                            value={formData[currentStep.field || ''] || ''}
                                            onChange={(e) => setFormData({ ...formData, [currentStep.field as string]: e.target.value })}
                                            placeholder={currentStep.placeholder}
                                        />
                                    </div>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '5rem' }}>
                                {step > 0 && (
                                    <button className="btn btn-outline btn-lg" style={{ flex: 1, color: 'white', padding: '1.25rem' }} onClick={handleBack}>
                                        <ArrowLeft size={22} /> Voltar
                                    </button>
                                )}
                                <button
                                    className="btn btn-accent btn-lg"
                                    style={{ flex: 2, padding: '1.25rem' }}
                                    onClick={handleNext}
                                    disabled={loading}
                                >
                                    {loading ? <Loader2 className="animate-spin" /> : step === steps.length - 1 ? 'Finalizar e Gerar Proposta' : 'Próxima Etapa'}
                                    {!loading && (step === steps.length - 1 ? <Sparkles size={22} /> : <ArrowRight size={22} />)}
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </main>

                <footer style={{ marginTop: 'auto', paddingTop: '4rem', display: 'flex', justifyContent: 'center', gap: '3rem', opacity: 0.5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <CheckCircle2 size={16} /> Dados Protegidos
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem' }}>
                        <CheckCircle2 size={16} /> Suporte Prioritário
                    </div>
                </footer>
            </div>

            {/* Global style for temporary media queries in inline styles approach */}
            <style>{`
@media(max-width: 1024px) {
    .wizard-sidebar-desktop { display: none!important; }
}
@media(min-width: 1025px) {
    .wizard-sidebar-desktop { display: block!important; }
}
`}</style>
            <style>{`
@media(max-width: 1024px) {
    .wizard-sidebar-desktop { display: none !important; }
}
@media(min-width: 1025px) {
    .wizard-sidebar-desktop { display: flex !important; }
}
`}</style>
        </div>
    );
};

export default Wizard;
