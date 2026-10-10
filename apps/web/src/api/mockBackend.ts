import { Case, User, UserRole, CaseType, ProceduralStage, CasePriority, CaseStatus } from '../types';

// The advocate's primary real case: Satara Sessions Trial (CNR: MHST010020592021)
export const REAL_ADVOCATE_CASE: any = {
  id: '68f40a77-d59d-4e00-a7fa-7b1b972d2c07',
  internalCaseNo: 'ACD/2021/SC-2059',
  cnrNumber: 'MHST010020592021',
  caseType: 'CRIMINAL_CASE' as CaseType,
  caseNumber: 'Sessions Case No. 2059/2021',
  registrationYear: 2021,
  courtId: 'court-satara',
  courtEstablishment: 'District & Sessions Court Complex, Sadar Bazar, Satara',
  judgeDesignation: 'Hon’ble Additional Sessions Judge-1 & Special Judge, Satara (Court Hall 3)',
  filingDate: '2021-06-28T00:00:00.000Z',
  registrationDate: '2021-07-05T00:00:00.000Z',
  proceduralStage: 'PETITIONER_PROSECUTION_EVIDENCE' as ProceduralStage,
  status: 'PENDING' as CaseStatus,
  priority: 'HIGH' as CasePriority,
  title: 'State of Maharashtra v. Anandrao Vishwanath Patil & Ors. (Crime No. 142/2021, Karad City P.S.)',
  description: 'Sessions Trial arising out of Karad City P.S. FIR No. 142/2021 under IPC Sections 307, 326, 324, 147, 148, 149. Cross-examination of prosecution medical witness PW-2 scheduled.',
  statutoryActs: 'Indian Penal Code, 1860; Code of Criminal Procedure, 1973; Maharashtra Police Act, 1951',
  statutorySections: 'Sec 307 (Attempt to murder), 326 (Voluntarily causing grievous hurt), 324, 149 IPC',
  policeStation: 'Karad City Police Station, District Satara',
  firNumber: '142',
  firYear: 2021,
  nextHearingDate: '2026-10-29T10:30:00.000Z',
  nextHearingPurpose: 'Cross-Examination of PW-2 (Dr. A. K. Kadam) & Further Prosecution Evidence',
  dateVerification: 'OFFICIAL_VERIFIED',
  privateNotes: 'Cross-examination strategy: Emphasize variance between FIR injury column and PW-2 medicolegal entry. Bring out delayed arrival at casualty register.',
  clientGuidanceNotes: 'Accused bail sureties need not remain physically present on 29th October; lead advocate will conduct cross-examination.',
  court: {
    name: 'District & Sessions Court, Satara',
    courtType: 'Sessions Court',
    district: 'Satara',
    state: 'Maharashtra',
    courtHallNo: 'Court Hall 03',
    benchDesignation: 'Hon’ble Additional Sessions Judge-1',
  },
  parties: [
    {
      id: 'p-1',
      partyType: 'PROSECUTION',
      name: 'State of Maharashtra (through Karad City Police Station)',
      isOurClient: false,
      advocateName: 'Additional Public Prosecutor S. M. Deshpande',
    },
    {
      id: 'p-2',
      partyType: 'ACCUSED',
      name: 'Anandrao Vishwanath Patil (Accused No. 1)',
      isOurClient: true,
      advocateName: 'Adv. Rajeshwar V. Deshmukh / Adv. Ananya Sengupta',
      phone: '+91 98220 54321',
    },
    {
      id: 'p-3',
      partyType: 'ACCUSED',
      name: 'Suresh Anandrao Patil (Accused No. 2)',
      isOurClient: true,
      advocateName: 'Adv. Rajeshwar V. Deshmukh',
    },
  ],
  hearings: [
    {
      id: 'h-1',
      hearingDate: '2026-10-29T10:30:00.000Z',
      courtRoomNo: 'Court Hall 03',
      itemNumber: 'Item 14',
      purpose: 'Cross-Examination of PW-2 (Dr. A. K. Kadam) & Further Prosecution Evidence',
      businessOnDate: 'Cause List Item No. 14 (Special Session)',
      attendanceStatus: 'PLANNED',
      verifiedByOfficialSource: true,
    },
    {
      id: 'h-2',
      hearingDate: '2026-09-12T10:30:00.000Z',
      courtRoomNo: 'Court Hall 03',
      itemNumber: 'Item 08',
      purpose: 'Prosecution Evidence (Chief of PW-2)',
      businessOnDate: 'PW-2 Dr. Kadam examined in chief. Marked Exh P-2. Cross-examination deferred for production of casualty register.',
      attendanceStatus: 'ATTENDED',
      verifiedByOfficialSource: true,
    },
    {
      id: 'h-3',
      hearingDate: '2026-08-18T10:30:00.000Z',
      courtRoomNo: 'Court Hall 03',
      itemNumber: 'Item 04',
      purpose: 'Prosecution Evidence (Cross of PW-1)',
      businessOnDate: 'PW-1 cross-examined at length by defence counsel. Exh P-1 and Exh D-1 marked. Evidence of PW-1 closed.',
      attendanceStatus: 'ATTENDED',
      verifiedByOfficialSource: true,
    },
    {
      id: 'h-4',
      hearingDate: '2026-06-25T10:30:00.000Z',
      courtRoomNo: 'Court Hall 03',
      itemNumber: 'Item 02',
      purpose: 'Framing of Charges',
      businessOnDate: 'Charges framed under IPC 307, 326, 324, 147, 148, 149 against accused. Accused pleaded not guilty and claimed trial.',
      attendanceStatus: 'ATTENDED',
      verifiedByOfficialSource: true,
    },
  ],
  witnesses: [
    {
      id: 'w-1',
      witnessNumber: 'PW-1',
      fullName: 'Pandurang Shamrao Mane',
      witnessType: 'EYEWITNESS',
      isHostile: false,
      examinationStage: 'CROSS_EXAMINATION_COMPLETED',
      keyTestimonyNotes: 'Deposed on occurrence at market yard. Admitted on cross-examination that street lights were defective at 9:30 PM.',
      credibilityAssessment: 'Partially shaken during defence cross-examination on identity and illumination.',
    },
    {
      id: 'w-2',
      witnessNumber: 'PW-2',
      fullName: 'Dr. Ashok Krishnaji Kadam',
      witnessType: 'EXPERT_WITNESS',
      isHostile: false,
      examinationStage: 'CHIEF_EXAMINATION_COMPLETED',
      keyTestimonyNotes: 'Civil Hospital MO who recorded MLC No. 892. Marked Post-Injury Certificate as Exh P-2.',
      credibilityAssessment: 'Official medical witness; defence to test weapon compatibility on 29.10.2026.',
    },
    {
      id: 'w-3',
      witnessNumber: 'PW-3',
      fullName: 'Police Sub-Inspector V. S. Shinde',
      witnessType: 'INVESTIGATING_OFFICER',
      isHostile: false,
      examinationStage: 'SUMMONED',
      keyTestimonyNotes: 'Investigating Officer who drew spot panchnama and recovered wooden log under Section 27 Evidence Act.',
    },
  ],
  exhibits: [
    {
      id: 'ex-1',
      exhibitNumber: 'Exh P-1',
      markingParty: 'PROSECUTION',
      title: 'Original FIR & Written Information u/s 154 CrPC',
      description: 'First Information recorded on statement of complainant Pandurang Mane at Karad City Police Station.',
      isAdmitted: true,
      markedDate: '2026-08-18',
    },
    {
      id: 'ex-2',
      exhibitNumber: 'Exh P-2',
      markingParty: 'PROSECUTION',
      title: 'Medicolegal Injury Certificate (Civil Hospital Satara)',
      description: 'MLC Record detailing sharp & contused lacerated wounds on victim.',
      isAdmitted: true,
      markedDate: '2026-09-12',
    },
    {
      id: 'ex-3',
      exhibitNumber: 'Exh D-1',
      markingParty: 'DEFENCE',
      title: 'MSEDCL Certified Electricity Outage Certificate',
      description: 'Certificate from electricity distribution company showing load shedding in Sadar Bazar between 8 PM and 11 PM.',
      isAdmitted: true,
      markedDate: '2026-08-18',
    },
  ],
  orders: [
    {
      id: 'ord-1',
      orderDate: '2026-09-12T00:00:00.000Z',
      orderType: 'INTERLOCUTORY',
      title: 'Trial Proceedings & Deferment Order',
      summaryText: 'Cross-examination of PW-2 deferred to 29.10.2026 at request of parties for original casualty register.',
      isFinalJudgment: false,
    },
    {
      id: 'ord-2',
      orderDate: '2026-06-25T00:00:00.000Z',
      orderType: 'CHARGE_ORDER',
      title: 'Order on Framing of Formal Charges',
      summaryText: 'Formal charges framed under Sections 307, 326, 324 r/w 149 of IPC. Accused claimed trial.',
      isFinalJudgment: false,
    },
    {
      id: 'ord-3',
      orderDate: '2021-07-15T00:00:00.000Z',
      orderType: 'BAIL_ORDER',
      title: 'Regular Bail Order (Court 3)',
      summaryText: 'Regular bail granted to Accused No. 1 on PR bond of Rs 25,000 with one solvent surety.',
      isFinalJudgment: false,
    },
  ],
  documents: [
    {
      id: 'doc-1',
      displayName: 'Certified_Chargesheet_Crime_142_2021.pdf',
      originalFilename: 'Chargesheet_Karad_PS.pdf',
      fileSize: 4200000,
      pageCount: 64,
      visibility: 'CLIENT_VISIBLE',
      ocrStatus: 'COMPLETED',
      createdAt: '2021-07-05T00:00:00.000Z',
      category: { name: 'Charge-sheet & Police Report', code: 'CHARGE_SHEET' },
    },
    {
      id: 'doc-2',
      displayName: 'MLC_Medical_Certificate_Exh_P2.pdf',
      originalFilename: 'MLC_Satara_Hospital.pdf',
      fileSize: 1100000,
      pageCount: 4,
      visibility: 'CLIENT_VISIBLE',
      ocrStatus: 'COMPLETED',
      createdAt: '2026-09-12T00:00:00.000Z',
      category: { name: 'Exhibits & Admitted Records', code: 'EXHIBIT' },
    },
  ],
  tasks: [
    {
      id: 't-1',
      title: 'Prepare Medical Cross-Examination Brief for Dr. Kadam (PW-2)',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      dueDate: '2026-10-28T00:00:00.000Z',
    },
  ],
  messages: [
    {
      id: 'm-1',
      senderType: 'ADVOCATE',
      senderName: 'Adv. Rajeshwar V. Deshmukh',
      messageText: 'Sessions trial listed on 29th October for Dr. Kadam (PW-2) cross-examination. Brief preparation completed.',
      createdAt: '2026-10-08T11:20:00.000Z',
    },
  ],
  bailRecords: [
    {
      id: 'b-1',
      bailType: 'REGULAR_BAIL',
      applicantName: 'Anandrao Vishwanath Patil',
      suretyName: 'Hanmantrao Patil (Solvent Surety)',
      bondAmount: 25000,
      status: 'BAIL_GRANTED',
      grantedDate: '2021-07-15T00:00:00.000Z',
    },
  ],
  efilingRecords: [],
};

