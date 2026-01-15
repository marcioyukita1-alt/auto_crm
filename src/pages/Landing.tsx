import { Cpu, Globe, Infinity as InfinityIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { EmbeddedChat } from '../components/GeminiChat';
import SEO from '../components/SEO';

const TECH_DETAILS = {
    "Web Apps": {
        description: "Web Apps de alta performance são o motor da economia digital moderna. Utilizamos ferramentas de ponta como React e Next.js para criar interfaces que carregam instantaneamente e oferecem uma experiência idêntica a aplicativos nativos, mas acessíveis diretamente pelo navegador. Focamos em Single Page Applications (SPA) para navegação fluida e Progressive Web Apps (PWA) para funcionamento offline e instalação no celular. Nossa engenharia garante que cada pixel seja otimizado para conversão e velocidade extrema.",
        benefits: ["Single Page Applications (SPA)", "Progressive Web Apps (PWA)", "Otimização SEO de alta performance", "Interfaces Responsivas & Fluidas"],
        stack: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Go", "Node.js"],
        image: "/gyoda_web_tech_detail_1768504648428.png"
    },
    "Inteligência Artificial (IA)": {
        description: "A Inteligência Artificial deixou de ser ficção para se tornar a maior vantagem competitiva do século. Integramos modelos de linguagem (LLMs) como Google Gemini e GPT-4 para automatizar atendimentos complexos, processar volumes massivos de documentos e gerar insights preditivos em tempo real. Desenvolvemos sistemas de IA capazes de interagir com APIs, bancos de dados e sistemas legados, trazendo inteligência real e autonomia para o centro da sua operação digital.",
        benefits: ["LLMs Customizados (Gemini, GPT)", "Automação Inteligente", "Análise de Dados Preditiva", "Agentes de IA Autônomos"],
        stack: ["OpenAI", "Google Gemini", "LangChain", "Vector DBs", "Python"],
        image: "/gyoda_ai_tech_detail_1768504666144.png"
    },
    "DevOps & Cloud": {
        description: "Sistemas de elite exigem infraestruturas resilientes e à prova de falhas. Nossa expertise em DevOps garante que seu software esteja sempre online, escalando automaticamente conforme o tráfego aumenta. Utilizamos Docker e Kubernetes para conteinerização, e Terraform para 'Infraestrutura como Código'. Implementamos pipelines de CI/CD contínuos, garantindo que novas atualizações cheguem ao usuário final sem interrupções e com segurança de nível bancário contra ataques externos.",
        benefits: ["Cloud Automation", "CI/CD Contínuo", "Auto-scaling & Segurança", "Infraestrutura como Código"],
        stack: ["AWS", "Google Cloud", "Docker", "Kubernetes", "Terraform"],
        image: "/gyoda_devops_tech_detail_1768504681661.png"
    }
};

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);
    const [selectedTech, setSelectedTech] = useState<keyof typeof TECH_DETAILS | null>(null);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            <SEO
                title="Início"
                description="Transformamos ideias em sistemas de alta performance. Especialistas em web apps, IA e DevOps."
            />
            {/* Navigation */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Navegação principal">
                <div className="container nav-content">
                    <div className="logo">
                        <div className="logo-icon">
                            <img src="/logo_g.svg" alt="Gyoda - Desenvolvimento de Software de Elite" style={{ width: '40px', height: '40px', objectFit: 'contain' }} />
                        </div>
                        <span className="logo-text">GYODA</span>
                    </div>
                    <div className="nav-links">
                        <a href="#services" className="nav-link" aria-label="Ir para seção de serviços">Serviços</a>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="container">
                    <article className="hero-content">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="hero-tag">Desenvolvimento de Software de Elite</div>
                            <h1 className="hero-title">
                                Transformamos <span>Ideias em</span> Sistemas de Alta Performance.
                            </h1>
                            <p className="hero-subtitle">
                                Na GYODA, não apenas escrevemos código. Construímos as fundações digitais que permitem que sua empresa escale sem limites.
                            </p>

                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{ marginTop: '4rem', borderRadius: '2rem', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                        >
                            <img src="/gyoda_hero_tech_abstract_1768306538996.png" alt="Arquitetura tecnológica moderna com React, Node.js e Cloud Computing" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </motion.div>
                    </article>

                    {/* Features Grid (Social Proof / Capability) */}
                    <section className="features-grid" id="services" aria-label="Nossos serviços">
                        <h2 className="sr-only">Serviços de Desenvolvimento de Software</h2>
                        <FeatureCard
                            icon={<Globe />}
                            title="Web Apps"
                            description="Plataformas escaláveis com as tecnologias mais modernas do mercado (React, Node, Go)."
                            image="/gyoda_team_working_dark_1768306555877.png"
                            onClick={() => setSelectedTech("Web Apps")}
                        />
                        <FeatureCard
                            icon={<Cpu />}
                            title="Inteligência Artificial (IA)"
                            description="Integração de IA generativa e modelos de linguagem para otimizar processos complexos."
                            image="/gyoda_ai_cloud_secure_1768306574843.png"
                            onClick={() => setSelectedTech("Inteligência Artificial (IA)")}
                        />
                        <FeatureCard
                            icon={<InfinityIcon />}
                            title="DevOps & Cloud"
                            description="Infraestrutura resiliente preparada para milhões de requisições simultâneas."
                            image="/gyoda_devops_servers_1768307721351.png"
                            onClick={() => setSelectedTech("DevOps & Cloud")}
                        />
                    </section>
                </div>

                {/* Embedded Chat Section */}
                <section className="container" style={{ marginTop: '8rem', paddingBottom: '8rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }} aria-label="Contato via chat">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        style={{ textAlign: 'center', marginBottom: '3rem' }}
                    >
                        <h2 style={{ fontSize: '3rem', fontWeight: 900, color: 'white', marginBottom: '1.5rem', letterSpacing: '-0.03em' }}>
                            Precisa de uma <span style={{ color: 'var(--accent)' }}>Solução Sob Medida?</span>
                        </h2>
                        <p style={{ color: '#d1d1d6', fontSize: '1.25rem', maxWidth: '700px', margin: '0 auto', lineHeight: 1.6 }}>
                            Nosso atendente está pronto para entender seus desafios e esboçar o seu projeto em segundos.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
                    >
                        <EmbeddedChat />
                    </motion.div>
                </section>
            </header>

            {/* Modal */}
            <AnimatePresence>
                {selectedTech && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedTech(null)}
                            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(12px)' }}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            style={{
                                position: 'relative',
                                width: '100%',
                                maxWidth: '700px',
                                background: '#0a0a0c',
                                borderRadius: '2.5rem',
                                border: '1px solid var(--border)',
                                overflow: 'hidden',
                                boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.8)'
                            }}
                        >
                            <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
                                <img
                                    src={(TECH_DETAILS as any)[selectedTech].image}
                                    alt={selectedTech as string}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #0a0a0c, transparent)' }} />
                                <button
                                    onClick={() => setSelectedTech(null)}
                                    style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', padding: '0.75rem', borderRadius: '50%', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            <div style={{ padding: '3rem', paddingTop: '1rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{ height: '4px', width: '40px', background: 'var(--accent)', borderRadius: '2px' }} />
                                    <h2 style={{ fontSize: '2.25rem', fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>{selectedTech}</h2>
                                </div>
                                <p style={{ color: '#d1d1d6', lineHeight: 1.7, marginBottom: '2.5rem', fontSize: '1.05rem', fontWeight: 400 }}>
                                    {(TECH_DETAILS as any)[selectedTech].description}
                                </p>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '2.5rem' }}>
                                    <div>
                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>Principais Benefícios</h4>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                                            {(TECH_DETAILS as any)[selectedTech].benefits.map((benefit: string) => (
                                                <div key={benefit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                                                    <span style={{ fontSize: '0.9rem', color: '#a1a1aa', fontWeight: 500 }}>{benefit}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--accent)', letterSpacing: '0.15em', marginBottom: '1.25rem' }}>Core Stack</h4>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
                                            {(TECH_DETAILS as any)[selectedTech].stack.map((s: string) => (
                                                <span key={s} style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.05)', color: 'var(--accent)', borderRadius: '0.75rem', fontSize: '0.75rem', fontWeight: 700, border: '1px solid rgba(59, 130, 246, 0.1)' }}>
                                                    {s}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>



            {/* Footer */}
            <footer className="footer" style={{ borderTop: '1px solid var(--border)', padding: '4rem 0' }}>
                <div className="container footer-content">
                    <div className="logo">
                        <span className="logo-text" style={{ fontSize: '1.25rem' }}>GYODA Softwares</span>
                    </div>
                    <p className="footer-copyright" style={{ color: 'var(--muted-foreground)' }}>© 2026 GYODA. Excelência em Engenharia de Software.</p>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description, image, onClick }: { icon: React.ReactNode, title: string, description: string, image?: string, onClick?: () => void }) => (
    <motion.div
        whileHover={{ y: -10, transition: { duration: 0.3 } }}
        onClick={onClick}
        className="feature-card"
        style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
    >
        <div className="feature-icon">
            {icon}
        </div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description" style={{ flex: 1 }}>{description}</p>

        {image && (
            <div style={{ marginTop: '1.5rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={image} alt={`${title} - Ilustração de ${description}`} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            </div>
        )}
    </motion.div>
);

export default Landing;
