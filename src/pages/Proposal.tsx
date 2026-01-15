import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, CreditCard, Download, FileText, Loader2, Rocket, ShieldCheck, Info } from 'lucide-react';
import type { Database } from '../types/supabase';

type Lead = Database['public']['Tables']['leads']['Row'];

const Proposal = () => {
    const { id } = useParams();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [prices, setPrices] = useState<Record<string, number>>({});
    const [acceptedContract, setAcceptedContract] = useState(false);
    const [showTerms, setShowTerms] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            // Fetch lead
            const { data: leadData, error: leadError } = await supabase.from('leads').select('*').eq('id', id).single();
            if (leadError) {
                alert('Proposta não encontrada.');
                return;
            }
            setLead(leadData);

            // Fetch prices from config
            const { data: configData } = await supabase.from('config').select('*').eq('key', 'base_prices').single();
            if (configData) setPrices(configData.value as Record<string, number>);

            setLoading(false);
        };
        fetchData();
    }, [id]);

    const handlePayment = async () => {
        if (!acceptedContract) {
            alert('Por favor, aceite os termos do contrato para continuar.');
            return;
        }
        setLoading(true);
        // Simulate Stripe Checkout
        alert('Simulando redirecionamento para o checkout seguro do Stripe...');

        await supabase.from('leads').update({ status: 'paid' }).eq('id', id);

        setTimeout(() => {
            setLoading(false);
            alert('Sucesso! Pagamento processado e projeto iniciado na GYODA.');
            navigate('/');
        }, 2000);
    };

    if (loading) return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--background)' }}>
            <Loader2 className="icon-spin" size={48} color="var(--accent)" />
        </div>
    );

    const basePrice = prices[lead?.project_type as string] || 5000;
    const deliveryTime = lead?.project_type === 'ai' ? '4 a 6 semanas' : '3 a 5 semanas';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--background)', color: 'white', padding: '4rem 1rem' }}>
            <SEO title="Proposta Técnica" />
            <div className="container" style={{ maxWidth: '800px' }}>
                <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <FileText size={48} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.05em' }}>Proposta Técnica</h1>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem' }}>Para: <span style={{ color: 'white', fontWeight: 700 }}>{lead?.company}</span> ({lead?.name})</p>
                    </motion.div>
                </header>

                <main className="glass" style={{ padding: '3rem', borderRadius: '2.5rem' }}>
                    <section style={{ marginBottom: '3.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Rocket size={22} color="var(--accent)" /> Visão Estratégica
                        </h3>
                        <div style={{ marginBottom: '2rem', borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--border)', height: '250px' }}>
                            <img src="/gyoda_hero_tech_abstract_1768306538996.png" alt="Engineering" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ padding: '2rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1.25rem', border: '1px solid var(--border)', lineHeight: '1.6' }}>
                            <p style={{ color: '#d1d1d6', margin: 0 }}>{lead?.requirements}</p>
                        </div>
                    </section>

                    <section style={{ marginBottom: '3.5rem' }}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Metodologia e Entregáveis</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <BenefitItem text="Arquitetura de Microserviços" />
                            <BenefitItem text="Interface UI/UX de Alta Performance" />
                            <BenefitItem text="Segurança de Dados e RLS" />
                            <BenefitItem text="Infraestrutura Serverless Escalável" />
                        </div>
                    </section>

                    <section style={{ padding: '2.5rem', background: 'rgba(59, 130, 246, 0.05)', borderRadius: '1.5rem', border: '1px solid rgba(59, 130, 246, 0.2)', marginBottom: '3.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            <input
                                type="checkbox"
                                id="contract"
                                checked={acceptedContract}
                                onChange={(e) => setAcceptedContract(e.target.checked)}
                                style={{ width: '20px', height: '20px', accentColor: 'var(--accent)', cursor: 'pointer' }}
                            />
                            <label htmlFor="contract" style={{ fontSize: '1rem', fontWeight: 600, cursor: 'pointer' }}>
                                Li e concordo com os <button onClick={() => setShowTerms(true)} style={{ color: 'var(--accent)', background: 'none', border: 'none', padding: 0, fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}>Termos de Adesão e Contrato Prestação de Serviços GYODA</button>.
                            </label>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', margin: 0 }}>
                            Ao marcar esta caixa, você formaliza o interesse no desenvolvimento e autoriza o processamento inicial.
                        </p>
                    </section>

                    <footer style={{ paddingTop: '3rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
                        <div>
                            <span className="label">Investimento Total</span>
                            <div style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--accent)' }}>
                                R$ {basePrice.toLocaleString('pt-BR')}
                            </div>
                            <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>Início imediato após confirmação • Prazo: {deliveryTime}</p>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <button className="btn btn-outline btn-lg" style={{ color: 'white' }}><Download size={20} /> PDF</button>
                            <button
                                onClick={handlePayment}
                                className={`btn btn-lg ${acceptedContract ? 'btn-accent' : ''} `}
                                style={{ opacity: acceptedContract ? 1 : 0.5, cursor: acceptedContract ? 'pointer' : 'not-allowed', padding: '1rem 2rem' }}
                            >
                                <CreditCard size={20} /> Iniciar Projeto Agora
                            </button>
                        </div>
                    </footer>
                </main>

                <div style={{ marginTop: '4rem', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '4rem' }}>
                    <Badge icon={<ShieldCheck size={20} />} text="Garantia de Entrega" />
                    <Badge icon={<Info size={20} />} text="Suporte 24/7" />
                    <Badge icon={<Check size={20} />} text="Propriedade do Código" />
                </div>
            </div>

            <AnimatePresence>
                {showTerms && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}
                        onClick={() => setShowTerms(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="wizard-box glass"
                            style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}
                            onClick={e => e.stopPropagation()}
                        >
                            <h2 style={{ marginBottom: '1.5rem' }}>Instrumento Particular de Prestação de Serviços</h2>
                            <div style={{ fontSize: '0.875rem', color: '#a1a1aa', lineHeight: '1.7' }}>
                                <p>Este contrato regula a prestação de serviços de desenvolvimento de software pela GYODA Softwares.</p>
                                <p><strong>1. Objeto:</strong> Desenvolvimento do sistema descrito nos requisitos técnicos desta proposta.</p>
                                <p><strong>2. Pagamento:</strong> O valor total será processado via Stripe conforme modalidade escolhida.</p>
                                <p><strong>3. Propriedade Intelectual:</strong> Após quitação integral, o código-fonte pertence integralmente ao CONTRATANTE.</p>
                                <p><strong>4. Prazo:</strong> As datas são estimativas baseadas na complexidade informada.</p>
                                <button className="btn btn-accent" style={{ width: '100%', marginTop: '2rem' }} onClick={() => { setAcceptedContract(true); setShowTerms(false); }}>Aceitar e Fechar</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const BenefitItem = ({ text }: { text: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '1rem', color: '#a1a1aa' }}>
        <div style={{ color: 'var(--accent)' }}><Check size={20} /></div>
        {text}
    </div>
);

const Badge = ({ icon, text }: { icon: React.ReactNode, text: string }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--muted-foreground)', fontSize: '1rem' }}>
        {icon} {text}
    </div>
);

export default Proposal;
