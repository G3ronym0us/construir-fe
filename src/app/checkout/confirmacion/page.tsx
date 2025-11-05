"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle, Package, Home } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ConfirmacionPage() {
  const { clearCart } = useCart();

  // Limpiar el carrito cuando se confirma la orden
  useEffect(() => {
    clearCart();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Icono de éxito */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Pedido Recibido!
          </h1>

          <p className="text-lg text-gray-600 mb-2">
            Gracias por tu compra. Hemos recibido tu pedido y comprobante de pago.
          </p>
          <p className="text-sm text-orange-600 font-medium mb-8">
            Tu pedido está pendiente de verificación del pago.
          </p>

          {/* Información */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              ¿Qué sigue?
            </h2>
            <ul className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">1.</span>
                <span>
                  Verificaremos tu comprobante de pago (esto puede tomar hasta 24 horas)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">2.</span>
                <span>
                  Recibirás un correo de confirmación una vez que tu pago sea verificado
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">3.</span>
                <span>
                  Prepararemos tu pedido y te notificaremos cuando esté listo para envío
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">4.</span>
                <span>
                  Recibirás un número de rastreo para seguir tu envío
                </span>
              </li>
            </ul>
          </div>

          {/* Estado del Pedido */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-semibold text-gray-900">
                Estado: Pendiente de Verificación
              </p>
            </div>
            <p className="text-xs text-gray-600">
              Estamos revisando tu comprobante de pago. Te notificaremos por correo cuando sea aprobado.
            </p>
          </div>

          {/* Nota sobre cuenta */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <p className="text-sm text-gray-700">
              💡 <strong>¿Creaste una cuenta?</strong> Revisa tu correo para activarla
              y poder rastrear tus pedidos fácilmente.
            </p>
          </div>

          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Volver al Inicio
            </Link>
            <Link
              href="/productos"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5" />
              Seguir Comprando
            </Link>
          </div>

          {/* Ayuda */}
          <div className="mt-12 pt-8 border-t">
            <p className="text-sm text-gray-500">
              ¿Necesitas ayuda?{" "}
              <a href="/contacto" className="text-blue-600 hover:underline">
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
