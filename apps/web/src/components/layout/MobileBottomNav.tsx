import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Camera,
  FileText,
  Sparkles,
  MessageSquare,
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenScanner: () => void;
  onToggleAi: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenScanner,
  onToggleAi,
}) => {
  const { isClient } = useAuth();
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 safe-area-bottom shadow-2xl">
      <nav className="flex items-center justify-around h-16 px-1 max-w-lg mx-auto">
        {/* Dashboard */}
        <NavLink
          to={isClient ? '/client-portal' : '/dashboard'}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </NavLink>

        {/* Cases (or Messages for Client) */}
        {!isClient ? (
          <NavLink
            to="/cases"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <Briefcase className="w-5 h-5 mb-0.5" />
            <span>Cases</span>
          </NavLink>
        ) : (
          <NavLink
            to="/messages"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span>Messages</span>
          </NavLink>
        )}

        {/* Prominent Quick-Scan Button in Center */}
        {!isClient ? (
          <div className="flex-1 flex flex-col items-center justify-center">
            <button
              onClick={onOpenScanner}
              type="button"
              className="-mt-5 w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/25 border-3 border-slate-900 active:scale-95 transition-transform cursor-pointer"
              aria-label="Scan case document"
            >
              <Camera className="w-6 h-6 stroke-[2.2]" />
            </button>
            <span className="text-[10px] font-semibold text-amber-400 mt-0.5">Scan</span>
          </div>
        ) : null}

        {/* Documents */}
        <NavLink
          to="/documents"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
              isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <FileText className="w-5 h-5 mb-0.5" />
          <span>Docs</span>
        </NavLink>

        {/* AI Assistant */}
        {!isClient ? (
          <button
            onClick={onToggleAi}
            type="button"
            className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
          >
            <Sparkles className="w-5 h-5 mb-0.5" />
            <span>AI Desk</span>
          </button>
        ) : (
          <NavLink
            to="/calendar"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`
            }
          >
            <LayoutDashboard className="w-5 h-5 mb-0.5" />
            <span>Hearings</span>
          </NavLink>
        )}
      </nav>
    </div>
  );
};
