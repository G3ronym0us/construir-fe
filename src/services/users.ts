import { apiClient } from "@/lib/api";
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  ChangeUserRoleDto,
  ResetUserPasswordDto,
  UserStats,
  UserListFilters,
  PaginatedResponse
} from "@/types";

export const usersService = {
  /**
   * Get paginated list of users with filters
   */
  async getAll(filters?: UserListFilters): Promise<PaginatedResponse<User>> {
    const queryParams = new URLSearchParams();

    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.search) queryParams.append('search', filters.search);
    if (filters?.role && filters.role !== 'all') queryParams.append('role', filters.role);
    if (filters?.isActive !== undefined && filters.isActive !== 'all') {
      queryParams.append('isActive', filters.isActive.toString());
    }
    if (filters?.includeDeleted) queryParams.append('includeDeleted', filters.includeDeleted.toString());
    if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) queryParams.append('sortOrder', filters.sortOrder);

    const url = `/users/admin/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiClient.get<PaginatedResponse<User>>(url);
  },

  /**
   * Get single user by UUID
   */
  async getByUuid(uuid: string): Promise<User> {
    return apiClient.get<User>(`/users/admin/users/${uuid}`);
  },

  /**
   * Get user statistics
   */
  async getStats(): Promise<UserStats> {
    return apiClient.get<UserStats>('/users/admin/stats');
  },

  /**
   * Create new user (admin only)
   */
  async create(data: CreateUserDto): Promise<User> {
    return apiClient.post<User>('/users/admin/users', data);
  },

  /**
   * Update user information
   */
  async update(uuid: string, data: UpdateUserDto): Promise<User> {
    return apiClient.patch<User>(`/users/admin/users/${uuid}`, data);
  },

  /**
   * Soft delete user
   */
  async delete(uuid: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/users/admin/users/${uuid}`);
  },

  /**
   * Change user role
   */
  async changeRole(uuid: string, data: ChangeUserRoleDto): Promise<User> {
    return apiClient.patch<User>(`/users/admin/users/${uuid}/role`, data);
  },

  /**
   * Reset user password
   */
  async resetPassword(uuid: string, data: ResetUserPasswordDto): Promise<{ message: string }> {
    return apiClient.patch<{ message: string }>(`/users/admin/users/${uuid}/password`, data);
  },

  /**
   * Toggle user active status
   */
  async toggleActive(uuid: string): Promise<User> {
    return apiClient.patch<User>(`/users/admin/users/${uuid}/toggle-active`, {});
  },

  /**
   * Restore soft-deleted user
   */
  async restore(uuid: string): Promise<User> {
    return apiClient.post<User>(`/users/admin/users/${uuid}/restore`, {});
  },
};
