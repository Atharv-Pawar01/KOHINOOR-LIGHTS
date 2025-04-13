
// const sqlite3 = require("sqlite3").verbose();
import xlsx  from "xlsx"
import path from "path"
import fs from "fs/promises"
import { db } from "./database.js";
import * as f from "fs"




// Insert Labour Data
export async function insertLabour(formData) {
    return new Promise(async (resolve, reject) => {
        try {
            let photoPath = "";

            if (formData.photo && typeof formData.photo === "object" && formData.photo.data) {
                const uploadDir = path.join(process.cwd(), "uploads");

                // ✅ Corrected mkdir call
                await fs.mkdir(uploadDir, { recursive: true });

                // Extract file extension from file name
                const fileExt = path.extname(formData.photo.name) || ".jpg"; // Default to JPG if no extension
                const fileName = `${Date.now()}${fileExt}`;
                photoPath = path.join(uploadDir, fileName);

                // Convert Base64 string to Buffer and save file
                const buffer = Buffer.from(formData.photo.data, "base64");
                await fs.writeFile(photoPath, buffer);
            }

            // Insert into database
            const sql = `INSERT INTO Labour (name, customerId, department, area, city, pincode, telephone, aadhar, pancard, photo) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

            const params = [
                formData.name,
                formData.customerId,
                formData.department,
                formData.area,
                formData.city,
                formData.pincode,
                formData.telephone,
                formData.aadhar,
                formData.pancard,
                photoPath || null,
            ];

            db.run(sql, params, function (err) {
                if (err) {
                    console.error("❌ Database error:", err);
                    reject(err);
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });

        } catch (error) {
            console.error("❌ Error inserting labour:", error);
            reject(error);
        }
    });
}



export function getLabours() {
    return new Promise((resolve, reject) => {
      db.all("SELECT * FROM Labour", [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows.map(row => ({
            ...row,
            photo: row.photo ? `file://${row.photo}` : null, // Convert path to file URL
          })));
        }
      });
    });
  }

  export function updateLabour(id, name, customerId, department, area, city, pincode, telephone, aadhar, pancard) {

    
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE Labour 
         SET name = ?, customerId = ?, department = ?, area = ?, city = ?, 
             pincode = ?, telephone = ?, aadhar = ?, pancard = ? 
         WHERE id = ?`,
        [name, customerId, department, area, city, pincode, telephone, aadhar, pancard, id],
        function (err) {
          if (err) {
            reject(err);
          } else {
            resolve({ message: `Labour with ID ${id} updated!`, changes: this.changes });
          }
        }
      );
    });
  }
  



export async function uploadLabourPhoto(photo) {
  return new Promise(async (resolve, reject) => {
      try {
          if (!photo || typeof photo !== "object" || !photo.data) {
              return resolve(null); // No photo provided
          }

          const uploadDir = path.join(process.cwd(), "uploads");
          await fs.mkdir(uploadDir, { recursive: true });

          // Extract file extension from file name, default to .jpg if missing
          const fileExt = path.extname(photo.name) || ".jpg";
          const fileName = `labour_${Date.now()}${fileExt}`;
          const filePath = path.join(uploadDir, fileName);

          // Convert Base64 to Buffer and save file
          const buffer = Buffer.from(photo.data, "base64");
          await fs.writeFile(filePath, buffer);

          resolve(filePath);
      } catch (error) {
          console.error("Error uploading labour photo:", error);
          reject(error);
      }
  });
}

//completed


export async function AddMaterials(filePath) {
  try {
      if (!f.existsSync(filePath)) {
          throw new Error(`File not found at path: ${filePath}`);
      }

      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];

      // Convert sheet to JSON
      const data = xlsx.utils.sheet_to_json(sheet, { defval: "" });

      const finalMaterials = new Set();
      const rawMaterials = new Set();
      const mappings = [];

      let currentBOM = null;
      let currentFinalMaterial = null;

      data.forEach((row) => {
          const bomName = row["BOM Name"] || currentBOM;
          const finalMaterial = row["Item To Produce"] || currentFinalMaterial;
          const rawMaterial = row["Raw Mat./By Product"];
          
          // Extract final material quantity and unit
          let finalMaterialQtyUnit = row["Qty/Unit"] ? row["Qty/Unit"].toString().trim() : "";
          const finalMatch = finalMaterialQtyUnit.match(/^([\d.]+)\s*(\w+)?$/);
          const finalMaterialQuantity = finalMatch ? parseFloat(finalMatch[1]) || 0 : 0;
          const finalMaterialUnit = finalMatch && finalMatch[2] ? finalMatch[2].trim() : "";

          // Extract raw material quantity & unit
          const quantityIndex = Object.keys(row).indexOf("Raw Mat./By Product") + 1;
          let rawMaterialQtyUnit = quantityIndex < Object.keys(row).length 
              ? row[Object.keys(row)[quantityIndex]].toString().trim() 
              : "";
          const match = rawMaterialQtyUnit.match(/^([\d.]+)\s*(\w+)?$/);
          const rawMaterialQuantity = match ? parseFloat(match[1]) || 0 : 0;
          const rawMaterialUnit = match && match[2] ? match[2].trim() : "";

          if (bomName && finalMaterial) {
              currentBOM = bomName;
              currentFinalMaterial = finalMaterial;
              finalMaterials.add(JSON.stringify({
                  bomName,
                  finalMaterial,
                  quantity: finalMaterialQuantity,
                  unit: finalMaterialUnit
              }));
          }

          if (rawMaterial) {
              rawMaterials.add(rawMaterial);
              mappings.push({
                  finalMaterial,
                  rawMaterial,
                  quantity: rawMaterialQuantity,
                  unit: rawMaterialUnit
              });
          }
      });

      // Insert Unique Final Materials
      for (const item of finalMaterials) {
          const { bomName, finalMaterial, quantity, unit } = JSON.parse(item);
          await runQuery(
              `INSERT OR IGNORE INTO FinalMaterial (bom_name, final_material_name, quantity, unit) VALUES (?, ?, ?, ?)`,
              [bomName, finalMaterial, quantity, unit]
          );
      }

      // Insert Unique Raw Materials
      for (const rawMaterial of rawMaterials) {
          await runQuery(`INSERT OR IGNORE INTO RawMaterial (raw_material_name) VALUES (?)`, [rawMaterial]);
      }

      // Map Raw Materials to Final Materials
      for (const { finalMaterial, rawMaterial, quantity, unit } of mappings) {
          const finalRow = await getQuery(`SELECT id FROM FinalMaterial WHERE final_material_name = ?`, [finalMaterial]);
          if (!finalRow) continue;

          const rawRow = await getQuery(`SELECT id FROM RawMaterial WHERE raw_material_name = ?`, [rawMaterial]);
          if (!rawRow) continue;

          await runQuery(
              `INSERT OR IGNORE INTO FinalToRawMaterial (final_material_id, raw_material_id, quantity, unit) VALUES (?, ?, ?, ?)`,
              [finalRow.id, rawRow.id, quantity, unit]
          );
      }

      return { success: true };
  } catch (error) {
      console.error("❌ Error importing Excel data:", error);
      throw error;
  }
}


// Helper function to run DB queries
function runQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ message: "Query executed", changes: this.changes });
        });
    });
}

// Helper function to get DB query result
function getQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

export const getFinalMaterialsWithRaw = () => {
  return new Promise((resolve, reject) => {
      const query = `
          SELECT 
              fr.id,
              fm.final_material_name,
              fm.bom_name,
              rm.raw_material_name, 
              fr.quantity,
              fr.unit  -- Include unit from FinalToRawMaterial table
          FROM FinalToRawMaterial fr
          JOIN FinalMaterial fm ON fr.final_material_id = fm.id
          JOIN RawMaterial rm ON fr.raw_material_id = rm.id
          ORDER BY fm.final_material_name;
      `;

      db.all(query, [], (err, rows) => {
          if (err) {
              console.error("Error fetching data:", err.message);
              reject(err);
          } else {
              resolve(rows);
          }
      });
  });
};


export async function updateFinalMaterial({ id, raw_material_name, quantity, unit }) {
  return new Promise((resolve, reject) => {

      db.get("SELECT id FROM FinalToRawMaterial WHERE id = ?", [id], (err, row) => {
          if (err) {
              reject(err);
              return;
          }

          if (!row) {
              reject(new Error(`No entry found with ID: ${id}`));
              return;
          }

          // Retrieve raw_material_id based on name
          db.get("SELECT id FROM RawMaterial WHERE raw_material_name = ?", [raw_material_name], (err, rawRow) => {
              if (err) {
                  reject(err);
                  return;
              }

              if (!rawRow) {
                  reject(new Error("Raw material not found"));
                  return;
              }

              const raw_material_id = rawRow.id;

              db.run(
                  "UPDATE FinalToRawMaterial SET raw_material_id = ?, quantity = ?, unit = ? WHERE id = ?",
                  [raw_material_id, quantity, unit, id],
                  function (err) {
                      if (err) {
                          reject(err);
                      } else if (this.changes === 0) {
                          reject(new Error(`No changes made, material ID (${id}) may be incorrect`));
                      } else {
                          resolve({ success: true, message: "Material updated successfully" });
                      }
                  }
              );
          });
      });
  });
}


export async function finalMaterials()
{
  return new Promise((resolve, reject) => {
    db.all("SELECT * FROM FinalMaterial", [], (err, rows) => {
      if (err) reject(err);
      resolve(rows);
    });
  });
}


export async function getRawMaterials(finalMaterialId)
{

  return new Promise((resolve, reject) => {
      const query = `
        SELECT rm.raw_material_name, fr.quantity, fr.unit 
        FROM FinalToRawMaterial fr
        JOIN RawMaterial rm ON fr.raw_material_id = rm.id
        WHERE fr.final_material_id = ?;
      `;
  
      db.all(query, [finalMaterialId], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
}






// IPC Handler to Assign Materials
export async function assignMaterials(data){
  try {
    const { labourId, materials, rawMaterials, receiptNo, date, assignedBy, remarks } = data;

    const givenDate = date || new Date().toISOString().split("T")[0]; // Use provided date or current date

    // If no receipt number is provided, generate one
    const finalReceiptNo = receiptNo ;

    const insertPromises = materials.map(async (mat) => {
      const finalMatRow = await getQuery(
        "SELECT id FROM FinalMaterial WHERE final_material_name = ?",
        [mat.name]
      );
      if (!finalMatRow) throw new Error(`Final Material not found: ${mat.name}`);

      return rawMaterials.map(async (raw) => {
        const rawMatRow = await getQuery(
          "SELECT id FROM RawMaterial WHERE raw_material_name = ?",
          [raw.name]
        );
        if (!rawMatRow) throw new Error(`Raw Material not found: ${raw.name}`);

        return runQuery(
          `INSERT INTO Orders 
          (raw_material_id, given_date, worker_id, final_material_id, labour_id, 
          raw_material_quantity, final_material_expected_quantity, given_remarks, receipt_no, status) 
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            rawMatRow.id,
            givenDate,
            assignedBy, // Worker who assigned the material
            finalMatRow.id,
            labourId,
            raw.quantity,
            mat.quantity,
            remarks || "",
            finalReceiptNo,
            "pending",
          ]
        );
      });
    });

    // Execute all insert queries
    await Promise.all(insertPromises.flat());

    return { success: true, message: "Materials assigned successfully!", receiptNo: finalReceiptNo };
  } catch (error) {
    console.error("❌ Error assigning materials:", error);
    return { success: false, message: error.message };
  }
}

