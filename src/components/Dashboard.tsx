'use client';

import { useState, useMemo } from 'react';
import SmartCharts from './SmartCharts';
import ColumnExplorer from './ColumnExplorer';
import { ColumnInfo, DatasetInsights, DatasetRow } from '@/lib/parseFile';
import { useLanguage } from '@/lib/i18n/useLanguage';

type Tab = 'overview' | 'charts' | 'data';

interface DashboardProps {
  data: DatasetRow[];
  columns: string[];
  insights: DatasetInsights;
  columnInfos: ColumnInfo[];
}

const ITEMS_PER_PAGE = 10;

export default function Dashboard({
  data,
  columns,
  insights,
  columnInfos,
}: DashboardProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [visibleColumns, setVisibleColumns] = useState<string[]>(columns);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const processedData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let rows = data.slice();

    if (term) {
      rows = rows.filter((row) =>
        visibleColumns.some((col) => {
          const v = row[col];
          return v != null && String(v).toLowerCase().includes(term);
        })
      );
    }

    if (sortColumn) {
      rows.sort((a, b) => {
        const va = a[sortColumn];
        const vb = b[sortColumn];

        const na = Number(va);
        const nb = Number(vb);
        if (!isNaN(na) && !isNaN(nb)) {
          return sortDirection === 'asc' ? na - nb : nb - na;
        }

        const sa = va == null ? '' : String(va);
        const sb = vb == null ? '' : String(vb);
        return sortDirection === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa);
      });
    }

    return rows;
  }, [data, searchTerm, sortColumn, sortDirection, visibleColumns]);

  const totalPages = Math.max(1, Math.ceil(processedData.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = processedData.slice(startIndex, endIndex);

  const numericColumnInfos = useMemo(
    () => columnInfos.filter((col) => col.type === 'number'),
    [columnInfos]
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
            currentPage === i
              ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-700'
          }`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  const getQualityColor = (score: number) => {
    if (score >= 90) return 'text-success-600 dark:text-success-400';
    if (score >= 70) return 'text-warning-600 dark:text-warning-400';
    return 'text-danger-600 dark:text-danger-400';
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-1.5 shadow-sm">
        {(['overview', 'charts', 'data'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab
                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-md'
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
            }`}
          >
            {t.dashboard.tabs[tab]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.dashboard.overview.totalRecords}
                </span>
                <span className="text-xl">📊</span>
              </div>
              <p className="text-2xl font-extrabold">
                {insights.totalRows.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.dashboard.overview.columns}
                </span>
                <span className="text-xl">📝</span>
              </div>
              <p className="text-2xl font-extrabold">
                {insights.totalColumns.toLocaleString()}
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.dashboard.overview.dataQuality}
                </span>
                <span className="text-xl">
                  {insights.dataQualityScore >= 90 ? '✅' : insights.dataQualityScore >= 70 ? '⚠️' : '❌'}
                </span>
              </div>
              <p className={`text-2xl font-extrabold ${getQualityColor(insights.dataQualityScore)}`}>
                {insights.dataQualityScore}%
              </p>
            </div>
            <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t.dashboard.overview.missingValues}
                </span>
                <span className="text-xl">📉</span>
              </div>
              <p className="text-2xl font-extrabold text-warning-600 dark:text-warning-400">
                {insights.totalMissingValues.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Numeric Columns */}
          {numericColumnInfos.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4">{t.dashboard.overview.keyMetrics}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {numericColumnInfos.slice(0, 4).map((col, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm"
                  >
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                      {col.name}
                    </p>
                    <p className="text-xl font-extrabold text-primary-600 dark:text-primary-400 mb-3">
                      {col.sum?.toLocaleString()}
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-[10px]">
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 uppercase mb-1">{t.dashboard.overview.avg}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-200">
                          {col.avg?.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 uppercase mb-1">{t.dashboard.overview.max}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-200">
                          {col.max?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 uppercase mb-1">{t.dashboard.overview.min}</p>
                        <p className="font-semibold text-gray-900 dark:text-gray-200">
                          {col.min?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Column Explorer */}
          <ColumnExplorer
            columnInfos={columnInfos}
            visibleColumns={visibleColumns}
            setVisibleColumns={setVisibleColumns}
          />
        </div>
      )}

      {activeTab === 'charts' && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-end gap-2 mb-4">
            <button
              onClick={() => {
                const container = document.getElementById('charts-container');
                if (!container) {
                  console.error('Charts container not found');
                  return;
                }
                const svgs = Array.from(container.querySelectorAll('svg')) as SVGElement[];
                if (svgs.length === 0) {
                  alert('No charts found to export');
                  return;
                }

                const tasks = svgs.map((svg) => {
                  const clone = svg.cloneNode(true) as SVGElement;
                  if (!clone.getAttribute('xmlns')) clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                  const serializer = new XMLSerializer();
                  const svgString = serializer.serializeToString(clone);
                  const rect = svg.getBoundingClientRect();
                  const width = Math.max(1, Math.round(rect.width));
                  const height = Math.max(1, Math.round(rect.height));
                  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  return new Promise<{ img: HTMLImageElement; width: number; height: number; url: string }>((resolve, reject) => {
                    const img = new Image();
                    img.onload = () => resolve({ img, width, height, url });
                    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load error')); };
                    img.src = url;
                  });
                });

                Promise.all(tasks)
                  .then((items) => {
                    const dpr = window.devicePixelRatio || 1;
                    const maxW = Math.max(...items.map((it) => it.width));
                    const totalH = items.reduce((s, it) => s + it.height, 0);
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(maxW * dpr));
                    canvas.height = Math.max(1, Math.round(totalH * dpr));
                    canvas.style.width = `${maxW}px`;
                    canvas.style.height = `${totalH}px`;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) throw new Error('Could not create canvas context');
                    ctx.scale(dpr, dpr);
                    ctx.fillStyle = window.getComputedStyle(document.body).backgroundColor || '#ffffff';
                    ctx.fillRect(0, 0, maxW, totalH);
                    let y = 0;
                    items.forEach((it) => {
                      ctx.drawImage(it.img, 0, y, it.width, it.height);
                      URL.revokeObjectURL(it.url);
                      y += it.height;
                    });
                    canvas.toBlob((blob) => {
                      if (!blob) return;
                      const a = document.createElement('a');
                      a.href = URL.createObjectURL(blob);
                      a.download = 'charts.png';
                      document.body.appendChild(a);
                      a.click();
                      a.remove();
                      URL.revokeObjectURL(a.href);
                    });
                  })
                  .catch((err) => {
                    console.error('Failed to export charts:', err);
                    alert('Failed to export charts');
                  });
              }}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:border-primary-300 dark:hover:border-primary-700"
            >
              {t.dashboard.export.exportCharts}
            </button>

            <button
              onClick={() => {
                // Export chart data (aggregate all chart datasets into one CSV)
                // Collect data from SmartCharts generated DOM (data attributes not available), so export full table data instead
                const cols = visibleColumns.length > 0 ? visibleColumns : columns;
                const rows = processedData;
                const csvRows: string[] = [];
                csvRows.push(cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(','));
                rows.forEach((row) => {
                  csvRows.push(cols.map((c) => {
                    const v = row[c] == null ? '' : String(row[c]);
                    return `"${v.replace(/"/g, '""')}"`;
                  }).join(','));
                });
                const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'charts-data.csv';
                document.body.appendChild(link);
                link.click();
                link.remove();
              }}
              className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:border-primary-300 dark:hover:border-primary-700"
            >
              {t.dashboard.export.exportChartsData}
            </button>
          </div>

          <div id="charts-container">
            <SmartCharts
              data={data}
              columnInfos={columnInfos}
              visibleColumns={visibleColumns}
            />
          </div>
        </div>
      )}

      {activeTab === 'data' && (
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="w-full sm:flex-1 flex items-center gap-3">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder={t.dashboard.data.searchPlaceholder}
                className="w-full sm:w-[520px] px-3 py-2 border rounded-md text-sm bg-white dark:bg-slate-800"
                aria-label={t.dashboard.data.searchPlaceholder}
              />

              <button
                onClick={() => {
                  // Export processedData (current filters/sorts) to CSV
                  const cols = visibleColumns.length > 0 ? visibleColumns : columns;
                  const rows = processedData;
                  const csvRows: string[] = [];
                  csvRows.push(cols.map((c) => `"${c.replace(/"/g, '""')}"`).join(','));
                  rows.forEach((row) => {
                    csvRows.push(cols.map((c) => {
                      const v = row[c] == null ? '' : String(row[c]);
                      return `"${v.replace(/"/g, '""')}"`;
                    }).join(','));
                  });
                  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
                  const link = document.createElement('a');
                  link.href = URL.createObjectURL(blob);
                  link.download = 'data-export.csv';
                  document.body.appendChild(link);
                  link.click();
                  link.remove();
                }}
                className="px-3 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:border-primary-300 dark:hover:border-primary-700"
              >
                {t.dashboard.export.exportData}
              </button>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
              {t.dashboard.data.showing} {startIndex + 1} {t.dashboard.data.to} {Math.min(endIndex, processedData.length)} {t.dashboard.data.of} {processedData.length.toLocaleString()} {t.dashboard.data.records}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                <tr>
                  {columns.map((col) => {
                    const isSorted = sortColumn === col;
                    return (
                      <th
                        key={col}
                        className={`px-4 py-3 text-left text-xs font-bold uppercase tracking-wider transition-colors duration-150 ${
                          isSorted
                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        <button
                          onClick={() => {
                            if (sortColumn === col) {
                              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                            } else {
                              setSortColumn(col);
                              setSortDirection('asc');
                            }
                            setCurrentPage(1);
                          }}
                          className="inline-flex items-center gap-2"
                          aria-label={`Sort by ${col}`}
                        >
                          <span>{col}</span>
                          <span className="text-[10px] text-gray-400">
                            {isSorted ? (sortDirection === 'asc' ? '▲' : '▼') : '↕'}
                          </span>
                        </button>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {currentData.map((row, idx) => (
                  <tr
                    key={startIndex + idx}
                    className="hover:bg-primary-50 dark:hover:bg-primary-950/20 transition-colors duration-150"
                  >
                    {columns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200"
                      >
                        {String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg font-medium text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {t.dashboard.data.previous}
              </button>

              <div className="flex items-center gap-2">{renderPageNumbers()}</div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-lg font-medium text-gray-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300"
              >
                {t.dashboard.data.next}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
