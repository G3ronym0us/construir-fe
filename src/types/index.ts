export interface User {
  id: number;
  uuid: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order: number;
  visible: boolean;
  isFeatured: boolean;
  parent?: Category | null;
  childrens?: Category[];
  products?: Product[];
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryStats {
  total: number;
  visible: number;
  hidden: number;
}

export interface ProductImage {
  id: number;
  uuid: string;
  url: string;
  isPrimary: boolean;
  order: number;
}

export interface Product {
  id: number;
  uuid: string;
  name: string;
  sku: string;
  inventory: number;
  price: string;
  priceVes: string | null;
  categories?: {
    uuid: string;
    name: string;
    slug: string;
  }[];
  description?: string;
  shortDescription?: string;
  type?: 'simple' | 'variable';
  published: boolean;
  featured: boolean;
  visibility?: 'visible' | 'hidden' | 'catalog' | 'search';
  barcode?: string;
  tags?: string[];
  images?: ProductImage[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface CreateProductDto {
  name: string;
  sku: string;
  inventory: number;
  price: number;
  categoryUuids?: string[];
  description?: string;
  shortDescription?: string;
  type?: 'simple' | 'variable';
  published?: boolean;
  featured?: boolean;
  visibility?: 'visible' | 'hidden' | 'catalog' | 'search';
  barcode?: string;
  tags?: string[];
}

export interface UpdateProductDto {
  name?: string;
  inventory?: number;
  price?: number;
  categoryUuids?: string[];
  description?: string;
  shortDescription?: string;
  type?: 'simple' | 'variable';
  published?: boolean;
  featured?: boolean;
  visibility?: 'visible' | 'hidden' | 'catalog' | 'search';
  barcode?: string;
  tags?: string[];
}

export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
  visible?: boolean;
  isFeatured?: boolean;
}

export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
  order?: number;
  visible?: boolean;
  isFeatured?: boolean;
}

export interface AssignParentDto {
  parentUuid: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
}

export interface ProductStats {
  total: number;
  published: number;
  unpublished: number;
  featured: number;
  lowStock: number;
}

export interface ApiError {
  statusCode: number;
  message: string | string[];
  error: string;
}

// Bank types
export interface Bank {
  id: number;
  code: string;
  name: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// Identification types
export enum IdentificationType {
  V = 'V',  // Venezolano
  E = 'E',  // Extranjero
  J = 'J',  // Jurídico
  G = 'G',  // Gobierno
  P = 'P',  // Pasaporte
}

// Guest Customer types
export interface GuestCustomer {
  id: number;
  identificationType: IdentificationType;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  additionalInfo?: string;
  latitude?: number;
  longitude?: number;
  ordersCount: number;
  lastOrderDate?: string;
  createdAt: string;
  updatedAt: string;
}

// Banner types
export interface BannerImageVariants {
  desktop: {
    webp: string;
    jpeg: string;
  };
  tablet: {
    webp: string;
    jpeg: string;
  };
  mobile: {
    webp: string;
    jpeg: string;
  };
}

export interface Banner {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  isActive: boolean;
  priority: number;
  startDate?: string;
  endDate?: string;
  link?: string;
  images: BannerImageVariants;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateBannerDto {
  title: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
  link?: string;
  image?: File; // Imagen general (si no se especifican las demás)
  desktopImage?: File;
  tabletImage?: File;
  mobileImage?: File;
}

export interface UpdateBannerDto {
  title?: string;
  description?: string;
  isActive?: boolean;
  priority?: number;
  startDate?: string;
  endDate?: string;
  link?: string;
  image?: File; // Imagen general (si no se especifican las demás)
  desktopImage?: File;
  tabletImage?: File;
  mobileImage?: File;
}

// Cart types
export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: string;
  priceVes: string | null;
  subtotal: number;
  subtotalVes: number | null;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  uuid: string;
  userId: number;
  items: CartItem[];
  totalItems: number;
  subtotal: number;
  subtotalVes: number | null;
  createdAt: string;
  updatedAt: string;
}

// Local cart types (para localStorage)
export interface LocalCartItem {
  productId: number;
  quantity: number;
}

export interface LocalCart {
  items: LocalCartItem[];
}

// DTOs para el carrito
export interface AddToCartDto {
  productId: number;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

// Checkout types
export type DeliveryMethod = 'pickup' | 'delivery';

// Customer info (always required for guests)
export interface CustomerInfoDto {
  identificationType: IdentificationType;
  identificationNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

// Shipping address (only required for delivery)
export interface ShippingAddressDto {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  additionalInfo?: string;
  latitude?: number;
  longitude?: number;
}

// Deprecated: Use CustomerInfoDto and ShippingAddressDto instead
export interface ShippingAddress {
  identificationType?: IdentificationType;
  identificationNumber?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  additionalInfo?: string;
  latitude?: number;
  longitude?: number;
}

export type PaymentMethod = 'zelle' | 'pagomovil' | 'transferencia';

export interface ZellePayment {
  senderName: string;
  senderBank: string;
  receipt: File | null;
}

export interface PagoMovilPayment {
  phoneNumber: string;
  cedula: string;
  bankCode: string;
  referenceCode: string;
  receipt: File | null;
}

export interface TransferenciaPayment {
  accountName: string;
  bankCode: string;
  referenceNumber: string;
  receipt: File | null;
}

export interface CheckoutData {
  // Método de entrega
  deliveryMethod: DeliveryMethod;
  // Identificación (para guests)
  identificationType?: IdentificationType;
  identificationNumber?: string;
  // Información de envío (opcional para pickup)
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  additionalInfo?: string;
  latitude?: number;
  longitude?: number;
  // Si el usuario quiere crear cuenta después
  createAccount?: boolean;
  password?: string;
  // Método de pago
  paymentMethod: PaymentMethod;
  zellePayment?: ZellePayment;
  pagomovilPayment?: PagoMovilPayment;
  transferenciaPayment?: TransferenciaPayment;
}

// Order types
export type OrderStatus =
  | 'pending'
  | 'payment_review'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentStatus =
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'refunded';

export interface OrderItem {
  id: number;
  productId: number;
  productName: string;
  productSku: string;
  quantity: number;
  price: string;
  priceVes: string | null;
  subtotal: number;
  subtotalVes: number | null;
}

export interface PaymentInfo {
  id: number;
  method: PaymentMethod;
  status: PaymentStatus;
  receiptUrl?: string;
  details: Record<string, string>;
  verifiedAt?: string;
  verifiedBy?: number;
  adminNotes?: string;
}

export interface Order {
  id: number;
  uuid: string;
  orderNumber: string;
  userId: number;
  status: OrderStatus;
  items: OrderItem[];
  deliveryMethod: DeliveryMethod;
  shippingAddress: ShippingAddress | null;
  paymentInfo: PaymentInfo;
  subtotal: number;
  subtotalVes: number | null;
  tax: number;
  taxVes: number | null;
  shipping: number;
  shippingVes: number | null;
  discountCode?: string | null;
  discountAmount?: number;
  discountAmountVes?: number | null;
  discount?: Discount | null;
  total: number;
  totalVes: number | null;
  exchangeRate: number | null;
  totalItems: number;
  notes?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderDto {
  deliveryMethod: DeliveryMethod;
  customerInfo?: CustomerInfoDto; // Required for guests
  shippingAddress?: ShippingAddressDto; // Required for delivery
  paymentMethod: PaymentMethod;
  paymentDetails: Record<string, string>;
  discountCode?: string;
  notes?: string;
  createAccount?: boolean;
  password?: string;
  items?: Array<{
    productId: number;
    quantity: number;
  }>;
}

export interface UpdateOrderStatusDto {
  orderStatus?: OrderStatus;
  paymentStatus?: PaymentStatus;
  adminNotes?: string;
  trackingNumber?: string;
}

export interface OrderSummary {
  id: number;
  uuid: string;
  orderNumber: string;
  status: OrderStatus;
  total: number;
  totalItems: number;
  createdAt: string;
}

// Discount types
export type DiscountType = 'percentage' | 'fixed';

export interface Discount {
  id: number;
  uuid: string;
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  maxUses?: number;
  currentUses: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateDiscountDto {
  code: string;
  description?: string;
  type: DiscountType;
  value: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  maxUses?: number;
  isActive?: boolean;
}

export interface UpdateDiscountDto {
  code?: string;
  description?: string;
  type?: DiscountType;
  value?: number;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;
  startDate?: string;
  endDate?: string;
  maxUses?: number;
  isActive?: boolean;
}

export interface ValidateDiscountDto {
  code: string;
  orderTotal: number;
}

export interface ValidateDiscountResponse {
  valid: boolean;
  discount?: {
    uuid: string;
    code: string;
    description?: string;
    type: DiscountType;
    value: number;
    discountAmount: number;
    discountAmountVes?: number;
    finalTotal: number;
  };
  error?: string;
}

export interface DiscountStats {
  total: number;
  active: number;
  inactive: number;
  expired: number;
  maxedOut: number;
}

// Exchange Rate types
export interface ExchangeRate {
  id: number;
  date: string;
  rate: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

// Customer types
export type CustomerType = 'registered' | 'guest';

export interface CustomerResponseDto {
  id: string;
  type: CustomerType;
  name: string;
  email: string;
  phone: string | null;
  identification: string | null;
  totalOrders: number;
  totalSpent: number;
  totalSpentVes: number;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
  createdAt: string;
}

export interface CustomerListResponseDto {
  data: CustomerResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CustomerDetailResponseDto {
  customer: {
    id: string;
    type: CustomerType;
    name: string;
    email: string;
    phone: string | null;
    identification: string | null;
    createdAt: string;
  };
  stats: {
    totalOrders: number;
    totalSpentUSD: number;
    totalSpentVES: number;
    averageOrderValue: number;
    firstOrderDate: string | null;
    lastOrderDate: string | null;
  };
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    date: string;
    total: number;
    status: string;
  }>;
  addresses: Array<{
    address: string;
    city: string;
    state: string;
    postalCode: string;
    usedInOrders: number;
  }>;
}
