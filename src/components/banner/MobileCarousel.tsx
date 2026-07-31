'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Banner } from '@/types';
import BannerSlide from './BannerSlide';

import 'swiper/css';

interface MobileCarouselProps {
  banners: Banner[];
}

export default function MobileCarousel({ banners }: MobileCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="relative z-0">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1}
        spaceBetween={12}
        initialSlide={0}
        loop={banners.length > 1}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        onSwiper={(swiper) => {
          requestAnimationFrame(() => swiper.slideToLoop(0, 0, false));
        }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        speed={500}
        className="!px-4"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.uuid} className="h-44 overflow-hidden rounded-2xl">
            <BannerSlide banner={banner} isPriority={index === 0} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Indicadores: la activa se alarga, como en el diseño */}
      {banners.length > 1 && (
        <div className="mt-2.5 flex justify-center gap-1.5">
          {banners.map((banner, index) => (
            <span
              key={banner.uuid}
              className={`h-1 rounded-full transition-all ${
                index === activeIndex ? 'w-5 bg-brand-600' : 'w-1 bg-sand-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
