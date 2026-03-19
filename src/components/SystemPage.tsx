import { useStore } from '../store/useStore'
import { translations } from '../i18n/translations'
import { formatBytes } from '../utils/format'

function InfoSection({ title, rows }: { title: string; rows: [string, string | number | boolean | undefined | null][] }) {
  return (
    <div className="card mb-16">
      <div className="card-header">
        <div className="card-title">{title}</div>
      </div>
      {rows.filter(([, v]) => v !== undefined && v !== null && v !== '').map(([label, value]) => (
        <div key={label} className="stat-row">
          <span className="stat-label">{label}</span>
          <span className="stat-value mono">{String(value)}</span>
        </div>
      ))}
    </div>
  )
}

export function SystemPage() {
  const { staticInfo, dynamicInfo, lang } = useStore()
  const t = translations[lang]

  if (!staticInfo) return (
    <div className="page" style={{ color: 'var(--text3)', padding: 32, textAlign: 'center' }}>{t.common.loading}</div>
  )

  const os = staticInfo.osInfo
  const sys = staticInfo.system
  const bios = staticInfo.bios
  const board = staticInfo.baseboard
  const cpu = staticInfo.cpu
  const battery = dynamicInfo?.battery

  return (
    <div className="page">
      <div className="grid-2" style={{ gap: 14 }}>
        <div>
          <InfoSection
            title={lang === 'tr' ? 'İşletim Sistemi' : 'Operating System'}
            rows={[
              [lang === 'tr' ? 'Dağıtım' : 'Distro', os.distro],
              [lang === 'tr' ? 'Sürüm' : 'Release', os.release],
              ['Codename', os.codename],
              [lang === 'tr' ? 'Çekirdek' : 'Kernel', os.kernel],
              [lang === 'tr' ? 'Mimari' : 'Architecture', os.arch],
              [lang === 'tr' ? 'Platform' : 'Platform', os.platform],
              [lang === 'tr' ? 'Ana Bilgisayar' : 'Hostname', os.hostname],
              ['FQDN', os.fqdn],
              [lang === 'tr' ? 'Derleme' : 'Build', os.build],
              ['UEFI', os.uefi ? (lang === 'tr' ? 'Evet' : 'Yes') : (lang === 'tr' ? 'Hayır' : 'No')],
            ]}
          />

          <InfoSection
            title={lang === 'tr' ? 'Sistem' : 'System'}
            rows={[
              [lang === 'tr' ? 'Üretici' : 'Manufacturer', sys.manufacturer],
              [lang === 'tr' ? 'Model' : 'Model', sys.model],
              [lang === 'tr' ? 'Sürüm' : 'Version', sys.version],
              ['UUID', sys.uuid],
              ['SKU', sys.sku],
              [lang === 'tr' ? 'Sanal' : 'Virtual', sys.virtual ? (lang === 'tr' ? 'Evet' : 'Yes') : (lang === 'tr' ? 'Hayır' : 'No')],
            ]}
          />
        </div>

        <div>
          <InfoSection
            title={lang === 'tr' ? 'İşlemci' : 'Processor'}
            rows={[
              [lang === 'tr' ? 'Marka' : 'Brand', cpu.brand],
              [lang === 'tr' ? 'Üretici' : 'Manufacturer', cpu.manufacturer],
              [lang === 'tr' ? 'Soket' : 'Socket', cpu.socket],
              [lang === 'tr' ? 'Hız' : 'Speed', `${cpu.speed} GHz`],
              [lang === 'tr' ? 'Fiziksel Çekirdek' : 'Physical Cores', cpu.physicalCores],
              [lang === 'tr' ? 'Mantıksal Çekirdek' : 'Logical Cores', cpu.cores],
              [lang === 'tr' ? 'L2 Önbellek' : 'L2 Cache', formatBytes(cpu.cache?.l2 ?? 0)],
              [lang === 'tr' ? 'L3 Önbellek' : 'L3 Cache', formatBytes(cpu.cache?.l3 ?? 0)],
              [lang === 'tr' ? 'Sanallaştırma' : 'Virtualization', cpu.virtualization ? (lang === 'tr' ? 'Destekleniyor' : 'Supported') : (lang === 'tr' ? 'Desteklenmiyor' : 'Not supported')],
            ]}
          />

          <InfoSection
            title={lang === 'tr' ? 'Anakart' : 'Motherboard'}
            rows={[
              [lang === 'tr' ? 'Üretici' : 'Manufacturer', board.manufacturer],
              [lang === 'tr' ? 'Model' : 'Model', board.model],
              [lang === 'tr' ? 'Sürüm' : 'Version', board.version],
              [lang === 'tr' ? 'Seri No' : 'Serial', board.serial],
              [lang === 'tr' ? 'Maks Bellek' : 'Max Memory', formatBytes(board.memMax)],
              [lang === 'tr' ? 'Bellek Yuvaları' : 'Memory Slots', board.memSlots],
            ]}
          />

          <InfoSection
            title="BIOS"
            rows={[
              [lang === 'tr' ? 'Satıcı' : 'Vendor', bios.vendor],
              [lang === 'tr' ? 'Sürüm' : 'Version', bios.version],
              [lang === 'tr' ? 'Tarih' : 'Release Date', bios.releaseDate],
              [lang === 'tr' ? 'Revizyon' : 'Revision', bios.revision],
            ]}
          />

          {battery?.hasBattery && (
            <InfoSection
              title={lang === 'tr' ? 'Pil' : 'Battery'}
              rows={[
                [lang === 'tr' ? 'Durum' : 'Status', battery.isCharging ? (lang === 'tr' ? 'Şarj Oluyor' : 'Charging') : (lang === 'tr' ? 'Deşarj' : 'Discharging')],
                [lang === 'tr' ? 'Şarj' : 'Charge', `${battery.percent}%`],
                [lang === 'tr' ? 'Voltaj' : 'Voltage', `${battery.voltage?.toFixed(2)} V`],
                [lang === 'tr' ? 'Döngü Sayısı' : 'Cycle Count', battery.cycleCount],
                [lang === 'tr' ? 'Model' : 'Model', battery.model],
                [lang === 'tr' ? 'Üretici' : 'Manufacturer', battery.manufacturer],
                [lang === 'tr' ? 'Tür' : 'Type', battery.type],
                [lang === 'tr' ? 'Maks Kapasite' : 'Max Capacity', battery.maxCapacity ? `${battery.maxCapacity} ${battery.capacityUnit}` : '—'],
                [lang === 'tr' ? 'Tasarım Kapasitesi' : 'Design Capacity', battery.designedCapacity ? `${battery.designedCapacity} ${battery.capacityUnit}` : '—'],
              ]}
            />
          )}
        </div>
      </div>
    </div>
  )
}
