
// const sqlite3 = require("sqlite3").verbose();
import xlsx  from "xlsx"
import path from "path"
import fs from "fs/promises"
import { db } from "../database.js";
import * as f from "fs"


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


export async function assignMaterials(data) {
  try {
    const { labourId, materials, receiptNo, date, assignedBy, remarks } = data;
    const givenDate = date || new Date().toISOString().split("T")[0]; // Use provided date or current date
    const finalReceiptNo = receiptNo;

    // Get worker ID using assignedBy name
    const workerRow = await getQuery("SELECT worker_id FROM Workers WHERE name = ?", [assignedBy]);
    if (!workerRow) throw new Error(`Worker not found: ${assignedBy}`);
    const workerId = workerRow.worker_id; // Extract worker_id


    // console.log(data)

    // Begin transaction
    await runQuery("BEGIN TRANSACTION");

    for (const mat of materials) {
      // Get Final Material ID
      const finalMatRow = await getQuery(
        "SELECT id FROM FinalMaterial WHERE final_material_name = ?",
        [mat.name]
      );
      if (!finalMatRow) throw new Error(`Final Material not found: ${mat.name}`);
      const finalMaterialId = finalMatRow.id;

      // Insert into Orders table
      const orderResult = await runOrderQuery(
        `INSERT INTO Orders 
        (given_date, worker_id, final_material_id, labour_id, 
        final_material_expected_quantity, given_remarks, receipt_no, status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          givenDate,
          workerId,
          finalMaterialId,
          labourId,
          mat.quantity,
          remarks || "",
          finalReceiptNo,
          "pending",
        ]
      );

      const orderId = orderResult.lastID; // Get the newly inserted order ID

      // Get associated raw materials for the final material
      const rawMaterials = await getAllQuery(
        "SELECT raw_material_id, quantity, unit FROM FinalToRawMaterial WHERE final_material_id = ?",
        [finalMaterialId]
      );

      // Insert raw materials into OrderRawMaterials
      for (const rawMat of rawMaterials) {
        await runQuery(
          `INSERT INTO OrderRawMaterials (order_id, raw_material_id, quantity, unit) 
          VALUES (?, ?, ?, ?)`,
          [orderId, rawMat.raw_material_id, rawMat.quantity * mat.quantity, rawMat.unit]
        );
      }
    }

    // Commit transaction
    await runQuery("COMMIT");

    return { success: true, message: "Materials assigned successfully!", receiptNo: finalReceiptNo };
  } catch (error) {
    console.error("❌ Error assigning materials:", error);

    // Rollback transaction in case of error
    await runQuery("ROLLBACK");

    return { success: false, message: error.message };
  }
}

export async function getOrders(receiptNo = null) {
  try {
    let query = `
      SELECT o.id AS order_id, o.receipt_no, o.given_date, o.worker_id, w.name AS worker_name, 
            o.final_material_id, f.final_material_name, o.labour_id, l.name AS labour_name,
            o.final_material_expected_quantity, o.given_remarks, o.status,
            (SELECT COALESCE(SUM(op.produced_quantity), 0) 
             FROM OrderProduction op WHERE op.order_id = o.id) AS total_produced_quantity,  
            (SELECT COALESCE(SUM(op.damaged_quantity), 0) 
             FROM OrderProduction op WHERE op.order_id = o.id) AS total_damaged_quantity,  
            o.is_fulfilled  
      FROM Orders o
      JOIN Workers w ON o.worker_id = w.worker_id
      JOIN FinalMaterial f ON o.final_material_id = f.id
      JOIN Labour l ON o.labour_id = l.id
    `;

    const params = [];

    if (receiptNo) {
      query += " WHERE o.receipt_no = ?";
      params.push(receiptNo);
    }

    const orders = await getAllQuery(query, params);

    if (!orders.length) {
      return { success: false, message: "No orders found." };
    }

    // Fetch raw materials for each order
    for (const order of orders) {
      order.usedRawMaterials = await getAllQuery(
        `SELECT r.raw_material_name, orm.quantity, orm.unit 
         FROM OrderRawMaterials orm
         JOIN RawMaterial r ON orm.raw_material_id = r.id
         WHERE orm.order_id = ?`, 
        [order.order_id]
      );
    }

    return { success: true, orders };
  } catch (error) {
    // console.error("❌ Error fetching orders:", error);
    return { success: false, message: error.message };
  }
}




export async function fetchPendingMaterials () {
const query = `
 SELECT 
    Orders.given_date,
    Orders.labour_id,
    Labour.name AS labour_name,
    GROUP_CONCAT(DISTINCT RM.raw_material_name || ' (' || FMRM.quantity || ')') AS required_raw_materials,
    FM.final_material_name,
    CONCAT(Orders.final_material_expected_quantity || ' ' || FM.unit) AS final_material_expected_quantity,
    Orders.receipt_no
FROM Orders
JOIN FinalMaterial FM ON Orders.final_material_id = FM.id
JOIN FinalToRawMaterial  FMRM ON FM.id = FMRM.final_material_id
JOIN RawMaterial RM ON FMRM.raw_material_id = RM.id
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


  export async function runOrderQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve({ lastID: this.lastID, changes: this.changes });
        }
      });
    });
  }
  



  export async function getAllQuery(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }