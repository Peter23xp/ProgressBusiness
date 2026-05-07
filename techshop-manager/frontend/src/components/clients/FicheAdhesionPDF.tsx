import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from '@react-pdf/renderer';

Font.registerHyphenationCallback((word) => [word]);

export interface FicheAdhesionData {
  nomComplet: string;
  telephone: string;
  email?: string;
  adresse?: string;
  ville: string;
  numeroFiche: string;
  dateActivation: string;
  parrainNom?: string;
  parrainCode?: string;
  agentNom: string;
  produitNom: string;
  produitPrix: number;
  pointsCumules: number;
}

const BLUE = '#1E3A5F';
const RED = '#CC0000';
const BORDER = '#444444';
const DOT_BORDER = '#999999';
const LOGO_URL = '/assets/Progress business logo.png';

// A4 = 595×842pt — watermark centered
const WM = 280;
const WM_LEFT = (595 - WM) / 2;  // 157.5
const WM_TOP  = (842 - WM) / 2;  // 281

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 7.5,
    paddingTop: 14,
    paddingBottom: 14,
    paddingLeft: 20,
    paddingRight: 20,
    color: '#111111',
    backgroundColor: '#FFFFFF',
    lineHeight: 1.15,
  },

  watermark: {
    position: 'absolute',
    top: WM_TOP,
    left: WM_LEFT,
    width: WM,
    height: WM,
    opacity: 0.06,
  },

  // ── Header ────────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  logo: {
    width: 55,
    height: 55,
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
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  companyNameAccent: {
    color: RED,
  },
  companyMeta: {
    fontSize: 6,
    color: '#333333',
    textAlign: 'center',
    marginTop: 2,
    lineHeight: 1.4,
  },

  // ── Title ─────────────────────────────────────────────────
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 6,
    borderTop: '1.5pt solid ' + BLUE,
    borderBottom: '1.5pt solid ' + BLUE,
    paddingTop: 3,
    paddingBottom: 3,
  },
  titleText: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ficheNumLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },

  // ── Info fields ───────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    marginBottom: 4,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    flexShrink: 0,
  },
  infoUnderline: {
    flex: 1,
    fontSize: 7.5,
    color: '#111111',
    borderBottom: '0.75pt dotted ' + DOT_BORDER,
    paddingBottom: 1,
    marginLeft: 2,
  },

  // ── Date + signature ──────────────────────────────────────
  dateSignRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 5,
    marginBottom: 6,
  },
  dateSignBlock: {
    alignItems: 'flex-end',
  },
  dateSignText: {
    fontSize: 7,
    color: '#111111',
    textAlign: 'right',
  },
  signatureLabelSmall: {
    fontSize: 7,
    color: '#111111',
    marginTop: 2,
    textAlign: 'right',
  },
  signatureLine: {
    borderBottom: '0.5pt solid ' + BORDER,
    width: 130,
    marginTop: 16,
  },

  // ── Table ─────────────────────────────────────────────────
  tableLabel: {
    fontSize: 8.5,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },

  // ── Satisfaction ──────────────────────────────────────────
  satRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 10,
  },
  satCheckbox: {
    width: 10,
    height: 10,
    border: '1pt solid ' + BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
    marginRight: 4,
  },
  satCheckMark: {
    fontSize: 8,
    color: RED,
    fontFamily: 'Helvetica-Bold',
  },
  satText: {
    fontSize: 7.5,
    color: RED,
    flex: 1,
    lineHeight: 1.35,
  },
  satBold: {
    fontFamily: 'Helvetica-Bold',
    color: RED,
  },

  // ── Footer ────────────────────────────────────────────────
  footerDateText: {
    fontSize: 7,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 3,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 3,
  },
  footerSigBlock: {
    alignItems: 'center',
    width: 130,
  },
  footerSigLine: {
    borderBottom: '0.5pt solid ' + BORDER,
    width: 130,
    marginTop: 18,
    marginBottom: 2,
  },
  footerSigLabel: {
    fontSize: 7,
    color: '#111111',
    textAlign: 'center',
  },
});

// Column widths — 555pt usable (595-40)
const C = {
  num:     22,
  date:    58,
  prix:    58,
  points:  48,
  agent:   86,
  produit: 86,
  sig:     56,
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
    borderRight: '0.75pt solid ' + BORDER,
    borderBottom: '0.75pt solid ' + BORDER,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 3,
    paddingRight: 3,
    fontSize: isHeader ? 6.5 : 7,
    fontFamily: isHeader ? ('Helvetica-Bold' as const) : ('Helvetica' as const),
    color: isHeader ? '#FFFFFF' : '#111111',
    textAlign: align,
    flexShrink: 0,
  };
}

