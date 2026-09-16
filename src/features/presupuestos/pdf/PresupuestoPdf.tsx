import { Document, Page, Text, View } from '@react-pdf/renderer';
import type { PresupuestoDetail, SiteSettings } from '@/types';

import { PDF_CONDICIONES_DEFAULT } from '@/features/settings/pdf-condiciones';

import {
  formatPresupuestoCurrency,
  formatPresupuestoDate,
  formatPresupuestoNumber,
  getPresupuestoCustomerFullName,
  PRESUPUESTO_ESTADO_LABEL,
} from './PresupuestoPdfFormat';

import { presupuestoPdfStyles as s } from './PresupuestoPdfStyles';

interface PresupuestoPdfProps {
  presupuesto: PresupuestoDetail;
  settings: SiteSettings;
  /** Condiciones editadas por el admin (lista actualizada del backend). */
  condiciones?: string[];
}

interface PdfLine {
  key: string;
  desc: string;
  qty: number;
  unit: number;
  subtotal: number;
}

interface PdfDetail {
  label?: string;
  value: string;
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={s.sectionHeader} wrap={false}>
      <View style={s.sectionBand} />
      <Text style={s.sectionTitle}>{title}</Text>
    </View>
  );
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
    <View style={[s.infoBlock, isRight ? s.infoBlockRight : undefined]}>
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
            style={[s.tableRow, index === lines.length - 1 ? s.tableRowLast : undefined]}
          >
            <Text style={[s.tableCell, s.colDesc]}>{line.desc}</Text>
            <Text style={[s.tableCell, s.colQty]}>{line.qty}</Text>
            <Text style={[s.numCell, s.colUnit]}>
              {formatPresupuestoCurrency(line.unit)}
            </Text>
            <Text style={[s.numCell, s.colSubtotal]}>
              {formatPresupuestoCurrency(line.subtotal)}
            </Text>
          </View>
        ))
      )}

      <View style={s.sectionTotalRow}>
        <Text style={s.sectionTotalLabel}>{totalLabel}</Text>
        <Text style={s.sectionTotalValue}>
          {formatPresupuestoCurrency(total)}
        </Text>
      </View>
    </View>
  );
}

export function PresupuestoPdf({ presupuesto, settings, condiciones }: PresupuestoPdfProps) {
  // Condiciones vigentes: las editadas por el admin si existen, si no las
  // por defecto (mismas que siembra la migracion en la base).
  const conditions =
    condiciones && condiciones.length > 0
      ? condiciones
      : PDF_CONDICIONES_DEFAULT.presupuesto;

  const serviceLines: PdfLine[] = presupuesto.services.map((service) => ({
    key: `svc-${service.id}`,
    desc: service.title_snapshot,
    qty: service.quantity,
    unit: service.unit_price,
    subtotal: service.subtotal,
  }));

  const sparePartLines: PdfLine[] = presupuesto.inventoryItems.map((item) => ({
    key: `inv-${item.id}`,
    desc: item.name_snapshot,
    qty: item.quantity,
    unit: item.unit_price,
    subtotal: item.subtotal,
  }));

  const servicesTotal = serviceLines.reduce((total, line) => total + line.subtotal, 0);
  const sparePartsTotal = sparePartLines.reduce((total, line) => total + line.subtotal, 0);

  const customerName = getPresupuestoCustomerFullName(presupuesto);
  const bicycleName = presupuesto.bicycle.marca?.trim() || 'Bicicleta';
  const estadoLabel = PRESUPUESTO_ESTADO_LABEL[presupuesto.estado];

  const customerDetails: PdfDetail[] = presupuesto.customer.telefono
    ? [{ label: 'Teléfono:', value: presupuesto.customer.telefono }]
    : [];

  const bicycleDetails: PdfDetail[] = presupuesto.bicycle.color
    ? [{ label: 'Color:', value: presupuesto.bicycle.color }]
    : [];

  return (
    <Document
      title={`${formatPresupuestoNumber(presupuesto)} · ${customerName}`}
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
              <Text style={s.docTitle}>PRESUPUESTO</Text>
              <Text style={s.docNumber}>N° {formatPresupuestoNumber(presupuesto)}</Text>
              <Text style={s.docDate}>
                Fecha: {formatPresupuestoDate(presupuesto)}
              </Text>
              <Text style={s.estadoBadge}>{estadoLabel}</Text>
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
              emptyMessage="No se registraron servicios en este presupuesto."
              totalLabel="SUBTOTAL SERVICIOS"
              total={servicesTotal}
            />
          </View>

          {/* REPUESTOS */}

          <View style={s.section}>
            <SectionHeader title="REPUESTOS" />

            <LineTable
              lines={sparePartLines}
              emptyMessage="No se registraron repuestos en este presupuesto."
              totalLabel="SUBTOTAL REPUESTOS"
              total={sparePartsTotal}
            />
          </View>

          {/* TOTAL FINAL */}

          <View style={s.totalContainer} wrap={false}>
            <View style={s.totalBox}>
              <Text style={s.totalBoxLabel}>TOTAL DEL PRESUPUESTO</Text>

              <View style={s.totalBoxBottom}>
                <Text style={s.totalBoxCaption}>Servicios + repuestos</Text>
                <Text style={s.totalValue}>
                  {formatPresupuestoCurrency(presupuesto.total)}
                </Text>
              </View>
            </View>
          </View>

          {/* OBSERVACIONES */}

          {presupuesto.observaciones && presupuesto.observaciones.trim().length > 0 ? (
            <View style={s.observationsBox} wrap={false}>
              <View style={s.observationsHeader}>
                <View style={s.observationsAccent} />
                <Text style={s.observationsTitle}>OBSERVACIONES</Text>
              </View>

              {presupuesto.observaciones.split('\n').map((line, index) => (
                <Text key={index} style={s.observationsText}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}

          {/* CONDICIONES */}

          <View style={s.guaranteeBox} wrap={false}>
            <View style={s.guaranteeHeader}>
              <View style={s.guaranteeAccent} />
              <Text style={s.guaranteeTitle}>CONDICIONES</Text>
            </View>

            {conditions.map((line, index) => (
              <Text key={index} style={s.guaranteeText}>
                • {line}
              </Text>
            ))}
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