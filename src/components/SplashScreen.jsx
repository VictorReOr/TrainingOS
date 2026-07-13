import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Iniciar fade out a los 1800ms (300ms de animación) para completar 2100ms
    const timer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1800);

    // Llamar onFinish a los 2100ms
    const finishTimer = setTimeout(() => {
      onFinish();
    }, 2100);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0f0f0f] transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0' : 'opacity-100 animate-fade-in'
      }`}
    >
      <div className="flex flex-col items-center">
        <img
          src="/Logo_trainingOS.png"
          alt="TrainingOS"
          style={{ width: '280px', height: 'auto' }}
          className="mb-4 animate-splash-logo"
        />
        <p className="font-condensed text-[#FF6B00] tracking-widest text-sm uppercase font-bold animate-splash-tagline">
          METHOD MEETS PERFORMANCE
        </p>
      </div>
    </div>
  );
}
