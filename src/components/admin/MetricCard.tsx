'use client';

import { ArrowUp, ArrowDown, Minus, LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  title: string;
  value: string;
  secondaryValue?: string;
  percentageChange: number;
  icon?: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
}

export default function MetricCard({
  title,
  value,
  secondaryValue,
  percentageChange,
  icon: Icon,
  iconColor = 'text-blue-600',
  iconBgColor = 'bg-blue-50',
}: MetricCardProps) {
  const isPositive = percentageChange > 0;
  const isNegative = percentageChange < 0;
  const isNeutral = percentageChange === 0;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && (
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {secondaryValue && (
          <div className="text-sm text-gray-600">{secondaryValue}</div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-1">
        {isPositive && (
          <>
            <ArrowUp className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-600">
              {percentageChange.toFixed(1)}%
            </span>
          </>
        )}
        {isNegative && (
          <>
            <ArrowDown className="w-4 h-4 text-red-600" />
            <span className="text-sm font-medium text-red-600">
              {Math.abs(percentageChange).toFixed(1)}%
            </span>
          </>
        )}
        {isNeutral && (
          <>
            <Minus className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">0%</span>
          </>
        )}
        <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
      </div>
    </div>
  );
}
