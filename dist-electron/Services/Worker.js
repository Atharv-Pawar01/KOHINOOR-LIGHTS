
// const sqlite3 = require("sqlite3").verbose();
import xlsx  from "xlsx"
import path from "path"
import fs from "fs/promises"
import { db } from "../database.js";
import * as f from "fs"


//worker

export async function addWorker(workerData) {

    const { name, department, password, role,username } = workerData;


    // console.log(department)

    const row =await getQuery("SELECT department_id FROM DEPARTMENTs WHERE name = ?",[department])

    // console.log(department_id)
  
    return new Promise((resolve, reject) => {

        

      const query = `INSERT INTO Workers (name, department_id, password, role, username) VALUES (?, ?, ?, ?, ?)`;
  
      db.run(query, [name, row.department_id, password, role, username], function (err) {
        if (err) {
          console.error("❌ Error inserting worker:", err.message);
          reject("Failed to add worker.");
        } else {
          resolve({ success: true, worker_id: this.lastID });
        }
      });
    });
    
  }





  export const getWorkers = async () => {
    return new Promise((resolve, reject) => {
      db.all(
        `SELECT w.worker_id, w.name, w.role, w.department_id, d.name AS department_name, 
                w.isActive, w.adding, w.modify, w.view, w.master, w.inward, w.outward, w.username,w.password
         FROM Workers w
         LEFT JOIN Departments d ON w.department_id = d.department_id
         WHERE w.isActive = 1`,
        [],
        (err, rows) => {
          if (err) {
            console.error("❌ Error fetching workers:", err.message);
            reject(err);
          } else {
            // console.log("✅ Fetched Workers:", rows);
            resolve(rows);
          }
        }
      );
    });
  };
  
  





  export const deleteWorker = async (worker_id) => {

    // console.log(worker_id)
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE Workers SET isActive = 0 WHERE worker_id = ?`,
        [worker_id],
        function (err) {
          if (err) {
            console.error("❌ Error deleting worker:", err.message);
            reject({ success: false, error: err.message });
          } else {

            // console.log(worker_id)
            resolve({ success: true });
          }
        }
      );
    });
  };

 export const updateWorkerAccess = async ({ workerId, field, value }) => {

  // console.log(accessField)
    return new Promise((resolve, reject) => {
      db.run(
        `UPDATE Workers SET ${field} = ? WHERE worker_id = ?`,
        [value, workerId],
        function (err) {
          if (err) {
            // console.error("❌ Error updating worker access:", err.message);
            reject(err);
          } else {
            // console.log(`✅ Updated ${field} access for worker ${workerId} to ${value}`);
            resolve({ success: true });
          }
        }
      );
    });
  };
  
  // import db from "../database"; // Adjust the path based on your project structure
  export const updateWorker = async ({ worker_id, role, department_name, name,password }) => {
    try {
      // console.log("Received Data:", { worker_id, role, department_name, name,password });
  
      // Fetch department_id using a promise-based query
      const department = await getQuery(
        `SELECT department_id FROM Departments WHERE name COLLATE NOCASE = ?`,
        [department_name]
      );
  
      // console.log("Fetched Department:", department);
  
      if (!department) {
        return { success: false, message: "Invalid department selected or department does not exist." };
      }
  
      // console.log("Fetched Department ID:", department.department_id);
  
      // Ensure the worker exists before updating
      const existingWorker = await db.get(
        `SELECT * FROM Workers WHERE worker_id = ?`,
        [worker_id]
      );
  
      // console.log("Existing Worker:", existingWorker);
  
      if (!existingWorker) {
        return { success: false, message: "Worker ID not found." };
      }
  
      // Update worker details
      const result = await runQuery(
        `UPDATE Workers SET name = ?, role = ?, department_id = ?, password = ? WHERE worker_id = ?`,
        [name, role, department.department_id,password, worker_id]
      );
  
      // console.log("Update Result:", result);
  
      if (result.changes > 0) {
        return { success: true, message: "Worker updated successfully!" };
      } else {
        return { success: false, message: "No worker found or no changes made." };
      }
    } catch (error) {
      // console.error("Error updating worker:", error);
      return { success: false, message: "Error updating worker." };
    }
  };
  

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






export function getWorkerReport(workerUsername) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT 
                Orders.receipt_no AS receipt_no, 
                FinalMaterial.final_material_name, 
                Orders.final_material_expected_quantity, 
                Orders.given_date, 
                Labour.name AS labour_name
            FROM Orders
            LEFT JOIN FinalMaterial ON Orders.final_material_id = FinalMaterial.id
            LEFT JOIN Labour ON Orders.labour_id = Labour.id
            LEFT JOIN Workers ON Orders.worker_id = Workers.worker_id
            WHERE Workers.username = ?;
        `;

        db.all(query, [workerUsername], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching worker report:", err.message);
                reject({ success: false, message: "Database error" });
            } else {
                resolve({ success: true, data: rows });
            }
        });
    });
}


