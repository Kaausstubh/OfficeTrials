import React, { useState } from 'react';
import { apiClient } from '../../api/client';
import { X, Check, Loader2, Users2 } from 'lucide-react';

interface AddWitnessModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId: string;
  onSuccess: () => void;
}

export const AddWitnessModal: React.FC<AddWitnessModalProps> = ({
  isOpen,
  onClose,
  caseId,
  onSuccess,
}) => {
  const [witnessNumber, setWitnessNumber] = useState('');
  const [name, setName] = useState('');
  const [witnessType, setWitnessType] = useState('PROSECUTION_WITNESS');
  const [currentStage, setCurrentStage] = useState('NOT_EXAMINED');
  const [testimonySummary, setTestimonySummary] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [remarks, setRemarks] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!witnessNumber.trim() || !name.trim()) {
      setError('Witness number and Name are required.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await apiClient.post(`/cases/${caseId}/witnesses`, {
        witnessNumber: witnessNumber.trim().toUpperCase(),
        name: name.trim(),
        witnessType,
        currentStage,
        testimonySummary: testimonySummary.trim() || undefined,
        mobile: mobile.trim() || undefined,
        address: address.trim() || undefined,
        remarks: remarks.trim() || undefined,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to add witness.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
              <Users2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-navy-dark">
                Add Trial Witness Record
              </h3>
              <p className="text-xs text-slate-500">
                Register witness identifier, examination stage, and contact details
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
              <label className="font-semibold text-slate-700">Witness No *</label>
              <input
                type="text"
                value={witnessNumber}
                onChange={e => setWitnessNumber(e.target.value)}
                placeholder="e.g. PW-4 or DW-2"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Witness Type</label>
              <select
                value={witnessType}
                onChange={e => setWitnessType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="PROSECUTION_WITNESS">Prosecution Witness (PW)</option>
                <option value="DEFENCE_WITNESS">Defence Witness (DW)</option>
                <option value="EXPERT_WITNESS">Expert Witness (Medical / Forensic)</option>
                <option value="COURT_WITNESS">Court Witness (CW)</option>
                <option value="CHARACTER_WITNESS">Character Witness</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Dr. Satish R. Bhosale"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Current Examination Stage</label>
              <select
                value={currentStage}
                onChange={e => setCurrentStage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
              >
                <option value="NOT_EXAMINED">Not Examined / Summoned</option>
                <option value="EXAMINATION_IN_CHIEF">Examination-in-Chief Active</option>
                <option value="CROSS_EXAMINATION">Cross-Examination Active</option>
                <option value="RE_EXAMINATION">Re-Examination</option>
                <option value="COMPLETED">Deposition Concluded</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-700">Mobile Number</label>
              <input
                type="text"
                value={mobile}
                onChange={e => setMobile(e.target.value)}
                placeholder="+91 98XXX XXXXX"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono text-[11px]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Residential / Office Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. Satara Civil Hospital, Forensic Wing"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Testimony Summary & Role</label>
            <textarea
              rows={2}
              value={testimonySummary}
              onChange={e => setTestimonySummary(e.target.value)}
              placeholder="Key facts to be proven or rebutted during trial examination..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-slate-700">Advocate Notes / Cross Plan</label>
            <textarea
              rows={2}
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Private instructions, cross-examination line of questioning..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
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
                  <span>Adding Witness...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                  <span>Register Witness</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
