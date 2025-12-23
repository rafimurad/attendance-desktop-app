const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

const log = require("electron-log");
const { autoUpdater } = require("electron-updater");

// logger setup (must be before updater)
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

let mainWindow = null;
let updateWindow = null;
let updateInfo = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "image", "barabd.ico")
  });

  mainWindow.loadFile("index.html");
  return mainWindow;
}

// Create custom update window
function createUpdateWindow() {
  if (updateWindow) {
    updateWindow.focus();
    return;
  }

  updateWindow = new BrowserWindow({
    width: 450,
    height: 480,
    resizable: false,
    frame: false,
    transparent: true,
    autoHideMenuBar: true,
    parent: mainWindow,
    modal: true,
    icon: path.join(__dirname, "image", "barabd.ico"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  updateWindow.loadFile("update.html");

  updateWindow.on("closed", () => {
    updateWindow = null;
  });

  // Send version info after window is ready
  updateWindow.webContents.on("did-finish-load", () => {
    if (updateInfo) {
      updateWindow.webContents.send("update-info", { version: updateInfo.version });
    }
  });
}

app.whenReady().then(() => {
  createWindow();

  // 🔥 FORCE update check (installed app only)
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }
});

// Update available - show custom window
autoUpdater.on("update-available", (info) => {
  updateInfo = info;
  createUpdateWindow();
});

// Download progress
autoUpdater.on("download-progress", (progress) => {
  if (updateWindow) {
    updateWindow.webContents.send("download-progress", progress.percent);
  }
});

// Update downloaded
autoUpdater.on("update-downloaded", () => {
  if (updateWindow) {
    updateWindow.webContents.send("update-downloaded");
  }
});

autoUpdater.on("error", (err) => {
  log.error("Updater error:", err);
  if (updateWindow) {
    updateWindow.close();
  }
  dialog.showErrorBox("Update Error", String(err));
});

// IPC handlers
ipcMain.on("start-download", () => {
  autoUpdater.downloadUpdate();
});

ipcMain.on("restart-app", () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on("close-update-window", () => {
  if (updateWindow) {
    updateWindow.close();
  }
});

app.on("window-all-closed", () => app.quit());

log.info("APP STARTED - packaged=" + app.isPackaged);
log.info("CHECKING FOR UPDATES...");
