import type { Banner } from '@/types';
import BannerSlide from './BannerSlide';
import CarouselControls from './CarouselControls';
import CarouselDots from './CarouselDots';
import { useCarouselAutoplay } from './hooks/useCarouselAutoplay';

interface DesktopCarouselProps {
  banners: Banner[];
}

export default function DesktopCarousel({ banners }: DesktopCarouselProps) {
  const { currentIndex, goToSlide, goToPrevious, goToNext } = useCarouselAutoplay({
    totalSlides: banners.length,
    interval: 5000,
    enabled: true,
  });

  return (
    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gray-900 overflow-hidden shadow-2xl z-0">
      {/* Slides */}
      {banners.map((banner, index) => (
        <div
          key={banner.uuid}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          <BannerSlide banner={banner} isPriority={index === 0} />
        </div>
      ))}

      {/* Bottom shadow gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-black/5 to-black/20 pointer-events-none z-20" />

      {/* Controles - Solo si hay más de 1 banner */}
      {banners.length > 1 && (
        <>
          <CarouselControls onPrevious={goToPrevious} onNext={goToNext} />
          <CarouselDots
            total={banners.length}
            currentIndex={currentIndex}
            onSelect={goToSlide}
          />
        </>
      )}
    </div>
  );
}
