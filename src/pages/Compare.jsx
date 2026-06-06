import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';
import { CARS_DATA } from '../data/cars';
import { getCarFacts } from '../data/carChat';

const { FiZap, FiSettings, FiShield, FiStar, FiAward, FiRefreshCw } = FiIcons;

// First number found in a spec string, e.g. "203 hp" -> 203, "$26,420" -> 26420.
function num(value) {
  if (value == null) return null;
  const m = String(value).replace(/,/g, '').match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : null;
}

// Comparison rows grouped into sections. `better` decides which car's value
// gets the "winner" pill: 'high' = bigger number wins, 'low' = smaller wins,
// null = informational (no winner).
const SECTIONS = [
  {
    title: 'Powertrain & Performance',
    icon: FiZap,
    rows: [
      { label: 'Engine', key: 'engine' },
      { label: 'Transmission', key: 'transmission' },
      { label: 'Drivetrain', key: 'drivetrain' },
      { label: 'Brake Horsepower', key: 'hp', better: 'high' },
      { label: '0–60 mph', key: 'zeroToSixty', better: 'low' },
      { label: 'Top Speed', key: 'topSpeed', better: 'high' },
    ],
  },
  {
    title: 'Wheels & Chassis',
    icon: FiSettings,
    rows: [
      { label: 'Tyre Size', key: 'tyres' },
      { label: 'Brakes', key: 'brakes' },
    ],
  },
  {
    title: 'Features & Practicality',
    icon: FiStar,
    rows: [
      { label: 'Starting Price', key: 'price', better: 'low' },
      { label: 'Fuel Type', key: 'fuel' },
      { label: 'Range', key: 'range', better: 'high' },
      { label: 'Boot / Cargo', key: 'bootSpace', better: 'high' },
      { label: 'Passengers', key: 'passengers', better: 'high' },
      { label: 'Doors', key: 'doors' },
      { label: 'Headlights', key: 'headlights' },
    ],
  },
  {
    title: 'Safety & Driver Assistance',
    icon: FiShield,
    rows: [
      { label: 'ADAS Suite', key: 'autonomousTech' },
      { label: 'Autonomy Level', key: 'autonomyLevel', better: 'high' },
      { label: 'Capabilities', key: 'autonomyCapabilities' },
    ],
  },
];

// Returns which side wins a row: 'a', 'b', or null (tie / non-numeric).
function decideWinner(row, a, b) {
  if (!row.better) return null;
  const na = num(a[row.key]);
  const nb = num(b[row.key]);
  if (na == null || nb == null || na === nb) return null;
  if (row.better === 'high') return na > nb ? 'a' : 'b';
  return na < nb ? 'a' : 'b'; // 'low'
}

