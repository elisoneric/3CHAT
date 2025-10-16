import type { ComponentType } from 'react';

export enum ChatMessageRole {
    User = 'user',
    Model = 'model',
}

export interface ChatMessage {
    role: ChatMessageRole;
    content: string;
}

export interface Persona {
    id: string;
    name: string;
    icon: ComponentType<{ className?: string }>;
    systemInstruction: string;
    color: 'creative' | 'code' | 'sage';
}

export interface ChatHistoryItem {
    id: string;
    title: string;
    personaId: string;
    messages: ChatMessage[];
}
