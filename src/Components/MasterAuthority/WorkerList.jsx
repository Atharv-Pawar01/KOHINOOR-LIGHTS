
import React, { useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { UserContext } from "../../authContext/userContext";

const WorkerList = () => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedWorker, setEditedWorker] = useState({});
  const [departments,setDepartments]=useState([]);

  const {user,setUser}=useContext(UserContext)
  useEffect(() => {
    fetchWorkers();
    fetchDepartments();
  }, []);


  const fetchDepartments = async () => {
    const result = await window.electron.invoke("get-departments");
    setDepartments(result.departments || []);
  };


  const fetchWorkers = async () => {
    try {
      const result = await window.electron.invoke("get-workers");
      setWorkers(result || []);
    } catch (error) {
      console.error("Error fetching workers:", error);
    }
  };

  const toggleAccess = async (workerId, accessField, currentValue) => {
    try {
      const newValue = currentValue === 1 ? 0 : 1;
      await window.electron.invoke("update-worker-access", {
        workerId,
        field: accessField,
        value: newValue,
      });
  
      setWorkers((prevWorkers) =>
        prevWorkers.map((worker) =>
          worker.worker_id === workerId
            ? { ...worker, [accessField]: newValue }
            : worker
        )
      );
  
      // If the current user is the one being updated, update the user context too
      if (user?.worker_id === workerId) {
        setUser((prevUser) => ({
          ...prevUser,
          [accessField]: newValue,
        }));

        await window.electron.setUser(user)
      }
    } catch (error) {
      console.error("Error updating access:", error);
    }
  };

  // Open Delete Modal
  const openDeleteModal = (worker) => {
    setSelectedWorker(worker);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setSelectedWorker(null);
    setIsDeleteModalOpen(false);
  };

  // console.log(editedWorker)

  const confirmDeleteWorker = async () => {
    if (!selectedWorker) return;
    try {
      await window.electron.invoke("delete-worker", {
        workerId: selectedWorker.worker_id,
      });

      setWorkers((prevWorkers) =>
        prevWorkers.filter(
          (worker) => worker.worker_id !== selectedWorker.worker_id
        )
      );
      toast.success("Worker deleted successfully!");
    } catch (error) {
      toast.error("Error deleting worker: " + error.message);
    } finally {
      closeDeleteModal();
    }
  };

  // Open Edit Modal
  const openEditModal = (worker) => {
    setEditedWorker(worker);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setEditedWorker({});
  };

  
  const handleEditChange = (e) => {
    const { name, value } = e.target;
  
    setEditedWorker((prev) => ({
      ...prev,
      [name]: name === "password" ? value : value.toUpperCase(),
    }));
  };
  
  

  const updateWorker = async () => {
    try {
        
      // console.log(editedWorker)


      await window.electron.invoke("update-worker", editedWorker);

      setWorkers((prevWorkers) =>
        prevWorkers.map((worker) =>
          worker.worker_id === editedWorker.worker_id ? editedWorker : worker
        )
      );
      toast.success("Worker updated successfully!");


      fetchWorkers()
      closeEditModal();
    } catch (error) {
      toast.error("Error updating worker: " + error.message);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
        Worker List
      </h2>

      {workers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse bg-white rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-blue-600 text-white text-sm uppercase">
                <th className="p-3">Name</th>
                <th className="p-3">Username</th>
                <th className="p-3">Department</th>
                <th className="p-3">Role</th>
                <th className="p-3">Add</th>
                <th className="p-3">Modify</th>
                <th className="p-3">View</th>
                <th className="p-3">Master</th>
                <th className="p-3">Inward</th>
                <th className="p-3">Outward</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((worker, index) => (
                <tr key={index} className="border-b hover:bg-gray-100 transition">
                  <td className="p-4 text-gray-800">{worker.name}</td>
                  <td className="p-4 text-gray-800">{worker.username}</td>
                  <td className="p-4 text-gray-600">{worker.department_name}</td>
                  <td className="p-4 text-gray-600">{worker.role}</td>
                  {["adding", "modify", "view", "master", "inward", "outward"].map(
                    (accessField) => (
                      <td key={accessField} className="p-4">
                        <input
                          type="checkbox"
                          checked={worker[accessField] === 1}
                          onChange={() =>
                            toggleAccess(
                              worker.worker_id,
                              accessField,
                              worker[accessField]
                            )
                          }
                          className="cursor-pointer w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )
                  )}
                  <td className="p-4 flex gap-2">
                    <button
                      onClick={() => openEditModal(worker)}
                      className="bg-yellow-500 text-white px-4 py-2 rounded-md text-sm hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => openDeleteModal(worker)}
                      className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition"
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
        <p className="text-center text-gray-500 text-lg">No workers found.</p>
      )}

      {/* Edit Worker Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Edit Worker
            </h3>
            <label className="block mb-2 text-gray-700">Name:</label>
            <input
              type="text"
              name="name"
              value={editedWorker.name || ""}
              onChange={handleEditChange}
              className="w-full p-2 border rounded mb-4"
            />
            <label className="block mb-2 text-gray-700">Password:</label>
            <input
              type="text"
              name="password"
              value={editedWorker.password || ""}
              onChange={handleEditChange}
              className="w-full p-2 border rounded mb-4"
            />
            
            <label className="block mb-2 text-gray-700">Department:</label>
<select
  name="department_name"
  value={editedWorker.department_name || ""}
  onChange={handleEditChange}
  className="w-full p-2 border rounded mb-4"
>
  <option value="">Select Department</option>
  {departments.map((dept) => (
    <option key={dept.id} value={dept.name}>
      {dept.name}
    </option>
  ))}
</select>

            <label className="block mb-2 text-gray-700">Role:</label>
            {/* <input
              type="text"
              name="role"
              value={editedWorker.role || ""}
              onChange={handleEditChange}
              className="w-full p-2 border rounded mb-4"
            /> */}

            <select
              name="role"
              value={editedWorker.role || ""} 
              onChange={handleEditChange}
              required
              className="w-full p-2 border rounded mb-4"            >
              <option value="" disabled selected={!editedWorker.role}>Select Role</option>
              <option value="MASTER">MASTER</option>
              <option value="SUPERVISOR">SUPERVISOR</option>
              <option value="WORKER">WORKER</option>
              {/* <option value="TECHNICIAN">Technician</option>
              <option value="OPERATOR">Operator</option> */}
            </select>




            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={closeEditModal}
                className="bg-gray-300 px-4 py-2 rounded-md text-gray-800 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={updateWorker}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}


      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Confirm Deletion
            </h3>
            <p className="text-gray-700">
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedWorker?.name}</span>?
            </p>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={closeDeleteModal}
                className="bg-gray-300 px-4 py-2 rounded-md text-gray-800 hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteWorker}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerList;
