import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { cn } from '../utils/cn';
import { ChatMessage } from '../types';

export const ChatBot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (input.trim() === '') return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');

        // Respuesta automática informativa (sin IA)
        setTimeout(() => {
            const botMessage: ChatMessage = { 
                role: 'model', 
                text: 'Hola, actualmente el asistente IA no está disponible. Puedes usar el Dashboard para ver tus finanzas, añadir transacciones, metas de ahorro y presupuestos. ¿Necesitas ayuda con algo específico?' 
            };
            setMessages(prev => [...prev, botMessage]);
        }, 500);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            <div className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40">
                <Button
                    onClick={() => setIsOpen(!isOpen)}
                    className={cn(
                        "rounded-full w-14 h-14 md:w-16 md:h-16 shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center",
                        isOpen ? "bg-error hover:bg-error-hover" : "bg-gradient-to-r from-primary to-purple-600 hover:shadow-primary/50"
                    )}
                >
                    {isOpen ? <X className="w-6 h-6 md:w-8 md:h-8" /> : <MessageSquare className="w-6 h-6 md:w-8 md:h-8" />}
                </Button>
            </div>
            {isOpen && (
                <div className="fixed bottom-24 md:bottom-28 right-4 md:right-8 w-[calc(100vw-2rem)] md:w-96 h-[60vh] max-h-[600px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-3xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200/50 dark:border-white/10 flex items-center bg-gradient-to-r from-primary to-purple-600 text-white rounded-t-3xl">
                        <div className="bg-white/20 p-2 rounded-full mr-3 backdrop-blur-sm">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm md:text-base">Asistente Vibe</h3>
                            <p className="text-xs text-white/80 flex items-center"><Sparkles className="w-3 h-3 mr-1" /> En línea</p>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-4 overflow-y-auto bg-transparent scrollbar-hide">
                        {messages.length === 0 && (
                             <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-60">
                                <Bot className="w-12 h-12 text-primary mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-300">Hola, soy tu asistente. Actualmente trabajo en modo básico. ¿En qué puedo orientarte?</p>
                             </div>
                        )}
                        <div className="space-y-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={cn("flex", msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    <div className={cn(
                                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                        msg.role === 'user' 
                                            ? 'bg-primary text-white rounded-tr-none' 
                                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-tl-none border border-gray-100 dark:border-gray-700'
                                    )}>
                                       <div className="text-sm">{msg.text}</div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-3 md:p-4 border-t border-gray-200/50 dark:border-white/10 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md rounded-b-3xl">
                        <div className="flex items-center space-x-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 px-2 py-1 shadow-inner">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Escribe un mensaje..."
                                className="flex-1 px-3 py-2 bg-transparent focus:outline-none text-sm text-gray-900 dark:text-white placeholder-gray-400"
                            />
                            <Button 
                                onClick={handleSend} 
                                disabled={!input.trim()} 
                                size="icon" 
                                className="rounded-full w-8 h-8 md:w-9 md:h-9 flex-shrink-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
