import { useEffect, useState, Fragment } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FinalMaterialsTable = () => {
    const [groupedMaterials, setGroupedMaterials] = useState({});
    const [searchTerm, setSearchTerm] = useState("");
    const [editRow, setEditRow] = useState(null);
    const [editedData, setEditedData] = useState({});

    useEffect(() => {
        fetchMaterials();
    }, []);

    // toast.success("hi")
    const fetchMaterials = () => {
        window.electron.invoke("getFinalMaterialsWithRaw").then((data) => {
            const groupedData = data.reduce((acc, item) => {
                if (!acc[item.final_material_name]) {
                    acc[item.final_material_name] = [];
                }
                acc[item.final_material_name].push({
                    id: item.id,
                    raw_material_name: item.raw_material_name,
                    quantity: item.quantity,
                    unit: item.unit
                });
                return acc;
            }, {});
            setGroupedMaterials(groupedData);
        });
    };

    const handleCancel = () => {
        setEditRow(null);  // Exit edit mode
        setEditedData({}); // Reset edited data
    };

    const handleEdit = (finalMaterial, index) => {
        setEditRow(`${finalMaterial}-${index}`);
        setEditedData(groupedMaterials[finalMaterial][index]);
    };

    const handleChange = (e, field) => {
        if(field==="quantity" && e.target.value<1)
        {
            toast.warn("quantity must be above the 1 quantity")
        }
        setEditedData({ ...editedData, [field]: e.target.value });
    };

    const handleSave = () => {
        window.electron.invoke("updateFinalMaterial", editedData)
            .then(() => {
                toast.success("Material updated successfully!");
                fetchMaterials();
                setEditRow(null);
            })
            .catch(() => {
                toast.error("Failed to update material.");
            });
    };

    const filteredMaterials = Object.keys(groupedMaterials).filter((material) =>
        material.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Final Materials and Their Raw Materials
            </h2>

            {/* Search Input */}
            <div className="mb-4 flex justify-between">
                <input
                    type="text"
                    placeholder="Search Final Materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-2/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Table Container */}
            <div className="border border-gray-300 rounded-lg relative">
    
    {/* Table Header - Stays Fixed */}
    <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
            <thead className="bg-gray-800 text-white">
                <tr>
                    <th className="px-6 py-3 w-1/12">Sr. No.</th>
                    <th className="px-6 py-3 w-3/12">Final Material</th>
                    <th className="px-6 py-3 w-3/12">Raw Material</th>
                    <th className="px-6 py-3 w-2/12">Quantity</th>
                    <th className="px-6 py-3 w-2/12">Unit</th>
                    <th className="px-6 py-3 w-2/12">Actions</th>
                </tr>
            </thead>
        </table>
    </div>

    {/* Scrollable Table Body */}
    <div className="max-h-[65vh] overflow-y-auto overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse">
            <tbody className="divide-y divide-gray-200">
                {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((finalMaterial, index) => (
                        <Fragment key={index}>
                            {/* Final Material Row - No Border Below */}
                            <tr className="bg-gray-100">
                                <td className="px-6 py-3 text-center font-semibold w-1/12">{index + 1}</td>
                                <td className="px-6 py-3 font-semibold w-3/12">{finalMaterial}</td>
                                <td className="px-6 py-3 w-3/12"></td>
                                <td className="px-6 py-3 w-2/12"></td>
                                <td className="px-6 py-3 w-2/12"></td>
                                <td className="px-6 py-3 w-2/12"></td>
                            </tr>

                            {/* Raw Materials Rows */}
                            {groupedMaterials[finalMaterial].map((raw, i) => (
                                <tr key={`${index}-${i}`} className="border-b border-gray-300 hover:bg-gray-50">
                                    <td className="px-6 py-3 text-center w-1/12">{i + 1}</td>
                                    <td className="px-6 py-3 w-3/12"></td>
                                    
                                    {/* Editable Raw Material Name */}
                                    <td className="px-6 py-3 w-3/12">
                                        {editRow === `${finalMaterial}-${i}` ? (
                                            <input
                                                type="text"
                                                value={editedData.raw_material_name}
                                                onChange={(e) => handleChange(e, "raw_material_name")}
                                                className="border px-2 py-1 w-32"
                                            />
                                        ) : (
                                            raw.raw_material_name
                                        )}
                                    </td>

                                    {/* Editable Quantity */}
                                    <td className="px-6 py-3 text-center w-2/12">
                                        {editRow === `${finalMaterial}-${i}` ? (
                                            <input
                                                type="number"
                                                value={editedData.quantity}
                                                min={1}
                                                onChange={(e) => handleChange(e, "quantity")}
                                                className="border px-2 py-1 w-16"
                                            />
                                        ) : (
                                            raw.quantity
                                        )}
                                    </td>

                                    {/* Editable Unit */}
                                    <td className="px-6 py-3 text-center w-2/12">
                                        {editRow === `${finalMaterial}-${i}` ? (
                                            <input
                                                type="text"
                                                value={editedData.unit}
                                                onChange={(e) => handleChange(e, "unit")}
                                                className="border px-2 py-1 w-16"
                                            />
                                        ) : (
                                            raw.unit
                                        )}
                                    </td>

                                    {/* Edit & Save Actions */}
                                    <td className="px-6 py-3 text-center w-2/12">
                                        {editRow === `${finalMaterial}-${i}` ? (
                                            <div className="flex space-x-2">
                                            <button
                                                onClick={handleSave}
                                                className="px-2 py-1 bg-blue-500 text-white rounded-md"
                                            >
                                                Save
                                            </button>
                                            <button
                                                onClick={handleCancel}
                                                className="px-2 py-1 bg-red-500 text-white rounded-md"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        ) : (
                                            <button
                                                onClick={() => handleEdit(finalMaterial, i)}
                                                className="px-2 py-1 bg-yellow-500 text-white rounded-md"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </Fragment>
                    ))
                ) : (
                    <tr>
                        <td colSpan={6} className="px-6 py-3 text-center text-gray-500">
                            No matching results found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>


</div>

        </div>
    );
};

export default FinalMaterialsTable;
