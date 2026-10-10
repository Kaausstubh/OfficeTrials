import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import {
  Calendar as CalendarIcon,
  Clock,
  Building2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export const CalendarPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day' | 'agenda'>('agenda');
  const [hearings, setHearings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHearings();
  }, []);

  const loadHearings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/calendar');
      setHearings(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const conflictsCount = hearings.filter(h => h.hasConflict).length;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-navy-dark tracking-tight">
            Smart Hearing Calendar & Cause-List Diary
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated conflict detection across High Court, Sessions, and District Complexes
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-lg text-xs font-semibold text-slate-700">
          {(['agenda', 'day', 'week', 'month'] as const).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1.5 rounded-md capitalize transition-all ${
                viewMode === mode
                  ? 'bg-white text-navy shadow-xs font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Conflict Warning Banner if any conflicts exist */}
      {conflictsCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">
              Potential Listing Conflicts Detected ({conflictsCount}):
            </span>{' '}
            Multiple hearings are listed concurrently on the same date across separate court complexes. Verify appearance through colleagues or prepare passover applications.
          </div>
        </div>
      )}

      {/* Calendar List / Agenda View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading hearing diary schedules...
          </div>
        ) : hearings.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No hearings listed in current calendar range.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {hearings.map(h => (
              <div
                key={h.id}
                onClick={() => navigate(`/cases/${h.caseId}`)}
                className={`p-4 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  h.hasConflict ? 'bg-amber-50/20' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">
                      {h.caseNumber}
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {h.internalCaseNo}
                    </span>
                    {h.dateVerification === 'OFFICIAL_VERIFIED' ? (
                      <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Official Verified
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                        Manual Entry
                      </span>
                    )}

                    {h.hasConflict && (
                      <span className="text-[10px] text-amber-900 font-bold bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-700" /> Conflict
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-semibold text-slate-800">
                    {h.caseTitle}
                  </div>

                  <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3">
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {h.courtName} {h.courtHall && `(${h.courtHall})`}
                    </span>
                    <span>• Purpose: <strong>{h.purpose}</strong></span>
                    <span>• Counsel: {h.assignedAdvocate}</span>
                  </div>

                  {h.conflictDetails && (
                    <div className="text-[11px] text-amber-800 font-medium pt-1">
                      ⚠️ {h.conflictDetails}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="text-sm font-bold text-navy-dark block">
                    {new Date(h.hearingDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {new Date(h.hearingDate).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
