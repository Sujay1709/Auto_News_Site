import React from 'react';

export default function ThreeStage({ modelUrl, make, model }) {
  return (
    <div className="w-full h-full bg-black relative">
      <model-viewer
        src={modelUrl}
        alt={`${make} ${model} 3D Model`}
        auto-rotate
        camera-controls
        touch-action="pan-y"
        shadow-intensity="2"
        shadow-softness="1"
        environment-image="neutral"
        exposure="1.0"
        tone-mapping="aces"
        camera-orbit="45deg 75deg 5m"
        field-of-view="30deg"
        style={{ width: '100%', height: '100%', backgroundColor: '#050505' }}
      >
        <div slot="progress-bar" className="hidden"></div>
      </model-viewer>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-8 text-white/20 text-[9px] uppercase font-black tracking-[0.3em] pointer-events-none">
        <span className="flex items-center gap-2">Drag to Orbit</span>
        <span className="text-red-600">|</span>
        <span className="flex items-center gap-2">Scroll to Pitch/Zoom</span>
      </div>
    </div>
  );
}