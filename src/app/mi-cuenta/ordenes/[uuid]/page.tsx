"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, PackageSearch, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ordersService } from "@/services/orders";
import { OrderDetail } from "@/components/orders/OrderDetail";
import type { Order } from "@/types";

export default function MiOrdenDetailPage() {
  const params = useParams();
  const uuid = params.uuid as string;
  const tAccount = useTranslations("myAccount");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await ordersService.getOrderByUuid(uuid);
        setOrder(result);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [uuid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-10 h-10 animate-spin text-brand-600" />
      </div>
    );
  }

  if (notFound || !order) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <PackageSearch className="w-16 h-16 text-sand-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-ink mb-2">
          No encontramos esta orden
        </h2>
        <p className="text-sand-600 text-sm mb-6">
          Es posible que la orden no exista o no tengas acceso a ella.
        </p>
        <Link
          href="/mi-cuenta/ordenes"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          {tAccount("backToOrders")}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <OrderDetail
        order={order}
        backLink={{ href: "/mi-cuenta/ordenes", label: tAccount("backToOrders") }}
      />
    </div>
  );
}
