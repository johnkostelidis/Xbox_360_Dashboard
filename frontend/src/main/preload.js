const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('xboxAPI', {
  getGames: () => ipcRenderer.invoke('get-games'),
  launchGame: (gameId) => ipcRenderer.invoke('launch-game', gameId),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
});
