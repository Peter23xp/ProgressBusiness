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
  ville: string;           // Juste la ville : "Goma", "Bukavu", "Kinshasa"
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
const BORDER = '#555555';
const LIGHT_BORDER = '#AAAAAA';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 28,
    paddingRight: 28,
    color: '#111111',
    backgroundColor: '#FFFFFF',
  },

  // ── Header ─────────────────────────────────────────────
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  logo: {
    width: 60,
    height: 60,
  },
  companyBlock: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  companyName: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 1,
  },
  companyNameAccent: {
    color: '#CC0000',
  },
  companyMeta: {
    fontSize: 6.5,
    color: '#333333',
    textAlign: 'center',
    marginTop: 3,
    lineHeight: 1.5,
  },

  // ── Title ──────────────────────────────────────────────
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
    borderTop: '1.5pt solid ' + BLUE,
    borderBottom: '1.5pt solid ' + BLUE,
    paddingTop: 4,
    paddingBottom: 4,
  },
  titleText: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BLUE,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  ficheNumLabel: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
  },

  // ── Info fields ────────────────────────────────────────
  infoRow: {
    flexDirection: 'row',
    marginBottom: 5,
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    flexShrink: 0,
  },
  infoUnderline: {
    flex: 1,
    fontSize: 8,
    color: '#111111',
    borderBottom: '0.5pt solid ' + LIGHT_BORDER,
    paddingBottom: 1,
    marginLeft: 2,
  },

  // ── Date + signature zone ──────────────────────────────
  dateSignRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
    marginBottom: 8,
  },
  dateSignBlock: {
    alignItems: 'flex-end',
  },
  dateSignText: {
    fontSize: 7.5,
    color: '#111111',
    textAlign: 'right',
  },
  signatureLabelSmall: {
    fontSize: 7.5,
    color: '#111111',
    marginTop: 3,
    textAlign: 'right',
  },
  signatureLine: {
    borderBottom: '0.5pt solid ' + BORDER,
    width: 140,
    marginTop: 18,
  },

  // ── COTATIONS table ────────────────────────────────────
  tableLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#111111',
    textTransform: 'uppercase',
    marginBottom: 3,
  },

  // ── Satisfaction box ───────────────────────────────────
  satRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 10,
    marginBottom: 12,
  },
  satCheckbox: {
    width: 11,
    height: 11,
    border: '1pt solid ' + BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
    marginRight: 5,
  },
  satCheckMark: {
    fontSize: 9,
    color: '#111111',
    fontFamily: 'Helvetica-Bold',
  },
  satText: {
    fontSize: 8,
    color: '#111111',
    flex: 1,
    lineHeight: 1.4,
  },

  // ── Footer ─────────────────────────────────────────────
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  footerSigBlock: {
    alignItems: 'center',
    width: 140,
  },
  footerSigLine: {
    borderBottom: '0.5pt solid ' + BORDER,
    width: 140,
    marginTop: 22,
    marginBottom: 3,
  },
  footerSigLabel: {
    fontSize: 7.5,
    color: '#111111',
    textAlign: 'center',
  },
  footerDateText: {
    fontSize: 7.5,
    color: '#111111',
    textAlign: 'center',
    marginBottom: 4,
  },
});

// Largeurs colonnes table (total doit tenir en A4 moins les paddings: 595-56=539pt)
const C = {
  num:     24,   // N°
  date:    62,   // Date
  prix:    60,   // PRIX
  points:  52,   // Point cumulés
  agent:   90,   // Nom agent
  produit: 90,   // Produit
  sig:     60,   // Signature agent
  // total: 438 — ok
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
    borderRight: '0.5pt solid ' + BORDER,
    borderBottom: '0.5pt solid ' + BORDER,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 3,
    paddingRight: 3,
    fontSize: isHeader ? 7 : 7.5,
    fontFamily: isHeader ? 'Helvetica-Bold' : 'Helvetica',
    color: isHeader ? '#FFFFFF' : '#111111',
    textAlign: align,
    flexShrink: 0,
  };
}

