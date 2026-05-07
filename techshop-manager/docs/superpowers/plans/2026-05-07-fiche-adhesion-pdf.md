# Fiche d'Adhésion Progressive — PDF Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After client activation, the agent selects a physical product from the catalog and generates a PDF "Fiche d'Adhésion Progressive" identical to the paper form, with an added "Produit" column.

**Architecture:** Add `@react-pdf/renderer` to the frontend. On the `SuccessScreen` component inside `OnboardingActivationPage.tsx`, replace the auto-redirect with a manual navigation that shows a product selector and a "Générer la Fiche" button. The PDF component is a standalone file that receives all client + product data as props and renders a pixel-faithful reproduction of the paper form.

**Tech Stack:** React 18, `@react-pdf/renderer` ^3.x, TanStack Query v5, existing `GET /produits/search?q=&siteId=` backend endpoint (already exists in StocksController).

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `frontend/package.json` | Modify | Add `@react-pdf/renderer` dependency |
| `frontend/src/components/clients/FicheAdhesionPDF.tsx` | Create | @react-pdf/renderer document — full fiche layout |
| `frontend/src/components/clients/ProduitSearchInput.tsx` | Create | Autocomplete search input for product selection |
| `frontend/src/pages/clients/OnboardingActivationPage.tsx` | Modify | Replace SuccessScreen auto-redirect with fiche generation block |

---

## Task 1: Install @react-pdf/renderer

**Files:**
- Modify: `frontend/package.json`

- [ ] **Step 1: Install the package**

```bash
cd "D:/PETER/Progress app/techshop-manager/frontend"
npm install @react-pdf/renderer@^3.4.5
```

Expected output: `added X packages` with no errors.

- [ ] **Step 2: Verify TypeScript types are bundled**

```bash
ls node_modules/@react-pdf/renderer/src
```

Expected: directory exists (types are bundled, no `@types/...` needed).

- [ ] **Step 3: Commit**

```bash
cd "D:/PETER/Progress app/techshop-manager"
git add frontend/package.json frontend/package-lock.json
git commit -m "chore: add @react-pdf/renderer for fiche PDF generation"
```

---

## Task 2: Create FicheAdhesionPDF component

**Files:**
- Create: `frontend/src/components/clients/FicheAdhesionPDF.tsx`

This component renders the exact layout of the paper "Fiche d'Adhésion Progressive" using `@react-pdf/renderer` primitives. The fiche has:
- Header with two Progress Business logos flanking company info
- Title block: "FICHE D'ADHÉSION PROGRESSIVE" + N° (sequential client number)
- Client info block: Nom, Invité par (parrain), Adresse, Ville, Téléphone, Email, date, signature zone
- COTATIONS DU MEMBRE table with columns: N°, Date, PRIX, Point cumulés, Nom agent, **Produit**, Signature agent
- One data row (the activation purchase)
- Points Total row
- Satisfaction checkbox text
- Footer: date + two signature zones

The `createdAt` field on the `Client` model is a `DateTime` auto-set at creation — we use it as the sequential "number" display by using the client's auto-incremented position. Since the schema uses UUIDs, we use the last 4 digits of the client ID as the N° display fallback, OR expose a sequential index via the API response. For simplicity in this plan, the N° is passed as a prop (computed by the caller from client data available on screen).

- [ ] **Step 1: Create the file with full PDF layout**

Create `frontend/src/components/clients/FicheAdhesionPDF.tsx`:

