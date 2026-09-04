import { motion } from 'motion/react';
import { useSiteSettings } from '@/features/settings/api';
import { useGoogleReviews } from '@/features/landing/api';
import { StarRating } from './ui/StarRating';
import heroImg from '@/assets/hero.jpg';

/**
 * Hero: banda fotografica full-bleed oscura con eyebrow, titular, pill de
 * rating de Google y doble CTA. A la derecha el circulo de bici con aro
 * rayado giratorio y badge "Taller · Salta".
 */
export function Hero() {
  const { data: settings } = useSiteSettings();
  const { data: reviews } = useGoogleReviews();

  const eyebrow = settings?.hero_eyebrow ?? 'Taller · Servicio técnico';
  const titulo = settings?.hero_titulo ?? 'Tu bici, en las mejores manos.';
  const bg = settings?.hero_imagen_url ?? '';

  const circle = (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.1, ease: [0.34, 1.3, 0.64, 1] }}
      className="relative aspect-square"
    >
      <div
        className="absolute inset-0 -z-10 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(238,125,151,0.45) 0%, transparent 65%)' }}
        aria-hidden="true"
      />
      <div className="absolute inset-[-14px] rounded-full border-2 border-dashed border-pink/45 animate-spin-slow" aria-hidden="true" />
      <div className="h-full w-full overflow-hidden rounded-full">
        <img src={heroImg} alt="Bicicleta del taller" className="h-full w-full -scale-x-110 scale-y-110 object-cover" />
      </div>
      <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-pill bg-pink px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-white">
        Taller · Salta
      </span>
    </motion.div>
  );

  return (
    <section id="inicio" className="relative flex min-h-[100svh] flex-col justify-start overflow-hidden md:justify-end">
      {bg ? (
        <div
          className="absolute inset-0 scale-[1.06] bg-cover bg-center blur-[2px]"
          style={{
            backgroundImage: `url(${bg})`,
            filter: 'saturate(1.05) brightness(0.7)',
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-ink" aria-hidden="true" />
      )}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, rgba(10,10,10,0.74) 0%, rgba(10,10,10,0.46) 55%, rgba(10,10,10,0.30) 100%)' }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.6) 0%, transparent 30%)' }}
        aria-hidden="true"
      />

      {/* Circulo de bici con aro rayado y badge (solo desktop) */}
      <div className="absolute right-[8%] top-1/2 hidden w-[min(42vw,520px)] -translate-y-1/2 md:block">
        {circle}
      </div>

      <div className="relative mx-auto flex w-full max-w-[1120px] flex-col gap-12 px-6 pb-16 pt-40 text-center md:block md:pb-20 md:pl-3 md:pr-6 md:pt-32 md:text-left">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="font-mono text-xl font-extrabold uppercase tracking-[0.16em] text-pink"
        >
          {eyebrow}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-[15ch] font-display text-5xl font-bold leading-[0.98] tracking-[-0.03em] text-white md:mx-0 md:mt-4 md:text-[88px]"
        >
          {titulo}
        </motion.h1>

        {/* Circulo de bici (solo mobil): entre el titulo y los botones */}
        <div className="mx-auto w-[min(72vw,340px)] md:mx-0 md:mt-12 md:hidden">{circle}</div>

        {reviews ? (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mx-auto inline-flex items-center gap-2.5 rounded-pill border border-white/25 bg-ink/25 px-4 py-2 backdrop-blur-md md:mx-0 md:mt-6"
          >
            <StarRating rating={reviews.rating} starClassName="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold text-white">{reviews.rating}/5</span>
            <span className="text-white/60">·</span>
            <span className="text-sm text-white/80">
              {reviews.total_reviews} reseñas de Google
            </span>
          </motion.div>
        ) : null}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="flex flex-wrap justify-center gap-3 md:mt-10 md:justify-start"
        >
          <a
            href="#servicios"
            className="rounded-pill bg-white px-7 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-pink hover:text-white"
          >
            Solicitar presupuesto
          </a>
          <a
            href="#trabajos"
            className="rounded-pill border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-pink hover:text-pink"
          >
            Ver nuestros trabajos
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-6 right-8 hidden rotate-90 origin-center font-mono text-[11px] uppercase tracking-[0.2em] text-white/60 md:block" aria-hidden="true">
        deslizá ↓
      </div>
    </section>
  );
}
