import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useApiKeysStore } from '@/lib/store';
import { Bot, ChevronDown, MessageCircle, Mic, Plus, RouteOff, Trash } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { CustomEndpointModal, CustomEndpointFormValues } from './CustomEndpointModal';

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

const ModelSelection = ({ onModelChange, selectedMode, setSelectedMode, handleVoiceToggle }: { onModelChange?: (modelId: string) => void, selectedMode: string, setSelectedMode: (mode: string) => void, handleVoiceToggle: () => void }) => {

    const { defaultModel, customProxies, setDefaultModel, addCustomProxy, removeCustomProxy } = useApiKeysStore();
    const [selectedModel, setSelectedModel] = useState(defaultModel);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const currentModel = customProxyModels.find((m) => m.id === selectedModel);
    const hasConfigs = customProxyModels.length > 0;
    const ModelIcon = currentModel?.icon || Bot;

    useEffect(() => {
        if (defaultModel && customProxyModels.some((m) => m.id === defaultModel)) {
            setSelectedModel(defaultModel);
        } else if (customProxyModels.length > 0) {
            const fallback = customProxyModels[0].id;
            setSelectedModel(fallback);
            setDefaultModel(fallback);
            onModelChange?.(fallback);
        } else {
            setSelectedModel('');
            setDefaultModel('');
            onModelChange?.('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultModel, customProxyModels.length]);


    const handleModelChange = (modelId: string) => {
        setSelectedModel(modelId);
        setDefaultModel(modelId);
        onModelChange?.(modelId);
    };

    const handleModalSubmit = async (values: CustomEndpointFormValues) => {
        const id = `custom-${Date.now()}`;
        const featuresArr = values.features
            ? values.features.split(',').map((f) => f.trim()).filter(Boolean)
            : [];

        const proxy = {
            id,
            configName: values.configName || values.modelName || `Custom ${id}`,
            modelName: values.modelName || '',
            endpoint: values.endpoint.trim(),
            apiKey: values.apiKey || undefined,
            customPrompt: undefined,
            provider: values.provider || 'Custom',
            description: values.description || '',
            features: featuresArr,
        };

        addCustomProxy(proxy);
        handleModelChange(id);
        setIsModalOpen(false);
    };

    const handleRemoveCustom = (id: string) => {
        const remaining = customProxies.filter((proxy) => proxy.id !== id);
        removeCustomProxy(id);
        if (selectedModel === id) {
            const fallback = remaining[0]?.id || '';
            handleModelChange(fallback);
            if (!remaining.length) {
                setIsModalOpen(true);
            }
        }
    };

    return (
        <>
        <div className="flex items-center justify-between px-4 py-2 border-b border-border/30">
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-8 px-3 hover:bg-muted/50 transition-colors group/trigger"
                        >
                            <div className="flex items-center gap-2">
                                <ModelIcon className={`h-4 w-4 ${currentModel?.color ?? ''}`} />
                                <span className="text-sm font-medium text-foreground">
                                    {currentModel?.name || 'No endpoint selected'}
                                </span>
                                {currentModel?.provider ? (
                                    <Badge
                                        variant="outline"
                                        className="text-xs px-1.5 py-0.5"
                                    >
                                        {currentModel?.provider}
                                    </Badge>
                                ) : null}
                            </div>
                            <ChevronDown className="h-3 w-3 ml-1 opacity-50 group-hover/trigger:opacity-100 transition-opacity" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="start"
                        className="w-80 p-2 -ml-4 h-auto overflow-y-auto scrollbar-thin scrollbar-track-muted/20 scrollbar-thumb-muted-foreground/20 hover:scrollbar-thumb-muted-foreground/40"
                        sideOffset={30}
                    >
                        <div className="px-2 py-1.5">
                            <p className="text-sm font-medium text-foreground">
                                Your Endpoints
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Select from saved configurations or add a new one
                            </p>
                        </div>
                        <DropdownMenuSeparator />

                        {hasConfigs ? (
                            customProxyModels.map((model) => {
                                const Icon = model.icon || RouteOff;
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
                                                {model.features?.map((feature) => (
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

                                        <div className="flex items-start ml-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveCustom(model.id);
                                                }}
                                                className="h-7 w-7 p-0"
                                                aria-label="Remove custom proxy"
                                            >
                                                <Trash className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                                );
                            })
                        ) : (
                            <div className="p-6 text-sm text-muted-foreground">
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <RouteOff className="h-6 w-6 text-muted-foreground" />
                                    <span className="text-sm">No custom endpoints yet. Add one below to start chatting.</span>
                                </div>
                            </div>
                        )}

                        <DropdownMenuSeparator />

                        <DropdownMenuItem className="p-3 cursor-pointer focus:bg-muted/50" onClick={() => setIsModalOpen(true)}>
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

        <CustomEndpointModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleModalSubmit}
        />
        </>
    )
}

export default ModelSelection