'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import type { Banner } from '@/types';
import BannerSlide from './BannerSlide';

// Import Swiper styles
import 'swiper/css';

interface MobileCarouselProps {
  banners: Banner[];
}

export default function MobileCarousel({ banners }: MobileCarouselProps) {
  return (
    <div className="relative z-0">
      <Swiper
        modules={[Autoplay]}
        slidesPerView={1.15}
        centeredSlides={true}
        spaceBetween={16}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        loop={banners.length > 1}
        speed={500}
        className="rounded-2xl overflow-hidden"
      >
        {banners.map((banner, index) => (
          <SwiperSlide key={banner.uuid} className="h-[400px]">
            <BannerSlide banner={banner} isPriority={index === 0} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
