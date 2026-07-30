"use client";

import type { Product } from "@/types";
import { parsePrice } from "@/lib/currency";
import { useProductCardVariant } from "./hooks/useProductCardVariant";
import ProductCardImage from "./ProductCardImage";
import ProductCardContent from "./ProductCardContent";

interface ProductCardProps {
  product: Product;
  variant?: "default" | "compact";
  showAddToCart?: boolean;
  showBadges?: boolean;
  showSku?: boolean;
  showDescription?: boolean;
  showStock?: boolean;
  priority?: boolean;
}

export default function ProductCard({
  product,
  variant = "default",
  showAddToCart = false,
  showBadges = true,
  showSku = false,
  showDescription = true,
  showStock = true,
  priority = false,
}: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary);
  const imageUrl = primaryImage?.url || "/placeholder-product.png";
  const priceUSD = parsePrice(product.priceWithIva);
  const priceVES = product.priceWithIvaVes
    ? parsePrice(product.priceWithIvaVes)
    : null;

  const { classes, isLowStock, isOutOfStock } = useProductCardVariant({
    variant,
    inventory: product.inventory,
  });

  return (
    // `relative` ancla el enlace estirado del nombre, que hace clicable la
    // tarjeta entera sin envolver los controles del carrito en un <a>.
    <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-sand-300 bg-white transition-shadow hover:shadow-[0_10px_28px_-16px_rgba(20,24,29,0.35)]">
      {/* Image Section */}
      <ProductCardImage
        imageUrl={imageUrl}
        productName={product.name}
        priority={priority}
        showBadges={showBadges}
        featured={product.featured}
        isOutOfStock={isOutOfStock}
        isLowStock={isLowStock}
        imageHeight={classes.imageHeight}
      />

      {/* Content Section */}
      <ProductCardContent
        product={product}
        variant={variant}
        classes={classes}
        showSku={showSku}
        showDescription={showDescription}
        showStock={showStock}
        showAddToCart={showAddToCart}
        priceUSD={priceUSD}
        priceVES={priceVES}
        isOutOfStock={isOutOfStock}
      />
    </div>
  );
}
