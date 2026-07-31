"use client";

import { useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Package, Home } from "lucide-react";
import { useCart } from "@/context/CartContext";

function ConfirmacionContent() {
  const { clearCart } = useCart();
  const searchParams = useSearchParams();
  const method = searchParams.get("method");
  const isZelle = method === "zelle";

  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-sand-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-sand-300 bg-white-lg p-8 text-center">
          {/* Icono de éxito */}
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-success-600" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-ink mb-4">
            ¡Pedido Recibido!
          </h1>

          <p className="text-lg text-sand-700 mb-2">
            {isZelle
              ? "Gracias por tu compra. Hemos recibido tu pedido."
              : "Gracias por tu compra. Hemos recibido tu pedido y comprobante de pago."}
          </p>
          <p className="text-sm font-medium mb-8 text-accent-600">
            {isZelle
              ? "Un vendedor te contactará pronto para indicarte los datos de pago Zelle."
              : "Tu pedido está pendiente de verificación del pago."}
          </p>

          {/* Información */}
          <div className="bg-brand-50 border border-brand-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-ink mb-4">
              ¿Qué sigue?
            </h2>
            {isZelle ? (
              <ul className="space-y-3 text-sm text-sand-700">
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">1.</span>
                  <span>Un vendedor de Construir se comunicará contigo para indicarte a qué cuenta realizar el pago Zelle</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">2.</span>
                  <span>Una vez confirmado el pago, procederemos a preparar tu pedido</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">3.</span>
                  <span>Recibirás una notificación cuando tu pedido esté listo para envío</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">4.</span>
                  <span>Recibirás un número de rastreo para seguir tu envío</span>
                </li>
              </ul>
            ) : (
              <ul className="space-y-3 text-sm text-sand-700">
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">1.</span>
                  <span>
                    Verificaremos tu comprobante de pago (esto puede tomar hasta 24 horas)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">2.</span>
                  <span>
                    Recibirás un correo de confirmación una vez que tu pago sea verificado
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">3.</span>
                  <span>
                    Prepararemos tu pedido y te notificaremos cuando esté listo para envío
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-brand-600 font-bold">4.</span>
                  <span>
                    Recibirás un número de rastreo para seguir tu envío
                  </span>
                </li>
              </ul>
            )}
          </div>

          {/* Estado del Pedido */}
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-ink">
                {isZelle ? "Estado: Pendiente de Contacto" : "Estado: Pendiente de Verificación"}
              </p>
            </div>
            <p className="text-xs text-sand-700">
              {isZelle
                ? "Un vendedor se pondrá en contacto contigo a la brevedad."
                : "Estamos revisando tu comprobante de pago. Te notificaremos por correo cuando sea aprobado."}
            </p>
          </div>

          {/* Nota sobre cuenta */}
          <div className="bg-accent-50 border border-accent-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-sand-700">
              💡 <strong>¿Creaste una cuenta?</strong> Revisa tu correo para activarla
              y poder rastrear tus pedidos fácilmente.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-sand-300 text-sand-700 font-semibold rounded-lg hover:bg-sand-50 transition-colors"
            >
              <Package className="w-5 h-5" />
              Seguir Comprando
            </Link>
          </div>

          {/* Ayuda */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-sand-600">
              ¿Necesitas ayuda?{" "}
              <a href="/contacto" className="text-brand-600 hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmacionPage() {
  return (
    <Suspense>
      <ConfirmacionContent />
    </Suspense>
  );
}
