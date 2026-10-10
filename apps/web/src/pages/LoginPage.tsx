import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { Scale, Lock, Mail, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('advocate@legaldesk.com');
  const [password, setPassword] = useState('Advocate@123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, switchDemoRole } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsLoading(true);
    setError(null);
    try {
      await switchDemoRole(role);
      navigate(role === 'CLIENT' ? '/client-portal' : '/dashboard');
    } catch (err: any) {
      setError('Quick login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Court Scales Watermark */}
      <div className="absolute -right-20 -bottom-20 opacity-5 pointer-events-none text-white">
        <Scale className="w-[500px] h-[500px]" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 items-center justify-center text-slate-950 shadow-xl mb-4">
          <Scale className="w-8 h-8 stroke-[2.2]" />
        </div>
        <h2 className="font-serif text-3xl font-bold tracking-tight text-white">
          Advocate Case Desk
        </h2>
        <p className="mt-1.5 text-xs font-medium text-slate-400 uppercase tracking-widest">
          Complete Legal Practice & e-Filing Suite
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Bar / Advocate Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-navy hover:bg-navy-light rounded-lg shadow-md transition-all flex items-center justify-center gap-2"
            >
              <span>{isLoading ? 'Authenticating...' : 'Sign In to Chambers'}</span>
              <ArrowRight className="w-4 h-4 text-amber-400" />
            </button>
          </form>

          {/* Quick 1-Click Role Switcher Demo */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              1-Click Role Demonstrator
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('ADVOCATE')}
                className="p-2 text-left bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-900 group-hover:text-amber-900">
                  Senior Advocate
                </div>
                <div className="text-[10px] text-slate-500">Lead Counsel Access</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('CLIENT')}
                className="p-2 text-left bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-900 group-hover:text-emerald-900">
                  Client Litigant
                </div>
                <div className="text-[10px] text-slate-500">Confidential Portal</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('ASSOCIATE_ADVOCATE')}
                className="p-2 text-left bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-900 group-hover:text-blue-900">
                  Associate Advocate
                </div>
                <div className="text-[10px] text-slate-500">Assigned Cases & Tasks</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('LEGAL_STAFF')}
                className="p-2 text-left bg-slate-50 hover:bg-purple-50/80 border border-slate-200 hover:border-purple-300 rounded-lg transition-colors group"
              >
                <div className="font-bold text-slate-900 group-hover:text-purple-900">
                  Legal Staff / Clerk
                </div>
                <div className="text-[10px] text-slate-500">Registry & Filings</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
