import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";

const AddWorker = () => {
  const [departments, setDepartments] = useState([]);
  const [worker, setWorker] = useState({
    name: "",
    username: "",
    department: "",
    password: "",
    role: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    const result = await window.electron.invoke("get-departments");
    setDepartments(result.departments || []);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorker((prev) => ({
      ...prev,
      [name]: name === "password" ? value : value.toUpperCase(),
    }));
  };

  const addWorker = async () => {
    try {
      if (!worker.name || !worker.username || !worker.department || !worker.password || !worker.role) {
        throw new Error("Please provide all fields");
      }

      await window.electron.invoke("addWorker", {
        ...worker,
        department: worker.department.toUpperCase(),
      });

      toast.success("✅ Worker added!");
      setWorker({ name: "", username: "", department: "", password: "", role: "" });
    } catch (error) {
      toast.error(error.message || "Error adding worker");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[89vh] bg-gray-100 p-4">
      <div className="bg-white shadow-md rounded-lg p-4 w-full max-w-sm">
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
          
          <input
            type="text"
            name="username"
            value={worker.username}
            onChange={handleChange}
            placeholder="ENTER USERNAME (SHOULD BE UNIQUE)"
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-400 outline-none uppercase text-sm"
            required
          />

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
            <option value="" disabled selected={!worker.role}>Select Role</option>
            <option value="MASTER">MASTER</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="WORKER">WORKER</option>
          </select>

          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition text-sm">
            ADD WORKER
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWorker;
