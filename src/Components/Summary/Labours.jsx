// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import ExcelJS from "exceljs";
// import dayjs from "dayjs";
// import { saveAs } from "file-saver";

// const Labours = () => {
//   const [search, setSearch] = useState("");
//   const [reportData, setReportData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [view, setView] = useState("taken");
//   const [dateFilter, setDateFilter] = useState("all"); // all, daily, weekly, monthly, yearly
//   const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD")); // For daily filter
//   const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MM")); // For month filter
//   const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY")); // For year filter


 

  
//   const downloadExcel = async () => {
//     if (reportData.length === 0) {
//       toast.error("No data available to download!");
//       return;
//     }
  
//     // Create a new workbook and worksheet
//     const workbook = new ExcelJS.Workbook();
//     const worksheet = workbook.addWorksheet("Labour Report");
  
//     // Add Title
//     worksheet.mergeCells("A1:F1");
//     const titleRow = worksheet.getRow(1);
//     titleRow.getCell(1).value = "KOHINOOR LIGHTS (24-25)";
//     titleRow.getCell(1).font = { bold: true, size: 18 };
//     titleRow.getCell(1).alignment = { horizontal: "center" };
  
//     // Add Address
//     worksheet.mergeCells("A2:F2");
//     const addressRow = worksheet.getRow(2);
//     addressRow.getCell(1).value = "1017 E Ward, Shahupuri 8th Kumbhar Lane, Kolhapur 416001";
//     addressRow.getCell(1).alignment = { horizontal: "center" };
  
//     // Add an empty row for spacing
//     worksheet.mergeCells("A3:F3");
//     const descriptionRow = worksheet.getRow(3);
//     descriptionRow.getCell(1).value = `Labour Data : ${search.trim()}`;
//     descriptionRow.getCell(1).alignment = { horizontal: "center" };
  
//     // Add Column Headers
//     const headerRow = worksheet.addRow([
//       "Receipt No",
//       "Final Material",
//       "Quantity",
//       "Worker Name",
//       "Taken Date",
//       "Received Date",
//     ]);
  
//     // Style Header Row
//     headerRow.font = { bold: true };
//     headerRow.alignment = { horizontal: "center" };
//     headerRow.eachCell((cell) => {
//       cell.fill = {
//         type: "pattern",
//         pattern: "solid",
//         fgColor: { argb: "FFFFCC00" }, // Yellow background
//       };
//       cell.border = {
//         top: { style: "thin" },
//         left: { style: "thin" },
//         bottom: { style: "thin" },
//         right: { style: "thin" },
//       };
//     });
  
//     // Add Report Data
//     reportData.forEach((row) => {
//       worksheet.addRow([
//         row.receipt_no,
//         row.final_material_name,
//         row.final_material_expected_quantity,
//         row.worker_name,
//         row.taken_date || "-",
//         row.received_date || "-",
//       ]);
//     });
  
//     // Auto-fit column widths
//     worksheet.columns.forEach((column) => {
//       column.width = 30;
//     });
  
//     // Write file
//     const buffer = await workbook.xlsx.writeBuffer();
//     const filename = `labour_report_${search.trim().toLowerCase().replaceAll(' ','_')}_${dayjs().format("YYYY-MM-DD")}.xlsx`;
//     saveAs(new Blob([buffer]), filename);
//   };
  

//   // Fetch labour report from SQLite using Electron IPC
//   const fetchLabourReport = async (e) => {
//     e.preventDefault()
//     if (!search.trim()) {
//       toast.error("Please enter a labour name!");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await window.electron.invoke("fetch-labour-report", search.trim());

//       if (response?.success && response.data.length > 0) {
//         setReportData(response.data);
//         console.log(response.data)
//       } else {
//         toast.error("No records found!");
//         setReportData([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching data: " + error.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const groupByDate = (data, dateField) => {
//     return data.reduce((acc, row) => {
//       const dateKey = dayjs(row[dateField]).format("YYYY-MM-DD");
//       if (!acc[dateKey]) acc[dateKey] = [];
//       acc[dateKey].push(row);
//       return acc;
//     }, {});
//   };
  

//   // Function to filter data based on the selected date range
//   const filterByDate = (data, dateField) => {
//     if (dateFilter === "all") return data;
  
//     return Object.entries(data).reduce((acc, [date, rows]) => {
//       const rowDate = dayjs(date);
  
