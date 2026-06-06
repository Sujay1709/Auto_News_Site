import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from './common/SafeIcon';

const { FiHome, FiRss, FiInfo, FiHelpCircle, FiMenu, FiX } = FiIcons;

const LINKS = [
  { to: '/', label: 'Home', icon: FiHome, end: true },
  { to: '/news', label: 'News', icon: FiRss },
  { to: '/info', label: 'Get Info', icon: FiInfo },
  { to: '/help', label: 'Get Help', icon: FiHelpCircle },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest transition-colors ${
      isActive ? 'bg-red-600 text-white' : 'text-white/50 hover:text-white'
    }`;

  return (
    <header className="sticky top-0 z-[80] bg-black/80 backdrop-blur-xl border-b border-white/5">
      <nav className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 shrink-0" onClick={() => setOpen(false)}>
          <span className="text-xl font-black tracking-tighter uppercase italic text-white">
            Auto<span className="text-red-600">Hub</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              <SafeIcon icon={l.icon} size={13} />
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-white"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          <SafeIcon icon={open ? FiX : FiMenu} size={18} />
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/5 bg-black px-6 py-4 flex flex-col gap-2">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              onClick={() => setOpen(false)}
              className={linkClass}
            >
              <SafeIcon icon={l.icon} size={13} />
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}
