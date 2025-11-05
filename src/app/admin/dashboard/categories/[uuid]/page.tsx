'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { categoriesService } from '@/services/categories';
import type { UpdateCategoryDto, Category } from '@/types';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function EditCategoryPage() {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;
  const toast = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<UpdateCategoryDto>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (uuid) {
      loadCategory();
    }
  }, [uuid]);

  const loadCategory = async () => {
    try {
      setIsLoading(true);
      const data = await categoriesService.getByUuid(uuid);
      setCategory(data);
      setFormData({
        name: data.name,
        slug: data.slug,
        description: data.description || '',
        isActive: data.isActive,
      });
    } catch (error) {
      console.error('Error loading category:', error);
      toast.error(tCommon('error'));
      router.push('/admin/dashboard/categories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await categoriesService.update(uuid, formData, imageFile || undefined);
      toast.success(t('updateSuccess'));
      router.push('/admin/dashboard/categories');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(t('updateError'));
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">{t('loading')}</div>;
  }

  if (!category) {
    return <div className="p-8 text-center text-gray-500">{t('noCategories')}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/dashboard/categories" className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{t('editTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">{t('nameLabel')}</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder={t('namePlaceholder')}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">{t('slugLabel')}</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug || ''}
              onChange={handleChange}
              placeholder={t('slugPlaceholder')}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">{t('descriptionLabel')}</label>
            <textarea
              id="description"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={4}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Image File */}
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">{t('imageLabel')}</label>
            {category.image && (
              <div className="mt-2 mb-4">
                <Image src={category.image} alt={category.name} width={100} height={100} className="rounded-md object-cover" />
              </div>
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleFileChange}
              accept="image/jpeg, image/png, image/webp"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center">
            <input
              id="isActive"
              name="isActive"
              type="checkbox"
              checked={formData.isActive ?? true}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">{t('isActiveLabel')}</label>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save className="w-5 h-5" />
            {isSaving ? t('saving') : t('save')}
          </button>
        </div>
      </form>
    </div>
  );
}
