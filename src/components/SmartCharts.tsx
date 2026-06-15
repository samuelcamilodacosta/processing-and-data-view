'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { ColumnInfo, DatasetRow } from '@/lib/parseFile';
import { useLanguage } from '@/lib/i18n/useLanguage';

interface SmartChartsProps {
  data: DatasetRow[];
  columnInfos: ColumnInfo[];
  visibleColumns: string[];
}

const COLORS = ['#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function SmartCharts({
  data,
  columnInfos,
  visibleColumns,
}: SmartChartsProps) {
  const numericColumns = useMemo(
    () => columnInfos.filter((col) => col.type === 'number' && visibleColumns.includes(col.name)),
    [columnInfos, visibleColumns]
  );

  const categoricalColumns = useMemo(
    () => columnInfos.filter((col) => col.type === 'string' && visibleColumns.includes(col.name)),
    [columnInfos, visibleColumns]
  );

  const dateColumns = useMemo(
    () => columnInfos.filter((col) => col.type === 'date' && visibleColumns.includes(col.name)),
    [columnInfos, visibleColumns]
  );

  const { t } = useLanguage();
  const MAX_DATA_POINTS = 100;

  const charts = useMemo(() => {
    const generatedCharts: Array<{
      type: 'bar' | 'line' | 'pie' | 'area';
      title: string;
      xAxisKey?: string;
      yAxisKey?: string;
      dataKey?: string;
      data?: DatasetRow[];
    }> = [];

    if (numericColumns.length > 0 && categoricalColumns.length > 0) {
      const numCol = numericColumns[0];
      const catCol = categoricalColumns[0];

      // Aggregate data by category to avoid too many bars
      const agg: Record<string, number> = {};

      // Sample data if it's too big
      const sample = data.length > MAX_DATA_POINTS
        ? data.filter((_, i) => i % Math.ceil(data.length / MAX_DATA_POINTS) === 0)
        : data;

      sample.forEach((row) => {
        const category = String(row[catCol.name] || t.dashboard.charts.others);
        const rawValue = row[numCol.name];
        const value = typeof rawValue === 'number'
          ? rawValue
          : typeof rawValue === 'string'
          ? parseFloat(rawValue.replace(',', '.'))
          : 0;

        if (!isNaN(value)) {
          agg[category] = (agg[category] || 0) + value;
        }
      });

      const aggregatedData = Object.entries(agg)
        .map(([category, total]) => ({
          [catCol.name]: category,
          [numCol.name]: parseFloat(total.toFixed(2)),
        }))
        .sort((a, b) => (Number(b[numCol.name]) || 0) - (Number(a[numCol.name]) || 0))
        .slice(0, 20); // Limit to top 20 categories for readability

      generatedCharts.push({
        type: 'bar',
        title: `${numCol.name} ${t.dashboard.charts.by} ${catCol.name} ${t.dashboard.charts.top20}`,
        xAxisKey: catCol.name,
        yAxisKey: numCol.name,
        data: aggregatedData,
      });

      // Also add pie chart for category distribution
      generatedCharts.push({
        type: 'pie',
        title: `${t.dashboard.charts.distribution} ${numCol.name} ${t.dashboard.charts.by} ${catCol.name} ${t.dashboard.charts.top10}`,
        dataKey: numCol.name,
        data: aggregatedData.slice(0, 10),
      });
    }

    if (numericColumns.length >= 2) {
      // Sample data
      const sampledData = data.length > MAX_DATA_POINTS
        ? data.filter((_, i) => i % Math.ceil(data.length / MAX_DATA_POINTS) === 0)
        : data;

      generatedCharts.push({
        type: 'line',
        title: `${t.dashboard.charts.evolution} ${numericColumns[0].name} e ${numericColumns[1].name} ${t.dashboard.charts.sample}`,
        xAxisKey: 'index',
        yAxisKey: numericColumns[0].name,
        data: sampledData.map((row, idx) => ({ ...row, index: idx + 1 })),
      });

      generatedCharts.push({
        type: 'area',
        title: `${t.dashboard.charts.area} ${numericColumns[0].name} ${t.dashboard.charts.sample}`,
        xAxisKey: 'index',
        yAxisKey: numericColumns[0].name,
        data: sampledData.map((row, idx) => ({ ...row, index: idx + 1 })),
      });
    }

    if (dateColumns.length > 0 && numericColumns.length > 0) {
      const dateCol = dateColumns[0];
      const numCol = numericColumns[0];
      // Sort data by date
      const sortedData = [...data].sort((a, b) => {
        const dateA = new Date(String(a[dateCol.name] ?? ''));
        const dateB = new Date(String(b[dateCol.name] ?? ''));
        return dateA.getTime() - dateB.getTime();
      });
      const sampledSortedData = sortedData.length > MAX_DATA_POINTS
        ? sortedData.filter((_, i) => i % Math.ceil(sortedData.length / MAX_DATA_POINTS) === 0)
        : sortedData;

      generatedCharts.push({
        type: 'line',
        title: `${numCol.name} ${t.dashboard.charts.overTime}`,
        xAxisKey: dateCol.name,
        yAxisKey: numCol.name,
        data: sampledSortedData,
      });
    }

    if (numericColumns.length === 1) {
      const col = numericColumns[0];
      const sampledData = data.length > MAX_DATA_POINTS
        ? data.filter((_, i) => i % Math.ceil(data.length / MAX_DATA_POINTS) === 0)
        : data;

      generatedCharts.push({
        type: 'bar',
        title: `${t.dashboard.charts.distribution} ${col.name} ${t.dashboard.charts.sample}`,
        xAxisKey: 'index',
        yAxisKey: col.name,
        data: sampledData.map((row, idx) => ({ ...row, index: idx + 1 })),
      });
    }

    return generatedCharts;
  }, [numericColumns, categoricalColumns, dateColumns, data, t]);

  if (charts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-600 dark:text-gray-400">
        <p className="text-lg mb-2">{t.dashboard.charts.insufficientData}</p>
        <p className="text-sm">{t.dashboard.charts.addColumns}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {charts.map((chart, idx) => {
        const chartData = chart.data || data;

        return (
          <div key={idx} className="space-y-4 min-w-0">
            <h4 className="text-lg font-bold">{chart.title}</h4>
            <div className="h-72 min-w-0 min-h-[220px]">
              <ResponsiveContainer width="100%" height={300}>
                {chart.type === 'bar' && chart.xAxisKey && chart.yAxisKey && (
                  <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey={chart.xAxisKey}
                      tick={{ fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderColor: '#e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Bar
                      dataKey={chart.yAxisKey}
                      fill="url(#colorGradient)"
                      radius={[8, 8, 0, 0]}
                    />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#06b6d4" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                )}

                {chart.type === 'line' && chart.xAxisKey && chart.yAxisKey && (
                  <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey={chart.xAxisKey}
                      tick={{ fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderColor: '#e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={chart.yAxisKey}
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                )}

                {chart.type === 'area' && chart.xAxisKey && chart.yAxisKey && (
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.2} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey={chart.xAxisKey}
                      tick={{ fontSize: 11 }}
                      angle={-15}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderColor: '#e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={chart.yAxisKey}
                      stroke="#3b82f6"
                      fill="url(#areaGradient)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                )}

                {chart.type === 'pie' && chart.dataKey && (
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey={chart.dataKey}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white',
                        borderColor: '#e5e7eb',
                        borderRadius: '12px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        );
      })}
    </div>
  );
}