```tsx
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from '@react-pdf/renderer';

// Register a clean font — fall back to Helvetica (built-in) for offline safety
Font.registerHyphenationCallback((word) => [word]);

export interface FicheAdhesionData {
  // Client
  nomComplet: string;         // "PRENOM NOM"
  telephone: string;
  email?: string;
  adresse?: string;
  ville?: string;
  numeroFiche: string;        // Display number, e.g. "9091"
  dateActivation: string;     // "JJ/MM/AAAA"
  // Parrain
  parrainNom?: string;        // "Prénom Nom"
  parrainCode?: string;       // "TSG-XXXX"
  // Agent
  agentNom: string;
  // Produit acheté
  produitNom: string;
  produitPrix: number;        // CDF
  pointsCumules: number;      // always 40 at activation
  // Site
  siteVille: string;          // "Goma" | "Bukavu" | "Kinshasa"
}

const BLUE = '#1E3A5F';
const BORDER = '#333333';
const LIGHT_BORDER = '#999999';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    paddingTop: 18,
    paddingBottom: 18,
    paddingLeft: 22,
    paddingRight: 22,
    color: '#111111',
  },
  // Header row
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logoBox: {
    width: 52,
    height: 52,
    border: '2pt solid #1E3A5F',
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  logoText: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    textAlign: 'center',
  },
  logoSubText: {
    fontSize: 5,
    color: '#2E86C1',
    textAlign: 'center',
    marginTop: 1,
  },
  companyBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  companyName: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 1,
  },
  companyNameAccent: {
    color: '#2E86C1',
  },
  companyMeta: {
    fontSize: 6,
    color: '#444444',
    textAlign: 'center',
    marginTop: 2,
  },
  // Title
  titleBlock: {
    border: '1.5pt solid ' + BLUE,
    padding: '4pt 8pt',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
  },
  titleText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ficheNum: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },
  // Info grid
  infoRow: {
    flexDirection: 'row',
    marginBottom: 3,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    minWidth: 90,
    flexShrink: 0,
  },
  infoValue: {
    fontSize: 8,
    color: '#111111',
    flex: 1,
    borderBottom: '0.5pt solid ' + LIGHT_BORDER,
    paddingBottom: 1,
  },
  infoRow2col: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 3,
  },
  // Signature zone under client info
  signatureZone: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginBottom: 6,
  },
  signatureBox: {
    alignItems: 'center',
    minWidth: 120,
  },
  signatureLabel: {
    fontSize: 7,
    color: '#333333',
  },
  signatureLine: {
    borderBottom: '0.5pt solid ' + BORDER,
    width: 120,
    marginTop: 16,
  },
  // Table
  tableTitle: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    textTransform: 'uppercase',
    marginBottom: 4,
    borderBottom: '1pt solid ' + BLUE,
    paddingBottom: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#1E3A5F',
    borderTop: '1pt solid ' + BORDER,
    borderLeft: '1pt solid ' + BORDER,
  },
  tableRow: {
    flexDirection: 'row',
    borderLeft: '1pt solid ' + BORDER,
  },
  tableRowTotal: {
    flexDirection: 'row',
    borderLeft: '1pt solid ' + BORDER,
    backgroundColor: '#F0F4F8',
  },
  cell: (width: number, isHeader = false, align: 'left' | 'center' | 'right' = 'center') => ({
    width,
    borderRight: '1pt solid ' + BORDER,
    borderBottom: '1pt solid ' + BORDER,
    padding: '2pt 3pt',
    fontSize: isHeader ? 7 : 7.5,
    fontFamily: isHeader ? 'Helvetica-Bold' : 'Helvetica',
    color: isHeader ? '#FFFFFF' : '#111111',
    textAlign: align,
    flexShrink: 0,
  }),
  // Bottom section
  satisfactionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    marginTop: 8,
    marginBottom: 10,
    border: '1pt solid ' + BORDER,
    padding: '4pt 6pt',
    borderRadius: 2,
  },
  checkbox: {
    width: 10,
    height: 10,
    border: '1pt solid ' + BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  checkmark: {
    fontSize: 8,
    color: BLUE,
    fontFamily: 'Helvetica-Bold',
  },
  satisfactionText: {
    fontSize: 7.5,
    color: '#111111',
    flex: 1,
  },
  satisfactionBold: {
    fontFamily: 'Helvetica-Bold',
  },
  // Footer signatures
  footerDateRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 14,
  },
  footerDate: {
    fontSize: 7.5,
    color: '#333333',
  },
  footerSigRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
});

const COL_WIDTHS = {
  num:     22,
  date:    58,
  prix:    52,
  points:  50,
  agent:   80,
  produit: 80,
  sig:     60,
};

function formatCDF(amount: number): string {
  return new Intl.NumberFormat('fr-CD').format(amount) + ' CDF';
}

function LogoCircle() {
  return (
    <View style={styles.logoBox}>
      <Text style={styles.logoText}>PROGRESS</Text>
      <Text style={styles.logoText}>Business</Text>
    </View>
  );
}

export function FicheAdhesionPDF({ data }: { data: FicheAdhesionData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <LogoCircle />
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>
              PROGRESS <Text style={styles.companyNameAccent}>BUSINESS</Text>
            </Text>
            <Text style={styles.companyMeta}>
              RCCM : RDC/RCCM/19-B-0615{'\n'}
              IDNAT : 5-83-N685001{'\n'}
              IMPOT : A19086215
            </Text>
          </View>
          <LogoCircle />
        </View>

        {/* ── Title ─────────────────────────────────────────────── */}
        <View style={styles.titleBlock}>
          <Text style={styles.titleText}>Fiche d'Adhésion Progressive</Text>
          <Text style={styles.ficheNum}>N°{data.numeroFiche}</Text>
        </View>

        {/* ── Client info ───────────────────────────────────────── */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom &amp; Post-nom :</Text>
          <Text style={styles.infoValue}>{data.nomComplet}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Invité par :</Text>
          <Text style={styles.infoValue}>{data.parrainNom ?? '.....................'}</Text>
          <Text style={[styles.infoLabel, { minWidth: 20, marginLeft: 8 }]}>N° :</Text>
          <Text style={[styles.infoValue, { maxWidth: 60 }]}>{data.parrainCode ?? '............'}</Text>
          <Text style={[styles.infoLabel, { minWidth: 28, marginLeft: 8 }]}>ou ID :</Text>
          <Text style={[styles.infoValue, { maxWidth: 60 }]}>.....................</Text>
        </View>

        <View style={styles.infoRow2col}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={styles.infoLabel}>Adresse :</Text>
            <Text style={[styles.infoValue]}>{data.adresse ?? '.....................'}</Text>
          </View>
          <View style={{ flex: 0.6, flexDirection: 'row', alignItems: 'flex-end' }}>
            <Text style={[styles.infoLabel, { minWidth: 28 }]}>Ville :</Text>
            <Text style={styles.infoValue}>{data.ville ?? data.siteVille}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Téléphone :</Text>
          <Text style={styles.infoValue}>{data.telephone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>E-mail :</Text>
          <Text style={styles.infoValue}>{data.email ?? '...............................................'}</Text>
        </View>

        {/* Date + signature zone */}
        <View style={styles.signatureZone}>
          <View style={styles.signatureBox}>
            <Text style={styles.signatureLabel}>
              Fait à {data.siteVille}, le {data.dateActivation}
            </Text>
            <Text style={[styles.signatureLabel, { marginTop: 4 }]}>Signature du nouveau membre</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>

        {/* ── COTATIONS DU MEMBRE ───────────────────────────────── */}
        <Text style={styles.tableTitle}>COTATIONS DU MEMBRE</Text>

        {/* Table header */}
        <View style={styles.tableHeader}>
          <Text style={styles.cell(COL_WIDTHS.num, true)}>N°</Text>
          <Text style={styles.cell(COL_WIDTHS.date, true)}>Date</Text>
          <Text style={styles.cell(COL_WIDTHS.prix, true)}>PRIX</Text>
          <Text style={styles.cell(COL_WIDTHS.points, true)}>Point{'\n'}cumulés</Text>
          <Text style={styles.cell(COL_WIDTHS.agent, true)}>Nom agent</Text>
          <Text style={styles.cell(COL_WIDTHS.produit, true)}>Produit</Text>
          <Text style={styles.cell(COL_WIDTHS.sig, true)}>Signature{'\n'}agent</Text>
        </View>

        {/* Data row */}
        <View style={styles.tableRow}>
          <Text style={styles.cell(COL_WIDTHS.num)}>1.</Text>
          <Text style={styles.cell(COL_WIDTHS.date, false, 'left')}>
            le {data.dateActivation}
          </Text>
          <Text style={styles.cell(COL_WIDTHS.prix, false, 'right')}>
            {formatCDF(data.produitPrix)}
          </Text>
          <Text style={styles.cell(COL_WIDTHS.points)}>
            {data.pointsCumules}P
          </Text>
          <Text style={styles.cell(COL_WIDTHS.agent, false, 'left')}>
            {data.agentNom.toUpperCase()}
          </Text>
          <Text style={styles.cell(COL_WIDTHS.produit, false, 'left')}>
            {data.produitNom}
          </Text>
          <Text style={styles.cell(COL_WIDTHS.sig)}> </Text>
        </View>

        {/* Empty rows (2 extra for manual entries) */}
        {[2, 3].map((n) => (
          <View key={n} style={styles.tableRow}>
            <Text style={styles.cell(COL_WIDTHS.num)}>{n}.</Text>
            <Text style={styles.cell(COL_WIDTHS.date)}> </Text>
            <Text style={styles.cell(COL_WIDTHS.prix)}> </Text>
            <Text style={styles.cell(COL_WIDTHS.points)}> </Text>
            <Text style={styles.cell(COL_WIDTHS.agent)}> </Text>
            <Text style={styles.cell(COL_WIDTHS.produit)}> </Text>
            <Text style={styles.cell(COL_WIDTHS.sig)}> </Text>
          </View>
        ))}

        {/* Total row */}
        <View style={styles.tableRowTotal}>
          <Text
            style={{
              ...styles.cell(COL_WIDTHS.num + COL_WIDTHS.date, false, 'left'),
              fontFamily: 'Helvetica-Bold',
            }}
          >
            Points Total
          </Text>
          <Text style={styles.cell(COL_WIDTHS.prix, false, 'right')}>
            {formatCDF(data.produitPrix)}
          </Text>
          <Text style={styles.cell(COL_WIDTHS.points)}>
            {data.pointsCumules}P
          </Text>
          <Text style={styles.cell(COL_WIDTHS.agent, false, 'left')}>
            {data.agentNom.toUpperCase()}
          </Text>
          <Text style={styles.cell(COL_WIDTHS.produit)}> </Text>
          <Text style={styles.cell(COL_WIDTHS.sig)}> </Text>
        </View>

        {/* ── Satisfaction checkbox ─────────────────────────────── */}
        <View style={styles.satisfactionBox}>
          <View style={styles.checkbox}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
          <Text style={styles.satisfactionText}>
            <Text style={styles.satisfactionBold}>
              Le membre a atteint les points de satisfaction (40 points),{' '}
            </Text>
            Désormais membre officiel de{' '}
            <Text style={styles.satisfactionBold}>PROGRESS BUSINESS</Text>
          </Text>
        </View>

        {/* ── Footer ────────────────────────────────────────────── */}
        <View style={styles.footerDateRow}>
          <Text style={styles.footerDate}>
            Fait à {data.siteVille}, le {data.dateActivation}
          </Text>
        </View>

        <View style={styles.footerSigRow}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={[styles.signatureLabel, { marginTop: 4 }]}>Signature du membre</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={[styles.signatureLabel, { marginTop: 4 }]}>Signature agent</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles with no errors**

```bash
cd "D:/PETER/Progress app/techshop-manager/frontend"
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors relating to `FicheAdhesionPDF.tsx`. Ignore unrelated pre-existing errors if any.

