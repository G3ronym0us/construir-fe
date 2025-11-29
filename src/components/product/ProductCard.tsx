"use client";

import Link from "next/link";
import type { Product } from "@/types";
import { parsePrice } from "@/lib/currency";
import { useProductCardVariant } from "./hooks/useProductCardVariant";
import ProductCardImage from "./ProductCardImage";
import ProductCardContent from "./ProductCardContent";

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact';
  showAddToCart?: boolean;
  showBadges?: boolean;
  showSku?: boolean;
  showDescription?: boolean;
  showStock?: boolean;
  priority?: boolean;
}

export default function ProductCard({
  product,
  variant = 'default',
  showAddToCart = false,
  showBadges = true,
  showSku = false,
  showDescription = true,
  showStock = true,
  priority = false
}: ProductCardProps) {
  const primaryImage = product.images?.find((img) => img.isPrimary);
  const imageUrl = primaryImage?.url || "/placeholder-product.png";
  const priceUSD = parsePrice(product.price);
  const priceVES = product.priceVes ? parsePrice(product.priceVes) : null;

  const { classes, isLowStock, isOutOfStock } = useProductCardVariant({
    variant,
    inventory: product.inventory,
  });

  return (
    <Link
      href={`/productos/${product.uuid}`}
      className="block group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
    >
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
    </Link>
  );
}
