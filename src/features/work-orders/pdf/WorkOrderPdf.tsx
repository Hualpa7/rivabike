// workOrderPdf.tsx
import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { SiteSettings, WorkOrderDetail } from '@/types';

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

interface WorkOrderPdfProps {
  order: WorkOrderDetail;
  settings: SiteSettings;
}

const GUARANTEE_TEXT =
  'Los precios pueden variar según el estado de la bicicleta al momento de la revisión. • A partir de la fecha de entrega de la bicicleta, la reparación cuenta con una garantía de 10 días sobre el trabajo realizado. La garantía cubre fallas directamente relacionadas con la tarea efectuada (mano de obra) y no aplica en casos de golpes, caídas, mal uso, manipulación por terceros ajenos al taller, desgaste normal de otras piezas no intervenidas, o repuestos provistos por el cliente. Para hacer efectiva la garantía, la bicicleta debe presentarse en el local junto con este comprobante';

interface PdfLine {
  key: string;
  desc: string;
  qty: number;
  unit: number;
  subtotal: number;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader} wrap={false}>
      <View style={s.sectionBand} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
}

interface PdfDetail {
  label?: string;
  value: string;
}

function InfoCard({
  label,
  value,
  details,
  isRight = false,
}: {
  label: string;
  value: string;
  details?: PdfDetail[];
  isRight?: boolean;
}) {
  return (
    <View
      style={[
        s.infoBlock,
        isRight ? s.infoBlockRight : undefined,
      ]}
    >
      <View style={s.infoTopLine}>
        <View style={s.infoAccent} />
        <Text style={s.infoLabel}>{label}</Text>
      </View>

      <Text style={s.infoValue}>{value}</Text>

      {details?.map((detail, index) => (
        <Text key={index} style={s.infoSub}>
          {detail.label ? <Text style={s.infoSubLabel}>{detail.label} </Text> : null}
          {detail.value}
        </Text>
      ))}
    </View>
  );
}

function LineTable({
  lines,
  emptyMessage,
  totalLabel,
  total,
}: {
  lines: PdfLine[];
  emptyMessage: string;
  totalLabel: string;
  total: number;
}) {
  return (
    <View style={s.table}>
      <View style={s.tableHeader}>
        <Text style={[s.tableHeaderCell, s.colDesc]}>DESCRIPCIÓN</Text>
        <Text style={[s.tableHeaderCell, s.colQty]}>CANT.</Text>
        <Text style={[s.tableHeaderCell, s.colUnit]}>PRECIO UNIT.</Text>
        <Text style={[s.tableHeaderCell, s.colSubtotal]}>SUBTOTAL</Text>
      </View>

      {lines.length === 0 ? (
        <View style={s.tableRow}>
          <Text style={s.emptyRow}>{emptyMessage}</Text>
        </View>
      ) : (
        lines.map((line, index) => (
          <View
            key={line.key}
            style={[
              s.tableRow,
              index === lines.length - 1 ? s.tableRowLast : undefined,
            ]}
          >
            <Text style={[s.tableCell, s.colDesc]}>{line.desc}</Text>
            <Text style={[s.tableCell, s.colQty]}>{line.qty}</Text>
            <Text style={[s.numCell, s.colUnit]}>
              {formatWorkOrderCurrency(line.unit)}
            </Text>
            <Text style={[s.numCell, s.colSubtotal]}>
              {formatWorkOrderCurrency(line.subtotal)}
            </Text>
          </View>
        ))
      )}

      <View style={s.sectionTotalRow}>
        <Text style={s.sectionTotalLabel}>{totalLabel}</Text>
        <Text style={s.sectionTotalValue}>
          {formatWorkOrderCurrency(total)}
        </Text>
      </View>
    </View>
  );
}

