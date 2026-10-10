import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { CaseDocument } from '../types';
import { DocumentViewerModal } from '../components/viewer/DocumentViewerModal';
import {
  FileText,
  Search,
  Camera,
  Filter,
  Download,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DocumentsPageProps {
  onOpenScanner?: () => void;
}

export const DocumentsPage: React.FC<DocumentsPageProps> = ({ onOpenScanner }) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/cases/documents/all');
      const docs = res.data.data.map((d: any) => ({
        ...d,
        caseNumber: d.case?.caseNumber || d.caseNumber || 'General Chamber',
        caseTitle: d.case?.title || d.caseTitle || '',
      }));
      setDocuments(docs);
    } catch (err) {
      console.error(err);
      // Fallback
      try {
        const res = await apiClient.get('/cases');
        const allDocs: any[] = [];
        res.data.data.forEach((c: any) => {
          if (c.documents) {
            c.documents.forEach((d: any) => {
              allDocs.push({ ...d, caseNumber: c.caseNumber, caseTitle: c.title });
            });
          }
        });
        setDocuments(allDocs);
      } catch (e) {
        console.error(e);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch =
      d.displayName.toLowerCase().includes(search.toLowerCase()) ||
      d.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      d.caseNumber?.toLowerCase().includes(search.toLowerCase()) ||
      (d.caseTitle && d.caseTitle.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'ALL' || d.category?.code === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-24 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif font-bold text-xl sm:text-2xl text-navy-dark tracking-tight">
            Chamber Digital Document Repository
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            OCR-indexed scanned pleadings, orders, FIRs, and witness depositions with SHA-256 integrity verification
          </p>
        </div>

        {onOpenScanner && (
          <button
            onClick={onOpenScanner}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
          >
            <Camera className="w-4 h-4" />
            <span>Launch Document Scanner</span>
          </button>
        )}
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by file name, category, case number, or keywords..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Documents Grid */}
      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          No matching documents found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelectedDoc(doc)}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-xs cursor-pointer transition-all space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {doc.category?.name || 'Document'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {(doc.fileSize / 1024).toFixed(0)} KB
                  </span>
                </div>

                <h4 className="font-semibold text-xs text-slate-900 line-clamp-2">
                  {doc.displayName}
                </h4>

                <div className="text-[11px] text-slate-500 mt-1">
                  Case: <strong>{doc.caseNumber}</strong>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>{doc.pageCount} page(s)</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                  OCR: {doc.ocrStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentViewerModal
        document={selectedDoc}
        onClose={() => setSelectedDoc(null)}
      />
    </div>
  );
};
