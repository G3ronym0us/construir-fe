'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ExternalLink, Info, Lock, Save, Trash2 } from 'lucide-react';
import { categoriesService } from '@/services/categories';
import type { Category, CategoryStats, CategoryUsage } from '@/types';
import { useToast } from '@/context/ToastContext';
import { Toggle } from '@/components/ui/Toggle';
import { ConfirmModal } from '@/components/ConfirmModal';
import { FeaturedImageModal } from '@/components/admin/FeaturedImageModal';
import { ImageDropzone } from '@/components/admin/categories/ImageDropzone';
import { CurrentImagePanel } from '@/components/admin/categories/CurrentImagePanel';
import { CategoryUsagePanel } from '@/components/admin/categories/CategoryUsagePanel';
import { MoveParentModal } from '@/components/admin/categories/MoveParentModal';
import { FeaturedChecklist } from '@/components/admin/categories/FeaturedChecklist';
import {
  SlugAvailabilityBadge,
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

export default function EditCategoryPage() {
  const t = useTranslations('categories');
  const tCommon = useTranslations('common');
  const router = useRouter();
  const params = useParams();
  const uuid = params.uuid as string;
  const toast = useToast();

  const [category, setCategory] = useState<Category | null>(null);
  const [usage, setUsage] = useState<CategoryUsage | null>(null);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [initialParentUuid, setInitialParentUuid] = useState('');

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  // Reemplazar vuelve a mostrar la zona de arrastre sin borrar todavía nada.
  const [isReplacingImage, setIsReplacingImage] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isBusyWithImage, setIsBusyWithImage] = useState(false);
  const [deleteImageModal, setDeleteImageModal] = useState<{
    isOpen: boolean;
    message?: string;
  }>({ isOpen: false });
  const [featuredImageModalOpen, setFeaturedImageModalOpen] = useState(false);
  const [moveParentModalOpen, setMoveParentModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors, isSubmitting },
    watch,
    setValue,
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

  const slugValue = watch('slug');
  const parentUuidValue = watch('parentUuid');
  const isFeaturedValue = watch('isFeatured');

  const { status: slugStatus, takenBy: slugTakenBy } = useSlugAvailability(
    slugValue,
    uuid
  );

  const fillForm = useCallback(
    (data: Category) => {
      reset({
        name: data.name,
        customName: data.customName ?? '',
        slug: data.slug,
        description: data.description || '',
        parentUuid: data.parent?.uuid || '',
        visible: data.visible,
        isFeatured: data.isFeatured,
      });
    },
    [reset]
  );

  const loadUsage = useCallback(async () => {
    try {
      setUsage(await categoriesService.getUsage(uuid));
    } catch (error) {
      console.error('Error loading category usage:', error);
    }
  }, [uuid]);

  useEffect(() => {
    if (!uuid) return;

    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        const data = await categoriesService.getByUuid(uuid);
        if (cancelled) return;

        setCategory(data);
        setInitialParentUuid(data.parent?.uuid || '');
        fillForm(data);
      } catch (error) {
        console.error('Error loading category:', error);
        toast.error(tCommon('error'));
        router.push('/admin/dashboard/categories');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    categoriesService
      .getParents()
      // La propia categoría no puede ser su padre.
      .then((parents) => setParentCategories(parents.filter((p) => p.uuid !== uuid)))
      .catch((error) => console.error('Error loading parent categories:', error));

    categoriesService
      .getStats()
      .then(setStats)
      .catch((error) => console.error('Error loading stats:', error));

    loadUsage();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clearSelectedImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setIsReplacingImage(false);
  };

  const handleDeleteImageClick = async () => {
    try {
      setIsBusyWithImage(true);
      // Primera llamada sin confirmar: el backend avisa si quitar la imagen
      // también sacaría a la categoría de las destacadas.
      const response = await categoriesService.deleteImage(uuid, false);

      if (response.requiresConfirmation) {
        setDeleteImageModal({ isOpen: true, message: response.message });
        return;
      }

      if (response.category) {
        setCategory(response.category);
        fillForm(response.category);
      }
      toast.success(t('imageDeleteSuccess'));
      await loadUsage();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error instanceof Error ? error.message : t('imageDeleteError'));
    } finally {
      setIsBusyWithImage(false);
    }
  };

  const handleDeleteImageConfirm = async () => {
    try {
      setIsBusyWithImage(true);
      const response = await categoriesService.deleteImage(uuid, true);

      if (response.category) {
        setCategory(response.category);
        fillForm(response.category);
      }
      setDeleteImageModal({ isOpen: false });
      toast.success(t('imageDeleteSuccess'));
      await loadUsage();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error(error instanceof Error ? error.message : t('imageDeleteError'));
    } finally {
      setIsBusyWithImage(false);
    }
  };

  const handleFeaturedToggle = (checked: boolean, onChange: (value: boolean) => void) => {
    if (!checked) {
      onChange(false);
      return;
    }

    if (category?.image || imageFile) {
      onChange(true);
      return;
    }

    // Destacar sin imagen: se pide la imagen en el mismo gesto.
    setFeaturedImageModalOpen(true);
  };

  const handleFeaturedImageUpload = async (file: File) => {
    try {
      setIsBusyWithImage(true);
      const updated = await categoriesService.update(uuid, { isFeatured: true }, file);

      setCategory(updated);
      setValue('isFeatured', true);
      setFeaturedImageModalOpen(false);
      toast.success(t('imageUploadedAndFeatured'));
      await loadUsage();
    } catch (error) {
      console.error('Error uploading image for featured category:', error);
      toast.error(error instanceof Error ? error.message : t('imageUploadError'));
      throw error;
    } finally {
      setIsBusyWithImage(false);
    }
  };

  const save = async (data: CategoryFormData) => {
    if (!category) return;

    await categoriesService.update(
      uuid,
      {
        // El nombre viene del ERP cuando la categoría está sincronizada.
        ...(category.externalCode == null ? { name: data.name } : {}),
        customName: data.customName || null,
        slug: data.slug,
        description: data.description || undefined,
        visible: data.visible,
        isFeatured: data.isFeatured,
      },
      imageFile || undefined
    );

    if (data.parentUuid !== initialParentUuid) {
      await categoriesService.assignParent(uuid, {
        parentUuid: data.parentUuid || null,
      });
    }

    toast.success(t('updateSuccess'));
    router.push('/admin/dashboard/categories');
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!category) return;

    if (data.isFeatured && !category.image && !imageFile) {
      setError('isFeatured', { type: 'manual', message: t('imageRequiredForFeatured') });
      toast.error(t('imageRequiredForFeatured'));
      return;
    }
    if (slugStatus === 'taken') {
      setError('slug', {
        type: 'manual',
        message: t('slugTakenBy', { name: slugTakenBy ?? '' }),
      });
      return;
    }

    // Mover de padre reordena el menú y las migas de pan: se confirma aparte.
    if (data.parentUuid !== initialParentUuid) {
      setMoveParentModalOpen(true);
      return;
    }

    try {
      await save(data);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error instanceof Error ? error.message : t('updateError'));
    }
  };

  const handleMoveConfirm = handleSubmit(async (data) => {
    try {
      setMoveParentModalOpen(false);
      await save(data);
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(error instanceof Error ? error.message : t('updateError'));
    }
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-brand-600" />
          <p className="text-sm text-sand-700">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!category) {
    return <div className="p-8 text-center text-sand-700">{t('noCategories')}</div>;
  }

  const children = usage?.children ?? [];
  const hasChildren = children.length > 0 || (category.childrens?.length ?? 0) > 0;
  const displayName = category.customName ?? category.name;
  const noFeaturedSlots =
    !!stats && !category.isFeatured && stats.featured >= stats.featuredSlots;

  const inputClass = (hasError: boolean) =>
    `mt-1.5 block w-full rounded-lg border px-3 py-2.5 text-[13.5px] text-ink outline-none transition-colors ${
      hasError
        ? 'border-danger-500 focus:border-danger-500'
        : 'border-sand-300 focus:border-brand-400'
    }`;

  return (
    <div className="w-full max-w-full space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/dashboard/categories"
            aria-label={t('backToList')}
            className="rounded-lg p-2 text-sand-700 transition-colors hover:bg-sand-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="font-display text-2xl font-bold text-ink md:text-3xl">
              {displayName}
            </h1>
            <p className="mt-0.5 font-mono text-[12px] text-sand-600">
              /categorias/{category.slug}
            </p>
          </div>
        </div>

        <Link
          href={`/productos?categoria=${category.uuid}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-sand-300 bg-white px-3.5 py-2.5 text-sm font-medium text-sand-800 transition-colors hover:bg-sand-50"
        >
          <ExternalLink className="h-4 w-4" />
          {t('viewInStore')}
        </Link>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]"
      >
        <div className="space-y-5 rounded-xl border border-sand-300 bg-white p-5 md:p-6">
          {/* Nombre oficial — bloqueado cuando lo administra el ERP */}
          <div>
            <label htmlFor="name" className="text-[13px] font-semibold text-ink">
              {t('nameLabel')} <span className="text-danger-600">*</span>
            </label>
            {category.externalCode != null ? (
              <>
                <input
                  type="text"
                  id="name"
                  value={category.name}
                  readOnly
                  className="mt-1.5 block w-full cursor-not-allowed rounded-lg border border-sand-300 bg-sand-100 px-3 py-2.5 text-[13.5px] text-sand-700"
                />
                <p className="mt-1.5 flex items-start gap-1.5 text-[12px] leading-relaxed text-accent-700">
                  <Lock className="mt-0.5 h-3 w-3 flex-none" />
                  {t('nameFromErp')}
                </p>
              </>
            ) : (
              <>
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
                {errors.name && (
                  <p className="mt-1 text-[12.5px] font-medium text-danger-600">
                    {errors.name.message}
                  </p>
                )}
              </>
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
                  pattern: {
                    value: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
                    message: t('slugInvalidHelp'),
                  },
                })}
                className="w-full bg-transparent font-mono text-[12.5px] text-ink outline-none"
              />
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-sand-600">
              {t('slugChangeWarning')}
            </p>
            {errors.slug && (
              <p className="mt-1 text-[12.5px] font-medium text-danger-600">
                {errors.slug.message}
              </p>
            )}
          </div>

          {/* Categoría padre — bloqueada mientras tenga subcategorías */}
          <div>
            <span className="text-[13px] font-semibold text-ink">
              {t('parentCategoryLabel')}
            </span>

            {hasChildren ? (
              <>
                <div className="mt-1.5 flex items-center justify-between rounded-lg border border-sand-300 bg-sand-100 px-3 py-2.5">
                  <span className="text-[13.5px] text-sand-700">
                    {category.parent?.customName ??
                      category.parent?.name ??
                      t('noParentShort')}
                  </span>
                  <Lock className="h-3.5 w-3.5 flex-none text-sand-500" />
                </div>
                <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-accent-200 bg-accent-50 px-3 py-2.5 text-[12.5px] leading-relaxed text-accent-700">
                  <Info className="mt-0.5 h-3.5 w-3.5 flex-none" />
                  <span>
                    {t('cannotMoveHasChildren', {
                      count: children.length || category.childrens?.length || 0,
                    })}
                  </span>
                </p>

                {children.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-sand-700">
                      {t('subcategories')}
                    </p>
                    <ul className="mt-1.5 divide-y divide-sand-200 rounded-lg border border-sand-300">
                      {children.map((child) => (
                        <li
                          key={child.uuid}
                          className="flex items-center justify-between gap-3 px-3 py-2.5"
                        >
                          <span className="truncate text-[12.5px] text-sand-800">
                            {t('subcategoryLine', {
                              name: child.name,
                              count: child.productCount,
                            })}
                          </span>
                          <Link
                            href={`/admin/dashboard/categories/${child.uuid}`}
                            className="flex-none text-[12.5px] font-semibold text-brand-600 hover:text-brand-700"
                          >
                            {t('open')}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <>
                <select
                  id="parentUuid"
                  {...register('parentUuid')}
                  className={inputClass(false)}
                >
                  <option value="">{t('noParent')}</option>
                  {parentCategories.map((cat) => (
                    <option key={cat.uuid} value={cat.uuid}>
                      {cat.customName ?? cat.name}
                    </option>
                  ))}
                </select>
                <p className="mt-1.5 text-[12px] text-sand-600">
                  {t('parentCategoryHelp')}
                </p>
                {parentUuidValue !== initialParentUuid && (
                  <p className="mt-2 text-[12.5px] font-medium text-brand-600">
                    {parentUuidValue ? t('willBeMoved') : t('willBecomeRoot')}
                  </p>
                )}
              </>
            )}
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

        <div className="space-y-4">
          {/* Imagen actual o zona de carga */}
          <div className="rounded-xl border border-sand-300 bg-white p-5">
            {category.image && !isReplacingImage && !imagePreview ? (
              <CurrentImagePanel
                image={category.image}
                name={displayName}
                isFeatured={category.isFeatured}
                isBusy={isBusyWithImage}
                onReplace={() => setIsReplacingImage(true)}
                onDelete={handleDeleteImageClick}
              />
            ) : (
              <>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-semibold text-ink">
                    {category.image ? t('replaceImage') : t('imageLabel')}
                  </span>
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
                      <p className="text-[12px] text-sand-600">
                        {t('imageSavedOnSubmit')}
                      </p>
                      <button
                        type="button"
                        onClick={clearSelectedImage}
                        className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-danger-600 hover:text-danger-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t('removeSelectedImage')}
                      </button>
                    </div>
                  ) : (
                    <>
                      <ImageDropzone onSelect={handleImageSelect} disabled={isBusyWithImage} />
                      {isReplacingImage && (
                        <button
                          type="button"
                          onClick={clearSelectedImage}
                          className="mt-2 text-[12.5px] font-medium text-sand-700 hover:text-ink"
                        >
                          {t('cancel')}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </>
            )}
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
                  onChange={(checked) => handleFeaturedToggle(checked, field.onChange)}
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

          {isFeaturedValue && (
            <FeaturedChecklist
              items={[
                {
                  label: t('checkNameAndSlug'),
                  done: !!slugValue && slugStatus !== 'taken' && slugStatus !== 'invalid',
                },
                { label: t('checkImage'), done: !!category.image || !!imageFile },
                {
                  label: t('checkProducts', {
                    count: usage?.publishedProducts ?? 0,
                  }),
                  done: (usage?.publishedProducts ?? 0) > 0,
                },
              ]}
            />
          )}

          <CategoryUsagePanel usage={usage} />

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
              {isSubmitting ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </form>

      <ConfirmModal
        isOpen={deleteImageModal.isOpen}
        title={t('deleteImage')}
        message={deleteImageModal.message || t('deleteImageConfirm')}
        confirmText={t('deleteImage')}
        cancelText={t('cancel')}
        onConfirm={handleDeleteImageConfirm}
        onCancel={() => setDeleteImageModal({ isOpen: false })}
      />

      <FeaturedImageModal
        isOpen={featuredImageModalOpen}
        categoryName={displayName}
        onUpload={handleFeaturedImageUpload}
        onCancel={() => setFeaturedImageModalOpen(false)}
        isUploading={isBusyWithImage}
      />

      <MoveParentModal
        isOpen={moveParentModalOpen}
        categoryName={displayName}
        currentParent={category.parent?.customName ?? category.parent?.name ?? null}
        newParent={
          parentCategories.find((cat) => cat.uuid === parentUuidValue)?.customName ??
          parentCategories.find((cat) => cat.uuid === parentUuidValue)?.name ??
          null
        }
        productCount={usage?.totalProducts ?? 0}
        isSaving={isSubmitting}
        onConfirm={handleMoveConfirm}
        onCancel={() => setMoveParentModalOpen(false)}
      />
    </div>
  );
}