// Initial state containing ONLY the advocate's real case
const DEFAULT_CASES = [REAL_ADVOCATE_CASE];

export const getStoredCases = (): any[] => {
  try {
    const raw = localStorage.getItem('demo_advocate_cases_v2');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_CASES;
};

export const saveStoredCases = (cases: any[]) => {
  try {
    localStorage.setItem('demo_advocate_cases_v2', JSON.stringify(cases));
  } catch (e) {
    // ignore
  }
};

// Users map for demo logins
export const DEMO_USERS: Record<string, User> = {
  'advocate@legaldesk.com': {
    id: 'user-advocate-1',
    email: 'advocate@legaldesk.com',
    fullName: 'Adv. Rajeshwar V. Deshmukh',
    phone: '+91 98201 12345',
    role: 'ADVOCATE' as UserRole,
  },
  'associate@legaldesk.com': {
    id: 'user-associate-1',
    email: 'associate@legaldesk.com',
    fullName: 'Adv. Ananya Sengupta',
    phone: '+91 98330 67890',
    role: 'ASSOCIATE_ADVOCATE' as UserRole,
  },
  'client@legaldesk.com': {
    id: 'user-client-1',
    email: 'client@legaldesk.com',
    fullName: 'Anandrao Vishwanath Patil',
    phone: '+91 98220 54321',
    role: 'CLIENT' as UserRole,
  },
  'staff@legaldesk.com': {
    id: 'user-staff-1',
    email: 'staff@legaldesk.com',
    fullName: 'Suresh Patil (Chamber Clerk)',
    phone: '+91 97654 32100',
    role: 'LEGAL_STAFF' as UserRole,
  },
  'admin@legaldesk.com': {
    id: 'user-admin-1',
    email: 'admin@legaldesk.com',
    fullName: 'System Administrator',
    phone: '+91 98000 00000',
    role: 'ADMINISTRATOR' as UserRole,
  },
};

/**
 * Handle all backend endpoints cleanly to prevent 404s and white blank screens
 */
export function handleMockRequest(url: string, method: string, data?: any, params?: any): { status: number; data: any } | null {
  const cleanUrl = url.replace(/^\/api\/v1/, '').split('?')[0];
  const m = method.toLowerCase();

  // 1. AUTH / LOGIN
  if (cleanUrl === '/auth/login' && m === 'post') {
    const email = (data?.email || 'advocate@legaldesk.com').toLowerCase();
    const matchedUser = DEMO_USERS[email] || {
      id: 'demo-user-auto',
      email,
      fullName: 'Adv. Rajeshwar V. Deshmukh',
      role: 'ADVOCATE' as UserRole,
    };

    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          token: 'demo-jwt-token-active-session',
          user: matchedUser,
        },
      },
    };
  }

  // 2. AUTH / LOGOUT
  if (cleanUrl === '/auth/logout') {
    return { status: 200, data: { status: 'success', message: 'Logged out' } };
  }

  // 3. DASHBOARD SUMMARY
  if (cleanUrl === '/dashboard/summary') {
    const allCases = getStoredCases();
    const allHearings = allCases.flatMap(c =>
      (c.hearings || []).map((h: any) => ({
        ...h,
        case: { id: c.id, caseNumber: c.caseNumber, title: c.title },
        court: c.court || { name: c.courtEstablishment || 'Court Hall 03' },
      }))
    );

    const allTasks = allCases.flatMap(c =>
      (c.tasks || []).map((t: any) => ({
        ...t,
        case: { id: c.id, caseNumber: c.caseNumber, title: c.title },
        assignedTo: { fullName: 'Adv. Ananya Sengupta' },
      }))
    );

    const allDocs = allCases.flatMap(c =>
      (c.documents || []).map((d: any) => ({
        ...d,
        case: { id: c.id, caseNumber: c.caseNumber },
      }))
    );

    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          metrics: {
            totalCases: allCases.length,
            activeCasesCount: allCases.length,
            hearingsTodayCount: 0,
            hearingsTomorrowCount: 0,
            hearingsThisWeekCount: allHearings.length,
            overdueTasksCount: allTasks.length,
            pendingDefectsCount: 0,
            unverifiedDatesCount: 0,
          },
          hearingsToday: [],
          hearingsTomorrow: [],
          hearingsThisWeek: allHearings,
          overdueTasks: allTasks,
          pendingDefects: [],
          recentDocuments: allDocs,
          unverifiedDates: [],
        },
      },
    };
  }

  // 4. CASES: GET ALL
  if (cleanUrl === '/cases' && m === 'get') {
    let list = getStoredCases();
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(c =>
        c.title?.toLowerCase().includes(q) ||
        c.caseNumber?.toLowerCase().includes(q) ||
        c.cnrNumber?.toLowerCase().includes(q)
      );
    }
    if (params?.caseType) {
      list = list.filter(c => c.caseType === params.caseType);
    }
    return {
      status: 200,
      data: { status: 'success', data: list },
    };
  }

  // 5. CASES: CREATE NEW CASE (Advocate adding case by their number / CNR)
  if (cleanUrl === '/cases' && m === 'post') {
    const allCases = getStoredCases();
    const newCase = {
      ...data,
      id: `case-${Date.now()}`,
      status: 'PENDING',
      parties: data.parties || [
        {
          id: `p-${Date.now()}-1`,
          name: data.parties?.[0]?.name || 'Client Litigant',
          partyType: 'PETITIONER',
          isOurClient: true,
          advocateName: 'Adv. Rajeshwar V. Deshmukh',
        },
      ],
      hearings: data.nextHearingDate
        ? [
            {
              id: `h-${Date.now()}`,
              hearingDate: new Date(data.nextHearingDate).toISOString(),
              purpose: data.nextHearingPurpose || 'First Appearance / Admission',
              attendanceStatus: 'PLANNED',
              verifiedByOfficialSource: true,
            },
          ]
        : [],
      witnesses: [],
      exhibits: [],
      orders: [],
      documents: [],
      tasks: [],
      messages: [],
      bailRecords: [],
      efilingRecords: [],
      court: {
        name: data.courtEstablishment || 'District & Sessions Court',
        courtType: 'Court',
        district: 'District Complex',
        state: 'State',
      },
    };
    allCases.unshift(newCase);
    saveStoredCases(allCases);
    return {
      status: 201,
      data: { status: 'success', data: newCase },
    };
  }

  // 6. SPECIAL ROUTE: /cases/documents/all (MUST BE BEFORE /cases/:id)
  if (cleanUrl === '/cases/documents/all' && m === 'get') {
    const allCases = getStoredCases();
    const docs = allCases.flatMap(c =>
      (c.documents || []).map((d: any) => ({
        ...d,
        case: { id: c.id, caseNumber: c.caseNumber, title: c.title },
      }))
    );
    return { status: 200, data: { status: 'success', data: docs } };
  }

  // 7. SINGLE CASE DETAIL: GET /cases/:id
  const caseMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)$/);
  if (caseMatch && m === 'get') {
    const caseId = caseMatch[1];
    const allCases = getStoredCases();
    const found = allCases.find(c => c.id === caseId || c.cnrNumber === caseId) || allCases[0] || REAL_ADVOCATE_CASE;
    return {
      status: 200,
      data: { status: 'success', data: found },
    };
  }

  // 8. UPDATE CASE: PATCH /cases/:id
  if (caseMatch && m === 'patch') {
    const caseId = caseMatch[1];
    const allCases = getStoredCases();
    const idx = allCases.findIndex(c => c.id === caseId);
    if (idx !== -1) {
      allCases[idx] = { ...allCases[idx], ...data };
      saveStoredCases(allCases);
      return { status: 200, data: { status: 'success', data: allCases[idx] } };
    }
  }

  // 9. CASE SUB-COLLECTIONS:
  // /cases/:id/hearings
  const hearingSubMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/hearings$/);
  if (hearingSubMatch) {
    const caseId = hearingSubMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    if (m === 'post') {
      const newHearing = {
        ...data,
        id: `h-${Date.now()}`,
        verifiedByOfficialSource: true,
      };
      if (c) {
        c.hearings = c.hearings || [];
        c.hearings.unshift(newHearing);
        if (data.nextHearingDate) {
          c.nextHearingDate = data.nextHearingDate;
          c.nextHearingPurpose = data.nextHearingPurpose;
        }
        saveStoredCases(allCases);
      }
      return { status: 201, data: { status: 'success', data: newHearing } };
    }
    return { status: 200, data: { status: 'success', data: c?.hearings || [] } };
  }

  // /cases/:id/witnesses
  const witnessSubMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/witnesses$/);
  if (witnessSubMatch) {
    const caseId = witnessSubMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    if (m === 'post') {
      const newWitness = { ...data, id: `w-${Date.now()}` };
      if (c) {
        c.witnesses = c.witnesses || [];
        c.witnesses.push(newWitness);
        saveStoredCases(allCases);
      }
      return { status: 201, data: { status: 'success', data: newWitness } };
    }
    return { status: 200, data: { status: 'success', data: c?.witnesses || [] } };
  }

  // /cases/:id/exhibits
  const exhibitSubMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/exhibits$/);
  if (exhibitSubMatch) {
    const caseId = exhibitSubMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    if (m === 'post') {
      const newExhibit = { ...data, id: `ex-${Date.now()}` };
      if (c) {
        c.exhibits = c.exhibits || [];
        c.exhibits.push(newExhibit);
        saveStoredCases(allCases);
      }
      return { status: 201, data: { status: 'success', data: newExhibit } };
    }
    return { status: 200, data: { status: 'success', data: c?.exhibits || [] } };
  }

  // /cases/:id/depositions
  const depSubMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/depositions$/);
  if (depSubMatch) {
    const caseId = depSubMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    if (m === 'post') {
      const newDep = { ...data, id: `dep-${Date.now()}` };
      if (c) {
        c.depositions = c.depositions || [];
        c.depositions.push(newDep);
        saveStoredCases(allCases);
      }
      return { status: 201, data: { status: 'success', data: newDep } };
    }
    return { status: 200, data: { status: 'success', data: c?.depositions || [] } };
  }

  // /cases/:id/messages
  const msgSubMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/messages$/);
  if (msgSubMatch) {
    const caseId = msgSubMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    if (m === 'post') {
      const newMsg = {
        id: `m-${Date.now()}`,
        senderType: 'ADVOCATE',
        senderName: 'Adv. Rajeshwar V. Deshmukh',
        messageText: data.messageText || '',
        createdAt: new Date().toISOString(),
      };
      if (c) {
        c.messages = c.messages || [];
        c.messages.push(newMsg);
        saveStoredCases(allCases);
      }
      return { status: 201, data: { status: 'success', data: newMsg } };
    }
    return { status: 200, data: { status: 'success', data: c?.messages || [] } };
  }

  // /cases/:id/documents
  const docSubMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/documents$/);
  if (docSubMatch) {
    const caseId = docSubMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    return { status: 200, data: { status: 'success', data: c?.documents || [] } };
  }

  // /cases/:id/orders
  const ordSubMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/orders$/);
  if (ordSubMatch) {
    const caseId = ordSubMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    return { status: 200, data: { status: 'success', data: c?.orders || [] } };
  }

  // 10. ECOURTS: SEARCH & IMPORT (Allows advocate to search/import by their number)
  if (cleanUrl.startsWith('/ecourts/search')) {
    const cnr = (data?.cnrNumber || params?.cnrNumber || '').trim().toUpperCase();
    const cNum = (data?.caseNumber || params?.caseNumber || '').trim();

    if (cnr === 'MHST010020592021' || !cnr && !cNum) {
      return {
        status: 200,
        data: {
          status: 'success',
          data: [
            {
              cnrNumber: 'MHST010020592021',
              courtName: 'District & Sessions Court, Satara',
              establishment: 'District & Sessions Court Complex, Sadar Bazar, Satara',
              caseType: 'CRIMINAL_CASE',
              caseNumber: 'Sessions Case No. 2059/2021',
              registrationYear: 2021,
              filingDate: '2021-06-28',
              registrationDate: '2021-07-05',
              currentStage: 'PETITIONER_PROSECUTION_EVIDENCE',
              judgeDesignation: 'Hon’ble Additional Sessions Judge-1 & Special Judge, Satara',
              petitioner: 'State of Maharashtra (Karad City P.S. Crime 142/2021)',
              petitionerAdvocate: 'Addl Public Prosecutor S. M. Deshpande',
              respondent: 'Anandrao Vishwanath Patil & Ors.',
              respondentAdvocate: 'Adv. Rajeshwar V. Deshmukh',
              nextHearingDate: '2026-10-29',
              nextHearingPurpose: 'Cross-Examination of PW-2 (Dr. A. K. Kadam)',
            },
          ],
        },
      };
    }

    // Dynamic generation if advocate searches by any custom CNR or Case Number
    const generated = {
      cnrNumber: cnr || `DLCT01-${String(Math.floor(100000 + Math.random() * 900000))}-2024`,
      courtName: 'District & Sessions Court Complex',
      establishment: 'Main Court Hall',
      caseType: 'CIVIL_SUIT',
      caseNumber: cNum || 'Civil Suit No. 104/2024',
      registrationYear: 2024,
      filingDate: '2024-01-15',
      registrationDate: '2024-01-20',
      currentStage: 'HEARING_ON_ADMISSION',
      judgeDesignation: 'Hon’ble Presiding Judge',
      petitioner: 'Complainant / Petitioner Party',
      petitionerAdvocate: 'Adv. Rajeshwar V. Deshmukh',
      respondent: 'Respondent Opposite Party',
      respondentAdvocate: 'Opposite Advocate',
      nextHearingDate: '2026-11-12',
      nextHearingPurpose: 'First Hearing / Notice Returnable',
    };

    return {
      status: 200,
      data: { status: 'success', data: [generated] },
    };
  }

  if (cleanUrl.startsWith('/ecourts/import') && m === 'post') {
    const cnr = data?.cnrNumber || 'MHST010020592021';
    const allCases = getStoredCases();
    let imported = allCases.find(c => c.cnrNumber === cnr);
    if (!imported) {
      imported = {
        ...REAL_ADVOCATE_CASE,
        id: `case-${Date.now()}`,
        cnrNumber: cnr,
        caseNumber: data?.caseNumber || `Case ${cnr}`,
        title: data?.title || `Imported Court Matter (${cnr})`,
      };
      allCases.unshift(imported);
      saveStoredCases(allCases);
    }
    return { status: 201, data: { status: 'success', data: imported } };
  }

  // 11. GENERAL CALENDAR
  if (cleanUrl.startsWith('/calendar') || cleanUrl.startsWith('/hearings')) {
    const allCases = getStoredCases();
    const hearings = allCases.flatMap(c =>
      (c.hearings || []).map((h: any) => ({
        ...h,
        case: { id: c.id, caseNumber: c.caseNumber, title: c.title },
        court: c.court,
      }))
    );
    return { status: 200, data: { status: 'success', data: hearings } };
  }

  // 12. GENERAL DOCUMENTS
  if (cleanUrl.startsWith('/documents')) {
    if (m === 'post') {
      const newDoc = {
        id: `doc-${Date.now()}`,
        displayName: data?.displayName || 'Scanned_Court_Document.pdf',
        fileSize: 1420000,
        pageCount: 1,
        ocrStatus: 'COMPLETED',
        createdAt: new Date().toISOString(),
        category: { name: 'Exhibits & Admitted Records', code: 'EXHIBIT' },
      };
      const allCases = getStoredCases();
      if (allCases.length > 0) {
        allCases[0].documents = allCases[0].documents || [];
        allCases[0].documents.unshift(newDoc);
        saveStoredCases(allCases);
      }
      return { status: 201, data: { status: 'success', data: newDoc } };
    }
    const allCases = getStoredCases();
    const docs = allCases.flatMap(c =>
      (c.documents || []).map((d: any) => ({
        ...d,
        case: { id: c.id, caseNumber: c.caseNumber, title: c.title },
      }))
    );
    return { status: 200, data: { status: 'success', data: docs } };
  }

  // 13. EFILING
  if (cleanUrl.startsWith('/efiling')) {
    return {
      status: 200,
      data: {
        status: 'success',
        data: [
          {
            id: 'ef-1',
            filingToken: 'FT-2026-00452',
            acknowledgmentNumber: 'EF-SATARA-2026-142',
            currentStatus: 'REGISTERED_SCRUTINY_PASSED',
            filingDate: '2026-10-02',
            courtEstablishment: 'District & Sessions Court, Satara',
            caseTitle: 'State of Maharashtra v. Anandrao Patil',
          },
        ],
      },
    };
  }

  // 14. CLIENT PORTAL OVERVIEW
  if (cleanUrl.startsWith('/client/overview') || cleanUrl.startsWith('/client-portal')) {
    const allCases = getStoredCases();
    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          client: { fullName: 'Anandrao Vishwanath Patil' },
          cases: allCases,
          requestedDocuments: [],
        },
      },
    };
  }

  // 15. TASKS
  if (cleanUrl.startsWith('/tasks')) {
    const allCases = getStoredCases();
    const tasks = allCases.flatMap(c =>
      (c.tasks || []).map((t: any) => ({
        ...t,
        case: { id: c.id, caseNumber: c.caseNumber, title: c.title },
        assignedTo: { fullName: 'Adv. Rajeshwar Deshmukh' },
      }))
    );
    return { status: 200, data: { status: 'success', data: tasks } };
  }

  // 15. REPORTS
  if (cleanUrl.startsWith('/reports')) {
    const allCases = getStoredCases();
    if (cleanUrl.includes('case-register')) {
      return {
        status: 200,
        data: {
          status: 'success',
          data: allCases.map(c => ({
            id: c.id,
            caseNumber: c.caseNumber,
            cnrNumber: c.cnrNumber,
            title: c.title,
            courtName: c.court?.name || c.courtEstablishment,
            proceduralStage: c.proceduralStage,
            filingDate: c.filingDate,
            nextHearingDate: c.nextHearingDate,
          })),
        },
      };
    }
    if (cleanUrl.includes('workload')) {
      return {
        status: 200,
        data: {
          status: 'success',
          data: [
            {
              advocateName: 'Adv. Rajeshwar V. Deshmukh',
              role: 'Senior Counsel',
              activeCasesCount: allCases.length,
              hearingsThisMonth: allCases.flatMap(c => c.hearings || []).length,
            },
            {
              advocateName: 'Adv. Ananya Sengupta',
              role: 'Associate Advocate',
              activeCasesCount: allCases.length,
              hearingsThisMonth: 2,
            },
          ],
        },
      };
    }
    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          totalCases: allCases.length,
          disposedCases: 0,
          pendingTrials: allCases.length,
          activeHearings: allCases.flatMap(c => c.hearings || []).length,
        },
      },
    };
  }

  // 16. AI ASSISTANT
  if (cleanUrl.startsWith('/ai/')) {
    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          reply: `Advocate Case Desk AI Analysis for Sessions Case 2059/2021 (CNR: MHST010020592021):\n\nCross-examination notes for PW-2 (Dr. A. K. Kadam):\n1. Confront with entry in casualty register regarding delay in examination.\n2. Point out Exh D-1 (MSEDCL load-shedding certificate) to challenge nighttime visibility.\n3. Cross-examine regarding nature of blunt weapon injuries vs alleged sharp weapons.`,
        },
      },
    };
  }

  // 17. GLOBAL SEARCH
  if (cleanUrl.startsWith('/search')) {
    const allCases = getStoredCases();
    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          cases: allCases,
          documents: allCases.flatMap(c => c.documents || []),
          hearings: allCases.flatMap(c => c.hearings || []),
        },
      },
    };
  }

  // 18. SAFE DEFAULT FOR ANY UNMATCHED ROUTE TO NEVER CRASH THE CLIENT
  return {
    status: 200,
    data: {
      status: 'success',
      data: [],
    },
  };
}
