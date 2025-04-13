const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("electron", {
    invoke: (channel, data) => ipcRenderer.invoke(channel, data),
    getStore: (key) => ipcRenderer.invoke("get-store", key),
    setStore: (key, value) => ipcRenderer.invoke("set-store", key, value),
    getUser: () => ipcRenderer.invoke("get-user"),
    setUser:(value)=>ipcRenderer.invoke('set-user',value)
    // showAlert: (title, message) => ipcRenderer.invoke("show-alert", { title, message }),
});