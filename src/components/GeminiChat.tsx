import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, X } from 'lucide-react';
import { supabase } from '../lib/supabase';
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
    useEffect(() => {
        if (!sessionId || !autoLoad) return;

        const loadHistory = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (data) {
                const formattedMessages: Message[] = data.map(msg => ({
                    role: msg.role as 'user' | 'model',
                    parts: msg.content
                }));
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
    const [isOpen, setIsOpen] = useState(false);
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

        // External trigger
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-gyoda-chat', handleOpenChat);
        return () => window.removeEventListener('open-gyoda-chat', handleOpenChat);
    }, []);

    // Load History from Supabase
    useEffect(() => {
        if (!sessionId || !isOpen) return;

        const loadHistory = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (data) {
                const formattedMessages: Message[] = data.map(msg => ({
                    role: msg.role as 'user' | 'model',
                    parts: msg.content
                }));
                setMessages(formattedMessages);
            }
        };

        loadHistory();
    }, [sessionId, isOpen]);

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

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="gemini-chat-widget"
        >
            {/* Header */}
            <div className="gemini-chat-header">
                <div className="gemini-chat-title">
                    <img src="/logo_g.svg" alt="Gyoda Logo" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                    <span>Atendente do Grupo</span>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="gemini-chat-close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages */}
            <div className="gemini-chat-messages">
                {messages.length === 0 && (
                    <div className="gemini-chat-welcome">
                        <p>Olá! Como posso ajudar você hoje?</p>
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
        </motion.div>
    );
}
