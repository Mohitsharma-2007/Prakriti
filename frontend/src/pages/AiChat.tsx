import React, { useState, useRef, useEffect } from 'react';
import { Camera, Mic, MicOff, Send, Image as ImageIcon, X, Loader2, Bot } from 'lucide-react';
import ReactMarkdown from 'react-markdown'; // Fixed: Added missing import
import { supabase } from '../lib/supabase';
import { useParams } from 'react-router-dom';

interface ChatMessage {
    role: 'user' | 'model';
    text: string;
    image?: string;
}

import { useAuth } from '../contexts/AuthContext';

const AiChat: React.FC = () => {
    const { user } = useAuth(); // Auth Context
    const { id } = useParams();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Voice State
    const [isListening, setIsListening] = useState(false);
    const [volume, setVolume] = useState(0);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    // Audio & WS Refs
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const lastInputMethod = useRef<'text' | 'voice'>('text');

    // Load History
    useEffect(() => {
        if (user) {
            const loadHistory = async () => {
                const { data } = await supabase
                    .from('ai_chat_history')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: true });

                if (data && data.length > 0) {
                    setMessages(data.map(m => ({
                        role: m.role as 'user' | 'model',
                        text: m.text || '',
                        image: m.image_url || undefined
                    })));
                } else {
                    setMessages([{ role: 'model', text: 'Namaste! I am Prakriti. 🌿\n\nI can analyze your crops, check the weather, and speak in your local language.\n\nHow can I help you today?' }]);
                }
            };
            loadHistory();
        }
    }, [user]);

    // Save Message Helper
    const saveMessage = async (role: 'user' | 'model', text: string, imageUrl?: string) => {
        if (!user) return;
        try {
            await supabase.from('ai_chat_history').insert({
                user_id: user.id,
                role,
                text,
                image_url: imageUrl
            });
        } catch (e) {
            console.error("Failed to save message", e);
        }
    };

    // Initialize WebSocket & Geolocation
    useEffect(() => {
        const connectWebSocket = () => {
            const wsUrl = `ws://${window.location.hostname}:8000/ws/live-chat`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("✅ LIVE Chat Connected");
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position) => {
                            const { latitude, longitude } = position.coords;
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({
                                    type: 'text',
                                    data: `[SYSTEM_LOCATION_UPDATE] Latitude: ${latitude}, Longitude: ${longitude}.`
                                }));
                            }
                        },
                        (err) => console.warn("Location denied"),
                        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
                    );
                }
            };

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'response') {
                        setMessages(prev => [...prev, { role: 'model', text: data.text }]);
                        saveMessage('model', data.text); // Save AI response

                        if (lastInputMethod.current === 'voice') speak(data.text);
                        setLoading(false);
                    }
                } catch (e) {
                    console.error(e);
                }
            };
            ws.onclose = () => {
                console.log("⚠️ Disconnected, retrying...");
                setTimeout(connectWebSocket, 3000);
            };
        };

        connectWebSocket();
        return () => {
            wsRef.current?.close();
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, [user]); // Re-connect if user changes, though unlikely

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => scrollToBottom(), [messages, loading]);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);

            // Simple language detection: Check for Devanagari characters (Hindi)
            const isHindi = /[\u0900-\u097F]/.test(text);

            let v;
            if (isHindi) {
                // Try to get a Hindi voice
                v = window.speechSynthesis.getVoices().find(v => v.lang.includes('hi') || v.lang.includes('Hindi'));
                u.lang = 'hi-IN';
            } else {
                // Default to Indian English
                v = window.speechSynthesis.getVoices().find(v => v.lang.includes('en-IN') || v.name.includes('India'));
                u.lang = 'en-IN';
            }

            if (v) u.voice = v;
            // Lower rate slightly for better clarity
            u.rate = 0.9;
            window.speechSynthesis.speak(u);
        }
    };

    const handleSend = async (e?: React.FormEvent, manualText?: string, audioData?: string) => {
        if (e) e.preventDefault();
        const text = manualText !== undefined ? manualText : input;
        if ((!text.trim() && !selectedImage && !audioData) || loading) return;

        // Set input method
        lastInputMethod.current = audioData ? 'voice' : 'text';

        let userMsg = text.trim();
        if (audioData) userMsg = "🎤 Audio Message";
        let imgUrl = '';
        setLoading(true);
        setInput('');

        try {
            if (selectedImage) {
                const ext = selectedImage.name.split('.').pop();
                const path = `chat-uploads/${Math.random()}.${ext}`;
                const { error } = await supabase.storage.from('crop-images').upload(path, selectedImage);
                if (!error) {
                    const { data } = supabase.storage.from('crop-images').getPublicUrl(path);
                    imgUrl = data.publicUrl;
                }
            }

            setMessages(prev => [...prev, { role: 'user', text: userMsg, image: imgUrl || undefined }]);
            saveMessage('user', userMsg, imgUrl); // Save to DB
            setSelectedImage(null);
            setPreviewUrl(null);

            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    type: audioData ? 'audio' : 'text',
                    data: audioData || userMsg
                }));
            } else {
                setLoading(false);
                alert("Connection lost");
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64Audio = (reader.result as string).split(',')[1];
                    handleSend(undefined, undefined, base64Audio);
                };
                stream.getTracks().forEach(t => t.stop());
                audioContextRef.current?.close();
                setVolume(0);
            };

            mediaRecorder.start();
            setIsListening(true);

            // VAD
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            source.connect(analyser);

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            let silenceStart = performance.now();
            const SILENCE_THRESHOLD = 8;

            const detectSilence = () => {
                if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') return;
                analyser.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
                const avg = sum / bufferLength;
                setVolume(avg);

                if (avg > SILENCE_THRESHOLD) silenceStart = performance.now();
                else if (performance.now() - silenceStart > 2000) {
                    stopRecording();
                    return;
                }
                requestAnimationFrame(detectSilence);
            };
            detectSilence();

        } catch (err) {
            console.error(err);
            setIsListening(false);
            alert("Mic Error");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsListening(false);
        }
    };

    const toggleListening = () => isListening ? stopRecording() : startRecording();

    const handleImg = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedImage(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    return (
        <div className="flex flex-col h-full relative z-10">
            {/* Header (Simplified for Layout) */}
            <div className="flex justify-center py-4 flex-col items-center gap-1">
                <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-full px-5 py-2 flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] ${wsRef.current?.readyState === WebSocket.OPEN ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                    <span className="text-xs font-medium text-white/70 uppercase tracking-widest">Prakriti Live</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-green-400/80 font-medium tracking-wide bg-green-500/5 px-3 py-1 rounded-md border border-green-500/10">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    Powered by AlphaEarth™ Satellite Intelligence
                </div>
            </div>

            {/* Messages Area - with extra padding at bottom dynamically calculated */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth pb-48 md:pb-52 scrollbar-none">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
                        <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mb-6 ring-1 ring-green-500/20 shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]">
                            <Bot className="w-10 h-10 text-green-500" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">Namaste, Farmer! 🙏</h2>
                        <p className="text-white/50 max-w-md text-lg leading-relaxed">
                            I am Prakriti. Show me your crop or ask me anything about farming in your local language.
                        </p>
                    </div>
                ) : (
                    messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-up`}
                        >
                            <div
                                className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm backdrop-blur-sm ${msg.role === 'user'
                                    ? 'bg-[#222222] text-white rounded-tr-sm border border-white/5'
                                    : 'bg-gradient-to-br from-green-500/10 to-emerald-600/10 text-white/90 rounded-tl-sm border border-green-500/10 shadow-[0_4px_20px_-4px_rgba(34,197,94,0.1)]'
                                    }`}
                            >
                                <div className="prose prose-invert prose-p:leading-relaxed prose-sm max-w-none">
                                    <ReactMarkdown
                                        components={{
                                            ul: (props) => <ul {...props} className="list-disc pl-4 mb-2 space-y-1" />,
                                            ol: (props) => <ol {...props} className="list-decimal pl-4 mb-2 space-y-1" />,
                                            li: (props) => <li {...props} className="pl-1" />,
                                            p: (props) => <p {...props} className="mb-2 last:mb-0" />,
                                            strong: (props) => <strong {...props} className="text-green-400 font-bold" />,
                                        }}
                                    >
                                        {msg.text}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    ))
                )}
                {/* Typing Indicator */}
                {loading && (
                    <div className="flex justify-start animate-fade-in">
                        <div className="bg-white/5 rounded-2xl p-4 flex gap-2 items-center border border-white/5">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Premium Input Dock - Fixed at Bottom - Responsive */}
            <div className="fixed bottom-28 md:bottom-12 left-0 right-0 z-40 flex justify-center pointer-events-none px-4 pb-[env(safe-area-inset-bottom)]">
                <div className={`w-full max-w-xl transition-all duration-300 pointer-events-auto ${isListening ? 'scale-105' : ''}`}>

                    {/* Image Preview Floating Pill - Above Input */}
                    {previewUrl && (
                        <div className="absolute -top-16 left-0 md:-left-4 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-2 pr-4 flex items-center gap-3 shadow-[0_8px_32px_rgba(0,0,0,0.5)] animate-slide-up z-50">
                            <img src={previewUrl} className="w-12 h-12 rounded-xl object-cover border border-white/10" alt="Preview" />
                            <div className="flex flex-col">
                                <span className="text-xs text-white font-medium">Image active</span>
                                <span className="text-[10px] text-white/50">Ready to analyze</span>
                            </div>
                            <button onClick={() => { setSelectedImage(null); setPreviewUrl(null); }} className="ml-2 p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Main Input Capsule */}
                    <div className={`relative flex items-center gap-2 p-1.5 rounded-[32px] border transition-all duration-300 group shadow-2xl mx-auto w-full ${isListening
                        ? 'bg-[#1a1a1a] border-green-500/50 shadow-[0_0_40px_-5px_rgba(34,197,94,0.3)]'
                        : 'bg-[#0f0f0f]/95 border-white/10 hover:border-white/20'
                        }`}>

                        {/* Tools Section */}
                        <div className="flex items-center gap-0.5 pl-1 shrink-0">
                            <input type="file" ref={cameraInputRef} onChange={handleImg} className="hidden" accept="image/*" capture="environment" />
                            <input type="file" ref={fileInputRef} onChange={handleImg} className="hidden" accept="image/*" />

                            <button onClick={() => cameraInputRef.current?.click()} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
                                <Camera className="w-5 h-5" />
                            </button>
                            <button onClick={() => fileInputRef.current?.click()} className="p-2.5 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200">
                                <ImageIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-5 bg-white/10 mx-1 shrink-0"></div>

                        {/* Text Input */}
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={isListening ? "Listening..." : "Message..."}
                            rows={1}
                            className="flex-1 bg-transparent border-0 focus:ring-0 text-white placeholder-white/40 text-[15px] px-1 py-3 resize-none h-12 leading-relaxed selection:bg-green-500/30 font-medium min-w-0"
                            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); } }}
                        />

                        {/* Status / Equalizer */}
                        {isListening && (
                            <div className="flex gap-1 items-center h-8 pr-2 shrink-0">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="w-1 bg-green-400 rounded-full animate-pulse"
                                        style={{
                                            height: `${Math.max(6, volume * (i + 1) * 8)}px`,
                                            opacity: 0.6 + (i * 0.1)
                                        }}
                                    ></div>
                                ))}
                            </div>
                        )}

                        {/* Right Actions */}
                        <div className="flex items-center gap-1 pr-1 shrink-0">
                            <button
                                onClick={toggleListening}
                                className={`p-2.5 rounded-full transition-all duration-300 ${isListening
                                    ? 'bg-red-500/10 text-red-500 ring-1 ring-red-500/30'
                                    : 'text-white/50 hover:text-white hover:bg-white/10'
                                    }`}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={(e) => handleSend(e)}
                                disabled={(!input.trim() && !selectedImage) || loading}
                                className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 ${(!input.trim() && !selectedImage) || loading
                                    ? 'bg-white/10 text-white/20'
                                    : 'bg-green-500 text-black hover:bg-green-400 hover:scale-110 shadow-lg shadow-green-500/20'
                                    }`}
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5 text-black/80" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div >
        </div >
    );
}

export default AiChat;
