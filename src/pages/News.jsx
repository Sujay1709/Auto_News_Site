import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../components/common/SafeIcon';

const { FiArrowRight, FiCalendar, FiLoader, FiWifiOff } = FiIcons;

// NewsAPI demo key. The developer plan permits requests from localhost via the
// Vite dev proxy (see vite.config.js), so the News page pulls live global
// automotive headlines during local development. In a deployed static build the
// proxy is absent, the request fails, and the page falls back to the cached
// headlines in FALLBACK below — showing a "Cached Feed" badge.
const NEWS_API_KEY = '7120175e997a4aae8edc62c5167858bf';

// Each topic maps to a NewsAPI search query for real-time, global results.
const TOPICS = [
  { label: 'All', q: '(car OR cars OR automotive OR vehicle OR EV) AND (launch OR review OR model OR automaker OR electric OR engine OR industry)' },
  { label: 'Electric Vehicles', q: 'electric vehicle OR EV OR battery car' },
  { label: 'New Models', q: 'new car model OR car launch OR reveal' },
  { label: 'Autonomous Tech', q: 'autonomous driving OR self-driving car OR ADAS' },
  { label: 'Industry Trends', q: 'automotive industry OR car manufacturer' },
];

// Offline fallback so the page is never empty if the live feed is unreachable.
const FALLBACK = [
  { source: { name: 'AutoHub Wire' }, title: 'Solid-State Batteries Edge Closer to Production Cars', description: 'Automakers confirm pilot lines for solid-state cells promising more range and faster charging.', publishedAt: '2026-05-29', urlToImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=70', url: 'https://www.google.com/search?q=solid+state+battery+ev' },
  { source: { name: 'DriveTech Daily' }, title: 'Hands-Free Highway Systems Expand to More Mapped Roads', description: 'Level 2+ driver-assist suites add thousands of certified highway miles with eye-tracking now standard.', publishedAt: '2026-05-27', urlToImage: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?w=800&q=70', url: 'https://www.google.com/search?q=hands+free+highway+driving' },
  { source: { name: 'Motor Journal' }, title: 'Next-Gen Sports Coupes Embrace Hybrid V6 Power', description: 'The supercar segment pivots to electrified V6s blending instant torque with lower emissions.', publishedAt: '2026-05-24', urlToImage: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=70', url: 'https://www.google.com/search?q=hybrid+v6+supercar' },
  { source: { name: 'Market Watch Auto' }, title: 'EVs Projected to Pass 30% of New Sales by 2030', description: 'Falling battery costs and broader charging networks accelerate global EV adoption.', publishedAt: '2026-05-21', urlToImage: 'https://images.unsplash.com/photo-1617704548623-340376564e68?w=800&q=70', url: 'https://www.google.com/search?q=ev+sales+forecast+2030' },
  { source: { name: 'Charge Report' }, title: '800-Volt Architectures Become the New Premium Standard', description: 'Faster 10–80% charging windows push more brands to high-voltage platforms.', publishedAt: '2026-05-18', urlToImage: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&q=70', url: 'https://www.google.com/search?q=800+volt+ev+platform' },
  { source: { name: 'AutoHub Wire' }, title: 'Three-Row SUVs Get Smarter Cabins and Bigger Screens', description: 'Family haulers double down on rear-seat entertainment and over-the-air feature upgrades.', publishedAt: '2026-05-15', urlToImage: 'https://images.unsplash.com/photo-1519440135210-f1de7e8d3df2?w=800&q=70', url: 'https://www.google.com/search?q=three+row+suv' },
];

export default function News() {
  const [topicIdx, setTopicIdx] = useState(0);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const q = encodeURIComponent(TOPICS[topicIdx].q);
    // Go through the Vite /newsapi proxy (see vite.config.js) so the request is
    // made server-side — NewsAPI returns 426 for direct browser requests.
    const url = `/newsapi/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=12&apiKey=${NEWS_API_KEY}`;

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list = (data.articles || []).filter((a) => a.title && a.title !== '[Removed]');
        if (list.length) {
          setArticles(list);
          setLive(true);
        } else {
          setArticles(FALLBACK);
          setLive(false);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setArticles(FALLBACK);
        setLive(false);
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [topicIdx]);

  return (
    <div>
      {/* Page header */}
      <section className="px-6 lg:px-10 pt-16 pb-12 border-b border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,_rgba(220,38,38,0.12)_0%,_transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <span className="flex items-center gap-2 text-red-600 text-xs font-black uppercase tracking-[0.5em]">
            <span className="relative flex h-2 w-2">
              <span className={`absolute inline-flex h-full w-full rounded-full bg-red-500 ${live ? 'animate-ping opacity-75' : 'opacity-0'}`} />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600" />
            </span>
            {live ? 'Live Feed' : 'Cached Feed'}
          </span>
          <h1 className="text-4xl lg:text-6xl font-black tracking-tighter uppercase italic mt-3">Automotive News</h1>
          <p className="text-zinc-500 max-w-xl mt-4 text-base font-light">
            Real-time headlines from across the globe — EVs, new models, autonomous technology, and market trends.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-12">
        {/* Topic filter */}
        <div className="flex gap-2 flex-wrap mb-10">
          {TOPICS.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setTopicIdx(i)}
              className={`text-[11px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-colors ${
                topicIdx === i
                  ? 'bg-red-600 border-red-600 text-white'
                  : 'border-white/10 text-white/50 hover:text-white hover:border-white/30'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {!live && !loading && (
          <div className="flex items-center gap-2 text-[11px] text-amber-400/80 mb-6 uppercase tracking-widest font-bold">
            <SafeIcon icon={FiWifiOff} size={13} /> Live feed unavailable — showing recent cached headlines.
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/40 gap-4">
            <SafeIcon icon={FiLoader} size={28} className="animate-spin text-red-500" />
            <span className="text-[11px] uppercase tracking-widest font-bold">Fetching latest headlines…</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((a, idx) => (
              <motion.a
                key={`${a.url}-${idx}`}
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.4) }}
                className="group bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 hover:border-red-600/50 transition-all flex flex-col"
              >
                <div className="h-48 overflow-hidden bg-zinc-800 relative flex items-center justify-center">
                  {a.urlToImage ? (
                    <img
                      src={a.urlToImage}
                      alt={a.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => { e.currentTarget.style.opacity = '0'; }}
                    />
                  ) : (
                    <SafeIcon icon={FiArrowRight} size={24} className="text-white/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />
                </div>
                <div className="p-6 flex flex-col flex-1 gap-3">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-widest truncate">
                    {a.source?.name || 'Auto News'}
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white leading-snug line-clamp-3">{a.title}</h3>
                  <p className="text-sm text-zinc-400 font-light leading-relaxed flex-1 line-clamp-3">
                    {a.description || 'Click to read the full story.'}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-white/5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    <span className="flex items-center gap-1.5">
                      <SafeIcon icon={FiCalendar} size={11} /> {(a.publishedAt || '').slice(0, 10)}
                    </span>
                    <span className="flex items-center gap-1.5 group-hover:text-red-500 transition-colors">
                      Read <SafeIcon icon={FiArrowRight} size={12} />
                    </span>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
