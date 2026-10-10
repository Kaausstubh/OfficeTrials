import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { X, Check, Loader2, FileCheck2, AlertTriangle } from 'lucide-react';

interface AddExhibitModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  onSuccess: () => void;
}

export const AddExhibitModal: React.FC<AddExhibitModalProps> = ({
  isOpen,
  onClose,
  caseId,
  onSuccess,
}) => {
  const [exhibitNumber, setExhibitNumber] = useState('');
  const [description, setDescription] = useState('');
  const [markedBy, setMarkedBy] = useState('Prosecution');
  const [markingDate, setMarkingDate] = useState(new Date().toISOString().split('T')[0]);
  const [objectionRaised, setObjectionRaised] = useState(false);
  const [objectionDetails, setObjectionDetails] = useState('');
  const [custodyDetails, setCustodyDetails] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exhibitNumber.trim() || !description.trim()) {
      setError('Exhibit Number and Description are required.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await apiClient.post(`/cases/${caseId}/exhibits`, {
        exhibitNumber: exhibitNumber.trim(),
        description: description.trim(),
        markedBy: markedBy.trim(),
        markingDate: markingDate || undefined,
        objectionRaised,
        objectionDetails: objectionRaised ? objectionDetails.trim() : undefined,
        custodyDetails: custodyDetails.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to mark exhibit.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-navy-dark">
                Mark Trial Evidence / Exhibit
              </h3>
              <p className="text-xs text-slate-500">
                Register exhibit marking, custody chain, and formal objections
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

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Exhibit Number *</label>
              <input
                type="text"
                value={exhibitNumber}
                onChange={e => setExhibitNumber(e.target.value)}
                placeholder="e.g. Exh P-4 or Exh D-2"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Marked By Party *</label>
              <select
                value={markedBy}
                onChange={e => setMarkedBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="Prosecution">Prosecution</option>
                <option value="Defence">Defence</option>
                <option value="Petitioner">Petitioner</option>
                <option value="Respondent">Respondent</option>
                <option value="Court">Court Marked</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Marking Date</label>
            <input
              type="date"
              value={markingDate}
              onChange={e => setMarkingDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Description of Evidence / Document *</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Original Chemical Analyser Report No. 412/2021 regarding blood grouping on seized weapon..."
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Chain of Custody / Muddayamal Location</label>
            <input
              type="text"
              value={custodyDetails}
              onChange={e => setCustodyDetails(e.target.value)}
              placeholder="e.g. Muddayamal Property Room No. 4 / Sessions File A"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          {/* Objection Section */}
          <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
              <input
                type="checkbox"
                checked={objectionRaised}
                onChange={e => setObjectionRaised(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Formal Legal Objection Raised during Marking</span>
              </span>
            </label>

            {objectionRaised && (
              <div className="space-y-1 pt-1">
                <label className="font-semibold text-slate-700 block text-[11px]">
                  Objection Grounds & Judicial Order
                </label>
                <textarea
                  rows={2}
                  value={objectionDetails}
                  onChange={e => setObjectionDetails(e.target.value)}
                  placeholder="e.g. Objected under Section 65B of Evidence Act for lack of certificate; objection kept open by Court..."
                  className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs"
                />
              </div>
            )}
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
                  <span>Marking Exhibit...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mark & Record Exhibit</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
