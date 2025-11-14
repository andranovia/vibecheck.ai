import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApiKeysStore } from '@/lib/store';
import { Bot, Brain, ChevronDown, MessageCircle, Mic, Plus, RouteOff, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react'

interface AIModel {
    id: string;
    name: string;
    provider: string;
    icon: any;
    color: string;
    description: string;
    features: string[];
    isCustom?: boolean;
}

const modes = [
    {
        id: "chat",
        name: "Chat Mode",
        icon: MessageCircle,
        color: "text-primary",
    },
    {
        id: "voice",
        name: "Voice Mode",
        icon: Mic,
        color: "text-pink-500",
    },
];

const models: AIModel[] = [
    {
        id: "gpt-5",
        name: "GPT-5",
        provider: "OpenAI",
        icon: Brain,
        color: "text-green-600",
        description: "Most capable model for complex tasks",
        features: ["Reasoning", "Code", "Analysis"],
    },
    {
        id: "deepseek/deepseek-chat-v3.1",
        name: "DeepSeek Chat V3.1",
        provider: "DeepSeek",
        icon: Zap,
        color: "text-blue-600",
        description: "Fast and efficient for most tasks",
        features: ["Speed", "General", "Cost-effective"],
    }
];

const ModelSelection = ({ onModelChange, selectedMode, setSelectedMode, handleVoiceToggle }: { onModelChange?: (modelId: string) => void, selectedMode: string, setSelectedMode: (mode: string) => void, handleVoiceToggle: () => void }) => {

    const { defaultModel, customProxies, setDefaultModel } = useApiKeysStore();
    const [selectedModel, setSelectedModel] = useState(defaultModel);

    const customProxyModels: AIModel[] = customProxies.map(proxy => ({
        id: proxy.id,
        name: proxy.configName,
        provider: proxy.provider,
        icon: RouteOff,
        color: "text-teal-600",
        description: `${proxy.modelName} (${proxy.endpoint})`,
        features: proxy.features,
        isCustom: true
    }));

    const allModels = [...models, ...customProxyModels];
    const currentModel = allModels.find((m) => m.id === selectedModel);
    const ModelIcon = currentModel?.icon || Bot;


    useEffect(() => {
        setSelectedModel(defaultModel);
    }, [defaultModel]);


    const handleModelChange = (modelId: string) => {
        setSelectedModel(modelId);
        setDefaultModel(modelId);
        if (onModelChange) {
            onModelChange(modelId);
        }
    };


    return (
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 px-3 hover:bg-muted/50 transition-colors group/trigger"
                        >
                            <div className="flex items-center gap-2">
                                <ModelIcon className={`h-4 w-4 ${currentModel?.color}`} />
                                <span className="text-sm font-medium text-foreground">
                                    {currentModel?.name}
                                </span>
                                <Badge
                                    variant="outline"
                                    className="text-xs px-1.5 py-0.5"
                                >
                                    {currentModel?.provider}
                                </Badge>
                            </div>
                            <ChevronDown className="h-3 w-3 ml-1 opacity-50 group-hover/trigger:opacity-100 transition-opacity" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-80 p-2 -ml-4 h-[20rem] overflow-y-auto scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40"
                        sideOffset={30}
                    >
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium text-foreground">
                                AI Models
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Choose your preferred AI assistant
                            </p>
                        </div>
                        <DropdownMenuSeparator />

                        {models.map((model) => {
                            const Icon = model.icon;
                            return (
                                <DropdownMenuItem
                                    key={model.id}
                                    onClick={() => handleModelChange(model.id)}
                                    className="p-3 cursor-pointer focus:bg-muted/50"
                                >
                                    <div className="flex items-start gap-3 w-full">
                                        <Icon
                                            className={`h-5 w-5 mt-0.5 ${model.color} flex-shrink-0`}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-sm text-foreground">
                                                    {model.name}
                                                </span>
                                                <Badge variant="outline" className="text-xs">
                                                    {model.provider}
                                                </Badge>
                                                {selectedModel === model.id && (
                                                    <Badge variant="default" className="text-xs">
                                                        Active
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {model.description}
                                            </p>
                                            <div className="flex gap-1 mt-1 pt-2">
                                                {model.features.map((feature) => (
                                                    <Badge
                                                        key={feature}
                                                        variant="secondary"
                                                        className="text-xs px-1.5 py-0.5"
                                                    >
                                                        {feature}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            );
                        })}

                        <DropdownMenuSeparator />

                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium text-foreground">
                                Custom Configurations
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Your custom model configurations
                            </p>
                        </div>

                        {customProxyModels && customProxyModels?.length > 0 ? (
                            customProxyModels.map((model) => {
                                const Icon = model.icon;
                                return (
                                    <DropdownMenuItem
                                        key={model.id}
                                        onClick={() => handleModelChange(model.id)}
                                        className="p-3 cursor-pointer focus:bg-muted/50"
                                    >
                                        <div className="flex items-start gap-3 w-full">
                                            <Icon
                                                className={`h-5 w-5 mt-0.5 ${model.color} flex-shrink-0`}
                                            />
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm text-foreground">
                                                        {model.name}
                                                    </span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {model.provider}
                                                    </Badge>
                                                    {selectedModel === model.id && (
                                                        <Badge variant="default" className="text-xs">
                                                            Active
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {model.description}
                                                </p>
                                                <div className="flex gap-1 mt-1">
                                                    {model.features.map((feature) => (
                                                        <Badge
                                                            key={feature}
                                                            variant="secondary"
                                                            className="text-xs px-1.5 py-0.5"
                                                        >
                                                            {feature}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuItem>
                                );
                            })
                        ) : (
                            <div className="p-10 text-sm text-muted-foreground">
                                <div className="flex flex-col items-center gap-5">
                                    <RouteOff className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm ">No custom proxies configured.</span>
                                </div>
                            </div>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="p-3 cursor-pointer focus:bg-muted/50">
                            <div className="flex items-center gap-3 w-full">
                                <Plus className="h-5 w-5 text-muted-foreground" />
                                <div>
                                    <span className="font-medium text-sm text-foreground">
                                        Add Custom Endpoint
                                    </span>
                                    <p className="text-xs text-muted-foreground">
                                        Configure your own API
                                    </p>
                                </div>
                            </div>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center gap-2">
                {modes.map((mode) => {
                    const Icon = mode.icon;
                    return (
                        <Button
                            key={mode.id}
                            variant={selectedMode === mode.id ? "default" : "ghost"}
                            size="sm"
                            className={`h-8 px-3 ${selectedMode === mode.id
                                ? "bg-primary/10 text-primary hover:text-primary hover:bg-primary/10"
                                : "hover:bg-muted/50"
                                }`}
                            onClick={() => {
                                setSelectedMode(mode.id);
                                    handleVoiceToggle();
                            }}
                        >
                            <Icon className="h-3 w-3 mr-1" />
                            <span className="text-xs">{mode.name}</span>
                        </Button>
                    );
                })}
            </div>
        </div>
    )
}

export default ModelSelection