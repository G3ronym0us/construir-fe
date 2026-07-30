'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { User } from '@/types';
import { canAccessRoute, getDefaultAdminPath } from '@/lib/permissions';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirect?: boolean;
}

/**
 * Component for client-side permission protection
 *
 * @param children - Content to protect
 * @param fallback - What to show if user doesn't have permission
 * @param redirect - Whether to redirect automatically to appropriate page
 */
export function PermissionGuard({
  children,
  fallback,
  redirect = false
}: PermissionGuardProps) {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');

      if (!userData) {
        setHasPermission(false);
        return;
      }

      try {
        const user: User = JSON.parse(userData);
        const canAccess = canAccessRoute(user.role, window.location.pathname);
        setHasPermission(canAccess);

        if (!canAccess && redirect) {
          const defaultPath = getDefaultAdminPath(user.role);
          router.push(defaultPath);
        }
      } catch {
        setHasPermission(false);
      }
    }
  }, [router, redirect]);

  // Loading state
  if (hasPermission === null) {
    return null;
  }

  // No permission
  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-danger-50 border border-danger-100 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-danger-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-danger-700">Acceso Denegado</h3>
            <p className="text-sm text-danger-700 mt-1">
              No tienes permisos para acceder a esta página.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
