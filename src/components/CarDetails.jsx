import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

const { FiUsers, FiSidebar, FiPackage, FiEye, FiCpu } = FiIcons;

export default function CarDetails({ car }) {
  if (!car) return null;

  const DetailItem = ({ icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-red-500/50 transition-colors">
      <div className="p-2 rounded-lg bg-red-500/10 text-red-500">
        <SafeIcon icon={icon} size={20} />
      </div>
      <div>
        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-white/90">{value}</p>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      key={car.id}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem icon={FiUsers} label="Capacity" value={`${car.specs.passengers} Passengers`} />
        <DetailItem icon={FiSidebar} label="Doors" value={`${car.specs.doors} Doors`} />
        <DetailItem icon={FiPackage} label="Cargo Space" value={car.specs.bootSpace} />
        <DetailItem icon={FiEye} label="Headlights" value={car.specs.headlights} />
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20">
        <div className="flex items-center gap-3 mb-4">
          <SafeIcon icon={FiCpu} className="text-red-500" size={24} />
          <h3 className="text-lg font-bold text-white tracking-tight">Autonomous Technology</h3>
        </div>
        <div className="space-y-2">
          <div className="inline-block px-2 py-1 rounded bg-red-500 text-white text-[10px] font-black uppercase mb-2">
            {car.specs.autonomous.level}
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            {car.specs.autonomous.capabilities}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-8">
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-white/40 mb-1">0-60 MPH</p>
          <p className="text-xl font-black text-white">{car.specs.performance.zeroToSixty}</p>
        </div>
        <div className="text-center border-x border-white/10">
          <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Power</p>
          <p className="text-xl font-black text-white">{car.specs.performance.hp}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase font-bold text-white/40 mb-1">Top Speed</p>
          <p className="text-xl font-black text-white">{car.specs.performance.topSpeed}</p>
        </div>
      </div>
    </motion.div>
  );
}