import { UserRole } from '@/types';

// Define permission types
export type Permission =
  | 'view_dashboard'
  | 'view_products'
  | 'manage_products'
  | 'view_categories'
  | 'manage_categories'
  | 'view_banners'
  | 'manage_banners'
  | 'view_orders'
  | 'manage_orders'
  | 'view_customers'
  | 'manage_customers'
  | 'view_coupons'
  | 'manage_coupons'
  | 'view_api_keys'
  | 'manage_api_keys'
  | 'view_users'
  | 'manage_users'
  | 'view_api_logs'
  | 'manage_api_logs';

// Role-to-permissions mapping
const rolePermissions: Record<UserRole, Set<Permission>> = {
  [UserRole.ADMIN]: new Set([
    'view_dashboard',
    'view_products', 'manage_products',
    'view_categories', 'manage_categories',
    'view_banners', 'manage_banners',
    'view_orders', 'manage_orders',
    'view_customers', 'manage_customers',
    'view_coupons', 'manage_coupons',
    'view_api_keys', 'manage_api_keys',
    'view_users', 'manage_users',
    'view_api_logs', 'manage_api_logs',
  ]),
  [UserRole.ORDER_ADMIN]: new Set([
    'view_dashboard',  // Limited dashboard showing only order stats
    'view_orders',
    'manage_orders',
  ]),
  [UserRole.CUSTOMER]: new Set([
    // Regular customers have no admin permissions
  ]),
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return rolePermissions[role]?.has(permission) ?? false;
}

/**
 * Check if a role can access any admin permission (for role existence check)
 */
export function hasAnyAdminPermission(role: UserRole | undefined | null): boolean {
  if (!role) return false;
  const permissions = rolePermissions[role];
  return permissions ? permissions.size > 0 : false;
}

/**
 * Check if role is full admin
 */
export function isAdmin(role: UserRole | undefined | null): boolean {
  return role === UserRole.ADMIN;
}

/**
 * Check if role is order admin
 */
export function isOrderAdmin(role: UserRole | undefined | null): boolean {
  return role === UserRole.ORDER_ADMIN;
}

/**
 * Get default redirect path based on role after login
 */
export function getDefaultAdminPath(role: UserRole | undefined | null): string {
  if (!role) return '/admin/login';

  switch (role) {
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.ORDER_ADMIN:
      return '/admin/dashboard/ordenes';
    case UserRole.CUSTOMER:
    default:
      return '/';
  }
}

/**
 * Check if a user role can access a specific route
 */
export function canAccessRoute(role: UserRole | undefined | null, pathname: string): boolean {
  if (!role) return false;

  // Map routes to required permissions
  const routePermissions: Record<string, Permission> = {
    '/admin/dashboard/productos': 'view_products',
    '/admin/dashboard/categories': 'view_categories',
    '/admin/dashboard/banners': 'view_banners',
    '/admin/dashboard/ordenes': 'view_orders',
    '/admin/dashboard/clientes': 'view_customers',
    '/admin/dashboard/cupones': 'view_coupons',
    '/admin/dashboard/api-keys': 'view_api_keys',
    '/admin/dashboard/usuarios': 'view_users',
    '/admin/dashboard/api-logs': 'view_api_logs',
  };

  // Check if pathname starts with any restricted route
  for (const [route, permission] of Object.entries(routePermissions)) {
    if (pathname.startsWith(route)) {
      return hasPermission(role, permission);
    }
  }

  // Dashboard is special - all admin roles can access it
  if (pathname === '/admin/dashboard') {
    return hasAnyAdminPermission(role);
  }

  // Allow access to login page
  if (pathname === '/admin/login') {
    return true;
  }

  // For unknown admin routes, allow if user has any admin permission
  if (pathname.startsWith('/admin')) {
    return hasAnyAdminPermission(role);
  }

  // Non-admin routes are accessible
  return true;
}
