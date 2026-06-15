'use client';

import { useState } from 'react';
import { useLanguage } from '@/lib/i18n/useLanguage';
import { ColumnInfo, DatasetInsights, DatasetRow, parseFile } from '@/lib/parseFile';

interface Props {
  onLoadResult: (result: {
    data: DatasetRow[];
    columns: string[];
    insights: DatasetInsights;
    columnInfos: ColumnInfo[];
  }) => void;
}

export default function TestDataControls({ onLoadResult }: Props) {
  const { t } = useLanguage();
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [format, setFormat] = useState<'csv' | 'xlsx' | 'xls'>('csv');
  const [loading, setLoading] = useState(false);

  const filename = lang === 'en' ? `test_data_en.${format}` : `test_data_pt.${format}`;

  async function handleUse() {
    setLoading(true);
    try {
      const res = await fetch(`/${filename}`);
      if (!res.ok) throw new Error('Failed to fetch test file');
      const buf = await res.arrayBuffer();
      const result = parseFile(Buffer.from(buf), filename);
      onLoadResult(result);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
            </svg>
            <div>
              <div className="text-sm font-semibold">{t.home.testDataTitle}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400 max-w-[36rem]">{t.home.testDataDescription}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3">
            <label className="sr-only">Idioma</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as 'pt' | 'en')}
              className="px-2 py-1 border rounded-md bg-white dark:bg-slate-800 text-sm"
              aria-label={t.home.testDataTitle + ' language'}
            >
              <option value="pt">PT</option>
              <option value="en">EN</option>
            </select>

            <label className="sr-only">Formato</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as 'csv' | 'xlsx' | 'xls')}
              className="px-2 py-1 border rounded-md bg-white dark:bg-slate-800 text-sm"
              aria-label={t.home.testDataTitle + ' format'}
            >
              <option value="csv">CSV</option>
              <option value="xlsx">XLSX</option>
              <option value="xls">XLS</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1 w-auto items-start">
          <a
            href={`/${filename}`}
            className="w-28 sm:w-32 px-2 py-1 bg-white border border-gray-200 dark:bg-slate-800 dark:border-slate-700 rounded-md text-sm hover:bg-gray-50 text-center"
            download
            aria-label={t.home.testDataDownload}
          >
            {t.home.testDataDownload}
          </a>

          <button
            onClick={handleUse}
            disabled={loading}
            className="w-28 sm:w-32 px-2 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-60 inline-flex items-center gap-1 justify-center"
            aria-label={t.home.testDataUse}
          >
            {loading ? (
              <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
            ) : null}
            <span>{loading ? t.home.testDataLoading : t.home.testDataUse}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
