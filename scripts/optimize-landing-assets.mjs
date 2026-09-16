// Genera los assets webp de la landing:
//  - src/assets/hero.webp     (imagen del circulo del hero, convertida)
//  - public/hero-cover.webp   (fondo full-bleed del hero)
//  - public/services-bg.webp  (fondo compartido Servicios/Nosotros)
// Los dos public/ se generan desde las fuentes remotas actuales o, en fallback,
// desde src/assets/hero.webp (asset local ya en webp).
// Uso: pnpm optimize:images
import sharp from 'sharp';
import path from 'node:path';
import { mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const feed = path.join(root, 'src', 'assets', 'hero.webp');
const heroOut = path.join(root, 'public', 'hero-cover.webp');
const bgOut = path.join(root, 'public', 'services-bg.webp');

const HERO_URL =
  'https://www.fauconbikes.cl/cdn/shop/files/510A0857.png?v=1759686278&width=2000';
const BG_URL =
  'https://img.magnific.com/foto-gratis/marco-diferentes-herramientas-coche-juguete_23-2148096416.jpg?semt=ais_hybrid&w=740&q=80';

async function download(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} al bajar ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

async function toWebp(source, outPath, width, quality) {
  await mkdir(path.dirname(outPath), { recursive: true });
  await sharp(source)
    .resize({ width, withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);
  const kb = Math.round((await stat(outPath)).size / 1024);
  console.log(`generado ${path.relative(root, outPath)} (${kb} KB)`);
}

// Asset del circulo del hero: webp.local (fuente de fallback para el resto).
await toWebp(path.join(root, 'src', 'assets', 'hero.jpg'), feed, 1200, 82);

// Hero de fondo (hero-cover.webp)
try {
  const raw = await download(HERO_URL);
  await toWebp(raw, heroOut, 1600, 80);
} catch (e) {
  console.warn(`No se pudo descargar el hero remoto, uso src/assets/hero.webp como fallback: ${e.message}`);
  await toWebp(feed, heroOut, 1600, 80);
}

// Fondo compartido Servicios/Nosotros (services-bg.webp)
try {
  const raw = await download(BG_URL);
  await toWebp(raw, bgOut, 1600, 80);
} catch (e) {
  console.warn(`No se pudo descargar el fondo remoto, uso src/assets/hero.webp como fallback: ${e.message}`);
  await toWebp(feed, bgOut, 1600, 80);
}