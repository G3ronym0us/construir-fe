
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import { Loader2, Package } from "lucide-react";
import { getProducts } from "@/services/products";
import { ordersService } from "@/services/orders";
import { discountsService } from "@/services/discounts";

import CheckoutStepper from "@/components/checkout/CheckoutStepper";
import Step1ContactInfo from "@/components/checkout/steps/Step1ContactInfo";
import Step2DeliveryMethod from "@/components/checkout/steps/Step2DeliveryMethod";
import Step3Location from "@/components/checkout/steps/Step3Location";
import Step4Payment from "@/components/checkout/steps/Step4Payment";
import DiscountCodeInput from "@/components/checkout/DiscountCodeInput";
import type { CheckoutData, Product, PaymentMethod, ZellePayment, PagoMovilPayment, TransferenciaPayment, CreateOrderDto, DeliveryMethod } from "@/types";

export default function CheckoutPage() {
  const router = useRouter();
  const t = useTranslations('checkout');

  const { user } = useAuth();
  const { cart, localCart, getTotalItems } = useCart();

  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [locationMethod, setLocationMethod] = useState<'manual' | 'auto' | 'map'>('manual');
  const [currentStep, setCurrentStep] = useState(0);

  // Discount state
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const toast = useToast();

  // React Hook Form
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<CheckoutData>({
    defaultValues: {
      deliveryMethod: 'pickup',
      guestEmail: "",
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      country: "Venezuela",
      additionalInfo: "",
      latitude: undefined,
      longitude: undefined,
      createAccount: false,
      password: "",
      paymentMethod: 'zelle',
    }
  });

  // Watch para observar cambios en deliveryMethod y otros campos
  const deliveryMethod = watch('deliveryMethod');
  const createAccount = watch('createAccount');
  const paymentMethod = watch('paymentMethod');
  const latitude = watch('latitude');
  const longitude = watch('longitude');

  const [zellePayment, setZellePayment] = useState<ZellePayment>({
    senderName: "",
    senderBank: "",
    receipt: null,
  });

  const [pagomovilPayment, setPagomovilPayment] = useState<PagoMovilPayment>({
    phoneNumber: "",
    cedula: "",
    bankCode: "",
    referenceCode: "",
    receipt: null,
  });

  const [transferenciaPayment, setTransferenciaPayment] = useState<TransferenciaPayment>({
    accountName: "",
    bankCode: "",
    referenceNumber: "",
    receipt: null,
  });

  const isAuthenticated = !!user;

  // Definir los pasos dinámicamente según el método de entrega
  const getSteps = () => {
    const baseSteps = [
      { id: 1, title: t('stepContact', { defaultValue: 'Contacto' }), description: t('stepContactDesc', { defaultValue: 'Información de contacto' }) },
      { id: 2, title: t('stepDelivery', { defaultValue: 'Entrega' }), description: t('stepDeliveryDesc', { defaultValue: 'Método de entrega' }) },
    ];

    // Solo agregar paso de ubicación si es delivery
    if (deliveryMethod === 'delivery') {
      baseSteps.push({
        id: 3,
        title: t('stepLocation', { defaultValue: 'Ubicación' }),
        description: t('stepLocationDesc', { defaultValue: 'Dirección de envío' })
      });
    }

    baseSteps.push({
      id: baseSteps.length + 1,
      title: t('stepPayment', { defaultValue: 'Pago' }),
      description: t('stepPaymentDesc', { defaultValue: 'Método de pago' })
    });

    return baseSteps;
  };

  const steps = getSteps();

  // Funciones de navegación
  const handleNext = () => {
    // Validar el paso actual antes de avanzar
    if (currentStep === 0) {
      // Validar contacto
      const firstName = watch('firstName');
      const lastName = watch('lastName');
      const email = watch('email');
      const phone = watch('phone');

      if (!firstName || !lastName || !email || !phone) {
        toast.error(t('errors.completeContact', { defaultValue: 'Por favor completa todos los campos de contacto' }));
        return;
      }
    }

    if (currentStep === 1 && deliveryMethod === 'delivery') {
      // Si es delivery, ir al paso de ubicación
      setCurrentStep(2);
      return;
    }

    if (currentStep === 1 && deliveryMethod === 'pickup') {
      // Si es pickup, saltar directo a pago
      setCurrentStep(steps.length - 1);
      return;
    }

    if (currentStep === 2 && deliveryMethod === 'delivery') {
      // Validar ubicación
      if (locationMethod === 'manual') {
        const address = watch('address');
        const city = watch('city');
        const zipCode = watch('zipCode');
        if (!address || !city || !zipCode) {
          toast.error(t('errors.completeAddress', { defaultValue: 'Por favor completa la dirección' }));
          return;
        }
      } else {
        if (!latitude || !longitude) {
          toast.error(t('errors.selectLocation', { defaultValue: 'Por favor selecciona tu ubicación' }));
          return;
        }
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    if (currentStep === steps.length - 1 && deliveryMethod === 'pickup') {
      // Si estamos en pago y es pickup, volver al paso de método de entrega
      setCurrentStep(1);
      return;
    }

    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Cargar productos para carrito local
  useEffect(() => {
    const loadLocalCartProducts = async () => {
      try {
        setLoadingProducts(true);
        const productIds = localCart.items.map((item) => item.productId);
        const response = await getProducts({ page: 1, limit: 100, published: true });
        const matchedProducts = response.data.filter((p) => productIds.includes(p.id));
        setProducts(matchedProducts);
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoadingProducts(false);
      }
    };

    if (!isAuthenticated && localCart.items.length > 0) {
      loadLocalCartProducts();
    } else {
      setLoadingProducts(false);
    }
  }, [isAuthenticated, localCart]);

  // Calcular items y subtotal
  const enrichedLocalItems = localCart.items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
      };
    })
    .filter(Boolean);

  const items = isAuthenticated ? cart?.items || [] : enrichedLocalItems;
  const subtotal = isAuthenticated
    ? cart?.subtotal || 0
    : enrichedLocalItems.reduce((acc, item) => {
        if (!item) return acc;
        return acc + parseFloat(item.product.price) * item.quantity;
      }, 0);

  const shipping = 0; // TODO: Calcular envío
  const tax = subtotal * 0.16; // IVA 16%
  const total = subtotal + shipping + tax - discountAmount;

  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setValue('paymentMethod', method);
  };

  const handleApplyDiscount = async (code: string) => {
    setIsApplyingDiscount(true);
    setDiscountError(null);
    try {
      const response = await discountsService.validate({ code, orderTotal: subtotal });
      if (response.valid && response.discount) {
        setDiscountAmount(response.discount.discountAmount);
        setDiscountCode(code);
        toast.success(t('discountApplied'));
      } else {
        setDiscountAmount(0);
        setDiscountCode(null);
        setDiscountError(response.error || t('errors.invalidDiscount'));
      }
    } catch (error) {
      setDiscountAmount(0);
      setDiscountCode(null);
      if (error instanceof Error) {
        setDiscountError(error.message);
      } else {
        setDiscountError(t('errors.invalidDiscount'));
      }
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const validatePaymentData = (): boolean => {
    if (paymentMethod === 'zelle') {
      if (!zellePayment.senderName || !zellePayment.senderBank || !zellePayment.receipt) {
        alert("Por favor completa todos los campos del pago Zelle");
        return false;
      }
    } else if (paymentMethod === 'pagomovil') {
      if (!pagomovilPayment.phoneNumber || !pagomovilPayment.cedula ||
          !pagomovilPayment.bankCode || !pagomovilPayment.referenceCode ||
          !pagomovilPayment.receipt) {
        alert("Por favor completa todos los campos del Pago Móvil");
        return false;
      }
    } else if (paymentMethod === 'transferencia') {
      if (!transferenciaPayment.accountName || !transferenciaPayment.bankCode ||
          !transferenciaPayment.referenceNumber || !transferenciaPayment.receipt) {
        alert("Por favor completa todos los campos de la Transferencia");
        return false;
      }
    }

    return true;
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setValue('latitude', position.coords.latitude);
          setValue('longitude', position.coords.longitude);
          // Cambiar automáticamente al método 'map' para mostrar la ubicación
          setLocationMethod('map');
          toast.success(t('locationReceived'));
        },
        (error) => {
          console.error('Error getting location:', error);
          toast.error('No se pudo obtener la ubicación');
        }
      );
    } else {
      toast.error('Tu navegador no soporta geolocalización');
    }
  };

  const handleMapLocationSelect = (lat: number, lng: number) => {
    setValue('latitude', lat);
    setValue('longitude', lng);
    // No mostrar toast aquí porque se actualiza automáticamente en tiempo real
  };

  const onSubmit = async (formData: CheckoutData) => {
    // Validaciones básicas según el método de entrega
    if (formData.deliveryMethod === 'delivery') {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
        toast.error(t('errors.allFieldsRequired'));
        return;
      }

      // Validar según el método de ubicación
      if (locationMethod === 'manual') {
        // Método manual: requiere dirección completa
        if (!formData.address || !formData.city || !formData.zipCode) {
          toast.error(t('errors.addressRequired'));
          return;
        }
      } else {
        // Métodos automático o mapa: requiere coordenadas
        if (!formData.latitude || !formData.longitude) {
          toast.error('Por favor selecciona tu ubicación en el mapa o usa la ubicación automática');
          return;
        }
      }
    }

    if (!isAuthenticated && formData.createAccount && !formData.password) {
      toast.error(t('errors.passwordRequired'));
      return;
    }

    // Validar datos de pago
    if (!validatePaymentData()) {
      return;
    }

    try {
      setLoading(true);

      // Preparar detalles de pago según el método
      let paymentDetails: Record<string, string> = {};
      let receiptFile: File | null = null;

      if (formData.paymentMethod === 'zelle') {
        paymentDetails = {
          senderName: zellePayment.senderName,
          senderBank: zellePayment.senderBank,
        };
        receiptFile = zellePayment.receipt;
      } else if (formData.paymentMethod === 'pagomovil') {
        paymentDetails = {
          phoneNumber: pagomovilPayment.phoneNumber,
          cedula: pagomovilPayment.cedula,
          bankCode: pagomovilPayment.bankCode,
          referenceCode: pagomovilPayment.referenceCode,
        };
        receiptFile = pagomovilPayment.receipt;
      } else if (formData.paymentMethod === 'transferencia') {
        paymentDetails = {
          accountName: transferenciaPayment.accountName,
          transferBankCode: transferenciaPayment.bankCode,
          referenceNumber: transferenciaPayment.referenceNumber,
        };
        receiptFile = transferenciaPayment.receipt;
      }

      // Preparar DTO para crear orden
      const createOrderDto: CreateOrderDto = {
        deliveryMethod: formData.deliveryMethod,
        // Email para guest con pickup
        ...(formData.deliveryMethod === 'pickup' && !isAuthenticated ? {
          guestEmail: formData.guestEmail,
        } : {}),
        // Dirección solo si es delivery
        ...(formData.deliveryMethod === 'delivery' ? {
          shippingAddress: {
            firstName: formData.firstName!,
            lastName: formData.lastName!,
            email: formData.email!,
            phone: formData.phone!,
            // Solo incluir dirección completa si es método manual
            ...(locationMethod === 'manual' ? {
              address: formData.address!,
              city: formData.city!,
              state: formData.state!,
              zipCode: formData.zipCode!,
              country: formData.country || 'Venezuela',
            } : {
              // Para métodos automático y mapa, enviar campos vacíos o valores por defecto
              address: 'Coordenadas GPS',
              city: 'Por GPS',
              state: 'Por GPS',
              zipCode: '0000',
              country: 'Venezuela',
            }),
            additionalInfo: formData.additionalInfo,
            ...(formData.latitude && formData.longitude ? {
              latitude: formData.latitude,
              longitude: formData.longitude,
            } : {}),
          },
        } : {}),
        paymentMethod: formData.paymentMethod,
        paymentDetails,
        // Solo enviar createAccount y password si el usuario quiere crear cuenta
        ...(formData.createAccount && formData.password ? {
          createAccount: true,
          password: formData.password,
        } : {}),
        // Si es guest, enviar items del carrito local
        ...(!isAuthenticated ? {
          items: localCart.items,
        } : {}),
        discountCode: discountCode || undefined,
      };

      // Crear la orden
      const order = await ordersService.createOrder(createOrderDto);

      // Subir el comprobante de pago
      if (receiptFile) {
        await ordersService.uploadReceipt(order.id, receiptFile);
      }

      // Redirigir a confirmación
      router.push("/checkout/confirmacion");
    } catch (error) {
      console.error("Error processing checkout:", error);

      // Mostrar mensaje de error más específico
      let errorMessage = "Error al procesar la orden. Intenta nuevamente.";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProducts) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          {t('title')}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            {/* Stepper */}
            <div className="bg-white rounded-lg shadow-sm mb-6">
              <CheckoutStepper steps={steps} currentStep={currentStep} />
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg p-4 md:p-6 space-y-6">
              {/* Paso 1: Información de Contacto */}
              {currentStep === 0 && (
                <Step1ContactInfo
                  register={register}
                  errors={errors}
                />
              )}

              {/* Paso 2: Método de Entrega */}
              {currentStep === 1 && (
                <Step2DeliveryMethod
                  deliveryMethod={deliveryMethod}
                  onChange={(method) => setValue('deliveryMethod', method)}
                />
              )}

              {/* Paso 3: Ubicación (solo si es delivery) */}
              {currentStep === 2 && deliveryMethod === 'delivery' && (
                <Step3Location
                  register={register}
                  errors={errors}
                  locationMethod={locationMethod}
                  onLocationMethodChange={setLocationMethod}
                  latitude={latitude}
                  longitude={longitude}
                  onGetLocation={handleGetLocation}
                  onMapLocationSelect={handleMapLocationSelect}
                />
              )}

              {/* Paso 4: Pago */}
              {currentStep === steps.length - 1 && (
                <Step4Payment
                  register={register}
                  errors={errors}
                  paymentMethod={paymentMethod}
                  onPaymentMethodChange={handlePaymentMethodChange}
                  zellePayment={zellePayment}
                  onZelleChange={setZellePayment}
                  pagomovilPayment={pagomovilPayment}
                  onPagomovilChange={setPagomovilPayment}
                  transferenciaPayment={transferenciaPayment}
                  onTransferenciaChange={setTransferenciaPayment}
                  total={total}
                  isAuthenticated={isAuthenticated}
                  createAccount={createAccount || false}
                />
              )}

              {/* Botones de Navegación */}
              <div className="flex justify-between pt-6 border-t">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('previous', { defaultValue: 'Anterior' })}
                </button>

                {currentStep < steps.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {t('next', { defaultValue: 'Siguiente' })}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t('processing')}
                      </>
                    ) : (
                      t('placeOrder')
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t('orderSummary')}
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  if (!item) {
                    return null;
                  }
                  return (
                    <div key={item.productId} className="flex gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                      <Package className="w-8 h-8 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Cantidad: {item.quantity}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        ${(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>

              {/* Totales */}
              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('subtotal')}:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('shipping')}:</span>
                  <span className="font-medium">
                    {shipping === 0 ? t('free') : `$${(shipping as unknown as number).toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{t('tax')} (16%):</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="font-medium">{t('discount')} ({discountCode}):</span>
                    <span className="font-medium">-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>{t('total')}:</span>
                  <span className="text-blue-600">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6">
                <DiscountCodeInput
                  onApply={handleApplyDiscount}
                  error={discountError}
                  isApplying={isApplyingDiscount}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

