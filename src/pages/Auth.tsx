import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import { EmbeddedChat } from '../components/GeminiChat';

const Auth = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isSignUp = searchParams.get('mode') === 'signup';

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage('');

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
                // Redirecionar para o Wizard de cadastro complementar
                navigate('/wizard');
            } else {
                const { data: { session }, error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;

                if (session?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single();

                    if (profile?.role === 'admin') {
                        navigate('/admin');
                    } else {
                        navigate('/dashboard');
                    }
                }
            }
        } catch (error: any) {
            console.error('Auth Error:', error);
            // Suppress "Email not confirmed" alert as requested, but ideally show text.
            // User asked to "retire a mensagem", so we avoid window.alert.
            // We will show a subtle error message if it's NOT "Email not confirmed" or if we want to guide them.
            if (error.message?.includes('Email not confirmed')) {
                setErrorMessage('E-mail pendente de confirmação. Verifique sua caixa de entrada ou contate o suporte.');
            } else {
                setErrorMessage(error.message || 'Erro ao autenticar.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--background)',
            alignItems: 'stretch',
            overflow: 'hidden'
        }}>
            <SEO title={isSignUp ? "Cadastre-se" : "Entrar"} description="Acesse sua conta Gyoda ou crie uma nova." />

            {/* Left Side - Chat (Desktop only) */}
            <div className="auth-hero-desktop" style={{
                flex: 1,
                backgroundColor: '#0a0a0c', // Pure dark for contrast
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
                    opacity: 0.12, // Very subtle watermark effect
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
                    zIndex: 2 // Above the decorative background
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'white', margin: '0 0 0.75rem 0', lineHeight: 1.2, letterSpacing: '-0.02em' }}>
                            Atendimento <span style={{ color: 'var(--accent)' }}>Inteligente</span>
                        </h2>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: '1.05rem', margin: 0, opacity: 0.9, lineHeight: 1.5 }}>
                            Dúvidas sobre o sistema? Nossa IA explica tudo para você em segundos.
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

            {/* Right Side - Auth Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0',
                position: 'relative',
                zIndex: 1,
                height: '100vh'
            }}>
                <div style={{ maxWidth: '400px', width: '100%' }}>
                    <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                        <div className="logo" style={{ justifyContent: 'center', marginBottom: '1.5rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }} onClick={() => navigate('/')}>
                            <img src="/logo_g.svg" alt="Gyoda Logo" style={{ width: '48px', height: '48px', objectFit: 'contain' }} />
                            <span className="logo-text" style={{ fontSize: '1.75rem' }}>GYODA</span>
                        </div>
                        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                            {isSignUp ? 'Criar Conta' : 'Bem-vindo de volta'}
                        </h1>
                        <p style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                            {isSignUp ? 'Preencha seus dados para começar.' : 'Acesse seu painel administrativo.'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} style={{ display: 'grid', gap: '1.25rem' }}>
                        {isSignUp && (
                            <div className="input-group">
                                <label className="label">Nome Completo</label>
                                <input
                                    className="input"
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Seu Nome"
                                    required
                                    style={{ padding: '0.875rem' }}
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
                                placeholder="seu@email.com"
                                required
                                style={{ padding: '0.875rem' }}
                            />
                        </div>
                        <div className="input-group" style={{ marginBottom: '0.5rem' }}>
                            <label className="label">Senha</label>
                            <input
                                className="input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{ padding: '0.875rem' }}
                            />
                        </div>

                        {errorMessage && (
                            <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center' }}>
                                {errorMessage}
                            </div>
                        )}

                        <button type="submit" className="btn btn-accent" disabled={loading} style={{ width: '100%', justifyContent: 'center', padding: '0.875rem', fontSize: '1rem' }}>
                            {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Cadastrar e Continuar' : 'Entrar')}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                            {isSignUp ? 'Já tem uma conta?' : 'Não tem conta?'}
                            <button
                                type="button"
                                onClick={() => navigate(isSignUp ? '/auth' : '/auth?mode=signup')}
                                style={{ background: 'none', border: 'none', padding: 0, marginLeft: '0.5rem', color: 'var(--accent)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                {isSignUp ? 'Fazer Login' : 'Cadastre-se'}
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
    .auth-hero-desktop { display: flex !important; }
}
`}</style>
        </div>
    );
};

export default Auth;
