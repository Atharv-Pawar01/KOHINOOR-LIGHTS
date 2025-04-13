import { ipcMain } from "electron";
import { db } from "../database.js";

export const receiveMaterials= async ( { receiptNo, receivingDate, items ,worker_id}) => {
    try {
        if (!receiptNo || !receivingDate || !Array.isArray(items) || items.length === 0) {
            return { success: false, message: "Invalid input data" };
        }

        const received_date = new Date(receivingDate).toISOString().split("T")[0]; // Ensure format: YYYY-MM-DD
        const batchNumbersMap = {}; // Store batch numbers for each order

        for (const item of items) {
            const { order_id, produced_quantity, damaged_quantity, remarks, amount_per_production } = item;

            if (!order_id || produced_quantity == null || damaged_quantity == null) {
                return { success: false, message: "Missing required fields in materials" };
            }

            // Step 1: Check if order exists and is not fulfilled
            const orderRow = await new Promise((resolve, reject) => {
                db.get(`SELECT final_material_expected_quantity, is_fulfilled FROM Orders WHERE id = ?`, [order_id], (err, row) => {
                    if (err) reject(err);
                    else resolve(row);
                });
            });

            if (!orderRow) {
                return { success: false, message: `Order ${order_id} not found` };
            }

            if (orderRow.is_fulfilled) {
                return { success: false, message: `Order ${order_id} is already fulfilled. No more production allowed.` };
            }

            const expectedQuantity = orderRow.final_material_expected_quantity;

            // Step 2: Get current total produced + damaged quantity
            const totalProduced = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT COALESCE(SUM(produced_quantity + damaged_quantity), 0) AS total_quantity 
                     FROM OrderProduction WHERE order_id = ?`,
                    [order_id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row?.total_quantity || 0);
                    }
                );
            });


            

            const newTotal = totalProduced + parseFloat(produced_quantity) + parseFloat(damaged_quantity);
            // console.log(totalProduced + produced_quantity + damaged_quantity)

            // console.log(newTotal,"     ",expectedQuantity)

            if (newTotal > expectedQuantity) {
                return {
                    success: false,
                    message: `Exceeding expected quantity for order ${order_id}! Remaining: ${expectedQuantity - totalProduced}`,
                };
            }

            // Generate batch number
            const todayDate = new Date().toISOString().split("T")[0].replace(/-/g, ""); // YYYYMMDD format

            const lastBatch = await new Promise((resolve, reject) => {
                db.get(
                    `SELECT batch_number FROM OrderProduction 
                     WHERE order_id = ? ORDER BY id DESC LIMIT 1`,
                    [order_id],
                    (err, row) => {
                        if (err) reject(err);
                        else resolve(row?.batch_number || null);
                    }
                );
            });

            let batchSequence = 1;
            if (lastBatch) {
                const lastSequence = parseInt(lastBatch.split("-").pop(), 10);
                batchSequence = isNaN(lastSequence) ? 1 : lastSequence + 1;
            }

            const batch_number = `ORD${order_id}-${todayDate}-${String(batchSequence).padStart(3, "0")}`;

            // Store batch number per order
            if (!batchNumbersMap[order_id]) {
                batchNumbersMap[order_id] = [];
            }
            batchNumbersMap[order_id].push(batch_number);

            // Insert into database
            await new Promise((resolve, reject) => {
                db.run(
                    `INSERT INTO OrderProduction 
                     (order_id, batch_number, produced_quantity, damaged_quantity, received_date, received_remarks, received_by, amount_per_production) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                    [order_id, batch_number, produced_quantity, damaged_quantity, received_date, remarks || "", worker_id,amount_per_production],
                    (err) => {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            });

            // Step 4: Check if order is now fulfilled
            // Step 4: Check if order is now fulfilled
if (newTotal === expectedQuantity) {
    await new Promise((resolve, reject) => {
        db.run(`UPDATE Orders SET is_fulfilled = 1, status = 'received' WHERE id = ?`, [order_id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
} else {
    await new Promise((resolve, reject) => {
        db.run(`UPDATE Orders SET status = 'inprogress' WHERE id = ?`, [order_id], (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

        }



        return { success: true, message: "Materials received successfully!", batch_numbers: batchNumbersMap };

    } catch (error) {
        console.error("❌ Error receiving materials:", error.message);
        return { success: false, message: "Database error" };
    }
}
