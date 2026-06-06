import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { CARS_DATA } from '../data/cars';
import { answerQuestion, SUGGESTED_QUESTIONS } from '../data/carChat';

const { FiCpu, FiSend, FiLoader, FiUser } = FiIcons;

// Reusable chat experience for the AI car assistant.
//  - car:          the car to answer about (required unless showCarPicker)
//  - showCarPicker: render a make/model selector at the top
//  - onCarChange:   notified when the picker changes (id)
export default function ChatAssistant({ car, showCarPicker = false, onCarChange }) {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  // Reset the conversation whenever the active car changes.
  useEffect(() => {
    setMessages([
      {
        role: 'bot',
        text: `Hi! I'm the AutoHub assistant. Ask me anything about the ${car.make} ${car.model} — tyres, transmission, drivetrain, headlights, ADAS, power and more. Tap a suggestion below to get started.`,
      },
    ]);
  }, [car.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  const send = (text) => {
    const q = (text ?? query).trim();
    if (!q || loading) return;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setQuery('');
    setLoading(true);
    // Brief delay to mimic a thinking assistant.
    setTimeout(() => {
      const reply = answerQuestion(car, q);
      setMessages((m) => [...m, { role: 'bot', text: reply }]);
      setLoading(false);
    }, 550);
  };

  return (
    <div className="flex flex-col h-full bg-black border border-white/5 rounded-3xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/5 bg-zinc-950 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20 shrink-0">
          <SafeIcon icon={FiCpu} size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-black uppercase tracking-tighter text-white">AutoHub AI Assistant</h4>
          <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest truncate">
            {car.make} {car.model}
          </p>
        </div>
        {showCarPicker && (
          <select
            value={car.id}
            onChange={(e) => onCarChange?.(e.target.value)}
            className="bg-zinc-900 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white outline-none focus:border-red-500/50 max-w-[150px]"
          >
            {CARS_DATA.map((c) => (
              <option key={c.id} value={c.id}>
                {c.make} {c.model}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 min-h-[200px]">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  m.role === 'user' ? 'bg-white/10 text-white' : 'bg-red-600/15 text-red-500 border border-red-500/20'
                }`}
              >
                <SafeIcon icon={m.role === 'user' ? FiUser : FiCpu} size={13} />
              </div>
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-red-600 text-white rounded-tr-sm'
                    : 'bg-zinc-900 text-zinc-200 border border-white/5 rounded-tl-sm'
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-red-600/15 text-red-500 border border-red-500/20 shrink-0">
              <SafeIcon icon={FiCpu} size={13} />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-white/5 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Suggested questions */}
      <div className="px-4 pb-2 shrink-0">
        <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
          {SUGGESTED_QUESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="whitespace-nowrap text-[11px] font-medium px-3 py-1.5 rounded-full border border-white/10 text-zinc-300 hover:border-red-500/60 hover:text-white transition-colors disabled:opacity-40"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/5 bg-zinc-950 shrink-0 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && send()}
          placeholder={`Ask about the ${car.model}...`}
          className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-red-500/50 transition-all text-white placeholder:text-white/20"
        />
        <button
          onClick={() => send()}
          disabled={loading || !query.trim()}
          className="w-12 bg-red-600 rounded-xl flex items-center justify-center hover:bg-red-500 transition-all disabled:opacity-40 shrink-0"
        >
          <SafeIcon icon={loading ? FiLoader : FiSend} className={loading ? 'animate-spin' : ''} size={16} />
        </button>
      </div>
    </div>
  );
}
