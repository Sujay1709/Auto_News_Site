import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

const { FiUploadCloud, FiStar, FiLoader, FiCheckCircle } = FiIcons;

export default function AIStudio() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleIdentify = async () => {
    setLoading(true);
    // Mimicking Hugging Face Inference API call
    setTimeout(() => {
      setResult({
        model: "Tesla Model 3 (Predicted)",
        confidence: "98.4%",
        details: "AI identified high-performance sedan silhouette with signature matrix LED clusters."
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-8 rounded-3xl bg-slate-900 border border-white/10">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
          <SafeIcon icon={FiStar} size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">AI Vision Studio</h2>
          <p className="text-xs text-white/40">Powered by Hugging Face Models</p>
        </div>
      </div>

      {!file ? (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/10 rounded-2xl hover:border-indigo-500/50 hover:bg-white/5 cursor-pointer transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <SafeIcon icon={FiUploadCloud} className="text-white/20 mb-3" size={32} />
            <p className="text-sm text-white/60 font-medium">Upload car photo for analysis</p>
          </div>
          <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </label>
      ) : (
        <div className="space-y-6">
          <div className="relative h-48 rounded-2xl overflow-hidden bg-white/5 flex items-center justify-center">
             <img src={URL.createObjectURL(file)} className="h-full object-contain" />
             <button 
              onClick={() => {setFile(null); setResult(null);}}
              className="absolute top-2 right-2 p-2 bg-black/50 rounded-full text-white hover:bg-black"
             >
               ×
             </button>
          </div>

          {!result && (
            <button 
              onClick={handleIdentify}
              disabled={loading}
              className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 disabled:opacity-50"
            >
              {loading ? (
                <SafeIcon icon={FiLoader} className="animate-spin" size={18} />
              ) : (
                <SafeIcon icon={FiStar} size={18} />
              )}
              {loading ? 'Analyzing...' : 'Identify Vehicle'}
            </button>
          )}

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-3"
              >
                <div className="flex items-center gap-2 text-indigo-400">
                  <SafeIcon icon={FiCheckCircle} size={18} />
                  <span className="text-sm font-bold uppercase tracking-widest">Analysis Complete</span>
                </div>
                <div>
                  <h4 className="text-white font-bold">{result.model}</h4>
                  <p className="text-xs text-white/60 mt-1 leading-relaxed">{result.details}</p>
                </div>
                <div className="pt-2 border-t border-white/5">
                  <span className="text-[10px] text-white/40 font-bold uppercase">Confidence Score: </span>
                  <span className="text-[10px] text-indigo-400 font-bold">{result.confidence}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}