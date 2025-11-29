interface UseProductCardVariantOptions {
  variant: 'default' | 'compact';
  inventory: number;
}

interface UseProductCardVariantReturn {
  classes: {
    imageHeight: string;
    padding: string;
    nameSize: string;
    priceSize: string;
    categorySize: string;
    minHeight: string;
    spacingY: string;
  };
  isLowStock: boolean;
  isOutOfStock: boolean;
}

export function useProductCardVariant({
  variant,
  inventory,
}: UseProductCardVariantOptions): UseProductCardVariantReturn {
  const isCompact = variant === 'compact';
  const isLowStock = inventory > 0 && inventory <= 5;
  const isOutOfStock = inventory === 0;

  const classes = {
    imageHeight: isCompact ? 'h-48 sm:h-56' : 'h-64',
    padding: isCompact ? 'p-2 sm:p-3' : 'p-4',
    nameSize: isCompact ? 'text-xs sm:text-sm font-medium' : 'text-sm sm:text-base font-semibold',
    priceSize: isCompact ? 'text-lg sm:text-2xl' : 'text-2xl',
    categorySize: 'text-xs',
    minHeight: isCompact ? 'min-h-[32px] sm:min-h-[40px]' : 'min-h-[40px]',
    spacingY: isCompact ? 'space-y-2' : 'space-y-3',
  };

  return {
    classes,
    isLowStock,
    isOutOfStock,
  };
}
