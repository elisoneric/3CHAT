
import React, { useEffect, useRef } from 'react';
import type { ChatMessage, Persona } from '../types';
import Message from './Message';

interface ChatWindowProps {
    messages: ChatMessage[];
    isLoading: boolean;
    activePersona: Persona;
}

const TypingIndicator: React.FC<{ activePersona: Persona }> = ({ activePersona }) => (
    <div className="flex items-end space-x-2 p-4">
        <div className="flex-shrink-0">
             <div className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-${activePersona.color}-500`}>
                <activePersona.icon className="w-6 h-6 text-gray-300" />
            </div>
        </div>
        <div className="bg-gray-800 rounded-lg p-3">
            <div className="flex items-center justify-center space-x-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse"></div>
            </div>
        </div>
    </div>
);


const ChatWindow: React.FC<ChatWindowProps> = ({ messages, isLoading, activePersona }) => {
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    return (
        <div className="max-w-4xl mx-auto w-full flex-grow overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-6">
                {messages.map((msg, index) => (
                    <Message key={index} message={msg} activePersona={activePersona} />
                ))}
                {isLoading && messages[messages.length-1]?.role === 'user' && <TypingIndicator activePersona={activePersona} />}
            </div>
            <div ref={messagesEndRef} />
        </div>
    );
};

export default ChatWindow;
