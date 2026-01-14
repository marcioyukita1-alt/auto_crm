import { ArrowRight, Code2, Cpu, Globe, Infinity as InfinityIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const Landing = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
                <div className="container nav-content">
                    <div className="logo">
                        <div className="logo-icon" style={{ color: 'var(--accent)' }}>
                            <Code2 size={28} />
                        </div>
                        <span className="logo-text">GYODA</span>
                    </div>
                    <div className="nav-links">
                        <a href="#services" className="nav-link">Serviços</a>
                        <Link to="/auth" className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', fontSize: '0.875rem' }}>Admin</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="hero">
                <div className="container">
                    <div className="hero-content">
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
                            <div className="hero-actions">
                                <Link to="/w/gyoda" className="btn btn-accent btn-lg">
                                    Fazer Orçamento Agora <ArrowRight size={20} />
                                </Link>
                                <a href="#services" className="btn btn-outline btn-lg" style={{ color: 'white', border: '1px solid var(--border)' }}>
                                    Nossas Soluções
                                </a>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            style={{ marginTop: '4rem', borderRadius: '2rem', overflow: 'hidden', border: '1px solid var(--border)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                        >
                            <img src="/gyoda_hero_tech_abstract_1768306538996.png" alt="Tech Architecture" style={{ width: '100%', height: 'auto', display: 'block' }} />
                        </motion.div>
                    </div>

                    {/* Features Grid (Social Proof / Capability) */}
                    <div className="features-grid" id="services">
                        <FeatureCard
                            icon={<Globe />}
                            title="Web Apps"
                            description="Plataformas escaláveis com as tecnologias mais modernas do mercado (React, Node, Go)."
                            image="/gyoda_team_working_dark_1768306555877.png"
                        />
                        <FeatureCard
                            icon={<Cpu />}
                            title="Sistemas de IA"
                            description="Integração de inteligência artificial para automatizar processos complexos."
                            image="/gyoda_ai_cloud_secure_1768306574843.png"
                        />
                        <FeatureCard
                            icon={<InfinityIcon />}
                            title="DevOps & Cloud"
                            description="Infraestrutura resiliente preparada para milhões de requisições simultâneas."
                            image="/gyoda_devops_servers_1768307721351.png"
                        />
                    </div>
                </div>
            </header>

            {/* CTA Section */}
            <section className="cta" style={{ padding: '8rem 0', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <img src="/gyoda_cta_background_1768307735834.png" alt="Overlay" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.4 }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, var(--background), transparent, var(--background))' }}></div>
                </div>
                <div className="container" style={{ position: 'relative', zIndex: 1 }}>
                    <div className="cta-card" style={{ background: 'rgba(22, 22, 30, 0.7)', backdropFilter: 'blur(10px)', border: '1px solid var(--border)' }}>
                        <h2 className="cta-title">Pronto para o próximo nível?</h2>
                        <p className="cta-description">O seu projeto merece a expertise da GYODA. O processo é simples: orçamento direto, proposta automática e execução de elite.</p>
                        <Link to="/w/gyoda" className="btn btn-accent btn-lg">
                            Iniciar Orçamento Grátis
                        </Link>
                    </div>
                </div>
            </section>

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

const FeatureCard = ({ icon, title, description, image }: { icon: React.ReactNode, title: string, description: string, image?: string }) => (
    <div className="feature-card" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="feature-icon">
            {icon}
        </div>
        <h3 className="feature-title">{title}</h3>
        <p className="feature-description" style={{ flex: 1 }}>{description}</p>
        {image && (
            <div style={{ marginTop: '1.5rem', borderRadius: '1rem', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={image} alt={title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
            </div>
        )}
    </div>
);

export default Landing;
