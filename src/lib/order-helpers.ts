import type { OrderStatus, PaymentStatus } from '@/types';

/**
 * Obtiene la clave de traducción para el estado de la orden
 */
export function getOrderStatusKey(status: OrderStatus): string {
  return `order.status.${status}`;
}

/**
 * Obtiene la clave de traducción para el estado del pago
 */
export function getPaymentStatusKey(status: PaymentStatus): string {
  return `payment.status.${status}`;
}

/**
 * Obtiene el color del badge según el estado de la orden
 */
export function getOrderStatusColor(status: OrderStatus): string {
  const colorMap: Record<OrderStatus, string> = {
    pending: 'bg-accent-100 text-accent-700',
    payment_review: 'bg-accent-100 text-accent-700',
    confirmed: 'bg-success-100 text-success-700',
    processing: 'bg-brand-100 text-brand-800',
    shipped: 'bg-brand-100 text-brand-800',
    delivered: 'bg-success-100 text-success-700',
    completed: 'bg-success-100 text-success-700',
    'on-hold': 'bg-accent-100 text-accent-700',
    cancelled: 'bg-danger-100 text-danger-700',
    refunded: 'bg-sand-100 text-sand-700',
  };
  return colorMap[status] || 'bg-sand-100 text-sand-700';
}

/**
 * Obtiene el color del badge según el estado del pago
 */
export function getPaymentStatusColor(status: PaymentStatus): string {
  const colorMap: Record<PaymentStatus, string> = {
    pending: 'bg-accent-100 text-accent-700',
    verified: 'bg-success-100 text-success-700',
    rejected: 'bg-danger-100 text-danger-700',
    refunded: 'bg-sand-100 text-sand-700',
  };
  return colorMap[status] || 'bg-sand-100 text-sand-700';
}

/**
 * Avance del pedido de 0 a 1 para la barra de progreso de la tarjeta.
 * Devuelve `null` cuando el pedido ya no avanza (cancelado, reembolsado).
 */
export function getOrderProgress(status: OrderStatus): number | null {
  const progressMap: Partial<Record<OrderStatus, number>> = {
    pending: 0.15,
    payment_review: 0.3,
    confirmed: 0.45,
    processing: 0.6,
    shipped: 0.8,
    delivered: 1,
    completed: 1,
  };
  return progressMap[status] ?? null;
}
