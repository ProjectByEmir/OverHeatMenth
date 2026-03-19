import { useMemo, useRef, useEffect } from 'react'
import { Line } from 'react-chartjs-2'
import type { HistoryPoint } from '../types'
import '../../src/utils/chartSetup'

interface MiniChartProps {
  data: HistoryPoint[]
  color?: string
  height?: number
  fill?: boolean
  yMax?: number
  label?: string
}

export function MiniChart({
  data,
  color = 'var(--accent)',
  height = 60,
  fill = true,
  yMax = 100,
  label = '',
}: MiniChartProps) {
  const labels = useMemo(() => data.map((_, i) => i.toString()), [data.length])
  const values = useMemo(() => data.map(d => d.value), [data])

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: color,
        backgroundColor: fill ? `${color}22` : 'transparent',
        borderWidth: 1.5,
        fill,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
    ],
  }), [labels, values, color, fill, label])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y.toFixed(1)}%`,
        },
        backgroundColor: 'var(--bg5)',
        titleColor: 'var(--text3)',
        bodyColor: 'var(--text)',
        borderColor: 'var(--border2)',
        borderWidth: 1,
        padding: 8,
      },
    },
    scales: {
      x: { display: false },
      y: {
        display: false,
        min: 0,
        max: yMax,
      },
    },
    interaction: { mode: 'index' as const, intersect: false },
  }), [yMax])

  return (
    <div style={{ height, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}

interface FullChartProps {
  data: HistoryPoint[]
  color?: string
  height?: number
  yMax?: number
  label?: string
  unit?: string
  formatValue?: (v: number) => string
}

export function FullChart({
  data,
  color = 'var(--accent)',
  height = 140,
  yMax = 100,
  label = '',
  unit = '%',
  formatValue,
}: FullChartProps) {
  const labels = useMemo(() => data.map((d) => {
    const date = new Date(d.time)
    return `${date.getHours().toString().padStart(2,'0')}:${date.getMinutes().toString().padStart(2,'0')}:${date.getSeconds().toString().padStart(2,'0')}`
  }), [data])
  const values = useMemo(() => data.map(d => d.value), [data])

  const chartData = useMemo(() => ({
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: color,
        backgroundColor: `${color}18`,
        borderWidth: 1.5,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color,
      },
    ],
  }), [labels, values, color, label])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 0 },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: (ctx: { parsed: { y: number } }) => {
            const v = ctx.parsed.y
            return formatValue ? formatValue(v) : `${v.toFixed(1)}${unit}`
          },
        },
        backgroundColor: 'rgba(10,10,12,0.9)',
        titleColor: '#9090a8',
        bodyColor: '#e8e8f0',
        borderColor: '#38384a',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        display: true,
        grid: { display: false },
        ticks: {
          color: '#50506a',
          font: { family: "'JetBrains Mono', monospace", size: 9 },
          maxTicksLimit: 6,
          maxRotation: 0,
        },
        border: { display: false },
      },
      y: {
        display: true,
        min: 0,
        max: yMax,
        grid: { color: '#2a2a38', lineWidth: 1 },
        ticks: {
          color: '#50506a',
          font: { family: "'JetBrains Mono', monospace", size: 9 },
          maxTicksLimit: 5,
          callback: (v: number | string) => formatValue ? formatValue(Number(v)) : `${Number(v).toFixed(0)}${unit}`,
        },
        border: { display: false },
      },
    },
    interaction: { mode: 'index' as const, intersect: false },
  }), [yMax, unit, formatValue])

  return (
    <div style={{ height, position: 'relative' }}>
      <Line data={chartData} options={options} />
    </div>
  )
}
