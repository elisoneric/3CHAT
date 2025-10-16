
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage, Persona } from './types';
import { ChatMessageRole } from './types';
import { PERSONAS } from './constants';
import PersonaSelector from './components/PersonaSelector';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';

const App: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState<string>(PERSONAS[0].id);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activePersona = PERSONAS.find(p => p.id === activePersonaId) || PERSONAS[0];

  useEffect(() => {
    const initChat = () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const newChatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
            systemInstruction: activePersona.systemInstruction,
          },
        });
        setChatSession(newChatSession);
        setMessages([]);
        setError(null);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred during initialization.");
        }
      }
    };
    initChat();
  }, [activePersona.systemInstruction]);

  // FIX: Refactor streaming and state update logic to correctly show typing indicator.
  const handleSendMessage = useCallback(async (userInput: string) => {
    if (isLoading || !userInput.trim() || !chatSession) return;

    setIsLoading(true);
    setError(null);
    const userMessage: ChatMessage = { role: ChatMessageRole.User, content: userInput };
    setMessages(prev => [...prev, userMessage]);

    try {
      const responseStream = await chatSession.sendMessageStream({ message: userInput });

      let fullResponse = '';
      let isFirstChunk = true;
      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        if (isFirstChunk) {
          isFirstChunk = false;
          setMessages(prev => [...prev, { role: ChatMessageRole.Model, content: fullResponse }]);
        } else {
          setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1] = { role: ChatMessageRole.Model, content: fullResponse };
            return newMessages;
          });
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Error: ${errorMessage}`);
      setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          // If streaming failed mid-way, update the partial message with an error.
          if (lastMessage?.role === ChatMessageRole.Model) {
              const newMessages = [...prev];
              newMessages[newMessages.length - 1] = { role: ChatMessageRole.Model, content: `Sorry, I ran into an error: ${errorMessage}` };
              return newMessages;
          }
          // If streaming hadn't started, add a new error message.
          return [...prev, { role: ChatMessageRole.Model, content: `Sorry, I ran into an error: ${errorMessage}` }];
      });
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, chatSession]);

  const handleSelectPersona = (id: string) => {
    setActivePersonaId(id);
  };
  
  const personaColorClass = `bg-${activePersona.color}-600`;
  const personaBorderClass = `border-${activePersona.color}-500`;

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">
        <header className={`flex-shrink-0 p-4 shadow-md z-10 ${personaColorClass} transition-colors duration-300`}>
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <h1 className="text-2xl font-bold text-white tracking-wider">3CHAT</h1>
                <PersonaSelector
                    personas={PERSONAS}
                    activePersonaId={activePersonaId}
                    onSelectPersona={handleSelectPersona}
                />
            </div>
        </header>

        <main className="flex-grow flex flex-col p-4 overflow-hidden">
             {error && (
                <div className="bg-red-800 border border-red-600 text-white px-4 py-3 rounded-md relative mb-4 max-w-4xl mx-auto w-full" role="alert">
                    <strong className="font-bold">Error: </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            )}
            <ChatWindow messages={messages} isLoading={isLoading} activePersona={activePersona} />
        </main>

        <footer className="flex-shrink-0 p-4 bg-gray-900">
            <div className="max-w-4xl mx-auto">
                <MessageInput
                    onSendMessage={handleSendMessage}
                    isLoading={isLoading}
                    personaBorderClass={personaBorderClass}
                />
            </div>
        </footer>
    </div>
  );
};

export default App;
