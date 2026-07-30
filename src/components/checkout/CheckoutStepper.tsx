'use client';

import { ArrowLeft, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: number;
  /** Retroceso desde la cabecera móvil: paso anterior, o salir del checkout en el primero */
  onBack?: () => void;
  /** Título propio del sub-paso, cuando un paso se reparte en varias pantallas */
  mobileTitle?: string;
  /** Avance en % para sub-pasos; por defecto se reparte a partes iguales */
  progress?: number;
}

export default function CheckoutStepper({
  steps,
  currentStep,
  onBack,
  mobileTitle,
  progress: progressOverride,
}: CheckoutStepperProps) {
  const t = useTranslations('common');
  const progress = progressOverride ?? ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="w-full">
      {/* Escritorio: pasos numerados en línea */}
      <div className="hidden px-4 py-6 md:block">
        <div className="relative flex items-start justify-between">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className="flex flex-col items-center"
              style={{ width: `${100 / steps.length}%` }}
            >
              <div className="relative z-10">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full font-bold transition-all ${
                    index < currentStep
                      ? 'bg-success-600 text-white'
                      : index === currentStep
                        ? 'bg-brand-600 text-white ring-4 ring-brand-100'
                        : 'border-2 border-sand-300 bg-white text-sand-600'
                  }`}
                >
                  {index < currentStep ? <Check className="h-5 w-5" strokeWidth={2.6} /> : step.id}
                </div>
              </div>

              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-semibold ${
                    index <= currentStep ? 'text-ink' : 'text-sand-600'
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="mt-1 text-xs text-sand-600">{step.description}</p>
                )}
              </div>

              {index < steps.length - 1 && (
                <div
                  className={`absolute top-[22px] left-1/2 -z-10 h-0.5 ${
                    index < currentStep ? 'bg-success-600' : 'bg-sand-300'
                  }`}
                  style={{ width: `calc(100% / ${steps.length})` }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Móvil: volver, título del paso y barra de avance */}
      <div className="border-b border-sand-200 px-4 pb-3 pt-[calc(0.5rem+env(safe-area-inset-top))] md:hidden">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label={t('back', { defaultValue: 'Volver' })}
              className="-ml-2.5 flex h-11 w-11 flex-none items-center justify-center rounded-lg text-ink hover:bg-sand-100"
            >
              <ArrowLeft className="h-[19px] w-[19px]" />
            </button>
          )}
          <h2 className="flex-1 font-display text-lg font-bold text-ink">
            {mobileTitle ?? steps[currentStep]?.title}
          </h2>
          <span className="flex-none text-xs font-semibold text-sand-600">
            {t('stepProgress', {
              current: currentStep + 1,
              total: steps.length,
              defaultValue: `Paso ${currentStep + 1} de ${steps.length}`,
            })}
          </span>
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-sand-200">
          <span
            className="block h-full rounded-full bg-brand-600 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
