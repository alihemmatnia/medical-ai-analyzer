import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { Send, User as UserIcon, Bot, MessageSquare, FileText } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';

export default function Chat() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialReportId = searchParams.get('report_id') || '';

  const [messages, setMessages] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string>(initialReportId);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const { t, language, direction } = useLanguage();

  // Fetch reports list on mount
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await api.get('/reports/');
        setReports(res.data);
      } catch (err) {
        console.error('Failed to fetch reports list:', err);
      }
    };
    fetchReports();
  }, []);

  // Fetch chat history whenever selected report context changes
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const url = selectedReportId ? `/chat?report_id=${selectedReportId}` : '/chat';
        const res = await api.get(url);
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      }
    };
    fetchHistory();
  }, [selectedReportId]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), role: 'user', message: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const payload = {
        message: userMsg.message,
        report_id: selectedReportId ? parseInt(selectedReportId) : null
      };
      const res = await api.post('/chat', payload);
      setMessages(prev => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-card rounded-2xl border border-slate-800/80 max-w-4xl mx-auto overflow-hidden shadow-2xl animate-fade-in">
      {/* Chat header */}
      <div className="p-5 border-b border-slate-800/60 bg-slate-900/40 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-cyan/15 p-2 rounded-xl text-brand-cyan">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white flex items-center gap-1.5">
              {t('chat.title')} 
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-emerald"></span>
              </span>
            </h1>
            <p className="text-[11px] text-slate-400 mt-0.5">{t('chat.subtitle')}</p>
          </div>
        </div>

        {/* Report context selector */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <FileText size={14} className="text-slate-400" />
          <span className="text-xs text-slate-400 font-semibold">{t('chat.contextLabel')}:</span>
          <select
            value={selectedReportId}
            onChange={(e) => {
              setSelectedReportId(e.target.value);
              setSearchParams(e.target.value ? { report_id: e.target.value } : {});
            }}
            className="bg-brand-dark border border-slate-800 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 focus:border-brand-cyan focus:outline-none transition-all cursor-pointer"
          >
            <option value="">{t('chat.allReports')}</option>
            {reports.map((report) => (
              <option key={report.id} value={report.id}>
                {report.filename} ({new Date(report.uploaded_at).toLocaleDateString(language)})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Pane */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-brand-dark/20">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 max-w-sm mx-auto">
            <div className="bg-slate-900/50 p-4 rounded-full border border-slate-800 text-slate-500">
              <MessageSquare size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="text-slate-300 text-sm font-bold">{t('chat.title')}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">
                {selectedReportId 
                  ? t('chat.placeholder')
                  : t('chat.placeholder')}
              </p>
            </div>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3.5 max-w-[85%] ${msg.role === 'user' ? (direction === 'rtl' ? 'mr-auto flex-row-reverse' : 'ml-auto flex-row-reverse') : ''}`}>
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 border shadow-md ${
              msg.role === 'user' 
                ? 'bg-slate-900 border-slate-850 text-brand-cyan' 
                : 'bg-brand-indigo/15 border-brand-indigo/20 text-brand-indigo'
            }`}>
              {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
            </div>
            
            <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-md ${
              msg.role === 'user' 
                ? `bg-gradient-to-tr from-brand-indigo to-brand-cyan text-brand-dark font-medium ${direction === 'rtl' ? 'rounded-tl-none' : 'rounded-tr-none'}` 
                : `bg-slate-900/50 border border-slate-800/60 text-slate-200 ${direction === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none'}`
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
            <div className={`p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 flex items-center gap-1.5 ${direction === 'rtl' ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce delay-75"></span>
              <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        {/* Scroll anchor removed in favor of direct container scrollTop manipulation */}
      </div>

      {/* Input Tray */}
      <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            className="flex-1 px-5 py-3.5 bg-brand-navy/60 border border-slate-850 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-transparent text-slate-100 placeholder-slate-500 transition-all text-sm"
            placeholder={t('chat.placeholder')}
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

