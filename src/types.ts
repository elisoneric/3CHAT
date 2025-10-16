
// FIX: Import ComponentType to resolve 'React' namespace error.
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
    // FIX: Use ComponentType directly.
    icon: ComponentType<{ className?: string }>;
    systemInstruction: string;
    color: 'creative' | 'code' | 'sage';
}
