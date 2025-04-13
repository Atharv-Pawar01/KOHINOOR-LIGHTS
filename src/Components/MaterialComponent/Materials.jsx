import React from "react";
import { useNavigate } from "react-router-dom";

const Materials = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mb-4">Manage Materials</h2>
      <div className="space-x-4">
        <button
          onClick={() => navigate("/materials/add")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Add Materials
        </button>
        <button
          onClick={() => navigate("/materials/modify")}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          Modify Materials
        </button>
        <button
          onClick={() => navigate("/materials/view")}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          View Materials
        </button>
      </div>
    </div>
  );
};

export default Materials;
