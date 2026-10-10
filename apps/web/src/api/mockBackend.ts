import { Case, User, UserRole, CaseType, ProceduralStage, CasePriority, CaseStatus } from '../types';

// Initial Mock Cases
const INITIAL_CASES: any[] = [
  {
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
    statutorySections: 'Sec 307 (Attempt to murder), 326 (Voluntarily causing grievous hurt by dangerous weapons), 324, 149 IPC',
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
        purpose: 'Cross-Examination of PW-2 (Dr. A. K. Kadam) & Further Prosecution Evidence',
        businessOnDate: 'Cause List Item No. 14 (Special Session)',
        attendanceStatus: 'PLANNED',
        verifiedByOfficialSource: true,
      },
      {
        id: 'h-2',
        hearingDate: '2026-09-12T10:30:00.000Z',
        purpose: 'Prosecution Evidence (Chief of PW-2)',
        businessOnDate: 'PW-2 Dr. Kadam examined in chief. Marked Exh P-2. Cross-examination deferred for production of casualty register.',
        attendanceStatus: 'ATTENDED',
        verifiedByOfficialSource: true,
      },
      {
        id: 'h-3',
        hearingDate: '2026-08-18T10:30:00.000Z',
        purpose: 'Prosecution Evidence (Cross of PW-1)',
        businessOnDate: 'PW-1 cross-examined at length by defence counsel. Exh P-1 and Exh D-1 marked. Evidence of PW-1 closed.',
        attendanceStatus: 'ATTENDED',
        verifiedByOfficialSource: true,
      },
      {
        id: 'h-4',
        hearingDate: '2026-06-25T10:30:00.000Z',
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
        credibilityAssessment: 'Official medical witness; defence to test weapon compatibility.',
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
    ],
    documents: [
      {
        id: 'doc-1',
        displayName: 'Certified_Chargesheet_Crime_142_2021.pdf',
        originalFilename: 'Chargesheet_Karad_PS.pdf',
        fileSize: 4200000,
        pageCount: 64,
        visibility: 'CLIENT_VISIBLE',
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
        createdAt: '2026-09-12T00:00:00.000Z',
        category: { name: 'Exhibits & Admitted Records', code: 'EXHIBIT' },
      },
    ],
  },
  {
    id: 'case-commercial-delhi',
    internalCaseNo: 'ACD/2023/CS-0452',
    cnrNumber: 'DLHC010045232023',
    caseType: 'COMMERCIAL_DISPUTE' as CaseType,
    caseNumber: 'CS(COMM) 452/2023',
    registrationYear: 2023,
    courtId: 'court-delhi-hc',
    courtEstablishment: 'Principal Bench, New Delhi',
    judgeDesignation: 'Hon’ble Mr. Justice R. Narayanan',
    filingDate: '2023-04-12T00:00:00.000Z',
    registrationDate: '2023-04-18T00:00:00.000Z',
    proceduralStage: 'FRAMING_OF_ISSUES_CHARGES' as ProceduralStage,
    status: 'PENDING' as CaseStatus,
    priority: 'HIGH' as CasePriority,
    title: 'Apex Logistics & Warehousing Pvt. Ltd. v. Vanguard Industrial Supply Corp.',
    description: 'Commercial suit for recovery of Rs. 4,85,00,000/- with interest arising out of breach of master warehousing contract.',
    statutoryActs: 'Commercial Courts Act, 2015; Code of Civil Procedure, 1908; Indian Contract Act, 1872',
    statutorySections: 'Sec 2(1)(c)(xviii) Commercial Courts Act; Sec 73 Contract Act',
    nextHearingDate: '2026-10-24T10:30:00.000Z',
    nextHearingPurpose: 'Framing of Issues and Joint Schedule of Admitted Documents',
    dateVerification: 'OFFICIAL_VERIFIED',
    court: {
      name: 'High Court of Delhi',
      courtType: 'High Court',
      district: 'New Delhi',
      state: 'Delhi',
      courtHallNo: 'Court Room 22',
    },
    parties: [
      {
        id: 'p-10',
        partyType: 'PLAINTIFF',
        name: 'Apex Logistics & Warehousing Pvt. Ltd.',
        isOurClient: true,
        advocateName: 'Adv. Rajeshwar V. Deshmukh',
      },
      {
        id: 'p-11',
        partyType: 'DEFENDANT',
        name: 'Vanguard Industrial Supply Corp.',
        isOurClient: false,
        advocateName: 'Adv. S. K. Nambiar',
      },
    ],
    hearings: [
      {
        id: 'h-10',
        hearingDate: '2026-10-24T10:30:00.000Z',
        purpose: 'Framing of Issues and Joint Schedule of Admitted Documents',
        businessOnDate: 'Listed before Commercial Division Bench',
        attendanceStatus: 'PLANNED',
        verifiedByOfficialSource: true,
      },
    ],
    witnesses: [],
    exhibits: [],
    orders: [],
    documents: [],
  },
  {
    id: 'case-writ-mumbai',
    internalCaseNo: 'ACD/2022/WP-8914',
    cnrNumber: 'BOMHC010089142022',
    caseType: 'WRIT_PETITION' as CaseType,
    caseNumber: 'WP(C) 8914/2022',
    registrationYear: 2022,
    courtId: 'court-bombay-hc',
    courtEstablishment: 'Appellate & Original Side, Mumbai',
    judgeDesignation: 'Hon’ble Division Bench (Justice S. G. More & Justice V. K. Iyer)',
    filingDate: '2022-09-08T00:00:00.000Z',
    registrationDate: '2022-09-15T00:00:00.000Z',
    proceduralStage: 'FINAL_ARGUMENTS' as ProceduralStage,
    status: 'PENDING' as CaseStatus,
    priority: 'HIGH' as CasePriority,
    title: 'M/s Horizon Real Estate Developers v. Municipal Corporation of Greater Mumbai (MCGM)',
    description: 'Writ Petition under Article 226 challenging illegal demolition notice issued by MCGM.',
    statutoryActs: 'Constitution of India; Mumbai Municipal Corporation Act, 1888',
    nextHearingDate: '2026-10-28T10:30:00.000Z',
    nextHearingPurpose: 'Concluding Final Arguments on Ad-Interim Injunction',
    dateVerification: 'OFFICIAL_VERIFIED',
    court: {
      name: 'High Court of Judicature at Bombay',
      courtType: 'High Court',
      district: 'Mumbai City',
      state: 'Maharashtra',
      courtHallNo: 'Court Hall 14',
    },
    parties: [
      {
        id: 'p-20',
        partyType: 'PETITIONER',
        name: 'M/s Horizon Real Estate Developers',
        isOurClient: true,
        advocateName: 'Adv. Rajeshwar V. Deshmukh',
      },
      {
        id: 'p-21',
        partyType: 'RESPONDENT',
        name: 'Municipal Corporation of Greater Mumbai (MCGM)',
        isOurClient: false,
        advocateName: 'Adv. S. Karmarkar',
      },
    ],
    hearings: [],
    witnesses: [],
    exhibits: [],
    orders: [],
    documents: [],
  },
];

