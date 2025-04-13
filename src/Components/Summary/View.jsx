import { useState } from "react";
import DashBoard from "./dashBoard";




export default function PerformanceReport() {
    const [filterType, setFilterType] = useState("");
    const [filterValue, setFilterValue] = useState("");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");
    const [dateFilterType, setDateFilterType] = useState("given");
    const [reportData, setReportData] = useState([]);
    const [error, setError] = useState("");

    const resetState = () => {
        setFilterValue("");
        setFromDate("");
        setToDate("");
        setReportData([]);
        setError("");
    };

    const handleFilterChange = (e) => {
        setFilterType(e.target.value);
        resetState();
    };

    const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d
            .getDate()
            .toString()
            .padStart(2, "0")}`;
    };

    const fetchReport = async () => {
        setError("");

        if (filterType === "date" && (!fromDate || !toDate)) {
            setError("Please select both From and To dates!");
            return;
        } else if (filterType !== "date" && !filterValue.trim()) {
            setError(`Please enter a valid ${filterType}!`);
            return;
        }

        try {
            let response;
            const formattedFromDate = formatDate(fromDate);
            const formattedToDate = formatDate(toDate);

            if (filterType === "worker") {
                response = await window.electron.invoke("fetch-worker-report", filterValue);
            } else if (filterType === "labour") {
                response = await window.electron.invoke("fetch-labour-report", filterValue);
            } else if (filterType === "date") {
                const requestPayload = { startDate: formattedFromDate, endDate: formattedToDate };
                const action =
                    dateFilterType === "given"
                        ? "fetch-given-materials"
                        : "fetch-received-materials";

                response = await window.electron.invoke(action, requestPayload);
            } else {
                setError(`${filterType} report functionality is not yet implemented!`);
                setReportData([]);
                return;
            }

            if (response?.success) {
                setReportData(response.data);
            } else {
                setError("No records found or an error occurred!");
                setReportData([]);
            }
        } catch (err) {
            setError("Failed to fetch data");
            console.error("Error fetching report:", err);
        }
    };

    return (
        // <div className="p-4">
        //     <h2 className="text-xl font-bold mb-4">Performance Report</h2>

        //     {/* Input Section */}
        //     <div className="flex space-x-2 mb-4">
        //         <select value={filterType} onChange={handleFilterChange} className="p-2 border rounded">
        //             <option value="">Select Filter</option>
        //             <option value="worker">Worker</option>
        //             <option value="labour">Labour</option>
        //             <option value="department">Department</option>
        //             <option value="date">Date</option>
        //         </select>

        //         {filterType === "date" ? (
        //             <>
        //                 <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="p-2 border rounded" />
        //                 <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="p-2 border rounded" />
        //                 <select value={dateFilterType} onChange={(e) => setDateFilterType(e.target.value)} className="p-2 border rounded">
        //                     <option value="given">Given</option>
        //                     <option value="received">Received</option>
        //                 </select>
        //             </>
        //         ) : (
        //             filterType && (
        //                 <input
        //                     type="text"
        //                     placeholder={`Enter ${filterType.charAt(0).toUpperCase() + filterType.slice(1)}`}
        //                     value={filterValue}
        //                     onChange={(e) => setFilterValue(e.target.value)}
        //                     className="p-2 border rounded"
        //                 />
        //             )
        //         )}

        //         <button onClick={fetchReport} className="bg-blue-500 text-white px-4 py-2 rounded">
        //             Fetch Report
        //         </button>
        //     </div>

        //     {/* Error Message */}
        //     {error && <p className="text-red-500">{error}</p>}

        //     {/* Worker Report Table */}
        //     {filterType === "worker" && reportData.length > 0 && (
        //         <table className="w-full border-collapse border border-gray-300">
        //             <thead>
        //                 <tr className="bg-gray-200">
        //                     <th className="border p-2">Receipt No</th>
        //                     <th className="border p-2">Final Material</th>
        //                     <th className="border p-2">Quantity</th>
        //                     <th className="border p-2">Given Date</th>
        //                     <th className="border p-2">Labour Name</th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 {reportData.map((item, index) => (
        //                     <tr key={index} className="text-center">
        //                         <td className="border p-2">{item.receipt_no}</td>
        //                         <td className="border p-2">{item.final_material_name}</td>
        //                         <td className="border p-2">{item.final_material_expected_quantity}</td>
        //                         <td className="border p-2">{item.given_date}</td>
        //                         <td className="border p-2">{item.labour_name}</td>
        //                     </tr>
        //                 ))}
        //             </tbody>
        //         </table>
        //     )}

        //     {/* Labour Performance Report Table */}
        //     {filterType === "labour" && reportData.length > 0 && (
        //         <table className="w-full border-collapse border border-gray-300 mt-4">
        //             <thead>
        //                 <tr className="bg-gray-200">
        //                     <th className="border p-2">Receipt No</th>
        //                     <th className="border p-2">Final Material</th>
        //                     <th className="border p-2">Quantity</th>
        //                     <th className="border p-2">Worker Name</th>
        //                     <th className="border p-2">Taken Date</th>
        //                     <th className="border p-2">Received Date</th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 {reportData.map((row, index) => (
        //                     <tr key={index} className="text-center">
        //                         <td className="border p-2">{row.receipt_no}</td>
        //                         <td className="border p-2">{row.final_material_name}</td>
        //                         <td className="border p-2">{row.final_material_expected_quantity}</td>
        //                         <td className="border p-2">{row.worker_name}</td>
        //                         <td className="border p-2">{row.taken_date}</td>
        //                         <td className="border p-2">{row.received_date || "Pending"}</td>
        //                     </tr>
        //                 ))}
        //             </tbody>
        //         </table>
        //     )}

        //     {/* Date-based Report Table */}
        //     {filterType === "date" && reportData.length > 0 && (
        //         <table className="w-full border-collapse border border-gray-300 mt-4">
        //             <thead>
        //                 <tr className="bg-gray-200">
        //                     <th className="border p-2">Final Material</th>
        //                     <th className="border p-2">Quantity</th>
        //                     <th className="border p-2">Worker Name</th>
        //                     <th className="border p-2">Labour Name</th>
        //                     <th className="border p-2">{dateFilterType === "given" ? "Given Date" : "Received Date"}</th>
        //                 </tr>
        //             </thead>
        //             <tbody>
        //                 {reportData.map((row, index) => (
        //                     <tr key={index} className="text-center">
        //                         <td className="border p-2">{row.final_material_name}</td>
        //                         <td className="border p-2">{row.final_material_expected_quantity || row.received_quantity}</td>
        //                         <td className="border p-2">{row.worker_name}</td>
        //                         <td className="border p-2">{row.labour_name}</td>
        //                         <td className="border p-2">{dateFilterType === "given" ? row.given_date : row.received_date}</td>
        //                     </tr>
        //                 ))}
        //             </tbody>
        //         </table>
        //     )}
        // </div>

        <>
        
        <DashBoard/>
        </>
    );
}
