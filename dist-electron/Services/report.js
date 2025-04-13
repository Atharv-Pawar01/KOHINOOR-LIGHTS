import xlsx  from "xlsx"
import path from "path"
import fs from "fs/promises"
import { db } from "../database.js";
import * as f from "fs"



export const getFilteredOrders = (filters, callback) => {
    let query = `
      SELECT Orders.*, 
             Workers.name AS worker_name, 
             Labour.name AS labour_name, 
             RawMaterial.raw_material_name, 
             FinalMaterial.final_material_name
      FROM Orders
      LEFT JOIN Workers ON Orders.worker_id = Workers.worker_id
      LEFT JOIN Labour ON Orders.labour_id = Labour.id
      LEFT JOIN RawMaterial ON Orders.raw_material_id = RawMaterial.id
      LEFT JOIN FinalMaterial ON Orders.final_material_id = FinalMaterial.id
      WHERE 1=1
    `;
  
    let params = [];
  
    if (filters.status) {
      query += " AND Orders.status = ?";
      params.push(filters.status);
    }
  
    if (filters.worker_id) {
      query += " AND Orders.worker_id = ?";
      params.push(filters.worker_id);
    }
  
    if (filters.labour_id) {
      query += " AND Orders.labour_id = ?";
      params.push(filters.labour_id);
    }
  
    if (filters.receipt_no) {
      query += " AND Orders.receipt_no = ?";
      params.push(filters.receipt_no);
    }
  
    if (filters.given_date_from && filters.given_date_to) {
      query += " AND Orders.given_date BETWEEN ? AND ?";
      params.push(filters.given_date_from, filters.given_date_to);
    } else if (filters.given_date_from) {
      query += " AND Orders.given_date >= ?";
      params.push(filters.given_date_from);
    } else if (filters.given_date_to) {
      query += " AND Orders.given_date <= ?";
      params.push(filters.given_date_to);
    }
  
    if (filters.received_date_from && filters.received_date_to) {
      query += " AND Orders.received_date BETWEEN ? AND ?";
      params.push(filters.received_date_from, filters.received_date_to);
    } else if (filters.received_date_from) {
      query += " AND Orders.received_date >= ?";
      params.push(filters.received_date_from);
    } else if (filters.received_date_to) {
      query += " AND Orders.received_date <= ?";
      params.push(filters.received_date_to);
    }
  
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error("❌ Error fetching orders:", err.message);
        callback(err, null);
      } else {
        callback(null, rows);
      }
    });
  };
  