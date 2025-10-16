
import React from 'react';
import { ChatMessage, Persona } from '../types';
import { ChatMessageRole } from '../types';
import { UserIcon } from './icons/UserIcon';

interface MessageProps {
    message: ChatMessage;
    activePersona: Persona;
}

const Message: React.FC<MessageProps> = ({ message, activePersona }) => {
    const isUser = message.role === ChatMessageRole.User;

    if (isUser) {
        return (
            <div className="flex items-end space-x-2 justify-end">
                 <div className="order-1 max-w-xl">
                    <div className="px-4 py-3 rounded-xl bg-blue-600 text-white">
                        <p className="text-sm md:text-base whitespace-pre-wrap">{message.content}</p>
                    </div>
                 </div>
                 <div className="flex-shrink-0 order-2">
                    <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                        <UserIcon className="w-6 h-6 text-gray-300" />
                    </div>
                </div>
            </div>
        );
    }
    
    // Model message
    return (
        <div className="flex items-end space-x-2">
             <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center border-2 border-${activePersona.color}-500`}>
                    <activePersona.icon className="w-6 h-6 text-gray-300" />
                </div>
            </div>
            <div className="max-w-xl">
                <div className="px-4 py-3 rounded-xl bg-gray-800 text-gray-200">
                    <div className="prose prose-sm prose-invert max-w-none prose-p:my-2 prose-headings:my-3 whitespace-pre-wrap">
                        {message.content || <span className="opacity-50">...</span>}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Message;
