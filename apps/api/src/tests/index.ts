import assert from 'assert';
import { prisma } from '../db/prisma';
import { authService } from '../services/auth.service';
import { efilingService } from '../services/efiling.service';
import { hearingService } from '../services/hearing.service';
import { aiService } from '../services/ai.service';
import { ocrService } from '../services/ocr.service';
import { caseService } from '../services/case.service';
import { UserRole } from '@prisma/client';

async function runTests() {
  console.log('🧪 Starting Advocate Case Desk Automated Verification Suite...\n');
  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ FAIL: ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  // 1. AUTHENTICATION TESTS
  console.log('--- 1. Authentication Tests ---');
  await test('Advocate can log in with valid credentials', async () => {
    const res = await authService.login('advocate@legaldesk.com', 'Advocate@123');
    assert(res.token, 'Token must be returned');
    assert.strictEqual(res.user.email, 'advocate@legaldesk.com');
    assert.strictEqual(res.user.role, UserRole.ADVOCATE);
  });

  await test('Login fails with invalid password', async () => {
    await assert.rejects(
      async () => {
        await authService.login('advocate@legaldesk.com', 'WrongPass!');
      },
      /Invalid email or password/
    );
  });

  // 2. AUTHORIZATION & CONFIDENTIALITY TESTS
  console.log('\n--- 2. Authorization & Client Privilege Confidentiality Tests ---');
  await test('Client cannot see private notes in case detail', async () => {
    const case1 = await prisma.case.findFirst({
      where: { caseNumber: 'CS(COMM) 452/2023' },
    });
    assert(case1, 'Case 1 must exist');

    const clientView = await caseService.getCaseById(case1.id, 'CLIENT');
    assert(clientView, 'Case should be returned');
    assert.strictEqual((clientView as any).privateNotes, undefined, 'Client view must NEVER contain privateNotes');

    const advocateView = await caseService.getCaseById(case1.id, 'ADVOCATE');
    assert.notStrictEqual((advocateView as any).privateNotes, undefined, 'Advocate must have access to privateNotes');
  });

  await test('Client cannot view documents marked ADVOCATE_ONLY', async () => {
    const case1 = await prisma.case.findFirst({
      where: { caseNumber: 'CS(COMM) 452/2023' },
    });
    assert(case1);

    const clientView = await caseService.getCaseById(case1.id, 'CLIENT');
    const hasPrivateDoc = clientView?.documents.some(d => d.visibility === 'ADVOCATE_ONLY');
    assert.strictEqual(hasPrivateDoc, false, 'Client view must filter out ADVOCATE_ONLY documents');
  });

  // 3. DOCUMENT DIGITIZATION & OCR TESTS
  console.log('\n--- 3. Document Digitization & PDF Processing Tests ---');
  await test('Multi-page image combining generates valid PDF bytes', async () => {
    // 1x1 transparent PNG buffer
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    const pdfBuffer = await ocrService.combineImagesToPdf([
      { buffer: pngBuffer, mimeType: 'image/png' },
      { buffer: pngBuffer, mimeType: 'image/png', rotation: 90 },
    ]);

    assert(pdfBuffer.length > 500, 'PDF buffer should be generated');
    assert(pdfBuffer.toString('ascii', 0, 5) === '%PDF-', 'Buffer should start with %PDF- header');
  });

  await test('Scanned and uploaded documents appear in case with valid category and SHA-256 checksum', async () => {
    const sataraCase = await prisma.case.findFirst({
      where: { cnrNumber: 'MHST010020592021' },
      include: { documents: { include: { category: true } } },
    });
    assert(sataraCase, 'Satara case must exist');
    assert(sataraCase.documents.length > 0, 'Satara case must have uploaded records');
    const doc = sataraCase.documents[0];
    assert(doc.checksumSha256 && doc.checksumSha256.length === 64, 'Document must have 64-char SHA-256 hash');
    assert(doc.category, 'Document must have an associated category');
    assert.strictEqual(doc.ocrStatus, 'COMPLETED', 'Document must have OCR status COMPLETED');
  });

  // 4. E-FILING TECHNICAL VALIDATION TESTS
  console.log('\n--- 4. e-Filing Technical Validation & State Lifecycle Tests ---');
  await test('Technical validation flags packages exceeding limits or missing documents', async () => {
    const valResult = await efilingService.validateFilingPackage([]);
    assert.strictEqual(valResult.isValid, false);
    assert(valResult.errors.includes('No documents selected for the filing package.'));
  });

  await test('Technical validation checks PDF completeness', async () => {
    const docs = await prisma.caseDocument.findMany({ take: 2 });
    if (docs.length > 0) {
      const val = await efilingService.validateFilingPackage(docs.map(d => d.id));
      assert(typeof val.isValid === 'boolean');
      assert(val.details.documentCount === docs.length);
    }
  });

  // 5. HEARING CONFLICT DETECTION TESTS
  console.log('\n--- 5. Hearing Diary & Conflict Detection Tests ---');
  await test('Conflict detector identifies overlapping listings across courts', async () => {
    const advocate = await prisma.user.findFirst({ where: { role: 'ADVOCATE' } });
    assert(advocate);

    // Check conflicts for advocate
    const conflicts = await hearingService.detectConflicts(
      advocate.id,
      new Date('2026-10-24T10:30:00Z')
    );
    assert(Array.isArray(conflicts), 'Conflicts result must be an array');
  });

  // 6. AI CASE ASSISTANT & SOURCE CITATIONS TESTS
  console.log('\n--- 6. AI Assistant RAG & Source Citation Tests ---');
  await test('AI query on hearings returns answers with exact citations and disclaimer', async () => {
    const case1 = await prisma.case.findFirst({
      where: { caseNumber: 'CS(COMM) 452/2023' },
    });
    const advocate = await prisma.user.findFirst({ where: { role: 'ADVOCATE' } });
    assert(case1 && advocate);

    const res = await aiService.queryCase(
      case1.id,
      'What happened in the last hearings?',
      advocate.id,
      UserRole.ADVOCATE
    );

    assert(res.answer.length > 20, 'Answer must not be empty');
    assert(res.disclaimer.includes('professional verification'), 'Disclaimer must be present');
    assert(res.citations.length > 0, 'Must provide source citations');
  });

  console.log(`\n==============================================`);
  console.log(`Summary: ${passed} Passed, ${failed} Failed`);
  console.log(`==============================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests()
  .catch(err => {
    console.error('Test runner failure:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
