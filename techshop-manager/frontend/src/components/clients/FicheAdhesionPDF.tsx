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

function cell(
  width: number,
  isHeader = false,
  align: 'left' | 'center' | 'right' = 'center',
) {
  return {
    width,
    borderRight: '1pt solid ' + BORDER,
    borderBottom: '1pt solid ' + BORDER,
    padding: '2pt 3pt' as const,
    fontSize: isHeader ? 7 : 7.5,
    fontFamily: isHeader ? 'Helvetica-Bold' : 'Helvetica',
    color: isHeader ? '#FFFFFF' : '#111111',
    textAlign: align,
    flexShrink: 0,
  };
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
          <Text style={styles.infoLabel}>Nom & Post-nom :</Text>
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
          <Text style={cell(COL_WIDTHS.num, true)}>N°</Text>
          <Text style={cell(COL_WIDTHS.date, true)}>Date</Text>
          <Text style={cell(COL_WIDTHS.prix, true)}>PRIX</Text>
          <Text style={cell(COL_WIDTHS.points, true)}>Point{'\n'}cumulés</Text>
          <Text style={cell(COL_WIDTHS.agent, true)}>Nom agent</Text>
          <Text style={cell(COL_WIDTHS.produit, true)}>Produit</Text>
          <Text style={cell(COL_WIDTHS.sig, true)}>Signature{'\n'}agent</Text>
        </View>

        {/* Data row */}
        <View style={styles.tableRow}>
          <Text style={cell(COL_WIDTHS.num)}>1.</Text>
          <Text style={cell(COL_WIDTHS.date, false, 'left')}>
            le {data.dateActivation}
          </Text>
          <Text style={cell(COL_WIDTHS.prix, false, 'right')}>
            {formatCDF(data.produitPrix)}
          </Text>
          <Text style={cell(COL_WIDTHS.points)}>
            {data.pointsCumules}P
          </Text>
          <Text style={cell(COL_WIDTHS.agent, false, 'left')}>
            {data.agentNom.toUpperCase()}
          </Text>
          <Text style={cell(COL_WIDTHS.produit, false, 'left')}>
            {data.produitNom}
          </Text>
          <Text style={cell(COL_WIDTHS.sig)}> </Text>
        </View>

        {/* Empty rows (2 extra for manual entries) */}
        {[2, 3].map((n) => (
          <View key={n} style={styles.tableRow}>
            <Text style={cell(COL_WIDTHS.num)}>{n}.</Text>
            <Text style={cell(COL_WIDTHS.date)}> </Text>
            <Text style={cell(COL_WIDTHS.prix)}> </Text>
            <Text style={cell(COL_WIDTHS.points)}> </Text>
            <Text style={cell(COL_WIDTHS.agent)}> </Text>
            <Text style={cell(COL_WIDTHS.produit)}> </Text>
            <Text style={cell(COL_WIDTHS.sig)}> </Text>
          </View>
        ))}

        {/* Total row */}
        <View style={styles.tableRowTotal}>
          <Text
            style={{
              ...cell(COL_WIDTHS.num + COL_WIDTHS.date, false, 'left'),
              fontFamily: 'Helvetica-Bold',
            }}
          >
            Points Total
          </Text>
          <Text style={cell(COL_WIDTHS.prix, false, 'right')}>
            {formatCDF(data.produitPrix)}
          </Text>
          <Text style={cell(COL_WIDTHS.points)}>
            {data.pointsCumules}P
          </Text>
          <Text style={cell(COL_WIDTHS.agent, false, 'left')}>
            {data.agentNom.toUpperCase()}
          </Text>
          <Text style={cell(COL_WIDTHS.produit)}> </Text>
          <Text style={cell(COL_WIDTHS.sig)}> </Text>
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
