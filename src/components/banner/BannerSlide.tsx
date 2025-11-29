import Link from 'next/link';
import type { Banner } from '@/types';

interface BannerSlideProps {
  banner: Banner;
  isPriority?: boolean;
}

export default function BannerSlide({ banner, isPriority = false }: BannerSlideProps) {
  const slideContent = (
    <div className="relative w-full h-full">
      {/* Responsive Picture Element */}
      <picture className="w-full h-full">
        {/* Mobile */}
        <source
          media="(max-width: 640px)"
          srcSet={banner.images.mobile.webp}
          type="image/webp"
        />
        <source
          media="(max-width: 640px)"
          srcSet={banner.images.mobile.jpeg}
          type="image/jpeg"
        />

        {/* Tablet */}
        <source
          media="(max-width: 1024px)"
          srcSet={banner.images.tablet.webp}
          type="image/webp"
        />
        <source
          media="(max-width: 1024px)"
          srcSet={banner.images.tablet.jpeg}
          type="image/jpeg"
        />

        {/* Desktop */}
        <source
          srcSet={banner.images.desktop.webp}
          type="image/webp"
        />

        {/* Fallback */}
        <img
          src={banner.images.desktop.jpeg}
          alt={banner.title}
          className="w-full h-full object-cover"
          loading={isPriority ? 'eager' : 'lazy'}
        />
      </picture>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

      {/* Content Overlay (Optional) */}
      {banner.title && (
        <div className="absolute bottom-8 left-8 text-white z-10">
          <h2 className="text-2xl sm:text-3xl font-bold">{banner.title}</h2>
          {banner.description && (
            <p className="mt-2 text-base sm:text-lg">{banner.description}</p>
          )}
        </div>
      )}
    </div>
  );

  return banner.link ? (
    <Link href={banner.link} className="block w-full h-full">
      {slideContent}
    </Link>
  ) : (
    slideContent
  );
}
