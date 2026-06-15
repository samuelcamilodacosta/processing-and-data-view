'use client';

import { ColumnInfo } from '@/lib/parseFile';
import { useLanguage } from '@/lib/i18n/useLanguage';

interface ColumnExplorerProps {
  columnInfos: ColumnInfo[];
  visibleColumns: string[];
  setVisibleColumns: (cols: string[]) => void;
}

export default function ColumnExplorer({
  columnInfos,
  visibleColumns,
  setVisibleColumns,
}: ColumnExplorerProps) {
  const { t } = useLanguage();

  const toggleColumn = (colName: string) => {
    if (visibleColumns.includes(colName)) {
      setVisibleColumns(visibleColumns.filter((c) => c !== colName));
    } else {
      setVisibleColumns([...visibleColumns, colName]);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'string':
        return t.dashboard.columnExplorer.string;
      case 'number':
        return t.dashboard.columnExplorer.number;
      case 'date':
        return t.dashboard.columnExplorer.date;
      case 'boolean':
        return t.dashboard.columnExplorer.boolean;
      default:
        return type;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'string':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'number':
        return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'date':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'boolean':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
      <h3 className="text-lg font-bold mb-4">{t.dashboard.columnExplorer.title}</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {columnInfos.map((col) => (
          <div
            key={col.name}
            className={`border rounded-xl p-3 transition-all duration-200 ${
              visibleColumns.includes(col.name)
                ? 'border-primary-300 bg-primary-50 dark:border-primary-700 dark:bg-primary-950/30'
                : 'border-gray-200 bg-gray-50 dark:border-slate-600 dark:bg-slate-900 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm">{col.name}</span>
              <button
                onClick={() => toggleColumn(col.name)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                  visibleColumns.includes(col.name)
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-500'
                }`}
              >
                {visibleColumns.includes(col.name) && (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full font-medium ${getTypeBadgeColor(col.type)}`}>
                {getTypeLabel(col.type)}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {col.uniqueCount} {t.dashboard.columnExplorer.uniqueValues}
              </span>
              {col.missingCount > 0 && (
                <span className="text-warning-600 dark:text-warning-400">
                  {col.missingCount} {t.dashboard.columnExplorer.missing}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
