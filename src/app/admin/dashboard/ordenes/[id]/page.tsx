"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ordersService } from "@/services/orders";
import { getOrderStatusColor, getPaymentStatusColor } from "@/lib/order-helpers";
import {
  ArrowLeft,
  Package,
  MapPin,
  CreditCard,
  FileText,
  Save,
  ExternalLink,
} from "lucide-react";
import type { Order, OrderStatus, PaymentStatus } from "@/types";
import Link from "next/link";

export default function OrderDetailPage() {
  const t = useTranslations("orders");

  const params = useParams();
  const router = useRouter();
  const orderId = parseInt(params.id as string);

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Editable states
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("pending");
  const [adminNotes, setAdminNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const orderData = await ordersService.getOrderById(orderId);
      setOrder(orderData);

      // Initialize editable fields
      setOrderStatus(orderData.status);
      setPaymentStatus(orderData.paymentInfo.status);
      setAdminNotes(orderData.paymentInfo.adminNotes || "");
      setTrackingNumber(orderData.trackingNumber || "");
    } catch (error) {
      console.error("Error loading order:", error);
      alert(t("loadError"));
      router.push("/admin/dashboard/ordenes");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!order) return;

    try {
      setUpdating(true);

      await ordersService.updateOrderStatus(order.uuid, {
        orderStatus,
        paymentStatus,
        adminNotes: adminNotes || undefined,
        trackingNumber: trackingNumber || undefined,
      });

      alert(t("updateSuccess"));
      await loadOrder(); // Reload data
    } catch (error) {
      console.error("Error updating order:", error);
      alert(t("updateError"));
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-VE", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("es-VE", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/dashboard/ordenes"
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {t("detailTitle", { orderNumber: order.orderNumber })}
          </h1>
          <p className="text-sm text-gray-500">
            {t("createdAt", { date: formatDate(order.createdAt) })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              {t("orderItems")}
            </h2>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.uuid}
                  className="flex justify-between items-start border-b pb-4"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("sku", { sku: item.productSku })}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("quantity", { quantity: item.quantity })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {formatCurrency(item.subtotal)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {t("each", {
                        price: formatCurrency(parseFloat(item.price)),
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 space-y-2 border-t pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t("subtotal")}</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              {order.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("tax")}</span>
                  <span>{formatCurrency(order.tax)}</span>
                </div>
              )}
              {order.shipping > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t("shipping")}</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t("total")}:</span>
                <span className="text-blue-600">
                  {formatCurrency(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {t("shippingAddress")}
              </h2>
              <div className="space-y-2 text-sm">
                <p className="font-medium text-gray-900">
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </p>
                <p className="text-gray-600">{order.shippingAddress.email}</p>
                <p className="text-gray-600">{order.shippingAddress.phone}</p>
                <p className="text-gray-600">{order.shippingAddress.address}</p>
                <p className="text-gray-600">
                  {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                  {order.shippingAddress.zipCode}
                </p>
                <p className="text-gray-600">
                  {order.shippingAddress.country}
                </p>
                {order.shippingAddress.additionalInfo && (
                  <div className="mt-2 pt-2 border-t">
                    <p className="text-xs text-gray-500">
                      {t("additionalInfo")}
                    </p>
                    <p className="text-gray-600">
                      {order.shippingAddress.additionalInfo}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {t("paymentInfo")}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">{t("paymentMethod")}</p>
                <p className="font-medium text-gray-900 capitalize">
                  {order.paymentInfo.method}
                </p>
              </div>

              {order.paymentInfo.details &&
                Object.keys(order.paymentInfo.details).length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">
                      {t("paymentDetails")}
                    </p>
                    <div className="mt-1 space-y-1">
                      {Object.entries(order.paymentInfo.details).map(
                        ([key, value]) => (
                          <p key={key} className="text-sm text-gray-600">
                            <span className="font-medium">{key}:</span> {value}
                          </p>
                        )
                      )}
                    </div>
                  </div>
                )}

              {order.paymentInfo.receiptUrl && (
                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    {t("paymentReceipt")}
                  </p>
                  <a
                    href={order.paymentInfo.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                  >
                    <ExternalLink className="w-4 h-4" />
                    {t("viewReceipt")}
                  </a>
                </div>
              )}

              {order.paymentInfo.verifiedAt && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-500">
                    {t("verifiedOn", {
                      date: formatDate(order.paymentInfo.verifiedAt),
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("currentStatus")}
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t("orderStatus")}:
                </p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getOrderStatusColor(
                    order.status
                  )}`}
                >
                  {t(`statuses.${order.status}`)}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">
                  {t("paymentStatusLabel")}
                </p>
                <span
                  className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getPaymentStatusColor(
                    order.paymentInfo.status
                  )}`}
                >
                  {t(`paymentStatuses.${order.paymentInfo.status}`)}
                </span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {t("updateStatus")}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("orderStatus")}
                </label>
                <select
                  value={orderStatus}
                  onChange={(e) =>
                    setOrderStatus(e.target.value as OrderStatus)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(t.raw("statuses") as Record<string, string>).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("paymentStatus")}
                </label>
                <select
                  value={paymentStatus}
                  onChange={(e) =>
                    setPaymentStatus(e.target.value as PaymentStatus)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {Object.entries(t.raw("paymentStatuses") as Record<string, string>).map(
                    ([key, value]) => (
                      <option key={key} value={key}>
                        {value}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("trackingNumberLabel")}
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={t("trackingNumberPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("adminNotes")}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  placeholder={t("adminNotesPlaceholder")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                onClick={handleUpdateStatus}
                disabled={updating}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {updating ? t("saving") : t("saveChanges")}
              </button>
            </div>
          </div>

          {/* Customer Notes */}
          {order.notes && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t("customerNotes")}
              </h2>
              <p className="text-sm text-gray-600">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}