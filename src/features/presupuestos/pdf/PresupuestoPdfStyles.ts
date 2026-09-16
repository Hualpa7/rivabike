import { StyleSheet } from '@react-pdf/renderer';
import { BRAND } from '@/features/work-orders/pdf/WorkOrderPdfStyles';

// ---------------------------------------------------------------------------
// Estilos del PDF de presupuesto. Diseño propio (franja superior oscura,
// tarjetas de cliente/bicicleta con acento, tablas con header rosa, subtotales
// por sección, cajas de observaciones/garantía y footer de dos columnas), que
// NO coincide con el del PDF de órdenes: por eso es autocontenido y solo
// reutiliza la paleta BRAND compartida. Sin cajas decorativas excesivas:
// barras/acentos sólidos y una línea rosa como acento.
// ---------------------------------------------------------------------------

export const presupuestoPdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 13.5,
    color: BRAND.black,
    lineHeight: 1.25,

    paddingTop: 0,
    paddingBottom: 40,
    paddingHorizontal: 0,

    backgroundColor: BRAND.white,
  },

  /*
   * ============================================================
   * HEADER — franja superior oscura de punta a punta (la página no
   * tiene padding horizontal). Marca a la izquierda, bloque del
   * documento con etiqueta de estado a la derecha.
   * ============================================================
   */

  headerBar: {
    backgroundColor: BRAND.black,
    paddingHorizontal: 45,
    paddingVertical: 16,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brandBlock: {
    flexDirection: 'column',
  },

  brandText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: BRAND.white,
  },

  brandDot: {
    color: BRAND.pink,
  },

  brandBike: {
    color: BRAND.pink,
  },

  brandSlogan: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: BRAND.white,
    marginTop: 4,
  },

  titleBlock: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },

  docTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 20,
    color: BRAND.white,
  },

  docNumber: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: BRAND.white,
    marginTop: 4,
  },

  docDate: {
    fontFamily: 'Helvetica',
    fontSize: 12,
    color: BRAND.white,
    marginTop: 2,
  },

  estadoBadge: {
    alignSelf: 'flex-end',
    marginTop: 6,
    fontFamily: 'Helvetica-Bold',
    fontSize: 8,
    letterSpacing: 1.5,
    color: BRAND.white,
    backgroundColor: BRAND.pinkDeep,
    paddingTop: 3,
    paddingBottom: 3,
    paddingHorizontal: 9,
    borderRadius: 10,
  },

  /*
   * ============================================================
   * CONTENIDO PRINCIPAL — dentro de la página con padding
   * horizontal a ambos lados.
   * ============================================================
   */

  content: {
    paddingHorizontal: 45,
    marginTop: 12,
  },

  /*
   * Tarjetas CLIENTE / BICICLETA en fila, cada una con acento rosa.
   */
  infoRow: {
    flexDirection: 'row',
  },

  infoBlock: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  infoBlockRight: {
    flex: 1,
    marginLeft: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  infoTopLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  infoAccent: {
    width: 4,
    height: 14,
    backgroundColor: BRAND.pink,
    marginRight: 6,
  },

  infoLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    letterSpacing: 1,
    color: BRAND.black,
  },

  infoValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    color: BRAND.black,
  },

  infoSub: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: BRAND.midGray,
    marginTop: 2,
  },

  infoSubLabel: {
    fontFamily: 'Helvetica-Bold',
    color: BRAND.black,
  },

  section: {
    marginTop: 16,
  },

  /*
   * Encabezado de sección: banda negra angosta + título superior.
   */
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  sectionBand: {
    width: 4,
    height: 14,
    backgroundColor: BRAND.black,
    marginRight: 8,
  },

  sectionTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 14,
    letterSpacing: 1,
    color: BRAND.black,
  },

  /*
   * ============================================================
   * TABLAS DE LÍNEAS (servicios / repuestos) + subtotal de sección.
   * ============================================================
   */

  table: {
    borderWidth: 0.5,
    borderColor: BRAND.gridLine,
  },

  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND.pink,
  },

  tableHeaderCell: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12.5,
    color: BRAND.white,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: BRAND.gridLine,
  },

  tableRowLast: {
    borderBottomWidth: 0,
  },

  tableCell: {
    fontSize: 13.5,
    color: BRAND.black,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  numCell: {
    fontSize: 13.5,
    color: BRAND.black,
    paddingVertical: 6,
    paddingHorizontal: 6,
    textAlign: 'right',
  },

  emptyRow: {
    fontSize: 12,
    color: BRAND.midGray,
    paddingVertical: 12,
    paddingHorizontal: 6,
    textAlign: 'center',
  },

  colDesc: { flex: 5.2 },
  colQty: { flex: 1.1, textAlign: 'center' },
  colUnit: { flex: 1.8, textAlign: 'right' },
  colSubtotal: { flex: 1.8, textAlign: 'right' },

  sectionTotalRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    paddingTop: 6,
    paddingHorizontal: 6,
    borderTopWidth: 0.5,
    borderTopColor: BRAND.black,
  },

  sectionTotalLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: BRAND.black,
    marginRight: 10,
  },

  sectionTotalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: BRAND.black,
    minWidth: 90,
    textAlign: 'right',
  },

  /*
   * ============================================================
   * TOTAL DEL PRESUPUESTO — caja gris apretada a la derecha.
   * ============================================================
   */

  totalContainer: {
    marginTop: 16,
    alignItems: 'flex-end',
  },

  totalBox: {
    backgroundColor: BRAND.lightGray,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minWidth: 280,
  },

  totalBoxLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12.5,
    color: BRAND.black,
  },

  totalBoxBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 8,
  },

  totalBoxCaption: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: BRAND.midGray,
  },

  totalValue: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 17,
    color: BRAND.pink,
  },

  /*
   * ============================================================
   * OBSERVACIONES / CONDICIONES — cajas gris clarísimo con acento
   * rosa y título en mayúsculas.
   * ============================================================
   */

  observationsBox: {
    marginTop: 8,
    backgroundColor: BRAND.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  observationsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  observationsAccent: {
    width: 4,
    height: 14,
    backgroundColor: BRAND.pink,
    marginRight: 8,
  },

  observationsTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12.5,
    letterSpacing: 1,
    color: BRAND.black,
  },

  observationsText: {
    fontSize: 12,
    lineHeight: 1.35,
    color: BRAND.black,
  },

  guaranteeBox: {
    marginTop: 8,
    backgroundColor: BRAND.lightGray,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  guaranteeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  guaranteeAccent: {
    width: 4,
    height: 14,
    backgroundColor: BRAND.pink,
    marginRight: 8,
  },

  guaranteeTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12.5,
    letterSpacing: 1,
    color: BRAND.black,
  },

  guaranteeText: {
    fontSize: 11,
    lineHeight: 1.35,
    color: BRAND.midGray,
  },

  /*
   * ============================================================
   * FOOTER — línea rosa fina arriba, dos columnas centradas.
   * ============================================================
   */

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 8,
    paddingHorizontal: 45,
    borderTopWidth: 1,
    borderTopColor: BRAND.pink,
  },

  footerLeft: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: BRAND.black,
  },

  footerRight: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: BRAND.midGray,
  },
});