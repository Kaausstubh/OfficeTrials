import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from '../db/prisma';
import {
  UserRole,
  CaseType,
  ProceduralStage,
  CaseStatus,
  CasePriority,
  PartyType,
  HearingAttendanceStatus,
  DateVerificationStatus,
  DocumentVisibility,
  OCRProcessingStatus,
  EfilingStatus,
  WitnessType,
  ExaminationStage,
  BailType,
  BailStatus,
  TaskPriority,
  TaskStatus,
  MessageSenderType,
} from '@prisma/client';

async function seed() {
  console.log('🌱 Starting database seeding for Advocate Case Desk...');

  const passwordHash = await bcrypt.hash('Advocate@123', 10);
  const clientPasswordHash = await bcrypt.hash('Client@123', 10);

  // 1. CREATE USERS
  console.log('👤 Seeding user accounts...');
  const seniorAdvocate = await prisma.user.upsert({
    where: { email: 'advocate@legaldesk.com' },
    update: {},
    create: {
      email: 'advocate@legaldesk.com',
      passwordHash,
      fullName: 'Adv. Rajeshwar V. Deshmukh',
      phone: '+91 98201 12345',
      role: UserRole.ADVOCATE,
      advocateProfile: {
        create: {
          barCouncilNumber: 'MAH/2145/2006',
          enrollmentYear: 2006,
          specialization: 'Commercial Litigation & Constitutional Law',
          officeAddress: 'Chambers 402, High Court Bar Association, Fort',
          city: 'Mumbai',
          state: 'Maharashtra',
          isSeniorAdvocate: true,
        },
      },
    },
  });

  const associate = await prisma.user.upsert({
    where: { email: 'associate@legaldesk.com' },
    update: {},
    create: {
      email: 'associate@legaldesk.com',
      passwordHash,
      fullName: 'Adv. Ananya Sengupta',
      phone: '+91 98330 67890',
      role: UserRole.ASSOCIATE_ADVOCATE,
      advocateProfile: {
        create: {
          barCouncilNumber: 'MAH/8912/2018',
          enrollmentYear: 2018,
          specialization: 'Civil & Criminal Appeals',
          officeAddress: 'Chambers 402, Fort',
          city: 'Mumbai',
          state: 'Maharashtra',
        },
      },
    },
  });

  const staff = await prisma.user.upsert({
    where: { email: 'staff@legaldesk.com' },
    update: {},
    create: {
      email: 'staff@legaldesk.com',
      passwordHash,
      fullName: 'Suresh Patil (Clerk & Registrar Liaison)',
      phone: '+91 97654 32100',
      role: UserRole.LEGAL_STAFF,
    },
  });

  const clientUser = await prisma.user.upsert({
    where: { email: 'client@legaldesk.com' },
    update: {},
    create: {
      email: 'client@legaldesk.com',
      passwordHash: clientPasswordHash,
      fullName: 'Vikramaditya Singhania',
      phone: '+91 99887 76655',
      role: UserRole.CLIENT,
      clientProfile: {
        create: {
          companyName: 'Apex Logistics & Warehousing Pvt. Ltd.',
          idProofType: 'Aadhaar Card',
          idProofNumber: 'XXXX-XXXX-4512',
          preferredLang: 'en',
          address: '42 Nariman Point, Express Towers, Mumbai',
        },
      },
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@legaldesk.com' },
    update: {},
    create: {
      email: 'admin@legaldesk.com',
      passwordHash,
      fullName: 'System Administrator',
      role: UserRole.ADMINISTRATOR,
    },
  });

  // 2. CREATE DOCUMENT CATEGORIES
  console.log('📁 Seeding document categories...');
  const categoriesData = [
    { name: 'First Information Report (FIR)', code: 'FIR', description: 'Police FIR under CrPC' },
    { name: 'Charge-sheet & Police Report', code: 'CHARGE_SHEET', description: 'Investigation report u/s 173 CrPC' },
    { name: 'Plaint / Petition', code: 'PLAINT', description: 'Original Plaint or Writ Petition' },
    { name: 'Written Statement / Reply', code: 'WRITTEN_STATEMENT', description: 'Defence reply or counter affidavit' },
    { name: 'Rejoinder / Replication', code: 'REJOINDER', description: 'Plaintiff response to written statement' },
    { name: 'Vakalatnama & Appearance Memo', code: 'VAKALATNAMA', description: 'Advocate authorization memo' },
    { name: 'Affidavit & Verification', code: 'AFFIDAVIT', description: 'Sworn statements and verification affidavits' },
    { name: 'Daily Court Order', code: 'DAILY_ORDER', description: 'Proceedings sheet and routine directions' },
    { name: 'Final Judgment & Decree', code: 'JUDGMENT', description: 'Substantive judgment or decree' },
    { name: 'Witness Deposition Transcript', code: 'DEPOSITION', description: 'Recorded statements during trial' },
    { name: 'Exhibits & Admitted Records', code: 'EXHIBIT', description: 'Marked exhibits in evidence' },
    { name: 'Bail Order & Surety Bond', code: 'BAIL_ORDER', description: 'Bail application, order, and surety documents' },
    { name: 'Client Correspondence & Agreement', code: 'CLIENT_DOC', description: 'Agreements, notices, and client records' },
    { name: 'Filing Receipt & Defect Memo', code: 'FILING_RECEIPT', description: 'Court e-filing receipts and defect notes' },
    { name: 'Internal Legal Research & Strategy', code: 'STRATEGY_NOTES', description: 'Confidential research notes' },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoriesData) {
    const cat = await prisma.documentCategory.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
    catMap[c.code] = cat.id;
  }

  // 3. CREATE COURTS
  console.log('🏛️ Seeding courts...');
  const bombayHC = await prisma.court.upsert({
    where: {
      name_establishment_district: {
        name: 'High Court of Judicature at Bombay',
        establishment: 'Appellate & Original Side, Mumbai',
        district: 'Mumbai City',
      },
    },
    update: {},
    create: {
      name: 'High Court of Judicature at Bombay',
      establishment: 'Appellate & Original Side, Mumbai',
      courtType: 'High Court',
      state: 'Maharashtra',
      district: 'Mumbai City',
      courtHallNo: 'Court Hall 14',
      benchDesignation: 'Division Bench (Writ Jurisdiction)',
    },
  });

  const delhiHC = await prisma.court.upsert({
    where: {
      name_establishment_district: {
        name: 'High Court of Delhi',
        establishment: 'Principal Bench, New Delhi',
        district: 'New Delhi',
      },
    },
    update: {},
    create: {
      name: 'High Court of Delhi',
      establishment: 'Principal Bench, New Delhi',
      courtType: 'High Court',
      state: 'Delhi',
      district: 'New Delhi',
      courtHallNo: 'Court Room 22',
      benchDesignation: 'Hon’ble Commercial Division Bench',
    },
  });

  const sessionsCourtMumbai = await prisma.court.upsert({
    where: {
      name_establishment_district: {
        name: 'City Civil & Sessions Court, Greater Mumbai',
        establishment: 'Old Sessions Court Building, Fort',
        district: 'Mumbai City',
      },
    },
    update: {},
    create: {
      name: 'City Civil & Sessions Court, Greater Mumbai',
      establishment: 'Old Sessions Court Building, Fort',
      courtType: 'Sessions Court',
      state: 'Maharashtra',
      district: 'Mumbai City',
      courtHallNo: 'Court Hall 08',
      benchDesignation: 'Additional Sessions Judge (Special MP/MLA & Commercial Court)',
    },
  });

  // 4. CREATE CASES
  console.log('⚖️ Seeding litigation cases...');

  // CASE 1: Commercial Suit in Delhi High Court (Apex Logistics v. Vanguard Industrial)
  const case1 = await prisma.case.upsert({
    where: { internalCaseNo: 'ACD/2023/CS-0452' },
    update: {},
    create: {
      internalCaseNo: 'ACD/2023/CS-0452',
      cnrNumber: 'DLHC010045232023',
      caseType: CaseType.COMMERCIAL_DISPUTE,
      caseNumber: 'CS(COMM) 452/2023',
      registrationYear: 2023,
      courtId: delhiHC.id,
      courtEstablishment: delhiHC.establishment,
      judgeDesignation: 'Hon’ble Mr. Justice R. Narayanan',
      filingDate: new Date('2023-04-12'),
      registrationDate: new Date('2023-04-18'),
      proceduralStage: ProceduralStage.FRAMING_OF_ISSUES_CHARGES,
      status: CaseStatus.PENDING,
      priority: CasePriority.HIGH,
      title: 'Apex Logistics & Warehousing Pvt. Ltd. v. Vanguard Industrial Supply Corp.',
      description: 'Commercial suit for recovery of Rs. 4,85,00,000/- with interest arising out of breach of master warehousing contract.',
      statutoryActs: 'Commercial Courts Act, 2015; Code of Civil Procedure, 1908; Indian Contract Act, 1872',
      statutorySections: 'Sec 2(1)(c)(xviii) Commercial Courts Act; Sec 73 Contract Act',
      nextHearingDate: new Date('2026-10-24T10:30:00Z'),
      nextHearingPurpose: 'Framing of Issues and Joint Schedule of Admitted Documents',
      dateVerification: DateVerificationStatus.OFFICIAL_VERIFIED,
      privateNotes: 'Opposite party has omitted critical warehouse delivery inspection logs. Focus cross-examination on admissions in Email Annexure P-14.',
      clientGuidanceNotes: 'Both parties are submitting their list of admitted documents. Your personal presence is not required on 24th October.',
      createdById: seniorAdvocate.id,
      parties: {
        create: [
          {
            partyType: PartyType.PLAINTIFF,
            name: 'Apex Logistics & Warehousing Pvt. Ltd.',
            isOurClient: true,
            email: 'client@legaldesk.com',
            phone: '+91 99887 76655',
            advocateName: 'Adv. Rajeshwar V. Deshmukh',
          },
          {
            partyType: PartyType.DEFENDANT,
            name: 'Vanguard Industrial Supply Corp.',
            isOurClient: false,
            email: 'legal@vanguardcorp.in',
            advocateName: 'Adv. Meenakshi Sundaram',
          },
        ],
      },
      assignments: {
        create: [
          { userId: seniorAdvocate.id, roleInCase: 'Lead Counsel' },
          { userId: associate.id, roleInCase: 'Associate Advocate' },
          { userId: clientUser.id, roleInCase: 'Client Representative' },
        ],
      },
    },
  });

  // CASE 2: Writ Petition in Bombay High Court
  const case2 = await prisma.case.upsert({
    where: { internalCaseNo: 'ACD/2022/WP-8891' },
    update: {},
    create: {
      internalCaseNo: 'ACD/2022/WP-8891',
      cnrNumber: 'BOMC010088912022',
      caseType: CaseType.WRIT_PETITION,
      caseNumber: 'WP(C) 8891/2022',
      registrationYear: 2022,
      courtId: bombayHC.id,
      courtEstablishment: bombayHC.establishment,
      judgeDesignation: 'Division Bench: Justice S.V. Gangapurwala & Justice Bharti Dangre',
      filingDate: new Date('2022-09-05'),
      registrationDate: new Date('2022-09-12'),
      proceduralStage: ProceduralStage.FINAL_ARGUMENTS,
      status: CaseStatus.PENDING,
      priority: CasePriority.URGENT,
      title: 'M/s Horizon Real Estate Developers v. Municipal Corporation of Greater Mumbai & Ors.',
      description: 'Challenge to unlawful stop-work notice issued under Section 354A of MMC Act without affording opportunity of hearing.',
      statutoryActs: 'Constitution of India (Article 226); Mumbai Municipal Corporation Act, 1888',
      statutorySections: 'Article 226, Article 14, Article 300A; Sec 354A MMC Act',
      nextHearingDate: new Date('2026-10-28T11:00:00Z'),
      nextHearingPurpose: 'Final Hearing and Disposal of Writ Petition',
      dateVerification: DateVerificationStatus.OFFICIAL_VERIFIED,
      privateNotes: 'MCGM affidavit filed belatedly. Rely on Bombay HC full bench precedent in Super Max Art on non-compliance with natural justice.',
      clientGuidanceNotes: 'The Hon’ble High Court will conclude final arguments on 28th October. Ad-interim stay against demolition continues.',
      createdById: seniorAdvocate.id,
      parties: {
        create: [
          {
            partyType: PartyType.PETITIONER,
            name: 'M/s Horizon Real Estate Developers',
            isOurClient: true,
            email: 'projects@horizonrealty.in',
            advocateName: 'Adv. Rajeshwar V. Deshmukh',
          },
          {
            partyType: PartyType.RESPONDENT,
            name: 'Municipal Corporation of Greater Mumbai (MCGM)',
            isOurClient: false,
            advocateName: 'Adv. S. Karmarkar',
          },
        ],
      },
      assignments: {
        create: [
          { userId: seniorAdvocate.id, roleInCase: 'Lead Counsel' },
          { userId: associate.id, roleInCase: 'Associate Advocate' },
        ],
      },
    },
  });

  // CASE 3: Criminal Bail Matter in Sessions Court
  const case3 = await prisma.case.upsert({
    where: { internalCaseNo: 'ACD/2024/BA-1234' },
    update: {},
    create: {
      internalCaseNo: 'ACD/2024/BA-1234',
      cnrNumber: 'MAHA020012342024',
      caseType: CaseType.CRIMINAL_CASE,
      caseNumber: 'BA 1234/2024',
      registrationYear: 2024,
      courtId: sessionsCourtMumbai.id,
      courtEstablishment: sessionsCourtMumbai.establishment,
      judgeDesignation: 'Hon’ble Additional Sessions Judge (Court 08)',
      filingDate: new Date('2024-02-10'),
      registrationDate: new Date('2024-02-11'),
      proceduralStage: ProceduralStage.PRE_ADMISSION_HEARING,
      status: CaseStatus.PENDING,
      priority: CasePriority.URGENT,
      title: 'State of Maharashtra v. Rajesh Manilal Shah (In re: C.R. No. 89/2024, Azad Maidan P.S.)',
      description: 'Anticipatory / Regular Bail application arising out of FIR alleging cheating and breach of trust under IPC 420, 406, 34.',
      statutoryActs: 'Code of Criminal Procedure, 1973; Indian Penal Code, 1860',
      statutorySections: 'Sec 438 & 439 CrPC; Sec 420, 406, 34 IPC',
      policeStation: 'Azad Maidan Police Station, Mumbai',
      firNumber: '89',
      firYear: 2024,
      nextHearingDate: new Date('2026-10-18T11:30:00Z'),
      nextHearingPurpose: 'Hearing on Regular Bail Application with Police Case Diary',
      dateVerification: DateVerificationStatus.OFFICIAL_VERIFIED,
      privateNotes: 'Custodial interrogation unnecessary as all commercial accounts and bank statements are already seized.',
      createdById: seniorAdvocate.id,
      parties: {
        create: [
          {
            partyType: PartyType.ACCUSED,
            name: 'Rajesh Manilal Shah',
            isOurClient: true,
            email: 'rajesh.shah@enterprise.com',
            phone: '+91 98210 99887',
            advocateName: 'Adv. Rajeshwar V. Deshmukh',
          },
          {
            partyType: PartyType.PROSECUTION,
            name: 'State of Maharashtra (IO API Shinde)',
            isOurClient: false,
            advocateName: 'Public Prosecutor Smt. Anjali Joshi',
          },
        ],
      },
      assignments: {
        create: [
          { userId: seniorAdvocate.id, roleInCase: 'Lead Counsel' },
          { userId: associate.id, roleInCase: 'Associate Advocate' },
        ],
      },
    },
  });

  // 5. SEED DOCUMENTS WITH DIGITIZED SAMPLES & EXTRACTED TEXT
  console.log('📄 Seeding digitized documents & OCR text...');
  const storageDir = path.resolve(process.cwd(), './storage/documents');
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });

  const sampleDocs = [
    {
      caseId: case1.id,
      categoryId: catMap['PLAINT'],
      displayName: 'Commercial_Plaint_CS_COMM_452_2023.pdf',
      originalFilename: 'Commercial_Plaint_Final_Signed.pdf',
      fileType: 'application/pdf',
      fileSize: 2450000,
      pageCount: 38,
      visibility: DocumentVisibility.CLIENT_VISIBLE,
      textSample:
        'IN THE HIGH COURT OF DELHI AT NEW DELHI (COMMERCIAL DIVISION) CS(COMM) NO. 452 OF 2023. In the matter of Apex Logistics & Warehousing Pvt. Ltd. Plaintiff versus Vanguard Industrial Supply Corp. Defendant. SUIT FOR RECOVERY OF RS. 4,85,00,000/- ALONG WITH PENDENTE LITE AND FUTURE INTEREST AT 18% PER ANNUM. The plaintiff submits that on 15th March 2021, the parties entered into a Master Logistics Service Agreement for provision of temperature-controlled warehousing at Bhiwandi, Maharashtra. Defendant failed to pay invoices numbered INV-2021-089 through INV-2022-044.',
    },
    {
      caseId: case1.id,
      categoryId: catMap['WRITTEN_STATEMENT'],
      displayName: 'Written_Statement_Vanguard_Corp.pdf',
      originalFilename: 'WS_Vanguard_Supply_Corp.pdf',
      fileType: 'application/pdf',
      fileSize: 1840000,
      pageCount: 26,
      visibility: DocumentVisibility.ADVOCATE_ONLY,
      textSample:
        'IN THE HIGH COURT OF DELHI AT NEW DELHI. WRITTEN STATEMENT ON BEHALF OF DEFENDANT VANGUARD INDUSTRIAL SUPPLY CORP. Preliminary Objections: The suit is barred by limitation and the claim of the plaintiff is inflated. Without prejudice, the consignment of pharmaceutical inventory suffered temperature variation exceeding 4 degrees Celsius due to power failure at plaintiffs Bhiwandi warehouse, causing damages of Rs. 2.1 crores to the defendant.',
    },
    {
      caseId: case1.id,
      categoryId: catMap['VAKALATNAMA'],
      displayName: 'Vakalatnama_Apex_Logistics.pdf',
      originalFilename: 'Vakalatnama_Executed.pdf',
      fileType: 'application/pdf',
      fileSize: 850000,
      pageCount: 2,
      visibility: DocumentVisibility.CLIENT_VISIBLE,
      textSample:
        'VAKALATNAMA. I, Vikramaditya Singhania, Managing Director of Apex Logistics & Warehousing Pvt. Ltd., do hereby appoint and retain Adv. Rajeshwar V. Deshmukh (Enr MAH/2145/2006) to appear, plead and act on my behalf in CS(COMM) 452/2023 before the Hon’ble High Court of Delhi.',
    },
    {
      caseId: case3.id,
      categoryId: catMap['FIR'],
      displayName: 'Certified_Copy_FIR_89_2024_Azad_Maidan.pdf',
      originalFilename: 'FIR_89_2024_Certified.pdf',
      fileType: 'application/pdf',
      fileSize: 1200000,
      pageCount: 6,
      visibility: DocumentVisibility.CLIENT_VISIBLE,
      textSample:
        'FIRST INFORMATION REPORT (Under Section 154 Cr.P.C.) Police Station: Azad Maidan, District: Mumbai City. FIR No. 89/2024 Date: 12.01.2024. Acts & Sections: IPC 1860, Sections 420, 406, 34. Complainant: Rameshwar K. Gupta. Accused: Rajesh Manilal Shah. Brief Facts: Complainant invested Rs. 75,00,000 in equity partnership for import of specialized electronics. Alleged that accused diverted funds without supplying goods.',
    },
    {
      caseId: case3.id,
      categoryId: catMap['BAIL_ORDER'],
      displayName: 'Interim_Bail_Order_Sessions_Court.pdf',
      originalFilename: 'Interim_Order_Court_8.pdf',
      fileType: 'application/pdf',
      fileSize: 920000,
      pageCount: 3,
      visibility: DocumentVisibility.CLIENT_VISIBLE,
      textSample:
        'IN THE COURT OF SESSIONS FOR GREATER MUMBAI AT FORT. BA NO. 1234 OF 2024. ORDER: Heard learned counsel for applicant Adv. Deshmukh and learned APP Smt. Joshi. Interim protection is granted to applicant Rajesh Manilal Shah in event of arrest in C.R. No. 89/2024 on furnishing PR Bond of Rs. 50,000/- with one surety. Conditions: 1. Applicant shall attend Azad Maidan Police Station every Monday and Thursday between 11:00 AM to 1:00 PM. 2. Applicant shall not leave Mumbai without prior permission.',
    },
  ];

  for (const docInfo of sampleDocs) {
    const caseFolder = path.join(storageDir, docInfo.caseId);
    if (!fs.existsSync(caseFolder)) fs.mkdirSync(caseFolder, { recursive: true });

    const relativePath = path.join(docInfo.caseId, docInfo.displayName);
    const fullPath = path.join(storageDir, relativePath);

    // Write mock dummy buffer for storage integrity
    const dummyBuffer = Buffer.from(`%PDF-1.4\n% Advocate Case Desk Digitized File\n${docInfo.textSample}\n%%EOF`);
    fs.writeFileSync(fullPath, dummyBuffer);
    const checksum = crypto.createHash('sha256').update(dummyBuffer).digest('hex');

    const createdDoc = await prisma.caseDocument.create({
      data: {
        caseId: docInfo.caseId,
        categoryId: docInfo.categoryId,
        displayName: docInfo.displayName,
        originalFilename: docInfo.originalFilename,
        fileType: docInfo.fileType,
        fileSize: docInfo.fileSize,
        pageCount: docInfo.pageCount,
        storagePath: relativePath,
        checksumSha256: checksum,
        visibility: docInfo.visibility,
        ocrStatus: OCRProcessingStatus.COMPLETED,
        ocrConfidence: 98.5,
        uploadedById: seniorAdvocate.id,
        documentDate: new Date(),
        extractedPages: {
          create: [
            {
              pageNumber: 1,
              extractedText: docInfo.textSample,
              confidence: 98.5,
              isOcr: false,
              language: 'eng',
            },
          ],
        },
      },
    });
  }

  // 6. SEED HEARINGS & CHRONOLOGY
  console.log('📅 Seeding hearing chronologies...');
  await prisma.hearing.create({
    data: {
      caseId: case1.id,
      courtId: delhiHC.id,
      hearingDate: new Date('2026-08-14T10:30:00Z'),
      purpose: 'Completion of Pleadings',
      proceedings: 'Rejoinder filed by plaintiff taken on record. Learned counsel for defendant completed admission and denial of documents. Time granted for framing of issues.',
      orderPassed: 'Parties directed to prepare joint statement of admitted facts and contested issues by next date.',
      nextHearingDate: new Date('2026-10-24T10:30:00Z'),
      nextHearingPurpose: 'Framing of Issues and Admission/Denial of Documents',
      clientSummary: 'The court accepted our rejoinder affidavit. The dispute will now move to framing of legal issues.',
      dateVerification: DateVerificationStatus.OFFICIAL_VERIFIED,
      isCompleted: true,
      attendances: {
        create: {
          userId: seniorAdvocate.id,
          status: HearingAttendanceStatus.ATTENDED,
        },
      },
    },
  });

  await prisma.hearing.create({
    data: {
      caseId: case3.id,
      courtId: sessionsCourtMumbai.id,
      hearingDate: new Date('2026-09-28T11:00:00Z'),
      purpose: 'Hearing on Say of Investigating Officer',
      proceedings: 'IO API Shinde filed reply in bail application. Public Prosecutor sought one week time to produce bank audit report.',
      orderPassed: 'Interim protection extended till 18th October 2026. Applicant shall continue cooperation with investigation.',
      nextHearingDate: new Date('2026-10-18T11:30:00Z'),
      nextHearingPurpose: 'Final Hearing on Regular Bail',
      clientSummary: 'Interim protection from arrest was extended until 18th October. You must continue attending the police station on Mondays.',
      dateVerification: DateVerificationStatus.OFFICIAL_VERIFIED,
      isCompleted: true,
      attendances: {
        create: {
          userId: seniorAdvocate.id,
          status: HearingAttendanceStatus.ATTENDED,
        },
      },
    },
  });

  // 7. SEED E-FILING RECORDS
  console.log('📤 Seeding e-filing records...');
  const filing1 = await prisma.efilingRecord.create({
    data: {
      caseId: case1.id,
      filingType: 'Commercial Plaint & Interim Application',
      filingTitle: 'Plaint u/O VII Rule 1 r/w Sec 2 Commercial Courts Act',
      portalName: 'Delhi High Court e-Filing 3.0',
      portalUrl: 'https://delhihighcourt.nic.in/efiling',
      diaryNumber: 'DHC-COMM-2023-09412',
      filingNumber: 'CS(COMM) 452/2023',
      acknowledgementNumber: 'ACK-DHC-9812401',
      submissionDate: new Date('2023-04-12'),
      currentStatus: EfilingStatus.ACCEPTED_REGISTERED,
      acceptanceDate: new Date('2023-04-18'),
      notes: 'Initial scrutiny defects cured within 48 hours. Matter listed before Court 22.',
      createdById: seniorAdvocate.id,
      statusHistory: {
        create: [
          {
            previousStatus: EfilingStatus.SAVED_IN_CASE_FILE,
            newStatus: EfilingStatus.SUBMITTED_TO_PORTAL,
            changeNote: 'Filed on Delhi High Court e-Filing portal',
            changedBy: seniorAdvocate.id,
          },
          {
            previousStatus: EfilingStatus.SUBMITTED_TO_PORTAL,
            newStatus: EfilingStatus.DEFECTS_RAISED,
            changeNote: 'Defect: Statement of Truth signature missing on Annexure P-8',
            changedBy: seniorAdvocate.id,
          },
          {
            previousStatus: EfilingStatus.DEFECTS_RAISED,
            newStatus: EfilingStatus.RESUBMISSION_REQUIRED,
            changeNote: 'Re-uploaded digitally signed Statement of Truth',
            changedBy: associate.id,
          },
          {
            previousStatus: EfilingStatus.RESUBMISSION_REQUIRED,
            newStatus: EfilingStatus.ACCEPTED_REGISTERED,
            changeNote: 'Scrutiny passed. Case registered as CS(COMM) 452/2023',
            changedBy: staff.id,
          },
        ],
      },
    },
  });

  // 8. SEED WITNESSES & EXHIBITS
  console.log('🎙️ Seeding witnesses & exhibits...');
  const witness1 = await prisma.witness.create({
    data: {
      caseId: case1.id,
      witnessNumber: 'PW-1',
      name: 'Vikramaditya Singhania (Managing Director, Apex Logistics)',
      witnessType: WitnessType.PROSECUTION_WITNESS,
      currentStage: ExaminationStage.EXAMINATION_IN_CHIEF,
      testimonySummary: 'Testified regarding execution of warehousing agreement and proof of delivery of consignments.',
      mobile: '+91 99887 76655',
      depositions: {
        create: {
          examinationType: ExaminationStage.EXAMINATION_IN_CHIEF,
          depositionDate: new Date('2026-07-15'),
          transcriptSummary: 'Deposed that the temperature tracking system is automated with calibrated sensors. Produced ledger accounts marked as Exh P-1.',
          keyAdmissions: 'Affirmed that invoice reconciliation was conducted quarterly.',
        },
      },
    },
  });

  await prisma.exhibit.create({
    data: {
      caseId: case1.id,
      exhibitNumber: 'Exh P-1',
      description: 'Master Warehousing Contract executed between Apex Logistics and Vanguard Corp dated 15.03.2021',
      markedBy: 'Plaintiff (PW-1)',
      markingDate: new Date('2026-07-15'),
      objectionRaised: false,
      custodyDetails: 'Original in Court Record; Duplicate in Advocate Brief',
    },
  });

  // 9. SEED BAIL RECORD & SURETY
  console.log('🛡️ Seeding bail & surety compliance...');
  await prisma.bailRecord.create({
    data: {
      caseId: case3.id,
      accusedName: 'Rajesh Manilal Shah',
      bailType: BailType.REGULAR,
      status: BailStatus.GRANTED,
      applicationDate: new Date('2024-02-10'),
      orderDate: new Date('2024-02-15'),
      bailConditions: 'PR Bond Rs. 50,000/-, one solvent surety, bi-weekly police station attendance',
      suretyCount: 1,
      suretyAmount: 50000,
      sureties: {
        create: {
          suretyName: 'Harish Manilal Shah (Brother)',
          relationship: 'Brother',
          idProofType: 'Aadhaar Card',
          idProofNumber: 'XXXX-XXXX-9912',
          propertyDetails: 'Flat 302, Sagar Darshan CHS, Prabhadevi, Mumbai',
          bondAmount: 50000,
          solvencyStatus: 'Solvent (Electricity bill and tax receipts verified)',
        },
      },
      conditions: {
        create: [
          {
            conditionText: 'Attend Azad Maidan Police Station every Monday and Thursday between 11 AM - 1 PM',
            frequency: 'Bi-weekly (Mon & Thu)',
            nextDueDate: new Date('2026-10-12T11:00:00Z'),
            isComplied: true,
          },
          {
            conditionText: 'Surrender passport to the Investigating Officer',
            frequency: 'One-time compliance',
            isComplied: true,
          },
        ],
      },
    },
  });

  // 10. SEED TASKS & DEADLINES
  console.log('✅ Seeding tasks & deadlines...');
  await prisma.task.createMany({
    data: [
      {
        caseId: case1.id,
        title: 'Draft Joint Statement of Contested Issues',
        description: 'Coordinate with Adv. Meenakshi Sundaram to finalize 5 concise issues for determination under Order XIV CPC.',
        assignedToId: associate.id,
        createdById: seniorAdvocate.id,
        priority: TaskPriority.HIGH,
        status: TaskStatus.IN_PROGRESS,
        dueDate: new Date('2026-10-20T18:00:00Z'),
        isLimitation: false,
      },
      {
        caseId: case1.id,
        title: 'Compile Bench Bundle of Admitted Invoices',
        description: 'Prepare 3 sets of paginated and index-tabbed folders for Hon’ble Court 22.',
        assignedToId: staff.id,
        createdById: seniorAdvocate.id,
        priority: TaskPriority.MEDIUM,
        status: TaskStatus.TODO,
        dueDate: new Date('2026-10-22T17:00:00Z'),
      },
      {
        caseId: case2.id,
        title: 'Prepare Written Submissions in WP(C) 8891/2022',
        description: 'Draft 5-page concise note on non-application of mind in Sec 354A notice with case laws.',
        assignedToId: associate.id,
        createdById: seniorAdvocate.id,
        priority: TaskPriority.URGENT,
        status: TaskStatus.TODO,
        dueDate: new Date('2026-10-26T12:00:00Z'),
      },
    ],
  });

  // 11. SEED CLIENT MESSAGING & DOCUMENT REQUESTS
  console.log('💬 Seeding client communication...');
  await prisma.clientMessage.create({
    data: {
      caseId: case1.id,
      senderId: seniorAdvocate.id,
      senderType: MessageSenderType.ADVOCATE,
      messageText: 'Good afternoon Mr. Singhania. The rejoinder has been accepted by the Delhi High Court. Next hearing is on 24th October for framing of issues. Your personal attendance will not be required.',
      isRead: true,
      readAt: new Date(),
    },
  });

  await prisma.clientMessage.create({
    data: {
      caseId: case1.id,
      senderId: clientUser.id,
      senderType: MessageSenderType.CLIENT,
      messageText: 'Thank you Adv. Deshmukh. We have located the additional temperature calibration certificates for the Bhiwandi facility. Should I upload them here?',
      isRead: true,
      readAt: new Date(),
    },
  });

  await prisma.documentRequest.create({
    data: {
      caseId: case1.id,
      requestedTitle: 'Bhiwandi Cold Storage Calibration Certificates (2021-2022)',
      description: 'Original annual sensor calibration reports signed by certified refrigeration engineer to counter defendant’s power failure allegation.',
      isMandatory: true,
      deadline: new Date('2026-10-18T23:59:59Z'),
      isUploaded: false,
      requestedById: seniorAdvocate.id,
    },
  });

  console.log('🎉 Seeding successfully completed!');
  console.log('Credentials:');
  console.log('  Advocate: advocate@legaldesk.com / Advocate@123');
  console.log('  Associate: associate@legaldesk.com / Advocate@123');
  console.log('  Client: client@legaldesk.com / Client@123');
  console.log('  Staff: staff@legaldesk.com / Advocate@123');
  console.log('  Admin: admin@legaldesk.com / Advocate@123');
}

seed()
  .catch(e => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
