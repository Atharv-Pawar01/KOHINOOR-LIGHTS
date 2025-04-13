import xlsx  from "xlsx"
import path from "path"
import fs from "fs/promises"
import { db } from "../database.js";
import * as f from "fs"

import { store } from "../userStore.js";

// import bcrypt from "bcrypt";
// import store from "electron-store"; // Ensure electron-store is properly initialized





export const login = async ({ username, password }) => {
  return new Promise((resolve, reject) => {
    // Step 1: Check login in Master table first
    const masterQuery = `SELECT * FROM Master WHERE name = ?`;

    db.get(masterQuery, [username], async (err, masterUser) => {
      if (err) {
        console.error("❌ Database error:", err);
        return reject({ success: false, message: "Database error" });
      }

      if (masterUser) {
        // Verify password using bcrypt
        const isMatch = password=== masterUser.password;
        if (!isMatch) {
          return resolve({ success: false, message: "Invalid password" });
        }

        // Store session for master user
        store.set("user", masterUser);

        return resolve({ success: true, message: "Master login successful!", user: masterUser });
      }

      // Step 2: If not found in Master, check Workers table
      const workerQuery = `SELECT * FROM Workers WHERE username = ? AND isActive = 1`;

      db.get(workerQuery, [username], async (err, workerUser) => {
        if (err) {
          console.error("❌ Database error:", err);
          return reject({ success: false, message: "Database error" });
        }

        if (!workerUser) {
          return resolve({ success: false, message: "User not found or inactive" });
        }

        // Verify password using bcrypt
        const isMatch = password===workerUser.password;
        if (!isMatch) {
          return resolve({ success: false, message: "Invalid password" });
        }

        // Store session for worker user
        store.set("user", workerUser);

        return resolve({ success: true, message: "Worker login successful!", user: workerUser });
      });
    });
  });
};

export const logout = async () => {
    try {
      await store.delete('user'); // Set the user to null (or use store.delete("user"))
      return { success: true, message: "Successfully Logged Out!" };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  };