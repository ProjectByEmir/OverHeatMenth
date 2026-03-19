import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { FullChart } from './Charts'
import { formatBytes, formatBytesPerSec, fixed, getUsageColor } from '../utils/format'

export function DiskPage() {
  const { dynamicInfo, history, lang } = useStore()
  const t = translations[lang]

  if (!dynamicInfo) return (
    <div className="page" style={{ color: 'var(--text3)', padding: 32, textAlign: 'center' }}>{t.common.loading}</div>
  )

  const io = dynamicInfo.disksIO
  const partitions = dynamicInfo.fsSize

  const readSec = io?.rIO_sec ?? 0
  const writeSec = io?.wIO_sec ?? 0

  return (
    <div className="page">
      {/* IO Summary */}
      <div className="grid-4 mb-16">
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Okuma Hızı' : 'Read Speed'}</div>
          <div className="card-value" style={{ color: 'var(--cyan)', fontSize: 22 }}>{formatBytesPerSec(readSec)}</div>
          <div className="card-sub">{lang === 'tr' ? 'Anlık' : 'Current'}</div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Yazma Hızı' : 'Write Speed'}</div>
          <div className="card-value" style={{ color: 'var(--pink)', fontSize: 22 }}>{formatBytesPerSec(writeSec)}</div>
          <div className="card-sub">{lang === 'tr' ? 'Anlık' : 'Current'}</div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Toplam Okuma' : 'Total Read'}</div>
          <div className="card-value" style={{ color: 'var(--text)', fontSize: 20 }}>{formatBytes(io?.rIO ?? 0)}</div>
          <div className="card-sub">{lang === 'tr' ? 'Oturum boyunca' : 'This session'}</div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Toplam Yazma' : 'Total Write'}</div>
          <div className="card-value" style={{ color: 'var(--text)', fontSize: 20 }}>{formatBytes(io?.wIO ?? 0)}</div>
          <div className="card-sub">{lang === 'tr' ? 'Oturum boyunca' : 'This session'}</div>
        </div>
      </div>

      {/* IO Charts */}
      <div className="grid-2 mb-16" style={{ gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Okuma Geçmişi' : 'Read History'}</div>
            <span className="chip">{formatBytesPerSec(readSec)}</span>
          </div>
          <FullChart
            data={history.diskRead}
            color="var(--cyan)"
            height={120}
            yMax={Math.max(...history.diskRead.map(d => d.value), 1)}
            label="Read"
            unit=""
            formatValue={v => formatBytesPerSec(v)}
          />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Yazma Geçmişi' : 'Write History'}</div>
            <span className="chip">{formatBytesPerSec(writeSec)}</span>
          </div>
          <FullChart
            data={history.diskWrite}
            color="var(--pink)"
            height={120}
            yMax={Math.max(...history.diskWrite.map(d => d.value), 1)}
            label="Write"
            unit=""
            formatValue={v => formatBytesPerSec(v)}
          />
        </div>
      </div>

      {/* IO Detailed stats */}
      {io && (
        <div className="card mb-16">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Disk IO Detayları' : 'Disk IO Details'}</div>
          </div>
          <div className="grid-3" style={{ gap: 0 }}>
            <div>
              {[
                [lang === 'tr' ? 'Okuma İşlemi' : 'Read Ops', (io.rIO ?? 0).toLocaleString()],
                [lang === 'tr' ? 'Yazma İşlemi' : 'Write Ops', (io.wIO ?? 0).toLocaleString()],
                [lang === 'tr' ? 'Toplam İşlem' : 'Total Ops', (io.tIO ?? 0).toLocaleString()],
              ].map(([label, value]) => (
                <div key={label} className="stat-row">
                  <span className="stat-label">{label}</span>
                  <span className="stat-value mono">{value}</span>
                </div>
              ))}
            </div>
            <div>
              {[
                [lang === 'tr' ? 'Okuma Bekleme' : 'Read Wait', `${(io.rWaitTime ?? 0).toFixed(1)} ms`],
                [lang === 'tr' ? 'Yazma Bekleme' : 'Write Wait', `${(io.wWaitTime ?? 0).toFixed(1)} ms`],
                [lang === 'tr' ? 'Toplam Bekleme' : 'Total Wait', `${(io.tWaitTime ?? 0).toFixed(1)} ms`],
              ].map(([label, value]) => (
                <div key={label} className="stat-row">
                  <span className="stat-label">{label}</span>
                  <span className="stat-value mono">{value}</span>
                </div>
              ))}
            </div>
            <div>
              {[
                [lang === 'tr' ? 'Okuma Bekleme %' : 'Read Wait %', `${(io.rWaitPercent ?? 0).toFixed(1)}%`],
                [lang === 'tr' ? 'Yazma Bekleme %' : 'Write Wait %', `${(io.wWaitPercent ?? 0).toFixed(1)}%`],
                [lang === 'tr' ? 'Toplam Bekleme %' : 'Total Wait %', `${(io.tWaitPercent ?? 0).toFixed(1)}%`],
              ].map(([label, value]) => (
                <div key={label} className="stat-row">
                  <span className="stat-label">{label}</span>
                  <span className="stat-value mono">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Partitions */}
      {partitions.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Disk Bölümleri' : 'Partitions'}</div>
            <span className="chip">{partitions.length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {partitions.map((part, i) => {
              const usePct = part.use ?? 0
              const useColor = getUsageColor(usePct)
              return (
                <div key={i}>
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{part.fs}</span>
                      <span style={{ color: 'var(--text3)', fontSize: 11, marginLeft: 10 }}>{part.mount}</span>
                      <span className="chip" style={{ marginLeft: 8, fontSize: 10 }}>{part.type}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>
                        {formatBytes(part.used)} / {formatBytes(part.size)}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: useColor }}>
                        {usePct.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="progress-wrap" style={{ height: 8 }}>
                    <div className="progress-bar" style={{ width: `${usePct}%`, background: useColor }} />
                  </div>
                  <div style={{ display: 'flex', gap: 16, marginTop: 6 }}>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                      {lang === 'tr' ? 'Boş' : 'Free'}: <span className="mono" style={{ color: 'var(--text2)' }}>{formatBytes(part.available)}</span>
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text3)' }}>
                      {lang === 'tr' ? 'Toplam' : 'Total'}: <span className="mono" style={{ color: 'var(--text2)' }}>{formatBytes(part.size)}</span>
                    </span>
                    {!part.rw && <span className="badge badge-yellow">{lang === 'tr' ? 'Salt Okunur' : 'Read-only'}</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
