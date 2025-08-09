"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChatInput } from "./ChatInput";
import { SettingsModal } from "./SettingsModal";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import {
    Sparkles,
    User,
    Bot,
    Music,
    Quote,
    Image as ImageIcon,
    Heart,
    Zap,
    Coffee,
    Sun,
    Moon,
    Smile,
    MessageCircle,
    Settings as SettingsIcon
} from "lucide-react";

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
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const [currentGreeting, setCurrentGreeting] = useState(0);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [currentMode, setCurrentMode] = useState('vibecheck-pro');

    const greetings = [
        "What's on your mind today?",
        "How are you feeling right now?",
        "Share your current vibe with me",
        "Tell me about your day so far",
        "What's your energy like today?"
    ];

    const suggestions = [
        { text: "I'm feeling overwhelmed with work", icon: Coffee, mood: "stressed" },
        { text: "Having a great day today!", icon: Sun, mood: "happy" },
        { text: "Feeling a bit lonely lately", icon: Moon, mood: "melancholy" },
        { text: "Super excited about something", icon: Zap, mood: "energetic" },
        { text: "Just need some motivation", icon: Smile, mood: "neutral" },
        { text: "Feeling creative and inspired", icon: Sparkles, mood: "creative" }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentGreeting((prev) => (prev + 1) % greetings.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [greetings.length]);

    const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
        setInput(suggestion.text);
        setShowSuggestions(false);
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

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
                    mode: currentMode, // Use current selected mode
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

    const getMoodColor = (mood?: string) => {
        switch (mood) {
            case 'calm': return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
            case 'energetic': return 'bg-orange-500/10 text-orange-600 border-orange-500/20';
            case 'contemplative': return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
            case 'joyful': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
            case 'peaceful': return 'bg-green-500/10 text-green-600 border-green-500/20';
            case 'stressed': return 'bg-red-500/10 text-red-600 border-red-500/20';
            case 'happy': return 'bg-pink-500/10 text-pink-600 border-pink-500/20';
            case 'melancholy': return 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20';
            case 'creative': return 'bg-violet-500/10 text-violet-600 border-violet-500/20';
            case 'neutral': return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
            default: return 'bg-primary/10 text-primary border-primary/20';
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
                        <div className="relative mb-0">

                            {/* Floating particles */}
                            <div className="absolute top-4 -left-4 w-3 h-3 bg-primary rounded-full animate-bounce-slow"></div>
                            <div className="absolute -top-2 right-2 w-2 h-2 bg-accent rounded-full animate-bounce-delayed"></div>
                            <div className="absolute top-16 -right-6 w-4 h-4 bg-primary/60 rounded-full animate-bounce-medium"></div>
                        </div>

                        <div className="h-12 flex items-center justify-center mb-12">
                            <p className="text-4xl text-foreground transition-all duration-1000 ease-in-out animate-fade-in">
                                {greetings[currentGreeting]}
                            </p>
                        </div>

                        {/* Conversation Starters */}
                        {showSuggestions && (
                            <div className="space-y-4 animate-fade-in-up">
                                <div className="flex items-center gap-2 justify-center text-sm text-muted-foreground mb-8">
                                    <MessageCircle className="h-4 w-4" />
                                    Or try one of these conversation starters
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl">
                                    {suggestions.map((suggestion, index) => {
                                        const IconComponent = suggestion.icon;
                                        return (
                                            <Button
                                                key={index}
                                                variant="outline"
                                                className="group h-auto p-4 text-left hover:bg-gradient-to-r hover:from-primary/5 hover:to-accent/5 hover:border-primary/30 transition-all duration-300 hover:scale-[98%]"
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

            {/* Messages */}
            {messages.length > 0 && (
                <ScrollArea className="flex-1 p-6 relative z-10 h-full">
                    <div className="space-y-14 max-w-4xl mx-auto mb-[15rem]">
                        {messages.map((message, index) => (
                            <div
                                key={message.id}
                                className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'
                                    } animate-fade-in-up`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {message.type === 'assistant' && (
                                    <Avatar className="w-10 h-10 border-2 border-primary/20 shrink-0">
                                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                            <Bot className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}

                                <div className={`max-w-[75%] `}>
                                    <Card className={`group hover:shadow-lg transition-all duration-300 ${message.type === 'user'
                                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground ml-auto py-4'
                                            : 'bg-card/80 backdrop-blur-sm border-border/50 hover:bg-card/90 hover:border-primary/20'
                                        }`}>
                                        <CardContent>
                                            <div className="prose prose-sm dark:prose-invert max-w-none text-sm leading-relaxed">
                                                <ReactMarkdown 
                                                    remarkPlugins={[remarkGfm]} 
                                                    rehypePlugins={[rehypeRaw]}
                                                    components={{
                                                        // Override default component styles
                                                        p: ({node, ...props}) => <p className="text-sm" {...props} />,
                                                        strong: ({node, ...props}) => <strong className="font-bold text-primary" {...props} />,
                                                        em: ({node, ...props}) => <em className="text-accent italic" {...props} />,
                                                        blockquote: ({node, ...props}) => (
                                                            <blockquote className="pl-4 border-l-2 border-primary/40 italic text-muted-foreground" {...props} />
                                                        ),
                                                    }}
                                                >
                                                    {message.content}
                                                </ReactMarkdown>
                                            </div>

                                            {message.mood && (
                                                <div className="mt-4 flex items-center gap-2">
                                                    <Badge
                                                        variant="outline"
                                                        className={`${getMoodColor(message.mood)} animate-fade-in`}
                                                    >
                                                        <Heart className="h-3 w-3 mr-1 animate-pulse" />
                                                        {message.mood}
                                                    </Badge>
                                                </div>
                                            )}

                                            {message.recommendations && (
                                                <div className="mt-6 space-y-4">
                                                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                                                        <Sparkles className="h-3 w-3" />
                                                        Personalized for your vibe
                                                    </div>

                                                    {message.recommendations.song && (
                                                        <div className="group/rec flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                                                            <div className="p-2 rounded-full bg-primary/10 group-hover/rec:bg-primary/20 transition-colors">
                                                                <Music className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{message.recommendations.song}</p>
                                                                <p className="text-xs text-muted-foreground">Song recommendation</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {message.recommendations.quote && (
                                                        <div className="group/rec flex items-start gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                                                            <div className="p-2 rounded-full bg-accent/10 group-hover/rec:bg-accent/20 transition-colors">
                                                                <Quote className="h-4 w-4 text-accent" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm italic leading-relaxed">{message.recommendations.quote}</p>
                                                                <p className="text-xs text-muted-foreground mt-1">Inspirational quote</p>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {message.recommendations.image && (
                                                        <div className="group/rec flex items-center gap-3 p-3 bg-muted/30 hover:bg-muted/50 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                                                            <div className="p-2 rounded-full bg-primary/10 group-hover/rec:bg-primary/20 transition-colors">
                                                                <ImageIcon className="h-4 w-4 text-primary" />
                                                            </div>
                                                            <div className="flex-1">
                                                                <p className="text-sm font-medium">{message.recommendations.image}</p>
                                                                <p className="text-xs text-muted-foreground">Mood image</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>

                                {message.type === 'user' && (
                                    <Avatar className="w-10 h-10 border-2 border-muted shrink-0">
                                        <AvatarFallback className="bg-gradient-to-br from-muted to-muted-foreground/20">
                                            <User className="h-5 w-5" />
                                        </AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-4 justify-start animate-fade-in">
                                <Avatar className="w-10 h-10 border-2 border-primary/20">
                                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-primary-foreground">
                                        <Bot className="h-5 w-5" />
                                    </AvatarFallback>
                                </Avatar>
                                <Card className="bg-card/80 backdrop-blur-sm">
                                    <CardContent className="p-5">
                                        <div className="flex items-center gap-3">
                                            <div className="flex gap-1">
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                            <span className="text-sm text-muted-foreground">Analyzing your vibe...</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            )}

            {/* Enhanced Input Area */}
            <ChatInput
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isLoading={isLoading}
                messagesLength={messages.length}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onModeChange={setCurrentMode}
                onModelChange={() => {}} // We're already watching defaultModel from the store
            />

            {/* Settings Modal */}
            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={() => setIsSettingsOpen(false)}
            />
        </div>
    );
}
