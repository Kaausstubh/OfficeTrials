import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import {
  Send,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RotateCw,
  Search,
  Filter,
} from 'lucide-react';

export const EFilingPage: React.FC = () => {
  const [efilings, setEfilings] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEfilings();
  }, []);

  const loadEfilings = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/cases');
      const allFilings: any[] = [];
      const casesList = Array.isArray(res.data?.data) ? res.data.data : [];
      casesList.forEach((c: any) => {
        if (Array.isArray(c?.efilingRecords)) {
          c.efilingRecords.forEach((f: any) => {
            allFilings.push({ ...f, caseNumber: c.caseNumber, caseTitle: c.title });
          });
        }
      });
      setEfilings(allFilings);
    } catch (err) {
      console.error(err);
      setEfilings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = (efilings || []).filter(f => {
    const title = f?.filingTitle || f?.caseTitle || '';
    const num = f?.caseNumber || '';
    const portal = f?.portalName || '';
    const q = search.toLowerCase();
    return (
      title.toLowerCase().includes(q) ||
      num.toLowerCase().includes(q) ||
      portal.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-serif font-bold text-2xl text-navy-dark tracking-tight">
          Court e-Filing Scrutiny & Submission Tracker
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Lifecycle tracking from local draft preparation to court registry acceptance, diary number generation, and defect resolution
        </p>
      </div>

      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search e-filings by title, portal name, diary number, or case..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading e-filing records...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No e-filings recorded.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map(f => (
              <div
                key={f.id}
                onClick={() => navigate(`/cases/${f.caseId}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900">{f.filingTitle}</span>
                    <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                      {f.caseNumber}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Portal: <strong>{f.portalName}</strong> • Type: {f.filingType}
                  </div>
                  {f.defectDetails && (
                    <div className="text-amber-800 text-[11px] font-medium bg-amber-50 p-1.5 rounded border border-amber-200 mt-1">
                      ⚠️ Scrutiny Objection: {f.defectDetails}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 inline-block mb-1">
                    {f.currentStatus.replace(/_/g, ' ')}
                  </span>
                  {f.diaryNumber && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Diary No: {f.diaryNumber}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
