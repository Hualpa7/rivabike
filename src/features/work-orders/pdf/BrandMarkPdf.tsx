import { Path, Svg } from '@react-pdf/renderer';
import { BRAND } from './WorkOrderPdfStyles';

/**
 * Réplica vectorial del BrandMark (logo SVG de la web) para los PDFs.
 * `<Image>` de @react-pdf no renderiza SVG, así que el logo se dibuja
 * con primitivas Svg/Path usando los mismos paths del componente web
 * (`src/components/ui/icons/BrandMark.tsx`). Si el logo web cambia,
 * actualizar los `d` acá también.
 */
export function BrandMarkPdf({ width = 60 }: { width?: number }) {
  const height = (width * 75) / 100;
  return (
    <Svg width={width} height={height} viewBox="0 0 100 75">
      {/* Rueda trasera */}
      <Path
        d="M 37.5 32.5 A 16 16 0 1 0 42.5 57.5"
        stroke={BRAND.black}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      {/* Rueda delantera */}
      <Path
        d="M 61 35 A 16 16 0 1 0 76 32"
        stroke={BRAND.black}
        strokeWidth={6}
        strokeLinecap="round"
        fill="none"
      />
      {/* Cuadro trasero en Z */}
      <Path
        d="M 32.5 21 L 45 21 L 31 43 L 49 43"
        stroke={BRAND.pink}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Horquilla delantera y manubrio */}
      <Path
        d="M 70 46 L 52.5 9 L 66 9 C 74 9 74 19 66 19 L 62.5 19"
        stroke={BRAND.pink}
        strokeWidth={6}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}
