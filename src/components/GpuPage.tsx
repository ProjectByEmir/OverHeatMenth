import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { FullChart } from './Charts'
import { getUsageColor, getTempColor, fixed, formatBytes, gpuVendorColor, formatMHz } from '../utils/format'

export function GpuPage() {
  const { dynamicInfo, history, lang } = useStore()
  const t = translations[lang]

  if (!dynamicInfo) return (
    <div className="page" style={{ color: 'var(--text3)', padding: 32, textAlign: 'center' }}>{t.common.loading}</div>
  )

  const controllers = dynamicInfo.gpuData.controllers
  const displays = dynamicInfo.gpuData.displays

  if (controllers.length === 0) return (
    <div className="page card" style={{ color: 'var(--text3)', textAlign: 'center', padding: 48 }}>
      {t.gpu.noGpu}
    </div>
  )

  return (
    <div className="page">
      {controllers.map((gpu, idx) => {
        const vendorColor = gpuVendorColor(gpu.vendor || gpu.model)
        const gpuPct = gpu.utilizationGpu ?? 0
        const memPct = gpu.memoryTotal > 0 ? ((gpu.memoryUsed ?? 0) / gpu.memoryTotal) * 100 : 0
        const tempColor = getTempColor(gpu.temperatureGpu ?? 0)
        const gpuHistory = history.gpus[idx] ?? []

        return (
          <div key={idx} style={{ marginBottom: 20 }}>
            {/* GPU header */}
            <div className="card mb-16">
              <div className="flex items-center justify-between mb-16">
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{gpu.model || gpu.name}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span className="chip">{gpu.vendor}</span>
                    {gpu.bus && <span className="chip">{gpu.bus}</span>}
                    {gpu.driverVersion && <span className="chip">Driver {gpu.driverVersion}</span>}
                    {gpu.vram > 0 && (
                      <span className="chip" style={{ color: vendorColor, borderColor: vendorColor }}>
                        {gpu.vram} MB VRAM
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid-4">
                {/* GPU Usage */}
                <div>
                  <div className="stat-label mb-8">{t.gpu.gpuUsage}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: getUsageColor(gpuPct) }}>
                    {fixed(gpuPct)}%
                  </div>
                  <div className="progress-wrap" style={{ marginTop: 8 }}>
                    <div className="progress-bar" style={{ width: `${gpuPct}%`, background: getUsageColor(gpuPct) }} />
                  </div>
                </div>

                {/* VRAM */}
                <div>
                  <div className="stat-label mb-8">{t.gpu.memUsage}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: getUsageColor(memPct) }}>
                    {fixed(memPct)}%
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    {formatBytes((gpu.memoryUsed ?? 0) * 1024 * 1024)} / {formatBytes(gpu.memoryTotal * 1024 * 1024)}
                  </div>
                  <div className="progress-wrap" style={{ marginTop: 8 }}>
                    <div className="progress-bar" style={{ width: `${memPct}%`, background: getUsageColor(memPct) }} />
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <div className="stat-label mb-8">{t.common.temperature}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-mono)', color: tempColor }}>
                    {gpu.temperatureGpu > 0 ? `${fixed(gpu.temperatureGpu)}°C` : '—'}
                  </div>
                  {gpu.temperatureHotspot > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                      Hotspot: {gpu.temperatureHotspot.toFixed(0)}°C
                    </div>
                  )}
                </div>

                {/* Fan + Power */}
                <div>
                  <div className="stat-label mb-8">{t.common.fan} / {t.common.power}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>
                    {gpu.fanSpeed > 0 ? `${gpu.fanSpeed}%` : '—'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>
                    {gpu.powerDraw > 0 ? `${gpu.powerDraw.toFixed(0)}W` : '—'}
                    {gpu.powerLimit > 0 ? ` / ${gpu.powerLimit.toFixed(0)}W` : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* GPU History chart */}
            {gpuHistory.length > 1 && (
              <div className="card mb-16">
                <div className="card-header">
                  <div className="card-title">{lang === 'tr' ? 'GPU Kullanım Geçmişi' : 'GPU Usage History'}</div>
                  <span className="chip">{fixed(gpuPct)}%</span>
                </div>
                <FullChart data={gpuHistory} color={vendorColor} height={130} label="GPU %" />
              </div>
            )}

            {/* Clock & details */}
            <div className="grid-2" style={{ gap: 14 }}>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">{lang === 'tr' ? 'Saat Hızları' : 'Clock Speeds'}</div>
                </div>
                {[
                  [t.gpu.coreClock, gpu.clockCore > 0 ? formatMHz(gpu.clockCore) : '—'],
                  [t.gpu.memClock, gpu.clockMemory > 0 ? formatMHz(gpu.clockMemory) : '—'],
                  ['Bus', gpu.bus || '—'],
                  ['Bus Address', gpu.busAddress || '—'],
                  ['PCI ID', gpu.pciID || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="stat-row">
                    <span className="stat-label">{label}</span>
                    <span className="stat-value mono">{value}</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">{lang === 'tr' ? 'Bellek' : 'Memory'}</div>
                </div>
                {[
                  [lang === 'tr' ? 'Toplam VRAM' : 'Total VRAM', formatBytes(gpu.memoryTotal * 1024 * 1024)],
                  [lang === 'tr' ? 'Kullanılan' : 'Used', formatBytes((gpu.memoryUsed ?? 0) * 1024 * 1024)],
                  [lang === 'tr' ? 'Boş' : 'Free', formatBytes((gpu.memoryFree ?? 0) * 1024 * 1024)],
                  ['Dynamic VRAM', gpu.vramDynamic ? (lang === 'tr' ? 'Evet' : 'Yes') : (lang === 'tr' ? 'Hayır' : 'No')],
                ].map(([label, value]) => (
                  <div key={label} className="stat-row">
                    <span className="stat-label">{label}</span>
                    <span className="stat-value mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      })}

      {/* Displays */}
      {displays.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-header">
            <div className="card-title">{t.gpu.displays}</div>
            <span className="chip">{displays.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {displays.map((display, i) => (
              <div key={i} className="stat-row" style={{ alignItems: 'flex-start', padding: '10px 0' }}>
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 4 }}>
                    {display.model || `Display ${i + 1}`}
                    {display.main && <span className="badge badge-blue" style={{ marginLeft: 8 }}>Primary</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    <span className="chip">{display.currentResX}×{display.currentResY}</span>
                    {display.currentRefreshRate > 0 && (
                      <span className="chip">{display.currentRefreshRate} Hz</span>
                    )}
                    {display.connection && <span className="chip">{display.connection}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
