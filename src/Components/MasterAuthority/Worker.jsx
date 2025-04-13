import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react"; // Icons for password toggle

const Worker = () => {
  const [departments, setDepartments] = useState([]);
  const [workers, setWorkers] = useState([]); // Store workers from DB
  const [worker, setWorker] = useState({
    name: "",
    department: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  useEffect(() => {
    fetchDepartments();
    fetchWorkers();
  }, []);

  const fetchDepartments = async () => {
    const result = await window.electron.invoke("get-departments");
   
    setDepartments(result.departments || []);
  };

  const fetchWorkers = async () => {
    const result = await window.electron.invoke("get-workers");
    // console.log(result)
    setWorkers(result);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorker((prev) => ({
      ...prev,
      [name]: name === "password" ? value : value.toUpperCase(), // Convert all except password to uppercase
    }));
  };

  const addWorker = async () => {
    try {
      if (!worker.name || !worker.department || !worker.password || !worker.role) {
        throw new Error("Please provide all fields");
      }

      const response = await window.electron.invoke("addWorker", {
        ...worker,
        department: worker.department.toUpperCase(),
      });

      toast.success(`✅ Worker added!`);
      setWorker({ name: "", department: "", password: "", role: "" });

      fetchWorkers(); // Refresh worker list after adding a worker
    } catch (error) {
      toast.error(error.message || "Error adding worker");
    }
  };

  const deleteWorker = async (worker_id) => {
    try {
      const result = await window.electron.invoke("delete-worker", { worker_id });
  
      if (result.success) {
        toast.success("✅ Worker deleted successfully!");
        fetchWorkers(); // Refresh worker list after deletion
      } else {
        throw new Error(result.error || "Failed to delete worker");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const toggleAccess = async (worker_id, accessField, currentValue) => {
    const newValue = currentValue ? 0 : 1;
  
    await window.electron.invoke("update-worker-access", { 
      worker_id, 
      accessField, 
      newValue 
    });
  
    fetchWorkers(); // Refresh the workers list after updating access
  };
  

  return (
    <div className="flex flex-col items-center min-h-[89.5vh] bg-gray-100 p-4">
    {/* Add Worker Form */}
    <div className="bg-white shadow-md rounded-lg p-3 w-full max-w-sm mb-4">
      <h2 className="text-lg font-bold text-center text-gray-800 mb-3">ADD WORKER</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          addWorker();
        }}
        className="space-y-3"
      >
        <input
          type="text"
          name="name"
          value={worker.name}
          onChange={handleChange}
          placeholder="ENTER NAME"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 outline-none uppercase text-sm"
          required
        />
  
        {/* Department Selection */}
        <div className="mb-3">
          <h3 className="text-gray-600 font-medium mb-1 text-sm">SELECT DEPARTMENT</h3>
          <div className="flex flex-wrap gap-1">
            {departments.length > 0 ? (
              departments.map((dept) => (
                <label
                  key={dept.department_id}
                  className="flex items-center space-x-1 bg-gray-200 px-2 py-1 rounded-md cursor-pointer text-xs"
                >
                  <input
                    type="radio"
                    name="department"
                    value={dept.name.toUpperCase()}
                    onChange={handleChange}
                    className="hidden"
                    checked={worker.department === dept.name.toUpperCase()}
                  />
                  <span className={`block text-gray-700 uppercase ${worker.department === dept.name.toUpperCase() ? "font-bold text-blue-600" : ""}`}>
                    {dept.name.toUpperCase()}
                  </span>
                </label>
              ))
            ) : (
              <p className="text-gray-500 text-xs">LOADING DEPARTMENTS...</p>
            )}
          </div>
        </div>
  
        {/* Password Field with Hide/Unhide Option */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            value={worker.password}
            onChange={handleChange}
            placeholder="ENTER PASSWORD"
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 outline-none text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-500 hover:text-gray-700"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
  
        <select
            name="role"
            value={worker.role}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 outline-none uppercase text-sm"
          >
            <option value="" disabled>Select Role</option>
            <option value="Manager">Manager</option>
            <option value="Supervisor">Supervisor</option>
            <option value="Worker">Worker</option>
            <option value="Technician">Technician</option>
            <option value="Operator">Operator</option>
          </select>

  
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition text-sm">
          ADD WORKER
        </button>
      </form>
    </div>
  
   {/* Worker List Section */}
<div className="bg-white shadow-md rounded-lg p-4 w-full max-w-4xl overflow-x-auto">
  <h2 className="text-lg font-bold text-center text-gray-800 mb-4">WORKER LIST</h2>
  {workers.length > 0 ? (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-100 text-gray-700 uppercase text-xs">
            <th className="border p-3">Name</th>
            <th className="border p-3">Department</th>
            <th className="border p-3">Role</th>
            <th className="border p-3">Add</th>
            <th className="border p-3">Modify</th>
            <th className="border p-3">View</th>
            <th className="border p-3">Master</th>
            <th className="border p-3">Inward</th>
            <th className="border p-3">Outward</th>
            <th className="border p-3">Action</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker, index) => (
            <tr key={index} className="text-center hover:bg-gray-50 transition">
              <td className="border p-3">{worker.name}</td>
              <td className="border p-3">{worker.department_name}</td>
              <td className="border p-3">{worker.role}</td>
              {/* Checkboxes for Access Fields */}
              {["adding", "modify", "view", "master", "inward", "outward"].map((accessField) => (
                <td key={accessField} className="border p-3">
                  <input
                    type="checkbox"
                    checked={worker[accessField] === 1}
                    onChange={() => toggleAccess(worker.worker_id, accessField, worker[accessField])}
                    className="cursor-pointer w-4 h-4 accent-blue-500"
                  />
                </td>
              ))}
              <td className="border p-3">
                <button
                  onClick={() => deleteWorker(worker.worker_id)}
                  className="bg-red-500 text-white px-4 py-1 rounded-md text-xs hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <p className="text-center text-gray-500 text-sm">No workers found.</p>
  )}
</div>

  </div>
    );
};

export default Worker;
