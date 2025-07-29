import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
      openRouterApiKey: null,
      customProxies: [],
      defaultModel: process.env.NEXT_PUBLIC_DEFAULT_MODEL || 'gpt-4',
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
