const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");
const path = require("path");

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 800,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "image", "barabd.ico")
  });

  win.loadFile("index.html");
}

app.whenReady().then(() => {
  createWindow();

  // 🔄 Auto update check
  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => app.quit());
