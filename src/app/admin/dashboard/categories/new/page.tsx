'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { categoriesService } from '@/services/categories';
import type { CreateCategoryDto, Category, CategoryStats } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Toggle } from '@/components/ui/Toggle';
import { ImageDropzone } from '@/components/admin/categories/ImageDropzone';
import { FeaturedChecklist } from '@/components/admin/categories/FeaturedChecklist';
import {
  SlugAvailabilityBadge,
  slugify,
  useSlugAvailability,
} from '@/components/admin/categories/SlugField';

interface CategoryFormData {
  name: string;
  customName: string;
  slug: string;
  description: string;
  parentUuid: string;
  visible: boolean;
  isFeatured: boolean;
}

export default function NewCategoryPage() {
  const t = useTranslations('categories');
  const router = useRouter();
  const toast = useToast();

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  // El slug se autogenera desde el nombre hasta que se toca a mano.
  const [slugEdited, setSlugEdited] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      customName: '',
      slug: '',
      description: '',
      parentUuid: '',
      visible: true,
      isFeatured: false,
    },
  });

  const nameValue = watch('name');
  const slugValue = watch('slug');
  const isFeaturedValue = watch('isFeatured');

  const { status: slugStatus, takenBy: slugTakenBy } = useSlugAvailability(slugValue);

  useEffect(() => {
    categoriesService
      .getParents()
      .then(setParentCategories)
      .catch((error) => console.error('Error loading parent categories:', error));

    categoriesService
      .getStats()
      .then(setStats)
      .catch((error) => console.error('Error loading stats:', error));
  }, []);

  useEffect(() => {
    if (!slugEdited) {
      setValue('slug', slugify(nameValue));
    }
  }, [nameValue, slugEdited, setValue]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const noFeaturedSlots =
    !!stats && stats.featured >= stats.featuredSlots;

  const onSubmit = async (data: CategoryFormData) => {
    // Destacar exige imagen y un espacio libre en la portada.
    if (data.isFeatured && !imageFile) {
      setError('isFeatured', { type: 'manual', message: t('imageRequiredForFeatured') });
      toast.error(t('imageRequiredForFeatured'));
      return;
    }
    if (data.isFeatured && noFeaturedSlots) {
      toast.error(t('featuredSlotsFull', { slots: stats?.featuredSlots ?? 0 }));
      return;
    }
    if (slugStatus === 'taken') {
      setError('slug', { type: 'manual', message: t('slugTakenBy', { name: slugTakenBy ?? '' }) });
      return;
    }

    try {
      const createData: CreateCategoryDto = {
        name: data.name,
        customName: data.customName || undefined,
        slug: data.slug,
        description: data.description || undefined,
        visible: data.visible,
        isFeatured: data.isFeatured,
      };

      const newCategory = await categoriesService.create(createData, imageFile || undefined);

      if (data.parentUuid) {
        await categoriesService.assignParent(newCategory.uuid, {
          parentUuid: data.parentUuid,
        });
      }

      toast.success(t('createSuccess'));
      router.push('/admin/dashboard/categories');
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(error instanceof Error ? error.message : t('createError'));
    }
  };

  const inputClass = (hasError: boolean) =>
    `mt-1.5 block w-full rounded-lg border px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors ${
      hasError
        ? 'border-danger-500 focus:border-danger-500'
        : 'border-sand-300 focus:border-brand-400'
    }`;

  return (
    <div className="w-full max-w-full space-y-5">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/dashboard/categories"
          aria-label={t('backToList')}
          className="rounded-lg p-2 text-sand-700 transition-colors hover:bg-sand-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
          {t('createTitle')}
        </h1>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        {/* Columna izquierda: identidad de la categoría */}
        <div className="space-y-5 rounded-xl border border-sand-300 bg-white p-5 md:p-6">
          <div>
            <label htmlFor="name" className="text-[13px] font-semibold text-ink">
              {t('nameLabel')} <span className="text-danger-600">*</span>
            </label>
            <input
              type="text"
              id="name"
              {...register('name', {
                required: t('nameRequired'),
                minLength: { value: 2, message: t('nameTooShort') },
                maxLength: { value: 100, message: t('nameTooLong') },
              })}
              placeholder={t('namePlaceholder')}
              className={inputClass(!!errors.name)}
            />
            <p className="mt-1.5 text-[12px] text-sand-600">{t('nameHelp')}</p>
            {errors.name && (
              <p className="mt-1 text-[12.5px] font-medium text-danger-600">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="customName" className="text-[13px] font-semibold text-ink">
              {t('customNameLabel')}
            </label>
            <input
              type="text"
              id="customName"
              {...register('customName')}
              placeholder={t('customNamePlaceholder')}
              className={inputClass(false)}
            />
            <p className="mt-1.5 text-[12px] text-sand-600">{t('customNameHelp')}</p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="slug" className="text-[13px] font-semibold text-ink">
                {t('slugLabel')} <span className="text-danger-600">*</span>
              </label>
              <SlugAvailabilityBadge status={slugStatus} takenBy={slugTakenBy} />
            </div>
            <div
              className={`mt-1.5 flex items-center rounded-lg border px-3 py-2.5 transition-colors focus-within:border-brand-400 ${
                errors.slug || slugStatus === 'taken'
                  ? 'border-danger-500'
                  : 'border-sand-300'
              }`}
            >
              <span className="flex-none font-mono text-[12.5px] text-sand-600">
                /categorias/
              </span>
              <input
                type="text"
                id="slug"
                {...register('slug', {
                  required: t('slugRequired'),
                  pattern: { value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, message: t('slugInvalidHelp') },
                })}
                onInput={() => setSlugEdited(true)}
                placeholder={t('slugPlaceholder')}
                className="w-full bg-transparent font-mono text-[12.5px] text-ink outline-none"
              />
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-sand-600">
              {t('slugHelp')}
            </p>
            {errors.slug && (
              <p className="mt-1 text-[12.5px] font-medium text-danger-600">
                {errors.slug.message}
              </p>
            )}
            {slugStatus === 'taken' && !errors.slug && (
              <p className="mt-1 text-[12.5px] font-medium text-danger-600">
                {t('slugTakenBy', { name: slugTakenBy ?? '' })}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="parentUuid" className="text-[13px] font-semibold text-ink">
              {t('parentCategoryLabel')}
            </label>
            <select
              id="parentUuid"
              {...register('parentUuid')}
              className={inputClass(false)}
            >
              <option value="">{t('noParent')}</option>
              {parentCategories.map((category) => (
                <option key={category.uuid} value={category.uuid}>
                  {category.customName ?? category.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-[12px] text-sand-600">{t('parentCategoryHelp')}</p>
          </div>

          <div>
            <label htmlFor="description" className="text-[13px] font-semibold text-ink">
              {t('descriptionLabel')}
            </label>
            <textarea
              id="description"
              {...register('description')}
              rows={4}
              placeholder={t('descriptionPlaceholder')}
              className={inputClass(false)}
            />
          </div>
        </div>

        {/* Columna derecha: imagen, visibilidad y requisitos */}
        <div className="space-y-4">
          <div className="rounded-xl border border-sand-300 bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-semibold text-ink">{t('imageLabel')}</span>
              {isFeaturedValue && (
                <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-[11px] font-semibold text-accent-700">
                  {t('imageRequiredIfFeatured')}
                </span>
              )}
            </div>

            <div className="mt-3">
              {imagePreview ? (
                <div className="space-y-2">
                  <div className="relative h-40 w-full overflow-hidden rounded-lg border border-sand-300">
                    <Image
                      src={imagePreview}
                      alt={imageFile?.name ?? ''}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-danger-600 hover:text-danger-700"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {t('removeSelectedImage')}
                  </button>
                </div>
              ) : (
                <ImageDropzone onSelect={handleImageSelect} />
              )}
            </div>

            <p className="mt-3 text-[12px] leading-relaxed text-sand-600">
              {t('imageHelp')}
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-sand-300 bg-white p-5">
            <span className="text-[13px] font-semibold text-ink">
              {t('statusSectionTitle')}
            </span>

            <Controller
              name="visible"
              control={control}
              render={({ field }) => (
                <Toggle
                  id="visible"
                  label={t('visibleLabel')}
                  description={t('visibleHelp')}
                  checked={field.value}
                  onChange={field.onChange}
                  color="green"
                />
              )}
            />

            <Controller
              name="isFeatured"
              control={control}
              render={({ field }) => (
                <Toggle
                  id="isFeatured"
                  label={t('isFeaturedLabel')}
                  description={
                    stats
                      ? t('isFeaturedHelp', {
                          used: stats.featured,
                          slots: stats.featuredSlots,
                        })
                      : t('isFeaturedHelpPlain')
                  }
                  checked={field.value}
                  onChange={field.onChange}
                  disabled={noFeaturedSlots && !field.value}
                  color="yellow"
                />
              )}
            />

            {noFeaturedSlots && !isFeaturedValue && (
              <p className="text-[12.5px] font-medium text-accent-700">
                {t('featuredSlotsFull', { slots: stats?.featuredSlots ?? 0 })}
              </p>
            )}
          </div>

          <FeaturedChecklist
            items={[
              {
                label: t('checkNameAndSlug'),
                done: !!nameValue && !!slugValue && slugStatus === 'available',
              },
              { label: t('checkImage'), done: !!imageFile },
              { label: t('checkProductsNew'), done: false },
            ]}
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/dashboard/categories"
              className="flex items-center justify-center rounded-lg border border-sand-300 px-4 py-2.5 text-sm font-medium text-sand-700 transition-colors hover:bg-sand-50"
            >
              {t('cancel')}
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? t('saving') : t('saveCategory')}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
