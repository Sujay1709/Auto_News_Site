import React, { useRef } from 'react';

export default function ThreeViewer({ src, poster }) {
  const viewerRef = useRef(null);

  return (
    <div className="relative w-full h-full bg-slate-900 overflow-hidden">
      {/* 
        We use the <model-viewer> web component directly. 
        It is loaded globally via the CDN in index.html, so no import is needed here.
      */}
      <model-viewer
        ref={viewerRef}
        src={src}
        alt="3D Car Model"
        auto-rotate="true"
        camera-controls="true"
        touch-action="pan-y"
        shadow-intensity="2"
        environment-image="neutral"
        exposure="1"
        style={{ width: '100%', height: '100%', backgroundColor: '#0f172a' }}
        interaction-prompt="auto"
      >
        <div slot="progress-bar" className="hidden"></div>
      </model-viewer>
      
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 pointer-events-none">
        <span className="text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-1">
          <div className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
          Interactive 3D
        </span>
      </div>
    </div>
  );
}