import React from "react";

const TakenMaterials = ({ groupedData }) => {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-2">Taken Materials Report</h3>
      {Object.keys(groupedData).length > 0 ? (
        <table className="w-full border-collapse border border-gray-300 mt-2">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Receipt No</th>
              <th className="border p-2">Final Material</th>
              <th className="border p-2">Quantity</th>
              <th className="border p-2">Worker Name</th>
              <th className="border p-2">Taken Date</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([date, rows]) => (
              <React.Fragment key={date}>
                <tr className="bg-gray-100 text-center font-bold">
                  <td colSpan="5" className="p-2">{date}</td>
                </tr>
                {rows.map((row, index) => (
                  <tr key={index} className="text-center">
                    <td className="border p-2">{row.receipt_no}</td>
                    <td className="border p-2">{row.final_material_name}</td>
                    <td className="border p-2">{row.final_material_expected_quantity}</td>
                    <td className="border p-2">{row.worker_name}</td>
                    <td className="border p-2">{row.taken_date}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500">No Taken Materials records found.</p>
      )}
    </div>
  );
};

export default TakenMaterials;
