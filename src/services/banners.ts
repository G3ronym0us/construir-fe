import type { Banner, CreateBannerDto, UpdateBannerDto } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
const BANNERS_ENDPOINT = '/banners';

export async function getBanners(): Promise<Banner[]> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${BANNERS_ENDPOINT}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener banners');
  }

  return response.json();
}

export async function getActiveBanners(): Promise<Banner[]> {
  const response = await fetch(`${API_URL}${BANNERS_ENDPOINT}/active`);

  if (!response.ok) {
    throw new Error('Error al obtener banners activos');
  }

  return response.json();
}

export async function getBannerByUuid(uuid: string): Promise<Banner> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${BANNERS_ENDPOINT}/${uuid}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error al obtener banner');
  }

  return response.json();
}

export async function createBanner(data: CreateBannerDto): Promise<Banner> {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  formData.append('isActive', data.isActive ? 'true' : 'false');
  formData.append('priority', data.priority?.toString() || '0');
  if (data.startDate) formData.append('startDate', new Date(data.startDate).toISOString());
  if (data.endDate) formData.append('endDate', new Date(data.endDate).toISOString());
  if (data.link) formData.append('link', data.link);

  // Si se proporciona una imagen general
  if (data.image) {
    formData.append('image', data.image);
  }

  // Si se proporcionan imágenes individuales
  if (data.desktopImage) formData.append('desktopImage', data.desktopImage);
  if (data.tabletImage) formData.append('tabletImage', data.tabletImage);
  if (data.mobileImage) formData.append('mobileImage', data.mobileImage);

  const response = await fetch(`${API_URL}${BANNERS_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al crear banner');
  }

  return response.json();
}

export async function updateBanner(uuid: string, data: UpdateBannerDto): Promise<Banner> {
  const token = localStorage.getItem('token');
  const formData = new FormData();

  if (data.title) formData.append('title', data.title);
  if (data.description) formData.append('description', data.description);
  if (data.isActive !== undefined) formData.append('isActive', data.isActive ? 'true' : 'false');
  if (data.priority !== undefined) formData.append('priority', data.priority.toString());
  if (data.startDate) formData.append('startDate', new Date(data.startDate).toISOString());
  if (data.endDate) formData.append('endDate', new Date(data.endDate).toISOString());
  if (data.link) formData.append('link', data.link);

  // Si se proporciona una imagen general
  if (data.image) formData.append('image', data.image);

  // Si se proporcionan imágenes individuales
  if (data.desktopImage) formData.append('desktopImage', data.desktopImage);
  if (data.tabletImage) formData.append('tabletImage', data.tabletImage);
  if (data.mobileImage) formData.append('mobileImage', data.mobileImage);

  const response = await fetch(`${API_URL}${BANNERS_ENDPOINT}/${uuid}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al actualizar banner');
  }

  return response.json();
}

export async function deleteBanner(uuid: string): Promise<void> {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}${BANNERS_ENDPOINT}/${uuid}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Error al eliminar banner');
  }
}