//       if (
//         (dateFilter === "daily" && rowDate.isSame(dayjs(selectedDate), "day")) ||
//         (dateFilter === "weekly" &&
//           rowDate.isAfter(dayjs(selectedDate).startOf("week")) &&
//           rowDate.isBefore(dayjs(selectedDate).endOf("week"))) ||
//         (dateFilter === "monthly" &&
//           rowDate.format("MM") === selectedMonth &&
//           rowDate.format("YYYY") === selectedYear) ||
//         (dateFilter === "yearly" && rowDate.format("YYYY") === selectedYear)
//       ) {
//         acc[date] = rows;
//       }
  
//       return acc;
//     }, {});
//   };
  

//   // Apply filters for taken and received data
//   const groupedTakenData = filterByDate(
//     groupByDate(reportData.filter((row) => row.taken_date), "taken_date"),
//     "taken_date"
//   );


  
  
//   const groupedReceivedData = filterByDate(
//     groupByDate(reportData.filter((row) => row.received_date), "received_date"),
//     "received_date"
//   );
  

//   return (
//     <div className="p-6 w-full">
//       <h2 className="text-2xl font-semibold mb-4">Labour Report</h2>

//       {/* Search Input */}

//       <form onSubmit={fetchLabourReport}>
//       <input
//         type="text"
//         placeholder="Search Labour by Name..."
//         value={search}
//         onChange={(e) => setSearch(e.target.value.toUpperCase())}
//         className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
//       />

//       <div className="flex flex-row gap-2">
//       <button
//         type="submit"
//         className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
//         disabled={loading}
//       >
//         {loading ? "Loading..." : "Load Report"}
//       </button>

//       <div className="flex space-x-4 mb-4">
//   <button onClick={downloadExcel} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
//     Download Excel
//   </button>


// </div>
// </div>
// </form>


//       {/* Toggle Buttons */}
//       <div className="flex space-x-4 mb-4">
//       <button
//   onClick={() => setView("taken")}
//   className={`px-4 py-2 rounded-lg ${view === "taken" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
// >
//   Taken Materials
// </button>
// <button
//   onClick={() => setView("received")}
//   className={`px-4 py-2 rounded-lg ${view === "received" ? "bg-green-500 text-white" : "bg-gray-200"}`}
// >
//   Received Materials
// </button>

//       </div>

//       {/* Date Filter Dropdown */}
//       <div className="mb-4">
//         <label className="mr-2 font-semibold">Filter by Date:</label>
//         <select
//           value={dateFilter}
//           onChange={(e) => setDateFilter(e.target.value)}
//           className="border p-2 rounded-lg"
//         >
//           <option value="all">All</option>
//           <option value="daily">Specific Date</option>
//           <option value="weekly">Specific Week</option>
//           <option value="monthly">Specific Month</option>
//           <option value="yearly">Specific Year</option>
//         </select>
//       </div>

//       {/* Dynamic Date Selectors */}
//       {dateFilter === "daily" && (
//         <input
//           type="date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className="border p-2 rounded-lg mb-4"
//         />
//       )}

//       {dateFilter === "weekly" && (
//         <input
//           type="date"
//           value={selectedDate}
//           onChange={(e) => setSelectedDate(e.target.value)}
//           className="border p-2 rounded-lg mb-4"
//         />
//       )}

//       {dateFilter === "monthly" && (
//         <div className="mb-4">
//           <select
//             value={selectedMonth}
//             onChange={(e) => setSelectedMonth(e.target.value)}
//             className="border p-2 rounded-lg mr-2"
//           >
//             {Array.from({ length: 12 }, (_, i) => (
//               <option key={i} value={(i + 1).toString().padStart(2, "0")}>
//                 {dayjs().month(i).format("MMMM")}
//               </option>
//             ))}
//           </select>

//           <select
//             value={selectedYear}
//             onChange={(e) => setSelectedYear(e.target.value)}
//             className="border p-2 rounded-lg"
//           >
//             {Array.from({ length: 5 }, (_, i) => {
//               const year = dayjs().year() - i;
//               return (
//                 <option key={year} value={year}>
//                   {year}
//                 </option>
//               );
//             })}
//           </select>
//         </div>
//       )}

//       {dateFilter === "yearly" && (
//         <select
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//           className="border p-2 rounded-lg mb-4"
//         >
//           {Array.from({ length: 5 }, (_, i) => {
//             const year = dayjs().year() - i;
//             return (
//               <option key={year} value={year}>
//                 {year}
//               </option>
//             );
//           })}
//         </select>
//       )}

