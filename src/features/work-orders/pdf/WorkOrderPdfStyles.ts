// OrdenTtrabajoPdfEstilos.ts
import { StyleSheet } from '@react-pdf/renderer';

/**
 * Identidad visual RivaBike para documentos PDF.
 * Calcada del diseño real usado en los presupuestos/órdenes de trabajo
 * generados en chat (Python + reportlab). Paleta plana, sin cajas
 * decorativas ni degradados: barras sólidas negras para separar
 * secciones, una sola línea rosa como acento, y una tabla de ítems
 * combinada (servicios + repuestos juntos, sin dividir en dos tablas).
 */
export const BRAND = {
  pink: '#D81B60',
  pinkDeep: '#C2185B',
  black: '#1A1A1A',
  lightGray: '#F4F4F4',
  midGray: '#666666',
  gridLine: '#DDDDDD',
  white: '#FFFFFF',
};

export const workOrderPdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 13.5,
    color: BRAND.black,
    lineHeight: 1.25,

    paddingTop: 24,
    paddingBottom: 40,
    paddingHorizontal: 45,

    backgroundColor: BRAND.white,
  },

  /*
   * ============================================================
   * HEADER — sin franja oscura. Marca a la izquierda (ícono de
   * bicicleta + wordmark, bien alineados), título en rosa a la
   * derecha, todo sobre fondo blanco.
   * ============================================================
   */

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  brandBlock: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandWordmarkText: {
    marginLeft: 10,
    flexDirection: 'column',
  },

  brandWordmark: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    color: BRAND.black,
  },

  brandBike: {
    color: BRAND.pink,
  },

  // Slogan bien separado del wordmark "riva bike".
  brandSlogan: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 9,
    color: BRAND.midGray,
    marginTop: 6,
  },

  titleBlock: {
    alignItems: 'flex-end',
  },

  docTitle: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    color: BRAND.pink,
  },

  // N° de orden y fecha bien distanciados del título.
  docMetaLine: {
    marginTop: 12,
    fontFamily: 'Helvetica',
    fontSize: 13,
    color: BRAND.midGray,
  },

  headerDivider: {
    marginTop: 8,
    marginBottom: 14,
    borderBottomWidth: 1.2,
    borderBottomColor: BRAND.pink,
  },

  /*
   * ============================================================
   * BARRA DE SECCIÓN — negra, ancho completo, texto blanco.
   * Se usa igual para "DATOS DEL CLIENTE Y LA BICICLETA",
   * "DETALLE DEL SERVICIO REALIZADO", "OBSERVACIONES" y
   * "CONDICIONES". No es una franja de acento angosta: es una
   * barra sólida de punta a punta.
   * ============================================================
   */

  sectionBar: {
    backgroundColor: BRAND.black,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginBottom: 10,
  },

  sectionBarText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 15.5,
    color: BRAND.white,
  },

  section: {
    marginTop: 4,
    marginBottom: 16,
  },

  /*
   * ============================================================
   * CLIENTE / BICICLETA — texto plano en dos filas, SIN caja,
   * SIN borde, SIN relleno de color. Etiqueta en negrita + valor
   * normal, cuatro columnas por fila.
   * ============================================================
   */

  clienteRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  clienteLabel: {
    flexBasis: '29%',
    fontFamily: 'Helvetica-Bold',
    fontSize: 13.5,
    color: BRAND.black,
  },

  clienteValueWide: {
    flexBasis: '24%',
    fontFamily: 'Helvetica',
    fontSize: 13.5,
    color: BRAND.black,
  },

  clienteValueNarrow: {
    flexBasis: '18%',
    fontFamily: 'Helvetica',
    fontSize: 13.5,
    color: BRAND.black,
  },

  /*
   * ============================================================
   * TABLA DE ÍTEMS — una sola tabla combinada (servicios +
   * repuestos juntos). Encabezado rosa sólido con texto blanco.
   * Filas alternadas blanco / gris clarísimo. Grilla fina gris.
   * Sin bordes redondeados.
   * ============================================================
   */

  table: {
    borderWidth: 0.5,
    borderColor: BRAND.gridLine,
  },

  tableHeaderRow: {
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

  tableRowAlt: {
    backgroundColor: BRAND.lightGray,
  },

  tableCell: {
    fontSize: 13.5,
    color: BRAND.black,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },

  tableCellDetail: {
    fontSize: 11,
    color: BRAND.midGray,
    marginTop: 2,
  },

  tableCellNum: {
    fontSize: 13.5,
    color: BRAND.black,
    paddingVertical: 6,
    paddingHorizontal: 6,
    textAlign: 'center',
  },

  colDesc: { flex: 5.2 },
  colQty: { flex: 1.1, textAlign: 'center' },
  colUnit: { flex: 1.8, textAlign: 'right' },
  colSubtotal: { flex: 1.8, textAlign: 'right' },

  /*
   * ============================================================
   * TOTALES — texto plano alineado a la derecha, SIN caja de
   * color. Sólo una línea fina arriba de la fila de TOTAL.
   * ============================================================
   */

  totalsBlock: {
    marginTop: 16,
    marginBottom: 4,
    alignItems: 'flex-end',
  },

  totalsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    minWidth: 220,
    marginBottom: 2,
  },

  totalsLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 13.5,
    color: BRAND.black,
    marginRight: 10,
  },

  totalsValue: {
    fontFamily: 'Helvetica',
    fontSize: 13.5,
    color: BRAND.black,
    minWidth: 90,
    textAlign: 'right',
  },

  totalsRowFinal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    minWidth: 220,
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 0.8,
    borderTopColor: BRAND.black,
  },

  totalsLabelFinal: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 17,
    color: BRAND.pink,
    marginRight: 10,
  },

  totalsValueFinal: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 17,
    color: BRAND.black,
    minWidth: 90,
    textAlign: 'right',
  },

  /*
   * ============================================================
   * OBSERVACIONES — mismo patrón que cualquier otra sección
   * (barra negra + texto plano abajo). Nada de caja con borde
   * rosa y fondo de color: eso no forma parte del diseño real.
   * ============================================================
   */

  observationsText: {
    fontSize: 13,
    lineHeight: 1.35,
    color: BRAND.black,
  },

  /*
   * ============================================================
   * FOTOS — grilla de 2 columnas debajo de observaciones.
   * Cada celda ocupa el 50% del ancho; la fila envuelve sola,
   * así la última fila puede llevar 1 sola foto. Las imágenes
   * se recortan (cover) a una altura fija para que todas las
   * celdas queden del mismo tamaño.
   * ============================================================
   */

  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  photoCell: {
    width: '50%',
    padding: 4,
    alignItems: 'center',
  },

  photoImage: {
    width: '100%',
    height: 150,
    objectFit: 'cover',
  },

  photoLabel: {
    fontSize: 9,
    color: BRAND.midGray,
    marginTop: 2,
    textAlign: 'center',
  },

  /*
   * ============================================================
   * CONDICIONES — texto plano gris con viñetas. La cláusula de
   * garantía va en negrita dentro del mismo párrafo, no en una
   * caja aparte.
   * ============================================================
   */

  conditionsText: {
    fontSize: 12,
    lineHeight: 1.35,
    color: BRAND.midGray,
  },

  conditionsBold: {
    fontFamily: 'Helvetica-Bold',
    color: BRAND.midGray,
  },

  conditionsBullet: {
    color: BRAND.pink,
  },

  /*
   * ============================================================
   * FOOTER — línea rosa fina arriba, dos líneas de texto
   * centradas (no dos columnas izq/der, no barra oscura de
   * fondo).
   * ============================================================
   */

  footer: {
    position: 'absolute',
    left: 45,
    right: 45,
    bottom: 20,

    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: BRAND.pink,

    alignItems: 'center',
  },

  footerBold: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 12,
    color: BRAND.black,
    textAlign: 'center',
  },

  footerText: {
    marginTop: 2,
    fontFamily: 'Helvetica',
    fontSize: 11,
    color: BRAND.midGray,
    textAlign: 'center',
  },
});
