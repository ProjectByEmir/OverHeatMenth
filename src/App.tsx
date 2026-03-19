import { useEffect } from 'react'
import { useStore } from './store/useStore'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { OverviewPage } from './components/OverviewPage'
import { CpuPage } from './components/CpuPage'
import { GpuPage } from './components/GpuPage'
import { MemoryPage } from './components/MemoryPage'
import { DiskPage } from './components/DiskPage'
import { NetworkPage } from './components/NetworkPage'
import { ProcessesPage } from './components/ProcessesPage'
import { SystemPage } from './components/SystemPage'
import './utils/chartSetup'

function getMockDynamicData() {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min
  const cores = Array.from({ length: 8 }, () => ({
    load: rand(5, 90), loadUser: rand(3, 60), loadSystem: rand(2, 30),
    loadNice: 0, loadIdle: rand(10, 90), loadIrq: rand(0, 2),
    rawLoad: 0, rawLoadUser: 0, rawLoadSystem: 0, rawLoadNice: 0, rawLoadIdle: 0, rawLoadIrq: 0,
  }))
  return {
    cpuLoad: {
      avgLoad: rand(20, 70), currentLoad: rand(15, 75),
      currentLoadUser: rand(10, 50), currentLoadSystem: rand(5, 20),
      currentLoadNice: 0, currentLoadIdle: rand(30, 70), currentLoadIrq: rand(0, 2),
      rawCurrentLoad: 0, rawCurrentLoadUser: 0, rawCurrentLoadSystem: 0,
      rawCurrentLoadNice: 0, rawCurrentLoadIdle: 0, rawCurrentLoadIrq: 0,
      cpus: cores,
    },
    cpuTemp: { main: rand(40, 80), cores: Array.from({ length: 8 }, () => rand(35, 85)), max: rand(75, 95), socket: [], chipset: 0 },
    cpuCurrentSpeed: { min: 1.2, max: 4.5, avg: rand(2.5, 4.2), cores: Array.from({ length: 8 }, () => rand(2, 4.5)) },
    mem: {
      total: 16 * 1024 ** 3, free: rand(2, 8) * 1024 ** 3,
      used: rand(6, 12) * 1024 ** 3, active: rand(4, 10) * 1024 ** 3,
      available: rand(4, 10) * 1024 ** 3, buffers: 512 * 1024 ** 2,
      cached: 2 * 1024 ** 3, slab: 256 * 1024 ** 2, buffcache: 2.5 * 1024 ** 3,
      swaptotal: 8 * 1024 ** 3, swapused: rand(0.5, 2) * 1024 ** 3,
      swapfree: rand(4, 7) * 1024 ** 3, writeback: null, dirty: null,
    },
    gpuData: {
      controllers: [{
        vendor: 'NVIDIA', subVendor: '', vendorId: '10de', model: 'GeForce RTX 3080',
        bus: 'PCIe', busAddress: '01:00.0', vram: 10240, vramDynamic: false,
        pciID: '10de:2206', driverVersion: '531.41', subDeviceId: '',
        name: 'NVIDIA GeForce RTX 3080', pciBus: '01', memoryTotal: 10240,
        memoryUsed: rand(1024, 6144), memoryFree: rand(4096, 8192),
        utilizationGpu: rand(5, 95), utilizationMemory: rand(10, 60),
        temperatureGpu: rand(45, 85), temperatureHotspot: rand(50, 95),
        powerDraw: rand(120, 320), powerLimit: 320,
        clockCore: rand(1200, 1900), clockMemory: 9501,
        fanSpeed: rand(30, 80),
      }],
      displays: [],
    },
    disksIO: {
      rIO: 4231042, wIO: 1892304, tIO: 6123346,
      rIO_sec: rand(0, 50 * 1024 * 1024), wIO_sec: rand(0, 20 * 1024 * 1024),
      tIO_sec: rand(0, 70 * 1024 * 1024),
      rWaitTime: rand(0, 10), wWaitTime: rand(0, 5), tWaitTime: rand(0, 15),
      rWaitPercent: rand(0, 20), wWaitPercent: rand(0, 10), tWaitPercent: rand(0, 30),
      ms: 1000,
    },
    fsSize: [
      { fs: 'C:', type: 'NTFS', size: 500 * 1024 ** 3, used: rand(100, 400) * 1024 ** 3, available: rand(80, 350) * 1024 ** 3, use: rand(20, 85), rw: true, mount: 'C:' },
    ],
    networkStats: [{
      iface: 'Ethernet', operstate: 'up',
      rx_bytes: 2341231245, rx_dropped: 0, rx_errors: 0,
      tx_bytes: 892341234, tx_dropped: 0, tx_errors: 0,
      rx_sec: rand(0, 5 * 1024 * 1024), tx_sec: rand(0, 1024 * 1024), ms: 1000,
    }],
    processes: {
      all: 312, running: 4, blocked: 0, sleeping: 280, unknown: 0,
      list: Array.from({ length: 30 }, (_, i) => ({
        pid: 1000 + i, parentPid: 4,
        name: ['chrome.exe', 'node.exe', 'python.exe', 'code.exe', 'System', 'svchost.exe'][i % 6],
        cpu: rand(0, i < 3 ? 20 : 3), cpuu: 0, cpus: 0, mem: rand(0, 4), priority: 8,
        memVsz: rand(100, 2000) * 1024, memRss: rand(10, 500) * 1024,
        nice: 0, started: '', state: ['running', 'sleeping', 'sleeping'][i % 3],
        tty: '', user: 'User', command: 'cmd', params: '', path: '',
      })),
    },
    battery: { hasBattery: false, cycleCount: 0, isCharging: false, designedCapacity: 0, maxCapacity: 0, currentCapacity: 0, voltage: 0, capacityUnit: 'mWh', percent: 0, timeRemaining: null, acConnected: true, type: '', model: '', manufacturer: '', serial: '' },
  }
}

