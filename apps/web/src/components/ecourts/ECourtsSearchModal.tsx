import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import {
  Search,
  Building2,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Briefcase,
  Users2,
  FileCheck2,
} from 'lucide-react';

interface ECourtsSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  defaultCnr?: string;
  onImportComplete?: () => void;
}

export const ECourtsSearchModal: React.FC<ECourtsSearchModalProps> = ({
  isOpen,
  onClose,
  caseId,
  defaultCnr,
  onImportComplete,
}) => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'cnr' | 'caseNumber'>('cnr');
  const [cnrNumber, setCnrNumber] = useState(defaultCnr || '');
  const [caseNumber, setCaseNumber] = useState('');
  const [courtName, setCourtName] = useState('High Court of Delhi');

  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);

  // Import to Chambers State
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Comparison Diff State
  const [diffData, setDiffData] = useState<any | null>(null);
  const [applyDateUpdate, setApplyDateUpdate] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResults([]);
    setSelectedRecord(null);
    setDiffData(null);
    setSyncSuccess(false);

    try {
      const params = searchType === 'cnr' ? { cnrNumber } : { caseNumber, courtName };
      const res = await apiClient.get('/ecourts/search', { params });
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRecord = async (rec: any) => {
    setSelectedRecord(rec);
    if (caseId) {
      try {
        const res = await apiClient.post('/ecourts/compare', {
          caseId,
          importedData: rec,
        });
        setDiffData(res.data.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSyncToCase = async () => {
    if (!caseId || !selectedRecord) return;
    try {
      setIsSyncing(true);
      await apiClient.post('/ecourts/sync', {
        caseId,
        importedData: selectedRecord,
        applyDateUpdate,
      });
      setSyncSuccess(true);
      if (onImportComplete) onImportComplete();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleImportToChambers = async () => {
    if (!selectedRecord) return;
    try {
      setIsImporting(true);
      const res = await apiClient.post('/ecourts/import-to-chambers', {
        cnrNumber: selectedRecord.cnrNumber,
      });
      setImportSuccess(true);
      if (onImportComplete) onImportComplete();
      setTimeout(() => {
        onClose();
        navigate(`/cases/${res.data.data.id}`);
      }, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="font-serif font-bold text-base sm:text-lg text-navy-dark">
                eCourts Case Discovery & Synchronization
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Direct integration interface with eCourts Services, CIS 3.2, and NJDG registries
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-3 sm:p-6 border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-4 mb-2.5">
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                name="searchType"
                checked={searchType === 'cnr'}
                onChange={() => setSearchType('cnr')}
              />
              <span>16-Digit CNR Number</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="radio"
                name="searchType"
                checked={searchType === 'caseNumber'}
                onChange={() => setSearchType('caseNumber')}
              />
              <span>Court & Case No</span>
            </label>
          </div>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 sm:gap-2.5">
            {searchType === 'cnr' ? (
              <input
                type="text"
                value={cnrNumber}
                onChange={e => setCnrNumber(e.target.value.toUpperCase())}
                placeholder="Enter CNR (e.g. DLHC010045232023 or BOMC010088912022)"
                className="flex-1 px-3.5 py-2.5 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            ) : (
              <div className="flex-1 flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={caseNumber}
                  onChange={e => setCaseNumber(e.target.value)}
                  placeholder="Case Number (e.g. CS(COMM) 452/2023)"
                  className="flex-1 px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                />
                <select
                  value={courtName}
                  onChange={e => setCourtName(e.target.value)}
                  className="w-full sm:w-56 px-3 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg"
                >
                  <option value="High Court of Delhi">High Court of Delhi</option>
                  <option value="High Court of Bombay">High Court of Bombay</option>
                  <option value="Sessions Court, Greater Mumbai">Sessions Court, Mumbai</option>
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-navy hover:bg-navy-light rounded-lg shadow-xs flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>Querying Registry...</span>
                </>
              ) : (
                <>
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>Search eCourts</span>
                </>
              )}
            </button>
          </form>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Quick CNR Presets:</span>
            <button
              type="button"
              onClick={() => {
                setSearchType('cnr');
                setCnrNumber('MHST010020592021');
              }}
              className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[10px] font-semibold transition-colors flex items-center gap-1"
            >
              <span>MHST010020592021</span>
              <span className="text-amber-700 font-sans">(Satara Sessions Trial)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchType('cnr');
                setCnrNumber('DLHC010045232023');
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[10px] transition-colors"
            >
              DLHC010045232023 (Delhi High Court)
            </button>
            <button
              type="button"
              onClick={() => {
                setSearchType('cnr');
                setCnrNumber('BOMC010088912022');
              }}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-mono text-[10px] transition-colors"
            >
              BOMC010088912022 (Bombay High Court)
            </button>
          </div>
        </div>

        {/* Results & Comparison View */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-6 bg-slate-50/50">
          {/* Results List */}
          <div className="md:col-span-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Registry Search Results ({results.length})
            </h4>

            {results.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-lg text-xs text-slate-400">
                Enter a CNR number or case number above to query real-time court records.
              </div>
            ) : (
              results.map((rec, i) => (
                <div
                  key={i}
                  onClick={() => handleSelectRecord(rec)}
                  className={`p-4 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedRecord?.cnrNumber === rec.cnrNumber
                      ? 'bg-amber-50/60 border-amber-400 shadow-xs ring-1 ring-amber-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 mb-1">
                    <span>{rec.caseNumber}</span>
                    <span className="font-mono text-[10px] text-amber-900 bg-amber-100 px-1.5 py-0.5 rounded">
                      {rec.cnrNumber}
                    </span>
                  </div>

                  <div className="text-slate-600 space-y-0.5 text-[11px]">
                    <div>Court: <strong>{rec.courtName}</strong></div>
                    <div>Parties: <strong>{rec.petitioner}</strong> v. <strong>{rec.respondent}</strong></div>
                    <div className="flex items-center gap-1 text-emerald-700 font-semibold pt-1">
                      <Calendar className="w-3 h-3" />
                      <span>Next Hearing: {rec.nextHearingDate} ({rec.nextHearingPurpose})</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Diff / Verification Preview */}
          <div className="md:col-span-6 bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
            {selectedRecord ? (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
                    Official eCourts Record Verified
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-1">
                    {selectedRecord.caseNumber}
                  </h4>
                  <p className="text-xs text-slate-500">{selectedRecord.judgeDesignation}</p>
                </div>

                {/* Field-by-Field Diff Box */}
                {diffData && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                      Field Discrepancy Comparison
                    </span>
                    <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                      {diffData.differences.map((d: any, idx: number) => (
                        <div
                          key={idx}
                          className={`p-2.5 flex items-center justify-between border-b last:border-b-0 ${
                            d.isDifferent ? 'bg-amber-50/50' : 'bg-white'
                          }`}
                        >
                          <div>
                            <span className="font-semibold text-slate-700 block text-[11px]">
                              {d.field}
                            </span>
                            <span className="text-slate-500 text-[10px]">
                              Current Local: {d.localValue}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-900 block text-[11px]">
                              {d.courtValue}
                            </span>
                            {d.isDifferent && (
                              <span className="text-[9px] text-amber-700 font-bold">
                                Update Available
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <label className="flex items-center gap-2 pt-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyDateUpdate}
                        onChange={e => setApplyDateUpdate(e.target.checked)}
                        className="rounded text-amber-600"
                      />
                      <span>Synchronize Next Hearing Date & Mark as Officially Verified</span>
                    </label>
                  </div>
                )}

                {/* Trial Evidence & Practice Integration Badge */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-2">
                  <div className="font-bold text-slate-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                      <span>Ready for Active Practice Workflow</span>
                    </span>
                    <span className="text-[10px] text-emerald-800 bg-emerald-100 font-bold px-1.5 py-0.5 rounded">
                      eCourts Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                    <div className="flex items-center gap-1">
                      <Users2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Witnesses & Depositions Ready</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileCheck2 className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Marked Exhibits & Chain of Custody</span>
                    </div>
                  </div>
                </div>

                {/* Import & Open in Chambers Button */}
                <div className="space-y-2 pt-2 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleImportToChambers}
                    disabled={isImporting || importSuccess}
                    className="w-full py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {importSuccess ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                        <span>Imported Successfully! Opening Case File...</span>
                      </>
                    ) : isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Registering Case, Witnesses & Exhibits...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 text-emerald-300" />
                        <span>Import & Open Case in Practice</span>
                      </>
                    )}
                  </button>

                  {/* Sync to Existing Local Case Button (if caseId is open) */}
                  {caseId && (
                    <button
                      type="button"
                      onClick={handleSyncToCase}
                      disabled={isSyncing || syncSuccess}
                      className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-2xs flex items-center justify-center gap-2 transition-all"
                    >
                      {syncSuccess ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Synchronized Successfully!</span>
                        </>
                      ) : isSyncing ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-600" />
                          <span>Updating Case Records...</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                          <span>Update Current Case Metadata Only</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center p-8 text-slate-400 text-xs">
                Select a matching court record from the left to review metadata differences before applying.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
