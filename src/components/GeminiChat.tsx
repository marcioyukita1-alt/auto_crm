import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import './GeminiChat.css';

interface Message {
    role: 'user' | 'model';
    parts: string;
}

interface EmbeddedChatProps {
    autoLoad?: boolean;
}

export function EmbeddedChat({ autoLoad = true }: EmbeddedChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState<string>('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Initialize Session ID
    useEffect(() => {
        let storedSession = localStorage.getItem('gemini_chat_session_id');
        if (!storedSession) {
            storedSession = crypto.randomUUID();
            localStorage.setItem('gemini_chat_session_id', storedSession);
        }
        setSessionId(storedSession);
    }, []);

    // Load History from Supabase
    // Load History from Supabase (User + Session)
    useEffect(() => {
        if (!sessionId || !autoLoad) return;

        const loadHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            let query = supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (user) {
                // Determine logic: fetch by user_id OR session_id to merge contexts
                query = query.or(`user_id.eq.${user.id},session_id.eq.${sessionId}`);
            } else {
                query = query.eq('session_id', sessionId);
            }

            const { data } = await query;

            if (data) {
                const formattedMessages: Message[] = data.map(msg => ({
                    role: msg.role as 'user' | 'model',
                    parts: msg.content
                }));
                // Remove duplicates if any (simple check based on content/order, or just trust DB)
                // For now trusting DB distinct/order
                setMessages(formattedMessages);
            }
        };

        loadHistory();
    }, [sessionId, autoLoad]);

    const saveMessageToDb = async (role: 'user' | 'model', content: string) => {
        if (!sessionId) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from('chat_messages').insert({
                session_id: sessionId,
                user_id: user?.id || null,
                role: role,
                content: content
            });
        } catch (err) {
            console.error('Failed to save message to DB:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        setMessages(prev => [...prev, { role: 'user', parts: userMessage }]);
        setIsLoading(true);

        saveMessageToDb('user', userMessage);

        try {
            const { data, error } = await supabase.functions.invoke('gemini-chat', {
                body: {
                    message: userMessage,
                    history: messages.map(m => ({ role: m.role, parts: m.parts }))
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            const modelResponse = data.text;

            setMessages(prev => [...prev, { role: 'model', parts: modelResponse }]);
            saveMessageToDb('model', modelResponse);

        } catch (error: any) {
            console.error('Error sending message:', error);
            const errorMessage = `Erro técnico: ${error.message || JSON.stringify(error) || 'Erro desconhecido'}`;

            setMessages(prev => [...prev, {
                role: 'model',
                parts: errorMessage
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="embedded-chat-container">
            {/* Header */}
            <div className="embedded-chat-header" style={{
                background: 'linear-gradient(to right, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))', // Subtle gradient
                padding: '1rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                borderBottom: '1px solid rgba(37, 99, 235, 0.2)'
            }}>
                <div style={{
                    background: 'rgba(37, 99, 235, 0.2)', // Subtle icon bg
                    padding: '0.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(37, 99, 235, 0.2)'
                }}>
                    <Bot size={20} color="#60a5fa" /> {/* Lighter blue icon */}
                </div>
                <div>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em' }}>Atendimento</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }}></span>
                        <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>IA Solange Online</p>
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="embedded-chat-messages">
                {messages.length === 0 && (
                    <div className="embedded-chat-welcome">
                        <Bot size={48} style={{ color: 'var(--accent)', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>Olá! 👋</h3>
                        <p style={{ color: 'var(--muted-foreground)' }}>Como posso ajudar você hoje?</p>
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`embedded-message-row ${msg.role}`}
                    >
                        <div className={`embedded-message-bubble ${msg.role}`}>
                            <div className="embedded-message-content">
                                {msg.role === 'model' && <Bot size={16} style={{ marginTop: 4 }} />}
                                {msg.role === 'user' && <User size={16} style={{ marginTop: 4 }} />}
                                <span style={{ flex: 1 }}>{msg.parts}</span>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="embedded-message-row model">
                        <div className="embedded-message-bubble model">
                            <div className="typing-indicator">
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                                <div className="typing-dot" />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="embedded-chat-form">
                <div className="embedded-input-container">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Digite sua mensagem..."
                        className="embedded-chat-input"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="embedded-send-button"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function GeminiChat() {
    const [isMinimized, setIsMinimized] = useState(false);
    const location = useLocation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionId, setSessionId] = useState<string>('');

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!isMinimized) {
            scrollToBottom();
        }
    }, [messages, isMinimized]);

    // Initialize Session ID
    useEffect(() => {
        let storedSession = localStorage.getItem('gemini_chat_session_id');
        if (!storedSession) {
            storedSession = crypto.randomUUID();
            localStorage.setItem('gemini_chat_session_id', storedSession);
        }
        setSessionId(storedSession);

        // External trigger now just maximizes
        const handleOpenChat = () => setIsMinimized(false);
        window.addEventListener('open-gyoda-chat', handleOpenChat);
        return () => window.removeEventListener('open-gyoda-chat', handleOpenChat);
    }, []);

    // Load History from Supabase (User + Session)
    useEffect(() => {
        if (!sessionId) return;

        const loadHistory = async () => {
            const { data: { user } } = await supabase.auth.getUser();

            let query = supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (user) {
                query = query.or(`user_id.eq.${user.id},session_id.eq.${sessionId}`);
            } else {
                query = query.eq('session_id', sessionId);
            }

            const { data } = await query;

            if (data) {
                const formattedMessages: Message[] = data.map(msg => ({
                    role: msg.role as 'user' | 'model',
                    parts: msg.content
                }));
                setMessages(formattedMessages);
            }
        };

        loadHistory();
    }, [sessionId]);

    const saveMessageToDb = async (role: 'user' | 'model', content: string) => {
        if (!sessionId) return;

        try {
            const { data: { user } } = await supabase.auth.getUser();

            await supabase.from('chat_messages').insert({
                session_id: sessionId,
                user_id: user?.id || null,
                role: role,
                content: content
            });
        } catch (err) {
            console.error('Failed to save message to DB:', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        setMessages(prev => [...prev, { role: 'user', parts: userMessage }]);
        setIsLoading(true);

        saveMessageToDb('user', userMessage);

        try {
            const { data, error } = await supabase.functions.invoke('gemini-chat', {
                body: {
                    message: userMessage,
                    history: messages.map(m => ({ role: m.role, parts: m.parts }))
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            const modelResponse = data.text;

            setMessages(prev => [...prev, { role: 'model', parts: modelResponse }]);
            saveMessageToDb('model', modelResponse);

        } catch (error: any) {
            console.error('Error sending message:', error);
            const errorMessage = `Erro técnico: ${error.message || JSON.stringify(error) || 'Erro desconhecido'}`;

            setMessages(prev => [...prev, {
                role: 'model',
                parts: errorMessage
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    // Don't render floating chat on Auth page since it has EmbeddedChat
    if (location.pathname === '/auth') return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                height: isMinimized ? '60px' : '600px',
                width: isMinimized ? '200px' : '400px'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="gemini-chat-widget"
            style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
            {/* Header */}
            <div
                className="gemini-chat-header"
                onClick={() => setIsMinimized(!isMinimized)}
                style={{
                    cursor: 'pointer',
                    background: 'linear-gradient(to right, rgba(37, 99, 235, 0.1), rgba(124, 58, 237, 0.1))',
                    padding: '1rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    borderBottom: '1px solid rgba(37, 99, 235, 0.2)'
                }}
            >
                <div style={{
                    background: 'rgba(37, 99, 235, 0.2)',
                    padding: '0.5rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 10px rgba(37, 99, 235, 0.2)'
                }}>
                    <Bot size={20} color="#60a5fa" />
                </div>
                <div className="gemini-chat-title" style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, color: 'white', fontSize: '1rem', fontWeight: 600, letterSpacing: '0.02em' }}>
                        {isMinimized ? 'Conversar' : 'Atendimento'}
                    </h3>
                    {!isMinimized && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.1rem' }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 5px #22c55e' }}></span>
                            <p style={{ margin: 0, color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem' }}>IA Solange Online</p>
                        </div>
                    )}
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                    className="gemini-chat-close"
                >
                    {isMinimized ? <Bot className="w-5 h-5" /> : <X className="w-5 h-5" />}
                </button>
            </div>

            {/* Content Container - hidden when minimized to prevent layout issues */}
            <div style={{ flex: 1, display: isMinimized ? 'none' : 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Messages */}
                <div className="gemini-chat-messages">
                    {messages.length === 0 && (
                        <div className="gemini-chat-welcome">
                            <p>Olá! Sou a Solange, IA da Gyoda. Como posso ajudar você hoje?</p>
                        </div>
                    )}
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`message-row ${msg.role}`}
                        >
                            <div className={`message-bubble ${msg.role}`}>
                                <div className="message-content">
                                    {msg.role === 'model' && <Bot size={16} style={{ marginTop: 4 }} />}
                                    {msg.role === 'user' && <User size={16} style={{ marginTop: 4 }} />}
                                    <span style={{ flex: 1 }}>{msg.parts}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message-row model">
                            <div className="message-bubble model">
                                <div className="typing-indicator">
                                    <div className="typing-dot" />
                                    <div className="typing-dot" />
                                    <div className="typing-dot" />
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={handleSubmit} className="gemini-chat-form">
                    <div className="input-container">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Digite sua mensagem..."
                            className="chat-input"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="send-button"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </form>
            </div>
        </motion.div>
    );
}