function getMockStaticData() {
  return {
    cpu: { manufacturer: 'Intel', brand: 'Core i9-13900K', vendor: 'GenuineIntel', family: '6', model: '183', stepping: '1', revision: '', voltage: '', speed: 3.0, speedMin: 0.8, speedMax: 5.8, governor: '', cores: 32, physicalCores: 24, processors: 1, socket: 'LGA1700', flags: 'avx avx2 sse4_1 sse4_2 aes fma vmx', virtualization: true, cache: { l1d: 896 * 1024, l1i: 640 * 1024, l2: 32 * 1024 * 1024, l3: 36 * 1024 * 1024 } },
    mem: [
      { size: 16 * 1024 ** 3, bank: 'BANK0', type: 'DDR5', ecc: false, clockSpeed: 6000, formFactor: 'DIMM', manufacturer: 'G.SKILL', partNum: 'F5-6000', serialNum: '12345678', voltageConfigured: 1.35, voltageMin: 1.2, voltageMax: 1.4 },
      { size: 16 * 1024 ** 3, bank: 'BANK1', type: 'DDR5', ecc: false, clockSpeed: 6000, formFactor: 'DIMM', manufacturer: 'G.SKILL', partNum: 'F5-6000', serialNum: '87654321', voltageConfigured: 1.35, voltageMin: 1.2, voltageMax: 1.4 },
    ],
    osInfo: { platform: 'win32', distro: 'Windows 11 Pro', release: '23H2', codename: '', kernel: '10.0.22631', arch: 'x64', hostname: 'GAMING-PC', fqdn: 'GAMING-PC', codepage: '1252', logofile: 'windows', serial: '', build: '22631', servicepack: '', uefi: true, hypervizor: false, remoteSession: false },
    system: { manufacturer: 'ASUS', model: 'ROG MAXIMUS Z790', version: 'Rev 1.xx', serial: 'ABC123', uuid: 'xxxx', sku: '', virtual: false, virtualHost: '', raspberry: false },
    bios: { vendor: 'American Megatrends', version: '1401', releaseDate: '09/01/2023', revision: '5.26', serial: '' },
    baseboard: { manufacturer: 'ASUSTeK', model: 'ROG MAXIMUS Z790', version: 'Rev 1.xx', serial: 'ABC123', assetTag: '', memMax: 128 * 1024 ** 3, memSlots: 4 },
  }
}

export function App() {
  const {
    page,
    setStaticInfo, setDynamicInfo, setNetworkInterfaces,
    setInitialized, initialized, pushToHistory, updateInterval,
  } = useStore()

  // Init: static data + network interfaces (sadece bir kere)
  useEffect(() => {
    const init = async () => {
      try {
        if (window.electronAPI) {
          const [staticData, networkIfaces] = await Promise.all([
            window.electronAPI.getStaticInfo(),
            window.electronAPI.getNetworkInterfaces(),
          ])
          setStaticInfo(staticData)
          setNetworkInterfaces(networkIfaces)
        } else {
          setStaticInfo(getMockStaticData() as any)
          setNetworkInterfaces([])
        }
      } catch {
        setStaticInfo(getMockStaticData() as any)
        setNetworkInterfaces([])
      }
      setInitialized(true)
    }
    init()
  }, [])

  // Dynamic data: Electron push veya mock interval
  useEffect(() => {
    if (!initialized) return

    if (window.electronAPI?.onDynamicData) {
      // Push tabanlı — Electron ana process iter, biz dinleriz
      window.electronAPI.onDynamicData((data: any) => {
        setDynamicInfo(data)
        pushToHistory(data)
      })
      window.electronAPI.setUpdateInterval?.(updateInterval)
      return () => {
        window.electronAPI?.offDynamicData?.()
      }
    } else {
      // Browser mock
      const id = setInterval(() => {
        const mock = getMockDynamicData() as any
        setDynamicInfo(mock)
        pushToHistory(mock)
      }, updateInterval)
      return () => clearInterval(id)
    }
  }, [initialized])

  // Güncelleme hızı değişince Electron'a bildir
  useEffect(() => {
    if (!initialized) return
    window.electronAPI?.setUpdateInterval?.(updateInterval)
  }, [updateInterval, initialized])

  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="spinner" />
        <div className="loading-text">OverHeatMenth başlatılıyor...</div>
      </div>
    )
  }

  const pages: Record<string, JSX.Element> = {
    overview: <OverviewPage />,
    cpu: <CpuPage />,
    gpu: <GpuPage />,
    memory: <MemoryPage />,
    disk: <DiskPage />,
    network: <NetworkPage />,
    processes: <ProcessesPage />,
    system: <SystemPage />,
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main">
        <Topbar />
        <div className="content">
          {pages[page] ?? <OverviewPage />}
        </div>
      </div>
    </div>
  )
}
