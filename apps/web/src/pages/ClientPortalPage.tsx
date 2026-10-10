import React, { useState, useEffect } from 'react';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  Calendar,
  FileText,
  Clock,
  Upload,
  CheckCircle2,
  AlertCircle,
  Building2,
  MessageSquare,
  Shield,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

export const ClientPortalPage: React.FC = () => {
  const { user } = useAuth();
  const [portalData, setPortalData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Upload modal for document requests
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadClientOverview();
  }, []);

  const loadClientOverview = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/client/overview');
      setPortalData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadRequestedDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !uploadFile) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('displayName', uploadFile.name);
      formData.append('categoryId', 'CLIENT_DOC');
      formData.append('visibility', 'CLIENT_VISIBLE');
      formData.append('description', `Uploaded by client in response to request: ${selectedRequest.requestedTitle}`);

      // Upload document
      const docRes = await apiClient.post(
        `/cases/${selectedRequest.caseId}/documents/upload`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      // Fulfill request
      await apiClient.patch(`/client/requests/${selectedRequest.id}/fulfill`, {
        uploadedDocId: docRes.data.data.id,
      });

      setSelectedRequest(null);
      setUploadFile(null);
      loadClientOverview();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading || !portalData) {
    return (
      <div className="p-12 text-center text-xs text-slate-500">
        Loading client litigation portal...
      </div>
    );
  }

  const { cases } = portalData;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-6xl mx-auto pb-24 md:pb-6">
      {/* Client Welcome Banner */}
      <div className="bg-gradient-to-r from-navy to-navy-dark text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-md">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Shield className="w-4 h-4" />
          <span>Authorized Litigant Portal</span>
        </div>
        <h2 className="font-serif font-bold text-xl sm:text-2xl tracking-tight">
          Welcome, {portalData.client?.fullName}
        </h2>
        <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
          Track plain-English progress updates, view upcoming court appearances, and securely upload requested case records to your legal counsel.
        </p>
      </div>

      {cases.length === 0 ? (
        <div className="bg-white p-8 sm:p-12 text-center rounded-xl border border-slate-200 text-xs text-slate-500">
          No litigation matters are currently assigned to your account. Contact your legal counsel.
        </div>
      ) : (
        cases.map((c: any) => (
          <div
            key={c.id}
            className="bg-white rounded-xl sm:rounded-2xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 sm:space-y-6 p-4 sm:p-6"
          >
            {/* Case Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <span className="text-[10px] font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-bold">
                  {c.caseNumber}
                </span>
                <h3 className="font-serif font-bold text-lg text-navy-dark mt-1">
                  {c.title}
                </h3>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{c.courtName} ({c.establishment})</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-amber-600" />
                <div>
                  <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">
                    Next Court Hearing
                  </span>
                  <span className="text-xs font-bold text-slate-900">{c.nextHearingDate}</span>
                </div>
              </div>
            </div>

            {/* Plain English "What Happened" and "What Happens Next" */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-2 text-navy-dark font-bold text-xs uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>What Happened in My Case?</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {c.whatHappened}
                </p>
              </div>

              <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                  <HelpCircle className="w-4 h-4 text-emerald-700" />
                  <span>What Happens Next?</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-sans">
                  {c.whatHappensNext}
                </p>
              </div>
            </div>

            {/* Documents Requested from You */}
            {c.pendingDocumentRequests && c.pendingDocumentRequests.length > 0 && (
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-blue-700" />
                    <span>Documents Requested by Your Legal Counsel</span>
                  </span>
                </div>

                <div className="space-y-2">
                  {c.pendingDocumentRequests.map((req: any) => (
                    <div
                      key={req.id}
                      className="p-3 bg-white rounded-lg border border-blue-200 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{req.requestedTitle}</div>
                        {req.description && (
                          <div className="text-[11px] text-slate-600 mt-0.5">{req.description}</div>
                        )}
                        {req.deadline && (
                          <div className="text-[10px] text-rose-700 font-mono font-bold mt-0.5">
                            Required by: {new Date(req.deadline).toLocaleDateString('en-IN')}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setSelectedRequest(req)}
                        className="px-3 py-1.5 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 rounded-lg shadow-2xs"
                      >
                        Upload Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shared Documents & Orders */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Authorized Court Orders & Shared Case Records ({c.sharedDocuments.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {c.sharedDocuments.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                  >
                    <div className="truncate">
                      <span className="font-semibold text-slate-900 block truncate">
                        {doc.displayName}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {doc.categoryName} • {(doc.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    <a
                      href={`/api/v1/cases/${c.id}/documents/${doc.id}/download`}
                      download
                      className="p-1.5 hover:bg-slate-200 text-slate-600 rounded"
                      title="Download Document"
                    >
                      <FileText className="w-4 h-4" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))
      )}

      {/* Upload Document Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-4 sm:p-6 space-y-4">
            <h3 className="font-bold text-sm sm:text-base text-slate-900">
              Upload Requested Case Document
            </h3>
            <p className="text-xs text-slate-600">
              Target: <strong>{selectedRequest.requestedTitle}</strong>
            </p>

            <form onSubmit={handleUploadRequestedDoc} className="space-y-4">
              <input
                type="file"
                required
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={e => setUploadFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              />

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 sm:flex-initial px-3 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 font-semibold text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold text-white bg-navy hover:bg-navy-light rounded-lg shadow-xs text-center"
                >
                  {isUploading ? 'Uploading...' : 'Submit to Advocate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
