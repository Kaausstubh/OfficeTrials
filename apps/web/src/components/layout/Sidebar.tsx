import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  Calendar,
  FileText,
  Send,
  Users2,
  CheckSquare,
  UserCheck,
  MessageSquare,
  Sparkles,
  BarChart3,
  Settings,
  Scale,
  X,
} from 'lucide-react';

interface SidebarProps {
  onToggleAi?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onToggleAi,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { isClient } = useAuth();

  const advocateNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Cases', path: '/cases', icon: Briefcase },
    { name: 'Hearing Calendar', path: '/calendar', icon: Calendar },
    { name: 'Documents & Scanner', path: '/documents', icon: FileText },
    { name: 'e-Filing Records', path: '/efiling', icon: Send },
    { name: 'Evidence & Witnesses', path: '/evidence', icon: Users2 },
    { name: 'Tasks & Deadlines', path: '/tasks', icon: CheckSquare },
    { name: 'Clients Overview', path: '/clients', icon: UserCheck },
    { name: 'Messages', path: '/messages', icon: MessageSquare },
    { name: 'Reports & Exports', path: '/reports', icon: BarChart3 },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const clientNavItems = [
    { name: 'My Case Portal', path: '/client-portal', icon: LayoutDashboard },
    { name: 'Case Documents', path: '/documents', icon: FileText },
    { name: 'Hearing Updates', path: '/calendar', icon: Calendar },
    { name: 'Messages with Advocate', path: '/messages', icon: MessageSquare },
  ];

  const navItems = isClient ? clientNavItems : advocateNavItems;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300">
      {/* Practice Details Badge */}
      <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              {isClient ? 'Client Legal Access' : 'Advocate Practice Desk'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1 truncate">
            {isClient
              ? 'Authorized Litigant Portal'
              : 'Chambers of Adv. R. V. Deshmukh'}
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => {
                if (onCloseMobile) onCloseMobile();
              }}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-amber-500/15 text-amber-400 font-semibold border-l-2 border-amber-400 pl-2.5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          );
        })}

        {!isClient && onToggleAi && (
          <button
            type="button"
            onClick={() => {
              if (onCloseMobile) onCloseMobile();
              onToggleAi();
            }}
            className="w-full mt-4 flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/60 transition-all text-left cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
            <span className="truncate">AI Case Assistant</span>
          </button>
        )}
      </nav>

      {/* Bottom Status Card */}
      <div className="p-3.5 m-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center justify-between text-slate-300 font-medium mb-1">
          <span>eCourts Services</span>
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Online
          </span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          CIS 3.2 & NJDG Sync connected.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-slate-800 h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer with Backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
