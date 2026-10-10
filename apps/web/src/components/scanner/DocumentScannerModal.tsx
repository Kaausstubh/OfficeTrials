import React, { useState, useRef, useEffect } from 'react';
import { apiClient } from '../../api/client';
import {
  Camera,
  Upload,
  RotateCw,
  Trash2,
  MoveUp,
  MoveDown,
  Check,
  AlertCircle,
  X,
  FileText,
  Loader2,
  Shield,
  Eye,
  FileCheck2,
  FolderOpen,
  Sparkles,
  RefreshCw,
  HelpCircle,
} from 'lucide-react';

interface ScannedPage {
  id: string;
  dataUrl: string;
  file?: File;
  rotation: number; // 0, 90, 180, 270
}

interface DocumentScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  caseNumber?: string;
  caseTitle?: string;
  initialMode?: 'scan' | 'upload';
  onSuccess: () => void;
}

export const DocumentScannerModal: React.FC<DocumentScannerModalProps> = ({
  isOpen,
  onClose,
  caseId: propCaseId,
  caseNumber: propCaseNumber,
  caseTitle: propCaseTitle,
  initialMode = 'scan',
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'upload'>(initialMode);
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [availableCases, setAvailableCases] = useState<any[]>([]);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');
  const [currentCaseNumber, setCurrentCaseNumber] = useState<string>('');
  const [currentCaseTitle, setCurrentCaseTitle] = useState<string>('');

  const [displayName, setDisplayName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [visibility, setVisibility] = useState('ADVOCATE_ONLY');
  const [description, setDescription] = useState('');
  const [documentDate, setDocumentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [categories, setCategories] = useState<{ id: string; name: string; code: string }[]>([]);

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const directPdfInputRef = useRef<HTMLInputElement>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialMode);
      setSuccessMessage(null);
      setError(null);
      loadInitialData();
    } else {
      stopCamera();
      setPages([]);
      setUploadedFile(null);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, propCaseId]);

  const loadInitialData = async () => {
    try {
      // 1. Load cases list so user can choose case if not locked
      const casesRes = await apiClient.get('/cases');
      const caseList = casesRes.data.data || [];
      setAvailableCases(caseList);

      let targetId: string = propCaseId || '';
      if (!targetId || targetId === '1' || targetId.length < 10) {
        // Fallback to first available case (e.g. Satara Sessions or Commercial suit)
        targetId = caseList[0]?.id || '';
      }

      setSelectedCaseId(targetId);

      const foundCase = caseList.find((c: any) => c.id === targetId);
      if (foundCase) {
        setCurrentCaseNumber(foundCase.caseNumber);
        setCurrentCaseTitle(foundCase.title);
      } else {
        setCurrentCaseNumber(propCaseNumber || '');
        setCurrentCaseTitle(propCaseTitle || '');
      }

      // 2. Load categories
      if (targetId) {
        const catRes = await apiClient.get(`/cases/${targetId}/documents/categories/list`);
        const cats = catRes.data.data || [];
        setCategories(cats);
        if (cats.length > 0 && !categoryId) {
          setCategoryId(cats[0].id);
        }
      }
    } catch (e) {
      console.error('Error loading initial scanner data:', e);
    }
  };

  const handleCaseChange = async (newCaseId: string) => {
    setSelectedCaseId(newCaseId);
    const target = availableCases.find(c => c.id === newCaseId);
    if (target) {
      setCurrentCaseNumber(target.caseNumber);
      setCurrentCaseTitle(target.title);
    }
    try {
      const catRes = await apiClient.get(`/cases/${newCaseId}/documents/categories/list`);
      setCategories(catRes.data.data || []);
      if (catRes.data.data?.length > 0) {
        setCategoryId(catRes.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startCamera = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      setCameraStream(stream);
      setIsCameraActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('Unable to access device camera. Please allow camera permissions or upload scanned image files from your computer.');
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    const newPage: ScannedPage = {
      id: `page_${Date.now()}_${Math.random()}`,
      dataUrl,
      rotation: 0,
    };

    setPages(prev => [...prev, newPage]);
    if (!displayName) {
      setDisplayName(`Scanned_Record_${currentCaseNumber.replace(/[^a-zA-Z0-9]/g, '_')}_P${pages.length + 1}`);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    filesArray.forEach(file => {
      // If user uploaded a PDF in this file input, redirect to direct upload
      if (file.type === 'application/pdf') {
        setUploadedFile(file);
        setActiveTab('upload');
        if (!displayName) {
          setDisplayName(file.name.replace(/\.[^/.]+$/, ''));
        }
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setPages(prev => [
          ...prev,
          {
            id: `page_${Date.now()}_${Math.random()}`,
            dataUrl,
            file,
            rotation: 0,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    if (!displayName && filesArray[0]) {
      setDisplayName(filesArray[0].name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDirectPdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setUploadedFile(file);
    if (!displayName) {
      setDisplayName(file.name.replace(/\.[^/.]+$/, ''));
    }
  };

  // 1-Click sample scan generator for immediate verification & testing
  const handleLoadSampleScan = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 1240;
    canvas.height = 1754; // A4 ratio
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw realistic Indian court document background
    ctx.fillStyle = '#faf8f2';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle paper grain border
    ctx.strokeStyle = '#d4cfbe';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    // Court / Police header seal
    ctx.fillStyle = '#1e293b';
    ctx.font = 'bold 26px serif';
    ctx.textAlign = 'center';
    ctx.fillText('IN THE COURT OF SESSIONS FOR SATARA, AT SATARA', canvas.width / 2, 120);

    ctx.font = 'italic 20px serif';
    ctx.fillStyle = '#475569';
    ctx.fillText('SPECIAL SESSIONS CASE NO. 2059 OF 2021', canvas.width / 2, 160);
    ctx.fillText('(CNR: MHST010020592021)', canvas.width / 2, 195);

    // Red Official Court Seal stamp
    ctx.save();
    ctx.translate(canvas.width - 240, 150);
    ctx.rotate(-0.1);
    ctx.strokeStyle = '#dc2626';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.ellipse(0, 0, 110, 50, 0, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.font = 'bold 14px sans-serif';
    ctx.fillStyle = '#dc2626';
    ctx.textAlign = 'center';
    ctx.fillText('DISTRICT COURT SATARA', 0, -10);
    ctx.fillText('CERTIFIED TRUE COPY', 0, 12);
    ctx.fillText('REGISTRY SECTION', 0, 30);
    ctx.restore();

    // Horizontal Rule
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(100, 230);
    ctx.lineTo(canvas.width - 100, 230);
    ctx.stroke();

    // Body text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'left';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('POLICE REPORT & FIRST INFORMATION RECORD (FIR NO. 142/2021)', 100, 280);

    ctx.font = '16px monospace';
    ctx.fillText('POLICE STATION: Satara City Police Station, District Satara', 100, 320);
    ctx.fillText('ACTS & SECTIONS: Indian Penal Code u/s 302, 120B, 34 r/w Arms Act s. 25', 100, 355);
    ctx.fillText('COMPLAINANT: Sunita Ramesh Kulkarni, age 42, r/o Shahupuri, Satara', 100, 390);
    ctx.fillText('ACCUSED: 1. Rajesh @ Raju Mahadev Pawar  2. Vikram @ Vicky Patil', 100, 425);
    ctx.fillText('DATE OF OCCURRENCE: 14th August 2021 at 21:30 hrs', 100, 460);
    ctx.fillText('INVESTIGATING OFFICER: PI Dilip Shinde (B.No. 4120)', 100, 495);

    ctx.font = '16px serif';
    ctx.fillStyle = '#1e293b';
    const lines = [
      'INVESTIGATION SUMMARY & CHARGE PARTICULARS:',
      '1. On 14.08.2021 at about 21:30 hrs, complainant reported physical altercation outside market yard.',
      '2. Statements of eyewitnesses PW-1 Sunita Kulkarni and PW-2 Ganesh Jadhav recorded under section 161 CrPC.',
      '3. Spot Panchnama drawn in presence of panch witnesses on 15.08.2021 with recovery of weapon.',
      '4. Medico-Legal Post Mortem Report No. 892/2021 issued by Civil Hospital, Satara establishing cause of death.',
      '5. Mobile Tower CDR records collected establishing presence of accused at scene of offence.',
      '6. Investigation completed and final charge-sheet submitted to the Court of Sessions for framing of charges.',
    ];

    let y = 560;
    for (const line of lines) {
      ctx.fillText(line, 100, y);
      y += 40;
    }

    // Advocate signature line
    ctx.font = 'italic 16px serif';
    ctx.fillText('Examined & verified for Chambers of Advocate Rajeshwar V. Deshmukh', 100, 1500);
    ctx.fillText('Digitized into eCourts Litigation Repository with SHA-256 Checksum', 100, 1530);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    setPages(prev => [
      ...prev,
      {
        id: `page_sample_${Date.now()}`,
        dataUrl,
        rotation: 0,
      },
    ]);

    if (!displayName) {
      setDisplayName('Satara_Police_FIR_142_2021_ChargeSheet_Pleadings');
    }

    // Auto-select FIR category if available
    const firCat = categories.find(c => c.code === 'FIR' || c.code === 'CHARGE_SHEET');
    if (firCat) {
      setCategoryId(firCat.id);
    }
  };

  const rotatePage = (index: number) => {
    setPages(prev =>
      prev.map((p, idx) =>
        idx === index ? { ...p, rotation: (p.rotation + 90) % 360 } : p
      )
    );
  };

  const movePage = (from: number, to: number) => {
    if (to < 0 || to >= pages.length) return;
    setPages(prev => {
      const copy = [...prev];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });
  };

  const deletePage = (index: number) => {
    setPages(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleSaveAndDigitize = async () => {
    if (!selectedCaseId) {
      setError('Please select an active target case file.');
      return;
    }
    if (!displayName.trim()) {
      setError('Please provide a document display name.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      if (activeTab === 'scan') {
        if (pages.length === 0) {
          setError('Please capture or upload at least one scanned page.');
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('displayName', displayName.trim());
        if (categoryId) formData.append('categoryId', categoryId);
        formData.append('visibility', visibility);
        formData.append('description', description);
        formData.append('documentDate', documentDate);

        const rotationsRecord: Record<number, number> = {};

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          rotationsRecord[i] = page.rotation;
          const response = await fetch(page.dataUrl);
          const blob = await response.blob();
          formData.append('pages', blob, `page_${i + 1}.jpg`);
        }

        formData.append('rotationsJson', JSON.stringify(rotationsRecord));

        await apiClient.post(`/cases/${selectedCaseId}/documents/scan`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Direct file upload tab
        if (!uploadedFile) {
          setError('Please select a PDF or document file to upload.');
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('displayName', displayName.trim());
        if (categoryId) formData.append('categoryId', categoryId);
        formData.append('visibility', visibility);
        formData.append('description', description);
        formData.append('documentDate', documentDate);

        await apiClient.post(`/cases/${selectedCaseId}/documents/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      setSuccessMessage('Case document scanned, indexed, and digitized successfully!');
      stopCamera();

      setTimeout(() => {
        onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      console.error('Scan save error:', err);
      setError(err.response?.data?.message || 'Failed to combine and save scanned document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/70 backdrop-blur-xs p-0 sm:p-4 overflow-hidden">
      <div className="bg-white rounded-t-2xl sm:rounded-xl shadow-2xl border border-slate-200 w-full sm:max-w-5xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header with Case Prominence & Mode Tabs */}
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-xs font-bold font-mono">
                {currentCaseNumber || 'SELECT CASE'}
              </span>
              <h3 className="font-serif font-bold text-base sm:text-lg text-navy-dark">
                Physical Document Scanner & Digitizer
              </h3>
            </div>
            <p className="text-xs text-slate-500 truncate max-w-lg mt-0.5">
              Case Target: <strong>{currentCaseTitle || 'Chambers Practice Matter'}</strong>
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {/* Mode Tabs */}
            <div className="flex p-0.5 bg-slate-200 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab('scan')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'scan' ? 'bg-white text-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5 text-amber-600" />
                <span>Multi-Page Scan</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                  activeTab === 'upload' ? 'bg-white text-navy shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Upload className="w-3.5 h-3.5 text-amber-600" />
                <span>Direct PDF Upload</span>
              </button>
            </div>

            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mx-4 sm:mx-6 mt-3 sm:mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        <div className="p-4 sm:p-6 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5 sm:gap-6">
          {/* Left Column: Capture & Page Management */}
          <div className="md:col-span-7 space-y-4">
            {/* If in Multi-Page Scan Mode */}
            {activeTab === 'scan' ? (
              <>
                {/* Capture & Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Phone native camera button */}
                  <button
                    type="button"
                    onClick={() => mobileCameraInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                    title="Open Phone Camera to Scan Document"
                  >
                    <Camera className="w-4 h-4 text-slate-950" />
                    <span>Phone Camera Scan</span>
                  </button>

                  {!isCameraActive ? (
                    <button
                      type="button"
                      onClick={startCamera}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-navy hover:bg-navy-light rounded-lg shadow-xs transition-colors cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-amber-400" />
                      <span>Webcam Viewfinder</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-lg"
                    >
                      <span>Stop Webcam</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-slate-500" />
                    <span>Import Photos</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLoadSampleScan}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                    title="Load Sample Indian Court Document Scan"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Load Sample Scan</span>
                  </button>

                  {/* Native mobile camera file input */}
                  <input
                    ref={mobileCameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileUpload}
                  />

                  {/* Standard file picker */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                {/* Live Camera Viewfinder */}
                {isCameraActive && (
                  <div className="relative rounded-lg overflow-hidden bg-black border border-slate-800 aspect-4/3 flex items-center justify-center shadow-inner">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="absolute bottom-4 px-6 py-2.5 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2 transform active:scale-95 transition-all"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Capture Page ({pages.length + 1})</span>
                    </button>
                  </div>
                )}

                {/* Scanned Pages Grid / List */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Scanned Document Pages ({pages.length})
                    </span>
                    {pages.length > 0 && (
                      <span className="text-[11px] text-slate-500">
                        Will be compiled into a single multi-page searchable PDF
                      </span>
                    )}
                  </div>

                  {pages.length === 0 ? (
                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50/50 space-y-2">
                      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
                        <FileText className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-semibold text-slate-700">No document pages captured yet</p>
                      <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                        Use your device camera, import scanned photos from your computer, or click <strong>Load Sample Court Scan</strong> to instantly test.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-80 overflow-y-auto p-1 border border-slate-100 rounded-lg">
                      {pages.map((p, idx) => (
                        <div
                          key={p.id}
                          className="group relative border border-slate-200 rounded-lg p-1.5 bg-white shadow-2xs hover:shadow-xs transition-shadow"
                        >
                          <div className="relative aspect-3/4 rounded bg-slate-100 overflow-hidden flex items-center justify-center">
                            <img
                              src={p.dataUrl}
                              alt={`Page ${idx + 1}`}
                              className="w-full h-full object-contain transition-transform duration-200"
                              style={{ transform: `rotate(${p.rotation}deg)` }}
                            />
                            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[10px] font-mono font-bold">
                              Page {idx + 1}
                            </span>
                          </div>

                          {/* Page controls */}
                          <div className="flex items-center justify-between mt-1.5 px-0.5">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => movePage(idx, idx - 1)}
                                disabled={idx === 0}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                                title="Move Page Earlier"
                              >
                                <MoveUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => movePage(idx, idx + 1)}
                                disabled={idx === pages.length - 1}
                                className="p-1 hover:bg-slate-100 rounded text-slate-500 disabled:opacity-30"
                                title="Move Page Later"
                              >
                                <MoveDown className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => rotatePage(idx)}
                                className="p-1 hover:bg-amber-50 rounded text-amber-700"
                                title="Rotate 90 degrees"
                              >
                                <RotateCw className="w-3 h-3" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => deletePage(idx)}
                              className="p-1 hover:bg-red-50 rounded text-red-600"
                              title="Remove Page"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Direct Document Upload Mode */
              <div className="space-y-4">
                <div
                  onClick={() => directPdfInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/20 rounded-xl p-8 text-center cursor-pointer transition-colors space-y-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <FileCheck2 className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-slate-800">
                      Upload Scanned PDF / Digital Case Record
                    </h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Drag and drop your court pleadings, charge-sheet, or scanned PDF file here, or click to browse.
                    </p>
                    <span className="inline-block mt-2 text-[10px] text-slate-400 font-mono">
                      Accepts PDF, DOCX, JPG, PNG (Max: 50MB)
                    </span>
                  </div>

                  <input
                    ref={directPdfInputRef}
                    type="file"
                    accept=".pdf,.docx,image/*"
                    className="hidden"
                    onChange={handleDirectPdfSelect}
                  />
                </div>

                {uploadedFile && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-xs text-slate-900 truncate max-w-xs">
                          {uploadedFile.name}
                        </h5>
                        <p className="text-[11px] text-emerald-700">
                          {(uploadedFile.size / 1024).toFixed(1)} KB • Ready for indexing & storage
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setUploadedFile(null)}
                      className="p-1 hover:bg-emerald-200/60 rounded text-slate-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Target Case & Legal Metadata */}
          <div className="md:col-span-5 bg-slate-50/80 p-4.5 rounded-xl border border-slate-200 space-y-3.5 flex flex-col justify-between">
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider pb-1 border-b border-slate-200">
                Case Association & Metadata
              </h4>

              {/* Target Case Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assign to Case Matter *
                </label>
                <select
                  value={selectedCaseId}
                  onChange={e => handleCaseChange(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-medium text-slate-900"
                >
                  {availableCases.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.caseNumber} — {c.title.slice(0, 40)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Display Name *
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="e.g. Satara_Police_FIR_142_2021"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Legal Document Category *
                </label>
                <select
                  value={categoryId}
                  onChange={e => setCategoryId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Client Confidentiality / Visibility *
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <label
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                      visibility === 'ADVOCATE_ONLY'
                        ? 'bg-amber-50/80 border-amber-300 font-bold text-amber-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="ADVOCATE_ONLY"
                      checked={visibility === 'ADVOCATE_ONLY'}
                      onChange={() => setVisibility('ADVOCATE_ONLY')}
                      className="hidden"
                    />
                    <Shield className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>Advocate Only</span>
                  </label>

                  <label
                    className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
                      visibility === 'CLIENT_VISIBLE'
                        ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-900'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="visibility"
                      value="CLIENT_VISIBLE"
                      checked={visibility === 'CLIENT_VISIBLE'}
                      onChange={() => setVisibility('CLIENT_VISIBLE')}
                      className="hidden"
                    />
                    <Eye className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Client Visible</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Document Date
                  </label>
                  <input
                    type="date"
                    value={documentDate}
                    onChange={e => setDocumentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Digitization Target
                  </label>
                  <div className="px-2.5 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-md text-slate-700 font-mono">
                    {activeTab === 'scan' ? `${pages.length} Page(s)` : uploadedFile ? '1 PDF file' : 'Pending'}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Case Notes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Notes on execution, verification stamp, or court exhibits..."
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md"
                />
              </div>

              <div className="p-2.5 rounded bg-blue-50 border border-blue-200 text-[11px] text-blue-900 leading-relaxed">
                🛡️ <strong>Integrity & AI OCR:</strong> Upon saving, the document is secured with a SHA-256 integrity hash, categorized in the digital case file, and automatically OCR-indexed for instant full-text search.
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Mobile/Desktop Bottom Action Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 sticky bottom-0 z-20 flex items-center justify-between gap-3 shadow-md">
          <div className="text-xs text-slate-600 truncate max-w-[160px] sm:max-w-xs">
            {activeTab === 'scan' ? (
              <span>
                <strong>{pages.length} page(s)</strong> captured
              </span>
            ) : uploadedFile ? (
              <span className="truncate block font-medium">
                {uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(0)} KB)
              </span>
            ) : (
              <span>Select document</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSaveAndDigitize}
              disabled={isSubmitting || (activeTab === 'scan' ? pages.length === 0 : !uploadedFile)}
              className="py-2.5 px-4 sm:px-6 text-xs font-bold text-white bg-navy hover:bg-navy-light disabled:opacity-50 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[42px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  <span>Digitizing...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 text-amber-400" />
                  <span>
                    Save to Case (
                    {activeTab === 'scan' ? `${pages.length} Pages` : uploadedFile ? '1 File' : 'Ready'}
                    )
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
