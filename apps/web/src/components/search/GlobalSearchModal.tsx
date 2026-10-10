import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import {
  Search,
  X,
  Briefcase,
  FileText,
  Calendar,
  Users,
  Building2,
  ArrowRight,
  Loader2,
} from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>({
    cases: [],
    documents: [],
    hearings: [],
    orders: [],
    witnesses: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        // Toggle or open modal
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults({ cases: [], documents: [], hearings: [], orders: [], witnesses: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsLoading(true);
        const res = await apiClient.get('/search', { params: { q: query } });
        setResults(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.cases.length +
    results.documents.length +
    results.hearings.length +
    results.orders.length +
    results.witnesses.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/60 backdrop-blur-xs pt-4 sm:pt-20 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[88vh] sm:max-h-[75vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Search Input Bar */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center gap-2.5 sm:gap-3 bg-slate-50">
          <Search className="w-4 sm:w-5 h-4 sm:h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cases, CNR, parties, documents, OCR..."
            className="flex-1 bg-transparent text-xs sm:text-sm focus:outline-hidden text-slate-900 placeholder:text-slate-400"
          />
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-amber-500 shrink-0" />}
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {query.length >= 2 && totalResults === 0 && !isLoading && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching legal records found for "{query}".
            </div>
          )}

          {/* Cases Results */}
          {results.cases.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Cases ({results.cases.length})
              </span>
              <div className="space-y-1">
                {results.cases.map((c: any) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      navigate(`/cases/${c.id}`);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-amber-50/70 rounded-lg border border-slate-100 hover:border-amber-200 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <span>{c.caseNumber}</span>
                        {c.cnrNumber && (
                          <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-1 py-0.2 rounded">
                            {c.cnrNumber}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-500 text-[11px] truncate max-w-md">
                        {c.title} • {c.court?.name}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Documents with Extracted Text Snippets */}
          {results.documents.length > 0 && (
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Digitized Documents & OCR Matches ({results.documents.length})
              </span>
              <div className="space-y-1">
                {results.documents.map((d: any) => (
                  <div
                    key={d.id}
                    onClick={() => {
                      navigate(`/cases/${d.case.id}`);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-indigo-50/70 rounded-lg border border-slate-100 hover:border-indigo-200 cursor-pointer text-xs transition-colors"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        {d.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {d.case.caseNumber}
                      </span>
                    </div>
                    {d.extractedPages?.[0] && (
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-1 italic bg-white p-1 rounded border border-slate-100">
                        "...{d.extractedPages[0].extractedText.slice(0, 140)}..."
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
