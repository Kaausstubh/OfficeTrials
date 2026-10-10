import React, { useState } from 'react';
import { EfilingRecord, EfilingStatus } from '../../types';
import { apiClient } from '../../api/client';
import {
  Send,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileCheck,
  RotateCw,
  Plus,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface EFilingTrackerProps {
  caseId: string;
  efilings: EfilingRecord[];
  onRefresh: () => void;
}

const statusOrder: EfilingStatus[] = [
  'SAVED_IN_CASE_FILE',
  'PREPARED_FOR_FILING',
  'SUBMITTED_TO_PORTAL',
  'ACKNOWLEDGEMENT_RECEIVED',
  'DEFECTS_RAISED',
  'RESUBMISSION_REQUIRED',
  'ACCEPTED_REGISTERED',
];

export const EFilingTracker: React.FC<EFilingTrackerProps> = ({
  caseId,
  efilings,
  onRefresh,
}) => {
  const [selectedRecord, setSelectedRecord] = useState<EfilingRecord | null>(
    efilings[0] || null
  );
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<EfilingStatus>('SUBMITTED_TO_PORTAL');
  const [changeNote, setChangeNote] = useState('');
  const [diaryNumber, setDiaryNumber] = useState('');
  const [ackNumber, setAckNumber] = useState('');
  const [defectDetails, setDefectDetails] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateStatus = async () => {
    if (!selectedRecord) return;
    try {
      setIsUpdating(true);
      await apiClient.patch(
        `/cases/${caseId}/efilings/${selectedRecord.id}/status`,
        {
          newStatus,
          changeNote,
          diaryNumber: diaryNumber || undefined,
          acknowledgementNumber: ackNumber || undefined,
          defectDetails: defectDetails || undefined,
        }
      );
      setShowStatusModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (status: EfilingStatus) => {
    switch (status) {
      case 'ACCEPTED_REGISTERED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Accepted & Registered
          </span>
        );
      case 'DEFECTS_RAISED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" /> Scrutiny Defects Raised
          </span>
        );
      case 'RESUBMISSION_REQUIRED':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-900 flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5" /> Resubmission Required
          </span>
        );
      case 'SUBMITTED_TO_PORTAL':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Submitted to Portal
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status.replace(/_/g, ' ')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Important Court Portal Disclaimer as specified in Section 8 */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3 text-xs text-amber-900 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>Legal Practice Distinction:</strong> Saving or preparing a document in Advocate Case Desk is <em>not</em> legal filing with the court. Formal legal filing occurs exclusively through the authorized Court e-Filing Portal or Registry Scrutiny Counter.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left: Filing Records List */}
        <div className="md:col-span-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Filing Packages ({efilings.length})
            </h4>
          </div>

          {efilings.length === 0 ? (
            <div className="p-6 text-center border border-slate-200 rounded-lg bg-slate-50 text-xs text-slate-500">
              No e-filing submissions recorded for this case yet.
            </div>
          ) : (
            <div className="space-y-2">
              {efilings.map(rec => (
                <div
                  key={rec.id}
                  onClick={() => setSelectedRecord(rec)}
                  className={`p-3.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    selectedRecord?.id === rec.id
                      ? 'bg-amber-50/50 border-amber-400 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-900 truncate">
                      {rec.filingTitle}
                    </span>
                    {getStatusBadge(rec.currentStatus)}
                  </div>

                  <div className="text-[11px] text-slate-500 space-y-0.5">
                    <div>Portal: <strong>{rec.portalName}</strong></div>
                    {rec.diaryNumber && <div>Diary No: <span className="font-mono">{rec.diaryNumber}</span></div>}
                    {rec.acknowledgementNumber && <div>Ack No: <span className="font-mono">{rec.acknowledgementNumber}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Selected Filing Lifecycle & Progression */}
        {selectedRecord && (
          <div className="md:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  {selectedRecord.filingTitle}
                </h3>
                <div className="text-xs text-slate-500 mt-0.5">
                  Type: <strong>{selectedRecord.filingType}</strong> • Portal: {selectedRecord.portalName}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedRecord.portalUrl && (
                  <a
                    href={selectedRecord.portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300"
                  >
                    <span>Open Official Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}

                <button
                  onClick={() => setShowStatusModal(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-lg shadow-xs"
                >
                  Update Stage
                </button>
              </div>
            </div>

            {/* Visual Lifecycle Progress Bar */}
            <div>
              <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                Procedural Scrutiny Progress
              </div>
              <div className="flex items-center justify-between relative">
                {statusOrder.map((st, idx) => {
                  const currentIdx = statusOrder.indexOf(selectedRecord.currentStatus);
                  const isDone = idx <= currentIdx;
                  const isCurrent = idx === currentIdx;

                  return (
                    <div key={st} className="flex flex-col items-center flex-1 relative group">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold z-10 transition-all ${
                          isDone
                            ? 'bg-amber-600 text-white shadow-xs'
                            : 'bg-slate-200 text-slate-500'
                        } ${isCurrent ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-[10px] text-center text-slate-600 mt-1 max-w-[70px] truncate leading-tight">
                        {st.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Associated Documents in Package */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Attached Filing Documents ({selectedRecord.documents.length})
              </h4>
              <div className="space-y-1.5">
                {selectedRecord.documents.map((d, i) => (
                  <div
                    key={d.documentId}
                    className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-200 text-xs"
                  >
                    <span className="font-medium text-slate-800">
                      {i + 1}. {d.document.displayName}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      {(d.document.fileSize / 1024).toFixed(0)} KB • PDF
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Status History Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Filing Audit History
              </h4>
              <div className="border-l-2 border-slate-200 ml-2 space-y-3 pl-3">
                {selectedRecord.statusHistory.map(h => (
                  <div key={h.id} className="text-xs">
                    <div className="font-semibold text-slate-800">
                      {h.newStatus.replace(/_/g, ' ')}
                    </div>
                    {h.changeNote && (
                      <p className="text-slate-600 text-[11px] mt-0.5">{h.changeNote}</p>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.changedAt).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Update Stage Modal */}
      {showStatusModal && selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900">
              Update e-Filing Stage Lifecycle
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                New Scrutiny / Filing Status *
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as EfilingStatus)}
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
              >
                {statusOrder.map(s => (
                  <option key={s} value={s}>
                    {s.replace(/_/g, ' ')}
                  </option>
                ))}
                <option value="REJECTED">REJECTED</option>
                <option value="WITHDRAWN">WITHDRAWN</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Court Diary Number
              </label>
              <input
                type="text"
                value={diaryNumber}
                onChange={e => setDiaryNumber(e.target.value)}
                placeholder="e.g. DHC-COMM-2023-09412"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Acknowledgement Receipt Number
              </label>
              <input
                type="text"
                value={ackNumber}
                onChange={e => setAckNumber(e.target.value)}
                placeholder="e.g. ACK-DHC-9812401"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
            </div>

            {newStatus === 'DEFECTS_RAISED' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Defect Description / Objections
                </label>
                <textarea
                  rows={2}
                  value={defectDetails}
                  onChange={e => setDefectDetails(e.target.value)}
                  placeholder="e.g. Statement of Truth signature missing on Annexure P-8"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Change Log / Notes
              </label>
              <input
                type="text"
                value={changeNote}
                onChange={e => setChangeNote(e.target.value)}
                placeholder="e.g. Scrutiny cleared by registry officer"
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-md"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="px-4 py-1.5 text-xs font-bold text-white bg-navy hover:bg-navy-light rounded-md"
              >
                {isUpdating ? 'Saving...' : 'Confirm Stage Update'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
