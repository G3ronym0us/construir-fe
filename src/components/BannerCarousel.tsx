'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getActiveBanners } from '@/services/banners';
import type { Banner } from '@/types';

export default function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBanners = async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data);
      } catch (err) {
        console.error('Error loading banners:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBanners();
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Cambiar cada 5 segundos

    return () => clearInterval(interval);
  }, [banners.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (loading || banners.length === 0) {
    return null;
  }

  const currentBanner = banners[currentIndex];

  const BannerContent = () => (
    <picture className="w-full h-full">
      {/* Mobile */}
      <source
        media="(max-width: 640px)"
        srcSet={currentBanner.images.mobile.webp}
        type="image/webp"
      />
      <source
        media="(max-width: 640px)"
        srcSet={currentBanner.images.mobile.jpeg}
        type="image/jpeg"
      />

      {/* Tablet */}
      <source
        media="(max-width: 1024px)"
        srcSet={currentBanner.images.tablet.webp}
        type="image/webp"
      />
      <source
        media="(max-width: 1024px)"
        srcSet={currentBanner.images.tablet.jpeg}
        type="image/jpeg"
      />

      {/* Desktop */}
      <source srcSet={currentBanner.images.desktop.webp} type="image/webp" />

      {/* Fallback */}
      <img
        src={currentBanner.images.desktop.jpeg}
        alt={currentBanner.title}
        className="w-full h-full object-cover"
      />
    </picture>
  );

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 overflow-hidden shadow-2xl">
      {/* Banner Image */}
      {currentBanner.link ? (
        <Link href={currentBanner.link} className="block w-full h-full">
          <BannerContent />
        </Link>
      ) : (
        <BannerContent />
      )}

      {/* Bottom shadow gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-black/5 to-black/20 pointer-events-none" />

      {/* Navigation Arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all"
            aria-label="Previous banner"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 backdrop-blur-sm text-white p-3 rounded-full transition-all"
            aria-label="Next banner"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
