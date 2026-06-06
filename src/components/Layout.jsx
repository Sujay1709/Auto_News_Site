import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import ChatPopup from './ChatPopup';

// App shell for the main pages (Home / News / Get Info / Get Help):
// persistent navbar, the routed page, and the global "Ask AI" popup.
export default function Layout() {
  return (
    <div className="bg-black min-h-screen text-white">
      <Navbar />
      <main>
        <Outlet />
      </main>
      <footer className="border-t border-white/5 mt-20 py-10 text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">
          AutoHub-render.com • Technical Encyclopedia
        </p>
      </footer>
      <ChatPopup />
    </div>
  );
}