- [ ] **Step 3: Commit**

```bash
cd "D:/PETER/Progress app/techshop-manager"
git add frontend/src/components/clients/FicheAdhesionPDF.tsx
git commit -m "feat: add FicheAdhesionPDF react-pdf component"
```

---

## Task 3: Create ProduitSearchInput autocomplete component

**Files:**
- Create: `frontend/src/components/clients/ProduitSearchInput.tsx`

This component hits `GET /produits/search?q=<term>&siteId=<siteId>&limit=10` (already implemented in `StocksController`) and renders a dropdown of matching products. On selection it calls `onSelect(produit)`.

- [ ] **Step 1: Create the component**

Create `frontend/src/components/clients/ProduitSearchInput.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Produit } from '@/types';
import { cn } from '@/lib/utils';

interface Props {
  siteId: string;
  onSelect: (produit: Produit) => void;
  selected: Produit | null;
  onClear: () => void;
}

export function ProduitSearchInput({ siteId, onSelect, selected, onClear }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const { data, isFetching } = useQuery<Produit[]>({
    queryKey: ['produits-search', query, siteId],
    queryFn: async () => {
      const res = await api.get('/produits/search', {
        params: { q: query, siteId, limit: 10 },
      });
      // StocksService.searchProduits returns an array of { produit, quantite, ... }
      // Map to just the Produit shape
      return (res.data as Array<{ produit: Produit }>).map((item) => item.produit);
    },
    enabled: query.length >= 1 && open,
    staleTime: 30_000,
  });

  if (selected) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-primary truncate">{selected.nom}</p>
          <p className="text-[11px] text-text-muted">{selected.sku}</p>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full hover:bg-red-100 text-text-muted hover:text-danger transition-colors"
          aria-label="Retirer le produit sélectionné"
        >
          <X size={13} aria-hidden />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-white px-3 py-2 focus-within:border-primary-accent focus-within:ring-1 focus-within:ring-primary-accent/20">
        <Search size={14} className="text-text-muted flex-shrink-0" aria-hidden />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Rechercher un produit (nom ou SKU)…"
          className="flex-1 bg-transparent text-[13px] text-text placeholder:text-text-muted outline-none"
          aria-label="Rechercher un produit"
          aria-autocomplete="list"
          aria-expanded={open && !!data?.length}
        />
        {isFetching && (
          <span className="text-[11px] text-text-muted italic">Recherche…</span>
        )}
      </div>

      {open && data && data.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-white shadow-lg overflow-hidden max-h-52 overflow-y-auto"
        >
          {data.map((produit) => (
            <li
              key={produit.id}
              role="option"
              aria-selected={false}
              onClick={() => {
                onSelect(produit);
                setOpen(false);
                setQuery('');
              }}
              className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-slate-50 border-b border-border last:border-0"
            >
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-text truncate">{produit.nom}</p>
                <p className="text-[11px] text-text-muted">{produit.sku}</p>
              </div>
              <span className="text-[12px] font-mono font-bold text-primary flex-shrink-0 ml-4">
                {new Intl.NumberFormat('fr-CD').format(produit.prixVente)} CDF
              </span>
            </li>
          ))}
        </ul>
      )}

      {open && query.length >= 1 && !isFetching && data?.length === 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-border bg-white shadow-lg px-3 py-3 text-[12px] text-text-muted text-center">
          Aucun produit trouvé pour « {query} »
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd "D:/PETER/Progress app/techshop-manager/frontend"
npx tsc --noEmit 2>&1 | head -30
```

