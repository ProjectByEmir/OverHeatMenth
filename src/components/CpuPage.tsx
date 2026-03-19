import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { FullChart, MiniChart } from './Charts'
import {
  getUsageColor,
  getTempColor,
  formatFreq,
  fixed,
  formatBytes,
} from '../utils/format'

export function CpuPage() {
  const { dynamicInfo, staticInfo, history, lang } = useStore()
  const t = translations[lang]

  if (!dynamicInfo || !staticInfo) {
    return <div className="page" style={{ color: 'var(--text3)', padding: 32, textAlign: 'center' }}>{t.common.loading}</div>
  }

  const load = dynamicInfo.cpuLoad
  const temp = dynamicInfo.cpuTemp
  const speed = dynamicInfo.cpuCurrentSpeed
  const cpu = staticInfo.cpu

  const overallPct = load.currentLoad
  const overallColor = getUsageColor(overallPct)
  const tempColor = getTempColor(temp.main ?? 0)

  return (
    <div className="page">
      {/* Top summary */}
      <div className="grid-4 mb-16">
        <div className="card">
          <div className="card-title mb-8">{t.common.usage}</div>
          <div className="card-value" style={{ color: overallColor }}>{fixed(overallPct)}%</div>
          <div className="card-sub">{lang === 'tr' ? 'Genel CPU' : 'Overall CPU'}</div>
          <div className="progress-wrap" style={{ marginTop: 10 }}>
            <div className="progress-bar" style={{ width: `${overallPct}%`, background: overallColor }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{t.common.temperature}</div>
          <div className="card-value" style={{ color: tempColor }}>
            {temp.main > 0 ? `${fixed(temp.main)}°C` : '—'}
          </div>
          <div className="card-sub">
            {lang === 'tr' ? 'Maks' : 'Max'}: {temp.max > 0 ? `${temp.max.toFixed(0)}°C` : '—'}
          </div>
          <div className="progress-wrap" style={{ marginTop: 10 }}>
            <div className="progress-bar" style={{ width: `${Math.min(temp.main ?? 0, 100)}%`, background: tempColor }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{t.common.frequency}</div>
          <div className="card-value" style={{ color: 'var(--accent2)', fontSize: 20 }}>{formatFreq(speed.avg)}</div>
          <div className="card-sub">
            {t.common.min}: {formatFreq(speed.min)} · {t.common.max}: {formatFreq(speed.max)}
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Yük Dağılımı' : 'Load Split'}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', width: 60 }}>User</span>
              <div className="progress-wrap flex-1">
                <div className="progress-bar" style={{ width: `${load.currentLoadUser}%`, background: 'var(--accent)' }} />
              </div>
              <span className="mono" style={{ fontSize: 11, width: 36, textAlign: 'right' }}>{load.currentLoadUser.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', width: 60 }}>System</span>
              <div className="progress-wrap flex-1">
                <div className="progress-bar" style={{ width: `${load.currentLoadSystem}%`, background: 'var(--orange)' }} />
              </div>
              <span className="mono" style={{ fontSize: 11, width: 36, textAlign: 'right' }}>{load.currentLoadSystem.toFixed(0)}%</span>
            </div>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', width: 60 }}>IRQ</span>
              <div className="progress-wrap flex-1">
                <div className="progress-bar" style={{ width: `${load.currentLoadIrq}%`, background: 'var(--red)' }} />
              </div>
              <span className="mono" style={{ fontSize: 11, width: 36, textAlign: 'right' }}>{load.currentLoadIrq.toFixed(1)}%</span>
            </div>
            <div className="flex items-center justify-between" style={{ gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text3)', width: 60 }}>Idle</span>
              <div className="progress-wrap flex-1">
                <div className="progress-bar" style={{ width: `${load.currentLoadIdle}%`, background: 'var(--green)' }} />
              </div>
              <span className="mono" style={{ fontSize: 11, width: 36, textAlign: 'right' }}>{load.currentLoadIdle.toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* History chart */}
      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">{t.common.history}</div>
          <span className="chip">{fixed(overallPct)}%</span>
        </div>
        <FullChart data={history.cpu} color="var(--accent)" height={140} label="CPU %" />
      </div>

      {/* Core grid */}
      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">{t.cpu.coreUsage}</div>
          <span className="chip">{load.cpus.length} {lang === 'tr' ? 'çekirdek' : 'cores'}</span>
        </div>
        <div className="core-grid">
          {load.cpus.map((core, i) => {
            const coreColor = getUsageColor(core.load)
            const coreFreq = speed.cores?.[i] ?? speed.avg
            return (
              <div key={i} className="core-card">
                <div className="core-num">
                  {lang === 'tr' ? 'Çekirdek' : 'Core'} {i}
                </div>
                <div className="core-pct" style={{ color: coreColor }}>
                  {core.load.toFixed(0)}%
                </div>
                <div className="progress-wrap">
                  <div className="progress-bar" style={{ width: `${core.load}%`, background: coreColor }} />
                </div>
                <div className="core-freq">{formatFreq(coreFreq)}</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Temperature per core */}
      {temp.cores && temp.cores.length > 0 && (
        <div className="card mb-16">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Çekirdek Sıcaklıkları' : 'Core Temperatures'}</div>
          </div>
          <div className="core-grid">
            {temp.cores.map((t_core, i) => {
              const c = getTempColor(t_core)
              return (
                <div key={i} className="core-card">
                  <div className="core-num">{lang === 'tr' ? 'Çekirdek' : 'Core'} {i}</div>
                  <div className="core-pct" style={{ color: c, fontSize: 18 }}>{t_core.toFixed(0)}°C</div>
                  <div className="progress-wrap">
                    <div className="progress-bar" style={{ width: `${Math.min(t_core, 100)}%`, background: c }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* CPU Info */}
      <div className="grid-2" style={{ gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'İşlemci Bilgisi' : 'Processor Info'}</div>
          </div>
          {[
            [lang === 'tr' ? 'Marka' : 'Brand', cpu.brand],
            [lang === 'tr' ? 'Üretici' : 'Manufacturer', cpu.manufacturer],
            [t.cpu.physicalCores, cpu.physicalCores],
            [t.cpu.logicalCores, cpu.cores],
            [t.common.socket, cpu.socket],
            [lang === 'tr' ? 'Temel Hız' : 'Base Speed', formatFreq(cpu.speed)],
            [lang === 'tr' ? 'Min Hız' : 'Min Speed', formatFreq(cpu.speedMin)],
            [lang === 'tr' ? 'Maks Hız' : 'Max Speed', formatFreq(cpu.speedMax)],
            [lang === 'tr' ? 'Sanallaştırma' : 'Virtualization', cpu.virtualization ? (lang === 'tr' ? 'Aktif' : 'Enabled') : (lang === 'tr' ? 'Pasif' : 'Disabled')],
          ].map(([label, value]) => (
            <div key={String(label)} className="stat-row">
              <span className="stat-label">{label}</span>
              <span className="stat-value mono">{String(value ?? '—')}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.common.cache}</div>
          </div>
          {[
            [t.cpu.l1Cache + ' (D)', formatBytes(cpu.cache?.l1d ?? 0)],
            [t.cpu.l1Cache + ' (I)', formatBytes(cpu.cache?.l1i ?? 0)],
            [t.cpu.l2Cache, formatBytes(cpu.cache?.l2 ?? 0)],
            [t.cpu.l3Cache, formatBytes(cpu.cache?.l3 ?? 0)],
          ].map(([label, value]) => (
            <div key={label} className="stat-row">
              <span className="stat-label">{label}</span>
              <span className="stat-value mono">{value}</span>
            </div>
          ))}

          <div className="card-header" style={{ marginTop: 16 }}>
            <div className="card-title">{lang === 'tr' ? 'Komut Setleri' : 'Instruction Sets'}</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            {cpu.flags?.split(' ').filter(Boolean).slice(0, 20).map(flag => (
              <span key={flag} className="chip" style={{ fontSize: 10 }}>{flag.toUpperCase()}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
