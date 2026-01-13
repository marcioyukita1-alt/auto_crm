import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Users, Settings, LogOut, TrendingUp, DollarSign, Eye, Save, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('leads');
    const [leads, setLeads] = useState<any[]>([]);
    const [config, setConfig] = useState<any>({});
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Fetch Leads
        const { data: leadData } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (leadData) setLeads(leadData);

        // Fetch Config
        const { data: configData } = await supabase.from('config').select('*');
        const configObj = configData?.reduce((acc: any, curr: any) => ({ ...acc, [curr.key]: curr.value }), {});
        setConfig(configObj || { base_prices: { web: 5000, mobile: 7000, ai: 12000 }, proposal_template: { footer: 'GYODA Softwares - 2026' } });
    };

    const handleSaveConfig = async () => {
        setSaving(true);
        try {
            await supabase.from('config').upsert({ key: 'base_prices', value: config.base_prices });
            await supabase.from('config').upsert({ key: 'proposal_template', value: config.proposal_template });
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => supabase.auth.signOut().then(() => navigate('/'));

    const stats = {
        totalLeads: leads.length,
        conversion: leads.filter(l => l.status === 'paid').length,
        revenue: leads.filter(l => l.status === 'paid').reduce((acc, curr) => acc + (config.base_prices?.[curr.project_type] || 0), 0)
    };

    return (
        <div className="dashboard-layout" style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            {/* Sidebar */}
            <aside className="glass" style={{ width: '300px', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', padding: '2.5rem 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4rem' }}>
                    <div className="logo-icon" style={{ background: 'var(--accent)', color: 'white', width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <TrendingUp size={18} />
                    </div>
                    <span className="logo-text" style={{ fontSize: '1.5rem', fontWeight: 800 }}>GYODA Admin</span>
                </div>

                <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <NavItem active={activeTab === 'leads'} onClick={() => setActiveTab('leads')} icon={<Users size={22} />} label="Vendas" />
                    <NavItem active={activeTab === 'config'} onClick={() => setActiveTab('config')} icon={<Settings size={22} />} label="Configurar Preços" />
                </nav>

                <button onClick={handleLogout} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', border: '1px solid #ef444433', color: '#ef4444', fontWeight: 600, cursor: 'pointer', marginTop: 'auto', background: '#ef44440a', borderRadius: '0.75rem' }}>
                    <LogOut size={20} /> Sair do Sistema
                </button>
            </aside>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '4rem 6rem', overflowY: 'auto' }}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5rem' }}>
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '0.5rem' }}>{activeTab === 'leads' ? 'Pipeline de Leads' : 'Configurações'}</h1>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.125rem' }}>Controle total sobre o funil de vendas da GYODA.</p>
                    </div>

                    <div style={{ display: 'flex', gap: '2.5rem' }}>
                        <StatSmall label="Leads" value={stats.totalLeads} />
                        <StatSmall label="Conversões" value={stats.conversion} />
                        <StatSmall label="Receita" value={`R$ ${stats.revenue.toLocaleString()}`} accent />
                    </div>
                </header>

                {activeTab === 'leads' ? (
                    <div style={{ display: 'grid', gap: '1.25rem' }}>
                        {leads.length === 0 && <p style={{ textAlign: 'center', padding: '4rem', color: 'var(--muted-foreground)' }}>Nenhum lead capturado ainda.</p>}
                        {leads.map(lead => (
                            <div key={lead.id} className="feature-card" style={{ padding: '1.5rem 3rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                                    <div style={{ width: '60px', height: '60px', background: 'var(--background)', borderRadius: '1.25rem', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 900, color: 'var(--accent)', borderLeft: '5px solid var(--accent)' }}>
                                        {lead.company?.[0]?.toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700 }}>{lead.company}</h4>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.95rem', color: 'var(--muted-foreground)' }}>{lead.name} • {lead.email}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '4rem' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="hero-tag" style={{ margin: 0, padding: '0.4rem 1rem', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                                            {lead.project_type === 'ai' ? '🤖 Sist. IA' : (lead.project_type === 'web' ? '🌐 Web App' : '📱 Mobile')}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                        <span style={{
                                            fontSize: '0.8rem',
                                            fontWeight: 900,
                                            padding: '0.5rem 1rem',
                                            borderRadius: '0.75rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.05em',
                                            background: lead.status === 'paid' ? '#064e3b' : (lead.status === 'proposed' ? '#1e3a8a' : '#27272a'),
                                            color: lead.status === 'paid' ? '#34d399' : (lead.status === 'proposed' ? '#60a5fa' : 'white')
                                        }}>
                                            {lead.status === 'paid' ? 'Pago' : (lead.status === 'proposed' ? 'Aguardando' : lead.status)}
                                        </span>
                                        <button onClick={() => navigate(`/proposal/${lead.id}`)} className="btn-outline" style={{ padding: '0.75rem', color: 'white', borderRadius: '0.75rem' }}><Eye size={22} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '3rem', alignItems: 'start' }}>
                        <div className="feature-card" style={{ padding: '3rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
                                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}><DollarSign size={24} color="var(--accent)" /> Tabela de Preços Ativa</h3>
                                <button
                                    onClick={handleSaveConfig}
                                    className="btn btn-accent"
                                    disabled={saving}
                                    style={{ padding: '12px 24px' }}
                                >
                                    {saving ? 'Gravando...' : (success ? <div style={{ display: 'flex', gap: '8px' }}><CheckCircle size={18} /> Salvo!</div> : <div style={{ display: 'flex', gap: '8px' }}><Save size={18} /> Salvar Alterações</div>)}
                                </button>
                            </div>

                            <div style={{ display: 'grid', gap: '2rem' }}>
                                <PriceInput
                                    label="Web Application (Base)"
                                    value={config.base_prices?.web}
                                    onChange={(v: number) => setConfig({ ...config, base_prices: { ...config.base_prices, web: v } })}
                                />
                                <PriceInput
                                    label="Mobile Application (Base)"
                                    value={config.base_prices?.mobile}
                                    onChange={(v: number) => setConfig({ ...config, base_prices: { ...config.base_prices, mobile: v } })}
                                />
                                <PriceInput
                                    label="Sistemas de IA e Automação"
                                    value={config.base_prices?.ai}
                                    onChange={(v: number) => setConfig({ ...config, base_prices: { ...config.base_prices, ai: v } })}
                                />
                            </div>
                        </div>

                        <div className="feature-card" style={{ padding: '3rem' }}>
                            <h3 style={{ marginBottom: '2rem' }}>Configuração de Proposta</h3>
                            <div className="input-group">
                                <label className="label">Rodapé das Propostas (Legal/Copyright)</label>
                                <textarea
                                    className="input"
                                    style={{ minHeight: '120px', resize: 'none' }}
                                    value={config.proposal_template?.footer}
                                    onChange={(e) => setConfig({ ...config, proposal_template: { ...config.proposal_template, footer: e.target.value } })}
                                />
                            </div>
                            <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                Essas informações aparecem no fim de todas as propostas enviadas automaticamente.
                            </p>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

const NavItem = ({ active, icon, label, onClick }: any) => (
    <button onClick={onClick} className="btn" style={{ background: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: active ? 'white' : 'var(--muted-foreground)', justifyContent: 'flex-start', padding: '1.25rem 1.5rem', border: active ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent', borderRadius: '1rem', width: '100%', gap: '1rem' }}>
        <div style={{ color: active ? 'var(--accent)' : 'inherit' }}>{icon}</div>
        <span style={{ fontSize: '1.1rem', fontWeight: active ? 700 : 500 }}>{label}</span>
    </button>
);

const StatSmall = ({ label, value, accent }: any) => (
    <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--muted-foreground)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.1em' }}>{label}</div>
        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: accent ? 'var(--accent)' : 'white' }}>{value}</div>
    </div>
);

const PriceInput = ({ label, value, onChange }: any) => {
    return (
        <div className="input-group" style={{ margin: 0 }}>
            <label className="label" style={{ marginBottom: '1rem' }}>{label}</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '1.5rem', fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent)' }}>R$</span>
                <input
                    className="input"
                    style={{ paddingLeft: '4.5rem', fontSize: '1.25rem', fontWeight: 700 }}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
            </div>
        </div>
    );
};

export default Dashboard;
