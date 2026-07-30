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
    imageHeight: isCompact ? 'h-[84px] sm:h-40' : 'h-[90px] sm:h-48',
    padding: 'p-2.5 sm:p-3',
    nameSize: 'text-[12.5px] font-semibold sm:text-sm',
    priceSize: isCompact ? 'text-[15px] sm:text-base' : 'text-[15px] sm:text-lg',
    categorySize: 'text-[9px]',
    minHeight: 'min-h-[32px]',
    spacingY: 'space-y-1.5',
  };

  return {
    classes,
    isLowStock,
    isOutOfStock,
  };
}
