import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare,
    Users,
    Search,
    Bell,
    Settings,
    LogOut,
    ChevronRight,
    TrendingUp,
    Menu,
    Trash2,
    Loader2,
    X,
    Headset,
    Send
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

interface Lead {
    id: string;
    name: string | null;
    email: string | null;
    company: string | null;
    whatsapp: string | null;
    project_type: string | null;
    budget_range: string | null;
    status: string | null;
    created_at: string | null;
}

interface ChatMessage {
    id: string;
    session_id: string;
    role: 'user' | 'model';
    content: string;
    created_at: string;
}

interface ChatSession {
    session_id: string;
    last_message: string;
    last_message_at: string;
    message_count: number;
    messages: ChatMessage[];
}

export default function Admin() {
    const [activeTab, setActiveTab] = useState<'leads' | 'chats' | 'support' | 'settings'>('leads');
    const [leads, setLeads] = useState<Lead[]>([]);
    const navigate = useNavigate();
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [supportMessages, setSupportMessages] = useState<any[]>([]);
    const [supportInput, setSupportInput] = useState('');
    const [aiInstructions, setAiInstructions] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [basePrices, setBasePrices] = useState<{ ai: number, web: number, mobile: number }>({ ai: 0, web: 0, mobile: 0 });
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Fetch Leads
            const { data: leadsData } = await supabase
                .from('leads')
                .select('*')
                .order('created_at', { ascending: false });

            if (leadsData) setLeads(leadsData);

            // Fetch Chat Messages
            const { data: messagesData } = await supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (messagesData) {
                // Group by Session
                const sessionsMap = new Map<string, ChatSession>();

                messagesData.forEach((msg: ChatMessage) => {
                    const current = sessionsMap.get(msg.session_id) || {
                        session_id: msg.session_id,
                        last_message: '',
                        last_message_at: '',
                        message_count: 0,
                        messages: []
                    };

                    current.messages.push(msg);
                    current.message_count++;
                    current.last_message = msg.content;
                    current.last_message_at = msg.created_at;

                    sessionsMap.set(msg.session_id, current);
                });

                const sessionsArray = Array.from(sessionsMap.values()).sort((a, b) =>
                    new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
                );

                setSessions(sessionsArray);
            }

            // Fetch AI Instructions
            const { data: configData } = await supabase
                .from('config')
                .select('value')
                .eq('key', 'ai_instructions')
                .single();

            if (configData) {
                setAiInstructions(configData.value as string);
            }

            // Fetch Base Prices
            const { data: pricesData } = await supabase
                .from('config')
                .select('value')
                .eq('key', 'base_prices')
                .single();

            if (pricesData) {
                setBasePrices(pricesData.value as any);
            }

        } catch (err) {
            console.error('Error fetching admin data:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch Support Messages when lead is selected
    useEffect(() => {
        if (!selectedLeadId) {
            setSupportMessages([]);
            return;
        }

        const fetchSupportMessages = async () => {
            const { data } = await supabase
                .from('support_messages')
                .select('*')
                .eq('lead_id', selectedLeadId)
                .order('created_at', { ascending: true });

            if (data) setSupportMessages(data);
        };

        fetchSupportMessages();

        const subscription = supabase
            .channel(`admin_support_${selectedLeadId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'support_messages',
                filter: `lead_id=eq.${selectedLeadId}`
            }, (payload) => {
                setSupportMessages(prev => [...prev, payload.new]);
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, [selectedLeadId]);

    const handleSendSupportMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!supportInput.trim() || !selectedLeadId) return;

        const content = supportInput.trim();
        setSupportInput('');

        try {
            const { error } = await supabase
                .from('support_messages')
                .insert({
                    lead_id: selectedLeadId,
                    content,
                    sender_type: 'admin'
                });
            if (error) throw error;
        } catch (err) {
            console.error('Error sending support message:', err);
            alert('Erro ao enviar mensagem.');
        }
    };

    const checkUser = useCallback(async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            navigate('/auth');
            return;
        }

        // Check if user is admin
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

        if (profile?.role !== 'admin') {
            navigate('/');
            return;
        }

        fetchData();
    }, [navigate, fetchData]);

    useEffect(() => {
        checkUser();
    }, [checkUser]);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/auth');
    };

    const handleDeleteSession = async (sessionId: string) => {
        if (!confirm('Tem certeza que deseja excluir esta conversa permanentemente?')) return;

        try {
            const { error } = await supabase
                .from('chat_messages')
                .delete()
                .eq('session_id', sessionId);

            if (error) throw error;

            setSessions(prev => prev.filter(s => s.session_id !== sessionId));
            if (selectedSessionId === sessionId) setSelectedSessionId(null);
            alert('Conversa excluída com sucesso!');
        } catch (err) {
            console.error('Error deleting session:', err);
            alert('Erro ao excluir conversa.');
        }
    };

    const handleExportCSV = () => {
        if (leads.length === 0) return;

        const headers = ['ID', 'Nome', 'Email', 'Empresa', 'Tipo de Projeto', 'Orçamento', 'Status', 'Data'];
        const rows = leads.map(l => [
            l.id,
            l.name || '',
            l.email || '',
            l.company || '',
            l.project_type || '',
            l.budget_range || '',
            l.status || '',
            l.created_at || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `leads_gyoda_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const StatCard = ({ title, value, icon: Icon, trend, trendValue }: { title: string, value: string, icon: React.ElementType, trend?: 'up' | 'down', trendValue?: string }) => (
        <div
            className="bg-[#1c1c24] rounded-2xl border border-white/[0.05] relative overflow-hidden group hover:border-blue-500/30 transition-all shadow-lg" style={{ padding: '20px' }}>
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{title}</p>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
                    {trendValue && (
                        <div className="flex items-center gap-1.5 mt-2">
                            <span className={`text-[10px] font-bold flex items-center gap-0.5 px-2 py-0.5 rounded-full ${trend === 'up' ? 'text-green-400 bg-green-500/10' : 'text-red-400 bg-red-500/10'
                                }`}>
                                {trend === 'up' ? '↑' : '↓'} {trendValue}
                            </span>
                            <span className="text-[9px] text-gray-400 font-medium">vs. mês anterior</span>
                        </div>
                    )}
                </div>
                <div className="p-3 bg-white/[0.03] rounded-xl text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-all">
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            {/* Subtle bottom gradient */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/0 to-transparent group-hover:via-blue-500/30 transition-all"></div>
        </div>
    );

    const handleSaveAIInstructions = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('config')
                .update({ value: aiInstructions })
                .eq('key', 'ai_instructions');

            if (error) throw error;
            alert('Instruções da IA atualizadas com sucesso!');
        } catch (err) {
            console.error('Error saving AI instructions:', err);
            alert('Erro ao salvar instruções da IA.');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveBasePrices = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('config')
                .update({ value: basePrices })
                .eq('key', 'base_prices');

            if (error) throw error;
            alert('Preços base atualizados com sucesso!');
        } catch (err) {
            console.error('Error saving base prices:', err);
            alert('Erro ao salvar preços base.');
        } finally {
            setSaving(false);
        }
    };

    const filteredLeads = leads.filter(l => {
        const matchesSearch = !searchTerm ||
            (l.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                l.company?.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || l.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const SidebarItem = ({ id, label, icon: Icon }: { id: 'leads' | 'chats' | 'settings' | 'support', label: string, icon: React.ElementType }) => (
        <button
            onClick={() => {
                setActiveTab(id);
                setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center space-x-3 py-3 rounded-xl transition-all duration-200 group ${activeTab === id
                ? 'bg-blue-600/10 text-blue-500 shadow-sm'
                : 'text-gray-400 hover:bg-white/[0.03] hover:text-white'
                }`}
            style={{ paddingLeft: '32px', paddingRight: '32px' }}
        >
            <Icon className={`w-4 h-4 transition-colors ${activeTab === id ? 'text-blue-500' : 'text-gray-500 group-hover:text-white'}`} />
            <span className="font-semibold text-sm tracking-tight">{label}</span>
        </button>
    );

    if (loading) {
        return (
            <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050507' }}>
                <Loader2 className="animate-spin" size={48} color="#00f2ff" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#050507] overflow-hidden">
            <SEO title="Admin Dashboard" />
            <div
                className="bg-[#0a0a0c] text-white overflow-hidden font-sans relative border border-white/[0.08]"
                style={{
                    position: 'fixed',
                    inset: '10px',
                    borderRadius: '32px',
                    display: 'flex',
                    boxShadow: '0 0 60px rgba(0,0,0,0.9)'
                }}
            >
                {/* Mobile Sidebar Overlay */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
                        />
                    )}
                </AnimatePresence>

                {/* Mobile Sidebar */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 left-0 w-72 bg-[#121218] border-r border-white/5 z-50 flex flex-col md:hidden"
                        >
                            <div className="p-6 flex justify-between items-center border-b border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                                        <img src="/logo_g.svg" alt="Gyoda" className="w-full h-full object-contain" />
                                    </div>
                                    <span className="text-lg font-bold">Admin<span className="text-blue-500">Panel</span></span>
                                </div>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="flex-1 px-4 py-6 overflow-y-auto">
                                <nav className="space-y-2">
                                    <SidebarItem id="leads" label="Gerenciar Leads" icon={Users} />
                                    <SidebarItem id="chats" label="Conversas IA" icon={MessageSquare} />
                                    <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                                        <Settings className="w-5 h-5" />
                                        <span className="font-semibold text-sm">Configurações</span>
                                    </button>
                                </nav>
                            </div>
                            <div className="p-4 border-t border-white/5">
                                <button
                                    onClick={handleSignOut}
                                    className="flex items-center space-x-3 text-gray-400 hover:text-red-400 w-full px-4 py-3 rounded-xl hover:bg-red-500/10 transition-all"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-semibold text-sm">Sair</span>
                                </button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Desktop Sidebar */}
                <aside className="w-64 bg-[#0c0c10] border-r border-white/[0.05] flex flex-col hidden md:flex shrink-0">
                    <div className="h-16 flex items-center px-10 border-b border-white/[0.03]">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center overflow-hidden">
                                <img src="/logo_g.svg" alt="Gyoda" className="w-full h-full object-contain" />
                            </div>
                            <span className="text-lg font-bold tracking-tight">Gyoda<span className="text-blue-500">Admin</span></span>
                        </div>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-7 overflow-y-auto custom-scrollbar">
                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-4 px-8 tracking-widest">Dashboard</p>
                            <nav className="space-y-1">
                                <SidebarItem id="leads" label="Leads" icon={Users} />
                                <SidebarItem id="support" label="Suporte Chat" icon={Headset} />
                                <SidebarItem id="chats" label="Conversas IA" icon={MessageSquare} />
                            </nav>
                        </div>

                        <div>
                            <p className="text-[10px] uppercase font-bold text-gray-400 mb-4 px-8 tracking-widest">Configurações</p>
                            <nav className="space-y-1">
                                <SidebarItem id="settings" label="Configurações IA" icon={Settings} />
                            </nav>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/[0.03]">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-3 text-gray-400 hover:text-red-400 w-full px-5 py-3 rounded-xl hover:bg-red-500/10 transition-all group"
                        >
                            <LogOut className="w-5 h-5 text-gray-500 group-hover:text-red-400" />
                            <span className="font-semibold text-sm tracking-tight">Sair</span>
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 flex flex-col overflow-hidden relative">
                    {/* Top Header */}
                    <header className="h-16 border-b border-white/[0.05] bg-[#0a0a0c]/80 backdrop-blur-md flex items-center justify-between px-12 z-20 sticky top-0">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="p-2 md:hidden text-gray-400 hover:text-white rounded-lg transition-all"
                            >
                                <Menu className="w-6 h-6" />
                            </button>
                            <div className="h-4 w-[1px] bg-white/10 hidden md:block mx-2"></div>
                            <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-widest">
                                {activeTab === 'leads' ? 'Dashboard' : 'Conversas IA'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="relative hidden lg:block">
                                <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Procurar leads..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="bg-[#16161f] border border-white/[0.05] rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 w-64 transition-all"
                                />
                            </div>
                            <div className="flex items-center gap-4">
                                <button className="p-2 text-gray-400 hover:text-white transition-all relative rounded-lg hover:bg-white/[0.03]">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full border border-[#0a0a0c]"></span>
                                </button>
                                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs font-bold text-white leading-none">Admin</p>
                                        <p className="text-[10px] text-gray-500 font-medium mt-1">Super Usuário</p>
                                    </div>
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center font-bold text-xs shadow-lg shadow-blue-500/10">
                                        AD
                                    </div>
                                </div>
                            </div>
                        </div>
                    </header>

                    <div
                        className="flex-1 overflow-y-auto px-4 custom-scrollbar bg-[#08080a]"
                    >
                        <div className="max-w-7xl mx-auto space-y-8">
                            {/* Welcome */}
                            <div className="flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-bold text-white tracking-tight">Bem-vindo, Admin</h1>
                                    <p className="text-gray-400 text-xs mt-1 font-medium">Visão geral do sistema e interações recentes.</p>
                                </div>
                                <div className="text-right hidden lg:block">
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Status do Sistema</p>
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/5 border border-green-500/10 rounded-lg">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)] animate-pulse" />
                                        <span className="text-[9px] font-bold text-green-500 uppercase tracking-wider">Operacional</span>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard
                                    title="Total de Leads"
                                    value={leads.length.toString()}
                                    icon={Users}
                                    trend="up"
                                    trendValue="12%"
                                />
                                <StatCard
                                    title="Conversas Salvas"
                                    value={sessions.length.toString()}
                                    icon={MessageSquare}
                                    trend="up"
                                    trendValue="5"
                                />
                                <StatCard
                                    title="Taxa de Conversão"
                                    value="24%"
                                    icon={TrendingUp}
                                    trend="up"
                                    trendValue="2%"
                                />
                            </div>

                            <AnimatePresence mode="wait">
                                {loading ? (
                                    <motion.div
                                        key="loading"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="flex flex-col justify-center items-center py-20 gap-4"
                                    >
                                        <div className="w-10 h-10 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                                        <p className="text-gray-500 text-sm">Carregando dados...</p>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key={activeTab}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {activeTab === 'leads' ? (
                                            <div className="bg-[#1c1c24] rounded-2xl border border-white/[0.05] overflow-hidden shadow-xl">
                                                <div
                                                    className="border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]"
                                                    style={{ padding: '32px 40px' }}
                                                >
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white tracking-tight">Leads Recentes</h3>
                                                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-widest mt-1">Visitantes que demonstraram interesse</p>
                                                    </div>
                                                    <div className="flex gap-3">
                                                        <select
                                                            value={statusFilter}
                                                            onChange={(e) => setStatusFilter(e.target.value)}
                                                            className="text-[10px] font-bold bg-[#16161f] text-gray-400 px-4 py-2 rounded-lg border border-white/[0.05] focus:outline-none focus:border-blue-500/50 uppercase tracking-widest cursor-pointer"
                                                        >
                                                            <option value="all">Todos Status</option>
                                                            <option value="capturing">Iniciando (MQL)</option>
                                                            <option value="completed">Finalizado (SQL)</option>
                                                        </select>
                                                        <button
                                                            onClick={handleExportCSV}
                                                            style={{ padding: '8px 20px' }}
                                                            className="text-[10px] font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all shadow-lg shadow-blue-600/10 uppercase tracking-widest"
                                                        >
                                                            Exportar CSV
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full">
                                                        <thead>
                                                            <tr className="bg-white/[0.01]">
                                                                <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left" style={{ padding: '12px 24px' }}>Data</th>
                                                                <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left" style={{ padding: '12px 24px' }}>Lead</th>
                                                                <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left" style={{ padding: '12px 24px' }}>WhatsApp</th>
                                                                <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left" style={{ padding: '12px 24px' }}>Empresa</th>
                                                                <th className="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-left" style={{ padding: '12px 24px' }}>Status</th>
                                                                <th className="text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right" style={{ padding: '12px 24px' }}>Ações</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-white/[0.02]">
                                                            {filteredLeads.map((lead) => (
                                                                <tr key={lead.id} className="hover:bg-white/[0.01] transition-colors group">
                                                                    <td className="text-[11px] text-gray-400 font-medium font-mono whitespace-nowrap" style={{ padding: '16px 24px' }}>
                                                                        {formatDate(lead.created_at)}
                                                                    </td>
                                                                    <td className="" style={{ padding: '16px 24px' }}>
                                                                        <div className="flex flex-col">
                                                                            <span className="text-sm font-semibold text-white tracking-tight">{lead.name || 'Sem Nome'}</span>
                                                                            <span className="text-[11px] text-gray-400 mt-0.5">{lead.email}</span>
                                                                        </div>
                                                                    </td>
                                                                    <td className="text-[11px] text-gray-300 font-mono" style={{ padding: '16px 24px' }}>{lead.whatsapp || '-'}</td>
                                                                    <td className="text-sm text-gray-300 font-medium" style={{ padding: '16px 24px' }}>{lead.company || '-'}</td>
                                                                    <td className="" style={{ padding: '16px 24px' }}>
                                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${lead.status === 'completed'
                                                                            ? 'text-green-400 bg-green-400/10'
                                                                            : 'text-blue-400 bg-blue-400/10'
                                                                            }`}>
                                                                            <div className={`w-1 h-1 rounded-full ${lead.status === 'completed' ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.4)]'}`} />
                                                                            {lead.status === 'completed' ? 'SQL' : 'MQL'}
                                                                        </span>
                                                                    </td>
                                                                    <td className="text-right" style={{ padding: '16px 24px' }}>
                                                                        <button className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-all border border-transparent">
                                                                            <ChevronRight className="w-4 h-4" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                            {filteredLeads.length === 0 && (
                                                                <tr>
                                                                    <td colSpan={6} className="px-8 py-16 text-center text-gray-600 text-xs font-medium italic">
                                                                        {leads.length === 0 ? 'Nenhum lead encontrado no sistema.' : 'Nenhum lead corresponde aos filtros aplicados.'}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        ) : activeTab === 'support' ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px] overflow-hidden">
                                                {/* Lead List for Support */}
                                                <div className="lg:col-span-4 xl:col-span-3 bg-[#1c1c24] rounded-2xl border border-white/[0.05] overflow-hidden flex flex-col shadow-xl">
                                                    <div className="p-4 border-b border-white/[0.05] bg-white/[0.01]">
                                                        <h3 className="text-[10px] font-bold text-white mb-3 uppercase tracking-widest opacity-80">Leads Ativos</h3>
                                                        <p className="text-[10px] text-gray-500 mb-4">Escolha um lead para prestar suporte.</p>
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 custom-scrollbar divide-y divide-white/[0.02]">
                                                        {leads.map((l) => (
                                                            <button
                                                                key={l.id}
                                                                onClick={() => setSelectedLeadId(l.id)}
                                                                className={`w-full text-left hover:bg-white/[0.03] transition-all group relative ${selectedLeadId === l.id
                                                                    ? 'bg-blue-600/10 border-r-4 border-blue-600'
                                                                    : 'border-r-4 border-transparent'
                                                                    }`}
                                                                style={{ padding: '16px 20px' }}
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className={`font-bold text-xs ${selectedLeadId === l.id ? 'text-blue-500' : 'text-white'}`}>
                                                                        {l.company || l.name || 'Sem Identificação'}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-400 line-clamp-1 font-medium">{l.email}</p>
                                                                <div className="flex items-center justify-between mt-2">
                                                                    <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${l.status === 'paid' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                                        {l.status === 'paid' ? 'Cliente' : 'Lead'}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Support Chat Detail */}
                                                <div className="lg:col-span-8 xl:col-span-9 bg-[#1c1c24] rounded-2xl border border-white/[0.05] overflow-hidden flex flex-col shadow-xl">
                                                    {selectedLeadId ? (
                                                        <>
                                                            <div className="border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01] p-4 px-6">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                                                                        <Headset className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold text-white text-sm">{leads.find(l => l.id === selectedLeadId)?.company}</h3>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className="text-[10px] text-gray-500 font-medium">{leads.find(l => l.id === selectedLeadId)?.name}</p>
                                                                            <span className="text-gray-700">•</span>
                                                                            <p className="text-[10px] text-blue-400 font-bold">{leads.find(l => l.id === selectedLeadId)?.whatsapp}</p>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar bg-black/10 p-6">
                                                                {supportMessages.length === 0 ? (
                                                                    <div className="flex flex-col items-center justify-center h-full text-gray-600 opacity-50">
                                                                        <MessageSquare className="w-12 h-12 mb-3" />
                                                                        <p className="text-sm">Nenhuma mensagem ainda.</p>
                                                                    </div>
                                                                ) : (
                                                                    supportMessages.map((msg) => (
                                                                        <div key={msg.id} className={`flex ${msg.sender_type === 'admin' ? 'justify-end' : 'justify-start'}`}>
                                                                            <div className={`max-w-[70%] ${msg.sender_type === 'admin' ? 'bg-blue-600 text-white' : 'bg-white/[0.08] text-gray-200'} p-4 rounded-2xl ${msg.sender_type === 'admin' ? 'rounded-br-none' : 'rounded-bl-none'} border border-white/[0.05] shadow-sm`}>
                                                                                <p className="text-sm leading-relaxed">{msg.content}</p>
                                                                                <p className="text-[9px] mt-2 opacity-50 font-bold tracking-widest uppercase">
                                                                                    {msg.sender_type === 'admin' ? 'Admin' : 'Cliente'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                            <form onSubmit={handleSendSupportMessage} className="p-4 bg-white/[0.01] border-t border-white/[0.05]">
                                                                <div className="flex gap-3">
                                                                    <input
                                                                        type="text"
                                                                        value={supportInput}
                                                                        onChange={(e) => setSupportInput(e.target.value)}
                                                                        placeholder="Digite sua resposta de suporte..."
                                                                        className="flex-1 bg-[#16161f] border border-white/[0.08] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                                                    />
                                                                    <button
                                                                        type="submit"
                                                                        disabled={!supportInput.trim()}
                                                                        className="p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-all disabled:opacity-50 disabled:grayscale"
                                                                    >
                                                                        <Send className="w-5 h-5" />
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        </>
                                                    ) : (
                                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                                            <div className="w-16 h-16 rounded-2xl bg-white/[0.01] flex items-center justify-center mb-6 border border-white/[0.03]">
                                                                <Headset className="w-8 h-8 text-gray-700" />
                                                            </div>
                                                            <h3 className="text-lg font-bold text-white mb-2">Selecione um Cliente</h3>
                                                            <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
                                                                Selecione um cliente na lista lateral para prestar assistência técnica em tempo real.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : activeTab === 'chats' ? (
                                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[700px] overflow-hidden">
                                                {/* Chat List */}
                                                <div className="lg:col-span-4 xl:col-span-3 bg-[#1c1c24] rounded-2xl border border-white/[0.05] overflow-hidden flex flex-col shadow-xl">
                                                    <div className="p-4 border-b border-white/[0.05] bg-white/[0.01]">
                                                        <h3 className="text-[10px] font-bold text-white mb-3 uppercase tracking-widest opacity-80">Conversas Recentes</h3>
                                                        <div className="relative">
                                                            <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                                            <input
                                                                type="text"
                                                                placeholder="Localizar..."
                                                                className="w-full bg-white/[0.03] border border-white/[0.08] rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500/50 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="overflow-y-auto flex-1 custom-scrollbar divide-y divide-white/[0.02]">
                                                        {sessions.map((session) => (
                                                            <button
                                                                key={session.session_id}
                                                                onClick={() => setSelectedSessionId(session.session_id)}
                                                                className={`w-full text-left hover:bg-white/[0.03] transition-all group relative ${selectedSessionId === session.session_id
                                                                    ? 'bg-blue-600/10 border-r-4 border-blue-600'
                                                                    : 'border-r-4 border-transparent'
                                                                    }`}
                                                                style={{ padding: '16px 20px' }}
                                                            >
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className={`font-bold text-[9px] uppercase tracking-wider ${selectedSessionId === session.session_id ? 'text-blue-500' : 'text-gray-500 group-hover:text-white'
                                                                        }`}>
                                                                        ID: {session.session_id.slice(-6)}
                                                                    </span>
                                                                    <span className="text-[8px] font-medium text-gray-600">
                                                                        {new Date(session.last_message_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-400 line-clamp-1 mb-1.5 font-medium">
                                                                    {session.last_message}
                                                                </p>
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center text-[8px] font-bold text-gray-600 gap-1.5 uppercase">
                                                                        <MessageSquare className="w-2.5 h-2.5" />
                                                                        {session.message_count} mensagens
                                                                    </div>
                                                                    <div className="w-1 h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.3)]" />
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Chat Detail */}
                                                <div className="lg:col-span-8 xl:col-span-9 bg-[#1c1c24] rounded-2xl border border-white/[0.05] overflow-hidden flex flex-col shadow-xl">
                                                    {selectedSessionId ? (
                                                        <>
                                                            <div
                                                                className="border-b border-white/[0.05] flex justify-between items-center bg-white/[0.01]"
                                                                style={{ padding: '16px 24px' }}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                                                                        <Users className="w-5 h-5" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold text-white text-sm">Sessão de Visitante</h3>
                                                                        <p className="text-[10px] text-gray-500 font-mono mt-0.5">{selectedSessionId}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-2">
                                                                    <button className="px-4 py-2 bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all border border-white/[0.05]">
                                                                        Arquivar
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteSession(selectedSessionId)}
                                                                        className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all border border-red-500/10"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div
                                                                className="flex-1 overflow-y-auto space-y-4 custom-scrollbar bg-black/10"
                                                                style={{ padding: '20px' }}
                                                            >
                                                                {sessions
                                                                    .find(s => s.session_id === selectedSessionId)
                                                                    ?.messages.map((msg) => (
                                                                        <div
                                                                            key={msg.id}
                                                                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                                                        >
                                                                            <div className={`max-w-[80%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                                                <div
                                                                                    className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                                                                                        ? 'bg-blue-600 text-white rounded-br-none'
                                                                                        : 'bg-white/[0.08] text-gray-200 rounded-bl-none border border-white/[0.05]'
                                                                                        }`}
                                                                                >
                                                                                    {msg.content}
                                                                                </div>
                                                                                <span className="text-[9px] font-bold text-gray-500 mt-1.5 uppercase tracking-widest px-1">
                                                                                    {msg.role === 'user' ? 'Visitante' : 'Gyoda AI'} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                            </div>
                                                            <div
                                                                className="w-full flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.05] transition-all group"
                                                                style={{ padding: '12px 16px' }}
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                                                                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Monitoramento Ativo</span>
                                                                </div>
                                                                <div className="flex items-center gap-1.5 text-[9px] font-bold text-blue-500/60 uppercase tracking-tighter">
                                                                    Chat em tempo real • IA conectada
                                                                </div>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                                                            <div className="w-16 h-16 rounded-2xl bg-white/[0.01] flex items-center justify-center mb-6 border border-white/[0.03]">
                                                                <MessageSquare className="w-8 h-8 text-gray-700" />
                                                            </div>
                                                            <h3 className="text-lg font-bold text-white mb-2">Selecione uma conversa</h3>
                                                            <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
                                                                Escolha uma conversa na lista lateral para visualizar o histórico completo entre o visitante e a IA.
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="max-w-4xl mx-auto">
                                                <div className="bg-[#1c1c24] rounded-3xl border border-white/[0.05] overflow-hidden shadow-2xl">
                                                    <div
                                                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.05] bg-white/[0.01]"
                                                        style={{ padding: '20px 24px' }}
                                                    >
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 border border-blue-500/10">
                                                                <Settings className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-white tracking-tight">Configurações da IA</h3>
                                                                <p className="text-gray-400 text-xs mt-1 font-medium">Defina como o assistente virtual deve se comportar.</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ padding: '48px' }}>
                                                        <div className="space-y-6">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Instruções do Sistema (System Prompt)</label>
                                                                <textarea
                                                                    value={aiInstructions}
                                                                    onChange={(e) => setAiInstructions(e.target.value)}
                                                                    rows={8}
                                                                    className="w-full bg-black/20 border border-white/[0.08] rounded-2xl p-6 text-sm text-gray-300 focus:outline-none focus:border-blue-500/50 transition-all resize-none leading-relaxed font-sans"
                                                                    placeholder="Digite as instruções para a IA..."
                                                                />
                                                                <p className="text-[10px] text-gray-500 mt-4 leading-relaxed italic">
                                                                    Dica: Defina o tom de voz, o objetivo do chat e informações cruciais sobre a Gyoda que a IA deve saber.
                                                                </p>
                                                            </div>

                                                            <div className="pt-6 border-t border-white/[0.05] flex justify-end">
                                                                <button
                                                                    onClick={handleSaveAIInstructions}
                                                                    disabled={saving}
                                                                    style={{ padding: '18px 64px' }}
                                                                    className={`rounded-xl font-bold text-sm transition-all shadow-lg ${saving
                                                                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20 active:scale-95'
                                                                        }`}
                                                                >
                                                                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="bg-[#1c1c24] rounded-3xl border border-white/[0.05] overflow-hidden shadow-2xl mt-8">
                                                    <div
                                                        className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.05] bg-white/[0.01]"
                                                        style={{ padding: '20px 24px' }}
                                                    >
                                                        <div className="flex items-center gap-4 mb-2">
                                                            <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center text-green-500 border border-green-500/10">
                                                                <TrendingUp className="w-5 h-5" />
                                                            </div>
                                                            <div>
                                                                <h3 className="text-xl font-bold text-white tracking-tight">Valores Base (Orçamento)</h3>
                                                                <p className="text-gray-400 text-xs mt-1 font-medium">Defina os valores iniciais para o cálculo automático de propostas.</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div style={{ padding: '48px' }}>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Web Apps (R$)</label>
                                                                <input
                                                                    type="number"
                                                                    value={basePrices.web}
                                                                    onChange={(e) => setBasePrices(prev => ({ ...prev, web: parseFloat(e.target.value) }))}
                                                                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Sistemas de IA (R$)</label>
                                                                <input
                                                                    type="number"
                                                                    value={basePrices.ai}
                                                                    onChange={(e) => setBasePrices(prev => ({ ...prev, ai: parseFloat(e.target.value) }))}
                                                                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Cloud / Mobile (R$)</label>
                                                                <input
                                                                    type="number"
                                                                    value={basePrices.mobile}
                                                                    onChange={(e) => setBasePrices(prev => ({ ...prev, mobile: parseFloat(e.target.value) }))}
                                                                    className="w-full bg-black/20 border border-white/[0.08] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="pt-8 mt-8 border-t border-white/[0.05] flex justify-end">
                                                            <button
                                                                onClick={handleSaveBasePrices}
                                                                disabled={saving}
                                                                style={{ padding: '16px 48px' }}
                                                                className={`rounded-xl font-bold text-sm transition-all shadow-lg ${saving
                                                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                                    : 'bg-blue-600 text-white hover:bg-blue-500 shadow-blue-600/20 active:scale-95'
                                                                    }`}
                                                            >
                                                                {saving ? 'Salvando...' : 'Salvar Valores'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
