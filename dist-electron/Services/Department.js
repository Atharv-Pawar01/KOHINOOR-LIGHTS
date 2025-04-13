
// const sqlite3 = require("sqlite3").verbose();
import xlsx  from "xlsx"
import path from "path"
import fs from "fs/promises"
import { db } from "../database.js";
import * as f from "fs"


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


export function getGivenMaterialsByDepartment(startDate, endDate, departmentName) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                FinalMaterial.final_material_name, 
                Orders.final_material_expected_quantity, 
                Orders.given_date,
                Workers.name AS worker_name, 
                Labour.name AS labour_name
            FROM Orders
            JOIN FinalMaterial ON Orders.final_material_id = FinalMaterial.id
            JOIN Workers ON Orders.worker_id = Workers.worker_id
            JOIN Labour ON Orders.labour_id = Labour.id
            JOIN Departments ON Workers.department_id = Departments.department_id
            WHERE Orders.given_date BETWEEN ? AND ?
            AND Departments.name = ?
            ORDER BY Orders.given_date DESC;
        `;
  
        db.all(sql, [startDate, endDate, departmentName], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching department given materials:", err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
  }
  
  export function getReceivedMaterialsByDepartment(startDate, endDate, departmentName) {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                FinalMaterial.final_material_name, 
                OrderProduction.produced_quantity as received_quantity, 
                OrderProduction.received_date,
                Workers.name AS worker_name, 
                Labour.name AS labour_name
            FROM OrderProduction
            JOIN Orders ON OrderProduction.order_id = Orders.id
            JOIN FinalMaterial ON Orders.final_material_id = FinalMaterial.id
            JOIN Workers ON Orders.worker_id = Workers.worker_id
            JOIN Labour ON Orders.labour_id = Labour.id
            JOIN Departments ON Workers.department_id = Departments.department_id
            WHERE OrderProduction.received_date BETWEEN ? AND ?
            AND Departments.name = ?
            ORDER BY OrderProduction.received_date DESC;
        `;
  
        db.all(sql, [startDate, endDate, departmentName], (err, rows) => {
            if (err) {
                console.error("❌ Error fetching department received materials:", err);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
  }