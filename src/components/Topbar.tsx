import { useState, useEffect } from 'react'
import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'

const PAGE_TITLES: Record<string, { tr: string; en: string }> = {
  overview:  { tr: 'Genel Bakış', en: 'Overview' },
  cpu:       { tr: 'İşlemci', en: 'Processor' },
  gpu:       { tr: 'Ekran Kartı', en: 'Graphics' },
  memory:    { tr: 'Bellek', en: 'Memory' },
  disk:      { tr: 'Depolama', en: 'Storage' },
  network:   { tr: 'Ağ', en: 'Network' },
  processes: { tr: 'Süreçler', en: 'Processes' },
  system:    { tr: 'Sistem Bilgisi', en: 'System Info' },
}

export function Topbar() {
  const { page, lang, staticInfo, dynamicInfo, updateInterval, setUpdateInterval } = useStore()
  const t = translations[lang]

  const [clock, setClock] = useState(() => new Date().toLocaleTimeString())

  useEffect(() => {
    const id = setInterval(() => setClock(new Date().toLocaleTimeString()), 1000)
    return () => clearInterval(id)
  }, [])

  const title = PAGE_TITLES[page]?.[lang] ?? page

  const hostname = staticInfo?.osInfo?.hostname ?? '—'
  const os = staticInfo?.osInfo?.distro ?? ''

  return (
    <header className="topbar">
      <div className="topbar-title">{title}</div>

      {hostname && (
        <div className="topbar-clock" style={{ color: 'var(--text2)', fontSize: 11 }}>
          {hostname}
          {os && <span style={{ color: 'var(--text3)', marginLeft: 8 }}>{os}</span>}
        </div>
      )}

      {/* Interval selector */}
      <select
        className="styled-select"
        value={updateInterval}
        onChange={e => setUpdateInterval(Number(e.target.value))}
        title={lang === 'tr' ? 'Güncelleme hızı' : 'Update rate'}
      >
        <option value={500}>500ms</option>
        <option value={1000}>1s</option>
        <option value={2000}>2s</option>
        <option value={5000}>5s</option>
      </select>

      <div className="topbar-clock">{clock}</div>
    </header>
  )
}
