import React from 'react';

interface ToggleProps {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  color?: 'blue' | 'yellow' | 'green' | 'purple';
}

export function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
  disabled = false,
  color = 'blue',
}: ToggleProps) {
  const colorClasses = {
    blue: 'bg-blue-600 focus:ring-blue-500',
    yellow: 'bg-yellow-500 focus:ring-yellow-500',
    green: 'bg-green-600 focus:ring-green-500',
    purple: 'bg-purple-600 focus:ring-purple-500',
  };

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1 min-w-0 pr-4">
        <label
          htmlFor={id}
          className={`block text-sm font-medium text-gray-900 ${
            disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
          }`}
          onClick={handleClick}
        >
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          disabled
            ? 'opacity-50 cursor-not-allowed'
            : ''
        } ${
          checked
            ? colorClasses[color]
            : 'bg-gray-200'
        }`}
      >
        <span
          aria-hidden="true"
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}
