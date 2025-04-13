// import { ipcMain, WebContents, WebFrameMain } from 'electron';
// import { getUIPath } from './pathResolver.js';
// import { pathToFileURL } from 'url';

export function isDev() {
  return process.env.NODE_ENV === 'development';
}