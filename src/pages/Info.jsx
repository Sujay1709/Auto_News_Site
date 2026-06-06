import React from 'react';
import { motion } from 'framer-motion';

const STATS = [
  { val: '80M+', lbl: 'Vehicles / Year' },
  { val: '$3T', lbl: 'Global Market' },
  { val: '14M', lbl: 'Jobs Worldwide' },
  { val: '1.4B', lbl: 'Vehicles on Roads' },
];

const TIMELINE = [
  { year: '1886 — The Beginning', text: 'Karl Benz patents the first automobile with an internal combustion engine in Germany.' },
  { year: '1908 — Model T Revolution', text: 'Ford introduces the Model T, making cars accessible to the masses through assembly-line mass production.' },
  { year: '1973 — Oil Crisis Shifts', text: 'The OPEC oil embargo forces automakers to rethink fuel efficiency for the first time.' },
  { year: '1997 — Toyota Prius', text: 'Launch of the first mass-produced hybrid electric vehicle, sparking the modern EV revolution.' },
  { year: '2008 — Tesla Roadster', text: 'Tesla introduces the Roadster, proving that electric cars can be both practical and desirable.' },
  { year: '2020s — Electric Future', text: 'Major automakers commit to fully electric lineups, with many countries setting deadlines for ICE vehicle sales bans.' },
];

const SECTIONS = [
  {
    h: 'The Evolution of the Automobile',
    p: [
      'The automobile industry has undergone a remarkable transformation since the late 19th century. From the first practical automobiles powered by internal combustion engines to today\'s sophisticated electric vehicles, the journey has been nothing short of revolutionary.',
      'The industry began with pioneers like Karl Benz, who created the first true automobile in 1885–1886, and Henry Ford, who revolutionized manufacturing with the assembly line in 1913, making cars affordable for the average person.',
    ],
  },
  {
    h: 'Current Market Dynamics',
    p: [
      'The global automobile industry is one of the largest economic sectors in the world, producing millions of vehicles annually and employing millions of workers directly and indirectly. The industry is currently undergoing its most significant transformation since the invention of the automobile itself.',
      'Electric vehicle adoption is accelerating rapidly, driven by falling battery costs, government incentives, and increasing consumer awareness of environmental impact. By 2030, EVs are projected to account for over 30% of new vehicle sales globally.',
    ],
  },
  {
    h: 'Technology Trends',
    p: [
      'Advanced driver assistance systems (ADAS), vehicle-to-infrastructure communication, and over-the-air software updates are becoming standard features across all segments. Autonomous driving technology, while not yet fully realized for consumer use, continues to advance rapidly in commercial applications like robotaxis and long-haul trucking.',
      'Connectivity is now a core selling point: modern vehicles generate and consume enormous amounts of data, enabling predictive maintenance, real-time navigation, and personalized in-car experiences.',
    ],
  },
];

export default function Info() {
  return (
    <div>
      {/* Header */}
      <section className="px-6 lg:px-10 pt-16 pb-12 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,_rgba(220,38,38,0.12)_0%,_transparent_60%)]" />
        <div className="max-w-3xl mx-auto relative z-10">
          <span className="text-red-600 text-xs font-black uppercase tracking-[0.5em]">Deep Dive</span>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase italic mt-3">Automobile Industry</h1>
          <p className="text-zinc-500 max-w-xl mt-4 text-base font-light">
            From Karl Benz to full electric fleets — explore the history, economics, and future of one of the world&apos;s largest industries.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-6 lg:px-10 py-12 space-y-16">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <div key={s.lbl} className="bg-zinc-900 border border-white/5 rounded-2xl p-6 text-center">
              <div className="text-3xl font-black text-red-600">{s.val}</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-2">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* First narrative section */}
        <Section {...SECTIONS[0]} />

        {/* Timeline */}
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight mb-8">A Century of Milestones</h2>
          <div className="border-l-2 border-red-600/30 pl-6 space-y-8">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="relative"
              >
                <span className="absolute -left-[31px] top-1.5 w-3 h-3 rounded-full bg-red-600 border-2 border-black" />
                <div className="text-sm font-black uppercase tracking-widest text-red-500">{t.year}</div>
                <p className="text-sm text-zinc-400 font-light leading-relaxed mt-1">{t.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <Section {...SECTIONS[1]} />
        <Section {...SECTIONS[2]} />
      </div>
    </div>
  );
}

function Section({ h, p }) {
  return (
    <div>
      <h2 className="text-2xl font-black uppercase tracking-tight mb-4">{h}</h2>
      <div className="space-y-4">
        {p.map((para, i) => (
          <p key={i} className="text-[15px] text-zinc-400 font-light leading-relaxed">{para}</p>
        ))}
      </div>
    </div>
  );
}