Expected: no errors in `ProduitSearchInput.tsx`.

- [ ] **Step 3: Commit**

```bash
cd "D:/PETER/Progress app/techshop-manager"
git add frontend/src/components/clients/ProduitSearchInput.tsx
git commit -m "feat: add ProduitSearchInput autocomplete component"
```

---

## Task 4: Update OnboardingActivationPage — SuccessScreen with fiche generation

**Files:**
- Modify: `frontend/src/pages/clients/OnboardingActivationPage.tsx`

The current `SuccessScreen` auto-redirects after 5 seconds. We replace this with a two-phase success screen:
1. **Phase 1** (default): Shows the activation success, code parrain, and the product selector + "Générer la Fiche PDF" button. The auto-redirect countdown is removed.
2. After PDF download is triggered, a "Continuer" button appears to navigate to the client profile.

The `pdf()` helper from `@react-pdf/renderer` generates a blob URL in-browser which we trigger as a download. We also need the full client data (parrain info, agent name, address). The `ClientActivation` type already carries parrain data; agent name comes from `useAuthStore`.

**Computing `numeroFiche`:** The activation response returns `id` (UUID). We use the last 4 characters of the UUID as a short display number. In a follow-up migration you could add a real sequential field, but for now this is unambiguous per client.

**Computing `dateActivation` display:** Format `result.dateActivation` as `DD/MM/YYYY`.

