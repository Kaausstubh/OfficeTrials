import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { apiClient } from '../api/client';
import { Case, CaseType, ProceduralStage, CasePriority } from '../types';
import { LayoutOutletContext } from '../components/layout/MainLayout';
import {
  Briefcase,
  Search,
  Filter,
  Plus,
  Building2,
  Calendar,
  AlertCircle,
  Copy,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface CasesPageProps {
  onOpenNewCase?: () => void;
}

export const CasesPage: React.FC<CasesPageProps> = ({ onOpenNewCase }) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const outletCtx = useOutletContext<LayoutOutletContext>() || {};
  const handleOpenNewCase = onOpenNewCase || outletCtx.onOpenNewCase;

  useEffect(() => {
    loadCases();
  }, [search, selectedType, selectedStage]);

  const loadCases = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/cases', {
        params: {
          search: search || undefined,
          caseType: selectedType || undefined,
          stage: selectedStage || undefined,
        },
      });
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setCases(list);
    } catch (err) {
      console.error(err);
      setCases([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24 md:pb-6">
      {/* Header & New Case Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-navy-dark tracking-tight">
            Litigation Case Register
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active litigation files across Civil, Criminal, Writ, and Commercial benches
          </p>
        </div>

        {handleOpenNewCase && (
          <button
            type="button"
            onClick={handleOpenNewCase}
            className="self-start sm:self-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-navy hover:bg-navy-light rounded-lg shadow-sm transition-colors w-full sm:w-auto cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Register New Case</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="p-3 sm:p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 w-full min-w-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search case, CNR, party, acts..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
          >
            <option value="">All Case Types</option>
            <option value="COMMERCIAL_DISPUTE">Commercial Dispute</option>
            <option value="WRIT_PETITION">Writ Petition</option>
            <option value="CRIMINAL_CASE">Criminal Case</option>
            <option value="CIVIL_SUIT">Civil Suit</option>
          </select>

          <select
            value={selectedStage}
            onChange={e => setSelectedStage(e.target.value)}
            className="flex-1 sm:flex-initial px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg"
          >
            <option value="">All Stages</option>
            <option value="PRE_ADMISSION_HEARING">Pre-Admission</option>
            <option value="FRAMING_OF_ISSUES_CHARGES">Framing Charges</option>
            <option value="FINAL_ARGUMENTS">Final Arguments</option>
            <option value="ORDER_PRONOUNCED">Order Pronounced</option>
          </select>
        </div>
      </div>

      {/* Case Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading litigation register...
          </div>
        ) : cases.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No matching legal cases found in database.
          </div>
        ) : (
          <div className="divide-y divide-slate-200">
            {cases.map(c => {
              const nextHearingStr = c.nextHearingDate
                ? new Date(c.nextHearingDate).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })
                : 'Not scheduled';

              return (
                <div
                  key={c.id}
                  onClick={() => navigate(`/cases/${c.id}`)}
                  className="p-3 sm:p-4 hover:bg-slate-50/80 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="font-bold text-sm text-navy-dark">
                        {c.caseNumber}
                      </span>
                      <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {c.internalCaseNo}
                      </span>
                      {c.cnrNumber && (
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                          {c.cnrNumber}
                        </span>
                      )}
                      <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                        {c.proceduralStage.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800">
                      {c.title}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 text-[11px] text-slate-500">
                      <span>Court: <strong>{c.court?.name}</strong></span>
                      {c.statutoryActs && <span>• Acts: {c.statutoryActs}</span>}
                    </div>
                  </div>

                  {/* Right: Next Hearing & Counts */}
                  <div className="flex items-center justify-between md:justify-end gap-4 sm:gap-6 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    <div className="text-left md:text-right text-xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Next Court Date
                      </span>
                      <span className="font-bold text-slate-900">{nextHearingStr}</span>
                      <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                        {c.nextHearingPurpose || 'Proceedings'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 text-slate-400 text-xs">
                      <span className="text-[11px]">{c._count?.documents || 0} Docs</span>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
