import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Suggestion =
    | { type: "music"; title: string; subtitle?: string; link?: string; previewUrl?: string; mood?: string }
    | { type: "quote"; text: string; author?: string }
    | { type: "movie" | "series" | "book"; title: string; note?: string; year?: string; link?: string }
    | { type: "action"; label: string; minutes?: number; id?: string };

export interface Message {
    id: string;
    type: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    suggestions?: Suggestion[];
}


export interface CustomProxy {
  id: string;
  configName: string;    // Configuration name
  modelName: string;     // Model name like "deepseek/deepseek-r1-0528:free"
  endpoint: string;      // Proxy URL
  apiKey?: string;       // API key (optional)
  customPrompt?: string; // Custom system prompt (optional)
  provider: string;      // For UI display purposes
  description: string;   // For UI display purposes
  features: string[];    // For UI display purposes
}

interface ApiKeysState {
  openRouterApiKey: string | null;
  customProxies: CustomProxy[];
  defaultModel: string;
  setOpenRouterApiKey: (key: string | null) => void;
  addCustomProxy: (proxy: CustomProxy) => void;
  removeCustomProxy: (id: string) => void;
  setDefaultModel: (modelId: string) => void;
}

export const useApiKeysStore = create<ApiKeysState>()(
  persist(
    (set) => ({
      openRouterApiKey: process.env.OPENROUTER_API_KEY || null,
      customProxies: [],
      defaultModel: process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'deepseek/deepseek-chat-v3.1',
      setOpenRouterApiKey: (key) => set({ openRouterApiKey: key }),
      addCustomProxy: (proxy) =>
        set((state) => ({
          customProxies: [...state.customProxies, proxy],
        })),
      removeCustomProxy: (id) =>
        set((state) => ({
          customProxies: state.customProxies.filter((proxy) => proxy.id !== id),
        })),
      setDefaultModel: (modelId) => set({ defaultModel: modelId }),
    }),
    {
      name: 'vibecheck-api-keys',
    }
  )
);


interface MessagesState {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
}

export const useMessagesStore = create<MessagesState>()(
  persist(
    (set) => ({
      messages: [],
      setMessages: (messages) => set({ messages }),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'vibecheck-messages',
    }
  )
);
