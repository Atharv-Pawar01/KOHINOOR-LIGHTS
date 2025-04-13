import { useState, useEffect } from "react";

const ModifyLabour = () => {
    const [labours, setLabours] = useState([]);
    const [editableLabour, setEditableLabour] = useState(null);

    useEffect(() => {
        fetchLabours();
    }, []);

    const fetchLabours = async () => {
        const data = await window.electron.invoke("get-labours");
        setLabours(data);
    };

    console.log(labours)

    const setEditableLabourSafe = (labour) => {
        setEditableLabour({
            id: labour.id || "",
            name: labour.name || "",
            customerId: labour.customerId || "",
            department: labour.department || "",
            area: labour.area || "",
            city: labour.city || "",
            pincode: labour.pincode || "",
            telephone: labour.telephone || "",
            aadhar: labour.aadhar || "",
            pancard: labour.pancard || "",
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditableLabour((prev) => ({
            ...prev,
            [name]: value.toUpperCase(),
        }));
    };

    const handleSave = async () => {
        if (editableLabour) {
            await window.electron.invoke("update-labour", editableLabour);
            setEditableLabour(null);
            fetchLabours(); // Refresh data after update
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Labour Management</h1>
            <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300 bg-white shadow-md rounded-lg">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                        <tr>
                            <th className="px-4 py-2">Sr. No</th>
                            <th className="px-4 py-2">Photo</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Customer ID</th>
                            <th className="px-4 py-2">Department</th>
                            <th className="px-4 py-2">Phone</th>
                            <th className="px-4 py-2">Area</th>
                            <th className="px-4 py-2">City</th>
                            <th className="px-4 py-2">Pincode</th>
                            <th className="px-4 py-2">Aadhar</th>
                            <th className="px-4 py-2">PAN Card</th>
                            <th className="px-4 py-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {labours.map((labour, index) => (
                            <tr key={labour.id} className="text-center border-b hover:bg-gray-50 transition">
                                <td className="border px-4 py-2">{index + 1}</td>
                                <td className="border px-4 py-2">
                                    {labour.photo ? (
                                        <img src={labour.photo} alt="Labour" className="w-12 h-12 object-cover rounded-full mx-auto" />
                                    ) : (
                                        <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                            <span>No Image</span>
                                        </div>
                                    )}
                                </td>
                                <td className="border px-4 py-2">{labour.name}</td>
                                <td className="border px-4 py-2">{labour.customerId}</td>
                                <td className="border px-4 py-2">{labour.department}</td>
                                <td className="border px-4 py-2">{labour.telephone}</td>
                                <td className="border px-4 py-2">{labour.area}</td>
                                <td className="border px-4 py-2">{labour.city}</td>
                                <td className="border px-4 py-2">{labour.pincode}</td>
                                <td className="border px-4 py-2">{labour.aadhar}</td>
                                <td className="border px-4 py-2">{labour.pancard}</td>
                                <td className="border px-4 py-2">
                                    <button
                                        onClick={() => setEditableLabourSafe(labour)}
                                        className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Edit Modal */}
            {editableLabour && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-[500px] animate-fadeIn">
                        <h2 className="font-bold text-lg mb-4 text-gray-800 text-center">Edit Labour</h2>
                        {/* <img src={editableLabour.photo} alt="" /> */}
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                "name",
                                "customerId",
                                "department",
                                "area",
                                "city",
                                "pincode",
                                "telephone",
                                "aadhar",
                                "pancard",
                            ].map((field) => (
                                <label key={field} className="flex flex-col text-gray-700">
                                    {field.charAt(0).toUpperCase() + field.slice(1)}
                                    <input
                                        type="text"
                                        name={field}
                                        className="border p-2 rounded mt-1"
                                        value={editableLabour[field] || ""}
                                        onChange={handleInputChange}
                                    />
                                </label>
                            ))}
                        </div>
                        <div className="mt-4 flex justify-end space-x-2">
                            <button
                                onClick={() => setEditableLabour(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModifyLabour;
