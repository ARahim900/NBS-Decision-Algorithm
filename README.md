# NBS Decision Engine

Newborn Screening (NBS) Decision Algorithm for **North Batinah Governorate — Sohar Hospital**.

An interactive clinical decision-support tool that determines the correct NBS sampling pathway based on baby age at discharge, discharge delay feasibility, and mother's Wilayat.

## Scenarios

| Scenario | Condition | Action |
|----------|-----------|--------|
| **A** — Low Risk | Baby age >= 24h | Collect sample & discharge |
| **B** — Medium Risk | Age 12-24h, delay possible | Delay discharge until 24h |
| **C** — High Risk | Age < 24h, must discharge | Outpatient follow-up within 48h |

## Tech Stack

- **React 19** + **Vite**
- Mobile-first responsive design
- Zero external UI dependencies (pure inline styles)
- Inter font via Google Fonts

## Getting Started

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```

The `dist/` folder is ready to deploy to any static host (Netlify, Vercel, GitHub Pages, etc.).

## Deployment

### Netlify
Link the repo and set:
- **Build command:** `npm run build`
- **Publish directory:** `dist`

### Vercel
Link the repo — Vite is auto-detected.

### GitHub Pages
Use the `gh-pages` branch or a GitHub Action to deploy the `dist/` folder.