//       {/* Display Filtered Data */}
//       {view === "taken" && (
//   <div>
//     <h3 className="text-xl font-semibold mb-2">Taken Materials Report</h3>
//     {Object.keys(groupedTakenData).length > 0 ? (
//       <table className="w-full border-collapse border border-gray-300 mt-2">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border p-2">Receipt No</th>
//             <th className="border p-2">Final Material</th>
//             <th className="border p-2">Quantity</th>
//             <th className="border p-2">Worker Name</th>
//             <th className="border p-2">Taken Date</th>
//           </tr>
//         </thead>
//         <tbody>
//   {Object.entries(groupedTakenData).map(([date, rows]) => (
//     <React.Fragment key={date}>
//       <tr className="bg-gray-100 text-center font-bold">
//         <td colSpan="5" className="p-2">{date}</td>
//       </tr>
//       {rows.map((row, index) => (
//         <tr key={index} className="text-center">
//           <td className="border p-2">{row.receipt_no}</td>
//           <td className="border p-2">{row.final_material_name}</td>
//           <td className="border p-2">{row.final_material_expected_quantity}</td>
//           <td className="border p-2">{row.worker_name}</td>
//           <td className="border p-2">{row.taken_date}</td>
//         </tr>
//       ))}
//     </React.Fragment>
//   ))}
// </tbody>

//       </table>
//     ) : (
//       <p className="text-gray-500">No Taken Materials records found.</p>
//     )}
//   </div>
// )}

// {view === "received" && (
//   <div>
//     <h3 className="text-xl font-semibold mb-2">Received Materials Report</h3>
//     {Object.keys(groupedReceivedData).length > 0 ? (
//       <table className="w-full border-collapse border border-gray-300 mt-2">
//         <thead>
//           <tr className="bg-gray-200">
//             <th className="border p-2">Receipt No</th>
//             <th className="border p-2">Final Material</th>
//             <th className="border p-2">Quantity</th>
//             <th className="border p-2">Worker Name</th>
//             <th className="border p-2">Received Date</th>
//           </tr>
//         </thead>
//         <tbody>
//   {Object.entries(groupedReceivedData).map(([date, rows]) => (
//     <React.Fragment key={date}>
//       <tr className="bg-gray-100 text-center font-bold">
//         <td colSpan="5" className="p-2">{date}</td>
//       </tr>
//       {rows.map((row, index) => (
//         <tr key={index} className="text-center">
//           <td className="border p-2">{row.receipt_no}</td>
//           <td className="border p-2">{row.final_material_name}</td>
//           <td className="border p-2">{row.final_material_expected_quantity}</td>
//           <td className="border p-2">{row.worker_name}</td>
//           <td className="border p-2">{row.received_date}</td>
//         </tr>
//       ))}
//     </React.Fragment>
//   ))}
// </tbody>

//       </table>
//     ) : (
//       <p className="text-gray-500">No Received Materials records found.</p>
//     )}
//   </div>
// )}

//     </div>
//   );
// };

// export default Labours;





import React, { useState } from "react";
import { toast } from "react-toastify";
import ExcelJS from "exceljs";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import ReceivedMaterials from "./ReceivedMaterials";
import TakenMaterials from "./TakenMaterials";

