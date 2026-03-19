import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { FullChart } from './Charts'
import { formatBytes, formatBytesPerSec } from '../utils/format'

export function NetworkPage() {
  const { dynamicInfo, networkInterfaces, history, lang } = useStore()
  const t = translations[lang]

  if (!dynamicInfo) return (
    <div className="page" style={{ color: 'var(--text3)', padding: 32, textAlign: 'center' }}>{t.common.loading}</div>
  )

  const stats = dynamicInfo.networkStats ?? []
  const primary = stats[0]

  const rxSec = primary?.rx_sec ?? 0
  const txSec = primary?.tx_sec ?? 0

  return (
    <div className="page">
      {/* Summary */}
      <div className="grid-4 mb-16">
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'İndirme' : 'Download'} ↓</div>
          <div className="card-value" style={{ color: 'var(--cyan)', fontSize: 20 }}>{formatBytesPerSec(rxSec)}</div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Yükleme' : 'Upload'} ↑</div>
          <div className="card-value" style={{ color: 'var(--accent2)', fontSize: 20 }}>{formatBytesPerSec(txSec)}</div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Toplam Alınan' : 'Total Received'}</div>
          <div className="card-value" style={{ color: 'var(--text)', fontSize: 18 }}>{formatBytes(primary?.rx_bytes ?? 0)}</div>
        </div>
        <div className="card">
          <div className="card-title mb-8">{lang === 'tr' ? 'Toplam Gönderilen' : 'Total Sent'}</div>
          <div className="card-value" style={{ color: 'var(--text)', fontSize: 18 }}>{formatBytes(primary?.tx_bytes ?? 0)}</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-16" style={{ gap: 14 }}>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'İndirme Geçmişi' : 'Download History'}</div>
            <span className="chip">{formatBytesPerSec(rxSec)}</span>
          </div>
          <FullChart
            data={history.netRx}
            color="var(--cyan)"
            height={130}
            yMax={Math.max(...history.netRx.map(d => d.value), 1024)}
            label="RX"
            unit=""
            formatValue={v => formatBytesPerSec(v)}
          />
        </div>
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Yükleme Geçmişi' : 'Upload History'}</div>
            <span className="chip">{formatBytesPerSec(txSec)}</span>
          </div>
          <FullChart
            data={history.netTx}
            color="var(--accent2)"
            height={130}
            yMax={Math.max(...history.netTx.map(d => d.value), 1024)}
            label="TX"
            unit=""
            formatValue={v => formatBytesPerSec(v)}
          />
        </div>
      </div>

      {/* Per-interface stats */}
      {stats.length > 0 && (
        <div className="card mb-16">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Arayüz İstatistikleri' : 'Interface Statistics'}</div>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.common.interface}</th>
                <th>{lang === 'tr' ? 'Durum' : 'State'}</th>
                <th>↓ {lang === 'tr' ? 'Anlık' : 'Current'}</th>
                <th>↑ {lang === 'tr' ? 'Anlık' : 'Current'}</th>
                <th>{lang === 'tr' ? 'Alınan' : 'Received'}</th>
                <th>{lang === 'tr' ? 'Gönderilen' : 'Sent'}</th>
                <th>{lang === 'tr' ? 'Hatalar' : 'Errors'}</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((iface, i) => (
                <tr key={i}>
                  <td className="mono" style={{ fontWeight: 600 }}>{iface.iface}</td>
                  <td>
                    <span className={`badge ${iface.operstate === 'up' ? 'badge-green' : 'badge-red'}`}>
                      {iface.operstate}
                    </span>
                  </td>
                  <td className="mono" style={{ color: 'var(--cyan)' }}>{formatBytesPerSec(iface.rx_sec ?? 0)}</td>
                  <td className="mono" style={{ color: 'var(--accent2)' }}>{formatBytesPerSec(iface.tx_sec ?? 0)}</td>
                  <td className="mono">{formatBytes(iface.rx_bytes)}</td>
                  <td className="mono">{formatBytes(iface.tx_bytes)}</td>
                  <td className="mono" style={{ color: (iface.rx_errors + iface.tx_errors) > 0 ? 'var(--red)' : 'var(--text3)' }}>
                    {iface.rx_errors + iface.tx_errors}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Network interfaces detail */}
      {networkInterfaces.length > 0 && (
        <div className="card">
          <div className="card-header">
            <div className="card-title">{lang === 'tr' ? 'Ağ Arayüzleri' : 'Network Interfaces'}</div>
            <span className="chip">{networkInterfaces.filter(i => !i.internal).length}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {networkInterfaces.filter(i => !i.internal).map((iface, i) => (
              <div key={i} className="stat-row" style={{ alignItems: 'flex-start', padding: '12px 0' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: 13 }}>{iface.iface}</span>
                    {iface.default && <span className="badge badge-blue">{lang === 'tr' ? 'Varsayılan' : 'Default'}</span>}
                    <span className={`badge ${iface.operstate === 'up' ? 'badge-green' : 'badge-red'}`}>
                      {iface.operstate}
                    </span>
                    {iface.type && <span className="chip" style={{ fontSize: 10 }}>{iface.type}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {iface.ip4 && (
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: 'var(--text3)' }}>IPv4 </span>
                        <span className="mono" style={{ color: 'var(--text)' }}>{iface.ip4}</span>
                      </div>
                    )}
                    {iface.ip6 && (
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: 'var(--text3)' }}>IPv6 </span>
                        <span className="mono" style={{ color: 'var(--text)' }}>{iface.ip6.split('%')[0]}</span>
                      </div>
                    )}
                    {iface.mac && (
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: 'var(--text3)' }}>MAC </span>
                        <span className="mono" style={{ color: 'var(--text)' }}>{iface.mac}</span>
                      </div>
                    )}
                    {iface.speed > 0 && (
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: 'var(--text3)' }}>{lang === 'tr' ? 'Hız' : 'Speed'} </span>
                        <span className="mono" style={{ color: 'var(--text)' }}>{iface.speed} Mbps</span>
                      </div>
                    )}
                    {iface.dhcp !== undefined && (
                      <div style={{ fontSize: 11 }}>
                        <span style={{ color: 'var(--text3)' }}>DHCP </span>
                        <span className="mono">{iface.dhcp ? (lang === 'tr' ? 'Evet' : 'Yes') : (lang === 'tr' ? 'Hayır' : 'No')}</span>
                      </div>
                    )}
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
