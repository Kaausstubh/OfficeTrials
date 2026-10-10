export type UserRole =
  | 'ADVOCATE'
  | 'ASSOCIATE_ADVOCATE'
  | 'LEGAL_STAFF'
  | 'CLIENT'
  | 'ADMINISTRATOR';

export type CaseType =
  | 'CIVIL_SUIT'
  | 'CRIMINAL_CASE'
  | 'WRIT_PETITION'
  | 'SPECIAL_LEAVE_PETITION'
  | 'COMMERCIAL_DISPUTE'
  | 'COMPANY_PETITION'
  | 'FAMILY_MATRIMONIAL'
  | 'MOTOR_ACCIDENT_CLAIM'
  | 'CONSUMER_DISPUTE'
  | 'REVENUE_APPEAL'
  | 'ARBITRATION_MATTER'
  | 'LABOUR_EMPLOYMENT'
  | 'TAXATION_APPEAL'
  | 'OTHER';

export type ProceduralStage =
  | 'PRE_FILING_CONSULTATION'
  | 'DRAFTING_VERIFICATION'
  | 'E_FILING_SCRUTINY'
  | 'REGISTRATION_SUMMONS'
  | 'PRE_ADMISSION_HEARING'
  | 'WRITTEN_STATEMENT_REPLY'
  | 'FRAMING_OF_ISSUES_CHARGES'
  | 'PETITIONER_PROSECUTION_EVIDENCE'
  | 'RESPONDENT_DEFENCE_EVIDENCE'
  | 'FINAL_ARGUMENTS'
  | 'RESERVED_FOR_JUDGMENT'
  | 'ORDER_PRONOUNCED'
  | 'DECREE_DRAWING'
  | 'EXECUTION_COMPLIANCE'
  | 'APPEAL_REVISION_PERIOD'
  | 'DISPOSED_CLOSED';

export type CaseStatus =
  | 'PENDING'
  | 'DISPOSED_FAVOR'
  | 'DISPOSED_AGAINST'
  | 'DISPOSED_SETTLED'
  | 'DISMISSED'
  | 'TRANSFERRED'
  | 'STAYED'
  | 'ARCHIVED';

export type CasePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'AWAITING_REVIEW' | 'COMPLETED' | 'CANCELLED';
export type CaseHealth = 'GOOD' | 'ATTENTION_NEEDED' | 'CRITICAL_OVERDUE';
export type DateVerificationStatus =
  | 'OFFICIAL_VERIFIED'
  | 'MANUALLY_ENTERED'
  | 'AWAITING_VERIFICATION'
  | 'SUPERSEDED_CANCELLED';

export type DocumentVisibility =
  | 'ADVOCATE_ONLY'
  | 'CLIENT_VISIBLE'
  | 'RESTRICTED_SHARED';

export type OCRProcessingStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'LOW_CONFIDENCE'
  | 'FAILED'
  | 'SKIPPED_TEXT_PRESENT';

export type EfilingStatus =
  | 'SAVED_IN_CASE_FILE'
  | 'PREPARED_FOR_FILING'
  | 'SUBMITTED_TO_PORTAL'
  | 'ACKNOWLEDGEMENT_RECEIVED'
  | 'DEFECTS_RAISED'
  | 'RESUBMISSION_REQUIRED'
  | 'ACCEPTED_REGISTERED'
  | 'REJECTED'
  | 'WITHDRAWN';

export type WitnessType =
  | 'PROSECUTION_WITNESS'
  | 'DEFENCE_WITNESS'
  | 'COURT_WITNESS'
  | 'EXPERT_WITNESS'
  | 'CHARACTER_WITNESS';

export type ExaminationStage =
  | 'NOT_EXAMINED'
  | 'EXAMINATION_IN_CHIEF'
  | 'CROSS_EXAMINATION'
  | 'RE_EXAMINATION'
  | 'COMPLETED';

export type BailType = 'ANTICIPATORY' | 'REGULAR' | 'INTERIM' | 'DEFAULT_STATUTORY';
export type BailStatus = 'FILED' | 'PENDING' | 'GRANTED' | 'REJECTED' | 'CANCELLED' | 'EXPIRED';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isMfaEnabled?: boolean;
  advocateProfile?: {
    barCouncilNumber?: string;
    enrollmentYear?: number;
    specialization?: string;
    officeAddress?: string;
    isSeniorAdvocate?: boolean;
  };
  clientProfile?: {
    companyName?: string;
    address?: string;
    preferredLang?: string;
  };
}

export interface Court {
  id: string;
  name: string;
  establishment: string;
  courtType: string;
  state: string;
  district: string;
  courtHallNo?: string;
  benchDesignation?: string;
}

export interface CaseParty {
  id: string;
  caseId: string;
  partyType: string;
  name: string;
  isOurClient: boolean;
  phone?: string;
  email?: string;
  advocateName?: string;
}

