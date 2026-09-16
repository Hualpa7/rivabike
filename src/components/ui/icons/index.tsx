import type { JSX } from 'react';
import { base, type IconProps } from './shared';

export function SunIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function WhatsAppIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M21 11.5a8.38 8.38 0 0 1-9 8.35 8.5 8.5 0 0 1-3.4-.7L3 21l1.85-5.4a8.38 8.38 0 0 1-1.35-4.6A8.5 8.5 0 0 1 12 3a8.38 8.38 0 0 1 9 8.5z" />
      <path d="M8.5 9.5c.5 3 3 5.5 6 6l1-1-2-1.5-1 .5c-1-.5-1.5-1-2-2l.5-1-1.5-2z" />
    </svg>
  );
}

export function MapPinIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function ClockIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function CloseIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

export function SearchIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  );
}

export function PlusIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function HomeIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

export function DashboardIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  );
}

export function WrenchIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M14.7 6.3a4.5 4.5 0 0 0-5.9 5.9L3 18l3 3 5.8-5.8a4.5 4.5 0 0 0 5.9-5.9l-2.7 2.7-3-3 2.7-2.7z" />
    </svg>
  );
}

export function BoxIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5z" />
      <path d="M3 7.5 12 12l9-4.5M12 12v9" />
    </svg>
  );
}

export function FileTextIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8z" />
      <path d="M14 3v5h5" />
      <path d="M9 13h6M9 17h6" />
    </svg>
  );
}

export function TicketIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M3 9V7a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a3 3 0 0 0 0 6v2a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-2a3 3 0 0 0 0-6z" />
      <path d="M13 5v2M13 11v2M13 17v2" />
    </svg>
  );
}

export function ImageIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <circle cx="8.5" cy="9.5" r="1.5" />
      <path d="m21 15-5-5L5 19" />
    </svg>
  );
}

export function TextIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M4 6V4h16v2M12 4v16M9 20h6" />
    </svg>
  );
}

export function GearIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function StarIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M12 2.5 15 9l6.5.9-4.7 4.6 1.1 6.5L12 17.8 6.1 21l1.1-6.5L2.5 9.9 9 9z" />
    </svg>
  );
}

export function LogoutIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5M21 12H9" />
    </svg>
  );
}

export function DownloadIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M12 3v12M7 10l5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}

export function ChevronLeftIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

export function ChevronRightIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function ChevronDownIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export function ArrowRightIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function PhoneIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

export function CheckIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function EyeIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function EyeOffIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19M6.61 6.61A13.53 13.53 0 0 0 1 12s4 8 11 8a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24M1 1l22 22" />
    </svg>
  );
}

export function DotsIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
      <circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TrashIcon(p: IconProps): JSX.Element {
  return (
    <svg {...base(p)}>
      <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M15 11v6" />
    </svg>
  );
}
