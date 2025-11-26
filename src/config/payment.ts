// Configuración de métodos de pago
// TODO: Mover a base de datos o variables de entorno

export const PAYMENT_CONFIG = {
  zelle: {
    email: 'pagos@construir.com',
    beneficiary: 'Construir Ferretería C.A.',
  },
  pagomovil: {
    bank: 'Banco de Venezuela',
    bankCode: '0102',
    phone: '0414-1234567',
    cedula: 'J-12345678-9',
  },
  transferencia: {
    bank: 'Banco de Venezuela',
    bankCode: '0102',
    accountNumber: '0102-0123-45-1234567890',
    rif: 'J-12345678-9',
    beneficiary: 'Construir Ferretería C.A.',
  },
} as const;

export const PAYMENT_METHODS = [
  {
    id: 'zelle',
    name: 'Zelle',
    description: 'Pago mediante Zelle (USD)',
    icon: '💵',
  },
  {
    id: 'pagomovil',
    name: 'Pago Móvil',
    description: 'Pago móvil interbancario (VES)',
    icon: '📱',
  },
  {
    id: 'transferencia',
    name: 'Transferencia Bancaria',
    description: 'Transferencia bancaria (VES)',
    icon: '🏦',
  },
] as const;
