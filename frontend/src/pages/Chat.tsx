import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Send, ArrowLeft } from 'lucide-react';

interface Message {
    id: string;
    sender_id: string;
    receiver_id: string;
    content: string;
    created_at: string;
}

interface Profile {
    full_name: string;
    avatar_url?: string;
}

export default function Chat() {
    const { userId } = useParams<{ userId: string }>();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [receiverProfile, setReceiverProfile] = useState<Profile | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (userId) {
            fetchReceiverProfile();
            fetchMessages();
            subscribeToMessages();
        }
    }, [userId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchReceiverProfile = async () => {
        const { data } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', userId)
            .single();
        if (data) setReceiverProfile(data);
    };

    const fetchMessages = async () => {
        if (user && userId) {
            const { data } = await supabase
                .from('messages')
                .select('*')
                .or(`and(sender_id.eq.${user.id},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${user.id})`)
                .order('created_at', { ascending: true });

            if (data) setMessages(data);
        }
    };

    const subscribeToMessages = () => {
        const subscription = supabase
            .channel('public:messages')
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${user?.id}` // Listen for messages sent TO me
            }, (payload) => {
                if (payload.new.sender_id === userId) {
                    setMessages(prev => [...prev, payload.new as Message]);
                }
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `sender_id=eq.${user?.id}` // Listen for messages sent BY me (for multi-device sync)
            }, (payload) => {
                if (payload.new.receiver_id === userId) {
                    setMessages(prev => {
                        if (prev.find(m => m.id === payload.new.id)) return prev;
                        return [...prev, payload.new as Message];
                    });
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(subscription);
        };
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !userId) return;

        const msgContent = newMessage.trim();
        setNewMessage(''); // Clear input immediately

        const { error } = await supabase
            .from('messages')
            .insert({
                sender_id: user.id,
                receiver_id: userId,
                content: msgContent
            });

        if (error) {
            console.error('Error sending message:', error);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)]">
            {/* Header */}
            <div className="bg-white p-3 border-b border-slate-100 flex items-center gap-3 shadow-sm sticky top-0 z-10">
                <button onClick={() => navigate(-1)} className="text-slate-500 hover:text-slate-700">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="bg-slate-100 w-8 h-8 rounded-full flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
                    {receiverProfile?.full_name?.[0] || 'U'}
                </div>
                <div>
                    <h2 className="font-semibold text-slate-800 text-sm">{receiverProfile?.full_name || 'User'}</h2>
                    <p className="text-xs text-slate-500">Prakriti Chat</p>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50">
                {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${isMe
                                ? 'bg-primary text-white rounded-br-none'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                                }`}>
                                {msg.content}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-slate-200 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-sm"
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="bg-primary hover:bg-primary/90 text-white p-2 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Send className="w-5 h-5" />
                </button>
            </form>
        </div>
    );
}
