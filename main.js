const { app, BrowserWindow, dialog } = require("electron");
const path = require("path");

const log = require("electron-log");
const { autoUpdater } = require("electron-updater");

// logger setup (must be before updater)
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
  return win;
}

app.whenReady().then(() => {
  createWindow();

  // 🔥 FORCE update check (installed app only)
  if (app.isPackaged) {
    autoUpdater.checkForUpdates();
  }
});

autoUpdater.on("update-available", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update Available",
    message: "New version is available. Downloading update..."
  });
});

autoUpdater.on("update-downloaded", () => {
  dialog.showMessageBox({
    type: "info",
    title: "Update Ready",
    message: "Update downloaded. Restart now?",
    buttons: ["Restart", "Later"],
    defaultId: 0
  }).then(r => {
    if (r.response === 0) {
      autoUpdater.quitAndInstall();
    }
  });
});

autoUpdater.on("error", (err) => {
  dialog.showErrorBox("Update Error", String(err));
  log.error("Updater error:", err);
});

app.on("window-all-closed", () => app.quit());

log.info("APP STARTED - packaged=" + app.isPackaged);
log.info("CHECKING FOR UPDATES...");
