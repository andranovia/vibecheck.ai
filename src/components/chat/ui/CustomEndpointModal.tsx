"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export interface CustomEndpointFormValues {
    configName: string;
    provider: string;
    endpoint: string;
    modelName: string;
    apiKey: string;
    description: string;
    features: string;
}

interface CustomEndpointModalProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (values: CustomEndpointFormValues) => Promise<void> | void;
}

const EMPTY_VALUES: CustomEndpointFormValues = {
    configName: "",
    provider: "",
    endpoint: "",
    modelName: "",
    apiKey: "",
    description: "",
    features: "",
};

export function CustomEndpointModal({ open, onClose, onSubmit }: CustomEndpointModalProps) {
    const [values, setValues] = useState<CustomEndpointFormValues>(EMPTY_VALUES);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setValues(EMPTY_VALUES);
            setError(null);
            setIsSubmitting(false);
        }
    }, [open]);

    const handleChange = (field: keyof CustomEndpointFormValues) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setValues((prev) => ({ ...prev, [field]: event.target.value }));
        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async () => {
        if (!values.endpoint.trim()) {
            setError("Endpoint URL is required.");
            return;
        }
        if (!values.configName.trim() && !values.modelName.trim()) {
            setError("Provide at least a name or model identifier.");
            return;
        }

        try {
            setIsSubmitting(true);
            await onSubmit(values);
            onClose();
        } catch (submitError) {
            const message = submitError instanceof Error ? submitError.message : "Unable to save configuration.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOpenChange = (nextOpen: boolean) => {
        if (isSubmitting) return;
        if (!nextOpen) {
            onClose();
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Add Custom Endpoint</DialogTitle>
                    <DialogDescription>
                        Store your own model credentials locally. Fill in the fields below to add a reusable endpoint configuration.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 max-h-[20rem] overflow-y-auto">
                    <div className="grid gap-2">
                        <Label htmlFor="configName">Configuration Name</Label>
                        <Input
                            id="configName"
                            value={values.configName}
                            onChange={handleChange("configName")}
                            placeholder="My DeepSeek Proxy"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="provider">Provider</Label>
                        <Input
                            id="provider"
                            value={values.provider}
                            onChange={handleChange("provider")}
                            placeholder="DeepSeek, OpenRouter, etc."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="endpoint">Endpoint URL *</Label>
                        <Input
                            id="endpoint"
                            value={values.endpoint}
                            onChange={handleChange("endpoint")}
                            placeholder="https://api.example.com/v1/chat/completions"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="modelName">Model Identifier</Label>
                        <Input
                            id="modelName"
                            value={values.modelName}
                            onChange={handleChange("modelName")}
                            placeholder="provider/model:version"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="apiKey">API Key</Label>
                        <Input
                            id="apiKey"
                            type="password"
                            value={values.apiKey}
                            onChange={handleChange("apiKey")}
                            placeholder="sk-..."
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="features">Tags (comma separated)</Label>
                        <Input
                            id="features"
                            value={values.features}
                            onChange={handleChange("features")}
                            placeholder="Reasoning, Low-latency"
                        />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={values.description}
                            onChange={handleChange("description")}
                            placeholder="Optional context shown in the picker"
                            rows={3}
                        />
                    </div>

                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                </div>

                <DialogFooter className="sm:justify-between">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? (
                            <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        ) : (
                            "Save Endpoint"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
