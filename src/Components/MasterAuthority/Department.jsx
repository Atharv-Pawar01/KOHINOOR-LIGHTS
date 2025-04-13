import React, { useState, useEffect } from "react";

const Department = () => {
    const [departmentCode, setDepartmentCode] = useState("");
    const [name, setName] = useState("");
    const [departments, setDepartments] = useState([]);
    const [message, setMessage] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [editDepartmentCode, setEditDepartmentCode] = useState("");
    const [editName, setEditName] = useState("");

    // Fetch departments from database
    const fetchDepartments = async () => {
        const response = await window.electron.invoke("get-departments");
        if (response.success) {
            setDepartments(response.departments);
        } else {
            console.error("Error fetching departments:", response.error);
        }
    };

    useEffect(() => {
        fetchDepartments();
    }, []);

    // Add new department
    const handleSubmit = async (e) => {
        e.preventDefault();
        const response = await window.electron.invoke("add-department", { 
            department_code: departmentCode.toUpperCase(), 
            name: name.toUpperCase() 
        });

        if (response.success) {
            setMessage({ type: "success", text: "✅ Department added successfully!" });
            setDepartmentCode("");
            setName("");
            fetchDepartments();
        } else {
            setMessage({ type: "error", text: "❌ Error: " + response.error });
        }
    };

    // Enable edit mode
    const handleEdit = (dept) => {
        setEditingId(dept.department_id);
        setEditDepartmentCode(dept.department_code);
        setEditName(dept.name);
    };

    // Cancel editing
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditDepartmentCode("");
        setEditName("");
    };

    // Save updated department
    const handleUpdate = async () => {
        const response = await window.electron.invoke("update-department", {
            department_id: editingId,
            department_code: editDepartmentCode.toUpperCase(),
            name: editName.toUpperCase(),
        });

        if (response.success) {
            setMessage({ type: "success", text: "✅ Department updated successfully!" });
            setEditingId(null);
            fetchDepartments();
        } else {
            setMessage({ type: "error", text: "❌ Error: " + response.error });
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Add Department</h2>

            {message && (
                <p className={`mb-3 p-2 rounded ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                    {message.text}
                </p>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex gap-3">
                    <input
                        type="text"
                        placeholder="Department Code"
                        value={departmentCode}
                        onChange={(e) => setDepartmentCode(e.target.value)}
                        className="border p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        required
                    />
                    <input
                        type="text"
                        placeholder="Department Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="border p-2 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-300"
                        required
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition">
                    Add Department
                </button>
            </form>

            <h2 className="text-xl font-semibold text-gray-700 mt-6">Departments</h2>
            {departments.length === 0 ? (
                <p className="text-gray-500 mt-3">No departments available. Add one above!</p>
            ) : (
                <ul className="mt-3 space-y-2">
                    {departments.map((dept) => (
                        <li key={dept.department_id} className="bg-gray-100 p-3 rounded-md shadow-sm flex justify-between items-center">
                            {editingId === dept.department_id ? (
                                // Edit Mode with inline inputs
                                <div className="flex gap-3 flex-grow">
                                    <input
                                        type="text"
                                        value={editDepartmentCode}
                                        onChange={(e) => setEditDepartmentCode(e.target.value)}
                                        className="border p-2 rounded-md flex-1"
                                    />
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="border p-2 rounded-md flex-1"
                                    />
                                </div>
                            ) : (
                                // Display Mode
                                <span className="font-semibold flex-1">{dept.department_code} - {dept.name}</span>
                            )}

                            <div className="flex gap-2">
                                {editingId === dept.department_id ? (
                                    <>
                                        <button
                                            className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600"
                                            onClick={handleUpdate}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="bg-gray-500 text-white px-3 py-1 rounded-md hover:bg-gray-600"
                                            onClick={handleCancelEdit}
                                        >
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                                        onClick={() => handleEdit(dept)}
                                    >
                                        Edit
                                    </button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Department;
