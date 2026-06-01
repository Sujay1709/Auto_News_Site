import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CARS_DATA } from '../data/cars';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';

const { FiChevronRight, FiMaximize } = FiIcons;

export default function Home() {
  return (
    <div className="bg-black min-h-screen pb-40">
      
      {/* Hero */}
      <section className="h-[60vh] flex flex-col items-center justify-center text-center px-10 relative overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(220,38,38,0.15)_0%,_transparent_70%)]" />
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 space-y-4">
          <span className="text-red-600 text-xs font-black uppercase tracking-[0.6em]">The Future of Automotive</span>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter uppercase italic leading-none">
            AutoHub<span className="text-red-600 lowercase text-4xl lg:text-6xl">-render.com</span>
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto text-lg font-light tracking-wide">Explore interactive 3D specimens and deep-dive technical narratives with AI-assisted intelligence.</p>
        </motion.div>
      </section>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-10 -mt-10 relative z-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {CARS_DATA.map((car, idx) => (
          <Link to={`/car/${car.id}`} key={car.id}>
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: idx * 0.1 }}
              className="group bg-zinc-900 rounded-[2rem] overflow-hidden border border-white/5 hover:border-red-600/50 transition-all shadow-2xl flex flex-col h-full"
            >
              <div className="h-64 relative overflow-hidden bg-zinc-800 shrink-0">
                <img 
                  src={car.image} 
                  alt={car.model} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                <div className="absolute top-6 right-6 p-3 rounded-full bg-black/40 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity">
                  <SafeIcon icon={FiMaximize} size={18} className="text-white" />
                </div>
              </div>

              <div className="p-8 space-y-4 flex flex-col flex-1 justify-between">
                <div>
                  <span className="text-xs font-black text-red-600 uppercase tracking-widest">{car.make}</span>
                  <h3 className="text-2xl font-black uppercase tracking-tight italic">{car.model}</h3>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-bold text-white/30 uppercase tracking-widest pt-4 border-t border-white/5">
                  <span>{car.year} SPECIMEN</span>
                  <div className="flex items-center gap-2 group-hover:text-red-500 transition-colors">
                    View Data <SafeIcon icon={FiChevronRight} size={14} />
                  </div>
                </div>
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}