import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface ForbiddenErrorProps {
  message?: string;
  returnPath?: string;
  returnLabel?: string;
}

/**
 * Reusable component for displaying 403 Forbidden errors
 *
 * @param message - Custom error message (optional)
 * @param returnPath - Path to return to (default: /admin/dashboard)
 * @param returnLabel - Label for return link (default: "Volver al Dashboard")
 */
export function ForbiddenError({
  message = 'No tienes los permisos necesarios para realizar esta acción.',
  returnPath = '/admin/dashboard',
  returnLabel = 'Volver al Dashboard'
}: ForbiddenErrorProps) {
  return (
    <div className="max-w-md mx-auto mt-10 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-medium text-yellow-800">Acceso Denegado</h3>
          <p className="text-sm text-yellow-700 mt-2">{message}</p>
          <Link
            href={returnPath}
            className="mt-4 inline-block text-sm font-medium text-yellow-800 underline hover:text-yellow-900"
          >
            {returnLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
