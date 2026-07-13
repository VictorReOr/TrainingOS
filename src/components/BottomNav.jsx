import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CalendarDays, Play, TrendingUp, Timer, Users } from 'lucide-react';
import { useRole } from '../hooks/useRole';

export default function BottomNav() {
  const { isCoach } = useRole();

  let navItems = [
    { to: '/',          label: 'Inicio',   icon: Home },
    { to: '/plan',      label: 'Plan',     icon: CalendarDays },
    { to: '/session',   label: 'Sesión',   icon: Play },
    { to: '/evolution', label: 'Evolución',icon: TrendingUp },
    { to: '/timer',     label: 'Timer',    icon: Timer },
  ];

  if (isCoach) {
    navItems = navItems.map(item => 
      item.to === '/evolution' 
        ? { to: '/coach', label: 'Atletas', icon: Users } 
        : item
    );
  }

  return (
    <nav className="fixed bottom-0 w-full bg-white border-t border-[#E8E8E4] pb-[var(--safe-bottom)] z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full gap-0.5 transition-colors duration-200 ${
                  isActive ? 'text-[#FF6B00]' : 'text-[#6E6E73] hover:text-[#1C1C1E]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative">
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF6B00]" />
                    )}
                  </span>
                  <span className="text-[10px] font-sans font-semibold tracking-[0.08em] uppercase leading-none">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