// Helper to get stored cases
const getStoredCases = (): any[] => {
  try {
    const raw = localStorage.getItem('demo_advocate_cases');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return INITIAL_CASES;
};

const saveStoredCases = (cases: any[]) => {
  try {
    localStorage.setItem('demo_advocate_cases', JSON.stringify(cases));
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
    fullName: 'Vikramaditya Singhania',
    phone: '+91 99887 76655',
    role: 'CLIENT' as UserRole,
  },
  'staff@legaldesk.com': {
    id: 'user-staff-1',
    email: 'staff@legaldesk.com',
    fullName: 'Suresh Patil (Clerk & Registrar)',
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
 * Handle any mock backend request transparently when static hosting is detected
 */
export function handleMockRequest(url: string, method: string, data?: any, params?: any): { status: number; data: any } | null {
  const cleanUrl = url.replace(/^\/api\/v1/, '').split('?')[0];

  // 1. AUTH / LOGIN
  if (cleanUrl === '/auth/login' && method.toLowerCase() === 'post') {
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
    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          metrics: {
            activeCasesCount: allCases.length,
            hearingsTodayCount: 1,
            hearingsTomorrowCount: 0,
            hearingsThisWeekCount: 3,
            urgentMattersCount: 2,
            pendingDefectsCount: 1,
            unverifiedDatesCount: 0,
          },
          hearingsToday: [
            {
              id: 'h-today-1',
              hearingDate: new Date().toISOString(),
              courtRoomNo: 'Court Hall 03',
              itemNumber: 'Item 14',
              purpose: 'Cross-Examination of PW-2 (Dr. A. K. Kadam)',
              case: {
                id: '68f40a77-d59d-4e00-a7fa-7b1b972d2c07',
                caseNumber: 'Sessions Case No. 2059/2021',
                title: 'State of Maharashtra v. Anandrao Patil (Karad PS)',
              },
              court: {
                name: 'District & Sessions Court, Satara',
              },
            },
          ],
          hearingsTomorrow: [],
          hearingsThisWeek: [
            {
              id: 'h-10',
              hearingDate: '2026-10-24T10:30:00.000Z',
              courtRoomNo: 'Court Room 22',
              itemNumber: 'Item 05',
              purpose: 'Framing of Issues and Joint Schedule',
              case: {
                id: 'case-commercial-delhi',
                caseNumber: 'CS(COMM) 452/2023',
                title: 'Apex Logistics v. Vanguard Industrial',
              },
              court: {
                name: 'High Court of Delhi',
              },
            },
          ],
          overdueTasks: [
            {
              id: 't-1',
              title: 'Prepare Medical Cross-Examination Brief for Dr. Kadam',
              priority: 'HIGH',
              dueDate: new Date().toISOString(),
              case: {
                id: '68f40a77-d59d-4e00-a7fa-7b1b972d2c07',
                caseNumber: 'Sessions Case 2059/2021',
                title: 'State of Maharashtra v. Anandrao Patil',
              },
              assignedTo: { fullName: 'Adv. Ananya Sengupta' },
            },
          ],
          pendingDefects: [
            {
              id: 'ef-1',
              acknowledgmentNumber: 'EF-DLHC-2026-9021',
              defectRemarks: 'Court fee receipt scan signature unclear; please re-upload clear stamp page.',
              case: {
                id: 'case-commercial-delhi',
                caseNumber: 'CS(COMM) 452/2023',
                title: 'Apex Logistics v. Vanguard Industrial',
              },
            },
          ],
          recentDocuments: [
            {
              id: 'doc-1',
              displayName: 'Certified_Chargesheet_Crime_142_2021.pdf',
              pageCount: 64,
              createdAt: '2021-07-05T00:00:00.000Z',
              case: {
                id: '68f40a77-d59d-4e00-a7fa-7b1b972d2c07',
                caseNumber: 'Sessions Case 2059/2021',
              },
              category: { name: 'Charge-sheet & Police Report' },
            },
          ],
          unverifiedDates: [],
        },
      },
    };
  }

  // 4. CASES LIST
  if (cleanUrl === '/cases' && method.toLowerCase() === 'get') {
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

  // 5. SINGLE CASE DETAIL
  const caseMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)$/);
  if (caseMatch && method.toLowerCase() === 'get') {
    const caseId = caseMatch[1];
    const allCases = getStoredCases();
    const found = allCases.find(c => c.id === caseId || c.cnrNumber === caseId) || allCases[0];
    return {
      status: 200,
      data: { status: 'success', data: found },
    };
  }

  // 6. CREATE CASE
  if (cleanUrl === '/cases' && method.toLowerCase() === 'post') {
    const allCases = getStoredCases();
    const newCase = {
      ...data,
      id: `case-${Date.now()}`,
      status: 'PENDING',
      parties: data.parties || [],
      hearings: [],
      witnesses: [],
      exhibits: [],
      orders: [],
      documents: [],
      court: {
        name: data.courtEstablishment || 'District & Sessions Court',
        courtType: 'Sessions Court',
        district: 'Mumbai',
        state: 'Maharashtra',
      },
    };
    allCases.unshift(newCase);
    saveStoredCases(allCases);
    return {
      status: 201,
      data: { status: 'success', data: newCase },
    };
  }

  // 7. RECORD HEARING
  const hearingMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/hearings$/);
  if (hearingMatch && method.toLowerCase() === 'post') {
    const caseId = hearingMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
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
    return {
      status: 201,
      data: { status: 'success', data: newHearing },
    };
  }

  // 8. EVIDENCE: WITNESSES, EXHIBITS, DEPOSITIONS
  const witnessMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/witnesses$/);
  if (witnessMatch && method.toLowerCase() === 'post') {
    const caseId = witnessMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    const newWitness = { ...data, id: `w-${Date.now()}` };
    if (c) {
      c.witnesses = c.witnesses || [];
      c.witnesses.push(newWitness);
      saveStoredCases(allCases);
    }
    return { status: 201, data: { status: 'success', data: newWitness } };
  }

  const exhibitMatch = cleanUrl.match(/^\/cases\/([a-zA-Z0-9-]+)\/exhibits$/);
  if (exhibitMatch && method.toLowerCase() === 'post') {
    const caseId = exhibitMatch[1];
    const allCases = getStoredCases();
    const c = allCases.find(item => item.id === caseId);
    const newExhibit = { ...data, id: `ex-${Date.now()}` };
    if (c) {
      c.exhibits = c.exhibits || [];
      c.exhibits.push(newExhibit);
      saveStoredCases(allCases);
    }
    return { status: 201, data: { status: 'success', data: newExhibit } };
  }

  // 9. ECOURTS SEARCH & IMPORT
  if (cleanUrl.startsWith('/ecourts/search')) {
    const cnr = (data?.cnrNumber || params?.cnrNumber || '').trim().toUpperCase();
    if (cnr === 'MHST010020592021' || !cnr) {
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
              hearings: [
                {
                  hearingDate: '2026-09-12',
                  purpose: 'Prosecution Evidence (Chief of PW-2)',
                  businessOnDate: 'PW-2 Dr. Kadam examined in chief. Marked Exh P-2.',
                },
              ],
              orders: [
                {
                  orderDate: '2026-09-12',
                  orderNumber: 'Order 14',
                  summary: 'Cross-examination deferred to 29.10.2026.',
                },
              ],
            },
          ],
        },
      };
    }

    return {
      status: 200,
      data: {
        status: 'success',
        data: [
          {
            cnrNumber: cnr,
            courtName: 'High Court of Bombay',
            caseNumber: 'WP/2024/09',
            registrationYear: 2024,
            currentStage: 'HEARING',
            petitioner: 'Petitioner Company Ltd.',
            respondent: 'State of Maharashtra',
            nextHearingDate: '2026-11-15',
          },
        ],
      },
    };
  }

  // 10. AI ASSISTANT CHAT
  if (cleanUrl.startsWith('/ai/')) {
    const prompt = data?.prompt || data?.message || '';
    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          reply: `Advocate Case Desk AI Analysis:\n\nBased on the court filings for Sessions Case 2059/2021 (CNR: MHST010020592021), the prosecution evidence under Section 307 & 326 IPC hinges on PW-2's medical testimony. \n\nKey Strategy Points:\n1. Cross-examine PW-2 Dr. Kadam regarding discrepancy between casualty book entry and police MLC.\n2. Point out Exh D-1 (MSEDCL load-shedding certificate) to contest identification illumination.\n3. Case law support: State of UP v. Ram Swarup (1974) 4 SCC 764 on benefit of variance in injury dimensions.`,
        },
      },
    };
  }

  // 11. DOCUMENTS SCAN / UPLOAD
  if (cleanUrl.startsWith('/documents')) {
    if (method.toLowerCase() === 'post') {
      return {
        status: 201,
        data: {
          status: 'success',
          data: {
            id: `doc-${Date.now()}`,
            displayName: data?.displayName || 'Scanned_Court_Exhibit.pdf',
            fileSize: 1420000,
            pageCount: 3,
            ocrText: 'SCANNED COURT RECORD - HIGH RESOLUTION OCR EXTRACTED',
            createdAt: new Date().toISOString(),
          },
        },
      };
    }
    const allCases = getStoredCases();
    const docs = allCases.flatMap(c => c.documents || []);
    return { status: 200, data: { status: 'success', data: docs } };
  }

  // 12. EFILING
  if (cleanUrl.startsWith('/efiling')) {
    return {
      status: 200,
      data: {
        status: 'success',
        data: [
          {
            id: 'ef-1',
            filingToken: 'FT-2026-00452',
            acknowledgmentNumber: 'EF-DLHC-2026-9021',
            currentStatus: 'DEFECTS_RAISED',
            filingDate: '2026-10-02',
            courtEstablishment: 'High Court of Delhi (Commercial)',
            caseTitle: 'Apex Logistics v. Vanguard Industrial',
          },
          {
            id: 'ef-2',
            filingToken: 'FT-2026-00914',
            acknowledgmentNumber: 'EF-BOM-2026-1182',
            currentStatus: 'REGISTERED_SCRUTINY_PASSED',
            filingDate: '2026-09-28',
            courtEstablishment: 'High Court of Bombay',
            caseTitle: 'Horizon Real Estate v. MCGM',
          },
        ],
      },
    };
  }

  // 13. CLIENT PORTAL
  if (cleanUrl.startsWith('/client-portal')) {
    const allCases = getStoredCases();
    return {
      status: 200,
      data: {
        status: 'success',
        data: {
          clientName: 'Vikramaditya Singhania',
          cases: allCases.slice(0, 2),
        },
      },
    };
  }

  // 14. TASKS
  if (cleanUrl.startsWith('/tasks')) {
    return {
      status: 200,
      data: {
        status: 'success',
        data: [
          {
            id: 't-1',
            title: 'Prepare Medical Cross-Examination Brief for Dr. Kadam (PW-2)',
            status: 'IN_PROGRESS',
            priority: 'HIGH',
            dueDate: '2026-10-25',
          },
          {
            id: 't-2',
            title: 'File Rectification Affidavit for e-Filing Defect Memo',
            status: 'PENDING',
            priority: 'URGENT',
            dueDate: '2026-10-20',
          },
        ],
      },
    };
  }

  // 15. CALENDAR / HEARINGS
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

  // 16. GLOBAL SEARCH
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

  return null;
}
