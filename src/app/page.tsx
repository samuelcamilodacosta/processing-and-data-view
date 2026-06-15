'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import TestDataControls from '@/components/TestDataControls';
import { ColumnInfo, DatasetInsights, DatasetRow } from '@/lib/parseFile';
import { useLanguage } from '@/lib/i18n/useLanguage';

export default function Home() {
  const [data, setData] = useState<DatasetRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [insights, setInsights] = useState<DatasetInsights | null>(null);
  const [columnInfos, setColumnInfos] = useState<ColumnInfo[]>([]);
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-2rem)] flex flex-col">
      {data.length === 0 ? (
        <div className="flex-1 flex flex-col px-4 py-8 w-full">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Visual Hero */}
            <div className="lg:col-span-7 bg-gradient-to-br from-white/60 via-sky-50 to-white/40 dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-900/80 rounded-2xl p-8 shadow-sm">
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="inline-flex items-center justify-center w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-xs font-medium text-primary-700 dark:text-primary-300">{t.home.badge}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight">
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">{t.home.title}</span>
                <span className="block text-primary-700 dark:text-primary-300">{t.home.titleHighlight}</span>
              </h1>

              <p className="text-sm text-gray-600 dark:text-gray-400 max-w-prose mb-6">{t.home.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.values(t.home.features).map((feature, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl">
                    <div className="text-2xl mb-2">{['⚡','🤖','📊','💼'][idx]}</div>
                    <div className="text-sm font-semibold mb-1">{feature.title}</div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">{feature.description}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Upload card */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="rounded-2xl p-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-md">
                <h3 className="text-lg font-bold mb-2">{t.home.uploadTitle}</h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">{t.home.uploadSubtitle}</p>

                <FileUpload
                  onDataLoaded={(newData, newColumns, newInsights, newColumnInfos) => {
                    setData(newData);
                    setColumns(newColumns);
                    setInsights(newInsights);
                    setColumnInfos(newColumnInfos);
                  }}
                />

                <div className="mt-6">
                  <TestDataControls
                    onLoadResult={(json) => {
                      setData(json.data);
                      setColumns(json.columns);
                      setInsights(json.insights);
                      setColumnInfos(json.columnInfos);
                    }}
                  />
                </div>

                <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="text-xs text-gray-600 dark:text-gray-400">{t.home.supports}</div>
                  <div className="flex gap-2">
                    {['.csv', '.xls', '.xlsx'].map((ext) => (
                      <span key={ext} className="px-2 py-1 bg-gray-50 dark:bg-slate-700 border border-gray-100 dark:border-slate-600 rounded-md text-xs font-medium">{ext}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-white/50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-700">
                <h4 className="text-sm font-semibold mb-2">{t.home.quickTipsTitle ?? 'Dicas rápidas'}</h4>
                <ul className="text-xs text-gray-600 dark:text-gray-400 list-disc ml-4 space-y-1">
                  <li>{t.home.tip1 ?? 'Arraste e solte um arquivo ou clique para selecionar.'}</li>
                  <li>{t.home.tip2 ?? 'Colunas com muitas categorias podem ser agregadas.'}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 px-4 py-6 w-full">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">{t.dashboard.title}</h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {insights?.totalRows.toLocaleString()} {t.dashboard.recordsLoaded}
                </p>
              </div>
              <button
                onClick={() => {
                  setData([]);
                  setColumns([]);
                  setInsights(null);
                  setColumnInfos([]);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl font-medium text-gray-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t.dashboard.newUpload}
              </button>
            </div>
            <Dashboard
              data={data}
              columns={columns}
              insights={insights!}
              columnInfos={columnInfos}
            />
          </div>
        </div>
      )}
    </div>
  );
}
