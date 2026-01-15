
import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, ShieldCheck } from 'lucide-react';
import SEO from '../components/SEO';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isSignUp = searchParams.get('mode') === 'signup';

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: { full_name: fullName }
                    }
                });
                if (error) throw error;
                navigate('/admin');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/admin');
            }
        } catch (error) {
            alert(error instanceof Error ? error.message : 'Ocorreu um erro inesperado');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--background)' }}>
            <SEO title="Entrar" description="Acesse sua conta Gyoda para gerenciar seus projetos." />
            {/* Split Screen Image */}
            <div style={{ flex: 1.2, position: 'relative', overflow: 'hidden' }} className="auth-hero-desktop">
                <img
                    src="/gyoda_hero_tech_abstract_1768306538996.png"
                    alt="GYODA Secure"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
                />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, transparent, var(--background))' }}></div>
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', padding: '1.5rem', borderRadius: '2rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid var(--accent)', marginBottom: '2rem' }}>
                        <ShieldCheck size={64} color="var(--accent)" />
                    </div>
                    <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'white' }}>Sistema Interno</h2>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: '1.25rem' }}>Acesso restrito para administradores GYODA.</p>
                </div>
            </div>

            {/* Auth Form */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
                <div style={{ maxWidth: '400px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                        <div className="logo" style={{ justifyContent: 'center', marginBottom: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => navigate('/')}>
                            <img src="/logo_g.svg" alt="Gyoda Logo" style={{ width: '64px', height: '64px', objectFit: 'contain' }} />
                            <span className="logo-text" style={{ fontSize: '2rem' }}>GYODA</span>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.05em' }}>{isSignUp ? 'Configurar Credenciais' : 'Entrar na Plataforma'}</h1>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'grid', gap: '1.5rem' }}>
                        {isSignUp && (
                            <div className="input-group">
                                <label className="label">Nome Completo</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Romualdo Admin"
                                    required
                                    style={{ padding: '1rem' }}
                                />
                            </div>
                        )}
                        <div className="input-group">
                            <label className="label">E-mail</label>
                            <input
                                className="input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@gyoda.com"
                                required
                                style={{ padding: '1rem' }}
                            />
                        </div>
                        <div className="input-group" style={{ marginBottom: '1rem' }}>
                            <label className="label">Senha</label>
                            <input
                                className="input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ padding: '1rem' }}
                            />
                        </div>

                        <button type="submit" className="btn btn-accent btn-lg" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '1rem' }}>
                            {loading ? <Loader2 className="icon-spin" /> : (isSignUp ? 'Ativar Conta' : 'Acessar Dashboard')}
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                            {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem acesso?'}
                            <button
                                type="button"
                                onClick={() => navigate(isSignUp ? '/auth' : '/auth?mode=signup')}
                                style={{ background: 'none', border: 'none', padding: 0, marginLeft: '0.5rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer' }}
                            >
                                {isSignUp ? 'Fazer Login' : 'Solicitar Acesso'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
@media(max-width: 1024px) {
    .auth-hero-desktop { display: none !important; }
}
@media(min-width: 1025px) {
    .auth-hero-desktop { display: block !important; }
}
`}</style>
        </div>
    );
};

export default Auth;
