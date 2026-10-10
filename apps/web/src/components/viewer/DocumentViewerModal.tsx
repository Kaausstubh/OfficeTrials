import React, { useState, useEffect } from 'react';
import { CaseDocument } from '../../types';
import { apiClient } from '../../api/client';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  Search,
  FileText,
  ShieldCheck,
  Eye,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';

interface DocumentViewerModalProps {
  document: CaseDocument | null;
  onClose: () => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document: doc,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'ocr' | 'metadata'>('preview');
  const [zoom, setZoom] = useState(100);
  const [ocrText, setOcrText] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingText, setIsLoadingText] = useState(false);

  useEffect(() => {
    if (doc) {
      loadExtractedText();
      setZoom(100);
      setActiveTab('preview');
      setSearchQuery('');
    }
  }, [doc]);

  const loadExtractedText = async () => {
    if (!doc) return;
    try {
      setIsLoadingText(true);
      const res = await apiClient.get(`/cases/${doc.caseId}/documents/${doc.id}/text`);
      const pages = res.data.data;
      if (pages && pages.length > 0) {
        setOcrText(
          pages
            .map(
              (p: any) =>
                `--- Page ${p.pageNumber} (Confidence: ${p.confidence || 90}%) ---\n${p.extractedText}`
            )
            .join('\n\n')
        );
      } else {
        setOcrText('No extracted text available for this document.');
      }
    } catch (e) {
      console.error(e);
      setOcrText('Failed to load extracted text.');
    } finally {
      setIsLoadingText(false);
    }
  };

  if (!doc) return null;

  const token = localStorage.getItem('token') || '';
  const previewUrl = `/api/v1/cases/${doc.caseId}/documents/${doc.id}/view?token=${encodeURIComponent(token)}`;
  const downloadUrl = `/api/v1/cases/${doc.caseId}/documents/${doc.id}/download?token=${encodeURIComponent(token)}`;

  // Highlight search matches in OCR text
  const renderHighlightedText = () => {
    if (!searchQuery.trim()) {
      return <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800">{ocrText}</pre>;
    }

    const regex = new RegExp(`(${searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi');
    const parts = ocrText.split(regex);

    return (
      <pre className="font-mono text-xs whitespace-pre-wrap text-slate-800 leading-relaxed">
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-amber-300 text-slate-950 font-bold px-0.5 rounded">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </pre>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-0 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 w-full sm:max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-4 py-2.5 sm:px-6 sm:py-3.5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 bg-amber-100 text-amber-900 rounded-lg shrink-0">
              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-xs sm:text-sm text-slate-900 truncate">
                {doc.displayName}
              </h3>
              <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-slate-500">
                <span className="font-medium text-amber-800 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                  {doc.category?.name || 'Document'}
                </span>
                <span>• {(doc.fileSize / 1024).toFixed(0)} KB</span>
                <span>• {doc.pageCount} page(s)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
            {/* View Tabs */}
            <div className="flex items-center p-0.5 bg-slate-200/80 rounded-lg text-xs font-semibold text-slate-600 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 sm:px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeTab === 'preview' ? 'bg-white text-navy shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Preview
              </button>
              <button
                onClick={() => setActiveTab('ocr')}
                className={`px-2.5 sm:px-3 py-1 rounded-md transition-all flex items-center gap-1 whitespace-nowrap ${
                  activeTab === 'ocr' ? 'bg-white text-navy shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3 h-3 text-indigo-500" />
                <span>Extracted Text</span>
              </button>
              <button
                onClick={() => setActiveTab('metadata')}
                className={`px-2.5 sm:px-3 py-1 rounded-md transition-all whitespace-nowrap ${
                  activeTab === 'metadata' ? 'bg-white text-navy shadow-xs font-bold' : 'hover:text-slate-900'
                }`}
              >
                Checksum
              </button>
            </div>

            <div className="flex items-center gap-1">
              <a
                href={downloadUrl}
                download
                className="p-1.5 text-slate-600 hover:text-navy hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </a>

              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 bg-slate-100/60 overflow-hidden relative flex flex-col">
          {activeTab === 'preview' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Zoom & Navigation Bar */}
              <div className="h-10 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-xs text-slate-600 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setZoom(prev => Math.max(50, prev - 15))}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="Zoom Out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-[11px] w-12 text-center">{zoom}%</span>
                  <button
                    onClick={() => setZoom(prev => Math.min(250, prev + 15))}
                    className="p-1 hover:bg-slate-100 rounded"
                    title="Zoom In"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoom(100)}
                    className="p-1 hover:bg-slate-100 rounded text-[11px]"
                    title="Reset Zoom"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  SHA-256: {doc.checksumSha256.slice(0, 16)}...
                </div>
              </div>

              {/* Document Frame / Image */}
              <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
                {doc.fileType === 'application/pdf' ? (
                  <iframe
                    src={previewUrl}
                    title={doc.displayName}
                    className="w-full h-full min-h-[500px] border border-slate-300 rounded shadow-sm bg-white"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt={doc.displayName}
                    className="max-w-full rounded shadow-md border border-slate-200 transition-transform duration-100"
                    style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
                  />
                )}
              </div>
            </div>
          )}

          {activeTab === 'ocr' && (
            <div className="flex-1 flex flex-col h-full bg-white p-6 overflow-hidden">
              {/* Search bar inside extracted text */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search within extracted OCR text..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  OCR Confidence: <strong>{doc.ocrConfidence || 95}%</strong>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 bg-slate-50 border border-slate-200 rounded-lg">
                {isLoadingText ? (
                  <div className="text-center py-12 text-slate-400 text-xs">
                    Loading extracted text...
                  </div>
                ) : (
                  renderHighlightedText()
                )}
              </div>
            </div>
          )}

          {activeTab === 'metadata' && (
            <div className="flex-1 bg-white p-6 overflow-y-auto max-w-2xl mx-auto space-y-4">
              <h4 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                Document Technical & Evidentiary Metadata
              </h4>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Document ID</span>
                  <span className="font-mono text-slate-800 break-all">{doc.id}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">SHA-256 Checksum</span>
                  <span className="font-mono text-slate-800 break-all">{doc.checksumSha256}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">MIME Format</span>
                  <span className="text-slate-800 font-medium">{doc.fileType}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Visibility Classification</span>
                  <span className="text-slate-800 font-medium">{doc.visibility}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">OCR Status</span>
                  <span className="text-slate-800 font-medium">{doc.ocrStatus}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Document Date</span>
                  <span className="text-slate-800 font-medium">
                    {doc.documentDate ? new Date(doc.documentDate).toLocaleDateString('en-IN') : 'N/A'}
                  </span>
                </div>
              </div>

              {doc.description && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Advocate Notes / Description</span>
                  <p className="text-slate-800">{doc.description}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
