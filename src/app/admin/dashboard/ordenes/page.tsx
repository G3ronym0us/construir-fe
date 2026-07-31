"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Download, Loader2 } from "lucide-react";
import { ordersService } from "@/services/orders";
import {
  EMPTY_FILTERS,
  OrdersFilters,
  hasActiveFilters,
  type OrdersFilterState,
} from "@/components/admin/orders/OrdersFilters";
import { OrdersKpis } from "@/components/admin/orders/OrdersKpis";
import { OrdersTable } from "@/components/admin/orders/OrdersTable";
import type { AdminOrderRow, AdminOrderStats } from "@/types";

const PAGE_SIZE = 20;

/** Lo que tarda el buscador en disparar la consulta, para no pedir por tecla. */
const SEARCH_DEBOUNCE_MS = 350;

export default function AdminOrdenesPage() {
  const t = useTranslations("orders");

  const [stats, setStats] = useState<AdminOrderStats | null>(null);
  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [filters, setFilters] = useState<OrdersFilterState>(EMPTY_FILTERS);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [offset, setOffset] = useState(0);

  // El buscador se escribe letra a letra pero solo consulta cuando el admin
  // para de teclear; el resto de los filtros son de un clic y van directos.
  useEffect(() => {
    const timer = setTimeout(
      () => setDebouncedSearch(filters.search),
      SEARCH_DEBOUNCE_MS
    );
    return () => clearTimeout(timer);
  }, [filters.search]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setFailed(false);

      const [statsData, page] = await Promise.all([
        ordersService.getAdminStats(),
        ordersService.filterOrders({
          status: filters.status || undefined,
          paymentStatus: filters.paymentStatus || undefined,
          search: debouncedSearch || undefined,
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          limit: PAGE_SIZE,
          offset,
        }),
      ]);

      setStats(statsData);
      setOrders(page.orders);
      setTotal(page.total);
    } catch (error) {
      console.error("Error loading orders:", error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [
    filters.status,
    filters.paymentStatus,
    filters.startDate,
    filters.endDate,
    debouncedSearch,
    offset,
  ]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /** Cualquier cambio de filtro devuelve a la primera página. */
  const handleFiltersChange = (next: OrdersFilterState) => {
    setFilters(next);
    setOffset(0);
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);

      const blob = await ordersService.exportToCSV({
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ordenes_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert(t("exportError"));
    } finally {
      setExporting(false);
    }
  };

  // Solo la primera carga tapa la pantalla; los refiltrados dejan la tabla
  // puesta y se anuncian con el velo de más abajo.
  if (loading && !stats && !failed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (failed && !stats) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <AlertCircle className="h-10 w-10 text-danger-500" />
        <p className="text-[13px] font-medium text-sand-700">
          {t("loadListError")}
        </p>
        <button
          type="button"
          onClick={() => void loadData()}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-[12.5px] font-semibold text-white hover:bg-brand-700"
        >
          {t("retry")}
        </button>
      </div>
    );
  }

  const summary = [
    stats &&
      t("listSummary", {
        total: stats.totalOrders,
        review: stats.paymentReviewCount,
      }),
    stats?.exchangeRate != null &&
      t("rateToday", {
        // Mismo formato de tasa que el detalle: coma decimal, como se lee aquí.
        rate: Number(stats.exchangeRate).toLocaleString("es-VE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      }),
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-[28px] font-bold text-ink">
            {t("title")}
          </h1>
          <p className="mt-1 text-[13px] font-medium text-sand-600">{summary}</p>
        </div>

        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="inline-flex flex-none items-center gap-1.5 rounded-lg bg-success-600 px-4 py-2.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-success-700 disabled:opacity-50"
        >
          <Download className="h-[15px] w-[15px]" />
          {exporting ? t("exporting") : t("exportCsv")}
        </button>
      </header>

      {stats && <OrdersKpis stats={stats} />}

      <OrdersFilters
        filters={filters}
        stats={stats}
        onChange={handleFiltersChange}
      />

      {failed && (
        <div className="flex items-center gap-2.5 rounded-xl border border-danger-100 bg-danger-50 px-4 py-3 text-[12.5px] font-medium text-danger-600">
          <AlertCircle className="h-4 w-4 flex-none" />
          {t("loadListError")}
        </div>
      )}

      <div className={loading ? "opacity-60 transition-opacity" : undefined}>
        <OrdersTable orders={orders} filtered={hasActiveFilters(filters)} />
      </div>

      {total > PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-sand-300 bg-white px-5 py-3.5">
          <p className="text-[13px] font-medium text-sand-700">
            {t("showing", {
              from: offset + 1,
              to: Math.min(offset + PAGE_SIZE, total),
              total,
            })}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
              disabled={offset === 0}
              className="rounded-lg border border-sand-300 px-4 py-2 text-[12.5px] font-semibold text-sand-700 transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t("previous")}
            </button>
            <button
              type="button"
              onClick={() => setOffset(offset + PAGE_SIZE)}
              disabled={offset + PAGE_SIZE >= total}
              className="rounded-lg border border-sand-300 px-4 py-2 text-[12.5px] font-semibold text-sand-700 transition-colors hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {t("next")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
