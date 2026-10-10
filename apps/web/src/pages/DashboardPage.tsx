import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ECourtsSearchModal } from '../components/ecourts/ECourtsSearchModal';
import {
  Calendar,
  AlertTriangle,
  Clock,
  Briefcase,
  FileText,
  Send,
  Plus,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Camera,
  RotateCw,
  Scale,
} from 'lucide-react';

interface DashboardPageProps {
  onOpenScanner?: () => void;
  onOpenNewCase?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenScanner,
  onOpenNewCase,
}) => {
  const [data, setData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showECourtsModal, setShowECourtsModal] = useState(false);
  const [ecourtsDefaultCnr, setEcourtsDefaultCnr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/dashboard/summary');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading chamber dashboard and hearing diary metrics...
      </div>
    );
  }

  const { metrics } = data;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24 md:pb-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-navy-dark tracking-tight">
            Advocate Litigation Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time court cause-list tracking, document scanning queue, and e-filing scrutiny status
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => {
              setEcourtsDefaultCnr('');
              setShowECourtsModal(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-xs transition-colors cursor-pointer text-center"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-800" />
            <span>eCourts Sync</span>
          </button>

          {onOpenNewCase && (
            <button
              onClick={onOpenNewCase}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-lg shadow-xs transition-colors text-center"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Case</span>
            </button>
          )}

          {onOpenScanner && (
            <button
              onClick={onOpenScanner}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-colors text-center"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Document</span>
            </button>
          )}
        </div>
      </div>

      {/* eCourts Live Sync Banner Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-navy-dark">
                eCourts Services & Registry Integration Active
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                CIS 3.2 Live
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Fetch real-time proceedings, cause lists, orders, witness rosters, and marked exhibits by 16-character CNR number.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => {
              setEcourtsDefaultCnr('MHST010020592021');
              setShowECourtsModal(true);
            }}
            className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-800" />
            <span>Quick Import: MHST010020592021 (Satara Trial)</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Hearings Today</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {metrics.hearingsTodayCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.hearingsTomorrowCount} listed tomorrow
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Hearings This Week</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {metrics.hearingsThisWeekCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across High Court & Sessions
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Overdue Tasks</span>
            <AlertTriangle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-rose-600">
            {metrics.overdueTasksCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Requires urgent action
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Active Cases</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {metrics.totalCases}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {metrics.pendingDefectsCount} pending e-filing defects
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Hearings Schedule */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-600" />
                <span>Upcoming Hearing Cause-List</span>
              </h3>
              <button
                onClick={() => navigate('/calendar')}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1"
              >
                <span>View Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {data.hearingsThisWeek.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No court hearings listed for this week.
              </div>
            ) : (
              <div className="space-y-2.5">
                {data.hearingsThisWeek.map((h: any) => (
                  <div
                    key={h.id}
                    onClick={() => navigate(`/cases/${h.case.id}`)}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer transition-all flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{h.case.caseNumber}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(h.hearingDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 font-medium">
                        {h.purpose}
                      </p>
                      <div className="text-slate-500 text-[10px] mt-1">
                        {h.court?.name} {h.court?.courtHallNo && `(${h.court.courtHallNo})`}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        Listed
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending e-Filing Defects Requiring Curing */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <span>e-Filing Scrutiny & Defects Requiring Curing</span>
              </h3>
              <button
                onClick={() => navigate('/efiling')}
                className="text-xs text-blue-700 hover:text-blue-800 font-semibold"
              >
                All e-Filings
              </button>
            </div>

            {data.pendingDefects.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No outstanding scrutiny defects recorded across any filing portals.
              </div>
            ) : (
              <div className="space-y-2">
                {data.pendingDefects.map((def: any) => (
                  <div
                    key={def.id}
                    onClick={() => navigate(`/cases/${def.case.id}`)}
                    className="p-3 bg-amber-50/70 border border-amber-300 rounded-lg cursor-pointer hover:bg-amber-100/60 text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                      <span>{def.filingTitle}</span>
                      <span className="text-[10px] font-mono text-amber-900 bg-amber-200 px-1.5 py-0.5 rounded">
                        {def.currentStatus}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-700">
                      {def.defectDetails || 'Scrutiny objection raised by court registry.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Overdue Tasks & Recently Scanned */}
        <div className="lg:col-span-5 space-y-6">
          {/* Overdue Tasks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Overdue Preparation Tasks</span>
            </h3>

            {data.overdueTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                All deadlines and tasks are up to date.
              </div>
            ) : (
              <div className="space-y-2">
                {data.overdueTasks.map((t: any) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 text-xs space-y-1"
                  >
                    <div className="font-bold text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-slate-600">
                      Case: <strong>{t.case?.caseNumber}</strong> • Assigned: {t.assignedTo?.fullName}
                    </div>
                    <div className="text-[10px] text-rose-700 font-bold font-mono">
                      Due: {new Date(t.dueDate).toLocaleDateString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recently Digitized Documents */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Recently Digitized Files</span>
              </h3>
              <button
                onClick={() => navigate('/documents')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                All Documents
              </button>
            </div>

            <div className="space-y-2">
              {data.recentDocuments.map((doc: any) => (
                <div
                  key={doc.id}
                  onClick={() => navigate(`/cases/${doc.case.id}`)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs flex items-center justify-between transition-colors"
                >
                  <div className="truncate max-w-[200px]">
                    <div className="font-semibold text-slate-900 truncate">
                      {doc.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {doc.category?.name} • {doc.case?.caseNumber}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    OCR: {doc.ocrStatus}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* eCourts Search & Import Modal */}
      <ECourtsSearchModal
        isOpen={showECourtsModal}
        onClose={() => setShowECourtsModal(false)}
        defaultCnr={ecourtsDefaultCnr}
        onImportComplete={loadSummary}
      />
    </div>
  );
};
