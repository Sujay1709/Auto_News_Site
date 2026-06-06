import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';
import { CARS_DATA } from '../data/cars';
import ChatAssistant from './ChatAssistant';

const { FiMessageSquare, FiX, FiCpu } = FiIcons;

// Floating "Ask AI" button + modal pop-up. Available app-wide.
//  - carId: optionally lock the assistant to a specific car (e.g. on a detail
//    page). When omitted, the popup shows a car picker so the user can choose.
export default function ChatPopup({ carId }) {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState(carId || CARS_DATA[0].id);

  const car = CARS_DATA.find((c) => c.id === (carId || activeId)) || CARS_DATA[0];

  return (
    <>
      {/* Floating launcher */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: 'spring' }}
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-[90] flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white pl-4 pr-5 py-3.5 rounded-full shadow-2xl shadow-red-600/30 font-black uppercase text-[11px] tracking-widest"
      >
        <SafeIcon icon={FiMessageSquare} size={16} />
        Ask AI
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[95] bg-black/70 backdrop-blur-sm"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              className="fixed z-[100] bottom-0 right-0 sm:bottom-6 sm:right-6 w-full sm:w-[420px] h-[85vh] sm:h-[640px] sm:max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-red-500">
                  <SafeIcon icon={FiCpu} size={12} /> Neural Assistant
                </span>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:border-red-500/60 transition-colors"
                  aria-label="Close assistant"
                >
                  <SafeIcon icon={FiX} size={16} />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <ChatAssistant
                  car={car}
                  showCarPicker={!carId}
                  onCarChange={setActiveId}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
