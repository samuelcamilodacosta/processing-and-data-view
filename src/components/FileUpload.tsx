'use client';

import { useState, useRef, useCallback } from 'react';
import { ColumnInfo, DatasetInsights, DatasetRow, parseFile } from '@/lib/parseFile';
import { useLanguage } from '@/lib/i18n/useLanguage';

type UploadStage = 'idle' | 'reading' | 'parsing' | 'processing' | 'generating' | 'error';

interface FileUploadProps {
  onDataLoaded: (data: DatasetRow[], columns: string[], insights: DatasetInsights, columnInfos: ColumnInfo[]) => void;
}

export default function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [stage, setStage] = useState<UploadStage>('idle');
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;

    setFileName(file.name);
    setError(null);
    setStage('reading');

    try {
      await new Promise(resolve => setTimeout(resolve, 350));
      setStage('parsing');

      const buffer = Buffer.from(await file.arrayBuffer());

      await new Promise(resolve => setTimeout(resolve, 350));
      setStage('processing');

      const result = parseFile(buffer, file.name);

      await new Promise(resolve => setTimeout(resolve, 250));
      setStage('generating');

      await new Promise(resolve => setTimeout(resolve, 200));
      setStage('idle');

      onDataLoaded(result.data, result.columns, result.insights, result.columnInfos);
    } catch (err) {
      setStage('error');
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    }
  }, [onDataLoaded]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const getStageMessage = () => {
    switch (stage) {
      case 'reading':
        return t.upload.reading;
      case 'parsing':
        return t.upload.parsing;
      case 'processing':
        return t.upload.processing;
      case 'generating':
        return t.upload.generating;
      case 'error':
        return t.upload.error;
      default:
        return '';
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all duration-300 ease-out ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
            : 'border-gray-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-white/50 dark:hover:bg-slate-800/50'
        } ${stage !== 'idle' ? 'pointer-events-none cursor-not-allowed' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={stage !== 'idle'}
        />

        {stage === 'idle' || stage === 'error' ? (
          <>
            <div className="mb-4 relative">
              <div
                className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 transition-all duration-300 ${
                  isDragging ? 'scale-110 rotate-3' : ''
                }`}
              >
                <svg
                  className={`w-7 h-7 transition-all duration-300 ${
                    isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500 dark:text-blue-400'
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 2 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
            </div>

            <p className="text-base md:text-lg font-semibold mb-2">
              {isDragging ? t.upload.dropHere : t.upload.dragFile}
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
              {t.upload.clickToSearch}
            </p>

            {fileName && (
              <div className="mb-3 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">{fileName}</span>
              </div>
            )}

            {error && (
              <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400">
                <p className="text-sm font-medium">{error}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setError(null);
                    setStage('idle');
                  }}
                  className="text-xs underline mt-1"
                >
                  {t.upload.tryAgain}
                </button>
              </div>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t.upload.csvOrExcel}
            </p>
          </>
        ) : (
          <div className="py-4 space-y-4">
            <div className="flex justify-center">
              <div className="relative w-12 h-12">
                <div className="w-12 h-12 border-3 border-blue-200 dark:border-blue-800 rounded-full"></div>
                <div className="absolute inset-0 border-3 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
              </div>
            </div>

            <div className="space-y-2 max-w-md mx-auto">
              <p className="text-base font-semibold">{getStageMessage()}</p>

              <div className="w-full bg-blue-100 dark:bg-blue-900/30 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width:
                      stage === 'reading'
                        ? '25%'
                        : stage === 'parsing'
                        ? '50%'
                        : stage === 'processing'
                        ? '75%'
                        : '100%',
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
