import { Router } from 'express';
import multer from 'multer';
import { z } from 'zod';
import { prisma } from '../db/prisma';
import { storageService } from '../services/storage.service';
import { ocrService } from '../services/ocr.service';
import { authenticate } from '../middleware/auth';
import { authorizeCaseAccess } from '../middleware/rbac';
import { logAuditEvent } from '../middleware/audit';
import { DocumentVisibility, OCRProcessingStatus, UserRole } from '@prisma/client';

const router = Router({ mergeParams: true });
const upload = multer({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max upload
});

// Get document categories
router.get('/categories/list', authenticate, async (req, res, next) => {
  try {
    const categories = await prisma.documentCategory.findMany({
      orderBy: { name: 'asc' },
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
});

// List documents for a case
router.get('/', authenticate, authorizeCaseAccess('caseId'), async (req, res, next) => {
  try {
    const caseId = req.params.caseId;
    const isClient = req.user?.role === UserRole.CLIENT;

    const documents = await prisma.caseDocument.findMany({
      where: {
        caseId,
        isDeleted: false,
        ...(isClient ? { visibility: DocumentVisibility.CLIENT_VISIBLE } : {}),
      },
      include: {
        category: true,
        tags: true,
        extractedPages: { select: { pageNumber: true, confidence: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: documents });
  } catch (error) {
    next(error);
  }
});

// Standard file upload (PDF or single image)
router.post(
  '/upload',
  authenticate,
  authorizeCaseAccess('caseId'),
  upload.single('file'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No file uploaded.' });
        return;
      }

      const caseId = req.params.caseId;
      const {
        displayName,
        categoryId,
        visibility = DocumentVisibility.ADVOCATE_ONLY,
        description,
        documentDate,
      } = req.body;

      const finalCategoryId = categoryId || (await getDefaultCategoryId());

      // Save file to storage
      const storageResult = await storageService.saveFile(
        caseId,
        req.file.originalname,
        req.file.buffer
      );

      // Detect page count if PDF
      let pageCount = 1;
      if (req.file.mimetype === 'application/pdf' || req.file.originalname.toLowerCase().endsWith('.pdf')) {
        try {
          const { PDFDocument } = await import('pdf-lib');
          const pdfDoc = await PDFDocument.load(req.file.buffer, { ignoreEncryption: true });
          pageCount = pdfDoc.getPageCount();
        } catch {
          pageCount = 1;
        }
      }

      // Create document database record
      const doc = await prisma.caseDocument.create({
        data: {
          caseId,
          categoryId: finalCategoryId,
          displayName: displayName || req.file.originalname,
          originalFilename: req.file.originalname,
          fileType: req.file.mimetype,
          fileSize: storageResult.fileSize,
          pageCount,
          storagePath: storageResult.storagePath,
          checksumSha256: storageResult.checksumSha256,
          visibility: visibility as DocumentVisibility,
          description,
          documentDate: documentDate ? new Date(documentDate) : null,
          uploadedById: req.user!.id,
          ocrStatus: OCRProcessingStatus.PENDING,
        },
        include: { category: true },
      });

      // Trigger asynchronous OCR & text extraction
      setImmediate(() => {
        ocrService.processDocumentText(doc.id).catch(err => {
          console.error('Async OCR error:', err);
        });
      });

      await logAuditEvent(req, 'DOCUMENT_UPLOAD', 'CaseDocument', doc.id, {
        fileName: doc.displayName,
        caseId,
      });

      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  }
);

// Scanner & Camera Capture: combines multiple images into a multi-page PDF
router.post(
  '/scan',
  authenticate,
  authorizeCaseAccess('caseId'),
  upload.array('pages', 20),
  async (req, res, next) => {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        res.status(400).json({ success: false, message: 'No scanned pages provided.' });
        return;
      }

      const caseId = req.params.caseId;
      const {
        displayName = `Scanned_Document_${Date.now()}`,
        categoryId,
        visibility = DocumentVisibility.ADVOCATE_ONLY,
        description,
        documentDate,
        rotationsJson,
      } = req.body;

      let rotations: Record<number, number> = {};
      if (rotationsJson) {
        try {
          rotations = JSON.parse(rotationsJson);
        } catch {
          // ignore parsing error
        }
      }

      // Combine scanned images into single PDF
      const imageItems = files.map((f, idx) => ({
        buffer: f.buffer,
        mimeType: f.mimetype,
        rotation: rotations[idx] || 0,
      }));

      const mergedPdfBuffer = await ocrService.combineImagesToPdf(imageItems);

      // Save combined PDF to private storage
      const storageResult = await storageService.saveFile(
        caseId,
        `${displayName}.pdf`,
        mergedPdfBuffer
      );

      const doc = await prisma.caseDocument.create({
        data: {
          caseId,
          categoryId: categoryId || (await getDefaultCategoryId()),
          displayName: `${displayName}.pdf`,
          originalFilename: `${displayName}.pdf`,
          fileType: 'application/pdf',
          fileSize: storageResult.fileSize,
          pageCount: files.length,
          storagePath: storageResult.storagePath,
          checksumSha256: storageResult.checksumSha256,
          visibility: visibility as DocumentVisibility,
          description: description || `Digitized multi-page document (${files.length} pages)`,
          documentDate: documentDate ? new Date(documentDate) : new Date(),
          uploadedById: req.user!.id,
          ocrStatus: OCRProcessingStatus.PENDING,
        },
        include: { category: true },
      });

      // Run OCR & text extraction in background
      setImmediate(() => {
        ocrService.processDocumentText(doc.id).catch(err => {
          console.error('Async OCR scan error:', err);
        });
      });

      await logAuditEvent(req, 'DOCUMENT_SCAN_CREATED', 'CaseDocument', doc.id, {
        pageCount: files.length,
        caseId,
      });

      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      next(error);
    }
  }
);

// View or Stream document inline
router.get(
  '/:docId/view',
  authenticate,
  authorizeCaseAccess('caseId'),
  async (req, res, next) => {
    try {
      const doc = await prisma.caseDocument.findUnique({
        where: { id: req.params.docId },
      });

      if (!doc || doc.isDeleted) {
        res.status(404).json({ success: false, message: 'Document not found.' });
        return;
      }

      // Check client authorization
      if (req.user?.role === UserRole.CLIENT && doc.visibility !== DocumentVisibility.CLIENT_VISIBLE) {
        res.status(403).json({
          success: false,
          message: 'Access forbidden: Document has not been shared with the client.',
        });
        return;
      }

      const buffer = await storageService.getFile(doc.storagePath);

      res.setHeader('Content-Type', doc.fileType);
      res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.displayName)}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
);

// Download document as attachment
router.get(
  '/:docId/download',
  authenticate,
  authorizeCaseAccess('caseId'),
  async (req, res, next) => {
    try {
      const doc = await prisma.caseDocument.findUnique({
        where: { id: req.params.docId },
      });

      if (!doc || doc.isDeleted) {
        res.status(404).json({ success: false, message: 'Document not found.' });
        return;
      }

      if (req.user?.role === UserRole.CLIENT && doc.visibility !== DocumentVisibility.CLIENT_VISIBLE) {
        res.status(403).json({
          success: false,
          message: 'Access forbidden: Document has not been shared with the client.',
        });
        return;
      }

      const buffer = await storageService.getFile(doc.storagePath);

      await logAuditEvent(req, 'DOCUMENT_DOWNLOAD', 'CaseDocument', doc.id, {
        fileName: doc.displayName,
      });

      res.setHeader('Content-Type', doc.fileType);
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(doc.displayName)}"`);
      res.setHeader('Content-Length', buffer.length);
      res.send(buffer);
    } catch (error) {
      next(error);
    }
  }
);

// Get extracted text of a document
router.get(
  '/:docId/text',
  authenticate,
  authorizeCaseAccess('caseId'),
  async (req, res, next) => {
    try {
      const extracted = await prisma.extractedDocumentText.findMany({
        where: { documentId: req.params.docId },
        orderBy: { pageNumber: 'asc' },
      });
      res.json({ success: true, data: extracted });
    } catch (error) {
      next(error);
    }
  }
);

async function getDefaultCategoryId(): Promise<string> {
  const cat = await prisma.documentCategory.findFirst();
  return cat ? cat.id : '';
}

export default router;
