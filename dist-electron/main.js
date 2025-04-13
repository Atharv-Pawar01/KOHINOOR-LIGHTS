import { app, BrowserWindow, ipcMain } from "electron";
// import { insertLabour, getLabours, updateLabour, getFinalMaterialsWithRaw, updateFinalMaterial, finalMaterials, getRawMaterials, assignMaterials, fetchPendingMaterials, addDepartments, getDepartments, updateDepartments, addWorker } from "./Services.js";
import { isDev } from "./util.js";
import { getUIPath } from "./pathResolver.js";
import path from "path";
import { fileURLToPath } from "url";
// import { AddMaterials } from "./Services.js";
import fs from "fs";



import { insertLabour,getLabours,updateLabour,uploadLabourPhoto } from "./Services/Labour.js";
import {addDepartments,getDepartments,updateDepartments} from './Services/Department.js'
import {AddMaterials,getFinalMaterialsWithRaw,updateFinalMaterial,finalMaterials,getRawMaterials,assignMaterials,fetchPendingMaterials, getOrders} from "./Services/Material.js"
import { addWorker, deleteWorker, getWorkers, updateWorker, updateWorkerAccess } from "./Services/Worker.js";
import { store } from "./userStore.js";
import { login, logout } from "./Services/auth.js";
import { getFilteredOrders } from "./Services/report.js";
import { receiveMaterials } from "./Services/Receive.js";
// import { getFilteredOrders } from "./Services/report.js";
// import { receiveMaterials } from "./Services/Receive.js";
import { getWorkerReport } from "./Services/Worker.js";
import { getLabourPerformance } from "./Services/Labour.js";
import { getGivenMaterialsByDate } from "./Services/Labour.js";
import { getReceivedMaterialsByDate } from "./Services/Labour.js";



// Resolve `__dirname` correctly for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

// ✅ **Ensure proper storage location (Production & Development)**
const storagePath = app.isPackaged
  ? path.join(app.getPath("userData"), "kohinoor_lights")
  : process.cwd();

// ✅ **Ensure the directory exists**
if (!fs.existsSync(storagePath)) {
  fs.mkdirSync(storagePath, { recursive: true });
}

// ✅ **Create Electron Window**
const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load UI (Dev: Server | Prod: Packaged Files)
  if (isDev()) {
    mainWindow.loadURL("http://localhost:5123");
  } else {
    mainWindow.loadFile(getUIPath());
  }
};

// ✅ **Handle App Ready Event**
app.whenReady().then(() => {
  createWindow();

  // Reopen window when clicking the app icon (Mac)
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ✅ **Graceful Exit Handling**
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});



ipcMain.handle("login",async(event,{username,password}) => {
    const response=await login({username,password});
    return response;
})


ipcMain.handle("logout",async(event) => {
  const response=await logout();
  return response;
})



// Handle data from React
ipcMain.handle("get-store", (event, key) => {
  return store.get(key);
});

ipcMain.handle("set-user", (event, value) => {
  store.set("user", value);
});

ipcMain.handle("get-user",(event)=>{
  return store.get("user")
})


ipcMain.handle("getOrderByReceipt",async(event,data)=>{
  return await getOrders(data)
})




// 🛠 **Handle Labour Insert**
ipcMain.handle("insert-labour", async (event, formData) => {
  try {
    const response = await insertLabour(formData);
    return { success: true, id: response };
  } catch (error) {
    console.error("Error in insert-labour:", error);
    return { success: false, error: error.message };
  }
});

// 🛠 **Fetch Labour Data**
ipcMain.handle("get-labours", async () => {
  try {
    return await getLabours();
  } catch (error) {
    console.error("Error fetching labours:", error);
    return { success: false, error: error.message };
  }
});

// 🛠 **Fetch Final Materials With Raw**
ipcMain.handle("getFinalMaterialsWithRaw", async () => {
  try {
    let result = await getFinalMaterialsWithRaw();
    return result;
  } catch (error) {
    console.error("Error fetching Final Materials:", error);
    return { success: false, error: error.message };
  }
});


ipcMain.handle("receiveMaterials", async (event,data) => {
  try {
   let result=await receiveMaterials(data)
    return result;
  } catch (error) {
    
    return error;
  }
});


