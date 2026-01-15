import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

const Wizard = () => {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState<Record<string, string>>({
        name: '',
        email: '',
        company: '',
        project_type: '',
        requirements: '',
        budget_range: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const steps: WizardStep[] = [
        {
            id: 'intro',
            title: 'Quem é você?',
            subtitle: 'Como o time da GYODA deve te chamar?',
            fields: [
                { key: 'name', label: 'Nome Completo', placeholder: 'Ex: Romualdo Silva' },
                { key: 'email', label: 'Email Corporativo', placeholder: 'seu@empresa.com', type: 'email' },
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

    const handleNext = () => {
        if (step < steps.length - 1) setStep(step + 1);
        else submitLead();
    };

    const handleBack = () => step > 0 && setStep(step - 1);

    const submitLead = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.from('leads').insert({
                name: formData.name,
                email: formData.email,
                company: formData.company,
                project_type: formData.project_type,
                requirements: formData.requirements,
                budget_range: formData.budget_range,
                status: 'proposed'
            }).select().single();

            if (error) throw error;
            navigate(`/proposal/${data.id}`);
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Ocorreu um erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    const currentStep = steps[step];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--background)' }}>
            {/* Sidebar Image */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }} className="wizard-sidebar-desktop">
                <img
                    src="/gyoda_wizard_sidebar_1768307751860.png"
                    alt="Onboarding"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, var(--background))' }}></div>
                <div style={{ position: 'absolute', bottom: '4rem', left: '4rem', maxWidth: '400px' }}>
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} style={{ width: i === step ? '40px' : '10px', height: '4px', background: i === step ? 'var(--accent)' : 'rgba(255,255,255,0.2)', borderRadius: '2px', transition: '0.3s' }}></div>
                        ))}
                    </div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, color: 'white', letterSpacing: '-0.05em' }}>{currentStep.title}</h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem', marginTop: '1rem' }}>Sua jornada para um software de elite começa aqui.</p>
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
                                            onChange={(e) => setFormData({ ...formData, [f.key]: e.target.value })}
                                            placeholder={f.placeholder}
                                            style={{ padding: '1.25rem' }}
                                        />
                                    </div>
                                ))}

                                {currentStep.options?.map(opt => (
                                    <button
                                        key={opt.value}
                                        className={`btn ${formData.project_type === opt.value || formData.budget_range === opt.value ? 'btn-accent' : 'btn-outline'}`}
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
                                    {loading ? <Loader2 className="icon-spin" /> : step === steps.length - 1 ? 'Finalizar e Gerar Proposta' : 'Próxima Etapa'}
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
                @media (max-width: 1024px) {
                    .wizard-sidebar-desktop { display: none !important; }
                }
                @media (min-width: 1025px) {
                    .wizard-sidebar-desktop { display: block !important; }
                }
            `}</style>
        </div>
    );
};

export default Wizard;
