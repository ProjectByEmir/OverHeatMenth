import { app, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import path from 'path'
import si from 'systeminformation'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

let mainWindow: BrowserWindow | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#0a0a0c',
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#111115',
      symbolColor: '#9999b0',
      height: 40,
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, '../public/icon.ico'),
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ─── IPC: System Info Handlers ───────────────────────────────────────────────

ipcMain.handle('get-static-info', async () => {
  const [cpu, mem, osInfo, system, bios, baseboard] = await Promise.all([
    si.cpu(),
    si.memLayout(),
    si.osInfo(),
    si.system(),
    si.bios(),
    si.baseboard(),
  ])
  return { cpu, mem, osInfo, system, bios, baseboard }
})

ipcMain.handle('get-dynamic-info', async () => {
  const [
    cpuLoad,
    cpuTemp,
    cpuCurrentSpeed,
    mem,
    gpuData,
    disksIO,
    fsSize,
    networkStats,
    processes,
    battery,
  ] = await Promise.all([
    si.currentLoad(),
    si.cpuTemperature(),
    si.cpuCurrentSpeed(),
    si.mem(),
    si.graphics(),
    si.disksIO(),
    si.fsSize(),
    si.networkStats(),
    si.processes(),
    si.battery(),
  ])

  return {
    cpuLoad,
    cpuTemp,
    cpuCurrentSpeed,
    mem,
    gpuData,
    disksIO,
    fsSize,
    networkStats,
    processes,
    battery,
  }
})

ipcMain.handle('get-disk-smart', async (_event, device: string) => {
  try {
    const smart = await si.smartData(device)
    return smart
  } catch {
    return null
  }
})

ipcMain.handle('get-network-interfaces', async () => {
  const ifaces = await si.networkInterfaces()
  return ifaces
})

ipcMain.handle('toggle-theme', (_event, theme: 'dark' | 'light') => {
  nativeTheme.themeSource = theme
  return theme
})

ipcMain.handle('get-processes-detail', async () => {
  const procs = await si.processes()
  return procs
})
