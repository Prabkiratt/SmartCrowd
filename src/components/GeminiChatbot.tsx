/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Loader2,
  Minimize2,
  Maximize2,
  HelpCircle,
  Clock,
  Compass,
} from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiChatbotProps {
  venueContext?: any;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ venueContext }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Namaste! I am CrowdBot, your SmartCrowd AI assistant. I can help you check live queue wait times, find the best time to visit AIIMS OPD or Siddhivinayak Temple, and guide you on digital token entry across India. What can I help you with today?',
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build history payload for server
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role === 'user' ? 'user' : 'model',
        content: m.content,
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          venueContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'I am updating live crowd counts right now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'I encountered a network hiccup connecting to the queue server. You can still view live token counts directly on the screen or ask me again in a moment!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    'How long is the wait at AIIMS OPD today?',
    'Best time to visit Siddhivinayak Temple?',
    'How do remote digital tokens work in SmartCrowd?',
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 rounded-full border-2 border-stone-900 bg-[#ffc21a] p-3.5 sm:px-4 sm:py-3 text-stone-900 font-bold shadow-[4px_4px_0_0_#1a1a17] hover:bg-[#e6ad15] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer group"
          title="Open CrowdBot AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6 text-stone-900" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#d9421c] animate-pulse" />
          </div>
          <span className="hidden sm:inline font-display text-xs tracking-tight uppercase font-extrabold">
            Ask CrowdBot AI
          </span>
        </button>
      )}

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[400px] rounded-3xl border-2 border-stone-900 bg-white shadow-[6px_6px_0_0_#1a1a17] flex flex-col overflow-hidden transition-all duration-200 ${
            isMinimized ? 'h-[64px]' : 'h-[520px]'
          }`}
        >
          {/* Header */}
          <div className="border-b-2 border-stone-900 bg-[#ffc21a] px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-stone-900 text-[#ffc21a] flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-extrabold text-stone-900 leading-none">
                  CrowdBot AI · SmartCrowd
                </h3>
                <span className="text-[10px] font-semibold text-stone-700 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                  Powered by Gemini 3.5 Flash
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1 rounded-lg text-stone-700 hover:bg-black/10 cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-700 hover:bg-black/10 cursor-pointer"
                title="Close Chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Scrollable Message Thread */}
          {!isMinimized && (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf6ee] text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2.5 ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-6 h-6 rounded-full bg-stone-900 text-[#ffc21a] flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5" />
                      </div>
                    )}

                    <div
                      className={`max-w-[80%] rounded-2xl p-3 space-y-1 shadow-xs ${
                        msg.role === 'user'
                          ? 'border border-stone-900 bg-stone-900 text-white rounded-tr-none'
                          : 'border border-stone-300 bg-white text-stone-800 rounded-tl-none'
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      <span
                        className={`text-[9px] font-mono block text-right ${
                          msg.role === 'user' ? 'text-stone-300' : 'text-stone-400'
                        }`}
                      >
                        {msg.timestamp}
                      </span>
                    </div>

                    {msg.role === 'user' && (
                      <div className="w-6 h-6 rounded-full bg-[#ffc21a] border border-stone-900 text-stone-900 flex items-center justify-center shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-stone-500 py-1">
                    <Loader2 className="w-4 h-4 animate-spin text-stone-800" />
                    <span className="text-[11px] font-medium">CrowdBot is checking live queues...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions pills */}
              <div className="px-3 py-2 bg-white border-t border-stone-200 overflow-x-auto flex gap-1.5 shrink-0 scrollbar-none">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(p)}
                    className="rounded-lg border border-stone-300 bg-stone-50 px-2.5 py-1 text-[10px] font-bold text-stone-700 hover:border-stone-900 hover:bg-[#ffc21a] hover:text-stone-900 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-3 bg-white border-t border-stone-200 shrink-0">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about live lines, wait times, darshan..."
                    className="flex-1 rounded-xl border border-stone-300 px-3 py-2 text-xs font-medium outline-none focus:border-stone-900 bg-stone-50"
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isLoading}
                    className="rounded-xl border border-stone-900 bg-[#ffc21a] p-2 text-stone-900 hover:bg-[#e6ad15] disabled:opacity-40 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};
