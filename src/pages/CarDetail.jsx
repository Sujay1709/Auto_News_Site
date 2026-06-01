import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { CARS_DATA } from '../data/cars';
import AIAssistant from '../components/AIAssistant';

const { FiInfo, FiBox, FiUsers, FiShield, FiZap, FiArrowLeft, FiCpu } = FiIcons;

export default function CarDetail() {
  const { id } = useParams();
  const car = CARS_DATA.find(c => c.id === id);

  useEffect(() => {
    // Reset scroll position on mount
    window.scrollTo(0, 0);
  }, [id]);

  if (!car) return (
    <div className="bg-black h-screen w-full flex items-center justify-center text-white flex-col gap-6">
      <h1 className="font-black text-4xl uppercase tracking-widest text-red-600">Specimen Not Found</h1>
      <Link to="/" className="text-sm uppercase tracking-widest text-white/50 hover:text-white transition-colors border-b border-white/20 pb-1">
        Return to AutoHub-render.com
      </Link>
    </div>
  );

  return (
    <div className="bg-[#050505] h-screen w-full flex flex-col lg:flex-row text-white overflow-hidden">
      
      {/* LEFT PANEL: High Resolution Image Showcase */}
      <section className="flex-1 relative h-[40vh] lg:h-full border-b lg:border-b-0 lg:border-r border-white/5">
        
        <img 
          src={car.image} 
          alt={`${car.make} ${car.model}`} 
          className="w-full h-full object-cover opacity-90"
        />
        
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 pointer-events-none" />

        {/* HUD: Top Left Branding */}
        <div className="absolute top-8 left-8 z-20 pointer-events-none">
          <Link to="/" className="inline-flex items-center gap-2 text-white/40 hover:text-red-500 transition-colors mb-6 uppercase text-[10px] font-black tracking-widest pointer-events-auto">
             <SafeIcon icon={FiArrowLeft} size={14} /> Back to Gallery
          </Link>
          <motion.div key={car.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <span className="text-red-600 text-[10px] font-black uppercase tracking-[0.4em] mb-1 block dark-hud">High-Res Gallery</span>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter leading-none italic uppercase dark-hud text-white">
              {car.make} <span className="block text-white/60">{car.model}</span>
            </h1>
          </motion.div>
        </div>

        {/* HUD: Bottom Quick Stats */}
        <div className="absolute bottom-8 left-8 right-8 z-20 flex justify-between items-end pointer-events-none hidden md:flex">
          <div className="flex gap-8 lg:gap-12">
            <div className="space-y-1">
               <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 dark-hud">
                 <SafeIcon icon={FiUsers} size={10} /> Capacity
               </span>
               <p className="text-lg font-black text-white dark-hud">{car.specs.passengers}</p>
            </div>
            <div className="space-y-1">
               <span className="text-[9px] font-black uppercase tracking-widest text-white/40 flex items-center gap-2 dark-hud">
                 <SafeIcon icon={FiBox} size={10} /> Boot Space
               </span>
               <p className="text-lg font-black text-white dark-hud">{car.specs.bootSpace}</p>
            </div>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: Scrollable Narrative & Specs */}
      <section className="w-full lg:w-[450px] xl:w-[500px] h-[60vh] lg:h-full bg-zinc-950 overflow-y-auto custom-scrollbar p-8 lg:p-10 shrink-0">
        
        <div className="space-y-12">
          {/* Header & Price */}
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Base Market Value</span>
            <p className="text-4xl font-black text-white mt-1">{car.price}</p>
            <div className="h-px w-full bg-white/5 mt-6" />
          </div>

          {/* Technical Matrix Grid */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-red-600">Technical Matrix</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Headlights", value: car.specs.headlights, icon: FiZap },
                { label: "Portals", value: `${car.specs.doors} Doors`, icon: FiInfo },
                { label: "Year", value: car.year, icon: FiShield },
                { label: "Autonomy", value: car.specs.autonomousTech, icon: FiCpu }
              ].map((spec, idx) => (
                <div key={idx} className="bg-black border border-white/5 rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                     <SafeIcon icon={spec.icon} className="text-red-500" size={12} />
                     <span className="text-[9px] font-black uppercase tracking-widest text-white/40 truncate">{spec.label}</span>
                  </div>
                  <p className="text-sm font-bold text-zinc-100 truncate">{spec.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Compact Paragraphs */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-6">Engineering Literature</h3>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              {car.paragraphs.map((p, i) => (
                <p key={i} className="text-sm text-zinc-400 leading-relaxed font-light">
                  <span className="text-red-600 font-bold mr-2 text-xs">0{i+1}.</span>
                  {p}
                </p>
              ))}
            </motion.div>
          </div>

          {/* AI Module */}
          <AIAssistant carModel={car.model} />

          <footer className="pt-8 border-t border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 text-center">
            AutoHub-render.com • Technical Details
          </footer>
        </div>
      </section>

    </div>
  );
}