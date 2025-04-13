import { useEffect, useState, Fragment } from "react";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FinalMaterialsTable = () => {
    const [groupedMaterials, setGroupedMaterials] = useState({});
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        window.electron.invoke("getFinalMaterialsWithRaw").then((data) => {
            const groupedData = data.reduce((acc, item) => {
                if (!acc[item.final_material_name]) {
                    acc[item.final_material_name] = {
                        bom_name: item.bom_name,
                        rawMaterials: [],
                    };
                }
                acc[item.final_material_name].rawMaterials.push({
                    raw_material_name: item.raw_material_name,
                    quantity: item.quantity,
                    unit: item.unit
                });
                return acc;
            }, {});
            setGroupedMaterials(groupedData);
        });
    }, []);

    const filteredMaterials = Object.keys(groupedMaterials).filter((material) =>
        material.toLowerCase().includes(searchTerm.toLowerCase())
    );


    const downloadExcel = async () => {
        try {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("FinalMaterials");

            // Add Title
            worksheet.mergeCells("A1:E1");
            const titleRow = worksheet.getRow(1);
            titleRow.getCell(1).value = "KOHINOOR LIGHTS (24-25)";
            titleRow.getCell(1).font = { bold: true, size: 18 };
            titleRow.getCell(1).alignment = { horizontal: "center" };

            // Add Address
            worksheet.mergeCells("A2:E2");
            const addressRow = worksheet.getRow(2);
            addressRow.getCell(1).value = "1017 E Ward, Shahupuri 8th Kumbhar Lane, Kolhapur 416001";
            addressRow.getCell(1).alignment = { horizontal: "center" };

            // Add Section Title
            worksheet.mergeCells("A3:E3");
            const sectionTitleRow = worksheet.getRow(3);
            sectionTitleRow.getCell(1).value = "List of Bill of Materials";
            sectionTitleRow.getCell(1).font = { bold: true, size: 14 };
            sectionTitleRow.getCell(1).alignment = { horizontal: "center" };

            // Table Headers
            worksheet.addRow(["Final Material", "BOM Name", "Raw Material", "Quantity", "Unit"])
                .eachCell(cell => {
                    cell.font = { bold: true, underline: true };
                });

            // Add Data
            Object.keys(groupedMaterials).forEach(finalMaterial => {
                const { bom_name, rawMaterials } = groupedMaterials[finalMaterial];

                rawMaterials.forEach((raw, index) => {
                    worksheet.addRow([
                        index === 0 ? finalMaterial : "",
                        index === 0 ? bom_name : "",
                        raw.raw_material_name,
                        raw.quantity,
                        raw.unit
                    ]);
                });
            });

            // Auto-adjust column width
            worksheet.columns.forEach(col => {
                col.width = col.header ? col.header.length + 5 : 15;
            });

            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), "Final_Materials.xlsx");
            toast.success("Select Location and Name Of File! 🎉");
        } catch (error) {
            toast.error("Failed to download Excel file.");
            console.error("Download failed", error);
        }
    };



    return (
        <div className="p-6 bg-white shadow-lg rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
                Final Materials and Their Raw Materials
            </h2>

            {/* Search & Download */}
            <div className="mb-4 flex justify-between gap-4">
                <input
                    type="text"
                    placeholder="Search Final Materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-2/3 px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
                <button
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                    onClick={downloadExcel}
                >
                    Download Excel
                </button>
            </div>

            <div className="border border-gray-300 rounded-lg relative">
    <table className="w-full border-collapse">
        {/* Fixed Table Header */}
        <thead className="bg-gray-800 text-white">
            <tr>
                <th className="px-6 py-3 w-1/12">Sr. No.</th>
                <th className="px-6 py-3 w-3/12">Final Material</th>
                <th className="px-6 py-3 w-3/12">Raw Material</th>
                <th className="px-6 py-3 w-2/12">Quantity</th>
                <th className="px-6 py-3 w-2/12">Unit</th>
            </tr>
        </thead>

        {/* Scrollable Table Body */}
    </table>
    <div className="max-h-[65vh] overflow-y-auto">
        <table className="w-full border-collapse">
            <tbody className="divide-y divide-gray-200">
                {filteredMaterials.length > 0 ? (
                    filteredMaterials.map((finalMaterial, index) => (
                        <Fragment key={index}>
                            {/* Final Material Row */}
                            <tr className="bg-gray-100">
                                <td className="px-6 py-3 text-center font-semibold w-1/12">{index + 1}</td>
                                <td className="px-6 py-3 font-semibold w-3/12">{finalMaterial}</td>
                                <td className="px-6 py-3 text-center w-3/12">—</td>
                                <td className="px-6 py-3 text-center w-2/12">—</td>
                                <td className="px-6 py-3 text-center w-2/12">—</td>
                            </tr>

                            {/* Raw Materials */}
                            {groupedMaterials[finalMaterial].rawMaterials.map((raw, i) => (
                                <tr key={`${index}-${i}`} className="border-b border-gray-300">
                                    <td className="px-6 py-3 text-center w-1/12">{i + 1}</td>
                                    <td className="px-6 py-3 w-3/12"></td>
                                    <td className="px-6 py-3 w-3/12">{raw.raw_material_name}</td>
                                    <td className="px-6 py-3 text-center w-2/12">{raw.quantity}</td>
                                    <td className="px-6 py-3 text-center w-2/12">{raw.unit}</td>
                                </tr>
                            ))}
                        </Fragment>
                    ))
                ) : (
                    <tr>
                        <td colSpan={5} className="px-6 py-3 text-center text-gray-500">
                            No matching results found.
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
</div>


            {/* <ToastContainer position="top-right" autoClose={3000} /> */}
        </div>
    );
};

export default FinalMaterialsTable;
