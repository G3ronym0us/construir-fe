'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { AlertTriangle, Copy, Check, Download } from 'lucide-react';
import { copyToClipboard, downloadAsText } from '@/lib/clipboard';
import { useToast } from '@/context/ToastContext';

interface ApiKeySecretModalProps {
  isOpen: boolean;
  consumerKey: string;
  consumerSecret: string;
  onClose: () => void;
}

export function ApiKeySecretModal({
  isOpen,
  consumerKey,
  consumerSecret,
  onClose,
}: ApiKeySecretModalProps) {
  const t = useTranslations('apiKeys');
  const toast = useToast();
  const [copiedField, setCopiedField] = useState<'key' | 'secret' | null>(null);

  // Resetear el estado cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setCopiedField(null);
    }
  }, [isOpen]);

  // Prevenir cierre con ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown, true);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isOpen]);

  const handleCopy = async (text: string, field: 'key' | 'secret') => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedField(field);
      toast.success(t('copied'));
      setTimeout(() => setCopiedField(null), 2000);
    } else {
      toast.error(t('copyError'));
    }
  };

  const handleDownload = () => {
    const content = `API Key Credentials
==================

Consumer Key: ${consumerKey}
Consumer Secret: ${consumerSecret}

Created: ${new Date().toLocaleString()}

⚠️  IMPORTANT: Keep these credentials secure and never commit them to version control.
`;
    downloadAsText(content, `api-key-${consumerKey.substring(3, 10)}.txt`);
    toast.success(t('downloadSuccess', { defaultValue: 'Credentials downloaded' }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay - no clickeable */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={(e) => e.preventDefault()}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-2xl max-w-2xl w-full p-6 animate-[modalSlide_0.3s_ease-out]">
          {/* Warning Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-yellow-100 rounded-full">
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>

          {/* Title */}
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-2">
            {t('secretModalTitle')}
          </h3>

          {/* Warning */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-bold">{t('secretModalWarningStrong')}</span>
              {t('secretModalWarning')}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 text-center mb-6">
            {t('secretModalDescription')}
          </p>

          {/* Consumer Key */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('consumerKey')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={consumerKey}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(consumerKey, 'key')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {copiedField === 'key' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('copyKey')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Consumer Secret */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('consumerSecret')}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={consumerSecret}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
              />
              <button
                onClick={() => handleCopy(consumerSecret, 'secret')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                {copiedField === 'secret' ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span className="hidden sm:inline">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('copyKey')}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              {t('downloadCredentials')}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {t('gotIt')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
