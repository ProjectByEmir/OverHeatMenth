// Format bytes to human readable
export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

// Format bytes per second
export function formatBytesPerSec(bps: number): string {
  return `${formatBytes(bps)}/s`
}

// Get color based on percentage
export function getUsageColor(pct: number): string {
  if (pct >= 90) return 'var(--red)'
  if (pct >= 70) return 'var(--orange)'
  if (pct >= 50) return 'var(--yellow)'
  return 'var(--green)'
}

// Get color based on temperature
export function getTempColor(temp: number): string {
  if (temp >= 90) return 'var(--red)'
  if (temp >= 75) return 'var(--orange)'
  if (temp >= 60) return 'var(--yellow)'
  return 'var(--green)'
}

// Format uptime seconds
export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}g ${h}s ${m}d`
  if (h > 0) return `${h}s ${m}d`
  return `${m}d`
}

// Format frequency GHz/MHz
export function formatFreq(ghz: number): string {
  if (!ghz) return '—'
  if (ghz >= 1) return `${ghz.toFixed(2)} GHz`
  return `${(ghz * 1000).toFixed(0)} MHz`
}

// Clamp value
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max)
}

// Round to fixed decimals
export function fixed(val: number, d = 1): string {
  return val?.toFixed(d) ?? '—'
}

// Format time from history
export function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getHours().toString().padStart(2,'0')}:${d.getMinutes().toString().padStart(2,'0')}:${d.getSeconds().toString().padStart(2,'0')}`
}

// Detect GPU vendor from name/vendor string
export function gpuVendorColor(vendor: string): string {
  const v = vendor.toLowerCase()
  if (v.includes('nvidia')) return '#76b900'
  if (v.includes('amd') || v.includes('radeon')) return '#ed1c24'
  if (v.includes('intel')) return '#0071c5'
  return 'var(--accent)'
}

// Format MHz
export function formatMHz(mhz: number): string {
  if (!mhz) return '—'
  return `${mhz} MHz`
}

// Format GB
export function formatGB(bytes: number, d = 1): string {
  return `${(bytes / (1024 ** 3)).toFixed(d)} GB`
}

// Process state color
export function processStateColor(state: string): string {
  switch (state?.toLowerCase()) {
    case 'running': return 'var(--green)'
    case 'sleeping': return 'var(--text3)'
    case 'stopped': return 'var(--orange)'
    case 'zombie': return 'var(--red)'
    default: return 'var(--text2)'
  }
}
