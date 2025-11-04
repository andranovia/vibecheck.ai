"use client";

import { useState, Suspense } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ChatInput } from "./ChatInput";
import { SettingsModal } from "../modal/SettingsModal";
import {
    Zap,
    Coffee,
    Sun,
    Moon,
    Smile,
} from "lucide-react";
import dynamic from "next/dynamic";

const MetaCloud = dynamic(() => import("@/components/chat/ui/MetaCloud"), { ssr: false });
interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    mood?: string;
    recommendations?: {
        song?: string;
        quote?: string;
        image?: string;
    };
}

interface ChatAreaProps {
    messages: Message[];
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
}

export function ChatArea({ messages, setMessages }: ChatAreaProps) {
    const { data: session } = useSession();
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);


    const suggestions = [
        { text: "I'm feeling overwhelmed with work", icon: Coffee, mood: "stressed", className: "-left-40 -top-90" },
        { text: "Having a great day today!", icon: Sun, mood: "happy", className: "-left-50 -top-46" },
        { text: "Feeling a bit lonely lately", icon: Moon, mood: "melancholy", className: "left-30 -top-15" },
        { text: "Super excited about something", icon: Zap, mood: "energetic", className: "left-90 -top-95" },
        { text: "Just need some motivation", icon: Smile, mood: "neutral", className: "left-110 -top-36" },
    ];

    const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
        setInput(suggestion.text);
        setShowSuggestions(false);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        // Require verified email before sending chat messages
        const emailVerified = (session?.user as any)?.emailVerified;
        if (session && !emailVerified) {
            const notice: Message = {
                id: Date.now().toString(),
                type: 'assistant',
                content: 'Please verify your email address to use the chatbot. Check your inbox for a verification link or request a new one from your account settings.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, notice]);
            return;
        }

        const userMessage: Message = {
            id: Date.now().toString(),
            type: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setShowSuggestions(false);

        try {
            // Import dynamically to avoid SSR issues with zustand
            const { generateResponse } = await import('@/lib/chatService');
            const { useApiKeysStore } = await import('@/lib/store');

            const selectedModel = useApiKeysStore.getState().defaultModel;

            const aiResponse = await generateResponse(
                userMessage.content,
                messages,
                {
                    model: selectedModel,
                    temperature: 0.7,
                    maxTokens: 1000,
                }
            );

            setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
            console.error('Error sending message:', error);

            // Show error message
            const errorResponse: Message = {
                id: Date.now().toString(),
                type: 'assistant',
                content: 'Sorry, I encountered an error. Please check your API settings or try again later.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-[30%] w-64 h-64 bg-gradient-to-r from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-[30%] w-48 h-48 bg-gradient-to-l from-accent/8 to-primary/8 rounded-full blur-2xl animate-pulse-slower"></div>
            </div>

            {/* Welcome Message */}
            {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                    <div className="text-center max-w-2xl">
                        {/* Main Logo Animation */}
                        <div className="relative top-20">

                            {/* Floating particles */}
                            <div className="absolute top-4 -left-4 w-3 h-3 bg-primary rounded-full animate-bounce-slow"></div>
                            <div className="absolute -top-2 right-2 w-2 h-2 bg-accent rounded-full animate-bounce-delayed"></div>
                            <div className="absolute top-16 -right-6 w-4 h-4 bg-primary/60 rounded-full animate-bounce-medium"></div>
                        </div>

                        <div className=" flex items-center justify-center mb-12">
                            <Suspense fallback={null}>
                                <MetaCloud />
                            </Suspense>
                        </div>

                        {/* Conversation Starters */}
                        {showSuggestions && (
                            <div className="space-y-4 animate-fade-in-up absolute">

                                <div className="flex flex-col gap-3">
                                    {suggestions.map((suggestion, index) => {
                                        const IconComponent = suggestion.icon;
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className={`group absolute h-auto p-4 text-left hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:border-primary/30 transition-all duration-300 hover:scale-[98%] ${suggestion.className}`}
                                                onClick={() => handleSuggestionClick(suggestion)}
                                            >
                                                <div className="flex items-center gap-3 w-full">
                                                    <div className="p-2 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                                        <IconComponent className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                                                        {suggestion.text}
                                                    </span>
                                                </div>
                                            </Button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Enhanced Input Area */}
            <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isLoading={isLoading}
                messagesLength={messages.length}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onModelChange={() => { }}
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
