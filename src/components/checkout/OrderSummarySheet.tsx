"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import OrderSummary, { type OrderSummaryItem } from "./OrderSummary";

interface OrderSummarySheetProps {
  isOpen: boolean;
  onClose: () => void;
  items: readonly (OrderSummaryItem | null)[];
  subtotal: number;
  subtotalVES: number | null;
  ivaAmount: number;
  ivaAmountVes: number;
  shipping: number;
  discountCode: string | null;
  discountAmount: number;
  discountAmountVes: number | null;
  total: number;
  totalVES: number | null;
  paymentMethod: string | undefined;
  exchangeRate: number | null;
  onApplyDiscount: (code: string) => Promise<void>;
  discountError: string | null;
  isApplyingDiscount: boolean;
}

export default function OrderSummarySheet({
  isOpen,
  onClose,
  ...summaryProps
}: OrderSummarySheetProps) {
  const t = useTranslations("checkout");
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === "Tab" && sheetRef.current) {
        const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]),[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      previouslyFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-summary-sheet-title"
        className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85vh] flex-col overscroll-contain rounded-t-3xl bg-white shadow-2xl animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex justify-center pt-2 pb-1 shrink-0">
          <div
            className="w-10 h-1.5 rounded-full bg-sand-300"
            aria-hidden="true"
          />
        </div>
        <div className="flex shrink-0 items-center justify-between border-b border-sand-200 px-5 py-3">
          <h2
            id="order-summary-sheet-title"
            className="font-display text-base font-bold text-ink"
          >
            {t("orderSummary")}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg hover:bg-sand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            style={{ touchAction: "manipulation" }}
          >
            <X className="w-5 h-5 text-sand-700" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4">
          <OrderSummary variant="sheet" {...summaryProps} />
        </div>
      </div>
    </div>
  );
}
