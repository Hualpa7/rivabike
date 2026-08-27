export function LandingPage() {
  return (
    <main>
      {/* Hero: reemplazar por el componente definitivo inspirado en la
          referencia "Motor Bike Website Concept UI" (ver
          docs/design-references.md) — imagen a sangre + eyebrow + titular
          grande + doble CTA. */}
      <section className="flex min-h-[80vh] flex-col justify-end gap-4 px-6 pb-16 pt-24 md:px-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-pink-deep">
          Taller · Servicio técnico
        </p>
        <h1 className="max-w-3xl font-display text-5xl font-medium leading-[0.95] md:text-7xl">
          Tu bici, en las mejores manos.
        </h1>
        <div className="mt-4 flex flex-wrap gap-3">
          <a href="#contacto" className="rounded-pill bg-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide text-paper hover:bg-pink-deep">
            Solicitar presupuesto
          </a>
          <a href="#galeria" className="rounded-pill border border-ink px-6 py-3 text-sm font-semibold uppercase tracking-wide hover:border-pink-deep hover:text-pink-deep">
            Ver nuestros trabajos
          </a>
        </div>
      </section>
    </main>
  );
}
