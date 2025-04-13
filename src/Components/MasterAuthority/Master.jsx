import React from "react";
import { useNavigate } from "react-router-dom";

const Actions = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-semibold mb-4">Master Authority</h2>
      <div className="space-x-4">
        <button
          onClick={() => navigate("/master/department")}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          Department
        </button>
        <button
          onClick={() => navigate("/master/worker")}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
        >
          Worker
        </button>
        <button
          onClick={() => navigate("/master/accessibility")}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          Autherize / Access
        </button>
      </div>
    </div>
  );
};

export default Actions;
