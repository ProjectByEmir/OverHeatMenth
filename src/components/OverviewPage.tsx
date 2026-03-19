import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { MiniChart } from './Charts'
import {
  formatBytes,
  formatBytesPerSec,
  getUsageColor,
  getTempColor,
  fixed,
  formatUptime,
} from '../utils/format'

function StatCard({
  label, value, sub, color, history, unit,
  onClick, yMax = 100,
}: {
  label: string
  value: string
  sub?: string
  color: string
  history: { time: number; value: number }[]
  unit?: string
  onClick?: () => void
  yMax?: number
}) {
  return (
    <div className="stat-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-card-header">
        <div className="stat-card-label">{label}</div>
      </div>
      <div className="stat-card-value" style={{ color }}>{value}</div>
      {sub && <div className="stat-card-sub">{sub}</div>}
      {history.length > 1 && (
        <MiniChart data={history} color={color} height={50} yMax={yMax} />
      )}
    </div>
  )
}

export function OverviewPage() {
  const { dynamicInfo, staticInfo, history, lang, setPage } = useStore()
  const t = translations[lang]

  if (!dynamicInfo) {
    return (
      <div className="page" style={{ color: 'var(--text3)', padding: 32, textAlign: 'center' }}>
        {t.common.loading}
      </div>
    )
  }

  const cpuPct = dynamicInfo.cpuLoad.currentLoad
  const ramPct = dynamicInfo.mem.total > 0
    ? (dynamicInfo.mem.used / dynamicInfo.mem.total) * 100
    : 0
  const temp = dynamicInfo.cpuTemp.main ?? 0
  const gpu = dynamicInfo.gpuData.controllers[0]
  const gpuPct = gpu?.utilizationGpu ?? 0

  const rxSec = dynamicInfo.networkStats?.[0]?.rx_sec ?? 0
  const txSec = dynamicInfo.networkStats?.[0]?.tx_sec ?? 0

  const diskRead = dynamicInfo.disksIO?.rIO_sec ?? 0
  const diskWrite = dynamicInfo.disksIO?.wIO_sec ?? 0

  const procs = dynamicInfo.processes

  return (
    <div className="page">
      {/* Quick stats row */}
      <div className="grid-4 mb-20">
        <StatCard
          label="CPU"
          value={`${fixed(cpuPct)}%`}
          sub={`${dynamicInfo.cpuLoad.currentLoadUser.toFixed(0)}% user · ${dynamicInfo.cpuLoad.currentLoadSystem.toFixed(0)}% sys`}
          color={getUsageColor(cpuPct)}
          history={history.cpu}
          onClick={() => setPage('cpu')}
        />
        <StatCard
          label="RAM"
          value={`${fixed(ramPct)}%`}
          sub={`${formatBytes(dynamicInfo.mem.used)} / ${formatBytes(dynamicInfo.mem.total)}`}
          color={getUsageColor(ramPct)}
          history={history.ram}
          onClick={() => setPage('memory')}
        />
        <StatCard
          label={lang === 'tr' ? 'CPU Sıcaklık' : 'CPU Temp'}
          value={temp > 0 ? `${fixed(temp)}°C` : '—'}
          sub={temp > 0 ? `${lang === 'tr' ? 'Maks' : 'Max'}: ${dynamicInfo.cpuTemp.max?.toFixed(0) ?? '—'}°C` : undefined}
          color={getTempColor(temp)}
          history={history.cpuTemp}
          yMax={120}
        />
        {gpu ? (
          <StatCard
            label="GPU"
            value={`${fixed(gpuPct)}%`}
            sub={`${formatBytes((gpu.memoryUsed ?? 0) * 1024 * 1024)} VRAM`}
            color={getUsageColor(gpuPct)}
            history={history.gpus[0] ?? []}
            onClick={() => setPage('gpu')}
          />
        ) : (
          <StatCard
            label="GPU"
            value="—"
            sub={lang === 'tr' ? 'Algılanamadı' : 'Not detected'}
            color="var(--text3)"
            history={[]}
          />
        )}
      </div>

      {/* Second row */}
      <div className="grid-4 mb-20">
        <StatCard
          label={lang === 'tr' ? 'Ağ ↓' : 'Net ↓'}
          value={formatBytesPerSec(rxSec)}
          sub={`↑ ${formatBytesPerSec(txSec)}`}
          color="var(--cyan)"
          history={history.netRx}
          yMax={Math.max(...history.netRx.map(d => d.value), 1024 * 1024)}
          onClick={() => setPage('network')}
        />
        <StatCard
          label={lang === 'tr' ? 'Disk Oku' : 'Disk Read'}
          value={formatBytesPerSec(diskRead)}
          sub={`${lang === 'tr' ? 'Yaz' : 'Write'}: ${formatBytesPerSec(diskWrite)}`}
          color="var(--pink)"
          history={history.diskRead}
          yMax={Math.max(...history.diskRead.map(d => d.value), 1)}
          onClick={() => setPage('disk')}
        />
        <div className="stat-card" onClick={() => setPage('processes')} style={{ cursor: 'pointer' }}>
          <div className="stat-card-header">
            <div className="stat-card-label">{t.common.processes}</div>
          </div>
          <div className="stat-card-value" style={{ color: 'var(--accent2)' }}>
            {procs.all}
          </div>
          <div className="stat-card-sub">
            <span style={{ color: 'var(--green)' }}>{procs.running} {t.common.running}</span>
            <span style={{ color: 'var(--text3)', margin: '0 6px' }}>·</span>
            <span style={{ color: 'var(--text3)' }}>{procs.sleeping} {t.common.sleeping}</span>
          </div>
          <div style={{ height: 50 }} />
        </div>

        {/* Battery or uptime */}
        {dynamicInfo.battery?.hasBattery ? (
          <div className="stat-card">
            <div className="stat-card-header">
              <div className="stat-card-label">{t.common.battery}</div>
            </div>
            <div className="stat-card-value" style={{ color: getUsageColor(dynamicInfo.battery.percent) }}>
              {dynamicInfo.battery.percent}%
            </div>
            <div className="stat-card-sub">
              {dynamicInfo.battery.isCharging ? t.common.charging : t.common.discharging}
              {dynamicInfo.battery.timeRemaining
                ? ` · ${Math.floor(dynamicInfo.battery.timeRemaining / 60)}h ${dynamicInfo.battery.timeRemaining % 60}m`
                : ''}
            </div>
            <div style={{ height: 50 }}>
              <div className="progress-wrap" style={{ marginTop: 16, height: 8 }}>
                <div
                  className="progress-bar"
                  style={{ width: `${dynamicInfo.battery.percent}%`, background: getUsageColor(dynamicInfo.battery.percent) }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="stat-card">
            <div className="stat-card-label">{t.common.uptime}</div>
            <div className="stat-card-value" style={{ color: 'var(--text2)', fontSize: 18, marginTop: 8 }}>
              —
            </div>
          </div>
        )}
      </div>

      {/* System overview */}
      {staticInfo && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Sistem Özeti' : 'System Summary'}</div>
          </div>
          <div className="grid-2" style={{ gap: 0 }}>
            <div>
              <div className="stat-row">
                <span className="stat-label">{lang === 'tr' ? 'İşlemci' : 'Processor'}</span>
                <span className="stat-value mono">{staticInfo.cpu.brand}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">{lang === 'tr' ? 'Çekirdek/İş Parçacığı' : 'Cores/Threads'}</span>
                <span className="stat-value mono">{staticInfo.cpu.physicalCores} / {staticInfo.cpu.cores}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">{lang === 'tr' ? 'İşletim Sistemi' : 'OS'}</span>
                <span className="stat-value mono">{staticInfo.osInfo.distro} {staticInfo.osInfo.release}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">{lang === 'tr' ? 'Bilgisayar' : 'Machine'}</span>
                <span className="stat-value mono">{staticInfo.system.manufacturer} {staticInfo.system.model}</span>
              </div>
            </div>
            <div>
              <div className="stat-row">
                <span className="stat-label">{lang === 'tr' ? 'Toplam RAM' : 'Total RAM'}</span>
                <span className="stat-value mono">{formatBytes(dynamicInfo.mem.total)}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">{lang === 'tr' ? 'Mimari' : 'Architecture'}</span>
                <span className="stat-value mono">{staticInfo.osInfo.arch}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">{lang === 'tr' ? 'Çekirdek' : 'Kernel'}</span>
                <span className="stat-value mono">{staticInfo.osInfo.kernel}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">{lang === 'tr' ? 'Ana Bilgisayar' : 'Hostname'}</span>
                <span className="stat-value mono">{staticInfo.osInfo.hostname}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