export async function fetchPendingMaterials () {
const query = `
   SELECT 
    Orders.given_date,
    Orders.labour_id,
    Labour.name AS labour_name,
    GROUP_CONCAT(RawMaterial.raw_material_name || ' (' || Orders.raw_material_quantity || ')') AS raw_materials,
    FinalMaterial.final_material_name,
    CONCAT(Orders.final_material_expected_quantity || ' ' || FinalMaterial.unit ) as final_material_expected_quantity,
    Orders.receipt_no
FROM Orders
JOIN RawMaterial ON Orders.raw_material_id = RawMaterial.id
JOIN FinalMaterial ON Orders.final_material_id = FinalMaterial.id
JOIN Labour ON Orders.labour_id = Labour.id
WHERE Orders.status = 'pending'
GROUP BY Orders.labour_id, Orders.given_date, Orders.final_material_id, Orders.final_material_expected_quantity, Orders.receipt_no;

  `;

  try {

    // Workers.name AS worker_name,

    // JOIN Workers ON Orders.worker_id = Workers.worker_id
    return await new Promise((resolve, reject) => {
      db.all(query, [], (err, rows) => {
        if (err) {
          console.error("Error fetching pending orders:", err.message);
          reject([]);
        } else {
         
          resolve(rows);
        }
      });
    });
  } catch (error) {
    return [];
  }}



  
