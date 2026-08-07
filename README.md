# Lexa — AI-Assisted Indian Legal Tools

Lexa is a full-stack web application that helps users understand legal situations, review documents, prepare first drafts, and research Indian case law. It combines a React interface with a security-focused Express API and Groq-hosted language models.

> Lexa provides general legal information and drafting assistance. It is not a substitute for advice from a qualified lawyer.

## Live Application

**[Open Lexa](https://lexa-kohl.vercel.app/)**

- Frontend: Vercel
- Backend API: Render
- Production traffic is restricted to the configured frontend origin through CORS.

## Features

- **Legal Advisor** — Describe a situation and receive structured guidance, potentially relevant Indian legal provisions, practical next steps, and an indication of when professional help may be important.
- **Document Scanner** — Upload a PDF, DOC, or DOCX document for an AI-assisted review of risks, unfair clauses, missing protections, and other concerns.
- **FIR Draft Generator** — Organise incident details through a guided workflow and generate a structured FIR draft for review.
- **Legal Notice Generator** — Prepare demand, cease-and-desist, eviction, consumer, and other legal-notice drafts.
- **Landmark Case Finder** — Find potentially relevant Supreme Court and High Court judgments and citations for further verification.
- **Formatted PDF Export** — Download FIR and legal-notice drafts as structured A4 legal documents generated with jsPDF.
- **Light and Dark Themes** — Switch between a warm, paper-inspired light theme and the original dark theme. The preference persists between visits.
- **Responsive Workflows** — Includes auto-expanding text areas, keyboard submission, loading states, disabled-state protection, visible keyboard focus, mobile navigation, page transitions, and clear document review layouts.

## Criminal-Law Date Handling

The Bharatiya Nyaya Sanhita, 2023 (BNS), Bharatiya Nagarik Suraksha Sanhita, 2023 (BNSS), and Bharatiya Sakshya Adhiniyam, 2023 (BSA) came into force on 1 July 2024. Lexa asks users to provide relevant event dates so its AI instructions can distinguish the current framework from saved legacy provisions under the IPC, CrPC, and Indian Evidence Act.

Lexa does not treat old and new section numbers as automatically equivalent. Missing dates, statutory mappings, generated provisions, and case citations must be independently verified before use.

## Source-Grounded Legal Research

Legal Advisor, Document Scanner, FIR Generator, Legal Notice Generator, and Landmark Case Finder use a privacy-conscious retrieval flow before producing an answer or draft:

```text
User narrative
  -> local identifier redaction
  -> versioned local statute retrieval (BNS, BNSS, BSA)
  -> de-identified live research query
  -> allowlisted official-source search for updates and judgments
  -> source validation and bounded hybrid context
  -> Llama 3.3 70B analysis
  -> answer with inline references and verified source links
```

The primary criminal-law retrieval layer is a committed local corpus containing the complete English text extracted from official BNS, BNSS, and BSA PDFs. Each corpus build records the official URL, source date, page count, chunk count, and SHA-256 checksum. Results link back to the relevant page of the official PDF.

The live retrieval allowlist prioritises India Code, the Supreme Court of India and its subdomains, eCourts, selected official High Court domains, central legal departments, and relevant official regulators and public bodies. Search results from non-allowlisted domains are discarded before they reach the answering model. Local statute passages are placed before live excerpts so the model receives primary statutory text first.

The original narrative is not used as the web-search query. Lexa first removes common contact, identity, URL, and financial identifiers and asks a separate model step to produce a generic legal research query. Retrieved web text is treated as untrusted reference material and is length-limited before prompt construction.

If live retrieval fails, relevant BNS, BNSS, and BSA passages remain available from the local corpus. Case Finder still does not generate unsupported case citations from model memory. Other tools avoid unsupported section numbers and visibly label a response when neither local nor live sources support it. Retrieved sources improve verifiability but do not guarantee legal correctness; users must open the links and check the complete statute or judgment.

For longer uploaded documents, Lexa reviews a bounded set of excerpts selected from the beginning, end, and clauses containing higher-risk legal terms. The result explicitly identifies this as a targeted review so it is never presented as a complete reading of omitted text.

The live retrieval layer uses Groq Compound web search with the existing server-side `GROQ_API_KEY`. It requires no additional frontend credential or vector-database service, but search usage can add latency and provider cost.

Rebuild the versioned corpus from its official PDFs with:

```bash
npm run corpus:build
```

The ingestion command uses `pdf-parse` as a development-only dependency. Corpus updates should be reviewed whenever India Code or the Ministry of Home Affairs publishes an amended or newer consolidated source. Never update only the displayed version date: regenerate the corpus so its checksum and extracted content stay aligned.

## Interface Direction

Lexa uses an editorial legal-reference design rather than a generic dashboard. The homepage presents its tools as a numbered service directory grouped into **Understand**, **Prepare**, and **Research**. The design system is built from CSS custom properties and preserves the same typography and restrained gold accent across both themes.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite 8 |
| Styling | Tailwind CSS v4, CSS custom properties |
| Routing | React Router v7 |
| Motion | Motion for React |
| AI | Groq API using Llama 3.1 and Llama 3.3 models |
| Backend | Node.js, Express 5 |
| Validation | Zod |
| Security | Helmet, express-rate-limit, DOMPurify, restricted CORS |
| File processing | Multer, pdf-parse, Mammoth |
| PDF generation | jsPDF |
| Optional auth scaffold | Supabase OAuth client |
| Hosting | Vercel frontend, Render backend |

The Supabase sign-in interface is present as an optional scaffold but is not currently part of the public application flow. JWT and bcrypt packages are installed for future authentication work; Lexa does not claim that server-side authentication is active today.

## Security Controls

- Security-related HTTP headers through Helmet
- Exact-origin CORS configuration with no wildcard production origin
- General API limit of 100 requests per minute
- AI-route limit of 10 requests per minute
- Upload-route limit of 5 requests per minute
- JSON request bodies limited to 10 KB
- Zod validation with strict request schemas
- DOMPurify sanitisation before rendering AI-generated content
- File type, extension, MIME, and file-signature validation
- Server-generated upload filenames to reduce path-traversal risk
- Sanitised production error responses
- API keys stored only in backend environment variables
- Loading and disabled states that help prevent accidental duplicate submissions

Run the included security smoke test with:

```bash
npm run test:security
```

It verifies Helmet, CORS, strict validation, request-size limits, file-signature checks, and rate limiting.

Run the retrieval safety checks with:

```bash
npm run test:research
```

They verify identifier redaction, trusted-domain enforcement, unsafe-domain rejection, deduplication, bounded context construction, corpus checksums and coverage, representative BNS/BNSS/BSA retrieval, risk-focused long-document selection, and explicit fallback labelling without making a paid search request.

## Project Structure

```text
lexa/
├── server/
│   ├── controllers/          # AI and document-processing handlers
│   ├── data/legal-corpus/     # Versioned official statutory passages and manifest
│   ├── routes/               # Validated and rate-limited API routes
│   ├── scripts/              # Repeatable legal-corpus ingestion
│   ├── services/             # Local and live guarded retrieval services
│   ├── index.js              # Express app and security middleware
│   └── securitySmokeTest.mjs
├── src/
│   ├── components/           # Buttons, steppers, results, toast and theme UI
│   ├── context/              # Optional authentication context
│   ├── hooks/                # Shared UI hooks
│   ├── lib/                  # API URL and optional Supabase configuration
│   ├── pages/                # Five legal-tool workflows
│   ├── utils/                # Client-side legal PDF export
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── vercel.json
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 22 recommended
- A [Groq API](https://console.groq.com/) key

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/ptej06907-glitch/LEXA.git
   cd LEXA
   ```

2. Install the locked dependencies:

   ```bash
   npm ci
   ```

3. Create a root `.env` file:

   ```env
   VITE_API_URL=http://localhost:3001
   ```

4. Create `server/.env`:

   ```env
   PORT=3001
   GROQ_API_KEY=your_groq_api_key_here
   CLIENT_URL=http://localhost:5173
   ```

   Never commit either environment file. The repository's `.gitignore` excludes them.

5. Start the backend:

   ```bash
   npm run server
   ```

6. In another terminal, start the frontend:

   ```bash
   npm run dev
   ```

7. Open `http://localhost:5173`.

## Useful Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start the Vite development server |
| `npm run server` | Start the Express API |
| `npm run build` | Create a production frontend build |
| `npm run lint` | Run ESLint |
| `npm run test:security` | Run the API security smoke test |
| `npm run preview` | Preview the production frontend build |

## API Routes

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/health` | Check API availability |
| `POST` | `/api/legal/advice` | Generate general legal guidance |
| `POST` | `/api/document/scan` | Analyse a supported document |
| `POST` | `/api/fir/generate` | Generate an FIR draft |
| `POST` | `/api/notice/generate` | Generate a legal-notice draft |
| `POST` | `/api/judgment/find` | Find potentially relevant judgments |

## Environment Variables

| Variable | Location | Required | Description |
|---|---|---:|---|
| `VITE_API_URL` | Root `.env` | Yes | Express API base URL |
| `PORT` | `server/.env` | No | Local API port; defaults to `3001` |
| `GROQ_API_KEY` | `server/.env` | Yes | Server-side Groq credential |
| `CLIENT_URL` | `server/.env` | Yes | Exact frontend origin allowed by CORS |
| `VITE_SUPABASE_URL` | Root `.env` | No | Optional Supabase project URL for the auth scaffold |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Root `.env` | No | Optional Supabase browser key for the auth scaffold |

Render supplies `PORT` automatically in production. Never place `GROQ_API_KEY` in a `VITE_` variable because Vite exposes those variables to the browser bundle.

## Deployment

The deployed application uses two services that operate as one product:

```text
Browser → Vercel frontend → Render API → Groq
```

The frontend receives the Render service URL through `VITE_API_URL`. The backend accepts browser requests only from the origin configured in `CLIENT_URL`. Pushing to the `main` branch triggers automatic deployments on Vercel and Render when auto-deploy is enabled.

## Roadmap

- [ ] Complete and protect the Supabase authentication flow
- [ ] Add conversation and document history per user
- [ ] Add a lawyer-location feature
- [ ] Add Hindi and additional Indian-language support
- [ ] Add automated frontend and API integration tests
- [ ] Add route-level code splitting to reduce the initial JavaScript bundle
- [ ] Connect a custom domain when the project requires one

## Disclaimer

Lexa provides AI-generated legal information for educational and preparatory purposes. Outputs may be incomplete or incorrect and are not a substitute for professional legal advice. Have a qualified lawyer review important decisions, FIR drafts, notices, and documents. Verify statutory provisions, whether current or legacy law applies, and every case citation using authoritative legal sources before relying on them in court or formal proceedings.

---

Built to make Indian legal information easier to navigate and prepare.
