
import React, { useState } from 'react';
import { SendIcon } from './icons/SendIcon';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    isLoading: boolean;
    personaBorderClass: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading, personaBorderClass }) => {
    const [input, setInput] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className={`flex-grow bg-gray-800 border-2 ${personaBorderClass} rounded-full py-3 px-5 text-gray-200 focus:outline-none focus:ring-2 focus:ring-${personaBorderClass.replace('border-', '')} transition-all duration-300 disabled:opacity-50`}
                autoComplete="off"
            />
            <button
                type="submit"
                disabled={isLoading}
                className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center transition-all duration-300 ${isLoading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
            >
                <SendIcon className="w-6 h-6 text-white" />
            </button>
        </form>
    );
};

export default MessageInput;
