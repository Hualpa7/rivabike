import { useState } from 'react';
import type { Service } from '@/types';
import { useServices } from '@/features/services/api';
import {
  LandingNav,
  Hero,
  About,
  HowWeWork,
  Reviews,
  Services,
  ServiceModal,
  Trabajos,
  Contact,
  Footer,
  WhatsAppFab,
} from '@/features/landing/components';

export function LandingPage() {
  const { data: services } = useServices({ onlyActive: true });
  const [openId, setOpenId] = useState<string | null>(null);
  const openService = (id: string | null): Service | null =>
    services?.find((s) => s.id === id) ?? null;

  return (
    <>
      <LandingNav />
      <main>
        <Hero />
        <About />
        <HowWeWork />
        <Reviews />
        <Services onSelect={(s) => setOpenId(s.id)} />
        <Trabajos />
        <Contact />
      </main>
      <Footer />
      <WhatsAppFab />
      <ServiceModal service={openService(openId)} onClose={() => setOpenId(null)} />
    </>
  );
}
