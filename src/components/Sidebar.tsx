import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { formatUptime } from '../utils/format'

interface NavItemProps {
  icon: string
  label: string
  page: string
  badge?: string
  current: string
  onClick: (p: string) => void
}

function NavItem({ icon, label, page, badge, current, onClick }: NavItemProps) {
  return (
    <div
      className={`nav-item ${current === page ? 'active' : ''}`}
      onClick={() => onClick(page)}
    >
      <span className="nav-icon">{icon}</span>
      <span>{label}</span>
      {badge && <span className="nav-badge">{badge}</span>}
    </div>
  )
}

export function Sidebar() {
  const { page, setPage, theme, toggleTheme, lang, setLang, dynamicInfo } = useStore()
  const t = translations[lang]

  const uptime = dynamicInfo
    ? (() => {
        const os = (window as any)._osUptime as number | undefined
        return os ? formatUptime(os) : '—'
      })()
    : '—'

  const procCount = dynamicInfo?.processes?.all ?? 0

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-mark">⚡</div>
        <div>
          <div className="logo-label">OverHeatMenth</div>
          <div className="logo-sub">v1.0</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section">
          <div className="nav-section-label">Monitor</div>
          <NavItem icon="◈" label={t.nav.overview} page="overview" current={page} onClick={setPage} />
          <NavItem icon="▦" label={t.nav.cpu} page="cpu" current={page} onClick={setPage} />
          <NavItem icon="◉" label={t.nav.gpu} page="gpu" current={page} onClick={setPage} />
          <NavItem icon="▤" label={t.nav.memory} page="memory" current={page} onClick={setPage} />
          <NavItem icon="◫" label={t.nav.disk} page="disk" current={page} onClick={setPage} />
          <NavItem icon="≋" label={t.nav.network} page="network" current={page} onClick={setPage} />
        </div>

        <div className="nav-section">
          <div className="nav-section-label">System</div>
          <NavItem
            icon="❋"
            label={t.nav.processes}
            page="processes"
            badge={procCount > 0 ? procCount.toString() : undefined}
            current={page}
            onClick={setPage}
          />
          <NavItem icon="◎" label={t.nav.system} page="system" current={page} onClick={setPage} />
        </div>
      </nav>

      <div className="sidebar-footer">
        {/* Theme toggle */}
        <div
          className={`nav-item ${theme === 'light' ? 'active' : ''}`}
          style={{ padding: '7px 10px' }}
          onClick={toggleTheme}
        >
          <span className="nav-icon">{theme === 'dark' ? '☀' : '☾'}</span>
          <span style={{ fontSize: 12 }}>
            {theme === 'dark' ? t.common.light : t.common.dark}
          </span>
        </div>

        {/* Language toggle */}
        <div
          className="nav-item"
          style={{ padding: '7px 10px' }}
          onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}
        >
          <span className="nav-icon">⊕</span>
          <span style={{ fontSize: 12 }}>{lang === 'tr' ? 'English' : 'Türkçe'}</span>
        </div>
      </div>

      {/* Madness Software credit */}
      <div style={{ padding: '8px 16px 12px', borderTop: '1px solid var(--border)' }}>
        <div style={{ fontSize: 9, color: 'var(--text3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.4px' }}>
          Made by Madness Software
        </div>
      </div>
    </aside>
  )
}
