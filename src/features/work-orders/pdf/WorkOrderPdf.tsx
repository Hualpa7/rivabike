// ordenTrabajoPdf.tsx
import { Document, Page, Text, View, Image } from '@react-pdf/renderer';
import type { SiteSettings, WorkOrderDetail } from '@/types';

import { BrandMarkPdf } from './BrandMarkPdf';

import {
  formatWorkOrderCurrency,
  formatWorkOrderDate,
  formatWorkOrderDueDate,
  formatWorkOrderNumber,
  getCustomerFullName,
} from './WorkOrderPdfFormat';

import {
  workOrderPdfStyles as s,
} from './WorkOrderPdfStyles';

import { PDF_CONDICIONES_DEFAULT } from '@/features/settings/pdf-condiciones';

interface WorkOrderPdfProps {
  order: WorkOrderDetail;
  settings: SiteSettings;
  /** Condiciones editadas por el admin (lista actualizada del backend). */
  condiciones?: string[];
}

interface PdfLine {
  key: string;
  desc: string;
  detail?: string;
  qty: number;
  unit: number;
  subtotal: number;
}

/**
 * Barra de sección negra, ancho completo, texto blanco en mayúsculas.
 * Igual para las cuatro secciones del documento — no es una franja de
 * acento angosta al costado de un título oscuro.
 */
function SectionBar({ title }: { title: string }) {
  return (
    <View style={s.sectionBar} wrap={false}>
      <Text style={s.sectionBarText}>{title}</Text>
    </View>
  );
}

/**
 * Fila de dato "Cliente:" / "Bicicleta:" — texto plano, sin caja,
 * sin borde, sin relleno de color. Cuatro columnas por fila.
 */
function ClienteRow({
  label1,
  value1,
  label2,
  value2,
}: {
  label1: string;
  value1: string;
  label2: string;
  value2: string;
}) {
  return (
    <View style={s.clienteRow}>
      <Text style={s.clienteLabel}>{label1}</Text>
      <Text style={s.clienteValueWide}>{value1}</Text>
      <Text style={s.clienteLabel}>{label2}</Text>
      <Text style={s.clienteValueNarrow}>{value2}</Text>
    </View>
  );
}

/**
 * Fila de la bicicleta separada: "Bicicleta:" con "Fecha de entrega:"
 * en la misma fila, y "Color:" en la fila siguiente, debajo de
 * "Bicicleta:" y a la izquierda. Misma idea de texto plano, sin caja,
 * que ClienteRow.
 */
function BikeInfoRow({
  marca,
  color,
  due,
}: {
  marca: string;
  color?: string | null;
  due: string;
}) {
  return (
    <>
      <ClienteRow
        label1="Bicicleta:"
        value1={marca}
        label2="Fecha de entrega:"
        value2={due}
      />
      <View style={s.clienteRow}>
        <Text style={s.clienteLabel}>Color:</Text>
        <Text style={s.clienteValueWide}>{color || '—'}</Text>
      </View>
    </>
  );
}

/**
 * Tabla de ítems ÚNICA y combinada (servicios + repuestos juntos, en
 * el orden en que se cargaron). El diseño real nunca separa esto en
 * dos tablas con subtotales propios: todo va en un solo detalle y el
 * desglose de totales aparece una sola vez, al final.
 */
