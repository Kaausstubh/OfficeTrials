import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Case, CaseDocument } from '../types';
import { CaseHeader } from '../components/layout/CaseHeader';
import { DocumentScannerModal } from '../components/scanner/DocumentScannerModal';
import { DocumentViewerModal } from '../components/viewer/DocumentViewerModal';
import { EFilingTracker } from '../components/efiling/EFilingTracker';
import { ECourtsSearchModal } from '../components/ecourts/ECourtsSearchModal';
import { AIAssistantDrawer } from '../components/ai/AIAssistantDrawer';
import { EditCaseModal } from '../components/cases/EditCaseModal';
import { AddWitnessModal } from '../components/evidence/AddWitnessModal';
import { AddExhibitModal } from '../components/evidence/AddExhibitModal';
import { RecordDepositionModal } from '../components/evidence/RecordDepositionModal';
import {
  FileText,
  Calendar,
  Send,
  Users2,
  CheckSquare,
  Shield,
  MessageSquare,
  Plus,
  Camera,
  Upload,
  Search,
  FileCheck,
  Check,
  ExternalLink,
  Lock,
  Download,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  AlertTriangle,
  CheckCircle2,
  Edit3,
} from 'lucide-react';

export const CaseDetailPage: React.FC = () => {
  const { caseId } = useParams<{ caseId: string }>();
  const { isClient, user } = useAuth();
  const navigate = useNavigate();

  const [caseData, setCaseData] = useState<Case | null>(null);
  const [activeTab, setActiveTab] = useState<
    | 'overview'
    | 'hearings'
    | 'documents'
    | 'efiling'
    | 'orders'
    | 'witnesses'
    | 'evidence'
    | 'bail'
    | 'tasks'
    | 'messages'
    | 'privatenotes'
  >('overview');

  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scannerInitialMode, setScannerInitialMode] = useState<'scan' | 'upload'>('scan');
  const [documentSearch, setDocumentSearch] = useState('');
  const [selectedDocForViewer, setSelectedDocForViewer] = useState<CaseDocument | null>(null);
  const [showECourtsSync, setShowECourtsSync] = useState(false);
  const [showAiDrawer, setShowAiDrawer] = useState(false);

  // Edit Case & Evidence Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddWitnessModal, setShowAddWitnessModal] = useState(false);
  const [showAddExhibitModal, setShowAddExhibitModal] = useState(false);
  const [showAddDepositionModal, setShowAddDepositionModal] = useState(false);
  const [selectedWitnessForDeposition, setSelectedWitnessForDeposition] = useState<any | null>(null);

  // Hearing recording modal
  const [showNewHearingModal, setShowNewHearingModal] = useState(false);
  const [hearingPurpose, setHearingPurpose] = useState('');
  const [hearingProceedings, setHearingProceedings] = useState('');
  const [nextDate, setNextDate] = useState('');
  const [nextPurpose, setNextPurpose] = useState('');

  // New message state
  const [messageText, setMessageText] = useState('');

  useEffect(() => {
    if (caseId) {
      loadCase();
    }
  }, [caseId]);

  const loadCase = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get(`/cases/${caseId}`);
      setCaseData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecordHearing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseData) return;
    try {
      await apiClient.post(`/cases/${caseData.id}/hearings`, {
        courtId: caseData.courtId,
        hearingDate: new Date().toISOString(),
        purpose: hearingPurpose,
        proceedings: hearingProceedings,
        nextHearingDate: nextDate ? new Date(nextDate).toISOString() : undefined,
        nextHearingPurpose: nextPurpose || undefined,
      });
      setShowNewHearingModal(false);
      setHearingPurpose('');
      setHearingProceedings('');
      loadCase();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !caseData) return;
    try {
      await apiClient.post(`/cases/${caseData.id}/messages`, {
        messageText,
      });
      setMessageText('');
      loadCase();
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading || !caseData) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading case brief and digital files...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Persistent Case Header */}
      <CaseHeader
        caseData={caseData}
        onRefresh={loadCase}
        onOpenECourtsSync={() => setShowECourtsSync(true)}
        onEditCase={() => setShowEditModal(true)}
      />

      {/* Case Navigation Tabs */}
      <div className="bg-white border-b border-slate-200 px-2 sm:px-6 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 py-1 overflow-x-auto no-scrollbar flex-1 scroll-smooth">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'hearings', label: `Hearings (${caseData.hearings?.length || 0})` },
            { id: 'documents', label: `Documents (${caseData.documents?.length || 0})` },
            ...(!isClient
              ? [
                  { id: 'efiling', label: `e-Filing (${caseData.efilingRecords?.length || 0})` },
                  { id: 'orders', label: `Orders (${caseData.orders?.length || 0})` },
                  { id: 'witnesses', label: `Witnesses (${caseData.witnesses?.length || 0})` },
                  { id: 'evidence', label: `Evidence & Exhibits (${caseData.exhibits?.length || 0})` },
                  { id: 'bail', label: `Bail & Compliance (${caseData.bailRecords?.length || 0})` },
                  { id: 'tasks', label: `Tasks (${caseData.tasks?.length || 0})` },
                  { id: 'privatenotes', label: 'Confidential Strategy' },
                ]
              : [
                  { id: 'orders', label: `Shared Orders (${caseData.orders?.length || 0})` },
                ]),
            { id: 'messages', label: 'Messages' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 sm:px-3.5 py-2 sm:py-2.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${
                activeTab === tab.id
                  ? 'bg-amber-50 text-amber-900 border-b-2 border-amber-600 font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {!isClient && (
          <button
            onClick={() => setShowAiDrawer(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md border border-indigo-200 transition-colors shrink-0 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Case Query</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="p-3 sm:p-4 md:p-6 flex-1 max-w-7xl mx-auto w-full pb-24 md:pb-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              {/* Case Summary Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                  Case Brief & Statutory Framework
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {caseData.description || 'No detailed case summary entered.'}
                </p>

                <div className="grid grid-cols-2 gap-4 pt-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Statutory Provisions</span>
                    <span className="font-semibold text-slate-800">{caseData.statutoryActs || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Specific Sections</span>
                    <span className="font-semibold text-slate-800">{caseData.statutorySections || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Litigating Parties */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                  Litigating Parties ({caseData.parties.length})
                </h3>
                <div className="space-y-2">
                  {caseData.parties.map((p: any) => (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span>{p.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                            {p.partyType}
                          </span>
                          {p.isOurClient && (
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.2 rounded">
                              Our Client
                            </span>
                          )}
                        </div>
                        {p.advocateName && (
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            Advocate: {p.advocateName}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Case Assignments & Quick Actions */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                  Chamber Assignments
                </h3>
                <div className="space-y-2">
                  {caseData.assignments.map((a: any) => (
                    <div
                      key={a.id}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-900">{a.user.fullName}</div>
                        <div className="text-[11px] text-slate-500">{a.roleInCase}</div>
                      </div>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                        {a.user.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {!isClient && (
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h3 className="font-bold text-sm text-slate-900 border-b border-slate-200 pb-2">
                    Quick Practice Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setScannerInitialMode('scan');
                        setShowScannerModal(true);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Camera className="w-4 h-4 text-amber-700" />
                      <span>Scan & Digitize Physical File</span>
                    </button>
                    <button
                      onClick={() => {
                        setScannerInitialMode('upload');
                        setShowScannerModal(true);
                      }}
                      className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Upload className="w-4 h-4 text-slate-600" />
                      <span>Upload Scanned Case Record</span>
                    </button>
                    <button
                      onClick={() => setShowNewHearingModal(true)}
                      className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span>Record Hearing Proceedings</span>
                    </button>
                    <button
                      onClick={() => setShowECourtsSync(true)}
                      className="w-full py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-600" />
                      <span>Sync with eCourts Registry</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* HEARINGS TAB */}
        {activeTab === 'hearings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-lg text-navy-dark">
                Case Chronology & Hearing Diary
              </h3>
              {!isClient && (
                <button
                  onClick={() => setShowNewHearingModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-lg shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Record Hearing</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {caseData.hearings.map((h: any) => (
                <div
                  key={h.id}
                  className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-amber-600" />
                      <span>{new Date(h.hearingDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {h.purpose}
                    </span>
                  </div>

                  <div className="text-slate-800 space-y-1">
                    <div>
                      <strong>Proceedings:</strong>{' '}
                      {isClient && h.clientSummary ? h.clientSummary : h.proceedings || h.purpose}
                    </div>
                    {h.orderPassed && (
                      <div>
                        <strong>Order Passed:</strong> {h.orderPassed}
                      </div>
                    )}
                    {h.nextHearingDate && (
                      <div className="text-emerald-700 font-semibold pt-1">
                        Next Hearing: {new Date(h.nextHearingDate).toLocaleDateString('en-IN')} ({h.nextHearingPurpose || 'Proceedings'})
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy-dark">
                  Digitized Case Documents ({caseData.documents.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Court pleadings, police FIRs, charge-sheets, bail orders, and witness depositions with OCR index & SHA-256 integrity
                </p>
              </div>

              {!isClient && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setScannerInitialMode('scan');
                      setShowScannerModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-navy hover:bg-navy-light rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scan Physical Document</span>
                  </button>
                  <button
                    onClick={() => {
                      setScannerInitialMode('upload');
                      setShowScannerModal(true);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-600" />
                    <span>Upload Scanned Record</span>
                  </button>
                </div>
              )}
            </div>

            {/* Document search bar if documents exist */}
            {caseData.documents.length > 0 && (
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={documentSearch}
                  onChange={e => setDocumentSearch(e.target.value)}
                  placeholder="Filter case documents by name, category, or notes..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            )}

            {/* Empty state when no documents uploaded yet */}
            {caseData.documents.length === 0 ? (
              <div className="bg-white p-10 rounded-xl border border-dashed border-slate-300 text-center space-y-4 shadow-2xs">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h4 className="font-serif font-bold text-base text-slate-900">
                    No Digitized Case Records Uploaded Yet
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload or scan physical court records, police FIRs, charge-sheets, bail orders, and witness depositions for this case file. Scanned pages are automatically compiled into searchable PDFs, secured with SHA-256 integrity checksums, and indexed with OCR text extraction.
                  </p>
                </div>
                {!isClient && (
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={() => {
                        setScannerInitialMode('scan');
                        setShowScannerModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-navy hover:bg-navy-light rounded-lg shadow-sm cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Scan Documents with Camera</span>
                    </button>
                    <button
                      onClick={() => {
                        setScannerInitialMode('upload');
                        setShowScannerModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg shadow-xs cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-slate-600" />
                      <span>Upload Scanned PDF / File</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {caseData.documents
                  .filter(
                    (d: any) =>
                      d.displayName.toLowerCase().includes(documentSearch.toLowerCase()) ||
                      d.category?.name?.toLowerCase().includes(documentSearch.toLowerCase()) ||
                      (d.description && d.description.toLowerCase().includes(documentSearch.toLowerCase()))
                  )
                  .map((d: any) => (
                    <div
                      key={d.id}
                      onClick={() => setSelectedDocForViewer(d)}
                      className="p-4 bg-white rounded-xl border border-slate-200 hover:border-amber-400 hover:shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-3 group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                            {d.category?.name || 'Document'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {(d.fileSize / 1024).toFixed(0)} KB
                          </span>
                        </div>

                        <h4 className="font-semibold text-xs text-slate-900 line-clamp-2 mt-1 group-hover:text-amber-800 transition-colors">
                          {d.displayName}
                        </h4>

                        {d.description && (
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                            {d.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-medium text-slate-700">{d.pageCount} page(s)</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded flex items-center gap-1 ${
                              d.ocrStatus === 'COMPLETED'
                                ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                                : d.ocrStatus === 'PROCESSING'
                                ? 'text-amber-700 bg-amber-50 border border-amber-200 animate-pulse'
                                : 'text-slate-600 bg-slate-100 border border-slate-200'
                            }`}
                          >
                            <Check className="w-2.5 h-2.5" />
                            <span>OCR: {d.ocrStatus}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        )}

        {/* E-FILING TAB */}
        {activeTab === 'efiling' && (
          <EFilingTracker
            caseId={caseData.id}
            efilings={caseData.efilingRecords}
            onRefresh={loadCase}
          />
        )}

        {/* ORDERS TAB */}
        {activeTab === 'orders' && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-navy-dark">
              Court Orders & Judgments
            </h3>
            {caseData.orders.length === 0 ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-lg text-xs text-slate-400">
                No court orders registered for this matter yet.
              </div>
            ) : (
              caseData.orders.map((o: any) => (
                <div
                  key={o.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 space-y-1.5 text-xs"
                >
                  <div className="flex items-center justify-between font-bold text-slate-900">
                    <span>{o.orderType}</span>
                    <span className="text-slate-500 font-mono text-[11px]">
                      {new Date(o.orderDate).toLocaleDateString('en-IN')}
                    </span>
                  </div>
                  <p className="text-slate-700">{o.orderSummary}</p>
                </div>
              ))
            )}
          </div>
        )}

        {/* WITNESSES TAB */}
        {activeTab === 'witnesses' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy-dark">
                  Witnesses & Trial Depositions ({caseData.witnesses?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">
                  Prosecution and defense witness roster, recorded depositions, key admissions, and contradictions
                </p>
              </div>

              {!isClient && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAddWitnessModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-lg shadow-2xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-amber-400" />
                    <span>Add Witness</span>
                  </button>
                  {caseData.witnesses && caseData.witnesses.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedWitnessForDeposition(caseData.witnesses[0]);
                        setShowAddDepositionModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg shadow-2xs transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-amber-800" />
                      <span>Record Deposition</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {(!caseData.witnesses || caseData.witnesses.length === 0) ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-400">
                No witnesses registered for this trial yet. Click &quot;Add Witness&quot; above to register.
              </div>
            ) : (
              <div className="space-y-3">
                {caseData.witnesses.map((w: any) => (
                  <div
                    key={w.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded bg-slate-900 text-white font-mono text-xs font-bold tracking-wide">
                          {w.witnessNumber}
                        </span>
                        <div>
                          <span className="font-bold text-sm text-slate-900">{w.name}</span>
                          <span className="ml-2 text-[10px] uppercase font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            {w.witnessType.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          {w.currentStage.replace(/_/g, ' ')}
                        </span>
                        {!isClient && (
                          <button
                            onClick={() => {
                              setSelectedWitnessForDeposition(w);
                              setShowAddDepositionModal(true);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded border border-slate-300 transition-colors cursor-pointer"
                          >
                            + Deposition
                          </button>
                        )}
                      </div>
                    </div>

                    {w.testimonySummary && (
                      <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {w.testimonySummary}
                      </p>
                    )}

                    {(w.mobile || w.address || w.remarks) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                        {w.mobile && <div>Mobile: <strong className="text-slate-700 font-mono">{w.mobile}</strong></div>}
                        {w.address && <div>Address: <strong className="text-slate-700">{w.address}</strong></div>}
                        {w.remarks && <div className="sm:col-span-2">Strategy Note: <span className="text-amber-800 font-medium">{w.remarks}</span></div>}
                      </div>
                    )}

                    {/* Depositions List */}
                    {w.depositions && w.depositions.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">
                          Recorded Examination Depositions ({w.depositions.length})
                        </span>
                        {w.depositions.map((d: any) => (
                          <div
                            key={d.id}
                            className="p-3.5 bg-slate-50/70 rounded-lg border border-slate-200 text-xs space-y-2"
                          >
                            <div className="flex items-center justify-between font-semibold text-slate-900">
                              <span className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                                <span>{d.examinationType.replace(/_/g, ' ')}</span>
                              </span>
                              <span className="text-slate-500 font-mono text-[11px]">
                                {new Date(d.depositionDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>

                            <p className="text-slate-700 leading-relaxed text-[11px]">
                              {d.transcriptSummary}
                            </p>

                            {d.keyAdmissions && (
                              <div className="p-2.5 bg-emerald-50 rounded border border-emerald-200 text-emerald-900 text-[11px] space-y-0.5">
                                <span className="font-bold flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  <span>Key Admissions:</span>
                                </span>
                                <p>{d.keyAdmissions}</p>
                              </div>
                            )}

                            {d.contradictions && (
                              <div className="p-2.5 bg-rose-50 rounded border border-rose-200 text-rose-900 text-[11px] space-y-0.5">
                                <span className="font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-rose-600" />
                                  <span>Material Contradictions Marked:</span>
                                </span>
                                <p>{d.contradictions}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* EVIDENCE & EXHIBITS TAB */}
        {activeTab === 'evidence' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-serif font-bold text-lg text-navy-dark">
                  Marked Evidence & Exhibits Repository ({caseData.exhibits?.length || 0})
                </h3>
                <p className="text-xs text-slate-500">
                  Judicially marked exhibits, evidentiary documents, formal objections, and chain of custody
                </p>
              </div>

              {!isClient && (
                <button
                  onClick={() => setShowAddExhibitModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mark / Add Exhibit</span>
                </button>
              )}
            </div>

            {(!caseData.exhibits || caseData.exhibits.length === 0) ? (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-xs text-slate-400">
                No exhibits marked in this case record yet. Click &quot;Mark / Add Exhibit&quot; above to register evidence.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.exhibits.map((e: any) => (
                  <div
                    key={e.id}
                    className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-3 text-xs"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded bg-navy text-amber-300 font-mono text-xs font-bold tracking-wide border border-navy-light">
                          {e.exhibitNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            Marked By: {e.markedBy}
                          </span>
                          {e.markingDate && (
                            <span className="text-slate-400 font-mono text-[11px]">
                              {new Date(e.markingDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      <h4 className="font-bold text-slate-900 text-sm leading-snug">
                        {e.description}
                      </h4>

                      {e.objectionRaised ? (
                        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[11px] text-rose-900 space-y-0.5">
                          <div className="font-bold flex items-center gap-1.5 text-rose-700">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>Formal Objection on Record</span>
                          </div>
                          <p>{e.objectionDetails || 'Formal objection raised by counsel during tendering of document.'}</p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Admitted on Judicial Record without Objection</span>
                        </div>
                      )}
                    </div>

                    {e.custodyDetails && (
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">Custody / Muddayamal:</span>
                        <span className="font-mono text-slate-700 truncate max-w-[200px]" title={e.custodyDetails}>
                          {e.custodyDetails}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* BAIL & COMPLIANCE TAB */}
        {activeTab === 'bail' && (
          <div className="space-y-4">
            <h3 className="font-serif font-bold text-lg text-navy-dark">
              Bail Records & Surety Compliance
            </h3>
            {caseData.bailRecords.map((b: any) => (
              <div
                key={b.id}
                className="bg-white p-5 rounded-xl border border-slate-200 space-y-3 text-xs"
              >
                <div className="flex items-center justify-between font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <span>Accused: {b.accusedName} ({b.bailType} Bail)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                    {b.status}
                  </span>
                </div>
                {b.bailConditions && (
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Court Bail Conditions:</span>
                    <p className="text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-200">{b.bailConditions}</p>
                  </div>
                )}
                {b.sureties && b.sureties.length > 0 && (
                  <div>
                    <span className="font-semibold text-slate-700 block mb-1">Surety Bond Verification:</span>
                    {b.sureties.map((s: any) => (
                      <div key={s.id} className="p-2 bg-slate-50 rounded text-[11px] text-slate-700">
                        Surety: <strong>{s.suretyName}</strong> • Bond Amount: ₹{s.bondAmount.toLocaleString('en-IN')} • {s.solvencyStatus}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <h3 className="font-serif font-bold text-lg text-navy-dark">
              Tasks & Drafting Deadlines ({caseData.tasks.length})
            </h3>
            <div className="space-y-2">
              {caseData.tasks.map((t: any) => (
                <div
                  key={t.id}
                  className="bg-white p-4 rounded-xl border border-slate-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-slate-900">{t.title}</div>
                    <div className="text-[11px] text-slate-500">{t.description}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-mono font-bold text-rose-700 block">
                      Due: {new Date(t.dueDate).toLocaleDateString('en-IN')}
                    </span>
                    <span className="text-[10px] text-slate-500">{t.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs h-[550px] flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 font-bold text-xs text-slate-800">
              Case-Linked Advocate & Client Communication
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900 max-w-lg">
                <strong>Adv. Deshmukh:</strong> Good afternoon. The rejoinder has been accepted by the Delhi High Court. Next hearing is on 24th October for framing of issues.
              </div>
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type confidential case message..."
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold text-white bg-navy rounded-lg"
              >
                Send
              </button>
            </form>
          </div>
        )}

        {/* PRIVATE STRATEGY NOTES TAB */}
        {activeTab === 'privatenotes' && !isClient && (
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-200">
              <Lock className="w-4 h-4" />
              <span>Privileged Advocate Strategy Notes (Strictly Confidential)</span>
            </div>
            <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-serif">
              {caseData.privateNotes || 'No private strategy notes recorded.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <DocumentScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        caseId={caseData.id}
        caseNumber={caseData.caseNumber}
        caseTitle={caseData.title}
        initialMode={scannerInitialMode}
        onSuccess={loadCase}
      />

      <DocumentViewerModal
        document={selectedDocForViewer}
        onClose={() => setSelectedDocForViewer(null)}
      />

      <ECourtsSearchModal
        isOpen={showECourtsSync}
        onClose={() => setShowECourtsSync(false)}
        caseId={caseData.id}
        defaultCnr={caseData.cnrNumber || undefined}
        onImportComplete={loadCase}
      />

      <AIAssistantDrawer
        isOpen={showAiDrawer}
        onClose={() => setShowAiDrawer(false)}
        caseId={caseData.id}
        caseNumber={caseData.caseNumber}
      />

      {/* Record Hearing Modal */}
      {showNewHearingModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-4 sm:p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Record Court Hearing Proceedings
            </h3>
            <form onSubmit={handleRecordHearing} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Hearing Purpose / Listed Stage *
                </label>
                <input
                  type="text"
                  required
                  value={hearingPurpose}
                  onChange={e => setHearingPurpose(e.target.value)}
                  placeholder="e.g. Completion of Pleadings & Admission/Denial"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Proceedings & Order Passed *
                </label>
                <textarea
                  required
                  rows={3}
                  value={hearingProceedings}
                  onChange={e => setHearingProceedings(e.target.value)}
                  placeholder="Summary of bench proceedings, counsel arguments, directions..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Next Hearing Date
                  </label>
                  <input
                    type="date"
                    value={nextDate}
                    onChange={e => setNextDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Next Hearing Purpose
                  </label>
                  <input
                    type="text"
                    value={nextPurpose}
                    onChange={e => setNextPurpose(e.target.value)}
                    placeholder="e.g. Framing of Issues"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowNewHearingModal(false)}
                  className="flex-1 sm:flex-initial px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 sm:flex-initial px-4 py-2 font-bold text-white bg-navy hover:bg-navy-light rounded-lg text-center"
                >
                  Save Proceedings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Case Details Modal */}
      {showEditModal && caseData && (
        <EditCaseModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          caseData={caseData}
          onSuccess={loadCase}
        />
      )}

      {/* Add Witness Modal */}
      {showAddWitnessModal && caseData && (
        <AddWitnessModal
          isOpen={showAddWitnessModal}
          onClose={() => setShowAddWitnessModal(false)}
          caseId={caseData.id}
          onSuccess={loadCase}
        />
      )}

      {/* Add Exhibit Modal */}
      {showAddExhibitModal && caseData && (
        <AddExhibitModal
          isOpen={showAddExhibitModal}
          onClose={() => setShowAddExhibitModal(false)}
          caseId={caseData.id}
          onSuccess={loadCase}
        />
      )}

      {/* Record Deposition Modal */}
      {showAddDepositionModal && caseData && (
        <RecordDepositionModal
          isOpen={showAddDepositionModal}
          onClose={() => setShowAddDepositionModal(false)}
          caseId={caseData.id}
          witnesses={caseData.witnesses || []}
          defaultWitnessId={selectedWitnessForDeposition?.id}
          onSuccess={loadCase}
        />
      )}
    </div>
  );
};