export async function addDepartments(name, department_code) {
  return new Promise((resolve, reject) => {
      const query = `INSERT INTO Departments (name, department_code) VALUES (?, ?)`;

      db.run(query, [name, department_code], function (err) {
          if (err) {
              console.error("❌ Error adding department:", err.message);
              reject({ success: false, error: err.message });
          } else {
              resolve({ success: true, department_id: this.lastID });
          }
      });
  });
}


export async function getDepartments(){
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM Departments`;
    db.all(query, [], (err, rows) => {
        if (err) {
            console.error("❌ Error fetching departments:", err.message);
            reject({ success: false, error: err.message });
        } else {
            resolve({ success: true, departments: rows });
        }
    });
});
}


export async function updateDepartments(department_id, department_code, name) {
  return new Promise((resolve, reject) => {
      const query = `UPDATE Departments SET department_code = ?, name = ? WHERE department_id = ?`;

      db.run(query, [department_code, name, department_id], function (err) {
          if (err) {
              console.error("❌ Error updating department:", err.message);
              reject({ success: false, error: err.message });
          } else {
              resolve({ success: true });
          }
      });
  });
}






//worker

export async function addWorker(workerData) {

  const { name, department, password, role } = workerData;

  return new Promise((resolve, reject) => {
    const query = `INSERT INTO Workers (name, department_id, password, role) VALUES (?, ?, ?, ?)`;

    db.run(query, [name, department_id, password, role], function (err) {
      if (err) {
        console.error("❌ Error inserting worker:", err.message);
        reject("Failed to add worker.");
      } else {
        resolve({ success: true, worker_id: this.lastID });
      }
    });
  });
  
}


// const cleanText = (text) => text ? text.replace(/[\u200B-\u200D\uFEFF\n\r\t]/g, "").trim().toLowerCase() : "";
// const cleanText = (text) => text ? text.replace(/[\u200B-\u200D\uFEFF\n\r\t]/g, "").trim().toLowerCase() : "";
// // Create tables
// db.serialize(() => {
//     db.run(`CREATE TABLE IF NOT EXISTS FinalMaterial (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         bom_name TEXT,
//         final_material_name TEXT,
//         UNIQUE(bom_name, final_material_name)
//     )`);

//     db.run(`CREATE TABLE IF NOT EXISTS RawMaterial (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         raw_material_name TEXT UNIQUE
//     )`);

//     db.run(`CREATE TABLE IF NOT EXISTS FinalToRawMaterial (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         final_material_id INTEGER,
//         raw_material_id INTEGER,
//         quantity REAL,
//         FOREIGN KEY (final_material_id) REFERENCES FinalMaterial(id),
//         FOREIGN KEY (raw_material_id) REFERENCES RawMaterial(id)
//     )`);
// });

