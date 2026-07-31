'use client';

import { useState, type ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** Fila plegable separada por filetes, como el bloque inferior del detalle. */
export default function Accordion({ title, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-t border-sand-200 last:border-b">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between py-3 text-left text-[13.5px] font-semibold text-ink"
      >
        {title}
        <span className="text-sand-600">
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
      </button>
      {open && (
        <div className="pb-4 text-sm leading-relaxed text-sand-700">{children}</div>
      )}
    </div>
  );
}
