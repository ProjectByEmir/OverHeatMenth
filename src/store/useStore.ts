import { create } from 'zustand'
import type { StaticInfo, DynamicInfo, AppHistory, HistoryPoint, NetworkInterface } from '../types'
import type { Lang } from '../i18n/translations'

const MAX_HISTORY = 60

function pushHistory(arr: HistoryPoint[], value: number): HistoryPoint[] {
  const next = [...arr, { time: Date.now(), value }]
  if (next.length > MAX_HISTORY) next.shift()
  return next
}

interface AppState {
  // Page
  page: string
  setPage: (page: string) => void

  // Theme
  theme: 'dark' | 'light'
  toggleTheme: () => void

  // Language
  lang: Lang
  setLang: (lang: Lang) => void

  // Data
  staticInfo: StaticInfo | null
  dynamicInfo: DynamicInfo | null
  networkInterfaces: NetworkInterface[]
  history: AppHistory

  // Loading
  initialized: boolean

  // Actions
  setStaticInfo: (info: StaticInfo) => void
  setDynamicInfo: (info: DynamicInfo) => void
  setNetworkInterfaces: (ifaces: NetworkInterface[]) => void
  setInitialized: (v: boolean) => void
  pushToHistory: (dynamic: DynamicInfo) => void

  // Update interval
  updateInterval: number
  setUpdateInterval: (ms: number) => void
}

export const useStore = create<AppState>((set, get) => ({
  page: 'overview',
  setPage: (page) => set({ page }),

  theme: 'dark',
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    set({ theme: next })
    document.documentElement.setAttribute('data-theme', next)
    window.electronAPI?.toggleTheme(next)
  },

  lang: 'tr',
  setLang: (lang) => set({ lang }),

  staticInfo: null,
  dynamicInfo: null,
  networkInterfaces: [],

  history: {
    cpu: [],
    ram: [],
    gpus: {},
    netRx: [],
    netTx: [],
    diskRead: [],
    diskWrite: [],
    cpuTemp: [],
  },

  initialized: false,

  setStaticInfo: (info) => set({ staticInfo: info }),
  setDynamicInfo: (info) => set({ dynamicInfo: info }),
  setNetworkInterfaces: (ifaces) => set({ networkInterfaces: ifaces }),
  setInitialized: (v) => set({ initialized: v }),

  pushToHistory: (dynamic) => {
    const h = get().history

    const cpuVal = dynamic.cpuLoad.currentLoad ?? 0
    const ramVal = dynamic.mem.total > 0
      ? (dynamic.mem.used / dynamic.mem.total) * 100
      : 0
    const tempVal = dynamic.cpuTemp.main ?? 0
    const rxVal = dynamic.networkStats?.[0]?.rx_sec ?? 0
    const txVal = dynamic.networkStats?.[0]?.tx_sec ?? 0
    const drVal = dynamic.disksIO?.rIO_sec ?? 0
    const dwVal = dynamic.disksIO?.wIO_sec ?? 0

    const newGpus: Record<number, HistoryPoint[]> = { ...h.gpus }
    dynamic.gpuData.controllers.forEach((gpu, i) => {
      newGpus[i] = pushHistory(newGpus[i] ?? [], gpu.utilizationGpu ?? 0)
    })

    set({
      history: {
        cpu: pushHistory(h.cpu, cpuVal),
        ram: pushHistory(h.ram, ramVal),
        gpus: newGpus,
        netRx: pushHistory(h.netRx, rxVal),
        netTx: pushHistory(h.netTx, txVal),
        diskRead: pushHistory(h.diskRead, drVal),
        diskWrite: pushHistory(h.diskWrite, dwVal),
        cpuTemp: pushHistory(h.cpuTemp, tempVal),
      },
    })
  },

  updateInterval: 2000,
  setUpdateInterval: (ms) => set({ updateInterval: ms }),
}))
