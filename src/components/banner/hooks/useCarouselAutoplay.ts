import { useState, useEffect, useCallback } from 'react';

interface UseCarouselAutoplayOptions {
  totalSlides: number;
  interval?: number;
  enabled?: boolean;
}

interface UseCarouselAutoplayReturn {
  currentIndex: number;
  goToSlide: (index: number) => void;
  goToNext: () => void;
  goToPrevious: () => void;
}

export function useCarouselAutoplay({
  totalSlides,
  interval = 5000,
  enabled = true,
}: UseCarouselAutoplayOptions): UseCarouselAutoplayReturn {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  useEffect(() => {
    if (!enabled || totalSlides <= 1) return;

    const timer = setInterval(goToNext, interval);
    return () => clearInterval(timer);
  }, [enabled, totalSlides, interval, goToNext]);

  return {
    currentIndex,
    goToSlide,
    goToNext,
    goToPrevious,
  };
}
