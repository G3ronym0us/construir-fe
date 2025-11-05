'use client';

import { Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Step {
  id: number;
  title: string;
  description?: string;
}

interface CheckoutStepperProps {
  steps: Step[];
  currentStep: number;
}

export default function CheckoutStepper({ steps, currentStep }: CheckoutStepperProps) {
  const t = useTranslations('common');

  return (
    <div className="w-full px-4 py-6">
      {/* Desktop Stepper - Horizontal */}
      <div className="hidden md:block">
        <div className="flex items-start justify-between relative">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center" style={{ width: `${100 / steps.length}%` }}>
              {/* Step Circle */}
              <div className="relative z-10">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all shadow-sm
                    ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                        : 'bg-white border-2 border-gray-300 text-gray-400'
                    }
                  `}
                >
                  {index < currentStep ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="text-lg">{step.id}</span>
                  )}
                </div>
              </div>

              {/* Step Label */}
              <div className="mt-3 text-center">
                <p
                  className={`text-sm font-medium ${
                    index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p
                    className={`text-xs mt-1 ${
                      index <= currentStep ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {step.description}
                  </p>
                )}
              </div>

              {/* Connector Line - positioned absolutely */}
              {index < steps.length - 1 && (
                <div
                  className="absolute top-6 left-1/2 h-0.5 -z-10"
                  style={{
                    width: `calc(100% / ${steps.length})`,
                    backgroundColor: index < currentStep ? '#10b981' : '#e5e7eb'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Stepper - Compact with dots */}
      <div className="md:hidden">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              {t('stepProgress', { current: currentStep + 1, total: steps.length, defaultValue: `Step ${currentStep + 1} of ${steps.length}` })}
            </span>
            <span className="text-sm text-gray-500">
              {Math.round(((currentStep + 1) / steps.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Current Step Info */}
        <div className="text-center py-2">
          <h3 className="text-lg font-semibold text-gray-900">
            {steps[currentStep]?.title}
          </h3>
          {steps[currentStep]?.description && (
            <p className="text-sm text-gray-600 mt-1">
              {steps[currentStep].description}
            </p>
          )}
        </div>

        {/* Step Dots */}
        <div className="flex items-center justify-center gap-2 mt-4">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`
                h-2 rounded-full transition-all duration-300
                ${index === currentStep ? 'w-8 bg-blue-600' : 'w-2'}
                ${index < currentStep ? 'bg-green-500' : ''}
                ${index > currentStep ? 'bg-gray-300' : ''}
              `}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
