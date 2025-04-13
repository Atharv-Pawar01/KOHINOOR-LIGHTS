import React, { useState } from "react";
import Workers from "./Workers";
import Labours from "./Labours";
import Departments from "./Departments";
import Date from "./Date";

const DashBoard = () => {
  const [dashboard, setDashboard] = useState("worker");

  return (
    <div className="flex w-full h-[89vh] bg-gray-100">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 text-white flex flex-col p-4 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">Dashboard</h2>
        <div className="flex flex-col space-y-3">
          {[
            { label: "Worker", value: "worker" },
            { label: "Labour", value: "labour" },
            { label: "Department", value: "department" },
            { label: "Date", value: "date" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setDashboard(item.value)}
              className={`py-2 rounded-lg text-lg transition ${
                dashboard === item.value
                  ? "bg-blue-500"
                  : "hover:bg-gray-700 bg-gray-800"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-3/4 flex justify-center items-start h-[89vh] ">
  <div className="w-full bg-white shadow-lg rounded-lg p-6 overflow-y-auto max-h-[89vh] min-h-[89vh]">
    {dashboard === "worker" && <Workers />}
    {dashboard === "labour" && <Labours />}
    {dashboard === "department" && <Departments />}
    {dashboard === "date" && <Date />}
  </div>
</div>

    </div>
  );
};

export default DashBoard;
