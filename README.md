# VLDP — Vodacom Lesotho Data Provisioning Portal

A multi-tenant, institution-branded self-service web portal that automates the full student data allocation flow for Vodacom Lesotho. Built with Next.js 14 App Router, Tailwind CSS, shadcn/ui, and recharts.

---

## Getting Started

```bash
cd vldp
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the institution selector.

---

## Demo URLs

| URL                     | Description                               |
| ----------------------- | ----------------------------------------- |
| `/`                     | Institution selector (all 8 institutions) |
| `/nul`                  | NUL institution landing page              |
| `/nul/login`            | NUL login page                            |
| `/nul/admin`            | NUL Admin dashboard                       |
| `/nul/spoc`             | NUL SPOC overview                         |
| `/nul/spoc/upload`      | SPOC upload + validation + payment flow   |
| `/nul/spoc/history`     | SPOC upload history                       |
| `/nul/student`          | Student home (data balance, allocations)  |
| `/nul/student/register` | Student self-registration                 |
| `/nul/student/buy-data` | Buy additional data bundles               |
| `/terms`                | Terms & Conditions                        |
| `/privacy`              | Privacy Policy                            |

Replace `nul` with any institution ID: `limkokwing`, `botho`, `lerotholi`, `qoaling`, `abia`, `little-darlings`, `tholoana`

---

## Mock Login Credentials

> All passwords are mock/dev only. Do NOT use in production.

| Institution                    | Role    | Email                                       | Password    |
| ------------------------------ | ------- | ------------------------------------------- | ----------- |
| National University of Lesotho | Admin   | admin@nul.ac.ls                             | Admin@123   |
| National University of Lesotho | SPOC    | spoc@nul.ac.ls                              | Spoc@123    |
| National University of Lesotho | Student | thabo.molefe@student.nul.ac.ls              | Student@123 |
| National University of Lesotho | Student | palesa.mokoena@student.nul.ac.ls            | Student@123 |
| Limkokwing University          | Admin   | admin@limkokwing.ac.ls                      | Admin@123   |
| Limkokwing University          | SPOC    | spoc@limkokwing.ac.ls                       | Spoc@123    |
| Limkokwing University          | Student | kelechi.nwosu@student.limkokwing.ac.ls      | Student@123 |
| Limkokwing University          | Student | amara.dlamini@student.limkokwing.ac.ls      | Student@123 |
| Botho University               | Admin   | admin@botho.ac.bw                           | Admin@123   |
| Botho University               | SPOC    | spoc@botho.ac.bw                            | Spoc@123    |
| Botho University               | Student | mpho.sithole@student.botho.ac.bw            | Student@123 |
| Lerotholi Polytechnic          | Admin   | admin@lerotholi.ac.ls                       | Admin@123   |
| Lerotholi Polytechnic          | SPOC    | spoc@lerotholi.ac.ls                        | Spoc@123    |
| Lerotholi Polytechnic          | Student | tebello.ramokoena@student.lerotholi.ac.ls   | Student@123 |
| Qoaling High School            | Admin   | admin@qoaling.edu.ls                        | Admin@123   |
| Qoaling High School            | SPOC    | spoc@qoaling.edu.ls                         | Spoc@123    |
| Qoaling High School            | Student | lisema.fako@student.qoaling.edu.ls          | Student@123 |
| Abia High School               | Admin   | admin@abia.edu.ls                           | Admin@123   |
| Abia High School               | SPOC    | spoc@abia.edu.ls                            | Spoc@123    |
| Abia High School               | Student | kabelo.motaung@student.abia.edu.ls          | Student@123 |
| Little Darlings                | Admin   | admin@littledarlings.edu.ls                 | Admin@123   |
| Little Darlings                | SPOC    | spoc@littledarlings.edu.ls                  | Spoc@123    |
| Little Darlings                | Student | bokang.letsie@student.littledarlings.edu.ls | Student@123 |
| Tholoana ea Bopheho            | Admin   | admin@tholoana.edu.ls                       | Admin@123   |
| Tholoana ea Bopheho            | SPOC    | spoc@tholoana.edu.ls                        | Spoc@123    |
| Tholoana ea Bopheho            | Student | sello.mokhele@student.tholoana.edu.ls       | Student@123 |

---

## End-to-End Demo Path

1. Go to `/nul/login` and sign in as the **SPOC** (`spoc@nul.ac.ls` / `Spoc@123`)
2. Navigate to **Upload** → drag-drop or select a CSV file (download a template or use any CSV with columns `name,msisdn`)
3. Review the **validation results** — valid/invalid counts, rejected rows table
4. Click **Proceed to Pay** → enter your phone number → click **Simulate Payment (Demo)**
5. The system automatically provisions data to all valid MSISDNs
6. Sign out, then sign in as **Admin** (`admin@nul.ac.ls` / `Admin@123`)
7. Check the **Dashboard** to see updated allocation stats and charts
8. Go to **Provisioning** to see per-MSISDN success/failure results with retry option
9. Sign out, then sign in as **Student** (`thabo.molefe@student.nul.ac.ls` / `Student@123`)
10. View the **Allocations** page to confirm the new data bundle was provisioned

---

## Tech Stack

| Layer        | Technology              |
| ------------ | ----------------------- |
| Framework    | Next.js 14 (App Router) |
| Styling      | Tailwind CSS v4         |
| Components   | shadcn/ui               |
| Charts       | recharts                |
| CSV parsing  | PapaParse               |
| XLSX parsing | SheetJS (xlsx)          |
| Auth (mock)  | jose (HS256 JWT)        |
| Validation   | Zod                     |
| Testing      | Vitest + fast-check     |
| Icons        | lucide-react            |

---

## Project Structure

```
app/
├── page.tsx                    # Institution selector
├── [institution]/
│   ├── layout.tsx              # Institution theme provider
│   ├── page.tsx                # Institution landing page
│   ├── login/page.tsx          # Login form
│   ├── admin/                  # Admin portal (dashboard, provisioning, etc.)
│   ├── spoc/                   # SPOC portal (upload, history, etc.)
│   └── student/                # Student portal (allocations, buy data, etc.)
├── api/                        # API routes
├── terms/page.tsx
└── privacy/page.tsx
lib/
├── mock-data/                  # Seeded fixture data for all 8 institutions
├── auth.ts                     # Mock JWT auth service
├── audit.ts                    # Audit log service
├── validation.ts               # MSISDN validation + CSV/XLSX parsing
├── upload.ts                   # Upload service
├── mpesa.ts                    # M-Pesa mock (STK Push, callback, simulate)
├── provisioning.ts             # Provisioning service
└── types.ts                    # All TypeScript interfaces
```
