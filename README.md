# ADVOCATE CASE DESK — Legal Practice Management & e-Filing Suite

A comprehensive, production-oriented digital litigation management platform built for advocates, law firms, and their clients in the Indian legal jurisdiction.

Advocate Case Desk digitizes the complete litigation practice lifecycle: from eCourts case discovery and physical brief digitization to multi-stage e-filing records, hearing diary chronologies, evidence tracking, AI-assisted legal retrieval, and secure client portal access.

---

## 🏛️ Key System Modules

### 1. Litigation Case Management
* **Unified Case File**: CNR numbers, court designations, procedural stages, bench halls, priority levels, case health metrics, and connected cases (cross-suits, appeals, counter-claims).
* **Statutory Framework**: Real-time indexing of statutory provisions (e.g. CPC, CrPC, Commercial Courts Act, NI Act, IPC/BNS).
* **Audit History**: Complete tracking of procedural stage migrations, updates, and assignments.

### 2. eCourts Services & CIS 3.2 Integration
* **Multi-Identifier Lookup**: Query court cases via 16-digit CNR Number, Court & Case Number, or Case Type & Year.
* **Diff & Verification Engine**: Before importing court data, inspect field-by-field discrepancies (e.g., next hearing date, judge designation) to prevent silent overwrite of manually verified notes.
* **Official Registry Sync**: Automatically imports hearing histories, daily orders, and cause-list listings while tagging them as `OFFICIAL_VERIFIED`.

### 3. Physical Document Scanner & Digitizer
* **In-Chambers Scanning**: Web camera stream capture (`navigator.mediaDevices.getUserMedia`) for physical document photographing, or batch uploading scanned images.
* **Document Manipulation**: Page reordering, 90°/180°/270° rotation, and multi-page combination into normalized PDFs via `pdf-lib`.
* **OCR & Text Extraction**: Page-by-page OCR engine (supporting English, Hindi, and Marathi) using Tesseract.js and `pdf-parse` with confidence scores.
* **Evidentiary Integrity**: Automatic SHA-256 tamper-verification checksums and duplicate prevention.
* **Confidentiality Controls**: Strict classification into `ADVOCATE_ONLY`, `CLIENT_VISIBLE`, or `RESTRICTED_SHARED`.

### 4. Court e-Filing Management & Scrutiny
* **Formal State Machine**:
  `Saved in Case File` ➔ `Prepared for Filing` ➔ `Submitted to Portal` ➔ `Acknowledgement Received` ➔ `Defects Raised` ➔ `Resubmission Required` ➔ `Accepted / Registered`.
* **Technical Validation**: Automatically validates PDF file format, maximum court portal package size (e.g., 25MB limit), and presence of mandatory Vakalatnama / affidavits.
* **Official Portal Handoff**: Generates filing bundle manifests, links to official High Court / District Court portals, and tracks scrutiny defect curing.

### 5. Smart Hearing Calendar & Diary
* **Chambers Calendar**: Day, Week, Month, and Agenda views filtered by court complex, case, or assigned counsel.
* **Automated Conflict Detection**: Automatically detects and flags concurrent court listings on the same date across disparate court complexes for the same advocate.
* **Date Verification Badges**: Distinguishes `OFFICIAL_VERIFIED` dates from `MANUALLY_ENTERED` provisional dates.

### 6. Evidence, Witnesses & Bail Repository
* **Witness Management**: Indexes PW/DW witnesses, tracking examination stages (Examination-in-chief, Cross-examination, Re-examination) with deposition transcripts, key admissions, and contradictions.
* **Marked Exhibits**: Tracks marked exhibits (Exh P-1, Exh D-1), marking dates, objections, and court custody.
* **Bail & Surety Compliance**: Tracks Regular, Anticipatory, and Interim bail orders, surety solvency verifications, and police station reporting compliance schedules.

### 7. Client Portal & Privileged Communication
* **Plain-English Explanations**: Dedicated client interface answering *"What Happened in My Case?"* and *"What Happens Next?"*.
* **Strict Legal Privilege**: Automatically redacts private advocate strategy notes, draft pleadings, and unshared records from clients.
* **Document Requests**: Advocate can request specific documents from the client with deadlines and 1-click client upload.
* **Case-Linked Messaging**: Secure, encrypted communication channel between client and legal team.

