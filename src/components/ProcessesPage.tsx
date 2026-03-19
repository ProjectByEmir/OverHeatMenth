import { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { formatBytes, processStateColor } from '../utils/format'
import type { ProcessItem } from '../types'

type SortKey = 'cpu' | 'mem' | 'pid' | 'name' | 'memRss'

export function ProcessesPage() {
  const { dynamicInfo, lang } = useStore()
  const t = translations[lang]

  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('cpu')
  const [sortDesc, setSortDesc] = useState(true)
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 50

  const procs = dynamicInfo?.processes

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc(d => !d)
    else { setSortKey(key); setSortDesc(true) }
    setPage(0)
  }

  const filtered = useMemo(() => {
    if (!procs?.list) return []
    let list = procs.list.filter(p =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.command?.toLowerCase().includes(search.toLowerCase()) ||
      String(p.pid).includes(search)
    )
    list = list.sort((a, b) => {
      const av = a[sortKey] as number | string
      const bv = b[sortKey] as number | string
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDesc ? bv - av : av - bv
      }
      return sortDesc
        ? String(bv).localeCompare(String(av))
        : String(av).localeCompare(String(bv))
    })
    return list
  }, [procs?.list, search, sortKey, sortDesc])

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const SortHeader = ({ label, k }: { label: string; k: SortKey }) => (
    <th className="sortable" onClick={() => handleSort(k)} style={{ userSelect: 'none' }}>
      {label} {sortKey === k ? (sortDesc ? '↓' : '↑') : ''}
    </th>
  )

  if (!procs) return (
    <div className="page" style={{ color: 'var(--text3)', padding: 32, textAlign: 'center' }}>{t.common.loading}</div>
  )

  return (
    <div className="page">
      {/* Summary */}
      <div className="grid-4 mb-16">
        {[
          { label: lang === 'tr' ? 'Toplam' : 'Total', value: procs.all, color: 'var(--text)' },
          { label: lang === 'tr' ? 'Çalışıyor' : 'Running', value: procs.running, color: 'var(--green)' },
          { label: lang === 'tr' ? 'Uyuyor' : 'Sleeping', value: procs.sleeping, color: 'var(--text3)' },
          { label: lang === 'tr' ? 'Engellendi' : 'Blocked', value: procs.blocked, color: 'var(--orange)' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="card-title mb-8">{s.label}</div>
            <div className="card-value" style={{ color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-16" style={{ gap: 12 }}>
        <input
          className="search-input"
          placeholder={t.common.search}
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
        />
        <div style={{ fontSize: 11, color: 'var(--text3)', fontFamily: 'var(--font-mono)' }}>
          {filtered.length} {lang === 'tr' ? 'süreç' : 'processes'}
        </div>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <SortHeader label={t.common.pid} k="pid" />
                <SortHeader label={t.common.name} k="name" />
                <SortHeader label="CPU %" k="cpu" />
                <SortHeader label={lang === 'tr' ? 'Bellek %' : 'Mem %'} k="mem" />
                <SortHeader label="RSS" k="memRss" />
                <th>{lang === 'tr' ? 'Durum' : 'State'}</th>
                <th>{lang === 'tr' ? 'Kullanıcı' : 'User'}</th>
                <th>{lang === 'tr' ? 'Komut' : 'Command'}</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((proc: ProcessItem) => (
                <tr key={proc.pid}>
                  <td className="mono" style={{ color: 'var(--text3)', fontSize: 11 }}>{proc.pid}</td>
                  <td style={{ fontWeight: 500, maxWidth: 160 }} className="truncate">{proc.name}</td>
                  <td className="mono" style={{ color: proc.cpu > 10 ? 'var(--orange)' : proc.cpu > 30 ? 'var(--red)' : 'var(--text)' }}>
                    {proc.cpu.toFixed(1)}%
                  </td>
                  <td className="mono" style={{ color: proc.mem > 10 ? 'var(--orange)' : 'var(--text)' }}>
                    {proc.mem.toFixed(1)}%
                  </td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--text2)' }}>{formatBytes(proc.memRss * 1024)}</td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <span
                        className="dot"
                        style={{ background: processStateColor(proc.state) }}
                      />
                      <span style={{ fontSize: 11, color: 'var(--text3)' }}>{proc.state}</span>
                    </span>
                  </td>
                  <td style={{ fontSize: 11, color: 'var(--text3)' }} className="truncate">{proc.user || '—'}</td>
                  <td style={{ fontSize: 11, color: 'var(--text3)', maxWidth: 200 }} className="truncate">
                    {proc.command || proc.params || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between" style={{ padding: '10px 16px', borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 11, color: 'var(--text3)' }}>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} / {filtered.length}
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-icon" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>‹</button>
              <button className="btn btn-icon" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