const Labours = () => {
  const [search, setSearch] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState("taken");
  const [dateFilter, setDateFilter] = useState("all"); // all, daily, weekly, monthly, yearly
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD")); // For daily filter
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MM")); // For month filter
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY")); // For year filter

  const downloadExcel = async () => {
    if (reportData.length === 0) {
      toast.error("No data available to download!");
      return;
    }

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Labour Report");

    // Add Title
    worksheet.mergeCells("A1:F1");
    const titleRow = worksheet.getRow(1);
    titleRow.getCell(1).value = "KOHINOOR LIGHTS (24-25)";
    titleRow.getCell(1).font = { bold: true, size: 18 };
    titleRow.getCell(1).alignment = { horizontal: "center" };

    // Add Address
    worksheet.mergeCells("A2:F2");
    const addressRow = worksheet.getRow(2);
    addressRow.getCell(1).value = "1017 E Ward, Shahupuri 8th Kumbhar Lane, Kolhapur 416001";
    addressRow.getCell(1).alignment = { horizontal: "center" };

    // Add an empty row for spacing
    worksheet.mergeCells("A3:F3");
    const descriptionRow = worksheet.getRow(3);
    descriptionRow.getCell(1).value = `Labour Data : ${search.trim()}`;
    descriptionRow.getCell(1).alignment = { horizontal: "center" };

    // Add Column Headers
    const headerRow = worksheet.addRow([
      "Receipt No",
      "Final Material",
      "Quantity",
      "Worker Name",
      "Taken Date",
      "Received Date",
    ]);

    // Style Header Row
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: "center" };
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFCC00" }, // Yellow background
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });

    // Add Report Data
    reportData.forEach((row) => {
      worksheet.addRow([
        row.receipt_no,
        row.final_material_name,
        row.final_material_expected_quantity,
        row.worker_name,
        row.taken_date || "-",
        row.received_date || "-",
      ]);
    });

    // Auto-fit column widths
    worksheet.columns.forEach((column) => {
      column.width = 30;
    });

    // Write file
    const buffer = await workbook.xlsx.writeBuffer();
    const filename = `labour_report_${search.trim().toLowerCase().replaceAll(' ','_')}_${dayjs().format("YYYY-MM-DD")}.xlsx`;
    saveAs(new Blob([buffer]), filename);
  };

  // Fetch labour report from SQLite using Electron IPC
  const fetchLabourReport = async (e) => {
    e.preventDefault();
    if (!search.trim()) {
      toast.error("Please enter a labour name!");
      return;
    }

    setLoading(true);
    try {
      const response = await window.electron.invoke("fetch-labour-report", search.trim());

      if (response?.success && response.data.length > 0) {
        setReportData(response.data);
      } else {
        toast.error("No records found!");
        setReportData([]);
      }
    } catch (error) {
      toast.error("Error fetching data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const groupByDate = (data, dateField) => {
    return data.reduce((acc, row) => {
      const dateKey = dayjs(row[dateField]).format("YYYY-MM-DD");
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(row);
      return acc;
    }, {});
  };

  // Function to filter data based on the selected date range
  const filterByDate = (data, dateField) => {
    if (dateFilter === "all") return data;

    return Object.entries(data).reduce((acc, [date, rows]) => {
      const rowDate = dayjs(date);

      if (
        (dateFilter === "daily" && rowDate.isSame(dayjs(selectedDate), "day")) ||
        (dateFilter === "weekly" &&
          rowDate.isAfter(dayjs(selectedDate).startOf("week")) &&
          rowDate.isBefore(dayjs(selectedDate).endOf("week"))) ||
        (dateFilter === "monthly" &&
          rowDate.format("MM") === selectedMonth &&
          rowDate.format("YYYY") === selectedYear) ||
        (dateFilter === "yearly" && rowDate.format("YYYY") === selectedYear)
      ) {
        acc[date] = rows;
      }

      return acc;
    }, {});
  };

  // Apply filters for taken and received data
  const groupedTakenData = filterByDate(
    groupByDate(reportData.filter((row) => row.taken_date), "taken_date"),
    "taken_date"
  );

  const groupedReceivedData = filterByDate(
    groupByDate(reportData.filter((row) => row.received_date), "received_date"),
    "received_date"
  );

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-4">Labour Report</h2>

      <form onSubmit={fetchLabourReport}>
        <input
          type="text"
          placeholder="Search Labour by Name..."
          value={search}
          onChange={(e) => setSearch(e.target.value.toUpperCase())}
          className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <div className="flex flex-row gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load Report"}
          </button>

          <div className="flex space-x-4 mb-4">
            <button onClick={downloadExcel} className="bg-blue-600 text-white px-4 py-2 rounded-lg">
              Download Excel
            </button>
          </div>
        </div>
      </form>

      {/* Toggle Buttons */}
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setView("taken")}
          className={`px-4 py-2 rounded-lg ${view === "taken" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Taken Materials
        </button>
        <button
          onClick={() => setView("received")}
          className={`px-4 py-2 rounded-lg ${view === "received" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          Received Materials
        </button>
      </div>

      {/* Date Filter Dropdown */}
      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Date:</label>
        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="border p-2 rounded-lg"
        >
          <option value="all">All</option>
          <option value="daily">Specific Date</option>
          <option value="weekly">Specific Week</option>
          <option value="monthly">Specific Month</option>
          <option value="yearly">Specific Year</option>
        </select>
      </div>

      {/* Dynamic Date Selectors */}
      {dateFilter === "daily" && (
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded-lg mb-4"
        />
      )}

      {dateFilter === "weekly" && (
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="border p-2 rounded-lg mb-4"
        />
      )}

      {dateFilter === "monthly" && (
        <div className="mb-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border p-2 rounded-lg mr-2"
          >
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={(i + 1).toString().padStart(2, "0")}>
                {dayjs().month(i).format("MMMM")}
              </option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border p-2 rounded-lg"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = dayjs().year() - i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {dateFilter === "yearly" && (
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="border p-2 rounded-lg mb-4"
        >
          {Array.from({ length: 5 }, (_, i) => {
            const year = dayjs().year() - i;
            return (
              <option key={year} value={year}>
                {year}
              </option>
            );
          })}
        </select>
      )}

      {/* Render the correct view */}
      {view === "taken" && <TakenMaterials groupedData={groupedTakenData} />}
      {view === "received" && <ReceivedMaterials groupedData={groupedReceivedData} />}
    </div>
  );
};

export default Labours;
