import React from 'react';
import type { ChatHistoryItem, Persona } from '../types';
import { PlusIcon, ChatBubbleIcon } from './icons/AppIcons';

interface SidebarProps {
    chatHistory: ChatHistoryItem[];
    personas: Persona[];
    activeChatId: string | null;
    onNewChat: () => void;
    onSelectChat: (id: string) => void;
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ chatHistory, personas, activeChatId, onNewChat, onSelectChat, isOpen }) => {
    
    const getPersonaForChat = (item: ChatHistoryItem) => {
        return personas.find(p => p.id === item.personaId);
    };

    return (
        <aside className={`absolute md:relative z-20 flex flex-col bg-gray-800 text-gray-200 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-72 h-full flex-shrink-0`}>
            <div className="p-4 border-b border-gray-700">
                <button
                    onClick={onNewChat}
                    className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>New Chat</span>
                </button>
            </div>
            <nav className="flex-grow overflow-y-auto custom-scrollbar">
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 pt-4 pb-2">History</h2>
                <ul className="p-2 space-y-1">
                    {chatHistory.length > 0 ? chatHistory.map(item => {
                        const persona = getPersonaForChat(item);
                        const isActive = item.id === activeChatId;
                        return (
                            <li key={item.id}>
                                <button
                                    onClick={() => onSelectChat(item.id)}
                                    className={`w-full text-left flex items-center space-x-3 p-2 rounded-md transition-colors text-sm ${isActive ? 'bg-gray-700' : 'hover:bg-gray-700/50'}`}
                                >
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 border-2 ${persona ? `border-${persona.color}-500` : 'border-gray-500'}`}>
                                       {persona ? <persona.icon className="w-5 h-5" /> : <ChatBubbleIcon className="w-5 h-5" />}
                                    </div>
                                    <span className="truncate flex-grow pr-2">{item.title}</span>
                                </button>
                            </li>
                        );
                    }) : (
                        <div className="px-4 py-2 text-sm text-gray-500">No chats yet.</div>
                    )}
                </ul>
            </nav>
            <div className="p-4 border-t border-gray-700 text-center text-xs text-gray-500">
                3CHAT v2.0
            </div>
        </aside>
    );
};

export default Sidebar;
