import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Scale,
  Search,
  Bell,
  Plus,
  Camera,
  FileCheck2,
  Calendar,
  LogOut,
  UserCheck,
  ChevronDown,
  Sparkles,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onOpenSearch: () => void;
  onOpenScanner?: () => void;
  onOpenNewCase?: () => void;
  onToggleAi?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenSearch,
  onOpenScanner,
  onOpenNewCase,
  onToggleAi,
  onToggleMobileMenu,
}) => {
  const { user, logout, switchDemoRole, isClient } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 flex items-center justify-between shadow-xs">
      {/* Mobile Hamburger + Brand & Search */}
      <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
        {/* Mobile menu toggle */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-navy flex items-center justify-center text-amber-400 shadow-sm shrink-0">
            <Scale className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
          </div>
          <div>
            <h1 className="font-serif font-bold text-sm sm:text-lg text-navy-dark tracking-tight leading-tight whitespace-nowrap">
              Advocate Desk
            </h1>
            <p className="hidden sm:block text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              Practice & e-Filing Suite
            </p>
          </div>
        </div>

        {/* Global Search bar (Responsive) */}
        <button
          type="button"
          onClick={onOpenSearch}
          className="ml-2 sm:ml-4 md:ml-6 flex items-center gap-2 px-2.5 sm:px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 text-xs sm:text-sm rounded-lg border border-slate-200 transition-all max-w-[140px] sm:max-w-xs md:w-80 group text-left cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 shrink-0" />
          <span className="truncate text-xs">Search cases, CNR...</span>
          <kbd className="hidden lg:inline-flex text-[10px] bg-white border border-slate-300 px-1 py-0.2 rounded text-slate-400 font-mono shadow-2xs ml-auto">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Action buttons & User profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {!isClient && (
          <>
            <button
              type="button"
              onClick={onOpenNewCase}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Case</span>
            </button>

            <button
              type="button"
              onClick={onOpenScanner}
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-md border border-amber-300 transition-colors shadow-2xs cursor-pointer"
              title="Launch Document Scanner"
            >
              <Camera className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="hidden xs:inline sm:inline">Scan</span>
            </button>

            <button
              type="button"
              onClick={onToggleAi}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>AI Assistant</span>
            </button>
          </>
        )}

        {/* Role Switcher Demo Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowRoleDropdown(!showRoleDropdown)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md cursor-pointer"
            title="Switch Demo Role"
          >
            <UserCheck className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="hidden md:inline font-semibold">
              {user?.role === 'ADVOCATE' ? 'Advocate' : user?.role === 'CLIENT' ? 'Client' : user?.role}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showRoleDropdown && (
            <div className="absolute right-0 mt-1 w-52 sm:w-56 bg-white border border-slate-200 rounded-lg shadow-xl py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Test Role
              </div>
              {(
                [
                  'ADVOCATE',
                  'ASSOCIATE_ADVOCATE',
                  'CLIENT',
                  'LEGAL_STAFF',
                  'ADMINISTRATOR',
                ] as const
              ).map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => {
                    switchDemoRole(role);
                    setShowRoleDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-1.5 transition-colors flex items-center justify-between ${
                    user?.role === role
                      ? 'bg-amber-50 text-amber-900 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{role.replace('_', ' ')}</span>
                  {user?.role === role && (
                    <span className="text-[10px] text-amber-700 font-mono">Active</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Logout button */}
        <button
          type="button"
          onClick={logout}
          className="p-1.5 text-slate-500 hover:text-red-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
          title="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
