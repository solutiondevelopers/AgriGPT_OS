import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, User, Loader2, Sparkles, Bookmark, Copy, Download, 
  RefreshCw, AlertCircle, Volume2, Mic, MicOff
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { MessageRenderer } from '../components/MessageRenderer';
import { motion, AnimatePresence } from 'motion/react';
import { useChat } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';

export function AdvisorChat() {
  const { 
    messages, 
    sendMessage, 
    isLoadingMessages, 
    isSaving, 
    saveError, 
    clearCurrentChat, 
    exportCurrentChat 
  } = useChat();

  const { language } = useLanguage();

  const [input, setInput] = useState('');
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    isListening, isSpeaking, error: speechError, clearError: clearSpeechError,
    voiceLocale: voiceLang, setVoiceLocale: setVoiceLang, toggleListening,
    stopListening, speak, stopSpeaking
  } = useVoiceAssistant(language, setInput);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSaving, isLoadingMessages]);

  const toggleBookmark = (id: string) => {
    setBookmarkedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSendPrompt = (prompt: string) => {
    submitMessage(prompt);
  };

  const submitMessage = async (text: string) => {
    if (!text.trim() || isSaving) return;

    if (isListening) {
      stopListening();
    }

    const textToSend = text.trim();
    setInput('');

    await sendMessage(textToSend);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitMessage(input);
  };

  const filteredMessages = messages.filter(m => 
    m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-zinc-50 relative">
      {/* Top Action Bar */}
      <div className="absolute top-0 right-0 left-0 p-4 flex justify-between items-start gap-2 z-10 pointer-events-none">
        <div className="pointer-events-auto flex">
          {isSearchOpen ? (
            <div className="flex items-center bg-white/95 backdrop-blur border border-zinc-300 rounded-lg overflow-hidden h-8 shadow-xs">
              <input 
                type="text" 
                placeholder="Search messages..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="bg-transparent border-none text-xs text-zinc-900 px-3 w-40 outline-none focus:ring-0"
              />
              <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="px-2 text-zinc-400 hover:text-zinc-700">
                &times;
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center justify-center w-8 h-8 bg-white/90 backdrop-blur border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors shadow-xs"
              title="Search chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
          )}
        </div>
        <div className="pointer-events-auto flex gap-2">
          <button 
            onClick={exportCurrentChat}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/90 backdrop-blur border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors shadow-xs"
            title="Export conversation"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button 
            onClick={clearCurrentChat}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-white/90 backdrop-blur border border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors shadow-xs"
            title="Start fresh conversation"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>
      </div>

      {/* Network / Saving Error Banner */}
      {saveError && (
        <div className="absolute top-14 left-4 right-4 z-20 max-w-xl mx-auto bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-2 rounded-lg flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>{saveError}</span>
          </div>
        </div>
      )}

      {/* Main Messages Container */}
      <div className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-3xl mx-auto w-full px-4 pt-16 pb-36 space-y-8">
          
          {isLoadingMessages ? (
            <div className="space-y-6 pt-8">
              <div className="flex gap-4 animate-pulse">
                <div className="w-7 h-7 rounded-md bg-zinc-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-1/4" />
                  <div className="h-12 bg-zinc-200/60 rounded" />
                </div>
              </div>
              <div className="flex gap-4 animate-pulse">
                <div className="w-7 h-7 rounded-md bg-zinc-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-1/3" />
                  <div className="h-16 bg-zinc-200/60 rounded" />
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {filteredMessages.map((message) => (
                <motion.div 
                  key={message.id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4"
                >
                  <div className={cn(
                    "w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 border shadow-xs",
                    message.role === 'user' ? "bg-emerald-100 border-emerald-300 text-emerald-800" : "bg-emerald-50 border-emerald-200 text-emerald-600"
                  )}>
                    {message.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-3.5 h-3.5" />}
                  </div>
                  
                  <div className="flex-1 min-w-0 group/message">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-bold text-zinc-900">
                        {message.role === 'user' ? 'You' : 'AgroTech AI'}
                      </div>
                      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover/message:opacity-100 transition-opacity">
                        {message.role === 'assistant' && (
                          <button 
                            className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                            title="Read aloud"
                            onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
                          >
                            {isSpeaking ? <MicOff className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>
                        )}
                        <button 
                          onClick={() => navigator.clipboard.writeText(message.content)}
                          className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded transition-colors"
                          title="Copy message"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => toggleBookmark(message.id)}
                          className={cn("p-1 hover:bg-zinc-100 rounded transition-colors", bookmarkedIds.has(message.id) ? "text-emerald-600" : "text-zinc-400 hover:text-zinc-700")}
                          title="Bookmark"
                        >
                          <Bookmark className={cn("w-3.5 h-3.5", bookmarkedIds.has(message.id) && "fill-current")} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-zinc-800 leading-relaxed space-y-2">
                      {/* Attached images preview */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-2">
                          {message.attachments.map((att, i) => (
                            <img key={i} src={att.url} alt="User attachment" className="h-32 rounded-lg border border-zinc-200 object-cover shadow-xs" />
                          ))}
                        </div>
                      )}

                      {message.role === 'user' ? (
                        <div className="whitespace-pre-wrap font-medium text-zinc-900 bg-white border border-zinc-200/90 p-3 rounded-xl shadow-xs">{message.content}</div>
                      ) : (
                        <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs">
                          <MessageRenderer content={message.content} onSelectFollowup={handleSendPrompt} />
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}

              {isSaving && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-4">
                   <div className="w-7 h-7 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                     <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
                   </div>
                   <div className="flex-1">
                     <div className="text-sm font-bold mb-1 text-zinc-900">AgroTech AI</div>
                     <div className="flex items-center gap-1.5 h-6">
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                       <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                       <span className="text-xs text-zinc-500 ml-2">AgroTech AI is preparing recommendations...</span>
                     </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar: Voice-to-Text Enabled */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-50 via-zinc-50/95 to-transparent pt-8 pb-6 px-4 z-30 pointer-events-none">
        <div className="max-w-3xl mx-auto w-full relative pointer-events-auto">
          
          {/* Active Listening Indicator with Language Switcher */}
          {isListening && (
            <div className="mb-2 flex items-center justify-between bg-zinc-900/95 backdrop-blur text-white px-3.5 py-2 rounded-xl shadow-lg border border-zinc-750 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span className="font-medium text-emerald-400">Listening... Speak now</span>
                <span className="text-zinc-400 hidden sm:inline">•</span>
                <span className="text-zinc-300 hidden sm:inline">बोलिए / सांगा</span>
              </div>

              {/* Language Switcher for Voice */}
              <div className="flex items-center gap-1 bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
                <button
                  type="button"
                  onClick={() => setVoiceLang('hi-IN')}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                    voiceLang === 'hi-IN' ? "bg-emerald-600 text-white shadow-xs" : "text-zinc-300 hover:text-white"
                  )}
                  title="Hindi voice recognition"
                >
                  हिन्दी
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('en-IN')}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                    voiceLang === 'en-IN' ? "bg-emerald-600 text-white shadow-xs" : "text-zinc-300 hover:text-white"
                  )}
                  title="English voice recognition"
                >
                  EN
                </button>
                <button
                  type="button"
                  onClick={() => setVoiceLang('mr-IN')}
                  className={cn(
                    "px-2 py-0.5 rounded text-[11px] font-semibold transition-colors",
                    voiceLang === 'mr-IN' ? "bg-emerald-600 text-white shadow-xs" : "text-zinc-300 hover:text-white"
                  )}
                  title="Marathi voice recognition"
                >
                  मराठी
                </button>
              </div>
            </div>
          )}

          {/* Speech Error Banner */}
          {speechError && (
            <div className="mb-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs px-3.5 py-2 rounded-xl flex items-center justify-between shadow-xs">
              <span>{speechError}</span>
              <button 
                type="button" 
                onClick={clearSpeechError} 
                className="text-amber-700 hover:text-amber-900 ml-2 font-bold px-1.5 py-0.5 rounded hover:bg-amber-100"
              >
                &times;
              </button>
            </div>
          )}

          <form 
            onSubmit={handleSubmit} 
            className={cn(
              "flex items-center gap-2 bg-white border rounded-2xl shadow-md p-2 pl-4 transition-all",
              isListening ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-zinc-300 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20"
            )}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (isListening) stopListening();
                  handleSubmit(e);
                }
              }}
              placeholder={
                isListening 
                  ? (voiceLang === 'hi-IN' ? "सुन रहे हैं... बोलिए (बोलें और एंटर दबाएं)..." : voiceLang === 'mr-IN' ? "ऐकत आहे... बोला..." : "Listening... speak now...") 
                  : "Ask AgroTech AI or tap mic to speak..."
              }
              className="bg-transparent border-none text-sm flex-1 outline-none text-zinc-900 placeholder:text-zinc-400 min-h-[38px] max-h-32 resize-none py-2 scrollbar-thin"
              disabled={isSaving}
              rows={1}
            />

            {/* Voice-to-Text Microphone Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={cn(
                "w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer flex-shrink-0 relative",
                isListening 
                  ? "bg-red-500 text-white shadow-md animate-pulse ring-4 ring-red-100" 
                  : "text-zinc-600 hover:text-emerald-700 hover:bg-emerald-50 bg-zinc-100 border border-zinc-200/80"
              )}
              title={isListening ? "Stop listening" : "Voice-to-text (Speak to AgroTech AI)"}
            >
              {isListening ? (
                <span className="relative flex items-center justify-center">
                  <MicOff className="w-4 h-4 text-white" />
                </span>
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!input.trim() || isSaving}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-emerald-600 text-white disabled:opacity-30 disabled:bg-zinc-200 disabled:text-zinc-400 hover:bg-emerald-500 transition-colors shadow-xs cursor-pointer flex-shrink-0"
              title="Send"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
          <p className="mt-2 px-1 text-center text-[11px] text-zinc-500">
            Voice commands: “Open AgroStore”, “Go to weather”, or “Open AgroStore and select neem oil”.
          </p>
        </div>
      </div>
    </div>
  );
}
