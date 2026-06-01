import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

const { FiCpu, FiLoader, FiSend } = FiIcons;

export default function AIAssistant({ carModel }) {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskAI = async () => {
    if (!query) return;
    setLoading(true);
    
    // Simulate HF Inference
    setTimeout(() => {
      const db = {
        "boot": "Refers to cargo volume. In EVs, this is maximized via the removal of the ICE block.",
        "matrix": "Individually addressable LEDs that create a dynamic, glare-free light carpet.",
        "level 3": "Conditional automation where the vehicle handles all driving in specific environments.",
        "pbr": "Physically Based Rendering ensures materials reflect light exactly like real-world metal and glass."
      };
      const found = Object.keys(db).find(k => query.toLowerCase().includes(k));
      setAnswer(found ? db[found] : "AI Analysis: This technical feature is optimized via the vehicle's central neural processing unit for maximum efficiency.");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="bg-black border border-white/5 rounded-3xl p-6 shadow-2xl">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center text-red-500 border border-red-500/20 shrink-0">
          <SafeIcon icon={FiCpu} size={20} />
        </div>
        <div>
          <h4 className="text-sm font-black uppercase tracking-tighter text-white">Neural Engine</h4>
          <p className="text-[9px] text-red-500 uppercase font-bold tracking-widest text-white/40">Hugging Face Interface</p>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Ask about ${carModel}...`}
          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs outline-none focus:border-red-500/50 transition-all text-white placeholder:text-white/20"
        />
        <button 
          onClick={handleAskAI}
          disabled={loading}
          className="w-full bg-red-600 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <SafeIcon icon={FiLoader} className="animate-spin" size={14} /> : <SafeIcon icon={FiSend} size={14} />}
          Analyze Specimen
        </button>
      </div>

      {answer && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-red-500/5 border-l-2 border-red-600 rounded-r-xl text-xs text-zinc-300 leading-relaxed italic">
          "{answer}"
        </motion.div>
      )}
    </div>
  );
}