function ItemsTable({ lines }: { lines: PdfLine[] }) {
  return (
    <View style={s.table}>
      <View style={s.tableHeaderRow}>
        <Text style={[s.tableHeaderCell, s.colDesc]}>DESCRIPCIÓN</Text>
        <Text style={[s.tableHeaderCell, s.colQty]}>CANT.</Text>
        <Text style={[s.tableHeaderCell, s.colUnit]}>PRECIO UNIT.</Text>
        <Text style={[s.tableHeaderCell, s.colSubtotal]}>SUBTOTAL</Text>
      </View>

      {lines.map((line, index) => (
        <View
          key={line.key}
          style={[
            s.tableRow,
            index % 2 === 1 ? s.tableRowAlt : undefined,
          ]}
        >
          <View style={[s.tableCell, s.colDesc]}>
            <Text>{line.desc}</Text>
            {line.detail ? (
              <Text style={s.tableCellDetail}>{line.detail}</Text>
            ) : null}
          </View>
          <Text style={[s.tableCellNum, s.colQty]}>{line.qty}</Text>
          <Text style={[s.tableCellNum, s.colUnit]}>
            {formatWorkOrderCurrency(line.unit)}
          </Text>
          <Text style={[s.tableCellNum, s.colSubtotal]}>
            {formatWorkOrderCurrency(line.subtotal)}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function WorkOrderPdf({
  order,
  settings,
  condiciones,
}: WorkOrderPdfProps) {
  // Condiciones vigentes: las editadas por el admin si existen, si no las
  // por defecto (mismas que siembra la migracion en la base).
  const conditions =
    condiciones && condiciones.length > 0
      ? condiciones
      : PDF_CONDICIONES_DEFAULT.orden;

  // Unimos servicios y repuestos en una sola lista, en ese orden.
  // Si el título del servicio trae una segunda línea separada por
  // "\n" (p. ej. el detalle de qué incluye un "Service Completo"),
  // se muestra debajo en gris chico — igual que en el diseño de chat.
  const allLines: PdfLine[] = [
    ...order.services.map((service) => {
      const [main, ...rest] = service.title_snapshot.split('\n');
      return {
        key: `svc-${service.id}`,
        desc: main,
        detail: rest.length > 0 ? rest.join(' ') : undefined,
        qty: service.quantity,
        unit: service.unit_price,
        subtotal: service.subtotal,
      };
    }),
    ...order.inventoryItems.map((item) => ({
      key: `inv-${item.id}`,
      desc: `${item.name_snapshot} (repuesto)`,
      qty: item.quantity,
      unit: item.unit_price,
      subtotal: item.subtotal,
    })),
  ];

  const subtotal = allLines.reduce((acc, line) => acc + line.subtotal, 0);
  // El tipo actual no trae descuento como campo aparte del total;
  // se deja en 0 salvo que WorkOrderDetail incorpore ese campo.
 

  const customerName = getCustomerFullName(order);

  return (
    <Document
      title={`${formatWorkOrderNumber(order)} · ${customerName}`}
      author={settings.nombre_negocio}
    >
      <Page size="A4" style={s.page}>
        {/* ============================================================
            HEADER — logo a la izquierda, título rosa a la derecha,
            sobre fondo blanco. Sin franja oscura.
        ============================================================ */}

        <View style={s.header}>
          {/*
            Marca vectorial (BrandMark SVG de la web dibujado con
            primitivas de @react-pdf). Nunca una aproximación en texto.
          */}
          <View style={s.brandBlock}>
            <BrandMarkPdf />
            <View style={s.brandWordmarkText}>
              <Text style={s.brandWordmark}>
                riva<Text style={s.brandBike}>bike</Text>
              </Text>
              <Text style={s.brandSlogan}>
                TU LIBERTAD SOBRE RUEDAS
              </Text>
            </View>
          </View>

          <View style={s.titleBlock}>
            <Text style={s.docTitle}>ORDEN DE TRABAJO</Text>
            <Text style={s.docMetaLine}>
              N°: {formatWorkOrderNumber(order)}    Fecha:{' '}
              {formatWorkOrderDate(order)}
            </Text>
          </View>
        </View>

        <View style={s.headerDivider} />

        {/* ============================================================
            DATOS DEL CLIENTE Y LA BICICLETA
        ============================================================ */}

        <View style={s.section}>
          <SectionBar title="DATOS DEL CLIENTE Y LA BICICLETA" />

          <ClienteRow
            label1="Cliente:"
            value1={customerName}
            label2="Teléfono:"
            value2={order.customer.telefono || '—'}
          />
          <BikeInfoRow
            marca={order.bicycle.marca || '—'}
            color={order.bicycle.color}
            due={
              order.fecha_estimada_entrega
                ? formatWorkOrderDueDate(order.fecha_estimada_entrega)
                : '—'
            }
          />
        </View>

        {/* ============================================================
            DETALLE DEL SERVICIO REALIZADO (tabla única)
        ============================================================ */}

        <View style={s.section}>
          <SectionBar title="DETALLE DEL SERVICIO REALIZADO" />
          <ItemsTable lines={allLines} />

          <View style={s.totalsBlock}>
            <View style={s.totalsRow}>
              <Text style={s.totalsLabel}>Subtotal:</Text>
              <Text style={s.totalsValue}>
                {  formatWorkOrderCurrency(subtotal)}
              </Text>
            </View>
            {order.senia > 0 ? (
              <View style={s.totalsRow}>
                <Text style={s.totalsLabel}>Seña:</Text>
                <Text style={s.totalsValue}>
                  - {formatWorkOrderCurrency(order.senia)}
                </Text>
              </View>
            ) : null}
            <View style={s.totalsRowFinal}>
              <Text style={s.totalsLabelFinal}>TOTAL:</Text>
              <Text style={s.totalsValueFinal}>
                {formatWorkOrderCurrency(order.total)}
              </Text>
            </View>
          </View>
        </View>

        {/* ============================================================
            OBSERVACIONES — mismo patrón de barra + texto plano,
            sin caja decorada.
        ============================================================ */}

        {order.observaciones && order.observaciones.trim().length > 0 ? (
          <View style={s.section} wrap={false}>
            <SectionBar title="OBSERVACIONES" />
            {order.observaciones.split('\n').map((line, index) => (
              <Text key={index} style={s.observationsText}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        {/* ============================================================
            FOTOS — grid de 2 columnas, solo si la orden tiene fotos.
            Cada imagen se recorta a una altura fija para que todas
            las celdas queden del mismo tamaño; la última fila puede
            llevar 1 sola foto.
        ============================================================ */}

        {order.photos.length > 0 ? (
          <View style={s.section} wrap={false}>
            <SectionBar title="FOTOS" />
            <View style={s.photosGrid}>
              {order.photos.map((photo, index) => (
                <View key={photo.id ?? index} style={s.photoCell}>
                  <Image src={photo.storage_path} style={s.photoImage} />
                  {photo.descripcion ? (
                    <Text style={s.photoLabel}>{photo.descripcion}</Text>
                  ) : null}
                </View>
              ))}
            </View>
          </View>
        ) : null}

        {/* ============================================================
            CONDICIONES — texto plano gris, garantía en negrita
            dentro del mismo párrafo (sin caja).
        ============================================================ */}

        <View style={s.section} wrap={false}>
          <SectionBar title="CONDICIONES" />
          {conditions.map((line, index) => (
            <Text key={index} style={s.conditionsText}>
              <Text style={s.conditionsBullet}>• </Text>
              {/garantía/i.test(line) ? (
                <Text style={s.conditionsBold}>{line}</Text>
              ) : (
                line
              )}
            </Text>
          ))}
        </View>

        {/* ============================================================
            FOOTER — línea rosa fina, dos líneas centradas.
        ============================================================ */}

        <View style={s.footer} fixed>
          <Text style={s.footerBold}>
            MÁS QUE UN TALLER, SOMOS TU ALIADO EN CADA RODADA.
          </Text>
          <Text style={s.footerText}>
            Rivadavia 243, Hipólito Yrigoyen · WhatsApp 3878 224212
          </Text>
        </View>
      </Page>
    </Document>
  );
}
