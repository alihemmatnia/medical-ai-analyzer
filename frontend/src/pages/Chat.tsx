import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { Send, User as UserIcon, Bot, MessageSquare, ShieldAlert } from 'lucide-react';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/chat');
        setMessages(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', message: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: userMsg.message });
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] glass-card rounded-2xl border border-slate-800/80 max-w-4xl mx-auto overflow-hidden shadow-2xl animate-fade-in">
      {/* Chat header */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/40 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-brand-cyan/15 p-2 rounded-xl text-brand-cyan">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              AI Medical Assistant 
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald"></span>
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">Discuss your clinical reports and clarify biomarkers</p>
          </div>
        </div>
      </div>

      {/* Messages Pane */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-dark/20">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-sm mx-auto">
            <div className="bg-slate-900/50 p-4 rounded-full border border-slate-800 text-slate-500">
              <MessageSquare size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-300 text-sm font-bold">Start Consultation</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                Ask simple questions like: "What does my high cholesterol mean?" or "Explain the glucose levels in my last report."
              </p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3.5 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
              msg.role === 'user' 
                ? 'bg-slate-900 border-slate-850 text-brand-cyan' 
                : 'bg-brand-indigo/15 border-brand-indigo/20 text-brand-indigo'
            }`}>
              {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
              msg.role === 'user' 
                ? 'bg-gradient-to-tr from-brand-indigo to-brand-cyan text-brand-dark font-medium rounded-tr-none' 
                : 'bg-slate-900/50 border border-slate-800/60 text-slate-200 rounded-tl-none'
            }`}>
              {msg.message}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3.5 max-w-[80%]">
            <div className="h-9 w-9 rounded-xl bg-brand-indigo/15 border border-brand-indigo/20 text-brand-indigo flex items-center justify-center shrink-0">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 rounded-tl-none flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Tray */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            className="flex-1 px-5 py-3.5 bg-brand-navy/60 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all text-sm"
            placeholder="Ask a medical query..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || loading}
            className="bg-gradient-to-r from-brand-indigo to-brand-cyan text-brand-dark disabled:opacity-40 disabled:cursor-not-allowed font-bold p-3.5 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-brand-cyan/20 shrink-0"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

