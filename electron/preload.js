const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  getStaticInfo: () => ipcRenderer.invoke('get-static-info'),
  getDynamicInfo: () => ipcRenderer.invoke('get-dynamic-info'),
  getNetworkInterfaces: () => ipcRenderer.invoke('get-network-interfaces'),
  toggleTheme: (theme) => ipcRenderer.invoke('toggle-theme', theme),
  setUpdateInterval: (ms) => ipcRenderer.invoke('set-update-interval', ms),
  onDynamicData: (cb) => {
    ipcRenderer.on('dynamic-data', (_event, data) => cb(data))
  },
  offDynamicData: () => {
    ipcRenderer.removeAllListeners('dynamic-data')
  },
  platform: process.platform,
})
