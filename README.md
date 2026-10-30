# OCR Studio

Web UI for the **OCR Image Reader** API. Built with Vite, React, and TypeScript. Uploads go to the **backend** (`uploads/` on the API server), not into this app’s filesystem.

## Prerequisites

- Node.js 18+
- OCR API running (see [../README.md](../README.md))

## Setup

```bash
cd ocr-studio
cp .env.example .env
npm install
npm run dev
```

## Environment

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Base URL of the OCR API (no trailing slash) | `http://localhost:3001` |

Must match the API `PORT` in the parent project’s `.env` (commonly **3001**).

Optional keys in `.env.example` (`GEMINI_API_KEY`, `APP_URL`) are for AI Studio hosting templates and are not required for local OCR against your Express API.

## Features (routes)

| Path | API endpoint |
|------|----------------|
| `/ocr/read` | `POST /api/v1/ocr/read` |
| `/ocr/document` | `POST /api/v1/ocr/document` |
| `/ocr/receipt` | `POST /api/v1/ocr/receipt` |
| `/ocr/table` | `POST /api/v1/ocr/table` |
| `/ocr/batch` | `POST /api/v1/ocr/batch` |

Settings and preprocessing preferences are stored in **localStorage**. Defaults enable preprocessing (grayscale, normalize, sharpen) for better document OCR.

## PAN / ID cards

Use **Document Reader** (`/ocr/document`). Inspect API response **`identityFields`** (PAN number, name, DOB, etc.) in the UI result payload — not only raw text.

## API docs

Backend reference: [../docs/API.md](../docs/API.md)

## Build for production

```bash
npm run build
npm run preview
```

Serve the `dist/` folder behind your static host; keep `VITE_API_BASE_URL` pointed at the production API and configure API `CORS_ORIGIN` accordingly.
