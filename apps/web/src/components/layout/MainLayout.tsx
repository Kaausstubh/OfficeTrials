import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { MobileBottomNav } from './MobileBottomNav';
import { GlobalSearchModal } from '../search/GlobalSearchModal';
import { NewCaseModal } from '../cases/NewCaseModal';
import { DocumentScannerModal } from '../scanner/DocumentScannerModal';
import { AIAssistantDrawer } from '../ai/AIAssistantDrawer';
import { ErrorBoundary } from '../common/ErrorBoundary';

export interface LayoutOutletContext {
  onOpenNewCase: () => void;
  onOpenScanner: () => void;
  onOpenSearch: () => void;
  onToggleAi: () => void;
}

export const MainLayout: React.FC = () => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNewCaseModal, setShowNewCaseModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showAiDrawer, setShowAiDrawer] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const outletContext: LayoutOutletContext = {
    onOpenNewCase: () => setShowNewCaseModal(true),
    onOpenScanner: () => setShowScannerModal(true),
    onOpenSearch: () => setShowSearchModal(true),
    onToggleAi: () => setShowAiDrawer(true),
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden text-slate-900 font-sans antialiased">
      {/* Left Navigation Sidebar (Desktop persistent, Mobile slide-over drawer) */}
      <Sidebar
        onToggleAi={() => setShowAiDrawer(true)}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Navbar */}
        <Navbar
          onOpenSearch={() => setShowSearchModal(true)}
          onOpenScanner={() => setShowScannerModal(true)}
          onOpenNewCase={() => setShowNewCaseModal(true)}
          onToggleAi={() => setShowAiDrawer(true)}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />

        {/* Scrollable Page Outlet with bottom padding on mobile for the Bottom Nav */}
        <main className="flex-1 overflow-y-auto pb-16 md:pb-0">
          <ErrorBoundary fallbackTitle="View Loading Notice">
            <Outlet context={outletContext} />
          </ErrorBoundary>
        </main>

        {/* Mobile Bottom Navigation Bar */}
        <MobileBottomNav
          onOpenScanner={() => setShowScannerModal(true)}
          onToggleAi={() => setShowAiDrawer(true)}
        />
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      <NewCaseModal
        isOpen={showNewCaseModal}
        onClose={() => setShowNewCaseModal(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* Quick Launch Scanner Modal */}
      <DocumentScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        onSuccess={() => {
          window.location.reload();
        }}
      />

      {/* AI Assistant Drawer */}
      <AIAssistantDrawer
        isOpen={showAiDrawer}
        onClose={() => setShowAiDrawer(false)}
      />
    </div>
  );
};
