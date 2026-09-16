import { WhatsAppIcon } from '@/components/ui/icons';
import { useSiteSettings } from '@/features/settings/api';

const FELLBACK = '543878224212';

/** Boton flotante de WhatsApp (fixed bottom-right) hacia el chat del taller. */
export function WhatsAppFab() {
  const { data: settings } = useSiteSettings();
  const number = settings?.whatsapp ?? FELLBACK;
  const text = encodeURIComponent('Hola Riva Bike! Quiero hacer una consulta.');

  return (
    <a
      href={`https://wa.me/${number}?text=${text}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chatear por WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] transition-transform hover:scale-110 md:bottom-6 md:right-6"
    >
      <WhatsAppIcon size={28} />
    </a>
  );
}