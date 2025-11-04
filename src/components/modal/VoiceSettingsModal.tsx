"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useVoiceStore } from "@/lib/voiceStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Mic, Waves, Palette } from "lucide-react";

interface VoiceSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VoiceSettingsModal({
  open,
  onOpenChange,
}: VoiceSettingsModalProps) {
  const {
    visualizerType,
    setVisualizerType,
    autoTranscribe,
    setAutoTranscribe,
    maxRecordingDuration,
    setMaxRecordingDuration,
    showWaveformDuringRecording,
    transcriptionLanguage,
    setTranscriptionLanguage,
    setShowWaveformDuringRecording,
    primaryColor,
    enableProfanityFilter,
    setEnableProfanityFilter,
    secondaryColor,
    setPrimaryColor,
    setSecondaryColor,
  } = useVoiceStore();

  const [localMaxDuration, setLocalMaxDuration] = useState(maxRecordingDuration / 60); // Convert to minutes for UI

  const handleSave = () => {
    setMaxRecordingDuration(localMaxDuration * 60); // Convert back to seconds
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Voice Recording Settings</DialogTitle>
          <DialogDescription>
            Customize your voice recording experience
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="visualizer">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="visualizer" className="flex items-center gap-2">
              <Waves className="h-4 w-4" />
              <span>Visualizer</span>
            </TabsTrigger>
            <TabsTrigger value="recording" className="flex items-center gap-2">
              <Mic className="h-4 w-4" />
              <span>Recording</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="visualizer" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="visualizer-type">Visualizer Type</Label>
                <RadioGroup
                  id="visualizer-type"
                  value={visualizerType}
                  onValueChange={(value) => setVisualizerType(value as any)}
                  className="mt-2 space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="react-voice-visualizer" id="voice-visualizer" />
                    <Label htmlFor="voice-visualizer">React Voice Visualizer (Bar style)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wavesurfer" id="wavesurfer" />
                    <Label htmlFor="wavesurfer">WaveSurfer.js (Waveform style)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-waveform">Show waveform during recording</Label>
                <Switch
                  id="show-waveform"
                  checked={showWaveformDuringRecording}
                  onCheckedChange={setShowWaveformDuringRecording}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="recording" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-transcribe">Auto-transcribe recordings</Label>
                <Switch
                  id="auto-transcribe"
                  checked={autoTranscribe}
                  onCheckedChange={setAutoTranscribe}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transcription-language">Transcription Language</Label>
                <select 
                  id="transcription-language"
                  className="w-full p-2 border rounded-md"
                  value={transcriptionLanguage}
                  onChange={(e) => setTranscriptionLanguage(e.target.value)}
                >
                  <option value="en-US">English (US)</option>
                  <option value="en-GB">English (UK)</option>
                  <option value="es-ES">Spanish</option>
                  <option value="fr-FR">French</option>
                  <option value="de-DE">German</option>
                  <option value="it-IT">Italian</option>
                  <option value="ja-JP">Japanese</option>
                  <option value="ko-KR">Korean</option>
                  <option value="zh-CN">Chinese (Simplified)</option>
                  <option value="ru-RU">Russian</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="profanity-filter">Enable profanity filter</Label>
                <Switch
                  id="profanity-filter"
                  checked={enableProfanityFilter}
                  onCheckedChange={setEnableProfanityFilter}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="max-duration">Maximum recording duration</Label>
                  <span className="text-sm text-muted-foreground">
                    {localMaxDuration} minutes
                  </span>
                </div>
                <Slider
                  id="max-duration"
                  min={1}
                  max={10}
                  step={1}
                  value={[localMaxDuration]}
                  onValueChange={(value) => setLocalMaxDuration(value[0])}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="primary-color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    id="secondary-color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-md text-sm"
                  />
                </div>
              </div>

              <div className="p-4 border rounded-md">
                <div className="text-sm font-medium mb-2">Preview</div>
                <div
                  className="h-12 rounded-md"
                  style={{
                    background: `linear-gradient(90deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                ></div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}