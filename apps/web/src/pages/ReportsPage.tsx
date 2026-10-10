import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import {
  BarChart3,
  Download,
  Printer,
  FileSpreadsheet,
  Users,
  Briefcase,
  Calendar,
  Layers,
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const [caseRegister, setCaseRegister] = useState<any[]>([]);
  const [workload, setWorkload] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'register' | 'workload'>('register');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const [regRes, workRes] = await Promise.all([
        apiClient.get('/reports/case-register'),
        apiClient.get('/reports/workload'),
      ]);
      setCaseRegister(regRes.data.data);
      setWorkload(workRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCsv = () => {
    window.open('/api/v1/reports/case-register?format=csv', '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif font-bold text-2xl text-navy-dark tracking-tight">
            Chamber Reports & Practice Export
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Export official litigation registers, cause-list compilations, and advocate workload distributions
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('register')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'register'
              ? 'border-amber-600 text-amber-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Comprehensive Case Register ({caseRegister.length})
        </button>
        <button
          onClick={() => setActiveTab('workload')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'workload'
              ? 'border-amber-600 text-amber-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Advocate Workload Distribution ({workload.length})
        </button>
      </div>

      {/* Register Report Table */}
      {activeTab === 'register' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="p-3.5">Internal ID</th>
                  <th className="p-3.5">Case / Suit No.</th>
                  <th className="p-3.5">CNR Number</th>
                  <th className="p-3.5">Court Complex</th>
                  <th className="p-3.5">Parties</th>
                  <th className="p-3.5">Stage</th>
                  <th className="p-3.5">Lead Counsel</th>
                  <th className="p-3.5">Next Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {caseRegister.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="p-3.5 font-mono text-slate-500">{r.internalCaseNo}</td>
                    <td className="p-3.5 font-bold text-slate-900">{r.caseNumber}</td>
                    <td className="p-3.5 font-mono text-[11px] text-amber-900">{r.cnrNumber}</td>
                    <td className="p-3.5 text-slate-700">{r.courtName}</td>
                    <td className="p-3.5 text-slate-800 font-medium max-w-[200px] truncate">{r.parties}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-semibold">
                        {r.stage}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700">{r.leadCounsel}</td>
                    <td className="p-3.5 font-semibold text-slate-900">{r.nextHearingDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workload Report */}
      {activeTab === 'workload' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workload.map(adv => (
            <div
              key={adv.advocateId}
              className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{adv.fullName}</h4>
                  <span className="text-[11px] text-slate-500">{adv.role.replace(/_/g, ' ')} • {adv.email}</span>
                </div>
                <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-900 font-bold text-xs">
                  {adv.totalAssignedCases} Cases
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-500 block font-bold">Active Cases</span>
                  <span className="text-base font-bold text-slate-900">{adv.activeCasesCount}</span>
                </div>
                <div className="p-2.5 bg-rose-50/50 rounded-lg border border-rose-100">
                  <span className="text-[10px] text-rose-700 block font-bold">Urgent Matters</span>
                  <span className="text-base font-bold text-rose-700">{adv.urgentCasesCount}</span>
                </div>
                <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                  <span className="text-[10px] text-blue-700 block font-bold">Open Tasks</span>
                  <span className="text-base font-bold text-blue-700">{adv.pendingTasksCount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
