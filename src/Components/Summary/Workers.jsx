import React, { useState } from "react";
import { toast } from "react-toastify";
import dayjs from "dayjs";

const Workers = () => {
  const [search, setSearch] = useState("");
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));

  const fetchWorkerReport = async () => {
    if (!search.trim()) {
      toast.error("Please enter a worker name!");
      return;
    }
    setLoading(true);
    try {
      const response = await window.electron.invoke("fetch-worker-report", search.trim());
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

  const filterByDate = (data) => {
    if (dateFilter === "all") return data;
    return data.filter((row) => {
      const rowDate = dayjs(row.given_date);
      if (dateFilter === "daily") {
        return rowDate.isSame(dayjs(selectedDate), "day");
      } else if (dateFilter === "weekly") {
        return rowDate.isSame(dayjs(selectedDate), "week");
      } else if (dateFilter === "monthly") {
        return rowDate.format("MM") === selectedMonth && rowDate.format("YYYY") === selectedYear;
      } else if (dateFilter === "yearly") {
        return rowDate.format("YYYY") === selectedYear;
      }
    });
  };

  const filteredData = filterByDate(reportData);

  // Grouping Data by Labour Name and Given Date
  const groupedData = filteredData.reduce((acc, row) => {
    const key = `${row.labour_name}-${row.given_date}`;
    if (!acc[key]) {
      acc[key] = {
        labour_name: row.labour_name,
        given_date: row.given_date,
        materials: [],
      };
    }
    acc[key].materials.push({
      receipt_no: row.receipt_no,
      final_material_name: row.final_material_name,
      final_material_expected_quantity: row.final_material_expected_quantity,
    });
    return acc;
  }, {});

  return (
    <div className="p-6 w-full">
      <h2 className="text-2xl font-semibold mb-4">Worker Report</h2>


      <form onSubmit={fetchWorkerReport}>
      <input
        type="text"
        placeholder="Search Worker by Name..."
        value={search}
        onChange={(e) => setSearch(e.target.value.toUpperCase())}
        className="w-full p-2 border border-gray-300 rounded-lg mb-4"
      />
      <button
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4"
        disabled={loading}
      >
        {loading ? "Loading..." : "Load Report"}
      </button>

      </form>

      <div className="mb-4">
        <label className="mr-2 font-semibold">Filter by Date:</label>
        <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="border p-2 rounded-lg">
          <option value="all">All</option>
          <option value="daily">Specific Date</option>
          <option value="weekly">Specific Week</option>
          <option value="monthly">Specific Month</option>
          <option value="yearly">Specific Year</option>
        </select>
      </div>

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
              <option key={i} value={(i + 1).toString().padStart(2, "0")}>{dayjs().month(i).format("MMMM")}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border p-2 rounded-lg"
          >
            {Array.from({ length: 5 }, (_, i) => {
              const year = dayjs().year() - i;
              return <option key={year} value={year}>{year}</option>;
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
            return <option key={year} value={year}>{year}</option>;
          })}
        </select>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-2">Worker Report</h3>
        {Object.keys(groupedData).length > 0 ? (
          <div className="space-y-4">
            {Object.values(groupedData).map((group, index) => (
              <div key={index} className="border rounded-lg p-4 shadow-md">
                <h4 className="text-lg font-semibold">Labour : {group.labour_name}</h4>
                <p className="text-gray-500">Date: {group.given_date}</p>
                <table className="w-full border-collapse border border-gray-300 mt-2">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border p-2">Receipt No</th>
                      <th className="border p-2">Final Material</th>
                      <th className="border p-2">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.materials.map((material, i) => (
                      <tr key={i} className="text-center">
                        <td className="border p-2">{material.receipt_no}</td>
                        <td className="border p-2">{material.final_material_name}</td>
                        <td className="border p-2">{material.final_material_expected_quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No records found.</p>
        )}
      </div>
    </div>
  );
};

export default Workers;
