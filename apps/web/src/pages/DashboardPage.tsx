import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { apiClient } from '../api/client';
import { ECourtsSearchModal } from '../components/ecourts/ECourtsSearchModal';
import { LayoutOutletContext } from '../components/layout/MainLayout';
import {
  Calendar,
  AlertTriangle,
  Clock,
  Briefcase,
  FileText,
  Send,
  Plus,
  ArrowRight,
  ShieldCheck,
  Camera,
  RotateCw,
  Scale,
  Users2,
  ChevronRight,
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

  // Retrieve modal triggers from MainLayout context if not provided as direct props
  const outletCtx = useOutletContext<LayoutOutletContext>() || {};
  const handleOpenNewCase = onOpenNewCase || outletCtx.onOpenNewCase;
  const handleOpenScanner = onOpenScanner || outletCtx.onOpenScanner;

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/dashboard/summary');
      setData(res.data?.data || null);
    } catch (err) {
      console.error('Failed to load dashboard summary:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Loading chamber dashboard and litigation diary metrics...
      </div>
    );
  }

  const metrics = data.metrics || {
    totalCases: 1,
    activeCasesCount: 1,
    hearingsTodayCount: 0,
    hearingsTomorrowCount: 0,
    hearingsThisWeekCount: 1,
    overdueTasksCount: 0,
    pendingDefectsCount: 0,
    unverifiedDatesCount: 0,
  };

  const hearingsThisWeek = Array.isArray(data.hearingsThisWeek) ? data.hearingsThisWeek : [];
  const overdueTasks = Array.isArray(data.overdueTasks) ? data.overdueTasks : [];
  const recentDocuments = Array.isArray(data.recentDocuments) ? data.recentDocuments : [];
  const pendingDefects = Array.isArray(data.pendingDefects) ? data.pendingDefects : [];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24 md:pb-6">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-navy-dark tracking-tight">
            Advocate Litigation Dashboard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Court cause-list tracking, document scanning queue, and real-time e-Courts case diary
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setEcourtsDefaultCnr('');
              setShowECourtsModal(true);
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-colors cursor-pointer text-center"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-800" />
            <span>eCourts Sync</span>
          </button>

          {handleOpenNewCase && (
            <button
              type="button"
              onClick={handleOpenNewCase}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-lg shadow-2xs transition-colors text-center cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Register Case</span>
            </button>
          )}

          {handleOpenScanner && (
            <button
              type="button"
              onClick={handleOpenScanner}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-2xs transition-colors text-center cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Scan Document</span>
            </button>
          )}
        </div>
      </div>

      {/* eCourts Live Sync Banner Card */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-navy-dark">
                eCourts Services & Case Diary Active
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                CIS 3.2 Live
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              Fetch real-time proceedings, cause lists, orders, witness rosters, and marked exhibits by CNR number or Case Type/Number.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setEcourtsDefaultCnr('MHST010020592021');
              setShowECourtsModal(true);
            }}
            className="px-3.5 py-2 text-xs font-bold text-amber-950 bg-amber-200 hover:bg-amber-300 border border-amber-400 rounded-lg shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5 text-amber-800" />
            <span>Open Case: MHST010020592021 (Satara Trial)</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Hearings This Week</span>
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {metrics.hearingsThisWeekCount ?? hearingsThisWeek.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Satara Sessions & District Courts
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Registered Cases</span>
            <Briefcase className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {metrics.totalCases ?? 1}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Active Litigation Register
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Preparation Tasks</span>
            <AlertTriangle className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {overdueTasks.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Cross-examination & drafting
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium mb-1">
            <span>Digitized Exhibits</span>
            <FileText className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold font-serif text-slate-900">
            {recentDocuments.length}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            High resolution scanned records
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
                type="button"
                onClick={() => navigate('/calendar')}
                className="text-xs text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>View Full Calendar</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {hearingsThisWeek.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                No court hearings listed for this week.
              </div>
            ) : (
              <div className="space-y-2.5">
                {hearingsThisWeek.map((h: any) => (
                  <div
                    key={h.id || Math.random()}
                    onClick={() => {
                      if (h.case?.id) navigate(`/cases/${h.case.id}`);
                    }}
                    className="p-3.5 rounded-lg border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 cursor-pointer transition-all flex items-start justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{h.case?.caseNumber || 'Court Matter'}</span>
                        {h.hearingDate && (
                          <span className="text-[10px] text-slate-500 font-mono">
                            {new Date(h.hearingDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                            })}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5 font-medium">
                        {h.purpose || 'Court Proceeding'}
                      </p>
                      <div className="text-slate-500 text-[10px] mt-1">
                        {h.court?.name || 'District & Sessions Court, Satara'} {h.courtRoomNo ? `(${h.courtRoomNo})` : ''}
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                        {h.attendanceStatus || 'Listed'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Case Register Card */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-emerald-600" />
                <span>Active Litigation File</span>
              </h3>
              <button
                type="button"
                onClick={() => navigate('/cases')}
                className="text-xs text-navy font-semibold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>All Cases</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div
              onClick={() => navigate('/cases/68f40a77-d59d-4e00-a7fa-7b1b972d2c07')}
              className="p-4 bg-slate-50 hover:bg-amber-50/50 rounded-xl border border-slate-200 hover:border-amber-400 transition-all cursor-pointer space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-navy-dark bg-white px-2 py-0.5 rounded border border-slate-200">
                  CNR: MHST010020592021
                </span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  Sessions Trial (Satara)
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900">
                State of Maharashtra v. Anandrao Vishwanath Patil & Ors.
              </h4>
              <p className="text-xs text-slate-600 line-clamp-2">
                Karad City P.S. Crime No. 142/2021 (IPC 307, 326, 324, 149). Next Hearing: 29.10.2026 for cross-examination of medical witness PW-2 Dr. Kadam.
              </p>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Users2 className="w-3.5 h-3.5 text-slate-400" />
                  3 Witnesses Listed
                </span>
                <span className="flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  3 Marked Exhibits
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Overdue Tasks & Recently Scanned */}
        <div className="lg:col-span-5 space-y-6">
          {/* Overdue Tasks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
            <h3 className="font-bold text-sm text-slate-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Chamber Action Checklist</span>
            </h3>

            {overdueTasks.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-lg">
                All deadlines and tasks are up to date.
              </div>
            ) : (
              <div className="space-y-2">
                {overdueTasks.map((t: any) => (
                  <div
                    key={t.id || Math.random()}
                    className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 text-xs space-y-1"
                  >
                    <div className="font-bold text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-slate-600">
                      Case: <strong>{t.case?.caseNumber || 'Sessions Case 2059/2021'}</strong>
                    </div>
                    {t.dueDate && (
                      <div className="text-[10px] text-amber-900 font-bold font-mono">
                        Target Date: {new Date(t.dueDate).toLocaleDateString('en-IN')}
                      </div>
                    )}
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
                <span>Digitized Case Briefs</span>
              </h3>
              <button
                type="button"
                onClick={() => navigate('/documents')}
                className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                All Documents
              </button>
            </div>

            <div className="space-y-2">
              {recentDocuments.map((doc: any) => (
                <div
                  key={doc.id || Math.random()}
                  onClick={() => {
                    if (doc.case?.id) navigate(`/cases/${doc.case.id}`);
                  }}
                  className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer text-xs flex items-center justify-between transition-colors"
                >
                  <div className="truncate max-w-[200px]">
                    <div className="font-semibold text-slate-900 truncate">
                      {doc.displayName}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {doc.category?.name || 'Court Record'} • {doc.case?.caseNumber || '2059/2021'}
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    {doc.ocrStatus || 'DIGITIZED'}
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
