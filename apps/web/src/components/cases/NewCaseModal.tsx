import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { Court, CaseType, ProceduralStage, CasePriority } from '../../types';
import { X, Plus, Check, Loader2 } from 'lucide-react';

interface NewCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NewCaseModal: React.FC<NewCaseModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [internalCaseNo, setInternalCaseNo] = useState(`ACD/${new Date().getFullYear()}/CS-${Math.floor(100 + Math.random() * 900)}`);
  const [caseNumber, setCaseNumber] = useState('');
  const [cnrNumber, setCnrNumber] = useState('');
  const [caseType, setCaseType] = useState<CaseType>('COMMERCIAL_DISPUTE');
  const [registrationYear, setRegistrationYear] = useState(new Date().getFullYear());
  const [courtId, setCourtId] = useState('');
  const [courts, setCourts] = useState<Court[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [statutoryActs, setStatutoryActs] = useState('');
  const [statutorySections, setStatutorySections] = useState('');
  const [priority, setPriority] = useState<CasePriority>('MEDIUM');
  const [petitionerName, setPetitionerName] = useState('');
  const [respondentName, setRespondentName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [nextHearingDate, setNextHearingDate] = useState('');
  const [nextHearingPurpose, setNextHearingPurpose] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCourts();
    }
  }, [isOpen]);

  const loadCourts = async () => {
    try {
      const res = await apiClient.get('/cases/courts/list');
      setCourts(res.data.data);
      if (res.data.data.length > 0 && !courtId) {
        setCourtId(res.data.data[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtId || !caseNumber.trim() || !title.trim()) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const parties = [];
      if (petitionerName.trim()) {
        parties.push({
          partyType: 'PLAINTIFF',
          name: petitionerName.trim(),
          isOurClient: true,
          email: clientEmail.trim() || undefined,
        });
      }
      if (respondentName.trim()) {
        parties.push({
          partyType: 'DEFENDANT',
          name: respondentName.trim(),
          isOurClient: false,
        });
      }

      await apiClient.post('/cases', {
        internalCaseNo,
        caseNumber,
        cnrNumber: cnrNumber.trim() || undefined,
        caseType,
        registrationYear: Number(registrationYear),
        courtId,
        title,
        description,
        statutoryActs: statutoryActs || undefined,
        statutorySections: statutorySections || undefined,
        priority,
        nextHearingDate: nextHearingDate ? new Date(nextHearingDate).toISOString() : undefined,
        nextHearingPurpose: nextHearingPurpose || undefined,
        privateNotes: privateNotes || undefined,
        parties,
      });

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create case.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 w-full max-w-3xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-serif font-bold text-base sm:text-lg text-navy-dark">
              Register New Litigation Case
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter court identifiers, litigating parties, and practice brief
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Internal Case ID *
              </label>
              <input
                type="text"
                required
                value={internalCaseNo}
                onChange={e => setInternalCaseNo(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Court Case Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. CS(COMM) 102/2024"
                value={caseNumber}
                onChange={e => setCaseNumber(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                CNR Number (Optional)
              </label>
              <input
                type="text"
                placeholder="16-Digit eCourts CNR"
                value={cnrNumber}
                onChange={e => setCnrNumber(e.target.value.toUpperCase())}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Court Complex *
              </label>
              <select
                value={courtId}
                onChange={e => setCourtId(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              >
                {courts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Case Type *
              </label>
              <select
                value={caseType}
                onChange={e => setCaseType(e.target.value as CaseType)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              >
                <option value="COMMERCIAL_DISPUTE">Commercial Dispute</option>
                <option value="WRIT_PETITION">Writ Petition</option>
                <option value="CRIMINAL_CASE">Criminal Case</option>
                <option value="CIVIL_SUIT">Civil Suit</option>
                <option value="FAMILY_MATRIMONIAL">Family / Matrimonial</option>
                <option value="CONSUMER_DISPUTE">Consumer Dispute</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Case Priority *
              </label>
              <select
                value={priority}
                onChange={e => setPriority(e.target.value as CasePriority)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Case Title / Cause Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Apex Logistics Pvt. Ltd. v. Vanguard Industrial Supply Corp."
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Plaintiff / Petitioner (Our Client)
              </label>
              <input
                type="text"
                placeholder="Petitioner or complainant name"
                value={petitionerName}
                onChange={e => setPetitionerName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Defendant / Respondent
              </label>
              <input
                type="text"
                placeholder="Respondent or accused name"
                value={respondentName}
                onChange={e => setRespondentName(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Statutory Provisions / Acts
              </label>
              <input
                type="text"
                placeholder="e.g. Commercial Courts Act, 2015; CPC 1908"
                value={statutoryActs}
                onChange={e => setStatutoryActs(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Specific Sections
              </label>
              <input
                type="text"
                placeholder="e.g. Sec 2(1)(c), Order VII Rule 1"
                value={statutorySections}
                onChange={e => setStatutorySections(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Next Hearing Date
              </label>
              <input
                type="date"
                value={nextHearingDate}
                onChange={e => setNextHearingDate(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Hearing Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Pre-admission, Framing of Issues"
                value={nextHearingPurpose}
                onChange={e => setNextHearingPurpose(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Confidential Advocate Strategy Notes
            </label>
            <textarea
              rows={2}
              placeholder="Private notes (never shared with clients or external portals)..."
              value={privateNotes}
              onChange={e => setPrivateNotes(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-md"
            />
          </div>

          <div className="sticky bottom-0 -mx-4 -mb-4 sm:-mx-6 sm:-mb-6 bg-white/95 backdrop-blur-xs p-3 sm:p-4 border-t border-slate-200 flex items-center justify-end gap-2 shadow-sm z-10">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 font-semibold text-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-initial px-5 py-2 font-bold text-white bg-navy hover:bg-navy-light rounded-lg shadow-sm flex items-center justify-center gap-1.5"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>Save Case to Register</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
