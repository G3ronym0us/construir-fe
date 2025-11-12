'use client';

import { useEffect, useState, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import 'leaflet/dist/leaflet.css';

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

export default function MapPicker({ latitude, longitude, onLocationSelect }: MapPickerProps) {
  const t = useTranslations('checkout');
  const [selectedLat, setSelectedLat] = useState(latitude || 10.4806);
  const [selectedLng, setSelectedLng] = useState(longitude || -66.9036);
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const markerRef = useRef<unknown>(null);
  const mapInstanceRef = useRef<unknown>(null);

  // Asegurar que solo se renderice en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Actualizar coordenadas cuando cambien las props (ubicación automática)
  useEffect(() => {
    if (latitude !== undefined && longitude !== undefined) {
      setSelectedLat(latitude);
      setSelectedLng(longitude);
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!isClient) return;

    let L: typeof import('leaflet');
    let map: unknown;
    let marker: unknown;

    const initMap = async () => {
      // Importar Leaflet
      L = await import('leaflet');

      // Fix para los iconos de Leaflet
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Crear el mapa
      if (mapRef.current && !map) {
        map = L.map('map-container').setView([selectedLat, selectedLng], 13);
        mapInstanceRef.current = map;

        // Agregar capa de tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map as L.Map);

        // Crear marcador
        marker = L.marker([selectedLat, selectedLng]).addTo(map as L.Map);
        markerRef.current = marker;

        // Manejar clics en el mapa
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (map as any).on('click', (e: { latlng: { lat: number; lng: number } }) => {
          const { lat, lng } = e.latlng;
          setSelectedLat(lat);
          setSelectedLng(lng);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (marker as any).setLatLng([lat, lng]);
          // Actualizar inmediatamente en el padre cuando el usuario hace clic
          onLocationSelect(lat, lng);
        });
      }
    };

    initMap();

    // Cleanup
    return () => {
      if (map) {
        (map as L.Map).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [isClient]);

  // Actualizar marcador y centrar mapa cuando cambian las coordenadas
  useEffect(() => {
    if (markerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (markerRef.current as any).setLatLng([selectedLat, selectedLng]);
    }
    if (mapInstanceRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (mapInstanceRef.current as any).setView([selectedLat, selectedLng], 13);
    }
  }, [selectedLat, selectedLng]);

  const handleLatChange = (value: number) => {
    setSelectedLat(value);
    onLocationSelect(value, selectedLng);
  };

  const handleLngChange = (value: number) => {
    setSelectedLng(value);
    onLocationSelect(selectedLat, value);
  };

  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start gap-2 mb-3">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 mb-1">
              {t('mapInstructions')}
            </p>
            <p className="text-xs text-gray-600">
              Haz clic en el mapa para seleccionar tu ubicación o ingresa las coordenadas manualmente.
            </p>
          </div>
        </div>

        {/* Inputs para coordenadas manuales */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('latitude')}
            </label>
            <input
              type="number"
              step="0.000001"
              value={selectedLat}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) handleLatChange(val);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              {t('longitude')}
            </label>
            <input
              type="number"
              step="0.000001"
              value={selectedLng}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) handleLngChange(val);
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Mapa Interactivo */}
      <div className="relative h-96 rounded-lg overflow-hidden border-2 border-gray-200">
        {isClient ? (
          <div
            id="map-container"
            ref={mapRef}
            style={{ height: '100%', width: '100%' }}
          />
        ) : (
          <div className="h-full w-full bg-gray-100 flex items-center justify-center">
            <p className="text-gray-500">Cargando mapa...</p>
          </div>
        )}
      </div>

      {/* Ayuda */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-900">
          <strong>{t('tip')}:</strong> Haz clic en cualquier punto del mapa para seleccionar tu ubicación exacta. Las coordenadas se actualizan automáticamente.
        </p>
      </div>
    </div>
  );
}
