import React from 'react';
import { Case } from '../../types';
import {
  Calendar,
  Building2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Clock,
  ShieldCheck,
  Tag,
  Edit3,
} from 'lucide-react';

interface CaseHeaderProps {
  caseData: Case;
  onRefresh?: () => void;
  onOpenECourtsSync?: () => void;
  onEditCase?: () => void;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({
  caseData,
  onRefresh,
  onOpenECourtsSync,
  onEditCase,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyCnr = () => {
    if (caseData.cnrNumber) {
      navigator.clipboard.writeText(caseData.cnrNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const nextHearingDateStr = caseData.nextHearingDate
    ? new Date(caseData.nextHearingDate).toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : 'No hearing scheduled';

  return (
    <div className="bg-white border-b border-slate-200 shadow-2xs">
      <div className="px-3 sm:px-6 py-3 sm:py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
        {/* Left Side: Case Info & Metadata */}
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-serif font-bold text-lg sm:text-xl text-navy-dark tracking-tight">
              {caseData.caseNumber}
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-100 text-slate-700 rounded border border-slate-200">
              {caseData.internalCaseNo}
            </span>

            {/* CNR Badge with copy */}
            {caseData.cnrNumber && (
              <button
                onClick={copyCnr}
                className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-300 rounded hover:bg-amber-100 transition-colors"
                title="Click to copy CNR"
              >
                <span>CNR: {caseData.cnrNumber}</span>
                <Copy className="w-3 h-3 text-amber-700" />
                {copied && <span className="text-[10px] text-emerald-700 font-sans font-bold">Copied!</span>}
              </button>
            )}

            {/* Procedural Stage Badge */}
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
              {caseData.proceduralStage.replace(/_/g, ' ')}
            </span>

            {/* Health Indicator */}
            {caseData.health === 'CRITICAL_OVERDUE' && (
              <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-300">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                Action Overdue
              </span>
            )}
          </div>

          <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
            <span>{caseData.title}</span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <strong>{caseData.court?.name}</strong> ({caseData.courtEstablishment || caseData.court?.establishment})
            </span>
            {caseData.court?.courtHallNo && (
              <span>• Hall: <strong>{caseData.court.courtHallNo}</strong></span>
            )}
            {caseData.judgeDesignation && (
              <span>• Bench: <strong>{caseData.judgeDesignation}</strong></span>
            )}
          </div>
        </div>

        {/* Right Side: Next Hearing Card & Sync */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="p-2.5 sm:p-3 bg-amber-50/70 border border-amber-200 rounded-lg flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-amber-600 text-white flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <span>Next Hearing</span>
                {caseData.dateVerification === 'OFFICIAL_VERIFIED' ? (
                  <span className="text-[10px] text-emerald-700 font-mono font-bold flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Verified
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono">
                    Manual
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-slate-900 truncate">
                {nextHearingDateStr}
              </div>
              <div className="text-xs text-slate-600 truncate max-w-full sm:max-w-[200px]">
                {caseData.nextHearingPurpose || 'Proceedings'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {onEditCase && (
              <button
                onClick={onEditCase}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-2xs transition-colors"
                title="Edit Case Details & Strategy"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                <span>Edit Case</span>
              </button>
            )}

            {onOpenECourtsSync && (
              <button
                onClick={onOpenECourtsSync}
                className="flex-1 sm:flex-initial px-3 py-2 text-xs font-semibold text-navy bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg shadow-2xs transition-colors text-center"
              >
                eCourts Sync
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
