import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatMessage, Persona, ChatHistoryItem } from './types';
import { ChatMessageRole } from './types';
import { PERSONAS } from './constants';
import PersonaSelector from './components/PersonaSelector';
import ChatWindow from './components/ChatWindow';
import MessageInput from './components/MessageInput';
import Sidebar from './components/Sidebar';
import { MenuIcon, XIcon } from './components/icons/AppIcons';

const App: React.FC = () => {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activePersonaId, setActivePersonaId] = useState<string>(PERSONAS[0].id);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('3chat_history');
      if (savedHistory) {
        const parsedHistory = JSON.parse(savedHistory);
        setChatHistory(parsedHistory);
        if (parsedHistory.length > 0) {
          setActiveChatId(parsedHistory[0].id);
        }
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
      localStorage.removeItem('3chat_history');
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('3chat_history', JSON.stringify(chatHistory));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }, [chatHistory]);

  const activeChat = useMemo(() => chatHistory.find(c => c.id === activeChatId), [chatHistory, activeChatId]);
  const messages = useMemo(() => activeChat?.messages || [], [activeChat]);

  // The persona for the current view (either the loaded chat or the one selected for a new chat)
  const activePersona = useMemo(() => {
    const personaId = activeChat ? activeChat.personaId : activePersonaId;
    return PERSONAS.find(p => p.id === personaId) || PERSONAS[0];
  }, [activeChat, activePersonaId]);


  // Effect to initialize or re-initialize the Gemini chat session
  useEffect(() => {
    const initChat = () => {
      try {
        if (!process.env.API_KEY) {
          throw new Error("API_KEY environment variable not set.");
        }
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        
        // Map our message format to the SDK's history format
        const history = activeChat?.messages.map(msg => ({
          role: msg.role,
          parts: [{ text: msg.content }]
        })).slice(0, -1); // Exclude the last message if it's a partial response

        const newChatSession = ai.chats.create({
          model: 'gemini-2.5-flash',
          history,
          config: {
            systemInstruction: activePersona.systemInstruction,
          },
        });
        setChatSession(newChatSession);
        setError(null);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "An unknown error occurred.";
        setError(message);
      }
    };
    initChat();
  }, [activeChat, activePersona.systemInstruction]);

  const handleSendMessage = useCallback(async (userInput: string) => {
    if (isLoading || !userInput.trim() || !chatSession) return;

    setIsLoading(true);
    setError(null);
    const userMessage: ChatMessage = { role: ChatMessageRole.User, content: userInput };

    let currentChatId = activeChatId;

    if (!currentChatId) { // This is a new chat
        const newChat: ChatHistoryItem = {
            id: Date.now().toString(),
            title: userInput.substring(0, 40) + (userInput.length > 40 ? '...' : ''),
            personaId: activePersonaId,
            messages: [userMessage],
        };
        currentChatId = newChat.id;
        setChatHistory(prev => [newChat, ...prev]);
        setActiveChatId(newChat.id);
    } else { // This is an existing chat
        setChatHistory(prev => prev.map(chat =>
            chat.id === currentChatId ? { ...chat, messages: [...chat.messages, userMessage] } : chat
        ));
    }

    try {
      const responseStream = await chatSession.sendMessageStream({ message: userInput });
      
      let fullResponse = '';
      let isFirstChunk = true;
      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        if (isFirstChunk) {
            isFirstChunk = false;
            // Add the new model message object
            setChatHistory(prev => prev.map(chat =>
                chat.id === currentChatId ? { ...chat, messages: [...chat.messages, { role: ChatMessageRole.Model, content: fullResponse }] } : chat
            ));
        } else {
            // Update the last message
            setChatHistory(prev => prev.map(chat => {
                if (chat.id === currentChatId) {
                    const updatedMessages = [...chat.messages];
                    updatedMessages[updatedMessages.length - 1] = { role: ChatMessageRole.Model, content: fullResponse };
                    return { ...chat, messages: updatedMessages };
                }
                return chat;
            }));
        }
      }
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : "An unknown error occurred.";
      setError(`Error: ${errorMessage}`);
      setChatHistory(prev => prev.map(chat => {
          if (chat.id === currentChatId) {
              return { ...chat, messages: [...chat.messages, { role: ChatMessageRole.Model, content: `Sorry, I ran into an error: ${errorMessage}`}]};
          }
          return chat;
      }));
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, chatSession, activeChatId, activePersonaId]);

  const handleSelectPersona = (id: string) => {
    setActivePersonaId(id);
    handleNewChat(); // Start a new chat when a persona is selected
  };

  const handleNewChat = useCallback(() => {
      setActiveChatId(null);
  }, []);

  const handleSelectChat = (id: string) => {
      setActiveChatId(id);
      setSidebarOpen(false); // Close sidebar on mobile after selection
  };
  
  const personaColorClass = `bg-${activePersona.color}-600`;
  const personaBorderClass = `border-${activePersona.color}-500`;

  return (
    <div className="flex h-screen w-full bg-gray-900 text-gray-100 font-sans overflow-hidden">
      <div 
        className={`fixed inset-0 bg-black/50 z-10 md:hidden transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      ></div>
      <Sidebar 
          chatHistory={chatHistory} 
          personas={PERSONAS}
          activeChatId={activeChatId}
          onNewChat={handleNewChat}
          onSelectChat={handleSelectChat}
          isOpen={isSidebarOpen}
      />
      <div className="flex flex-col flex-grow h-screen transition-all duration-300">
        <header className={`flex-shrink-0 p-4 shadow-md z-10 ${personaColorClass} transition-colors duration-300`}>
            <div className="max-w-4xl mx-auto flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="md:hidden p-1 rounded-md hover:bg-white/20 transition-colors">
                        {isSidebarOpen ? <XIcon className="w-6 h-6 text-white"/> : <MenuIcon className="w-6 h-6 text-white" />}
                    </button>
                    <h1 className="text-2xl font-bold text-white tracking-wider">3CHAT</h1>
                </div>
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
    </div>
  );
};

export default App;