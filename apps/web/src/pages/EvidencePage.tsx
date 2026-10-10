import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import {
  Users2,
  FileCheck2,
  Shield,
  Search,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

export const EvidencePage: React.FC = () => {
  const [witnesses, setWitnesses] = useState<any[]>([]);
  const [exhibits, setExhibits] = useState<any[]>([]);
  const [bailRecords, setBailRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'witnesses' | 'exhibits' | 'bail'>('witnesses');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadEvidence();
  }, []);

  const loadEvidence = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/cases');
      const allW: any[] = [];
      const allE: any[] = [];
      const allB: any[] = [];

      res.data.data.forEach((c: any) => {
        c.witnesses?.forEach((w: any) =>
          allW.push({ ...w, caseNumber: c.caseNumber, caseId: c.id })
        );
        c.exhibits?.forEach((e: any) =>
          allE.push({ ...e, caseNumber: c.caseNumber, caseId: c.id })
        );
        c.bailRecords?.forEach((b: any) =>
          allB.push({ ...b, caseNumber: c.caseNumber, caseId: c.id })
        );
      });

      setWitnesses(allW);
      setExhibits(allE);
      setBailRecords(allB);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h2 className="font-serif font-bold text-2xl text-navy-dark tracking-tight">
          Evidence, Witnesses & Bail Repository
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Trial evidence records, witness depositions, exhibit custody, and surety bond compliance
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('witnesses')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'witnesses'
              ? 'border-amber-600 text-amber-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Witnesses & Depositions ({witnesses.length})
        </button>
        <button
          onClick={() => setActiveTab('exhibits')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'exhibits'
              ? 'border-amber-600 text-amber-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Marked Exhibits ({exhibits.length})
        </button>
        <button
          onClick={() => setActiveTab('bail')}
          className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'bail'
              ? 'border-amber-600 text-amber-900 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Bail & Surety Compliance ({bailRecords.length})
        </button>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading evidence files...</div>
        ) : activeTab === 'witnesses' ? (
          <div className="divide-y divide-slate-100">
            {witnesses.map(w => (
              <div
                key={w.id}
                onClick={() => navigate(`/cases/${w.caseId}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[10px]">
                      {w.witnessNumber}
                    </span>
                    <span>{w.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">
                      ({w.caseNumber})
                    </span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Stage: <strong>{w.currentStage.replace(/_/g, ' ')}</strong> • {w.testimonySummary}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        ) : activeTab === 'exhibits' ? (
          <div className="divide-y divide-slate-100">
            {exhibits.map(e => (
              <div
                key={e.id}
                onClick={() => navigate(`/cases/${e.caseId}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px] font-bold">
                      {e.exhibitNumber}
                    </span>
                    <span>{e.description}</span>
                  </div>
                  <div className="text-slate-500 text-[11px] mt-1">
                    Case: <strong>{e.caseNumber}</strong> • Marked By: {e.markedBy}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bailRecords.map(b => (
              <div
                key={b.id}
                onClick={() => navigate(`/cases/${b.caseId}`)}
                className="p-4 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>Accused: {b.accusedName}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                      {b.bailType} • {b.status}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px] mt-1">
                    Case: <strong>{b.caseNumber}</strong> • Conditions: {b.bailConditions}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
