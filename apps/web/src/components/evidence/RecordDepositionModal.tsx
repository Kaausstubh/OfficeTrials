import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { X, Check, Loader2, BookOpen, CheckCircle2, AlertCircle } from 'lucide-react';

interface RecordDepositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  witnesses: any[];
  defaultWitnessId?: string;
  onSuccess: () => void;
}

export const RecordDepositionModal: React.FC<RecordDepositionModalProps> = ({
  isOpen,
  onClose,
  caseId,
  witnesses,
  defaultWitnessId,
  onSuccess,
}) => {
  const [witnessId, setWitnessId] = useState(defaultWitnessId || (witnesses[0]?.id || ''));
  const [examinationType, setExaminationType] = useState('CROSS_EXAMINATION');
  const [depositionDate, setDepositionDate] = useState(new Date().toISOString().split('T')[0]);
  const [transcriptSummary, setTranscriptSummary] = useState('');
  const [keyAdmissions, setKeyAdmissions] = useState('');
  const [contradictions, setContradictions] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!witnessId) {
      setError('Please select a witness.');
      return;
    }
    if (!transcriptSummary.trim()) {
      setError('Transcript summary of testimony is required.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await apiClient.post(`/cases/${caseId}/witnesses/${witnessId}/depositions`, {
        examinationType,
        depositionDate,
        transcriptSummary: transcriptSummary.trim(),
        keyAdmissions: keyAdmissions.trim() || undefined,
        contradictions: contradictions.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to record deposition.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-navy-dark">
                Record Witness Deposition & Cross
              </h3>
              <p className="text-xs text-slate-500">
                Log examination testimony, key admissions, and marked contradictions
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

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs flex-1 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Select Witness *</label>
            <select
              value={witnessId}
              onChange={e => setWitnessId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
            >
              {witnesses.map(w => (
                <option key={w.id} value={w.id}>
                  {w.witnessNumber} — {w.name} ({w.witnessType})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Examination Stage *</label>
              <select
                value={examinationType}
                onChange={e => setExaminationType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="EXAMINATION_IN_CHIEF">Examination-in-Chief</option>
                <option value="CROSS_EXAMINATION">Cross-Examination</option>
                <option value="RE_EXAMINATION">Re-Examination</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Deposition Date *</label>
              <input
                type="date"
                value={depositionDate}
                onChange={e => setDepositionDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Deposition Transcript Summary *</label>
            <textarea
              rows={3}
              value={transcriptSummary}
              onChange={e => setTranscriptSummary(e.target.value)}
              placeholder="Summary of answers, evidence tendered, and questions put to witness..."
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
            />
          </div>

          <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-200 space-y-1">
            <label className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Key Admissions Elicited (Beneficial to Defence / Strategy)</span>
            </label>
            <textarea
              rows={2}
              value={keyAdmissions}
              onChange={e => setKeyAdmissions(e.target.value)}
              placeholder="e.g. Admitted visibility was impaired by heavy rain and streetlights were non-functional..."
              className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs"
            />
          </div>

          <div className="p-3 bg-rose-50/50 rounded-lg border border-rose-200 space-y-1">
            <label className="font-semibold text-rose-900 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Material Contradictions / Omissions Marked</span>
            </label>
            <textarea
              rows={2}
              value={contradictions}
              onChange={e => setContradictions(e.target.value)}
              placeholder="e.g. Contradiction marked with Police Statement under Sec 161 (Exh D-1) regarding who held the sharp weapon..."
              className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-xs"
            />
          </div>

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
                  <span>Recording Deposition...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Save Deposition Notes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
