const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron')
const path = require('path')
const si = require('systeminformation')

const isDev = !app.isPackaged

let mainWindow = null
let updateInterval = null
let updateMs = 2000

let tickCount = 0
let lastMedium = {}
let lastHeavy = { processes: { all: 0, running: 0, blocked: 0, sleeping: 0, unknown: 0, list: [] } }

async function fetchLight() {
  const [cpuLoad, mem, networkStats, disksIO] = await Promise.all([
    si.currentLoad(),
    si.mem(),
    si.networkStats(),
    si.disksIO(),
  ])
  return { cpuLoad, mem, networkStats, disksIO }
}

async function fetchMedium() {
  const [cpuTemp, cpuCurrentSpeed, gpuData, fsSize, battery] = await Promise.all([
    si.cpuTemperature(),
    si.cpuCurrentSpeed(),
    si.graphics(),
    si.fsSize(),
    si.battery(),
  ])
  return { cpuTemp, cpuCurrentSpeed, gpuData, fsSize, battery }
}

async function fetchHeavy() {
  const processes = await si.processes()
  return { processes }
}

async function tick() {
  try {
    tickCount++
    const light = await fetchLight()

    if (tickCount % 3 === 0) {
      lastMedium = await fetchMedium()
    }

    if (tickCount % 10 === 0) {
      lastHeavy = await fetchHeavy()
    }

    const data = {
      cpuLoad: light.cpuLoad,
      mem: light.mem,
      networkStats: light.networkStats,
      disksIO: light.disksIO,
      cpuTemp: lastMedium.cpuTemp || { main: 0, cores: [], max: 0, socket: [], chipset: 0 },
      cpuCurrentSpeed: lastMedium.cpuCurrentSpeed || { min: 0, max: 0, avg: 0, cores: [] },
      gpuData: lastMedium.gpuData || { controllers: [], displays: [] },
      fsSize: lastMedium.fsSize || [],
      battery: lastMedium.battery || { hasBattery: false },
      processes: lastHeavy.processes,
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dynamic-data', data)
    }
  } catch (e) {
    // silent
  }
}

function startLoop(ms) {
  if (updateInterval) clearInterval(updateInterval)
  updateMs = ms
  tick()
  updateInterval = setInterval(tick, ms)
}

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
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.webContents.on('did-finish-load', () => {
    startLoop(updateMs)
  })

  mainWindow.on('closed', () => {
    if (updateInterval) clearInterval(updateInterval)
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (updateInterval) clearInterval(updateInterval)
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('get-static-info', async () => {
  const [cpu, mem, osInfo, system, bios, baseboard] = await Promise.all([
    si.cpu(), si.memLayout(), si.osInfo(), si.system(), si.bios(), si.baseboard(),
  ])
  return { cpu, mem, osInfo, system, bios, baseboard }
})

ipcMain.handle('get-dynamic-info', async () => {
  const light = await fetchLight()
  return {
    ...light,
    cpuTemp: lastMedium.cpuTemp || { main: 0, cores: [], max: 0, socket: [], chipset: 0 },
    cpuCurrentSpeed: lastMedium.cpuCurrentSpeed || { min: 0, max: 0, avg: 0, cores: [] },
    gpuData: lastMedium.gpuData || { controllers: [], displays: [] },
    fsSize: lastMedium.fsSize || [],
    battery: lastMedium.battery || { hasBattery: false },
    processes: lastHeavy.processes,
  }
})

ipcMain.handle('set-update-interval', (_event, ms) => {
  startLoop(ms)
  return ms
})

ipcMain.handle('get-network-interfaces', async () => {
  return await si.networkInterfaces()
})

ipcMain.handle('toggle-theme', (_event, theme) => {
  nativeTheme.themeSource = theme
  return theme
})
