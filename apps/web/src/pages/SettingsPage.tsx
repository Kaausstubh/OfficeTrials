import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Settings,
  ShieldCheck,
  Server,
  Key,
  HardDrive,
  Cpu,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="font-serif font-bold text-2xl text-navy-dark tracking-tight">
          Chamber & Integration Configuration
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          eCourts CIS API adapter settings, storage encryption parameters, and security audit checklists
        </p>
      </div>

      <div className="space-y-6">
        {/* User Account / Role Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Authenticated Chambers Profile
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Full Name</span>
              <span className="font-bold text-slate-900">{user?.fullName}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Address</span>
              <span className="font-mono text-slate-800">{user?.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Role & Privilege</span>
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-amber-100 text-amber-900">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* eCourts Integration Adapter Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-blue-600" />
              <h3 className="font-bold text-sm text-slate-900">
                eCourts CIS & NJDG Integration Adapter
              </h3>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
              Adapter Active
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Advocate Case Desk integrates with court registry data sources using a standardized integration boundary. In compliance with official court rules, when direct API tokens require registry IP whitelisting or CAPTCHA verification, automated fallback provides manual import, diff review, and direct official portal linking.
          </p>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-mono space-y-1 text-slate-700">
            <div>• Endpoint Protocol: REST / JSON Adapter (CIS 3.2 Standard)</div>
            <div>• Supported Courts: Supreme Court, Delhi HC, Bombay HC, District Courts</div>
            <div>• Identifier Schemas: 16-Digit CNR, Case Type/Number/Year</div>
          </div>
        </div>

        {/* Document Storage & OCR Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <HardDrive className="w-4 h-4 text-amber-600" />
            <h3 className="font-bold text-sm text-slate-900">
              Private Storage & Digitization Engine
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">Storage Driver</span>
              <span className="font-bold text-slate-800">Private Object / Local Encrypted Storage</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Documents are stored with SHA-256 tamper verification.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span className="text-slate-500 block text-[10px] uppercase font-bold">OCR & Text Extraction</span>
              <span className="font-bold text-slate-800">Tesseract.js OCR + PDF Text Parser</span>
              <p className="text-[11px] text-slate-500 mt-1">
                Indexed in English, Hindi, and Marathi with page-level confidence scores.
              </p>
            </div>
          </div>
        </div>

        {/* Professional Security & Privilege Checklist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Key className="w-4 h-4 text-slate-700" />
            <h3 className="font-bold text-sm text-slate-900">
              Advocate-Client Privilege & Security Checklist
            </h3>
          </div>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span><strong>Restricted Visibility:</strong> Client view strictly redacts private notes, internal assessments, and litigation strategy.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span><strong>IDOR & Access Protection:</strong> Resource-level verification enforced on all document download endpoints.</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span><strong>AI Guardrails:</strong> Digitized document text is treated as untrusted data to prevent prompt injection attacks.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
