import React from 'react';

export const AppBackdrop: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-10 pointer-events-none">
      <div className="absolute inset-0 app-surface" />
      <div className="absolute inset-0 app-grid-overlay opacity-70" />
      <div className="absolute inset-0 app-noise" />

      {/* Floating gradients */}
      <div className="absolute -top-32 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.18),transparent_60%)] blur-3xl" />
      <div className="absolute top-32 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_center,rgba(139,92,246,0.14),transparent_60%)] blur-3xl" />
      <div className="absolute bottom-0 -right-44 h-[560px] w-[560px] rounded-full bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12),transparent_62%)] blur-3xl" />
    </div>
  );
};

