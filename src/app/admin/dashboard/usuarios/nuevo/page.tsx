'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm, Controller } from 'react-hook-form';
import { usersService } from '@/services/users';
import type { CreateUserDto, UserRole } from '@/types';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import { useToast } from '@/context/ToastContext';
import { Toggle } from '@/components/ui/Toggle';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  isActive: boolean;
}

export default function NewUserPage() {
  const t = useTranslations('users');
  const tCommon = useTranslations('common');
  const tRoles = useTranslations('roles');
  const router = useRouter();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'customer' as UserRole,
      isActive: true,
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      const createData: CreateUserDto = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        role: data.role,
        isActive: data.isActive,
      };

      await usersService.create(createData);
      toast.success(t('createSuccess'));
      router.push('/admin/dashboard/usuarios');
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(t('createError'));
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link
          href="/admin/dashboard/usuarios"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('backToList')}
        </Link>
        <h1 className="text-3xl font-bold text-gray-900">{t('newUser')}</h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* First Name */}
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
              {t('firstName')} *
            </label>
            <input
              id="firstName"
              type="text"
              {...register('firstName', {
                required: t('firstNameRequired'),
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.firstName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('firstNamePlaceholder')}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
              {t('lastName')} *
            </label>
            <input
              id="lastName"
              type="text"
              {...register('lastName', {
                required: t('lastNameRequired'),
                minLength: {
                  value: 2,
                  message: 'Mínimo 2 caracteres',
                },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.lastName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('lastNamePlaceholder')}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              {t('email')} *
            </label>
            <input
              id="email"
              type="email"
              {...register('email', {
                required: t('emailRequired'),
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: t('emailInvalid'),
                },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('emailPlaceholder')}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              {t('password')} *
            </label>
            <input
              id="password"
              type="password"
              {...register('password', {
                required: t('passwordRequired'),
                minLength: {
                  value: 6,
                  message: t('passwordMinLength'),
                },
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={t('passwordPlaceholder')}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
              {t('role')} *
            </label>
            <select
              id="role"
              {...register('role', {
                required: t('roleRequired'),
              })}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.role ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="customer">{tRoles('customer')}</option>
              <option value="order_admin">{tRoles('order_admin')}</option>
              <option value="admin">{tRoles('admin')}</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>}
          </div>

          {/* Is Active */}
          <div>
            <label className="flex items-center gap-3">
              <Controller
                name="isActive"
                control={control}
                render={({ field }) => (
                  <Toggle
                    id="isActive"
                    label=""
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              <span className="text-sm font-medium text-gray-700">{t('isActiveLabel')}</span>
            </label>
            <p className="mt-1 text-sm text-gray-500">
              Los usuarios inactivos no podrán iniciar sesión en el sistema
            </p>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/admin/dashboard/usuarios"
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
          >
            {tCommon('cancel')}
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? t('creating') : t('create')}
          </button>
        </div>
      </form>
    </div>
  );
}
