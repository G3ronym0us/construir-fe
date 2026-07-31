"use client";

import BannerCarousel from "@/components/banner/BannerCarousel";
import CategoryChips from "@/components/CategoryChips";
import FeaturedCategories from "@/components/FeaturedCategories";
import FeaturedProducts from "@/components/FeaturedProducts";

export default function Home() {
  return (
    <div className="min-h-screen bg-white pb-6">
      {/* Categorías rápidas sobre el pliegue */}
      <div className="px-4 pt-3 sm:px-6 lg:px-8">
        <CategoryChips className="-mx-4 px-4 sm:mx-0 sm:px-0" />
      </div>

      {/* Banner promocional */}
      <div className="mt-3 sm:mt-5">
        <BannerCarousel />
      </div>

      {/* Categorías destacadas */}
      <FeaturedCategories />

      {/* Más vendidos */}
      <FeaturedProducts />
    </div>
  );
}
