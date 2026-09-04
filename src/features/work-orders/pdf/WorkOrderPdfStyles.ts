// workOrderPdfStyles.ts
import { StyleSheet } from '@react-pdf/renderer';

/**
 * Identidad visual RivaBike para documentos PDF basada en el diseño del ejemplo.
 * Paleta cerrada: rosa / bordo / negro / blanco (sin morado).
 */
export const BRAND = {
  ink: '#1A1A2E',
  paper: '#FFFFFF',

  pink: '#EF7D97',
  pinkDeep: '#E8546F',
  pinkSoft: '#FDF0F3',

  muted: '#6F6A70',
  line: '#E7E1E8',
  soft: '#F7F5F7',
  softGray: '#F2F1F2',

  white: '#FFFFFF',
  dark: '#2A0E1E',
};

export const workOrderPdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BRAND.ink,
    lineHeight: 1.4,

    paddingTop: 0,
    paddingBottom: 72,
    paddingHorizontal: 0,

    backgroundColor: BRAND.paper,
  },

  /*
   * ============================================================
   * HEADER - FRANJA SUPERIOR OSCURA
   * ============================================================
   */

  headerBar: {
    backgroundColor: BRAND.dark,
    paddingTop: 30,
    paddingBottom: 25,
    paddingHorizontal: 38,
    marginBottom: 25,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  brandBlock: {
    flexDirection: 'column',
  },

  brandText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32,
    letterSpacing: -1,
    color: BRAND.white,
  },

  brandDot: {
    color: BRAND.white,
  },

  brandBike: {
    color: BRAND.pinkDeep,
  },

  brandSlogan: {
    fontFamily: 'Helvetica',
    fontSize: 8,
    color: '#FFB6C9',
    letterSpacing: 1.5,
    marginTop: 9,
  },

  titleBlock: {
    alignItems: 'flex-end',
  },

  docTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    letterSpacing: 3,
    color: BRAND.white,
  },

  docNumber: {
    marginTop: 4,
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: BRAND.pinkDeep,
  },

  docDate: {
    marginTop: 2,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: '#FFB6C9',
  },

  /*
   * ============================================================
   * CONTENIDO PRINCIPAL
   * ============================================================
   */

  content: {
    paddingHorizontal: 38,
  },

  /*
   * ============================================================
   * CLIENTE / BICICLETA
   * ============================================================
   */

  infoRow: {
    flexDirection: 'row',
    marginBottom: 22,
  },

  infoBlock: {
    flex: 1,

    minHeight: 84,

    paddingTop: 14,
    paddingBottom: 14,
    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: BRAND.pink,
    borderRadius: 8,

    backgroundColor: BRAND.pinkSoft,
  },

  infoBlockRight: {
    marginLeft: 12,
  },

  infoTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  infoAccent: {
    width: 4,
    height: 18,
    marginRight: 7,
    backgroundColor: BRAND.pinkDeep,
    borderRadius: 2,
  },

  infoLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1.5,
    color: BRAND.pinkDeep,
  },

  infoValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13,
    color: BRAND.ink,
  },

  infoSub: {
    marginTop: 3,
    fontSize: 10,
    color: BRAND.muted,
  },

  infoSubLabel: {
    fontFamily: 'Helvetica-Bold',
    color: BRAND.pinkDeep,
  },

  /*
   * ============================================================
   * SECCIONES
   * ============================================================
   */

  section: {
    marginTop: 5,
    marginBottom: 18,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionBand: {
    width: 6,
    height: 20,
    marginRight: 8,
    backgroundColor: BRAND.pinkDeep,
    borderRadius: 2,
  },

  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 1.5,
    color: BRAND.ink,
  },

  sectionSubtitle: {
    marginTop: 1,
    fontSize: 8,
    color: BRAND.muted,
  },

  /*
   * ============================================================
   * TABLAS
   * ============================================================
   */

  table: {
    borderWidth: 1,
    borderColor: BRAND.line,
    borderRadius: 6,
    overflow: 'hidden',
  },

  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 25,

    paddingVertical: 6,
    paddingHorizontal: 9,

    backgroundColor: BRAND.pinkSoft,

    borderBottomWidth: 1,
    borderBottomColor: BRAND.line,
  },

  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 0.8,
    color: BRAND.pinkDeep,
  },

  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 28,

    paddingVertical: 6,
    paddingHorizontal: 9,

    backgroundColor: BRAND.paper,

    borderBottomWidth: 1,
    borderBottomColor: BRAND.line,
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  tableCell: {
    fontSize: 10,
    color: BRAND.ink,
  },

  numCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
    color: BRAND.ink,
  },

  colDesc: {
    flex: 3,
    paddingRight: 8,
  },

  colQty: {
    flex: 0.6,
    textAlign: 'center',
  },

  colUnit: {
    flex: 1.2,
    textAlign: 'right',
  },

  colSubtotal: {
    flex: 1.2,
    textAlign: 'right',
  },

  sectionTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',

    minHeight: 30,

    paddingVertical: 6,
    paddingHorizontal: 10,

    backgroundColor: BRAND.pinkSoft,
  },

  sectionTotalLabel: {
    marginRight: 10,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1,
    color: BRAND.muted,
  },

  sectionTotalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: BRAND.pinkDeep,
  },

  emptyRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontSize: 10,
    color: BRAND.muted,
  },

  /*
   * ============================================================
   * TOTAL FINAL
   * ============================================================
   */

  totalContainer: {
    marginTop: 10,
    marginBottom: 20,

    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  totalBox: {
    minWidth: 220,

    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 16,

    borderRadius: 6,

    backgroundColor: BRAND.pinkDeep,
  },

  totalBoxLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: BRAND.white,
  },

  totalBoxBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: 4,
  },

  totalBoxCaption: {
    fontSize: 9,
    color: '#FFDDE6',
  },

  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 18,
    color: BRAND.white,
  },

  /*
   * ============================================================
   * OBSERVACIONES
   * ============================================================
   */

  observationsBox: {
    marginTop: 2,
    marginBottom: 16,

    paddingTop: 10,
    paddingBottom: 10,
    paddingHorizontal: 14,

    borderWidth: 1,
    borderColor: BRAND.pink,
    borderRadius: 6,

    backgroundColor: BRAND.pinkSoft,
  },

  observationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  observationsAccent: {
    width: 4,
    height: 14,
    marginRight: 7,
    backgroundColor: BRAND.pinkDeep,
    borderRadius: 2,
  },

  observationsTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: BRAND.pinkDeep,
  },

  observationsText: {
    fontSize: 10,
    lineHeight: 1.4,
    color: BRAND.ink,
  },

  /*
   * ============================================================
   * GARANTÍA
   * ============================================================
   */

  guaranteeBox: {
    marginTop: 2,

    paddingTop: 11,
    paddingBottom: 11,
    paddingHorizontal: 14,

    borderWidth: 1,
    borderColor: BRAND.line,
    borderRadius: 6,

    backgroundColor: BRAND.soft,
  },

  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  guaranteeAccent: {
    width: 4,
    height: 14,
    marginRight: 7,
    backgroundColor: BRAND.pinkDeep,
    borderRadius: 2,
  },

  guaranteeTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    letterSpacing: 1.5,
    color: BRAND.pinkDeep,
  },

  guaranteeText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: BRAND.muted,
  },

  /*
   * ============================================================
   * FOOTER
   * ============================================================
   */

  footer: {
    position: 'absolute',

    left: 38,
    right: 38,
    bottom: 23,

    paddingTop: 10,

    borderTopWidth: 1,
    borderTopColor: BRAND.line,

    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  footerLeft: {
    flex: 1,

    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 0.6,

    color: BRAND.pinkDeep,
  },

  footerRight: {
    marginLeft: 12,

    fontFamily: 'Helvetica',
    fontSize: 8,

    color: BRAND.muted,
    textAlign: 'right',
  },
});