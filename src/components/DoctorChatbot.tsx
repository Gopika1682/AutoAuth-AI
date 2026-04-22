import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Bot, 
  User as UserIcon,
  Loader2,
  Sparkles,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { useAppContext } from '../context/AppContext';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenAI({ apiKey: apiKey || '' });

interface Message {
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

export const DoctorChatbot: React.FC = () => {
  const { currentUser, policies } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: `Hello Dr. ${currentUser?.name || ''}, I'm your AutoAuth assistant. How can I help you with prior authorizations or policy queries today?`,
      timestamp: new Date() 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  useEffect(() => {
    if (currentUser?.role === 'doctor' && !chatRef.current) {
      const activePolicies = policies.filter(p => p.active).map(p => p.rule).join('\n');
      chatRef.current = genAI.chats.create({
        model: "gemini-2.5-flash-lite",
        config: {
          systemInstruction: `You are a professional medical administrative assistant for the AutoAuth Prior Authorization system. 
          Help Dr. ${currentUser?.name} understand insurance policies, prior authorization requirements, and how to use the system.
          
          Current System Policies:
          ${activePolicies}
          
          Be concise, professional, and accurate. If you don't know something about a specific patient, ask the doctor to refer to the patient's records.`,
        }
      });
    }
  }, [currentUser, policies]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatRef.current.sendMessage({ message: input });

      const aiMessage: Message = {
        role: 'ai',
        content: response.text || "I'm sorry, I couldn't process that request.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "I'm having trouble connecting to my brain right now. Please try again in a moment.",
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser?.role !== 'doctor') return null;

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? '56px' : '420px',
              width: 'min(90vw,320px)'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-[1.25rem] shadow-lg border border-gray-100 flex flex-col overflow-hidden mb-3 backdrop-blur-xl bg-white/95"
          >
            {/* Header */}
            <div className="p-3 bg-blue-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-tight">AutoAuth Assistant</p>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <p className="text-[9px] font-semibold opacity-80 uppercase tracking-widest">Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-md transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
                  style={{ maxHeight: 'calc(420px - 112px)' }}
                >
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 shadow-sm ${
                          msg.role === 'user' ? 'bg-indigo-50 text-indigo-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {msg.role === 'user' ? <UserIcon className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
                        </div>
                        <div className={`p-3 rounded-xl text-xs leading-snug shadow-sm ${
                          msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-tr-none' 
                            : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 items-center text-gray-400">
                        <div className="w-7 h-7 bg-gray-50 rounded-md flex items-center justify-center">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        </div>
                        <p className="text-[11px] font-semibold uppercase tracking-widest">AI is thinking...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                  <div className="relative flex items-center gap-2">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask about policies or requests..."
                      className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2.5 pr-12 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-sm"
                    >
                      <Send className="w-4.5 h-4.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-lg transition-all duration-300 ${
          isOpen ? 'bg-gray-900 text-white rotate-90' : 'bg-blue-600 text-white'
        }`}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full animate-bounce" />
        )}
      </motion.button>
    </div>
  );
};
