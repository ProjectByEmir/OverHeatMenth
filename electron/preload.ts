import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  getStaticInfo: () => ipcRenderer.invoke('get-static-info'),
  getDynamicInfo: () => ipcRenderer.invoke('get-dynamic-info'),
  getDiskSmart: (device: string) => ipcRenderer.invoke('get-disk-smart', device),
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  getProcessesDetail: () => ipcRenderer.invoke('get-processes-detail'),
  toggleTheme: (theme: 'dark' | 'light') => ipcRenderer.invoke('toggle-theme', theme),
  platform: process.platform,
})
