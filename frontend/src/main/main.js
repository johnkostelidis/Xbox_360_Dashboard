const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 720,
    fullscreen: false,
    frame: false,
    backgroundColor: '#1a1a1a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, '../../public/icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Toggle fullscreen with F11
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F11') {
      mainWindow.setFullScreen(!mainWindow.isFullScreen());
    }
    if (input.key === 'Escape' && mainWindow.isFullScreen()) {
      mainWindow.setFullScreen(false);
    }
  });

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (mainWindow === null) createWindow();
});

// IPC handlers for future backend integration
ipcMain.handle('get-games', async () => {
  // Placeholder — will call Spring Boot API
  return [];
});

ipcMain.handle('launch-game', async (event, gameId) => {
  // Placeholder — will call Spring Boot API
  return { success: false, message: 'Backend not connected' };
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  }
});
