import { useState, useEffect } from 'react';
import { PaymentMethod } from '@/lib/enums';
import {
  getPaymentMethodDetails,
  isPaymentMethodEnabled,
  getActivePaymentMethods,
  type PaymentMethodDetails,
  type PaymentMethodConfig
} from '@/config/payment';

/**
 * Hook para obtener los detalles de un método de pago específico
 * Los datos se cargan desde las variables de entorno
 */
export function usePaymentMethodDetails(method: PaymentMethod) {
  const [details, setDetails] = useState<PaymentMethodDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = () => {
    try {
      setLoading(true);
      setError(null);

      // Verificar si el método está habilitado
      if (!isPaymentMethodEnabled(method)) {
        setError('Este método de pago no está disponible');
        setDetails(null);
        return;
      }

      // Obtener los detalles desde la configuración
      const methodDetails = getPaymentMethodDetails(method);

      // Validar que existan los detalles necesarios
      if (!methodDetails || Object.keys(methodDetails).length === 0) {
        setError('No se encontró la configuración para este método de pago');
        setDetails(null);
        return;
      }

      setDetails(methodDetails);
    } catch (err) {
      console.error('Error loading payment method details:', err);
      setError('Error al cargar los detalles del método de pago');
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [method]);

  return {
    details,
    loading,
    error,
    reload: loadDetails,
  };
}

// Interfaz para el selector de métodos de pago
interface PaymentMethodDisplay {
  uuid: string;
  type: PaymentMethod;
  name: string;
  description: string;
  icon: string;
}

/**
 * Hook para obtener la lista de métodos de pago activos
 * Compatible con el componente Step4Payment
 */
export function usePaymentMethods() {
  const [methods, setMethods] = useState<PaymentMethodDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setLoading(true);
      setError(null);

      const activeMethods = getActivePaymentMethods();

      // Mapear a formato compatible con la UI
      const displayMethods: PaymentMethodDisplay[] = activeMethods.map((config) => {
        // Nombres y descripciones por defecto
        const methodInfo = {
          [PaymentMethod.ZELLE]: {
            name: 'Zelle',
            description: 'Pago en USD',
            icon: '💵'
          },
          [PaymentMethod.PAGO_MOVIL]: {
            name: 'Pago Móvil',
            description: 'Pago en Bolívares',
            icon: '📱'
          },
          [PaymentMethod.TRANSFERENCIA]: {
            name: 'Transferencia',
            description: 'Transferencia bancaria',
            icon: '🏦'
          }
        };

        return {
          uuid: config.type, // Usar type como UUID temporal
          type: config.type,
          name: methodInfo[config.type].name,
          description: methodInfo[config.type].description,
          icon: methodInfo[config.type].icon,
        };
      });

      setMethods(displayMethods);
    } catch (err) {
      console.error('Error loading payment methods:', err);
      setError('Error al cargar los métodos de pago');
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    methods,
    loading,
    error,
  };
}