### 8. AI Legal Assistant (RAG Engine)
* **Scoped Case Retrieval**: Retrieval-Augmented Generation restricted strictly to authorized case documents and hearing records.
* **Source Citations**: Answers are paired with exact page numbers, document titles, and quotes.
* **Prompt Injection Protection**: Uploaded document text is strictly treated as untrusted content.
* **Professional Guardrails**: Clear disclaimers that outputs are assistive drafts for advocate verification.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v7, TanStack Query |
| **Backend** | Node.js, Express, TypeScript, Zod, Prisma ORM, JWT, Bcrypt |
| **Database** | PostgreSQL 15 |
| **Document Engine**| `pdf-lib` (PDF manipulation/merging), `pdf-parse` (text extraction), `tesseract.js` (OCR) |
| **Background Processing** | Redis + BullMQ (with in-process fallback) |
| **Storage** | Private S3-compatible / Local Encrypted Storage Adapter |
| **Deployment** | Docker, Docker Compose, Nginx reverse proxy |

---

## 🚀 Getting Started

### Prerequisites
* Node.js v20+
* PostgreSQL 14+ (or Docker Compose)

### 1. Environment Setup
Clone the repository and copy the example environment file:
```bash
cp .env.example .env
```

Ensure `DATABASE_URL` in `.env` points to your PostgreSQL instance:
```env
DATABASE_URL="postgresql://kaustubh:@localhost:5432/postgres?schema=public"
```

### 2. Install Dependencies
Install dependencies across all workspaces:
```bash
npm install
```

### 3. Database Migration & Seed
Generate Prisma Client, push schema to PostgreSQL, and seed realistic demo litigation data:
```bash
npx prisma generate --schema=./apps/api/prisma/schema.prisma
npx prisma db push --schema=./apps/api/prisma/schema.prisma
npm run seed
```

### 4. Run Development Servers
Start both backend API (port 4000) and frontend client (port 5173):
```bash
# Terminal 1: API Server
npm run dev:api

# Terminal 2: Web Client
npm run dev:web
```

Open `http://localhost:5173` in your browser.

---

## 🐳 Docker Deployment

To launch the full production stack (PostgreSQL, Redis, Express API, Vite + Nginx Frontend) with Docker Compose:

```bash
docker-compose up --build -d
```
Access the application at `http://localhost:80`.

---

## 🔑 Demonstration Accounts

The database includes realistic fictional demonstration cases across the High Court of Delhi, High Court of Bombay, and Sessions Court Mumbai.

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Senior Advocate** | `advocate@legaldesk.com` | `Advocate@123` | Full litigation practice, strategy notes, AI assistant |
| **Associate Advocate** | `associate@legaldesk.com` | `Advocate@123` | Assigned cases, hearings, drafting tasks |
| **Client Litigant** | `client@legaldesk.com` | `Client@123` | Case progress, shared orders, requested doc uploads |
| **Legal Staff / Clerk**| `staff@legaldesk.com` | `Advocate@123` | Document digitization, e-filing registry tracking |
| **Administrator** | `admin@legaldesk.com` | `Advocate@123` | User accounts, system audits, configuration |

*(Note: The login page provides 1-click quick login buttons for all five roles).*

---

## 🧪 Automated Verification Suite

Run the automated integration and privilege test suite:
```bash
npm run test
```

Tests include:
1. **Authentication**: Successful login, JWT generation, invalid credentials rejection.
2. **Legal Privilege Authorization**: Verification that clients cannot view private notes, strategy, or unshared documents.
3. **Document Digitization**: Multi-page image merging to normalized PDF bytes and SHA-256 integrity verification.
4. **e-Filing Validation**: Rule checks on filing package size and mandatory Vakalatnama requirements.
5. **Conflict Detection**: Automated detection of concurrent court listings.
6. **AI Case Assistant**: RAG answer generation with mandatory source citations and professional disclaimers.

---

## ⚖️ Indian Legal & Regulatory Compliance

* **Advocate-Client Privilege**: Fully complies with Section 126 of the Indian Evidence Act, 1872 (and Section 132 of the Bharatiya Sakshya Adhiniyam, 2023) by enforcing strict separation of confidential litigation strategy from client-visible views.
* **Storage Integrity**: All digitized documents are stored with immutable SHA-256 hashes for evidentiary chain of custody.
* **eCourts Compliance**: Respects official portal boundaries without attempting unauthorized CAPTCHA bypass or storing court portal credentials.
