import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  Loader2, 
  Maximize2, 
  Minimize2, 
  Paperclip, 
  Mic, 
  MicOff,
  Volume2,
  RotateCw, 
  MessageSquare,
  Box,
  Store,
  BarChart,
  CloudRain,
  Bug
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage } from '../types';
import { MessageRenderer } from './MessageRenderer';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

export function CopilotDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome-1',
    role: 'assistant',
    content: "Hi! I'm your **AgriGPT Copilot**. \n\nI am embedded right here to assist you with live 3D field telemetry, product comparisons, yield forecasts, disease diagnostics, and weather advisories. How can I assist your farm today?",
    timestamp: new Date()
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const { language } = useLanguage();
  const {
    isListening, isSpeaking, error: voiceError, clearError: clearVoiceError,
    toggleListening, speak, stopSpeaking
  } = useVoiceAssistant(language, setInput);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Listen for global open events from anywhere in the app
  useEffect(() => {
    const handleOpenCopilot = (e: CustomEvent<{ prompt?: string }>) => {
      setIsOpen(true);
      if (e.detail?.prompt) {
        submitMessage(e.detail.prompt);
      }
    };

    window.addEventListener('open-copilot' as any, handleOpenCopilot);
    return () => window.removeEventListener('open-copilot' as any, handleOpenCopilot);
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Contextual prompts based on current page
  const getContextPrompts = () => {
    switch (location.pathname) {
      case '/3d-view':
        return [
          "Analyze Sector Alpha Durum Wheat status",
          "Recommend irrigation schedule for Sector Gamma",
          "Explain NDVI canopy health scores",
          "Diagnose nitrogen deficit in Sector Beta"
        ];
      case '/store':
        return [
          "Which tomato seed variety has highest yield?",
          "Recommend organic fertilizers for wheat",
          "Compare prices of Bio-NPK boosters",
          "What supplies do I need for drip irrigation?"
        ];
      case '/analytics':
        return [
          "Generate Q4 revenue forecast line chart",
          "Break down water usage efficiency heatmap",
          "Compare wheat vs corn profit margins",
          "Export farm yield report summary"
        ];
      case '/weather':
        return [
          "Is frost expected in the next 7 days?",
          "Best spraying window given current wind speed?",
          "Rainfall prediction for upcoming harvest",
          "Humidity impact on tomato blight risk"
        ];
      case '/scan':
        return [
          "How to treat early blight on tomato leaves?",
          "Identify yellow rust symptoms on wheat",
          "Preventative bio-fungicide application rate",
          "Organic pest management for maize stem borer"
        ];
      default:
        return [
          "Show 3D Farm digital twin overview",
          "Suggest high-yield crop rotation",
          "Check store discounts on seeds",
          "Analyze today's farm weather advisories"
        ];
    }
  };

  const submitMessage = async (text: string) => {
    if ((!text.trim() && !attachedImage) || isLoading) return;

    let contentToDisplay = text;
    if (attachedImage) {
      contentToDisplay = `![Attached Image](${attachedImage})\n\n${text}`;
    }

    // Attach contextual page info quietly
    const pageContext = `[Context: User is currently on page ${location.pathname}]`;
    const fullTextForAPI = `${pageContext}\n${text}`;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToDisplay,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setAttachedImage(null);
    setIsLoading(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    }]);

    try {
      const apiMessages = [...messages, { ...userMsg, content: fullTextForAPI }].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages })
      });

      if (!response.ok) throw new Error('Failed to fetch response');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let isDone = false;
        while (!isDone) {
          const { value, done } = await reader.read();
          isDone = done;
          if (value) {
            const chunkText = decoder.decode(value, { stream: true });
            const lines = chunkText.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') {
                  isDone = true;
                  break;
                }
                try {
                  const data = JSON.parse(dataStr);
                  if (data.text) {
                    setMessages(prev => prev.map(m => 
                      m.id === assistantId ? { ...m, content: m.content + data.text } : m
                    ));
                  }
                } catch (e) {
                  // ignore JSON chunk parse error
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Copilot Error:", err);
      setMessages(prev => prev.map(m => 
        m.id === assistantId 
          ? { ...m, content: "**Error:** I encountered an issue retrieving data. Please check your connection or try again." } 
          : m
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAttachedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <>
      {/* Floating Trigger Button (Always available in bottom-right if drawer closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-5 right-5 z-40 flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-full shadow-[0_4px_20px_rgba(16,185,129,0.35)] transition-all transform hover:scale-105 active:scale-95"
            title="Open AgriGPT Embedded AI Assistant"
          >
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <span className="text-xs sm:text-sm tracking-tight font-extrabold">Ask AgriGPT</span>
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Slide-over Embedded Copilot Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className={`fixed inset-y-0 right-0 z-50 bg-white border-l border-zinc-200 shadow-2xl flex flex-col transition-all duration-300 text-zinc-900 ${
              isExpanded 
                ? 'w-full md:w-[650px]' 
                : 'w-full sm:w-[420px]'
            }`}
          >
            {/* Drawer Header */}
            <div className="h-14 bg-zinc-50 border-b border-zinc-200 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                    AgriGPT AI Copilot
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </h2>
                  <p className="text-[10px] text-zinc-500">Inbuilt Context-Aware Assistant</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 rounded-lg transition-colors hidden sm:block"
                  title={isExpanded ? "Collapse width" : "Expand width"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/60 rounded-lg transition-colors"
                  title="Close Assistant"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Context Prompt Chips Header Ribbon */}
            <div className="px-3 py-2 bg-zinc-100/70 border-b border-zinc-200 overflow-x-auto scrollbar-none flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
                <Bot className="w-3 h-3" /> Page Insights:
              </span>
              {getContextPrompts().map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => submitMessage(prompt)}
                  className="text-[10px] whitespace-nowrap px-2.5 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-zinc-200 text-zinc-700 rounded-full transition-all shrink-0 shadow-xs"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4 scrollbar-thin bg-zinc-50/50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0 mt-0.5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white font-medium rounded-tr-none shadow-sm'
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <>
                        <MessageRenderer content={msg.content} onSelectFollowup={submitMessage} />
                        {msg.content && (
                          <button
                            type="button"
                            onClick={() => isSpeaking ? stopSpeaking() : speak(msg.content)}
                            className="mt-2 inline-flex items-center gap-1 text-[11px] text-emerald-700 hover:text-emerald-900"
                            title={isSpeaking ? 'Stop reading' : 'Read response aloud'}
                          >
                            {isSpeaking ? <MicOff className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                            {isSpeaking ? 'Stop' : 'Read aloud'}
                          </button>
                        )}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0 mt-0.5">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl w-fit">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>AgriGPT is processing knowledge base & field telemetry...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Attachment Preview */}
            {attachedImage && (
              <div className="px-4 py-2 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <img src={attachedImage} alt="Attachment" className="w-10 h-10 object-cover rounded-lg border border-zinc-200" />
                  <span className="text-xs text-zinc-700">Image attached for diagnosis</span>
                </div>
                <button onClick={() => setAttachedImage(null)} className="text-xs text-rose-600 hover:underline">
                  Remove
                </button>
              </div>
            )}

            {/* Input Area */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-200 shrink-0">
              {voiceError && (
                <div className="mb-2 flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
                  <span>{voiceError}</span>
                  <button type="button" onClick={clearVoiceError} className="font-bold" aria-label="Dismiss voice error">×</button>
                </div>
              )}
              {isListening && (
                <div className="mb-2 flex items-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white" /> Listening — speak your farming question now
                </div>
              )}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitMessage(input);
                }}
                className="flex items-center gap-1.5 bg-white border border-zinc-200 rounded-xl p-1.5 focus-within:border-emerald-500 transition-colors shadow-xs"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100 rounded-lg transition-colors"
                  title="Attach leaf or field image"
                >
                  <Paperclip className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`p-1.5 rounded-lg transition-colors ${
                    isListening 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'text-zinc-400 hover:text-emerald-600 hover:bg-zinc-100'
                  }`}
                  title="Voice dictation"
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask AgriGPT anything about this page..."
                  className="flex-1 bg-transparent border-none text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none px-1"
                />

                <button
                  type="submit"
                  disabled={(!input.trim() && !attachedImage) || isLoading}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-lg transition-colors shrink-0 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
