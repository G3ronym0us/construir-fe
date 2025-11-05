import { apiClient } from "@/lib/api";
import type { Category, CategoryStats, CreateCategoryDto, UpdateCategoryDto } from "@/types";

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    return apiClient.get<Category[]>("/categories");
  },

  async getActive(): Promise<Category[]> {
    return apiClient.get<Category[]>("/categories/active");
  },

  async getStats(): Promise<CategoryStats> {
    return apiClient.get<CategoryStats>("/categories/stats");
  },

  async getBySlug(slug: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/slug/${slug}`);
  },

  async getByUuid(uuid: string): Promise<Category> {
    return apiClient.get<Category>(`/categories/${uuid}`);
  },

  async create(data: CreateCategoryDto, image?: File): Promise<Category> {
    const formData = new FormData();
    for (const key in data) {
      const value = data[key as keyof CreateCategoryDto];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    }
    if (image) {
      formData.append('image', image);
    }
    return apiClient.post<Category>("/categories", formData);
  },

  async update(
    uuid: string,
    data: UpdateCategoryDto,
    image?: File
  ): Promise<Category> {
    const formData = new FormData();
    for (const key in data) {
      const value = data[key as keyof UpdateCategoryDto];
      if (value !== null && value !== undefined) {
        formData.append(key, String(value));
      }
    }
    if (image) {
      formData.append('image', image);
    }
    return apiClient.patch<Category>(`/categories/${uuid}`, formData);
  },

  async delete(uuid: string): Promise<{ message: string }> {
    return apiClient.delete<{ message: string }>(`/categories/${uuid}`);
  },
};