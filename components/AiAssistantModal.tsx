"use client";

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { Product, ChatMessage } from '../types';
import Icon from './Icon';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  storeName?: string;
}

const AiAssistantModal: React.FC<AiAssistantModalProps> = ({ isOpen, onClose, products, storeName }) => {
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const productCatalog = products.map(p => `- Product: ${p.name}\n  - Description: ${p.description}\n  - Category: ${p.category}\n  - Price: ₹${p.price.toFixed(2)}`).join('\n');
  const systemInstruction = `You are "Aura Guide", a warm, elegant, and expert assistant for the luxury beauty brand, ${storeName || 'Aura'}. Your purpose is to provide a premium, personalized shopping experience.

Your personality:
- You are calm, knowledgeable, and speak with graceful, flowing language.
- You are passionate about natural beauty and self-care rituals.
- Your tone is reassuring and helpful, like a trusted friend and beauty expert.

Your tasks:
1.  **Welcome users warmly** and invite them to share their beauty goals or concerns.
2.  **Use the provided Product Catalog exclusively** to answer questions and make thoughtful recommendations.
3.  When you mention a specific product, **wrap its name in double asterisks**, like **Golden Radiance Face Oil**. This is very important.
4.  **Do not invent products or properties.** If information is not in the catalog, politely state that you can only speak to the current collection or that the specific detail isn't available.
5.  **Gently decline off-topic questions** (e.g., about other brands, medical advice, general knowledge) and steer the conversation back to Aura's products. For example: "My focus is solely on the beautiful world of Aura products. How can I help you discover your perfect match from our collection?"
6.  **Keep answers concise but elegant.** Use formatting like lists to make recommendations easy to read.

Here is the current product catalog for ${storeName}:
---
${productCatalog}
---
`;

  useEffect(() => {
    if (isOpen) {
        const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY! });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: { systemInstruction },
        });
        setChat(chatInstance);
        setMessages([{
            role: 'model',
            content: `Welcome to ${storeName || 'Aura'}. I am your personal Aura Guide. Please, tell me about your skin, your hair, or the moment of tranquility you wish to create. I am here to help you find the perfect essence for your ritual.`
        }]);
    }
  }, [isOpen, systemInstruction, storeName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading || !chat) return;

    const userMessage: ChatMessage = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);

    try {
        const responseStream = await chat.sendMessageStream({ message: userInput });
        
        let currentModelMessage = '';
        setMessages(prev => [...prev, { role: 'model', content: '' }]);

        for await (const chunk of responseStream) {
            currentModelMessage += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = currentModelMessage;
                return newMessages;
            });
        }
    } catch (error) {
        console.error("AI chat error:", error);
        setMessages(prev => [...prev, { role: 'model', content: 'I apologize, I seem to be having a moment of difficulty. Please try your request again.' }]);
    } finally {
        setIsLoading(false);
    }
  };
  
  const SimpleMarkdown: React.FC<{text: string}> = ({ text }) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return (
      <>
        {parts.map((part, index) => 
          part.startsWith('**') && part.endsWith('**') ? 
          <strong key={index} className="font-bold text-accent">{part.slice(2, -2)}</strong> : 
          part
        )}
      </>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-end sm:items-center sm:justify-center" onClick={onClose}>
      <div
        className="bg-glass-bg backdrop-blur-xl border border-glass-border text-text-primary rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg h-[85vh] sm:h-[80vh] max-h-[700px] flex flex-col transform transition-transform duration-300 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-glass-border flex-shrink-0">
          <h2 className="text-xl font-serif font-bold flex items-center gap-2">
            <Icon name="sparkles" className="w-6 h-6 text-accent" />
            Aura Guide
          </h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <Icon name="close" className="w-6 h-6" />
          </button>
        </div>
        
        <div className="flex-grow p-4 overflow-y-auto space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white flex-shrink-0 mt-1"><Icon name="sparkles" className="w-5 h-5"/></div>}
              <div className={`max-w-sm md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-accent text-white rounded-br-lg' : 'bg-primary/80 rounded-bl-lg'}`}>
                 <p className="text-sm leading-relaxed"><SimpleMarkdown text={msg.content} /></p>
              </div>
            </div>
          ))}
           {isLoading && (
              <div className="flex items-start gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white flex-shrink-0 mt-1"><Icon name="sparkles" className="w-5 h-5"/></div>
                  <div className="max-w-sm md:max-w-md p-3 rounded-2xl bg-primary/80 rounded-bl-lg">
                      <div className="flex items-center justify-center h-5 gap-2">
                          <span className="w-2 h-2 bg-text-secondary rounded-full animate-pulse"></span>
                          <span className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:0.2s]"></span>
                          <span className="w-2 h-2 bg-text-secondary rounded-full animate-pulse [animation-delay:0.4s]"></span>
                      </div>
                  </div>
              </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t border-glass-border bg-primary/60 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center gap-3">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Ask for a recommendation..."
              className="w-full p-3 rounded-lg bg-secondary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent text-text-primary placeholder-text-secondary"
              disabled={isLoading}
              aria-label="Chat input"
            />
            <button type="submit" disabled={isLoading || !userInput.trim()} className="p-3 bg-accent text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform">
              <Icon name="send" className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AiAssistantModal;