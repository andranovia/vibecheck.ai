import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { nanoid } from 'nanoid';
import { useApiKeysStore, CustomProxy } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import {
  Key,
  Lock,
  Link,
  Plus,
  Save,
  X,
  Info,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    openRouterApiKey, 
    setOpenRouterApiKey, 
    customProxies,
    addCustomProxy,
    removeCustomProxy,
  } = useApiKeysStore();

  const [apiKey, setApiKey] = useState(openRouterApiKey || '');
  const [configName, setConfigName] = useState('');
  const [modelName, setModelName] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [proxyApiKey, setProxyApiKey] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');
  const [showNewProxy, setShowNewProxy] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Save API key
    setOpenRouterApiKey(apiKey || null);
    
    // Show success state briefly
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setIsSaving(false);
      onClose();
    }, 1000);
  };

  const handleAddProxy = () => {
    if (configName && modelName && proxyUrl) {
      const newProxy: CustomProxy = {
        id: `custom-${nanoid(6)}`,
        configName: configName,
        modelName: modelName,
        endpoint: proxyUrl,
        apiKey: proxyApiKey || undefined,
        customPrompt: customPrompt || undefined,
        provider: 'Custom',
        description: `${modelName} via custom endpoint`,
        features: ['Custom', 'API'],
      };
      
      addCustomProxy(newProxy);
      
      // Reset form
      setConfigName('');
      setModelName('');
      setProxyUrl('');
      setProxyApiKey('');
      setCustomPrompt('');
      setShowNewProxy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-background border border-border rounded-xl shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Settings</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="space-y-6">
            {/* API Keys Section */}
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="openrouter-api-key" className="text-sm flex items-center justify-between">
                    <span>OpenRouter API Key</span>
                    <a 
                      href="https://openrouter.ai/keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center"
                    >
                      Get a key <Link className="h-3 w-3 ml-1" />
                    </a>
                  </label>
                  
                  <div className="relative">
                    <Input
                      id="openrouter-api-key"
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="sk-or-..."
                      className="pr-10"
                    />
                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <p className="text-xs text-muted-foreground">
                    <Info className="inline h-3 w-3 mr-1" />
                    Your API key is stored locally and never sent to our servers.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Custom Proxies Section */}
            <div>
                <h3 className="text-sm font-medium mb-2 flex items-center">
                <Link className="h-4 w-4 mr-2" />
                Custom Configurations
              </h3>              <div className="space-y-4">
                {customProxies.length > 0 ? (
                  <div className="space-y-3">
                    {customProxies.map((proxy) => (
                      <div key={proxy.id} className="bg-muted/30 border border-border/50 rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-sm font-medium">{proxy.configName}</h4>
                            <p className="text-xs text-muted-foreground font-medium">
                              {proxy.modelName}
                            </p>
                            <p className="text-xs text-muted-foreground truncate max-w-[250px]">
                              {proxy.endpoint}
                            </p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => removeCustomProxy(proxy.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                        
                        <div className="mt-2 flex flex-wrap gap-1">
                          <Badge variant="outline" className="text-xs">
                            {proxy.provider}
                          </Badge>
                          {proxy.customPrompt && (
                            <Badge variant="secondary" className="text-xs">
                              Custom Prompt
                            </Badge>
                          )}
                          {proxy.features.map((feature, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {feature}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-6 flex flex-col items-center justify-center">
                    <p className="text-sm text-muted-foreground text-center">
                      No custom configurations added yet
                    </p>
                  </div>
                )}
                
                {showNewProxy ? (
                  <div className="bg-muted/30 border border-border/50 rounded-lg p-4 space-y-3">
                    <h4 className="text-sm font-medium">Add Custom Configuration</h4>
                    
                    <div className="space-y-2">
                      <label htmlFor="config-name" className="text-xs">Configuration Name</label>
                      <Input
                        id="config-name"
                        value={configName}
                        onChange={(e) => setConfigName(e.target.value)}
                        placeholder="My Custom Config"
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="model-name" className="text-xs">Model Name</label>
                      <Input
                        id="model-name"
                        value={modelName}
                        onChange={(e) => setModelName(e.target.value)}
                        placeholder="deepseek/deepseek-r1-0528:free"
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        <Info className="inline h-3 w-3 mr-1" />
                        Format: provider/model-name:version
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="proxy-url" className="text-xs">Proxy URL</label>
                      <Input
                        id="proxy-url"
                        value={proxyUrl}
                        onChange={(e) => setProxyUrl(e.target.value)}
                        placeholder="https://api.example.com/v1/chat/completions"
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="proxy-api-key" className="text-xs">API Key (Optional)</label>
                      <Input
                        id="proxy-api-key"
                        type="password"
                        value={proxyApiKey}
                        onChange={(e) => setProxyApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="h-8 text-sm"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="custom-prompt" className="text-xs">Custom Prompt (Optional)</label>
                      <Input
                        id="custom-prompt"
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder="You are a helpful AI assistant..."
                        className="h-8 text-sm"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        System prompt to use with this model
                      </p>
                    </div>
                    
                    <div className="flex justify-between pt-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowNewProxy(false)}
                        className="text-muted-foreground"
                      >
                        Cancel
                      </Button>
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={handleAddProxy}
                        disabled={!configName || !modelName || !proxyUrl}
                      >
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add Proxy
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setShowNewProxy(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Configuration
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-between items-center">
            <div>
              {saveSuccess && (
                <div className="flex items-center text-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  <span className="text-sm">Settings saved!</span>
                </div>
              )}
            </div>
            
            <Button 
              variant="default" 
              onClick={handleSave} 
              disabled={isSaving}
              className="min-w-[100px]"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
