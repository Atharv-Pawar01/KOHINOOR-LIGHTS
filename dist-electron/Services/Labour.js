
// const sqlite3 = require("sqlite3").verbose();
import xlsx  from "xlsx"
import path from "path"
import fs from "fs/promises"
import { db } from "../database.js";
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



            // ✅ Fetch department_id from Departments table
            const getDepartmentSql = `SELECT department_id FROM Departments WHERE name = ?`;

            db.get(getDepartmentSql, [formData.department], (err, row) => {
                if (err) {
                    console.error("❌ Error fetching department_id:", err);
                    return reject(err);
                }

                if (!row) {
                    console.error("❌ Department not found:", formData.department);
                    return reject(new Error("Department not found"));
                }

                const departmentId = row.department_id;



            // Insert into database
            const sql = `INSERT INTO Labour (name, customerId, department, area, city, pincode, telephone, aadhar, pancard, photo,department_id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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
                departmentId
            ];

            db.run(sql, params, function (err) {
                if (err) {
                    console.error("❌ Database error:", err);
                    reject(err);
                } else {
                    resolve({ success: true, id: this.lastID });
                }
            });

            })

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





export function getLabourPerformance(labourName) {
    return new Promise((resolve, reject) => {
      const sql = `
      SELECT 
          Orders.receipt_no, 
          FinalMaterial.final_material_name, 
          Orders.final_material_expected_quantity, 
          Workers.name AS worker_name, 
          Orders.given_date AS taken_date, 
          OrderProduction.received_date AS received_date
      FROM Orders
      JOIN FinalMaterial ON Orders.final_material_id = FinalMaterial.id
      JOIN Workers ON Orders.worker_id = Workers.worker_id
      LEFT JOIN OrderProduction ON Orders.id = OrderProduction.order_id
      JOIN Labour ON Orders.labour_id = Labour.id
      WHERE Labour.name = ?
      ORDER BY Orders.given_date DESC
  `;
  

        db.all(sql, [labourName], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching labour performance:", err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}


export function getGivenMaterialsByDate(startDate, endDate) {
  return new Promise((resolve, reject) => {
      const sql = `
          SELECT 
              Orders.receipt_no, 
              FinalMaterial.final_material_name, 
              Orders.final_material_expected_quantity, 
              Workers.name AS worker_name, 
              Labour.name AS labour_name, 
              Orders.given_date
          FROM Orders
          JOIN FinalMaterial ON Orders.final_material_id = FinalMaterial.id
          JOIN Workers ON Orders.worker_id = Workers.worker_id
          JOIN Labour ON Orders.labour_id = Labour.id
          WHERE Orders.given_date BETWEEN ? AND ?
          ORDER BY Orders.given_date DESC
      `;

      db.all(sql, [startDate, endDate], (err, rows) => {
          if (err) {
              console.error("❌ Error fetching given materials:", err);
              reject(err);
          } else {
              resolve(rows);
          }
      });
  });
}

export function getReceivedMaterialsByDate(startDate, endDate) {
  return new Promise((resolve, reject) => {
      const sql = `
          SELECT 
              FinalMaterial.final_material_name, 
              OrderProduction.produced_quantity AS received_quantity, 
              OrderProduction.received_date, 
              Workers.name AS worker_name, 
              Labour.name AS labour_name
          FROM OrderProduction
          JOIN Orders ON OrderProduction.order_id = Orders.id
          JOIN FinalMaterial ON Orders.final_material_id = FinalMaterial.id
          JOIN Workers ON Orders.worker_id = Workers.worker_id
          JOIN Labour ON Orders.labour_id = Labour.id
          WHERE OrderProduction.received_date BETWEEN ? AND ?
          ORDER BY OrderProduction.received_date DESC
      `;

      db.all(sql, [startDate, endDate], (err, rows) => {
          if (err) {
              console.error("❌ Error fetching received materials:", err);
              reject(err);
          } else {
              resolve(rows);
          }
      });
  });
}
