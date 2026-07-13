import React, { useState, useEffect } from 'react';
import TimerViews from './TimerViews';

export default function TimerSheet({ onClose }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-[60] transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
      ></div>

      <div 
        className={`fixed bottom-0 left-0 w-full bg-[#1e2335] rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] z-[60] flex flex-col transition-transform duration-300 ease-out ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '85vh' }}
      >
         <TimerViews asModal={true} onCloseModal={handleClose} />
      </div>
    </>
  );
}
