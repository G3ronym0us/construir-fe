'use client';

import { useTranslations } from 'next-intl';
import { X, Clock, Globe, Terminal, AlertTriangle, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import type { ApiLog, ApiLogReplayResponse } from '@/types';
import { useState, useEffect } from 'react';
import { apiLogsService } from '@/services/apiLogs';

interface ApiLogDetailModalProps {
  isOpen: boolean;
  log: ApiLog | null;
  onClose: () => void;
}

// Helper to get method color
const getMethodColor = (method: string) => {
  const colors: Record<string, string> = {
    GET: 'bg-green-100 text-green-800',
    POST: 'bg-blue-100 text-blue-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    PATCH: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
  };
  return colors[method] || 'bg-gray-100 text-gray-800';
};

// Helper to get status code color
const getStatusCodeColor = (statusCode: number) => {
  if (statusCode >= 200 && statusCode < 300) {
    return 'bg-green-100 text-green-800';
  } else if (statusCode >= 400 && statusCode < 500) {
    return 'bg-yellow-100 text-yellow-800';
  } else if (statusCode >= 500) {
    return 'bg-red-100 text-red-800';
  }
  return 'bg-gray-100 text-gray-800';
};

// Collapsible JSON section
function JsonSection({
  title,
  data,
  defaultExpanded = false,
  icon: Icon
}: {
  title: string;
  data: unknown;
  defaultExpanded?: boolean;
  icon?: React.ElementType;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const t = useTranslations('apiLogs');

  if (data === null || data === undefined) {
    return null;
  }

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-gray-500" />}
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {expanded ? (
          <ChevronDown className="w-4 h-4 text-gray-500" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-500" />
        )}
      </button>
      {expanded && (
        <div className="p-4 bg-gray-900 overflow-x-auto">
          <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
            {typeof data === 'object'
              ? JSON.stringify(data, null, 2)
              : String(data) || t('detail.noData')}
          </pre>
        </div>
      )}
    </div>
  );
}

export function ApiLogDetailModal({ isOpen, log, onClose }: ApiLogDetailModalProps) {
  const t = useTranslations('apiLogs');
  const [replaying, setReplaying] = useState(false);
  const [replayResult, setReplayResult] = useState<ApiLogReplayResponse | null>(null);
  const [replayError, setReplayError] = useState<string | null>(null);

  useEffect(() => {
    setReplayResult(null);
    setReplayError(null);
  }, [log]);

  const handleReplay = async () => {
    if (!log) return;
    setReplaying(true);
    setReplayResult(null);
    setReplayError(null);
    try {
      const result = await apiLogsService.replayLog(log.uuid);
      setReplayResult(result);
    } catch (err) {
      setReplayError(err instanceof Error ? err.message : 'Error al reejecutar');
    } finally {
      setReplaying(false);
    }
  };

  if (!isOpen || !log) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-VE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl transform transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Terminal className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">{t('detail.title')}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
            {/* Request Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column - Request Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-gray-500" />
                  {t('detail.requestInfo')}
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* Method & Path */}
                  <div>
                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${getMethodColor(log.method)}`}>
                      {log.method}
                    </span>
                    <span className="ml-2 text-gray-900 font-mono text-sm break-all">{log.path}</span>
                  </div>

                  {/* Timestamp */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{formatDate(log.createdAt)}</span>
                  </div>

                  {/* Consumer Key */}
                  {log.consumerKey && (
                    <div className="text-sm">
                      <span className="text-gray-500">{t('consumerKey')}:</span>
                      <span className="ml-2 font-mono text-gray-900">{log.consumerKey}</span>
                    </div>
                  )}

                  {/* API Key Description */}
                  {log.apiKey && (
                    <div className="text-sm">
                      <span className="text-gray-500">{t('detail.apiKeyDescription')}:</span>
                      <span className="ml-2 text-gray-900">{log.apiKey.description}</span>
                    </div>
                  )}

                  {/* IP Address */}
                  {log.ipAddress && (
                    <div className="text-sm">
                      <span className="text-gray-500">{t('detail.ipAddress')}:</span>
                      <span className="ml-2 font-mono text-gray-900">{log.ipAddress}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Response Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-gray-500" />
                  {t('detail.responseInfo')}
                </h3>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  {/* Status Code */}
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex px-3 py-1 text-sm font-bold rounded-full ${getStatusCodeColor(log.statusCode)}`}>
                      {log.statusCode}
                    </span>
                    {log.isError && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        <AlertTriangle className="w-3 h-3" />
                        Error
                      </span>
                    )}
                  </div>

                  {/* Response Time */}
                  <div className="text-sm">
                    <span className="text-gray-500">{t('table.responseTime')}:</span>
                    <span className="ml-2 font-mono text-gray-900">{log.responseTime} ms</span>
                  </div>

                  {/* User Agent */}
                  {log.userAgent && (
                    <div className="text-sm">
                      <span className="text-gray-500">{t('detail.userAgent')}:</span>
                      <p className="mt-1 text-gray-700 text-xs break-all">{log.userAgent}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Error Section */}
            {log.isError && log.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-red-800">{t('detail.errorMessage')}</h4>
                    <p className="mt-1 text-sm text-red-700 break-all">{log.errorMessage}</p>
                    {log.errorStack && (
                      <details className="mt-3">
                        <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                          {t('detail.errorStack')}
                        </summary>
                        <pre className="mt-2 p-3 bg-red-100 rounded text-xs text-red-800 overflow-x-auto font-mono whitespace-pre-wrap">
                          {log.errorStack}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Collapsible Sections */}
            <div className="space-y-3">
              {/* Query Parameters */}
              {log.query && Object.keys(log.query).length > 0 && (
                <JsonSection
                  title={t('detail.query')}
                  data={log.query}
                  defaultExpanded={true}
                />
              )}

              {/* Request Headers */}
              <JsonSection
                title={t('detail.headers')}
                data={log.requestHeaders}
              />

              {/* Request Body */}
              <JsonSection
                title={`Request ${t('detail.body')}`}
                data={log.requestBody}
              />

              {/* Response Body */}
              <JsonSection
                title={`Response ${t('detail.body')}`}
                data={log.responseBody}
              />
            </div>

            {replayResult && (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 flex items-center gap-3">
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-900">Resultado del replay</span>
                  <span className={`ml-auto inline-flex px-2.5 py-0.5 text-xs font-bold rounded-full ${getStatusCodeColor(replayResult.statusCode)}`}>
                    {replayResult.statusCode}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">{replayResult.responseTime} ms</span>
                </div>
                {replayResult.body !== null && replayResult.body !== undefined && (
                  <div className="p-4 bg-gray-900 overflow-x-auto">
                    <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                      {typeof replayResult.body === 'object'
                        ? JSON.stringify(replayResult.body, null, 2)
                        : String(replayResult.body)}
                    </pre>
                  </div>
                )}
              </div>
            )}
            {replayError && (
              <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                {replayError}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between gap-3">
            <button
              onClick={handleReplay}
              disabled={replaying}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <RefreshCw className={`w-4 h-4 ${replaying ? 'animate-spin' : ''}`} aria-hidden="true" />
              {replaying ? 'Reejecutando…' : 'Reejecutar'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
