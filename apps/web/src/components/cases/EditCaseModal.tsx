import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Case, ProceduralStage, CasePriority } from '../../types';
import { X, Check, Loader2, Edit3, Shield, Calendar, Scale } from 'lucide-react';

interface EditCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseData: Case;
  onSuccess: () => void;
}

export const EditCaseModal: React.FC<EditCaseModalProps> = ({
  isOpen,
  onClose,
  caseData,
  onSuccess,
}) => {
  const [title, setTitle] = useState(caseData.title || '');
  const [caseNumber, setCaseNumber] = useState(caseData.caseNumber || '');
  const [internalCaseNo, setInternalCaseNo] = useState(caseData.internalCaseNo || '');
  const [cnrNumber, setCnrNumber] = useState(caseData.cnrNumber || '');
  const [proceduralStage, setProceduralStage] = useState<ProceduralStage>(caseData.proceduralStage);
  const [priority, setPriority] = useState<CasePriority>(caseData.priority);
  const [nextHearingDate, setNextHearingDate] = useState(
    caseData.nextHearingDate ? new Date(caseData.nextHearingDate).toISOString().split('T')[0] : ''
  );
  const [nextHearingPurpose, setNextHearingPurpose] = useState(caseData.nextHearingPurpose || '');
  const [statutoryActs, setStatutoryActs] = useState(caseData.statutoryActs || '');
  const [statutorySections, setStatutorySections] = useState(caseData.statutorySections || '');
  const [policeStation, setPoliceStation] = useState(caseData.policeStation || '');
  const [firNumber, setFirNumber] = useState(caseData.firNumber || '');
  const [firYear, setFirYear] = useState<number | undefined>(caseData.firYear);
  const [judgeDesignation, setJudgeDesignation] = useState(caseData.judgeDesignation || '');
  const [courtEstablishment, setCourtEstablishment] = useState(caseData.courtEstablishment || '');
  const [description, setDescription] = useState(caseData.description || '');
  const [privateNotes, setPrivateNotes] = useState(caseData.privateNotes || '');
  const [clientGuidanceNotes, setClientGuidanceNotes] = useState(caseData.clientGuidanceNotes || '');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (caseData) {
      setTitle(caseData.title || '');
      setCaseNumber(caseData.caseNumber || '');
      setInternalCaseNo(caseData.internalCaseNo || '');
      setCnrNumber(caseData.cnrNumber || '');
      setProceduralStage(caseData.proceduralStage);
      setPriority(caseData.priority);
      setNextHearingDate(
        caseData.nextHearingDate
          ? new Date(caseData.nextHearingDate).toISOString().split('T')[0]
          : ''
      );
      setNextHearingPurpose(caseData.nextHearingPurpose || '');
      setStatutoryActs(caseData.statutoryActs || '');
      setStatutorySections(caseData.statutorySections || '');
      setPoliceStation(caseData.policeStation || '');
      setFirNumber(caseData.firNumber || '');
      setFirYear(caseData.firYear);
      setJudgeDesignation(caseData.judgeDesignation || '');
      setCourtEstablishment(caseData.courtEstablishment || '');
      setDescription(caseData.description || '');
      setPrivateNotes(caseData.privateNotes || '');
      setClientGuidanceNotes(caseData.clientGuidanceNotes || '');
    }
  }, [caseData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !caseNumber.trim()) {
      setError('Case Title and Case Number are required.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await apiClient.patch(`/cases/${caseData.id}`, {
        title: title.trim(),
        caseNumber: caseNumber.trim(),
        internalCaseNo: internalCaseNo.trim(),
        cnrNumber: cnrNumber.trim().toUpperCase() || undefined,
        proceduralStage,
        priority,
        nextHearingDate: nextHearingDate ? nextHearingDate : null,
        nextHearingPurpose: nextHearingPurpose.trim() || undefined,
        statutoryActs: statutoryActs.trim() || undefined,
        statutorySections: statutorySections.trim() || undefined,
        policeStation: policeStation.trim() || undefined,
        firNumber: firNumber.trim() || undefined,
        firYear: firYear ? Number(firYear) : undefined,
        judgeDesignation: judgeDesignation.trim() || undefined,
        courtEstablishment: courtEstablishment.trim() || undefined,
        description: description.trim() || undefined,
        privateNotes: privateNotes.trim() || undefined,
        clientGuidanceNotes: clientGuidanceNotes.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to update case details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-navy-dark">
                Edit Case Details & Practice Parameters
              </h3>
              <p className="text-xs text-slate-500">
                Modify title, procedural stage, next dates, statutory sections, and confidential notes
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs">
              {error}
            </div>
          )}

          {/* Basic Case Identifiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-1">
              <label className="font-semibold text-slate-700">Case Title / Cause Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. State of Maharashtra v. Anandrao Patil"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Priority Level</label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Official Case Number *</label>
              <input
                type="text"
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
                placeholder="e.g. Sessions Case No. 2059/2021"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Internal Chamber Ref</label>
              <input
                type="text"
                value={internalCaseNo}
                onChange={e => setInternalCaseNo(e.target.value)}
                placeholder="e.g. MH-SAT-SESS-2059-2021"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">16-Digit CNR Number</label>
              <input
                type="text"
                value={cnrNumber}
                onChange={e => setCnrNumber(e.target.value.toUpperCase())}
                placeholder="e.g. MHST010020592021"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>

          {/* Procedural Stage & Hearing Scheduling */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              <span>Procedural Stage & Next Hearing Diary</span>
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Current Procedural Stage</label>
                <select
                  value={proceduralStage}
                  onChange={e => setProceduralStage(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-medium"
                >
                  <option value="PRE_FILING_CONSULTATION">Pre-Filing Consultation</option>
                  <option value="FILING_DEFECT_SCRUTINY">Filing Defect Scrutiny</option>
                  <option value="PRE_ADMISSION_HEARING">Pre-Admission Hearing</option>
                  <option value="NOTICE_SUMMONS_ISSUED">Notice / Summons Issued</option>
                  <option value="WRITTEN_STATEMENT_REPLY">Written Statement / Reply</option>
                  <option value="FRAMING_OF_ISSUES_CHARGES">Framing of Issues / Charges</option>
                  <option value="PETITIONER_PROSECUTION_EVIDENCE">Petitioner / Prosecution Evidence</option>
                  <option value="RESPONDENT_DEFENCE_EVIDENCE">Respondent / Defence Evidence</option>
                  <option value="FINAL_ARGUMENTS">Final Arguments</option>
                  <option value="JUDGMENT_RESERVED">Judgment Reserved</option>
                  <option value="DISPOSED_DECREED">Disposed - Decreed / Allowed</option>
                  <option value="DISPOSED_DISMISSED">Disposed - Dismissed</option>
                  <option value="POST_DISPOSAL_COMPLIANCE">Post Disposal Compliance</option>
                  <option value="APPEAL_EXECUTION_STAY">Appeal / Execution Stay</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Next Hearing Date</label>
                <input
                  type="date"
                  value={nextHearingDate}
                  onChange={e => setNextHearingDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Next Hearing Purpose</label>
                <input
                  type="text"
                  value={nextHearingPurpose}
                  onChange={e => setNextHearingPurpose(e.target.value)}
                  placeholder="e.g. Cross-Examination of PW-2 Dr. Kadam"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Statutory & Criminal/Civil Framework */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Statutory Acts / Legislation</label>
              <input
                type="text"
                value={statutoryActs}
                onChange={e => setStatutoryActs(e.target.value)}
                placeholder="e.g. IPC, 1860; CrPC, 1973; Indian Evidence Act"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Specific Statutory Sections</label>
              <input
                type="text"
                value={statutorySections}
                onChange={e => setStatutorySections(e.target.value)}
                placeholder="e.g. IPC 307, 326, 324, 147, 148, 149"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Police Station</label>
              <input
                type="text"
                value={policeStation}
                onChange={e => setPoliceStation(e.target.value)}
                placeholder="e.g. Karad City Police Station"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">FIR / Crime Number</label>
              <input
                type="text"
                value={firNumber}
                onChange={e => setFirNumber(e.target.value)}
                placeholder="e.g. 142/2021"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">FIR Year</label>
              <input
                type="number"
                value={firYear || ''}
                onChange={e => setFirYear(e.target.value ? Number(e.target.value) : undefined)}
                placeholder="2021"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Judge / Bench Designation</label>
              <input
                type="text"
                value={judgeDesignation}
                onChange={e => setJudgeDesignation(e.target.value)}
                placeholder="e.g. Hon’ble Additional Sessions Judge-1, Satara (Court Hall 3)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Court Complex / Establishment</label>
              <input
                type="text"
                value={courtEstablishment}
                onChange={e => setCourtEstablishment(e.target.value)}
                placeholder="e.g. District & Sessions Court Complex, Sadar Bazar, Satara"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Case Description & Brief</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Summary of allegations, factual background, or relief claimed..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Confidential Strategy Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-rose-600" />
              <span>Chamber Confidential Strategy Notes (Never shared with Client)</span>
            </label>
            <textarea
              rows={3}
              value={privateNotes}
              onChange={e => setPrivateNotes(e.target.value)}
              placeholder="Cross-examination focus points, witness weaknesses, case diary objections..."
              className="w-full px-3 py-2 bg-amber-50/40 border border-amber-200 rounded-lg font-mono text-[11px]"
            />
          </div>

          {/* Client Guidance Notes */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Client Instructions & Court Advice</label>
            <textarea
              rows={2}
              value={clientGuidanceNotes}
              onChange={e => setClientGuidanceNotes(e.target.value)}
              placeholder="Instructions visible in client portal (e.g. report to court at 10:15 AM with surety documents)..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Footer Buttons */}
          <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-white/95 backdrop-blur-xs p-3 sm:p-4 border-t border-slate-200 flex items-center justify-end gap-2 shadow-sm z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg font-semibold text-slate-700 text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial px-5 py-2 bg-navy hover:bg-navy-light text-white font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Save Case Updates</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