const LOGO_URL = '/assets/Progress business logo.png';

export function FicheAdhesionPDF({ data }: { data: FicheAdhesionData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* ── Header ─────────────────────────────────────────────── */}
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

        {/* ── Title ──────────────────────────────────────────────── */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>Fiche d'Adhésion Progressive</Text>
          <Text style={styles.ficheNumLabel}>N°{data.numeroFiche}</Text>
        </View>

        {/* ── Client info ────────────────────────────────────────── */}

        {/* Nom & Post-nom */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nom &amp; Post-nom : </Text>
          <Text style={styles.infoUnderline}>{data.nomComplet}</Text>
        </View>

        {/* Invité par : _____ N° : _____ ou ID : _____ */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Invité par : </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 120 }]}>
            {data.parrainNom ?? ''}
          </Text>
          <Text style={[styles.infoLabel, { marginLeft: 8 }]}>N° : </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 60 }]}>
            {data.parrainCode ?? ''}
          </Text>
          <Text style={[styles.infoLabel, { marginLeft: 8 }]}>ou ID : </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 60 }]}>{''}</Text>
        </View>

        {/* Adresse + Ville */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Adresse : </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 200 }]}>
            {data.adresse ?? ''}
          </Text>
          <Text style={[styles.infoLabel, { marginLeft: 10 }]}>Ville </Text>
          <Text style={[styles.infoUnderline, { maxWidth: 80 }]}>
            {data.ville}
          </Text>
        </View>

        {/* Téléphone */}
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Téléphone : </Text>
          <Text style={styles.infoUnderline}>{data.telephone}</Text>
        </View>

        {/* E-mail */}
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

        {/* ── COTATIONS DU MEMBRE ────────────────────────────────── */}
        <Text style={styles.tableLabel}>COTATIONS DU MEMBRE</Text>

        {/* En-tête table */}
        <View style={{
          flexDirection: 'row',
          backgroundColor: BLUE,
          borderTop: '0.5pt solid ' + BORDER,
          borderLeft: '0.5pt solid ' + BORDER,
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
        <View style={{ flexDirection: 'row', borderLeft: '0.5pt solid ' + BORDER }}>
          <Text style={cell(C.num)}>1.</Text>
          <Text style={cell(C.date, false, 'left')}>le {data.dateActivation}</Text>
          <Text style={cell(C.prix, false, 'right')}>{formatCDF(data.produitPrix)}</Text>
          <Text style={cell(C.points)}>{data.pointsCumules}P</Text>
          <Text style={cell(C.agent, false, 'left')}>{data.agentNom.toUpperCase()}</Text>
          <Text style={cell(C.produit, false, 'left')}>{data.produitNom}</Text>
          <Text style={cell(C.sig)}>{' '}</Text>
        </View>

        {/* Lignes vides 2–5 pour entrées manuelles */}
        {[2, 3, 4, 5].map((n) => (
          <View key={n} style={{ flexDirection: 'row', borderLeft: '0.5pt solid ' + BORDER }}>
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
          borderLeft: '0.5pt solid ' + BORDER,
          backgroundColor: '#F5F5F5',
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

        {/* ── Case satisfaction ───────────────────────────────────── */}
        <View style={styles.satRow}>
          <View style={styles.satCheckbox}>
            <Text style={styles.satCheckMark}>✓</Text>
          </View>
          <Text style={styles.satText}>
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>
              Le membre a atteint les points de satisfaction (40 points),{' '}
            </Text>
            Désormais membre{'\n'}officiel de{' '}
            <Text style={{ fontFamily: 'Helvetica-Bold' }}>PROGRESS BUSNESS</Text>
          </Text>
        </View>

        {/* ── Footer ─────────────────────────────────────────────── */}
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
