'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyButtonProps {
  text: string;
  className?: string;
}

export default function CopyButton({ text, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center justify-center p-1.5 rounded hover:bg-sand-100 transition-colors ${className}`}
      title="Copiar"
    >
      {copied ? (
        <Check className="w-4 h-4 text-success-600" />
      ) : (
        <Copy className="w-4 h-4 text-sand-700" />
      )}
    </button>
  );
}
