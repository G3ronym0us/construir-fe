import type { Order } from "@/types";

export interface OrderCustomer {
  /** Uuid del usuario o del invitado, que es como se direcciona en `/customers/:uuid`. */
  uuid: string | null;
  name: string;
  initials: string;
  email: string;
  phone: string;
  identification: string;
  isGuest: boolean;
}

/**
 * Reúne al comprador desde donde haya quedado en la orden.
 *
 * Hay tres fuentes y no siempre coinciden: el usuario registrado (`user`), el
 * invitado (`guestCustomer`) y la dirección de envío, que es la única que trae
 * datos en órdenes viejas anteriores a `guest_customers`. Se prefiere la más
 * fiable disponible y se completa hueco por hueco con las demás.
 */
export function getOrderCustomer(order: Order): OrderCustomer {
  const guest = order.guestCustomer;
  const user = order.user;
  const address = order.shippingAddress;

  const name =
    (guest && `${guest.firstName} ${guest.lastName}`.trim()) ||
    (user && `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()) ||
    (address && `${address.firstName ?? ""} ${address.lastName ?? ""}`.trim()) ||
    "";

  const identification =
    (guest && `${guest.identificationType}-${guest.identificationNumber}`) ||
    (address?.identificationNumber
      ? `${address.identificationType ?? ""}-${address.identificationNumber}`.replace(
          /^-/,
          ""
        )
      : "") ||
    "";

  // El uuid sale de la relación eager, no del id de la orden: `userId` y
  // `guestCustomerId` son correlativos internos y no sirven para direccionar.
  const uuid = user?.uuid ?? guest?.uuid ?? null;

  return {
    uuid,
    name,
    initials: toInitials(name),
    email: guest?.email || user?.email || address?.email || order.guestEmail || "",
    phone: guest?.phone || address?.phone || "",
    identification,
    isGuest: !order.userId,
  };
}

function toInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  return parts
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

/**
 * Enlace de WhatsApp a partir de un teléfono venezolano.
 *
 * Los teléfonos se guardan como los escribe el cliente ("0412-1234567",
 * "0412 123 45 67"), así que hay que quedarse con los dígitos y anteponer el 58
 * quitando el 0 inicial. Devuelve `null` si lo guardado no parece un teléfono,
 * para no ofrecer un botón que abre una conversación con nadie.
 */
export function toWhatsAppUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return null;

  const international = digits.startsWith("58")
    ? digits
    : `58${digits.replace(/^0/, "")}`;

  return `https://wa.me/${international}`;
}
