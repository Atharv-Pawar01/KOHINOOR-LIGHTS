import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";
import { app } from "electron";
import { isDev } from "./util.js";

// Check if running in development or production mode

// Set database path
const dbPath = isDev()
  ? path.join(process.cwd(), "labour_data_dev.sqlite") // Dev: Local file
  : path.join(app.getPath("userData"), "labour_data.sqlite"); // Prod: Persistent storage

// Ensure the database file exists
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, ""); // Create an empty file if not found
}

// Open SQLite database
export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    // console.error("❌ Database connection error:", err.message);
  } else {
    // console.log(`✅ Connected to SQLite database at: ${dbPath}`);
  }
});



// Create tables
db.serialize(() => {
  
  db.run(
    `CREATE TABLE IF NOT EXISTS Labour (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      photo TEXT,
      department_id TEXT,
      customerId TEXT NOT NULL UNIQUE,
      department TEXT NOT NULL,
      area TEXT NOT NULL,
      city TEXT NOT NULL,
      pincode TEXT NOT NULL,
      telephone TEXT NOT NULL,
      aadhar TEXT NOT NULL,
      pancard TEXT NOT NULL,
      FOREIGN KEY (department_id) REFERENCES Departments(department_id) ON DELETE SET NULL
    )`,
    (err) => {
      if (err) console.error("❌ Error creating Labour table:", err.message);
      // else console.log("✅ Labour table is ready.");
    }
  );











//   db.run("DROP TABLE IF EXISTS departments", (err) => {
//     if (err) {
//         console.error("Error dropping table:", err);
//     } else {
//         console.log("Table 'departments' deleted successfully.");
//     }
//     db.close();
// });




  // Departments Table
  db.run(
    `CREATE TABLE IF NOT EXISTS Departments (
      department_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      department_code TEXT NOT NULL UNIQUE
    );`,
    (err) => {
      // if (err) console.error("❌ Error creating Departments table:", err.message);
      // else console.log("✅ Departments table is ready.");
    }
  );
  
  // Masters Table
  db.run(
    `CREATE TABLE IF NOT EXISTS Master (
      master_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL
    )`,
    (err) => {
      if (err) console.error("❌ Error creating Masters table:", err.message);
      // else console.log("✅ Masters table is ready.");
    }
  );




//     db.run("DROP TABLE IF EXISTS Workers", (err) => {
//     if (err) {
//         console.error("Error dropping table:", err);
//     } else {
//         console.log("Table 'departments' deleted successfully.");
//     }
//     // db.close();
// });

  // Workers Table
  db.run(
    `CREATE TABLE IF NOT EXISTS Workers (
    worker_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    department_id INTEGER,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    isActive INTEGER DEFAULT 1, 
    FOREIGN KEY (department_id) REFERENCES Departments(department_id) ON DELETE SET NULL
);

`,
    (err) => {
      if (err) console.error("❌ Error creating Workers table:", err.message);
      // else console.log("✅ Workers table is ready.");
    }
  );



  

  const workerAccessFields = ["adding", "modify", "view", "master", "inward", "outward"];
  workerAccessFields.forEach((field) => {
     db.run(`ALTER TABLE Workers ADD COLUMN ${field} INTEGER DEFAULT 0`, (err) => {
      if (err && !err.message.includes("duplicate column")) {
        console.error(`❌ Error adding column ${field}:`, err.message);
      }
    });
  });



  // Raw Materials Table
  db.run(
    `CREATE TABLE IF NOT EXISTS RawMaterial (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      raw_material_name TEXT UNIQUE
    )`,
    (err) => {
      if (err) console.error("❌ Error creating Raw Materials table:", err.message);
      // else console.log("✅ Raw Materials table is ready.");
    }
  );

  // Final Materials Table
  db.run(
    `CREATE TABLE IF NOT EXISTS FinalMaterial (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bom_name TEXT,
      final_material_name TEXT,
      unit TEXT,
      quantity REAL,
      UNIQUE(bom_name, final_material_name)
    )`,
    (err) => {
      if (err) console.error("❌ Error creating Final Materials table:", err.message);
      // else console.log("✅ Final Materials table is ready.");
    }
  );

  // Final to Raw Material Table
  db.run(
    `CREATE TABLE IF NOT EXISTS FinalToRawMaterial (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      final_material_id INTEGER,
      raw_material_id INTEGER,
      quantity REAL,
      unit TEXT,  
      FOREIGN KEY (final_material_id) REFERENCES FinalMaterial(id),
      FOREIGN KEY (raw_material_id) REFERENCES RawMaterial(id),
      UNIQUE(final_material_id, raw_material_id)
    )`,
    (err) => {
      if (err) console.error("❌ Error creating FinalToRawMaterial table:", err.message);
      // else console.log("✅ FinalToRawMaterial table is ready.");
    }
  );


  db.run(
    `CREATE TABLE IF NOT EXISTS Orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    given_date TEXT NOT NULL,
    worker_id INTEGER NOT NULL,
    final_material_id INTEGER NOT NULL,
    labour_id INTEGER NOT NULL,
    final_material_expected_quantity REAL NOT NULL,
    given_remarks TEXT,  
    status TEXT CHECK (status IN ('pending', 'received', 'inprogress')) NOT NULL DEFAULT 'pending',
    receipt_no TEXT NOT NULL,
    is_fulfilled REAL DEFAULT 0,
    FOREIGN KEY (worker_id) REFERENCES Workers(worker_id),
    FOREIGN KEY (final_material_id) REFERENCES FinalMaterial(id),
    FOREIGN KEY (labour_id) REFERENCES Labour(id)
);
`,
    (err) => {
      if (err) console.error("❌ Error creating FinalToRawMaterial table:", err.message);
      // else console.log("✅ FinalToRawMaterial table is ready.");
    }
  );
  db.run(
    `CREATE TABLE IF NOT EXISTS OrderProduction (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    batch_number INTEGER NOT NULL, 
    produced_quantity REAL NOT NULL,
    damaged_quantity REAL NOT NULL,
    received_date TEXT NOT NULL,  
    received_remarks TEXT,  
    received_by TEXT NOT NULL,
    amount_per_production REAL NOT NULL,
    FOREIGN KEY (received_by) REFERENCES Workers(worker_id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    UNIQUE(order_id, batch_number)
);

`,
    (err) => {
      if (err) console.error("❌ Error creating FinalToRawMaterial table:", err.message);
      // else console.log("✅ FinalToRawMaterial table is ready.");
    }
  );







  db.run(
    `CREATE TABLE IF NOT EXISTS OrderRawMaterials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    raw_material_id INTEGER NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (raw_material_id) REFERENCES RawMaterial(id) ON DELETE CASCADE,
    UNIQUE(order_id, raw_material_id)
);`,
    (err) => {
      if (err) console.error("❌ Error creating OrderRawMaterial table:", err.message);
      // else console.log("✅ FinalToRawMaterial table is ready.");
    }
  );



  db.get("SELECT * FROM Master LIMIT 1", (err, row) => {
    if (err) {
      console.error("❌ Error checking Master table:", err.message);
    } else if (!row) {
      // No admin found, insert default admin
      db.run(
        `INSERT INTO Master (name, password, role) VALUES (?, ?, ?)`,
        ["ADMIN", "admin123", "admin"], // Change password later for security
        (err) => {
          if (err) {
            // console.error("❌ Error inserting default admin:", err.message);
          } else {
            // console.log("✅ Default admin user created (username: admin, password: admin123)");
          }
        }
      );
    }
  });

});