- [ ] **Step 1: Add the new imports at the top of OnboardingActivationPage.tsx**

In `frontend/src/pages/clients/OnboardingActivationPage.tsx`, replace the existing import block at lines 1–11 with:

```tsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, CheckCircle2, XCircle, Phone, MapPin, CreditCard,
  Copy, UserCheck, AlertTriangle, Loader2, Zap, Users, FileText,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { pdf } from '@react-pdf/renderer';
import { api, getErrorMessage } from '@/lib/api';
import { cn, formatCDF, formatDate, initials } from '@/lib/utils';
import { OnboardingStepper } from '@/components/clients/OnboardingStepper';
import { ProduitSearchInput } from '@/components/clients/ProduitSearchInput';
import { FicheAdhesionPDF, FicheAdhesionData } from '@/components/clients/FicheAdhesionPDF';
import { useAuthStore } from '@/store/auth.store';
import { Produit } from '@/types';
```

- [ ] **Step 2: Replace the SuccessScreen component (lines 121–195) with the updated version**

Replace the entire `SuccessScreen` function in `OnboardingActivationPage.tsx`. The new version accepts `client` (for parrain/site data) and `siteId` prop:

```tsx
function SuccessScreen({
  result,
  client,
  clientId,
  onNavigate,
}: {
  result: ActivationResult;
  client: ClientActivation;
  clientId: string;
  onNavigate: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(result.codeParrain).catch(() => {});
    toast.success('Code copié !');
  };

  async function handleGeneratePDF() {
    if (!selectedProduit) return;
    setGenerating(true);
    try {
      // Format date DD/MM/YYYY
      const dateStr = new Date(result.dateActivation).toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
      });

      // N° fiche: last 4 chars of UUID (simple, unambiguous per client)
      const numeroFiche = result.id.slice(-4).toUpperCase();

      const ficheData: FicheAdhesionData = {
        nomComplet: `${result.prenom} ${result.nom}`.toUpperCase(),
        telephone: result.telephone,
        email: undefined,
        adresse: undefined,
        ville: client.site?.nom ?? '',
        siteVille: client.site?.nom ?? 'Goma',
        numeroFiche,
        dateActivation: dateStr,
        parrainNom: client.parrain
          ? `${client.parrain.prenom} ${client.parrain.nom}`
          : undefined,
        parrainCode: client.parrain?.codeParrain ?? undefined,
        agentNom: user?.nom ?? user?.name ?? 'Agent',
        produitNom: selectedProduit.nom,
        produitPrix: selectedProduit.prixVente,
        pointsCumules: 40,
      };

      const blob = await pdf(<FicheAdhesionPDF data={ficheData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fiche-${result.prenom}-${result.nom}-${numeroFiche}.pdf`.toLowerCase().replace(/\s+/g, '-');
      a.click();
      URL.revokeObjectURL(url);
      setGenerated(true);
      toast.success('Fiche générée avec succès !');
    } catch {
      toast.error('Erreur lors de la génération du PDF.');
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="flex flex-col items-center text-center py-10 px-6 space-y-5">
      <CheckCircle2 size={72} className="text-success" aria-hidden />
      <div>
        <h2 className="text-[22px] font-extrabold text-primary">Compte activé avec succès !</h2>
        <p className="text-[14px] text-text-muted mt-1">
          {result.prenom} {result.nom} est maintenant un client actif.
        </p>
      </div>

      {/* Code parrain */}
      <div className="rounded-xl border border-blue-100 bg-blue-50 px-6 py-4 space-y-3 w-full max-w-sm">
        <p className="text-[11px] font-bold uppercase tracking-widest text-primary-accent">Code parrain attribué</p>
        <p className="text-[28px] font-extrabold font-mono text-primary tracking-widest">{result.codeParrain}</p>
        <button
          type="button"
          onClick={copyCode}
          className="flex items-center gap-1.5 mx-auto px-4 py-1.5 rounded-lg border border-border text-[12px] font-semibold text-text-muted hover:text-primary-accent hover:border-primary-accent transition-colors"
        >
          <Copy size={13} aria-hidden />
          Copier le code
        </button>
      </div>

      <p className="text-[12px] text-text-muted">
        Un SMS de bienvenue a été envoyé au {result.telephone}{' '}
        <span className="italic">(si le service SMS est configuré)</span>
      </p>

      {/* Fiche generation block */}
      <div className="w-full max-w-sm rounded-xl border border-border bg-white shadow-sm p-5 space-y-4 text-left">
        <div>
          <p className="text-[13px] font-bold text-primary">Générer la Fiche d'Adhésion</p>
          <p className="text-[11px] text-text-muted mt-0.5">
            Sélectionnez le produit physique acheté par le client pour compléter la fiche.
          </p>
        </div>

        <ProduitSearchInput
          siteId={client.siteInscriptionId}
          selected={selectedProduit}
          onSelect={setSelectedProduit}
          onClear={() => { setSelectedProduit(null); setGenerated(false); }}
        />

        {selectedProduit && (
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-text-muted">
            Prix : <span className="font-mono font-bold text-text">
              {new Intl.NumberFormat('fr-CD').format(selectedProduit.prixVente)} CDF
            </span>
            {' · '}Points : <span className="font-bold text-primary">40P</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleGeneratePDF}
          disabled={!selectedProduit || generating}
          className="btn-primary w-full text-[13px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {generating
            ? <><Loader2 size={14} className="animate-spin" aria-hidden /> Génération…</>
            : <><FileText size={14} aria-hidden /> Générer la Fiche PDF</>
          }
        </button>

        {generated && (
          <p className="text-[11px] text-success text-center font-medium">
            ✓ Fiche téléchargée. Vous pouvez en générer une nouvelle si besoin.
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-3 flex-wrap justify-center pt-2">
        <Link to={`/clients/${clientId}`} className="btn-primary text-[13px]">
          Voir la fiche client
        </Link>
        <Link to="/clients/new/recit" className="btn-secondary text-[13px]">
          + Nouveau client
        </Link>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update the SuccessScreen call site (in the render section, around line 272–282)**

Find this block in the page render:

```tsx
  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto rounded-xl border border-border bg-white shadow-sm">
        <SuccessScreen
          result={successResult}
          clientId={id!}
          onNavigate={handleSuccessNavigate}
        />
      </div>
    );
  }
```

Replace with:

```tsx
  if (successResult) {
    return (
      <div className="max-w-2xl mx-auto rounded-xl border border-border bg-white shadow-sm">
        <SuccessScreen
          result={successResult}
          client={client}
          clientId={id!}
          onNavigate={handleSuccessNavigate}
        />
      </div>
    );
  }
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd "D:/PETER/Progress app/techshop-manager/frontend"
npx tsc --noEmit 2>&1 | head -40
```

Expected: no type errors in `OnboardingActivationPage.tsx`.

- [ ] **Step 5: Commit**

```bash
cd "D:/PETER/Progress app/techshop-manager"
git add frontend/src/pages/clients/OnboardingActivationPage.tsx
git commit -m "feat: add fiche PDF generation to activation success screen"
```

---

## Task 5: Verify searchProduits response shape and fix mapping if needed

The `StocksService.searchProduits` may return `StockItem[]` (with `.produit` nested) or `Produit[]` directly. We need to confirm the actual shape.

**Files:**
- Read: `backend/src/modules/stocks/stocks.service.ts` (searchProduits method)
- Possibly modify: `frontend/src/components/clients/ProduitSearchInput.tsx`

- [ ] **Step 1: Check the searchProduits return shape**

```bash
grep -A 30 "searchProduits" "D:/PETER/Progress app/techshop-manager/backend/src/modules/stocks/stocks.service.ts" | head -50
```

- [ ] **Step 2: If it returns `StockItem[]` with nested `.produit`** — the current mapping in `ProduitSearchInput` is correct:
  ```ts
  return (res.data as Array<{ produit: Produit }>).map((item) => item.produit);
  ```
  No change needed.

- [ ] **Step 3: If it returns a flat `Produit[]`** — update the mapping in `ProduitSearchInput.tsx`:

  Replace in `frontend/src/components/clients/ProduitSearchInput.tsx`:
  ```ts
      return (res.data as Array<{ produit: Produit }>).map((item) => item.produit);
  ```
  with:
  ```ts
      return res.data as Produit[];
  ```

- [ ] **Step 4: If changed, commit**

```bash
cd "D:/PETER/Progress app/techshop-manager"
git add frontend/src/components/clients/ProduitSearchInput.tsx
git commit -m "fix: correct produits search response mapping"
```

---

## Task 6: End-to-end browser test

- [ ] **Step 1: Start the dev servers**

```bash
# Terminal 1
cd "D:/PETER/Progress app/techshop-manager/backend"
npm run start:dev

# Terminal 2
cd "D:/PETER/Progress app/techshop-manager/frontend"
npm run dev
```

- [ ] **Step 2: Activate a test client**

1. Log in as AGENT (phone: `+243902238740`, password: `Admin@2025`)
2. Create a new client through the full onboarding flow: Récit → Formation → Fiche
3. On the Activation page, click "Activer le compte"
4. Confirm the activation

- [ ] **Step 3: Test product search**

On the success screen:
1. Type at least 1 character in the product search field
2. Verify the dropdown shows matching products from the catalog
3. Select a product
4. Verify the price and "40P" summary appear below the selector

- [ ] **Step 4: Generate PDF**

1. Click "Générer la Fiche PDF"
2. Verify the browser triggers a file download named `fiche-prenom-nom-XXXX.pdf`
3. Open the PDF and verify:
   - Header: two logo circles, "PROGRESS BUSINESS" company info
   - Title: "FICHE D'ADHÉSION PROGRESSIVE" with N° (last 4 of UUID)
   - Client info: name, phone, parrain name + code (if any), city, date
   - Table: columns N°, Date, PRIX, Point cumulés, Nom agent, **Produit**, Signature agent
   - Row 1: correct date, product price in CDF, "40P", agent name, product name
   - Satisfaction checkbox text is present and checked
   - Footer: two signature zones

- [ ] **Step 5: Test edge cases**

- Client without parrain: "Invité par" line shows dots, no parrain code
- Long product name: verify it doesn't overflow the table cell
- "Retirer le produit" (X button): clears selection, re-enables search

- [ ] **Step 6: Final commit if any fixes were made**

```bash
cd "D:/PETER/Progress app/techshop-manager"
git add -p
git commit -m "fix: fiche PDF layout adjustments after browser testing"
```
