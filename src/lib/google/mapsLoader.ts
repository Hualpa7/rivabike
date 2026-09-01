// Loader minimo para Google Maps JavaScript API (carga perezosa, una sola vez).
// La Places API (New) para reviews NO debe llamarse directo desde aca si requiere
// una key sin restringir por dominio: ver docs/design-references.md seccion Google.
let mapsPromise: Promise<void> | null = null;

export function loadGoogleMaps(apiKey: string): Promise<void> {
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise((resolve, reject) => {
    if (window.google?.maps) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&loading=async`;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Maps'));
    document.head.appendChild(script);
  });

  return mapsPromise;
}

declare global {
  interface Window {
    google?: {
      maps?: {
        Map: unknown;
        Marker: unknown;
      };
    };
  }
}
