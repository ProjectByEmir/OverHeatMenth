// ─── Window Electron API ─────────────────────────────────────────────────────
export interface ElectronAPI {
  getStaticInfo: () => Promise<StaticInfo>
  getDynamicInfo: () => Promise<DynamicInfo>
  getDiskSmart: (device: string) => Promise<SmartData | null>
  getNetworkInterfaces: () => Promise<NetworkInterface[]>
  getProcessesDetail: () => Promise<ProcessesInfo>
  toggleTheme: (theme: 'dark' | 'light') => Promise<string>
  platform: string
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

// ─── Static System Info ──────────────────────────────────────────────────────
export interface StaticInfo {
  cpu: CpuStatic
  mem: MemLayout[]
  osInfo: OsInfo
  system: SystemInfo
  bios: BiosInfo
  baseboard: BaseboardInfo
}

export interface CpuStatic {
  manufacturer: string
  brand: string
  vendor: string
  family: string
  model: string
  stepping: string
  revision: string
  voltage: string
  speed: number
  speedMin: number
  speedMax: number
  governor: string
  cores: number
  physicalCores: number
  processors: number
  socket: string
  flags: string
  virtualization: boolean
  cache: {
    l1d: number
    l1i: number
    l2: number
    l3: number
  }
}

export interface MemLayout {
  size: number
  bank: string
  type: string
  ecc: boolean
  clockSpeed: number
  formFactor: string
  manufacturer: string
  partNum: string
  serialNum: string
  voltageConfigured: number
  voltageMin: number
  voltageMax: number
}

export interface OsInfo {
  platform: string
  distro: string
  release: string
  codename: string
  kernel: string
  arch: string
  hostname: string
  fqdn: string
  codepage: string
  logofile: string
  serial: string
  build: string
  servicepack: string
  uefi: boolean
  hypervizor: boolean
  remoteSession: boolean
}

export interface SystemInfo {
  manufacturer: string
  model: string
  version: string
  serial: string
  uuid: string
  sku: string
  virtual: boolean
  virtualHost: string
  raspberry: boolean
}

export interface BiosInfo {
  vendor: string
  version: string
  releaseDate: string
  revision: string
  serial: string
}

export interface BaseboardInfo {
  manufacturer: string
  model: string
  version: string
  serial: string
  assetTag: string
  memMax: number
  memSlots: number
}

// ─── Dynamic System Info ─────────────────────────────────────────────────────
export interface DynamicInfo {
  cpuLoad: CpuLoad
  cpuTemp: CpuTemperature
  cpuCurrentSpeed: CpuCurrentSpeed
  mem: MemInfo
  gpuData: GraphicsInfo
  disksIO: DisksIO
  fsSize: FsSize[]
  networkStats: NetworkStats[]
  processes: ProcessesInfo
  battery: BatteryInfo
}

export interface CpuLoad {
  avgLoad: number
  currentLoad: number
  currentLoadUser: number
  currentLoadSystem: number
  currentLoadNice: number
  currentLoadIdle: number
  currentLoadIrq: number
  rawCurrentLoad: number
  rawCurrentLoadUser: number
  rawCurrentLoadSystem: number
  rawCurrentLoadNice: number
  rawCurrentLoadIdle: number
  rawCurrentLoadIrq: number
  cpus: CpuCoreLoad[]
}

export interface CpuCoreLoad {
  load: number
  loadUser: number
  loadSystem: number
  loadNice: number
  loadIdle: number
  loadIrq: number
  rawLoad: number
  rawLoadUser: number
  rawLoadSystem: number
  rawLoadNice: number
  rawLoadIdle: number
  rawLoadIrq: number
}

export interface CpuTemperature {
  main: number
  cores: number[]
  max: number
  socket: number[]
  chipset: number
}

export interface CpuCurrentSpeed {
  min: number
  max: number
  avg: number
  cores: number[]
}

export interface MemInfo {
  total: number
  free: number
  used: number
  active: number
  available: number
  buffers: number
  cached: number
  slab: number
  buffcache: number
  swaptotal: number
  swapused: number
  swapfree: number
  writeback: number | null
  dirty: number | null
}

export interface GraphicsInfo {
  controllers: GpuController[]
  displays: GpuDisplay[]
}

export interface GpuController {
  vendor: string
  subVendor: string
  vendorId: string
  model: string
  bus: string
  busAddress: string
  vram: number
  vramDynamic: boolean
  pciID: string
  driverVersion: string
  subDeviceId: string
  name: string
  pciBus: string
  memoryTotal: number
  memoryUsed: number
  memoryFree: number
  utilizationGpu: number
  utilizationMemory: number
  temperatureGpu: number
  temperatureHotspot: number
  powerDraw: number
  powerLimit: number
  clockCore: number
  clockMemory: number
  fanSpeed: number
}

export interface GpuDisplay {
  vendor: string
  vendorId: string
  model: string
  bus: string
  busAddress: string
  connection: string
  main: boolean
  builtin: boolean
  connection2: string
  sizeX: number
  sizeY: number
  pixelDepth: number
  resolutionX: number
  resolutionY: number
  currentResX: number
  currentResY: number
  currentRefreshRate: number
  positionX: number
  positionY: number
}

export interface DisksIO {
  rIO: number
  wIO: number
  tIO: number
  rIO_sec: number | null
  wIO_sec: number | null
  tIO_sec: number | null
  rWaitTime: number
  wWaitTime: number
  tWaitTime: number
  rWaitPercent: number
  wWaitPercent: number
  tWaitPercent: number
  ms: number
}

export interface FsSize {
  fs: string
  type: string
  size: number
  used: number
  available: number
  use: number
  rw: boolean
  mount: string
}

export interface NetworkStats {
  iface: string
  operstate: string
  rx_bytes: number
  rx_dropped: number
  rx_errors: number
  tx_bytes: number
  tx_dropped: number
  tx_errors: number
  rx_sec: number | null
  tx_sec: number | null
  ms: number
}

export interface NetworkInterface {
  iface: string
  ifaceName: string
  default: boolean
  ip4: string
  ip4subnet: string
  ip6: string
  ip6subnet: string
  mac: string
  internal: boolean
  virtual: boolean
  operstate: string
  type: string
  duplex: string
  mtu: number
  speed: number
  dhcp: boolean
  dnsSuffix: string
  ieee8021xAuth: string
  ieee8021xState: string
  carrier_changes: number
}

export interface ProcessesInfo {
  all: number
  running: number
  blocked: number
  sleeping: number
  unknown: number
  list: ProcessItem[]
}

export interface ProcessItem {
  pid: number
  parentPid: number
  name: string
  cpu: number
  cpuu: number
  cpus: number
  mem: number
  priority: number
  memVsz: number
  memRss: number
  nice: number
  started: string
  state: string
  tty: string
  user: string
  command: string
  params: string
  path: string
}

export interface BatteryInfo {
  hasBattery: boolean
  cycleCount: number
  isCharging: boolean
  designedCapacity: number
  maxCapacity: number
  currentCapacity: number
  voltage: number
  capacityUnit: string
  percent: number
  timeRemaining: number | null
  acConnected: boolean
  type: string
  model: string
  manufacturer: string
  serial: string
}

export interface SmartData {
  device: string
  deviceslist: string[]
  smart_status: string
  json_format_version: number[]
  smartctl: Record<string, unknown>
  attributes: SmartAttribute[]
}

export interface SmartAttribute {
  id: number
  name: string
  value: number
  worst: number
  thresh: number
  raw_value: number
  flag: string
  type: string
  updated: string
  when_failed: string
}

// ─── App Store ───────────────────────────────────────────────────────────────
export type Page = 'overview' | 'cpu' | 'gpu' | 'memory' | 'disk' | 'network' | 'processes' | 'system'
export type Theme = 'dark' | 'light'
export type Lang = 'tr' | 'en'

export interface HistoryPoint {
  time: number
  value: number
}

export interface AppHistory {
  cpu: HistoryPoint[]
  ram: HistoryPoint[]
  gpus: Record<number, HistoryPoint[]>
  netRx: HistoryPoint[]
  netTx: HistoryPoint[]
  diskRead: HistoryPoint[]
  diskWrite: HistoryPoint[]
  cpuTemp: HistoryPoint[]
}
