
import { useState, useEffect, useRef, useCallback } from 'react';
import { Send, X, ChevronDown, ChevronUp, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
  timestamp?: number;
}

const WELCOME_MSG: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm **FitMentor**, your AI health coach powered by Blinderfit. I know your health profile, goals, and progress — ask me anything about nutrition, workouts, or wellness and I'll give you personalized advice.",
  timestamp: Date.now(),
};

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [backendAvailable, setBackendAvailable] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [minimized, setMinimized] = useState(false);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !minimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, minimized]);

  // Check backend health on first open
  useEffect(() => {
    if (isOpen && backendAvailable === null) {
      apiService
        .healthCheck()
        .then(() => setBackendAvailable(true))
        .catch(() => setBackendAvailable(false));
    }
  }, [isOpen, backendAvailable]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (minimized) setMinimized(false);
  };

  const toggleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMinimized(!minimized);
  };

  const closeChatbot = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const clearChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages([WELCOME_MSG]);
  };

  // ---- AI Call (real backend) --------------
  const callAI = useCallback(
    async (userMessage: string): Promise<string> => {
      try {
        const res: any = await apiService.sendMessage(userMessage, {
          source: 'chatbot_widget',
          timestamp: new Date().toISOString(),
        });
        return res?.response || res?.message || res?.data?.response || 'I received your message but got an empty response. Could you try again?';
      } catch (err: any) {
        console.error('FitMentor AI error:', err);
        // If backend is down, give a helpful offline response
        if (err?.code === 'ERR_NETWORK' || err?.message?.includes('Network')) {
          setBackendAvailable(false);
          return "I'm having trouble connecting to the AI server right now. Please make sure the backend is running on localhost:8000 and try again.";
        }
        if (err?.response?.status === 401) {
          return 'Please log in to chat with FitMentor. I need your health profile to give personalized advice.';
        }
        if (err?.response?.status === 429) {
          return "You're sending messages too quickly. Please wait a moment and try again.";
        }
        return `I encountered an error: ${err?.response?.data?.detail || err.message || 'Unknown error'}. Please try again.`;
      }
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: trimmed, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const reply = await callAI(trimmed);

    const assistantMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: Date.now() };
    setMessages((prev) => [...prev, assistantMsg]);
    setIsTyping(false);
  };

  // Simple markdown-ish rendering (bold only)
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="text-gold font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const connectionDot = backendAvailable === true ? 'bg-emerald-400' : backendAvailable === false ? 'bg-red-400' : 'bg-yellow-400';

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-gold text-black p-3.5 rounded-full shadow-lg hover:bg-gold/90 transition-all z-50 group"
        aria-label="Toggle FitMentor AI chat"
      >
        <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-6 w-80 sm:w-96 bg-black border border-gold/30 rounded-xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${
            minimized ? 'h-14' : 'h-[520px]'
          }`}
        >
          {/* Header */}
          <div
            className="px-4 py-3 border-b border-gold/20 bg-gradient-to-r from-gold/15 to-transparent flex justify-between items-center cursor-pointer rounded-t-xl"
            onClick={minimized ? toggleChatbot : undefined}
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <div>
                <h3 className="text-sm font-semibold text-white leading-none">FitMentor AI</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`h-1.5 w-1.5 rounded-full ${connectionDot}`} />
                  <span className="text-[10px] text-gray-400">
                    {backendAvailable === true ? 'Connected' : backendAvailable === false ? 'Offline' : 'Checking...'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearChat} className="text-gray-500 hover:text-white p-1 rounded" title="Clear chat">
                <Trash2 className="h-4 w-4" />
              </button>
              <button onClick={toggleMinimize} className="text-gray-500 hover:text-white p-1 rounded">
                {minimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </button>
              <button onClick={closeChatbot} className="text-gray-500 hover:text-white p-1 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Auth banner */}
              {!user && (
                <div className="px-4 py-2 bg-gold/10 border-b border-gold/10 text-xs text-gold/80">
                  Log in to get personalized AI health coaching
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 px-4 py-3 overflow-y-auto space-y-3 bg-gradient-to-b from-black to-charcoal/30 scrollbar-thin scrollbar-thumb-gold/20">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-gold/20 text-white rounded-br-sm'
                          : 'bg-white/5 text-gray-200 rounded-bl-sm border border-white/5'
                      }`}
                    >
                      {msg.role === 'assistant' ? renderContent(msg.content) : msg.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white/5 text-gray-300 px-3 py-2 rounded-xl rounded-bl-sm border border-white/5 flex items-center gap-2 text-sm">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" />
                      FitMentor is thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              {messages.length <= 1 && (
                <div className="px-4 py-2 border-t border-white/5 flex gap-2 flex-wrap">
                  {['What should I eat today?', 'Quick workout', 'My progress'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        setInput(q);
                        setTimeout(() => {
                          setInput('');
                          const userMsg: ChatMessage = { role: 'user', content: q, timestamp: Date.now() };
                          setMessages((prev) => [...prev, userMsg]);
                          setIsTyping(true);
                          callAI(q).then((reply) => {
                            setMessages((prev) => [...prev, { role: 'assistant', content: reply, timestamp: Date.now() }]);
                            setIsTyping(false);
                          });
                        }, 50);
                      }}
                      className="text-[11px] px-2.5 py-1 rounded-full border border-gold/20 text-gold/70 hover:bg-gold/10 hover:text-gold transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gold/20">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={user ? 'Ask FitMentor anything...' : 'Log in to chat...'}
                    disabled={isTyping}
                    className="flex-1 bg-white/5 border border-gold/20 text-white text-sm px-3 py-2 rounded-lg focus:ring-1 focus:ring-gold focus:outline-none placeholder:text-gray-500 disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={`p-2 rounded-lg transition-all ${
                      !input.trim() || isTyping
                        ? 'bg-gold/30 text-black/30 cursor-not-allowed'
                        : 'bg-gold text-black hover:bg-gold/90 active:scale-95'
                    }`}
                  >
                    <Send className="h-4 w-4" />
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

export default Chatbot;
