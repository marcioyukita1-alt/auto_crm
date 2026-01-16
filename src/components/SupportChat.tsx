import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Send, Headset, Loader2 } from 'lucide-react';


interface Message {
    id: string;
    content: string;
    sender_type: 'client' | 'admin';
    created_at: string;
}

interface SupportChatProps {
    leadId: string;
}

const SupportChat: React.FC<SupportChatProps> = ({ leadId }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchMessages();
        const subscription = subscribeToMessages();
        return () => {
            subscription.unsubscribe();
        };
    }, [leadId]);

    const fetchMessages = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('support_messages')
            .select('*')
            .eq('lead_id', leadId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching messages:', error);
        } else {
            setMessages(data || []);
        }
        setIsLoading(false);
        scrollToBottom();
    };

    const subscribeToMessages = () => {
        return supabase
            .channel(`support_messages:lead_id=eq.${leadId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'support_messages',
                filter: `lead_id=eq.${leadId}`
            }, (payload) => {
                const newMessage = payload.new as Message;
                setMessages((prev) => [...prev, newMessage]);
                scrollToBottom();
            })
            .subscribe();
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        setSending(true);
        try {
            const { error } = await supabase
                .from('support_messages')
                .insert({
                    lead_id: leadId,
                    content: input.trim(),
                    sender_type: 'client'
                });

            if (error) throw error;
            setInput('');
        } catch (error: any) {
            alert('Erro ao enviar mensagem: ' + error.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="support-chat glass" style={{ height: '600px', display: 'flex', flexDirection: 'column', borderRadius: '2rem', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(37, 99, 235, 0.1)', borderRadius: '1rem', color: 'var(--accent)' }}>
                    <Headset size={24} />
                </div>
                <div>
                    <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Suporte Técnico</h3>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>Fale diretamente com nossos especialistas</p>
                </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {isLoading ? (
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader2 className="animate-spin" size={32} color="var(--accent)" />
                    </div>
                ) : messages.length === 0 ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                        <Headset size={48} style={{ opacity: 0.1, marginBottom: '1rem' }} />
                        <p>Inicie uma conversa com nosso suporte.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            style={{
                                display: 'flex',
                                justifyContent: msg.sender_type === 'client' ? 'flex-end' : 'flex-start',
                                marginBottom: '0.5rem'
                            }}
                        >
                            <div
                                style={{
                                    maxWidth: '80%',
                                    padding: '1rem',
                                    borderRadius: '1.25rem',
                                    background: msg.sender_type === 'client' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
                                    color: msg.sender_type === 'client' ? 'white' : 'inherit',
                                    border: msg.sender_type === 'admin' ? '1px solid var(--border)' : 'none',
                                    position: 'relative',
                                    boxShadow: msg.sender_type === 'client' ? '0 4px 15px rgba(37, 99, 235, 0.3)' : 'none'
                                }}
                            >
                                <div style={{ fontSize: '0.925rem', lineHeight: '1.5' }}>{msg.content}</div>
                                <div style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '0.4rem', textAlign: 'right' }}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)' }}>
                <div style={{ position: 'relative', display: 'flex', gap: '0.75rem' }}>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Como podemos ajudar?"
                        style={{
                            flex: 1,
                            background: 'rgba(0,0,0,0.2)',
                            border: '1px solid var(--border)',
                            borderRadius: '1rem',
                            padding: '1rem 1.25rem',
                            color: 'white',
                            outline: 'none'
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || sending}
                        className="btn btn-accent"
                        style={{ borderRadius: '1rem', padding: '0 1.25rem' }}
                    >
                        {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SupportChat;
