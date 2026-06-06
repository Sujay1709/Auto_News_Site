import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { CARS_DATA } from '../data/cars';
import ChatAssistant from '../components/ChatAssistant';

const { FiCpu, FiZap, FiSettings, FiShield, FiDisc } = FiIcons;

const CAPABILITIES = [
  { icon: FiDisc, title: 'Tyres & Wheels', text: 'Ask for exact tyre sizes and staggered setups for any model.' },
  { icon: FiSettings, title: 'Transmission & Drivetrain', text: 'Get the gearbox type and whether it is FWD, RWD, or AWD.' },
  { icon: FiZap, title: 'Lighting Tech', text: 'Learn the headlight technology — Matrix, LED, Digital Light and more.' },
  { icon: FiShield, title: 'ADAS & Autonomy', text: 'Understand the driver-assist suite and its autonomy level.' },
];

export default function Help() {
  const [activeId, setActiveId] = useState(CARS_DATA[0].id);
  const car = CARS_DATA.find((c) => c.id === activeId) || CARS_DATA[0];

  return (
    <div>
      {/* Header */}
      <section className="px-6 lg:px-10 pt-16 pb-12 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,_rgba(220,38,38,0.12)_0%,_transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-[0.5em]">
            <SafeIcon icon={FiCpu} size={14} /> AI Assistant
          </span>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase italic mt-3">Get Help</h1>
          <p className="text-zinc-500 max-w-xl mt-4 text-base font-light">
            Pick a car and ask the AutoHub AI anything about its specs — tyres, transmission, drivetrain,
            headlights, ADAS, power, range, and more.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Capabilities */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">What I can answer</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CAPABILITIES.map((c, i) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="bg-zinc-900 border border-white/5 rounded-2xl p-5 hover:border-red-600/40 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-4">
                  <SafeIcon icon={c.icon} size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-tight text-white">{c.title}</h3>
                <p className="text-[13px] text-zinc-400 font-light leading-relaxed mt-1">{c.text}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-[13px] text-zinc-500 font-light leading-relaxed">
            Prefer a quick chat? The floating <span className="text-red-500 font-bold">Ask AI</span> button is available on
            every page and pops up suggested questions to get you started.
          </p>
        </div>

        {/* Live chat */}
        <div className="h-[640px] max-h-[80vh]">
          <ChatAssistant car={car} showCarPicker onCarChange={setActiveId} />
        </div>
      </div>
    </div>
  );
}