function CarPicker({ side, value, onChange, exclude }) {
  return (
    <select
      aria-label={`Select car ${side}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-red-500/60 transition-colors"
    >
      {CARS_DATA.map((c) => (
        <option key={c.id} value={c.id} disabled={c.id === exclude}>
          {c.make} {c.model} · {c.year}
        </option>
      ))}
    </select>
  );
}

export default function Compare() {
  const [idA, setIdA] = useState(CARS_DATA[0].id);
  const [idB, setIdB] = useState(CARS_DATA[2]?.id || CARS_DATA[1].id);

  const carA = useMemo(() => CARS_DATA.find((c) => c.id === idA), [idA]);
  const carB = useMemo(() => CARS_DATA.find((c) => c.id === idB), [idB]);
  const a = useMemo(() => getCarFacts(carA), [carA]);
  const b = useMemo(() => getCarFacts(carB), [carB]);

  // Tally the performance-relevant wins to crown an overall "edge".
  const tally = useMemo(() => {
    let aw = 0;
    let bw = 0;
    SECTIONS.forEach((s) =>
      s.rows.forEach((r) => {
        const w = decideWinner(r, a, b);
        if (w === 'a') aw += 1;
        else if (w === 'b') bw += 1;
      }),
    );
    return { aw, bw };
  }, [a, b]);

  const swap = () => {
    setIdA(idB);
    setIdB(idA);
  };

  const edge = tally.aw === tally.bw ? null : tally.aw > tally.bw ? a : b;

  return (
    <div>
      {/* Header */}
      <section className="px-6 lg:px-10 pt-16 pb-12 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_0%,_rgba(220,38,38,0.14)_0%,_transparent_60%)]" />
        <div className="max-w-5xl mx-auto relative z-10">
          <span className="text-red-600 text-xs font-black uppercase tracking-[0.5em]">Head to Head</span>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase italic mt-3 text-gradient-red">
            Compare Cars
          </h1>
          <p className="text-zinc-500 max-w-xl mt-4 text-base font-light">
            Pick any two vehicles and pit them spec-for-spec — powertrain, tyres, brake horsepower,
            features, and safety tech, side by side.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-6 lg:px-10 py-10 space-y-8">
        {/* Pickers + car cards */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-3 md:gap-6 items-stretch">
          {[{ car: carA, facts: a, val: idA, set: setIdA, exclude: idB, side: 'A' },
            null,
            { car: carB, facts: b, val: idB, set: setIdB, exclude: idA, side: 'B' }].map((col, i) =>
            col === null ? (
              <button
                key="swap"
                onClick={swap}
                aria-label="Swap cars"
                className="self-center w-11 h-11 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-red-500/60 transition-colors"
              >
                <SafeIcon icon={FiRefreshCw} size={16} />
              </button>
            ) : (
              <motion.div
                key={col.side}
                layout
                className="card-glow bg-zinc-900 border border-white/5 rounded-3xl p-4 flex flex-col"
              >
                <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-4 relative">
                  <img
                    src={col.car.image}
                    alt={`${col.car.make} ${col.car.model}`}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  {edge && edge.name === col.facts.name && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest spec-win px-2.5 py-1 rounded-full">
                      <SafeIcon icon={FiAward} size={11} /> Spec Edge
                    </span>
                  )}
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-red-500">Car {col.side}</div>
                <h3 className="text-lg font-black uppercase tracking-tight text-white leading-tight">
                  {col.car.make} {col.car.model}
                </h3>
                <div className="text-sm text-zinc-500 font-light">{col.car.year} · {col.facts.price}</div>
                <div className="mt-4">
                  <CarPicker side={col.side} value={col.val} onChange={col.set} exclude={col.exclude} />
                </div>
              </motion.div>
            ),
          )}
        </div>

        {/* Win summary */}
        <div className="flex items-center justify-center gap-4 text-center">
          <div className="flex-1 max-w-[140px]">
            <div className="text-3xl font-black text-white">{tally.aw}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Wins · A</div>
          </div>
          <div className="text-[10px] uppercase tracking-[0.4em] text-red-500 font-black">vs</div>
          <div className="flex-1 max-w-[140px]">
            <div className="text-3xl font-black text-white">{tally.bw}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Wins · B</div>
          </div>
        </div>

        {/* Comparison sections */}
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <SafeIcon icon={section.icon} size={15} />
              </div>
              <h2 className="text-lg font-black uppercase tracking-tight text-white">{section.title}</h2>
            </div>

            <div className="rounded-2xl border border-white/5 overflow-hidden">
              {section.rows.map((row, ri) => {
                const winner = decideWinner(row, a, b);
                const va = a[row.key] ?? '—';
                const vb = b[row.key] ?? '—';
                return (
                  <div
                    key={row.key}
                    className={`grid grid-cols-[1fr_auto_1fr] gap-2 md:gap-4 items-center px-3 md:px-5 py-3 ${
                      ri % 2 ? 'bg-zinc-950' : 'bg-zinc-900/40'
                    }`}
                  >
                    <div className={`text-[13px] md:text-sm text-right rounded-lg px-2 py-1 ${winner === 'a' ? 'spec-win font-semibold' : 'text-zinc-300'}`}>
                      {va}
                    </div>
                    <div className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/35 font-bold text-center min-w-[84px] md:min-w-[130px]">
                      {row.label}
                    </div>
                    <div className={`text-[13px] md:text-sm rounded-lg px-2 py-1 ${winner === 'b' ? 'spec-win font-semibold' : 'text-zinc-300'}`}>
                      {vb}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        <p className="text-[11px] text-white/25 text-center font-light pt-2">
          Highlighted cells mark the stronger spec on measurable rows (more power, range, space; lower
          price and 0–60). Descriptive rows are informational.
        </p>
      </div>
    </div>
  );
}