export function WorkOrderPdf({
  order,
  settings,
}: WorkOrderPdfProps) {
  const serviceLines: PdfLine[] = order.services.map((service) => ({
    key: `svc-${service.id}`,
    desc: service.title_snapshot,
    qty: service.quantity,
    unit: service.unit_price,
    subtotal: service.subtotal,
  }));

  const sparePartLines: PdfLine[] = order.inventoryItems.map((item) => ({
    key: `inv-${item.id}`,
    desc: item.name_snapshot,
    qty: item.quantity,
    unit: item.unit_price,
    subtotal: item.subtotal,
  }));

  const servicesTotal = serviceLines.reduce(
    (total, line) => total + line.subtotal,
    0,
  );

  const sparePartsTotal = sparePartLines.reduce(
    (total, line) => total + line.subtotal,
    0,
  );

  const customerName = getCustomerFullName(order);

  const bicycleName =
    [
      order.bicycle.marca,
      order.bicycle.modelo,
    ]
      .filter(Boolean)
      .join(' ') || 'Bicicleta';

  const customerDetails: PdfDetail[] = [
    ...(order.customer.telefono
      ? [{ label: 'Teléfono:', value: order.customer.telefono }]
      : []),
    ...(order.customer.direccion
      ? [{ label: 'Dirección:', value: order.customer.direccion }]
      : []),
  ];

  const bicycleDetails: PdfDetail[] = [
    ...(order.bicycle.color
      ? [{ label: 'Color:', value: order.bicycle.color }]
      : []),
    ...(order.fecha_estimada_entrega
      ? [
          {
            label: 'Entrega:',
            value: formatWorkOrderDueDate(order.fecha_estimada_entrega),
          },
        ]
      : []),
  ];

  return (
    <Document
      title={`${formatWorkOrderNumber(order)} · ${customerName}`}
      author={settings.nombre_negocio}
    >
      <Page size="A4" style={s.page}>
        {/* =====================================================
            HEADER - FRANJA SUPERIOR OSCURA
        ====================================================== */}

        <View style={s.headerBar}>
          <View style={s.header}>
            <View style={s.brandBlock}>
              <Text style={s.brandText}>
                riva<Text style={s.brandDot}>.</Text>
                <Text style={s.brandBike}>bike</Text>
              </Text>
              <Text style={s.brandSlogan}>TU LIBERTAD SOBRE RUEDAS</Text>
            </View>

            <View style={s.titleBlock}>
              <Text style={s.docTitle}>ORDEN DE TRABAJO</Text>
              <Text style={s.docNumber}>N° {formatWorkOrderNumber(order)}</Text>
              <Text style={s.docDate}>
                Fecha: {formatWorkOrderDate(order)}
              </Text>
            </View>
          </View>
        </View>

        {/* =====================================================
            CONTENIDO PRINCIPAL
        ====================================================== */}

        <View style={s.content}>
          {/* CLIENTE / BICICLETA */}

          <View style={s.infoRow} wrap={false}>
            <InfoCard
              label="CLIENTE"
              value={customerName}
              details={customerDetails}
            />

            <InfoCard
              label="BICICLETA"
              value={bicycleName}
              details={bicycleDetails}
              isRight
            />
          </View>

          {/* SERVICIOS */}

          <View style={s.section}>
            <SectionHeader title="SERVICIOS" />

            <LineTable
              lines={serviceLines}
              emptyMessage="No se registraron servicios para esta orden."
              totalLabel="SUBTOTAL SERVICIOS"
              total={servicesTotal}
            />
          </View>

          {/* REPUESTOS */}

          <View style={s.section}>
            <SectionHeader title="REPUESTOS" />

            <LineTable
              lines={sparePartLines}
              emptyMessage="No se registraron repuestos para esta orden."
              totalLabel="SUBTOTAL REPUESTOS"
              total={sparePartsTotal}
            />
          </View>

          {/* TOTAL FINAL */}

          <View style={s.totalContainer} wrap={false}>
            <View style={s.totalBox}>
              <Text style={s.totalBoxLabel}>TOTAL DE LA ORDEN</Text>

              <View style={s.totalBoxBottom}>
                <Text style={s.totalBoxCaption}>Servicios + repuestos</Text>
                <Text style={s.totalValue}>
                  {formatWorkOrderCurrency(order.total)}
                </Text>
              </View>
            </View>
          </View>

          {/* OBSERVACIONES */}

          {order.observaciones && order.observaciones.trim().length > 0 ? (
            <View style={s.observationsBox} wrap={false}>
              <View style={s.observationsHeader}>
                <View style={s.observationsAccent} />
                <Text style={s.observationsTitle}>OBSERVACIONES</Text>
              </View>

              {order.observaciones.split('\n').map((line, index) => (
                <Text key={index} style={s.observationsText}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}

          {/* GARANTÍA */}

          <View style={s.guaranteeBox} wrap={false}>
            <View style={s.guaranteeHeader}>
              <View style={s.guaranteeAccent} />
              <Text style={s.guaranteeTitle}>GARANTÍA Y CONDICIONES</Text>
            </View>

            <Text style={s.guaranteeText}>{GUARANTEE_TEXT}</Text>
          </View>
        </View>

        {/* =====================================================
            FOOTER
        ====================================================== */}

        <View style={s.footer} fixed>
          <Text style={s.footerLeft}>
            MÁS QUE UN TALLER, SOMOS TU ALIADO EN CADA RODADA.
          </Text>

          <Text style={s.footerRight}>
            Rivadavia 243, Hipólito Yrigoyen | WhatsApp 3878 224212
          </Text>
        </View>
      </Page>
    </Document>
  );
}