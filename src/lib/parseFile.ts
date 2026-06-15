import * as XLSX from 'xlsx';

export type ColumnType = 'number' | 'string' | 'date' | 'boolean';
export type DatasetRow = Record<string, unknown>;

export interface ColumnInfo {
  name: string;
  type: ColumnType;
  missingCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  avg?: number;
  sum?: number;
}

export interface DatasetInsights {
  totalRows: number;
  totalColumns: number;
  numericColumnsCount: number;
  categoricalColumnsCount: number;
  dateColumnsCount: number;
  totalMissingValues: number;
  dataQualityScore: number; // 0-100
  columnInfos: ColumnInfo[];
}

export interface ParseResult {
  data: DatasetRow[];
  columns: string[];
  insights: DatasetInsights;
  columnInfos: ColumnInfo[];
}

const isDate = (value: unknown): boolean => {
  if (typeof value === 'number') return false;
  if (value instanceof Date) return true;

  const dateStr = String(value);
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) !== '0001-01-01';
};

const isBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') return true;
  const str = String(value).toLowerCase().trim();
  return ['true', 'false', 'yes', 'no', '1', '0'].includes(str);
};

const isNumber = (value: unknown): boolean => {
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value !== 'string') return false;
  // Try both comma and dot as decimal separators
  const normalized = value.trim().replace(',', '.');
  return !Number.isNaN(Number(normalized));
};

function detectColumnType(data: DatasetRow[], columnName: string): ColumnType {
  const nonMissingValues = data.map(row => row[columnName]).filter(v => v != null && v !== '');

  if (nonMissingValues.length === 0) return 'string';

  const sample = nonMissingValues.slice(0, Math.min(50, nonMissingValues.length));
  const isAllDates = sample.every(v => isDate(v));
  if (isAllDates) return 'date';

  const isAllNumbers = sample.every(v => isNumber(v));
  if (isAllNumbers) return 'number';

  const isAllBooleans = sample.every(v => isBoolean(v));
  if (isAllBooleans) return 'boolean';

  return 'string';
}

function analyzeColumn(data: DatasetRow[], columnName: string, type: ColumnType): ColumnInfo {
  const values = data.map(row => row[columnName]);
  const missingCount = values.filter(v => v == null || v === '').length;
  const nonMissingValues = values.filter(v => v != null && v !== '');
  const uniqueValues = new Set(nonMissingValues.map(v => String(v)));

  const columnInfo: ColumnInfo = {
    name: columnName,
    type,
    missingCount,
    uniqueCount: uniqueValues.size,
  };
  
  if (type === 'number') {
    const numericValues = nonMissingValues
      .map(v => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
          const normalized = v.trim().replace(',', '.');
          return Number(normalized);
        }
        return null;
      })
      .filter((v): v is number => v !== null && !isNaN(v));

    if (numericValues.length > 0) {
      columnInfo.min = Math.min(...numericValues);
      columnInfo.max = Math.max(...numericValues);
      columnInfo.sum = numericValues.reduce((sum, v) => sum + v, 0);
      columnInfo.avg = columnInfo.sum / numericValues.length;
    }
  }
  
  return columnInfo;
}

export function parseFile(buffer: Buffer, filename: string): ParseResult {
  const lower = filename.toLowerCase();
  let rawData: DatasetRow[] = [];

  // CSV path (use SheetJS to parse CSV to avoid papaparse dependency)
  if (lower.endsWith('.csv')) {
    try {
      const text = new TextDecoder('utf-8', { fatal: false }).decode(buffer);
      const workbook = XLSX.read(text, { type: 'string' });
      const sheetName = workbook.SheetNames && workbook.SheetNames[0];
      if (!sheetName) throw new Error('No sheets found in CSV data');
      const sheet = workbook.Sheets[sheetName];
      const csvData = XLSX.utils.sheet_to_json<DatasetRow>(sheet, { defval: '' });

      rawData = csvData.map((row) => {
        const newRow: DatasetRow = {};
        Object.keys(row).forEach(k => {
          const key = (k || '').toString().trim();
          newRow[key] = row[k];
        });
        return newRow;
      });
    } catch (err) {
      console.error('CSV parse error:', err);
      throw new Error(`Failed to parse CSV file: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  // Excel path (.xls / .xlsx)
  else if (lower.endsWith('.xls') || lower.endsWith('.xlsx')) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames && workbook.SheetNames[0];
      if (!sheetName) {
        throw new Error('No sheets found in Excel file');
      }
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json<DatasetRow>(sheet, { defval: '' });

      // Trim header keys
      rawData = excelData.map((row) => {
        const newRow: DatasetRow = {};
        Object.keys(row).forEach(k => {
          const key = (k || '').toString().trim();
          newRow[key] = row[k];
        });
        return newRow;
      });
    } catch (err) {
      console.error('Excel parse error:', err);
      throw new Error(`Failed to parse Excel file: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    throw new Error(`File format not supported. Supported: .csv, .xls, .xlsx. Received: ${filename}`);
  }
  
  // legacy csv result checks removed (now using SheetJS)

  if (rawData.length === 0) {
    return {
      data: [],
      columns: [],
      insights: {
        totalRows: 0,
        totalColumns: 0,
        numericColumnsCount: 0,
        categoricalColumnsCount: 0,
        dateColumnsCount: 0,
        totalMissingValues: 0,
        dataQualityScore: 100,
        columnInfos: [],
      },
      columnInfos: [],
    };
  }
  
  const columns = Object.keys(rawData[0]);
  
  const columnInfos = columns.map(col => {
    const type = detectColumnType(rawData, col);
    return analyzeColumn(rawData, col, type);
  });

  let numericColumnsCount = 0;
  let categoricalColumnsCount = 0;
  let dateColumnsCount = 0;
  let totalMissingValues = 0;
  
  columnInfos.forEach(col => {
    totalMissingValues += col.missingCount;
    if (col.type === 'number') numericColumnsCount++;
    else if (col.type === 'string') categoricalColumnsCount++;
    else if (col.type === 'date') dateColumnsCount++;
  });

  const totalCells = rawData.length * columns.length;
  const dataQualityScore = totalCells > 0
    ? Math.round(((totalCells - totalMissingValues) / totalCells) * 100)
    : 100;

  const insights: DatasetInsights = {
    totalRows: rawData.length,
    totalColumns: columns.length,
    numericColumnsCount,
    categoricalColumnsCount,
    dateColumnsCount,
    totalMissingValues,
    dataQualityScore,
    columnInfos,
  };
  
  return {
    data: rawData,
    columns,
    insights,
    columnInfos,
  };
}