export function FicheAdhesionPDF({ data }: { data: FicheAdhesionData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Watermark — painted first, stays behind all content ── */}
        <Image src={LOGO_URL} style={styles.watermark} />

        {/* ── Header ───────────────────────────────────────────────── */}
        <View style={styles.headerRow}>
          <Image src={LOGO_URL} style={styles.logo} />
          <View style={styles.companyBlock}>
            <Text style={styles.companyName}>
              PROGRESS{' '}
              <Text style={styles.companyNameAccent}>BUSINESS</Text>
            </Text>
            <Text style={styles.companyMeta}>
              {'RCCM : RDC/RCCM/19-B-0615\nIDNAT : 5-83-N685001\nIMPOT : A19086215'}
            </Text>
          </View>
          <Image src={LOGO_URL} style={styles.logo} />
        </View>

        {/* ── Title ────────────────────────────────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>Fiche d'Adhésion Progressive</Text>
          <Text style={styles.ficheNumLabel}>N°{data.numeroFiche}</Text>
        </View>

        {/* ── Client info ──────────────────────────────────────────── */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom &amp; Post-nom : </Text>
          <Text style={styles.infoUnderline}>{data.nomComplet}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Invité par : </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 110 }]}>{data.parrainNom ?? ''}</Text>
          <Text style={[styles.infoLabel, { marginLeft: 7 }]}>N° : </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 55 }]}>{data.parrainCode ?? ''}</Text>
          <Text style={[styles.infoLabel, { marginLeft: 7 }]}>ou ID : </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 55 }]}>{''}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Adresse : </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 190 }]}>{data.adresse ?? ''}</Text>
          <Text style={[styles.infoLabel, { marginLeft: 9 }]}>Ville </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 75 }]}>{data.ville}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Téléphone : </Text>
          <Text style={styles.infoUnderline}>{data.telephone}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>E-mail : </Text>
          <Text style={styles.infoUnderline}>{data.email ?? ''}</Text>
        </View>

        {/* Date + Signature nouveau membre */}
        <View style={styles.dateSignRow}>
          <View style={styles.dateSignBlock}>
            <Text style={styles.dateSignText}>
              Fait à {data.ville}, le {data.dateActivation}
            </Text>
            <Text style={styles.signatureLabelSmall}>Signature du nouveau membre</Text>
            <View style={styles.signatureLine} />
          </View>
        </View>

        {/* ── COTATIONS DU MEMBRE ──────────────────────────────────── */}
        <Text style={styles.tableLabel}>COTATIONS DU MEMBRE</Text>

        {/* Header row */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: BLUE,
          borderTop: '0.75pt solid ' + BORDER,
          borderLeft: '0.75pt solid ' + BORDER,
        }}>
          <Text style={cell(C.num, true)}>N°</Text>
          <Text style={cell(C.date, true)}>Date</Text>
          <Text style={cell(C.prix, true)}>PRIX</Text>
          <Text style={cell(C.points, true)}>{'Point\ncumulés'}</Text>
          <Text style={cell(C.agent, true)}>Nom agent</Text>
          <Text style={cell(C.produit, true)}>Produit</Text>
          <Text style={cell(C.sig, true)}>{'Signature\nagent'}</Text>
        </View>

        {/* Ligne 1 — données réelles */}
        <View style={{ flexDirection: 'row', borderLeft: '0.75pt solid ' + BORDER }}>
          <Text style={cell(C.num)}>1.</Text>
          <Text style={cell(C.date, false, 'left')}>le {data.dateActivation}</Text>
          <Text style={cell(C.prix, false, 'right')}>{formatCDF(data.produitPrix)}</Text>
          <Text style={cell(C.points)}>{data.pointsCumules}P</Text>
          <Text style={cell(C.agent, false, 'left')}>{data.agentNom.toUpperCase()}</Text>
          <Text style={cell(C.produit, false, 'left')}>{data.produitNom}</Text>
          <Text style={cell(C.sig)}>{' '}</Text>
        </View>

        {/* Lignes vides 2–5 */}
        {[2, 3, 4, 5].map((n) => (
          <View key={n} style={{ flexDirection: 'row', borderLeft: '0.75pt solid ' + BORDER }}>
            <Text style={cell(C.num)}>{n}.</Text>
            <Text style={cell(C.date)}>{' '}</Text>
            <Text style={cell(C.prix)}>{' '}</Text>
            <Text style={cell(C.points)}>{' '}</Text>
            <Text style={cell(C.agent)}>{' '}</Text>
            <Text style={cell(C.produit)}>{' '}</Text>
            <Text style={cell(C.sig)}>{' '}</Text>
          </View>
        ))}

        {/* Ligne Points Total */}
        <View style={{
          flexDirection: 'row',
          borderLeft: '0.75pt solid ' + BORDER,
          backgroundColor: '#EEF2F7',
        }}>
          <Text style={{
            ...cell(C.num + C.date, false, 'left'),
            fontFamily: 'Helvetica-Bold',
          }}>Points Total</Text>
          <Text style={cell(C.prix, false, 'right')}>{formatCDF(data.produitPrix)}</Text>
          <Text style={cell(C.points)}>{data.pointsCumules}P</Text>
          <Text style={cell(C.agent, false, 'left')}>{data.agentNom.toUpperCase()}</Text>
          <Text style={cell(C.produit)}>{' '}</Text>
          <Text style={cell(C.sig)}>{' '}</Text>
        </View>

        {/* ── Satisfaction ─────────────────────────────────────────── */}
        <View style={styles.satRow}>
          <View style={styles.satCheckbox}>
            <Text style={styles.satCheckMark}>✓</Text>
          </View>
          <Text style={styles.satText}>
            <Text style={styles.satBold}>
              Le membre a atteint les points de satisfaction (40 points),{' '}
            </Text>
            Désormais membre officiel de{' '}
            <Text style={styles.satBold}>PROGRESS BUSINESS</Text>
          </Text>
        </View>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <Text style={styles.footerDateText}>
          Fait à {data.ville}, le {data.dateActivation}
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.footerSigBlock}>
            <View style={styles.footerSigLine} />
            <Text style={styles.footerSigLabel}>Signature du membre</Text>
          </View>
          <View style={styles.footerSigBlock}>
            <View style={styles.footerSigLine} />
            <Text style={styles.footerSigLabel}>Signature agent</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}
