import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { FullChart } from './Charts'
import { getUsageColor, formatBytes, fixed } from '../utils/format'

export function MemoryPage() {
  const { dynamicInfo, staticInfo, history, lang } = useStore()
  const t = translations[lang]

  if (!dynamicInfo) return (
    <div className="page" style={{ color: 'var(--text3)', padding: 32, textAlign: 'center' }}>{t.common.loading}</div>
  )

  const mem = dynamicInfo.mem
  const layout = staticInfo?.mem ?? []

  const usedPct = mem.total > 0 ? (mem.used / mem.total) * 100 : 0
  const cachedPct = mem.total > 0 ? (mem.buffcache / mem.total) * 100 : 0
  const swapPct = mem.swaptotal > 0 ? (mem.swapused / mem.swaptotal) * 100 : 0
  const usedColor = getUsageColor(usedPct)
  const swapColor = getUsageColor(swapPct)

  return (
    <div className="page">
      {/* Summary */}
      <div className="grid-4 mb-16">
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Kullanım' : 'Usage'}</div>
          <div className="card-value" style={{ color: usedColor }}>{fixed(usedPct)}%</div>
          <div className="card-sub">{formatBytes(mem.used)} / {formatBytes(mem.total)}</div>
          <div className="progress-wrap" style={{ marginTop: 10 }}>
            <div className="progress-bar" style={{ width: `${usedPct}%`, background: usedColor }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Boş' : 'Free'}</div>
          <div className="card-value" style={{ color: 'var(--green)' }}>{formatBytes(mem.available)}</div>
          <div className="card-sub">{lang === 'tr' ? 'Mevcut' : 'Available'}</div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Önbellek' : 'Cached'}</div>
          <div className="card-value" style={{ color: 'var(--cyan)', fontSize: 20 }}>{formatBytes(mem.buffcache)}</div>
          <div className="card-sub">{fixed(cachedPct)}% {lang === 'tr' ? 'toplam' : 'of total'}</div>
          <div className="progress-wrap" style={{ marginTop: 10 }}>
            <div className="progress-bar" style={{ width: `${cachedPct}%`, background: 'var(--cyan)' }} />
          </div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Takas (Swap)' : 'Swap'}</div>
          <div className="card-value" style={{ color: swapColor, fontSize: 20 }}>
            {mem.swaptotal > 0 ? `${fixed(swapPct)}%` : '—'}
          </div>
          <div className="card-sub">
            {mem.swaptotal > 0 ? `${formatBytes(mem.swapused)} / ${formatBytes(mem.swaptotal)}` : (lang === 'tr' ? 'Takas yok' : 'No swap')}
          </div>
          {mem.swaptotal > 0 && (
            <div className="progress-wrap" style={{ marginTop: 10 }}>
              <div className="progress-bar" style={{ width: `${swapPct}%`, background: swapColor }} />
            </div>
          )}
        </div>
      </div>

      {/* RAM bar visual */}
      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">{lang === 'tr' ? 'Bellek Dağılımı' : 'Memory Distribution'}</div>
          <span className="chip">{formatBytes(mem.total)} {lang === 'tr' ? 'toplam' : 'total'}</span>
        </div>
        <div style={{ display: 'flex', height: 24, borderRadius: 6, overflow: 'hidden', gap: 1, marginBottom: 12 }}>
          <div style={{ flex: mem.active, background: usedColor, transition: 'flex 0.4s ease', minWidth: 2 }} />
          <div style={{ flex: mem.buffcache, background: 'var(--cyan)', transition: 'flex 0.4s ease', minWidth: 2 }} />
          <div style={{ flex: mem.free, background: 'var(--bg4)', transition: 'flex 0.4s ease', minWidth: 2 }} />
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {[
            { label: lang === 'tr' ? 'Aktif Kullanım' : 'Active', color: usedColor, value: formatBytes(mem.active) },
            { label: lang === 'tr' ? 'Önbellek/Buffer' : 'Cache/Buffer', color: 'var(--cyan)', value: formatBytes(mem.buffcache) },
            { label: lang === 'tr' ? 'Boş' : 'Free', color: 'var(--text3)', value: formatBytes(mem.free) },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: 'var(--text3)' }}>{item.label}</span>
              <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="card mb-16">
        <div className="card-header">
          <div className="card-title">{t.common.history}</div>
          <span className="chip">{fixed(usedPct)}%</span>
        </div>
        <FullChart data={history.ram} color={usedColor} height={130} label="RAM %" />
      </div>

      {/* Detailed stats */}
      <div className="grid-2 mb-16" style={{ gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Ayrıntılı Bellek' : 'Memory Details'}</div>
          </div>
          {[
            [lang === 'tr' ? 'Toplam' : 'Total', formatBytes(mem.total)],
            [lang === 'tr' ? 'Kullanılan' : 'Used', formatBytes(mem.used)],
            [lang === 'tr' ? 'Boş' : 'Free', formatBytes(mem.free)],
            [lang === 'tr' ? 'Aktif' : 'Active', formatBytes(mem.active)],
            [lang === 'tr' ? 'Mevcut' : 'Available', formatBytes(mem.available)],
            [lang === 'tr' ? 'Tampon/Önbellek' : 'Buff/Cache', formatBytes(mem.buffcache)],
            ['Slab', formatBytes(mem.slab)],
          ].map(([label, value]) => (
            <div key={label} className="stat-row">
              <span className="stat-label">{label}</span>
              <span className="stat-value mono">{value}</span>
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Takas Belleği' : 'Swap Memory'}</div>
          </div>
          {[
            [lang === 'tr' ? 'Toplam Takas' : 'Total Swap', mem.swaptotal > 0 ? formatBytes(mem.swaptotal) : '—'],
            [lang === 'tr' ? 'Kullanılan Takas' : 'Used Swap', mem.swaptotal > 0 ? formatBytes(mem.swapused) : '—'],
            [lang === 'tr' ? 'Boş Takas' : 'Free Swap', mem.swaptotal > 0 ? formatBytes(mem.swapfree) : '—'],
          ].map(([label, value]) => (
            <div key={label} className="stat-row">
              <span className="stat-label">{label}</span>
              <span className="stat-value mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* RAM Slots */}
      {layout.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">{t.memory.slots}</div>
            <span className="chip">{layout.filter(s => s.size > 0).length} / {layout.length} {lang === 'tr' ? 'dolu' : 'used'}</span>
          </div>
          <div className="grid-2" style={{ gap: 10 }}>
            {layout.map((slot, i) => (
              <div key={i} className="core-card" style={{ opacity: slot.size === 0 ? 0.4 : 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
                    {t.common.slot} {i + 1} — {slot.bank}
                  </span>
                  {slot.size > 0
                    ? <span className="badge badge-green">{lang === 'tr' ? 'Takılı' : 'Installed'}</span>
                    : <span className="badge" style={{ background: 'var(--bg5)', color: 'var(--text3)' }}>{lang === 'tr' ? 'Boş' : 'Empty'}</span>
                  }
                </div>
                {slot.size > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
                      {formatBytes(slot.size)}
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                      <span className="chip" style={{ fontSize: 10 }}>{slot.type}</span>
                      {slot.clockSpeed > 0 && <span className="chip" style={{ fontSize: 10 }}>{slot.clockSpeed} MHz</span>}
                      {slot.formFactor && <span className="chip" style={{ fontSize: 10 }}>{slot.formFactor}</span>}
                    </div>
                    {slot.manufacturer && (
                      <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 4 }}>{slot.manufacturer}</div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
