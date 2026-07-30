import Link from 'next/link';

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

/** Cabecera de sección: titular Archivo a la izquierda, enlace de marca a la derecha. */
export default function SectionHeader({
  title,
  actionLabel,
  actionHref,
  className = '',
}: SectionHeaderProps) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${className}`}>
      <h2 className="font-display text-[17px] font-bold text-ink sm:text-2xl">{title}</h2>
      {actionLabel && actionHref && (
        <Link
          href={actionHref}
          className="flex-none text-[12.5px] font-bold text-brand-600 hover:text-brand-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