export interface CaseDocument {
  id: string;
  caseId: string;
  categoryId: string;
  displayName: string;
  originalFilename: string;
  fileType: string;
  fileSize: number;
  pageCount: number;
  checksumSha256: string;
  visibility: DocumentVisibility;
  ocrStatus: OCRProcessingStatus;
  ocrConfidence?: number;
  language?: string;
  description?: string;
  documentDate?: string;
  createdAt: string;
  category: {
    id: string;
    name: string;
    code: string;
  };
  extractedPages?: {
    id?: string;
    pageNumber: number;
    extractedText?: string;
    confidence?: number;
  }[];
}

export interface Hearing {
  id: string;
  caseId: string;
  courtId: string;
  hearingDate: string;
  purpose: string;
  proceedings?: string;
  workPerformed?: string;
  orderPassed?: string;
  nextHearingDate?: string;
  nextHearingPurpose?: string;
  pendingWork?: string;
  documentsRequired?: string;
  clientActionNeeded?: string;
  privateNotes?: string;
  clientSummary?: string;
  dateVerification: DateVerificationStatus;
  isCompleted: boolean;
  court?: Court;
  attendances?: {
    userId: string;
    status: string;
    user?: { fullName: string };
  }[];
}

export interface CourtOrder {
  id: string;
  caseId: string;
  orderDate: string;
  orderType: string;
  judgeName?: string;
  orderSummary: string;
  fullText?: string;
  isSharedWithClient: boolean;
}

export interface EfilingRecord {
  id: string;
  caseId: string;
  filingType: string;
  filingTitle: string;
  portalName: string;
  portalUrl?: string;
  diaryNumber?: string;
  filingNumber?: string;
  acknowledgementNumber?: string;
  submissionDate?: string;
  currentStatus: EfilingStatus;
  defectDetails?: string;
  defectDeadline?: string;
  resubmissionDate?: string;
  acceptanceDate?: string;
  notes?: string;
  createdAt: string;
  documents: {
    documentId: string;
    document: {
      displayName: string;
      fileType: string;
      fileSize: number;
    };
  }[];
  statusHistory: {
    id: string;
    previousStatus?: EfilingStatus;
    newStatus: EfilingStatus;
    changeNote?: string;
    changedAt: string;
  }[];
}

export interface Witness {
  id: string;
  caseId: string;
  witnessNumber: string;
  name: string;
  witnessType: WitnessType;
  currentStage: ExaminationStage;
  testimonySummary?: string;
  mobile?: string;
  depositions: {
    id: string;
    examinationType: ExaminationStage;
    depositionDate: string;
    transcriptSummary: string;
    keyAdmissions?: string;
    contradictions?: string;
  }[];
}

export interface Exhibit {
  id: string;
  caseId: string;
  exhibitNumber: string;
  description: string;
  markedBy: string;
  markingDate?: string;
  objectionRaised: boolean;
  objectionDetails?: string;
  custodyDetails?: string;
  document?: {
    id: string;
    displayName: string;
  };
}

export interface BailRecord {
  id: string;
  caseId: string;
  accusedName: string;
  bailType: BailType;
  status: BailStatus;
  applicationDate: string;
  orderDate?: string;
  bailConditions?: string;
  suretyCount: number;
  suretyAmount?: number;
  sureties: {
    id: string;
    suretyName: string;
    relationship?: string;
    bondAmount: number;
    solvencyStatus?: string;
  }[];
  conditions: {
    id: string;
    conditionText: string;
    frequency?: string;
    nextDueDate?: string;
    isComplied: boolean;
  }[];
}

export interface Task {
  id: string;
  caseId?: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  isLimitation?: boolean;
  assignedTo?: {
    id: string;
    fullName: string;
  };
  case?: {
    id: string;
    caseNumber: string;
    title: string;
  };
}

export interface Case {
  id: string;
  internalCaseNo: string;
  cnrNumber?: string;
  caseType: CaseType;
  caseNumber: string;
  registrationYear: number;
  courtId: string;
  courtEstablishment?: string;
  judgeDesignation?: string;
  filingDate?: string;
  registrationDate?: string;
  proceduralStage: ProceduralStage;
  status: CaseStatus;
  priority: CasePriority;
  health: CaseHealth;
  title: string;
  description?: string;
  statutoryActs?: string;
  statutorySections?: string;
  policeStation?: string;
  firNumber?: string;
  firYear?: number;
  nextHearingDate?: string;
  nextHearingPurpose?: string;
  dateVerification: DateVerificationStatus;
  privateNotes?: string;
  clientGuidanceNotes?: string;
  isArchived: boolean;
  court: Court;
  parties: CaseParty[];
  assignments: {
    id: string;
    roleInCase: string;
    user: {
      id: string;
      fullName: string;
      role: UserRole;
      email: string;
    };
  }[];
  hearings: Hearing[];
  documents: CaseDocument[];
  orders: CourtOrder[];
  witnesses: Witness[];
  exhibits: Exhibit[];
  bailRecords: BailRecord[];
  efilingRecords: EfilingRecord[];
  tasks: Task[];
  documentRequests: {
    id: string;
    requestedTitle: string;
    description?: string;
    deadline?: string;
    isUploaded: boolean;
  }[];
  connectedSource?: any[];
  connectedTarget?: any[];
  syncHistory?: any[];
  _count?: {
    hearings: number;
    documents: number;
    tasks: number;
    efilingRecords: number;
  };
}
