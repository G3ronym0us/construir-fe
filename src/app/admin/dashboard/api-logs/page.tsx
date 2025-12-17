'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Activity,
  AlertCircle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  Trash2,
  Eye,
  RefreshCw,
  FileText,
} from 'lucide-react';
import { apiLogsService } from '@/services/apiLogs';
import { ApiLogDetailModal } from '@/components/admin/ApiLogDetailModal';
import { useToast } from '@/context/ToastContext';
import type { ApiLog, ApiLogStats, ApiLogFilters } from '@/types';

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

export default function ApiLogsPage() {
  const t = useTranslations('apiLogs');

  // Data state
  const [stats, setStats] = useState<ApiLogStats | null>(null);
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 50;

  // Filters
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusCodeFilter, setStatusCodeFilter] = useState('');
  const [errorsOnly, setErrorsOnly] = useState(false);
  const [pathSearch, setPathSearch] = useState('');
  const [consumerKeyFilter, setConsumerKeyFilter] = useState('');

  // Detail modal
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);

  // Cleanup modal
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleanupDays, setCleanupDays] = useState(30);
  const [cleaning, setCleaning] = useState(false);

  const { showToast } = useToast();

  // Load data
  useEffect(() => {
    loadData();
  }, [page, startDate, endDate, statusCodeFilter, errorsOnly, pathSearch, consumerKeyFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Build filters
      const filters: ApiLogFilters = {
        page,
        limit,
      };

      if (startDate) filters.startDate = startDate;
      if (endDate) filters.endDate = endDate;
      if (statusCodeFilter) filters.statusCode = parseInt(statusCodeFilter);
      if (errorsOnly) filters.isError = true;
      if (pathSearch) filters.path = pathSearch;
      if (consumerKeyFilter) filters.consumerKey = consumerKeyFilter;

      // Fetch data in parallel
      const [statsData, logsData] = await Promise.all([
        apiLogsService.getStats(),
        apiLogsService.getLogs(filters),
      ]);

      setStats(statsData);
      setLogs(logsData.data);
      setTotal(logsData.total);
    } catch (error) {
      console.error('Error loading API logs:', error);
      showToast(t('loadError'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setStatusCodeFilter('');
    setErrorsOnly(false);
    setPathSearch('');
    setConsumerKeyFilter('');
    setPage(1);
  };

  const handleViewDetails = async (log: ApiLog) => {
    try {
      // Fetch complete log details
      const fullLog = await apiLogsService.getLogByUuid(log.uuid);
      setSelectedLog(fullLog);
      setDetailModalOpen(true);
    } catch (error) {
      console.error('Error fetching log details:', error);
      showToast(t('loadError'), 'error');
    }
  };

  const handleCleanup = async () => {
    try {
      setCleaning(true);
      const result = await apiLogsService.cleanupLogs(cleanupDays);
      showToast(t('cleanup.success', { count: result.deleted }), 'success');
      setCleanupModalOpen(false);
      loadData(); // Reload data
    } catch (error) {
      console.error('Error cleaning up logs:', error);
      showToast(t('cleanup.error'), 'error');
    } finally {
      setCleaning(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-VE', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const lastPage = Math.ceil(total / limit);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">{t('title')}</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {t('refresh')}
          </button>
          <button
            onClick={() => setCleanupModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            {t('cleanup.button')}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('stats.totalRequests')}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalRequests.toLocaleString()}
                </p>
              </div>
              <Activity className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('stats.totalErrors')}</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.totalErrors.toLocaleString()}
                </p>
              </div>
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('stats.errorRate')}</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {stats.errorRate.toFixed(2)}%
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t('stats.avgResponseTime')}</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.avgResponseTime.toFixed(0)} ms
                </p>
              </div>
              <Clock className="w-10 h-10 text-green-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">{t('filters')}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('startDate')}
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('endDate')}
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('statusCode')}
            </label>
            <select
              value={statusCodeFilter}
              onChange={(e) => {
                setStatusCodeFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('allStatusCodes')}</option>
              <option value="200">{t('status2xx')}</option>
              <option value="400">{t('status4xx')}</option>
              <option value="500">{t('status5xx')}</option>
            </select>
          </div>

          {/* Path Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('pathSearch')}
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={pathSearch}
                onChange={(e) => {
                  setPathSearch(e.target.value);
                  setPage(1);
                }}
                placeholder={t('pathPlaceholder')}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Consumer Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('consumerKey')}
            </label>
            <input
              type="text"
              value={consumerKeyFilter}
              onChange={(e) => {
                setConsumerKeyFilter(e.target.value);
                setPage(1);
              }}
              placeholder={t('consumerKeyPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Errors Only Toggle */}
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={errorsOnly}
                onChange={(e) => {
                  setErrorsOnly(e.target.checked);
                  setPage(1);
                }}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{t('errorsOnly')}</span>
            </label>
          </div>
        </div>

        <div className="mt-4">
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {t('clearFilters')}
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('table.timestamp')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('table.method')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('table.path')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('table.statusCode')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('table.responseTime')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {t('table.consumerKey')}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  {t('table.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {logs.map((log) => (
                <tr key={log.uuid} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded ${getMethodColor(log.method)}`}>
                      {log.method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate" title={log.path}>
                    {log.path}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusCodeColor(log.statusCode)}`}>
                      {log.statusCode}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.responseTime} ms
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                    {log.consumerKey
                      ? (log.consumerKey.length > 15
                          ? `${log.consumerKey.substring(0, 15)}...`
                          : log.consumerKey)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleViewDetails(log)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 ml-auto"
                    >
                      <Eye className="w-4 h-4" />
                      {t('viewDetails')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {logs.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">{t('noLogs')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {total > limit && (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-white px-6 py-4 rounded-lg shadow gap-4">
          <p className="text-sm text-gray-700">
            {t('showing', {
              from: (page - 1) * limit + 1,
              to: Math.min(page * limit, total),
              total,
            })}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('previous')}
            </button>
            <button
              onClick={() => setPage(Math.min(lastPage, page + 1))}
              disabled={page >= lastPage}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('next')}
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <ApiLogDetailModal
        isOpen={detailModalOpen}
        log={selectedLog}
        onClose={() => {
          setDetailModalOpen(false);
          setSelectedLog(null);
        }}
      />

      {/* Cleanup Modal */}
      {cleanupModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/50 transition-opacity"
            onClick={() => !cleaning && setCleanupModalOpen(false)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Icon */}
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-4">
                {t('cleanup.confirmTitle')}
              </h3>

              {/* Content */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-center gap-3">
                  <label className="text-sm text-gray-700">{t('cleanup.description')}</label>
                  <input
                    type="number"
                    min={7}
                    value={cleanupDays}
                    onChange={(e) => setCleanupDays(Math.max(7, parseInt(e.target.value) || 7))}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-center"
                    disabled={cleaning}
                  />
                  <span className="text-sm text-gray-500">{t('cleanup.days')}</span>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  {t('cleanup.confirmMessage', { days: cleanupDays })}
                </p>
                <p className="text-xs text-gray-500 text-center">{t('cleanup.minDays')}</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setCleanupModalOpen(false)}
                  disabled={cleaning}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  {t('previous') === 'Anterior' ? 'Cancelar' : 'Cancel'}
                </button>
                <button
                  onClick={handleCleanup}
                  disabled={cleaning}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {cleaning && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {cleaning ? t('cleanup.cleaning') : t('cleanup.button')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
