import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import {
  Sparkles,
  X,
  Send,
  FileText,
  Calendar,
  AlertCircle,
  ExternalLink,
  Loader2,
  CheckCircle,
  Briefcase,
} from 'lucide-react';

interface AIAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  caseNumber?: string;
}

export const AIAssistantDrawer: React.FC<AIAssistantDrawerProps> = ({
  isOpen,
  onClose,
  caseId,
  caseNumber,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any | null>(null);

  const [activeCaseId, setActiveCaseId] = useState<string>('');
  const [activeCaseNumber, setActiveCaseNumber] = useState<string>('');
  const [availableCases, setAvailableCases] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (!caseId || caseId === '1' || caseId.length < 10) {
        apiClient
          .get('/cases')
          .then(res => {
            const list = res.data.data || [];
            setAvailableCases(list);
            if (list.length > 0) {
              setActiveCaseId(list[0].id);
              setActiveCaseNumber(list[0].caseNumber);
            }
          })
          .catch(console.error);
      } else {
        setActiveCaseId(caseId);
        setActiveCaseNumber(caseNumber || '');
      }
    } else {
      setResponse(null);
      setPrompt('');
    }
  }, [isOpen, caseId, caseNumber]);

  const samplePrompts = [
    'What happened in the last court hearings?',
    'Find orders mentioning bail or interim relief',
    'Which witnesses have been cross-examined?',
    'Prepare a next-hearing preparation checklist',
  ];

  const handleQuery = async (queryText: string) => {
    if (!queryText.trim() || !activeCaseId) return;
    setIsLoading(true);
    setResponse(null);

    try {
      const res = await apiClient.post(`/ai/cases/${activeCaseId}/query`, {
        prompt: queryText,
      });
      setResponse(res.data.data);
    } catch (err: any) {
      console.error(err);
      setResponse({
        answer: 'Failed to process legal query. Please ensure case access permissions are active.',
        citations: [],
        disclaimer: 'AI outputs are drafts for professional verification.',
        suggestedActions: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full sm:max-w-lg h-[100dvh] bg-white shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-4 py-3 sm:px-5 sm:py-4 border-b border-indigo-900 bg-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 rounded-lg bg-indigo-800 text-indigo-300 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif font-bold text-sm tracking-tight truncate">
                AI Legal Assistant
              </h3>
              {availableCases.length > 0 ? (
                <select
                  value={activeCaseId}
                  onChange={e => {
                    setActiveCaseId(e.target.value);
                    const found = availableCases.find(c => c.id === e.target.value);
                    if (found) setActiveCaseNumber(found.caseNumber);
                  }}
                  className="mt-0.5 text-[11px] bg-indigo-900 text-indigo-100 rounded px-1.5 py-0.5 border border-indigo-700 font-mono truncate max-w-[200px]"
                >
                  {availableCases.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="text-[11px] text-indigo-200 truncate">
                  Scoped: <strong className="text-white">{activeCaseNumber}</strong>
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-indigo-300 hover:text-white rounded-lg hover:bg-indigo-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content messages */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* Sample Prompts */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Suggested Legal Queries
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setPrompt(p);
                    handleQuery(p);
                  }}
                  className="text-left text-xs p-2.5 rounded-lg bg-indigo-50/70 hover:bg-indigo-100/70 text-indigo-900 font-medium transition-colors border border-indigo-100 flex items-center justify-between group cursor-pointer"
                >
                  <span className="line-clamp-1">{p}</span>
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 group-hover:text-indigo-600 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="p-8 text-center space-y-3">
              <Loader2 className="w-7 h-7 text-indigo-600 animate-spin mx-auto" />
              <div className="text-xs font-semibold text-slate-700">
                Searching case orders, hearings, and OCR depositions...
              </div>
            </div>
          )}

          {/* AI Response Card */}
          {response && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 pb-1.5 border-b border-slate-200">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Verified Legal Findings</span>
              </div>

              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">
                {response.answer}
              </div>

              {/* Source Citations */}
              {response.citations && response.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-200">
                  <div className="text-[11px] font-bold text-slate-600 mb-1.5">
                    Source Citations:
                  </div>
                  <div className="space-y-1">
                    {response.citations.map((c: any, i: number) => (
                      <div
                        key={i}
                        className="text-[11px] p-2 bg-white rounded border border-slate-200 text-slate-600 flex items-start gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>{c.title}:</strong> {c.excerpt}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-2 rounded bg-amber-50/70 border border-amber-200 text-[10px] text-amber-900 flex items-start gap-1.5 leading-relaxed">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{response.disclaimer}</span>
              </div>
            </div>
          )}
        </div>

        {/* Query Input Box */}
        <div className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleQuery(prompt);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Ask anything about this case file..."
              className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={isLoading || !prompt.trim()}
              className="p-2.5 rounded-lg bg-navy hover:bg-navy-light text-white disabled:opacity-40 transition-colors shrink-0 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