// 🛠 **Update Labour Data**
ipcMain.handle("update-labour", async (event, labourData) => {
  try {

    const { id, name, customerId, department, area, city, pincode, telephone, aadhar, pancard } = labourData;
    const result = await updateLabour(id, name, customerId, department, area, city, pincode, telephone, aadhar, pancard);

    return { success: true, message: result.message, changes: result.changes };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 🛠 **Handle Excel File Upload**
ipcMain.handle("upload-excel", async (event, { name, data }) => {
  try {
    if (!name || !data) {
      throw new Error("Invalid file data received.");
    }

    // ✅ **Store file in appropriate directory**
    const filePath = path.join(storagePath, name);

    // Convert ArrayBuffer to Buffer & write to file
    const buffer = Buffer.from(data);
    fs.writeFileSync(filePath, buffer);

    // Process the Excel file
    const result = await AddMaterials(filePath);

    return { success: true, message: "Excel data imported successfully!" };
  } catch (error) {
    console.error("❌ Error processing file:", error);
    return { success: false, message: "Failed to process file." };
  }
});



// Update final material name
ipcMain.handle("updateFinalMaterial", async (event, materialData) => {
  const data= await updateFinalMaterial(materialData);

  return data
});




// Fetch Final Materials
ipcMain.handle("fetch-final-materials", async () => {
    const data=await finalMaterials()
    return data;
});


// Fetch Raw Materials for a Final Material
ipcMain.handle("fetch-raw-materials", async (event, finalMaterialId) => {
  const data=await getRawMaterials(finalMaterialId)
  return data;
});



ipcMain.handle("assign-materials", async (event, data) => {
    const response=await assignMaterials(data)
    return response;
})



ipcMain.handle("fetch-pending-orders", async () => {
    const response=await fetchPendingMaterials();
    return response;
});

ipcMain.handle("add-department", async (event, { name, department_code }) => {

  if (!name || !department_code) {
      return { success: false, error: "Missing required fields: name or department_code" };
  }

  try {
      const response = await addDepartments(name, department_code);
      return response;
  } catch (error) {
      return error;
  }
});




ipcMain.handle("get-departments", async () => {
    const data=await getDepartments();
    return data;
});


ipcMain.handle("update-department",async (event,{department_id , department_code , name})=>{
  const data=await updateDepartments(department_id,department_code,name);
  return data;
})



// ✅ Handle Worker Insertion from Renderer
ipcMain.handle("addWorker", async (_, workerData) => {
 const data=await addWorker(workerData);

 return data
});


ipcMain.handle("get-workers",async ()=>{
  return await getWorkers();
})


ipcMain.handle("delete-worker",async (event,{ workerId})=>{

  return await deleteWorker( workerId)
})


ipcMain.handle("update-worker-access",async (event,data)=>{
  // console.log(data)
  const result=await updateWorkerAccess(data)

  return result

});




ipcMain.handle("update-worker",async (event ,{worker_id,role,department_name,name,password})=>{
  // console.log(data);


  const result=await updateWorker({worker_id,role,department_name,name,password})


  
})



ipcMain.handle("get-filtered-orders",async (_, filters) => {
  return new Promise((resolve) => {
    getFilteredOrders(filters, (err, rows) => {
      if (err) {
        resolve({ success: false, error: err.message });
      } else {
        resolve({ success: true, data: rows });
      }
    });
  });
});

//   ipcMain.handle("upload-labour-photo", async (event, formData) => {
//     try {
//         const uploadDir = ensureUploadDir();
//         const fileBuffer = formData.file;
//         const fileName = `labour_${Date.now()}.jpg`;
//         const filePath = path.join(uploadDir, fileName);

//         // Save the file
//         fs.writeFileSync(filePath, fileBuffer);

//         return { filePath };
//     } catch (error) {
//         console.error("Error uploading file:", error);
//         return { error: "Failed to upload file" };
//     }
// });





ipcMain.handle("fetch-worker-report", async (event, workerUsername) => {
    try {
        const report = await getWorkerReport(workerUsername);
        return report;
    } catch (error) {
        return { success: false, message: "Error retrieving report" };
    }
});


ipcMain.handle("fetch-labour-report", async (event, labourName) => {
  try {
      const data = await getLabourPerformance(labourName);
      return { success: true, data };
  } catch (error) {
      return { success: false, error: "Error retrieving data" };
  }
});

ipcMain.handle("fetch-given-materials", async (event, { startDate, endDate }) => {
  try {

    console.log(startDate)
      const data = await getGivenMaterialsByDate(startDate, endDate);
      return { success: true, data };
  } catch (error) {
      return { success: false, error: "Error retrieving given materials" };
  }
});

// Fetch received materials within a date range
ipcMain.handle("fetch-received-materials", async (event, { startDate, endDate }) => {
  try {
      const data = await getReceivedMaterialsByDate(startDate, endDate);
      return { success: true, data };
  } catch (error) {
      return { success: false, error: "Error retrieving received materials" };
  }
});



ipcMain.handle("fetch-given-materials-by-dept", async (event, { startDate, endDate, departmentName }) => {
  try {
      const data = await getGivenMaterialsByDepartment(startDate, endDate, departmentName);
      return { success: true, data };
  } catch (error) {
      return { success: false, error: "Error retrieving received materials" };
  }
});

ipcMain.handle("fetch-received-materials-by-dept", async (event, { startDate, endDate, departmentName }) => {
  try {
      const data = await getReceivedMaterialsByDepartment(startDate, endDate, departmentName);
      return { success: true, data };
  } catch (error) {
      return { success: false, error: "Error retrieving received materials" };
  }
});